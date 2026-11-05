/**
 * OpenRouter API client for the locally hosted Ken AI app.
 */

import { DEFAULT_ENGINE, engines } from '../config/engines';

const KEN_AI_SYSTEM_PROMPT = `You are Ken AI, the AI assistant in the Ken AI app. Introduce yourself as Ken AI, not as the underlying model or its provider. Do not include unsolicited model or provider promotions. If asked which model is answering, be transparent: Ken AI uses OpenRouter's Free Models Router, which may select different models, so the exact model can vary.`;

interface StreamChatParams {
  messages: { role: 'user' | 'assistant'; content: string }[];
  engine: string;
  apiKey: string;
  system?: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
}

export async function streamChat(params: StreamChatParams): Promise<void> {
  const apiKey = params.apiKey.trim();
  if (!apiKey) {
    throw new Error('Add your OpenRouter API key in Settings before sending a message.');
  }

  const engine = engines.find((item) => item.id === params.engine)
    ?? engines.find((item) => item.id === DEFAULT_ENGINE)!;
  const messages = [
    {
      role: 'system' as const,
      content: params.system
        ? `${KEN_AI_SYSTEM_PROMPT}\n\nAdditional user instructions:\n${params.system}`
        : KEN_AI_SYSTEM_PROMPT,
    },
    ...params.messages,
  ];
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-OpenRouter-Title': 'Ken AI',
    },
    body: JSON.stringify({
      model: engine.model,
      messages,
      stream: true,
    }),
    signal: params.signal,
  });

  if (!response.ok) {
    let message = `OpenRouter API error (${response.status}).`;
    try {
      const result = await response.json() as { error?: { message?: string } };
      if (result.error?.message) message = result.error.message;
    } catch {
      // Retain the status-based error if the API response is not JSON.
    }
    if (response.status === 401 || response.status === 403) {
      throw new Error(`OpenRouter rejected this API key. Check your key in Settings. ${message}`);
    }
    if (response.status === 429) {
      throw new Error(`The OpenRouter free-model rate limit was reached. Wait and try again. ${message}`);
    }
    throw new Error(message);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('OpenRouter returned no response stream.');

  const decoder = new TextDecoder();
  let buffer = '';
  let receivedText = false;

  const handleLine = (line: string) => {
    if (!line.startsWith('data:')) return;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') return;

    let event: {
      choices?: { delta?: { content?: string }; finish_reason?: string | null }[];
      error?: { message?: string };
    };
    try {
      event = JSON.parse(data);
    } catch {
      throw new Error('OpenRouter returned an unreadable streaming response.');
    }

    if (event.error?.message) throw new Error(event.error.message);
    const token = event.choices?.[0]?.delta?.content;
    if (token) {
      receivedText = true;
      params.onToken(token);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? '';
    for (const line of lines) handleLine(line);

    if (done) {
      if (buffer) handleLine(buffer);
      break;
    }
  }

  if (!receivedText) {
    throw new Error('OpenRouter returned no text. Try again or check the free model availability.');
  }
}
