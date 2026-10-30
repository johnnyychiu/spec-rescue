import test from 'node:test';
import assert from 'node:assert/strict';
import { ModelContext, DeveloperMessageItem, UserMessageItem } from '@mozaik-ai/core';
import { readConfig } from '../src/config.js';
import { chatCompletionInference } from '../src/provider.js';

function request() {
  return { model: 'configured-model', maxOutputTokens: 1200, context: ModelContext.create().addContextItems([DeveloperMessageItem.create('Agent role'), UserMessageItem.create('Brief')]) };
}

test('OpenAI request uses completion budget and local requests omit auth and disable thinking', async context => {
  const calls: { url: string; init: RequestInit }[] = [];
  context.mock.method(globalThis, 'fetch', async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ choices: [{ message: { content: 'Actual provider-shaped response' }, finish_reason: 'stop' }] }), { status: 200 });
  });
  const remote = chatCompletionInference(readConfig({ MODEL_API_KEY: 'not-a-real-key' }));
  const result = await remote(request(), new AbortController().signal);
  assert.equal(result.items[0].type, 'message');
  const remoteBody = JSON.parse(String(calls[0].init.body));
  assert.equal(remoteBody.max_completion_tokens, 1200); assert.equal(remoteBody.max_tokens, undefined);
  assert.deepEqual(remoteBody.messages, [{ role: 'system', content: 'Agent role' }, { role: 'user', content: 'Brief' }]);
  const local = chatCompletionInference(readConfig({ MODEL_BASE_URL: 'http://127.0.0.1:8081/v1', MODEL_NAME: 'local' }));
  await local(request(), new AbortController().signal);
  const localBody = JSON.parse(String(calls[1].init.body));
  assert.equal(localBody.max_tokens, 1200); assert.equal(localBody.chat_template_kwargs.enable_thinking, false);
  assert.equal((calls[1].init.headers as Record<string, string>).Authorization, undefined);
});

test('provider body errors are sanitized and truncated completions fail explicitly', async context => {
  context.mock.method(globalThis, 'fetch', async () => new Response('PRIVATE BODY WITH API SECRET', { status: 401 }));
  const infer = chatCompletionInference(readConfig({ MODEL_API_KEY: 'fixture' }));
  await assert.rejects(infer(request(), new AbortController().signal), error => {
    assert.match(String(error), /HTTP 401/); assert.doesNotMatch(String(error), /PRIVATE|SECRET/); return true;
  });
  context.mock.restoreAll();
  context.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ choices: [{ message: { content: 'Incomplete' }, finish_reason: 'length' }] })));
  await assert.rejects(infer(request(), new AbortController().signal), /truncated/);
});
