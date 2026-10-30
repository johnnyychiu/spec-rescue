export interface AppConfig {
  model: string;
  baseURL: string;
  apiKey: string;
  ready: boolean;
  missing: string[];
  timeoutMs: number;
  maxOutputTokens: number;
}

export function readConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const baseURL = (env.MODEL_BASE_URL || env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');
  const model = env.MODEL_NAME || env.MOZAIK_MODEL || 'gpt-5.4-mini';
  const apiKey = env.MODEL_API_KEY || env.OPENAI_API_KEY || '';
  const missing: string[] = [];
  try {
    const url = new URL(baseURL);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
      missing.push('MODEL_BASE_URL must be an HTTP(S) URL without credentials, query, or fragment');
    }
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname);
    if (!apiKey && !local) missing.push('MODEL_API_KEY or OPENAI_API_KEY');
  } catch {
    missing.push('Valid MODEL_BASE_URL');
  }
  const timeout = Number(env.RUN_TIMEOUT_MS || 180000);
  const maxTokens = Number(env.MODEL_MAX_OUTPUT_TOKENS || 1800);
  return {
    model, baseURL, apiKey, ready: missing.length === 0, missing,
    timeoutMs: Number.isFinite(timeout) ? Math.max(1000, Math.min(timeout, 900000)) : 180000,
    maxOutputTokens: Number.isFinite(maxTokens) ? Math.max(256, Math.min(maxTokens, 6000)) : 1800,
  };
}
