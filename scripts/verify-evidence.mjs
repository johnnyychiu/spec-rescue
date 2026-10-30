import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Check internal consistency of saved run records. This is not a model-quality
// test or independent proof of the records' origin.
const evidenceDirectory = new URL('../docs/evidence/', import.meta.url);
const normalize = (text) => text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
const time = (event) => {
  const value = Date.parse(event.at);
  assert.ok(Number.isFinite(value), `invalid event timestamp: ${event.at}`);
  return value;
};

async function verify(file) {
  const run = JSON.parse(normalize(await readFile(new URL(file, evidenceDirectory), 'utf8')));
  assert.equal(run.status, 'completed', 'run must be completed');
  assert.ok(Array.isArray(run.events), 'events must be an array');
  assert.ok(Array.isArray(run.artifacts), 'artifacts must be an array');
  assert.equal(run.artifacts.length, 5, 'expected five artifacts');

  const drafts = run.artifacts.filter((artifact) => artifact.stage === 'draft');
  const reviews = run.artifacts.filter((artifact) => artifact.stage === 'review');
  const finals = run.artifacts.filter((artifact) => artifact.stage === 'final');
  assert.equal(drafts.length, 3, 'expected three draft artifacts');
  assert.deepEqual(drafts.map((artifact) => artifact.agentId).sort(), ['architect', 'product', 'qa']);
  assert.equal(reviews.length, 1, 'expected one review artifact');
  assert.equal(reviews[0].agentId, 'qa', 'QA must own the review');
  assert.equal(finals.length, 1, 'expected one final artifact');
  assert.equal(finals[0].agentId, 'product', 'product must own the final artifact');
  assert.equal(typeof run.result, 'string', 'result must be a string');
  assert.ok(run.result.trim(), 'final result must not be empty');
  assert.equal(normalize(run.result), normalize(finals[0].content), 'result must match the final artifact');

  const starts = run.events.filter((event) => event.type === 'inference.started');
  const completions = run.events.filter((event) => event.type === 'inference.completed');
  const answers = run.events.filter((event) => event.type === 'model.answer');
  assert.equal(starts.length, 5, 'expected five native inference starts');
  assert.equal(completions.length, 5, 'expected five native inference completions');
  assert.equal(answers.length, 5, 'expected five model answers');
  for (const [label, events] of [['starts', starts], ['completions', completions], ['answers', answers]]) {
    assert.ok(events.every((event) => typeof event.loopId === 'string' && event.loopId.length > 0), `${label} need loop IDs`);
    assert.equal(new Set(events.map((event) => event.loopId)).size, 5, `${label} need five unique loop IDs`);
    for (const event of events) time(event);
  }
  const startedIds = starts.map((event) => event.loopId).sort();
  assert.deepEqual(completions.map((event) => event.loopId).sort(), startedIds, 'completion loops must match started loops');
  assert.deepEqual(answers.map((event) => event.loopId).sort(), startedIds, 'answer loops must match started loops');
  assert.deepEqual(starts.slice(0, 3).map((event) => event.agentId).sort(), ['architect', 'product', 'qa']);
  assert.equal(starts[3].agentId, 'qa', 'fourth loop must be the QA review');
  assert.equal(starts[4].agentId, 'product', 'fifth loop must be product synthesis');

  const firstCompletion = Math.min(...completions.map(time));
  assert.ok(starts.slice(0, 3).every((event) => time(event) < firstCompletion), 'all initial requests must start before the first completion');
  for (const start of starts) {
    const completion = completions.find((event) => event.loopId === start.loopId);
    const answer = answers.find((event) => event.loopId === start.loopId);
    assert.equal(completion.agentId, start.agentId, 'completion agent must match its loop');
    assert.equal(answer.agentId, start.agentId, 'answer agent must match its loop');
    assert.ok(time(completion) >= time(start), 'completion cannot precede its start');
    assert.ok(time(answer) >= time(completion), 'answer cannot precede inference completion');
  }
  const draftAnswers = starts.slice(0, 3).map((start) => answers.find((event) => event.loopId === start.loopId));
  assert.ok(time(starts[3]) >= Math.max(...draftAnswers.map(time)), 'review must wait for all three draft answers');
  const reviewAnswer = answers.find((event) => event.loopId === starts[3].loopId);
  assert.ok(time(starts[4]) >= time(reviewAnswer), 'synthesis must wait for the QA answer');

  const markdownName = file === 'live-run.json' ? 'live-specification.md' : file.replace(/\.json$/, '.md');
  const markdown = normalize(await readFile(new URL(markdownName, evidenceDirectory), 'utf8'));
  assert.ok(markdown.includes(normalize(run.result)), `${markdownName} must contain the final result`);
  const duration = Date.parse(run.completedAt) - Date.parse(run.startedAt);
  assert.ok(Number.isFinite(duration) && duration >= 0, 'valid run duration required');
  const spread = Math.max(...starts.slice(0, 3).map(time)) - Math.min(...starts.slice(0, 3).map(time));
  console.log(`PASS ${file}: ${(duration / 1000).toFixed(3)}s; 3 initial starts/${spread}ms before first completion; 5 loops/artifacts; review barriers and Markdown match`);
}

const files = (await readdir(evidenceDirectory)).filter((file) => /^(?:live-run|final-.+)\.json$/.test(file)).sort();
assert.ok(files.length > 0, `no saved run snapshots in ${fileURLToPath(evidenceDirectory)}`);
let failed = false;
for (const file of files) {
  try {
    await verify(file);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${file}: ${error.message}`);
  }
}
if (failed) process.exitCode = 1;
