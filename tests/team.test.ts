import test from 'node:test';
import assert from 'node:assert/strict';
import { ModelMessageItem, type InferenceInput } from '@mozaik-ai/core';
import { RescueRun, exportMarkdown } from '../src/team.js';
import { readConfig } from '../src/config.js';
import { createApp } from '../src/server.js';
import type { Infer } from '../src/provider.js';

const config = { ...readConfig({ MODEL_BASE_URL: 'http://127.0.0.1:8081/v1', MODEL_NAME: 'fixture-only' }), timeoutMs: 3000 };
function text(request: InferenceInput) { return request.context.getItems().map(item => (item as unknown as { content: { text: string } }).content.text).join('\n'); }
function output(content: string) { return { items: [ModelMessageItem.rehydrate({ text: content })], tokenUsage: undefined, rowResponse: undefined }; }
async function until(predicate: () => boolean) { for (let i = 0; i < 200; i++) { if (predicate()) return; await new Promise(resolve => setTimeout(resolve, 5)); } throw new Error('Condition not reached'); }

test('three genuine Mozaik loops overlap; critique reads all drafts and final reads critique', async () => {
  let active = 0; let maxActive = 0; let draftStarted = 0;
  const release: (() => void)[] = []; const prompts: string[] = [];
  const infer: Infer = async request => {
    const prompt = text(request); prompts.push(prompt);
    if (!prompt.includes('TASK: CROSS-AGENT REVIEW') && !prompt.includes('TASK: FINAL SPECIFICATION')) {
      draftStarted++; active++; maxActive = Math.max(active, maxActive);
      await new Promise<void>(resolve => release.push(resolve)); active--;
      return output(`DRAFT ${prompt.includes('You are QA Critic') ? 'qa' : prompt.includes('You are Technical Planner') ? 'architect' : 'product'}: explicit assumption`);
    }
    if (prompt.includes('TASK: FINAL SPECIFICATION')) {
      assert.match(prompt, /REVIEW: reconcile architecture assumption/);
      return output('# MVP\n\n## Decisions & changes after review\nResolved architecture assumption.');
    }
    assert.match(prompt, /DRAFT product/); assert.match(prompt, /DRAFT qa/); assert.match(prompt, /DRAFT architect/);
    return output('REVIEW: reconcile architecture assumption');
  };
  const run = new RescueRun('Build a student book exchange MVP', config, infer);
  run.start(); run.start(); // idempotent
  await until(() => draftStarted === 3);
  assert.equal(maxActive, 3);
  assert.equal(run.snapshot().artifacts.length, 0);
  release.forEach(resolve => resolve());
  await until(() => run.snapshot().status === 'completed');
  const snapshot = run.snapshot();
  assert.equal(prompts.length, 5);
  assert.deepEqual(snapshot.artifacts.map(a => a.stage).sort(), ['draft', 'draft', 'draft', 'final', 'review']);
  assert.equal(snapshot.events.filter(e => e.type === 'inference.started').length, 5);
  const initialStarts = snapshot.events.filter(e => e.type === 'inference.started').slice(0, 3);
  assert.equal(new Set(initialStarts.map(e => e.loopId)).size, 3);
  assert.match(exportMarkdown(snapshot), /Collaboration evidence/);
  assert.match(exportMarkdown(snapshot), /DRAFT architect/);
});

test('concurrent requests have isolated shared state and immutable snapshots', async () => {
  const infer: Infer = async request => output(text(request).includes('First project') ? 'First project response' : 'Second project response');
  const first = new RescueRun('First project task brief', config, infer);
  const second = new RescueRun('Second project task brief', config, infer);
  first.start(); second.start();
  await until(() => first.snapshot().status === 'completed' && second.snapshot().status === 'completed');
  assert.notEqual(first.snapshot().id, second.snapshot().id);
  assert.ok(first.snapshot().artifacts.every(a => a.content === 'First project response'));
  assert.ok(second.snapshot().artifacts.every(a => a.content === 'Second project response'));
  const copy = first.snapshot(); copy.agents[0].output = 'tampered';
  assert.notEqual(first.snapshot().agents[0].output, 'tampered');
});

test('provider failures cannot leak sensitive errors or produce a final specification', async () => {
  const run = new RescueRun('Build something useful', config, async () => { throw new Error('secret-key-123 PRIVATE PROVIDER BODY'); });
  run.start(); await until(() => run.snapshot().status === 'failed');
  assert.equal(run.snapshot().result, undefined);
  assert.doesNotMatch(JSON.stringify(run.snapshot()), /secret-key-123|PRIVATE PROVIDER BODY/);
});

test('timeout aborts provider requests and ignores late results', async () => {
  let aborted = 0;
  const run = new RescueRun('Build something useful', { ...config, timeoutMs: 30 }, async (_request, signal) => {
    await new Promise<void>((_resolve, reject) => signal.addEventListener('abort', () => { aborted++; reject(new Error('cancel')); }, { once: true }));
    return output('unreachable');
  });
  run.start(); await until(() => run.snapshot().status === 'failed');
  assert.equal(aborted, 3); assert.match(run.snapshot().error!, /time limit/);
  assert.equal(run.snapshot().artifacts.length, 0);
});

test('configuration allows unauthenticated loopback and requires keys for remote endpoints', () => {
  assert.equal(readConfig({ MODEL_BASE_URL: 'http://127.0.0.1:8081/v1' }).ready, true);
  assert.equal(readConfig({}).ready, false);
  assert.equal(readConfig({ MODEL_BASE_URL: 'file:///tmp/model', MODEL_API_KEY: 'x' }).ready, false);
  assert.equal(readConfig({ MODEL_BASE_URL: 'https://example.com/v1', MODEL_API_KEY: 'x' }).ready, true);
});

test('HTTP API validates input, streams runtime results and exports final evidence', async () => {
  const { server } = createApp({ config, infer: async () => output('Test fixture result') });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address() as { port: number };
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const invalid = await fetch(`${base}/api/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brief: 'tiny' }) });
    assert.equal(invalid.status, 400);
    const crossOrigin = await fetch(`${base}/api/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://evil.example' }, body: JSON.stringify({ brief: 'Build an app please' }) });
    assert.equal(crossOrigin.status, 403);
    const response = await fetch(`${base}/api/runs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brief: 'Build a book exchange' }) });
    assert.equal(response.status, 201);
    const { id } = await response.json() as { id: string };
    const events = await fetch(`${base}/api/runs/${id}/events`);
    assert.match(events.headers.get('content-type')!, /text\/event-stream/);
    assert.match(await events.text(), /"status":"completed"/);
    const result = await fetch(`${base}/api/runs/${id}/export`);
    assert.equal(result.status, 200); assert.match(await result.text(), /Collaboration evidence/);
    const missing = await fetch(`${base}/api/runs/not-a-run`); assert.equal(missing.status, 404);
  } finally {
    server.closeAllConnections(); await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
