import { ModelMessageItem, type InferenceInput, type InferenceOutput } from '@mozaik-ai/core';
import type { AppConfig } from './config.js';

export class ProviderError extends Error {
  constructor(public readonly publicMessage: string) { super(publicMessage); }
}

export type Infer = (request: InferenceInput, signal: AbortSignal) => Promise<InferenceOutput>;

/** Mozaik's public InferenceRunner adapter: no model invocation happens outside a runLoop. */
export function chatCompletionInference(config: AppConfig): Infer {
  return async (request, signal) => {
    const endpointHost = new URL(config.baseURL).hostname;
    const messages = request.context.getItems().map((item) => {
      const value = item as unknown as { role?: string; content?: { text?: string } };
      if (!value.role || typeof value.content?.text !== 'string') {
        throw new ProviderError('The model received an unsupported context item.');
      }
      return { role: value.role === 'developer' ? 'system' : value.role, content: value.content.text };
    });
    let response: Response;
    try {
      response = await fetch(`${config.baseURL}/chat/completions`, {
        method: 'POST', signal,
        headers: { 'Content-Type': 'application/json', ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}) },
        body: JSON.stringify({
          model: request.model, messages,
          ...(endpointHost === 'api.openai.com'
            ? { max_completion_tokens: request.maxOutputTokens || config.maxOutputTokens }
            : { max_tokens: request.maxOutputTokens || config.maxOutputTokens }),
          stream: false,
          // llama.cpp/Qwen supports this option; standard cloud APIs must not receive it.
          ...(endpointHost === '127.0.0.1' || endpointHost === 'localhost'
            ? { chat_template_kwargs: { enable_thinking: false } } : {}),
        }),
      });
    } catch {
      if (signal.aborted) throw new ProviderError('The run exceeded its time limit. Try a shorter brief or a faster model.');
      throw new ProviderError('Cannot reach the model endpoint. Check MODEL_BASE_URL and that the model server is running.');
    }
    if (!response.ok) {
      // Never relay provider bodies: they may contain credentials or private prompt text.
      await response.body?.cancel();
      const reason = response.status === 401 || response.status === 403 ? 'Check the model API key.'
        : response.status === 429 ? 'The provider rate limit or quota was reached.'
        : response.status === 404 ? 'Check MODEL_BASE_URL and MODEL_NAME.' : 'Check model availability and configuration.';
      throw new ProviderError(`Model request failed (HTTP ${response.status}). ${reason}`);
    }
    let data: { choices?: { message?: { content?: unknown }; finish_reason?: string }[] };
    try { data = await response.json() as typeof data; } catch { throw new ProviderError('The model endpoint returned invalid JSON.'); }
    const choice = data.choices?.[0];
    const content = choice?.message?.content;
    if (typeof content !== 'string' || !content.trim()) throw new ProviderError('The model returned no text. Check model compatibility.');
    if (choice?.finish_reason === 'length') throw new ProviderError('The model response was truncated. Increase MODEL_MAX_OUTPUT_TOKENS or use a shorter brief.');
    return { items: [ModelMessageItem.rehydrate({ text: content.trim() })], tokenUsage: undefined, rowResponse: undefined };
  };
}
