import { parseAssistantEvent } from './assistantContractParsers';
import type { AssistantTurnEvent } from './assistantContracts';
import { assistantApiError } from './assistantError';
import { createAssistantSseParser } from './assistantSseParser';
import {
  assistantPathSegment,
  safeAssistantBaseUrl,
  type AssistantTransportConfiguration,
} from './assistantTransport';

const TERMINAL_EVENTS = new Set(['COMPLETED', 'CANCELLED', 'FAILED']);

export interface AssistantEventStreamConfiguration extends AssistantTransportConfiguration {
  readonly maximumEventBytes: number;
  readonly reconnectWindowMs: number;
  readonly idleTimeoutMs: number;
  readonly reconnectDelayMs?: number | undefined;
}

export interface StreamAssistantTurnInput {
  readonly conversationCode: string;
  readonly turnCode: string;
  readonly afterSequence?: number | undefined;
  readonly signal?: AbortSignal | undefined;
  readonly onEvent: (event: AssistantTurnEvent) => void;
  readonly onReconnect?: ((attempt: number, afterSequence: number) => void) | undefined;
}

export async function streamAssistantTurn(
  configuration: AssistantEventStreamConfiguration,
  input: StreamAssistantTurnInput,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  const moduleBaseUrl = safeAssistantBaseUrl(configuration.moduleBaseUrl);
  validateConfiguration(configuration);
  const conversationCode = assistantPathSegment(
    input.conversationCode,
    'conversationCode',
  );
  const turnCode = assistantPathSegment(input.turnCode, 'turnCode');
  let afterSequence = nonNegativeSequence(input.afterSequence ?? 0);
  let lastEventId: string | undefined;
  let attempt = 0;
  let reconnectStartedAt: number | undefined;

  while (!input.signal?.aborted) {
    if (attempt > 0) {
      if (
        reconnectStartedAt !== undefined &&
        Date.now() - reconnectStartedAt > configuration.reconnectWindowMs
      ) {
        throw new Error('Assistant stream reconnect window expired');
      }
      input.onReconnect?.(attempt, afterSequence);
      await wait(configuration.reconnectDelayMs ?? 500, input.signal);
    }

    const url = new URL(
      `${moduleBaseUrl}/v0/conversations/${conversationCode}/turns/${turnCode}/stream`,
    );
    if (afterSequence > 0) {
      url.searchParams.set('afterSequence', String(afterSequence));
    }
    const headers = new Headers({
      Accept: 'text/event-stream',
      Authorization: `Bearer ${configuration.accessToken}`,
      'x-enterprise-code': configuration.enterpriseCode,
    });
    if (lastEventId) headers.set('Last-Event-ID', lastEventId);

    try {
      const response = await fetchImplementation(url, {
        method: 'GET',
        headers,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        ...(input.signal ? { signal: input.signal } : {}),
      });
      if (!response.ok) throw await assistantApiError(response);
      if (!response.body) throw new Error('Assistant stream response has no body');
      if (!response.headers.get('Content-Type')?.includes('text/event-stream')) {
        throw new Error('Assistant stream returned an invalid content type');
      }

      const parser = createAssistantSseParser(configuration.maximumEventBytes);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let terminal = false;
      try {
        while (!terminal) {
          const result = await readWithTimeout(reader, configuration.idleTimeoutMs);
          const frames = result.done
            ? parser.finish()
            : parser.push(decoder.decode(result.value, { stream: true }));
          for (const frame of frames) {
            const event = parseAssistantEvent(JSON.parse(frame.data));
            if (
              event.conversationCode !== input.conversationCode ||
              event.turnCode !== input.turnCode
            ) {
              throw new Error('Assistant stream event belongs to another turn');
            }
            if (event.sequence <= afterSequence) continue;
            if (event.sequence !== afterSequence + 1) {
              throw new Error('Assistant stream event sequence is not contiguous');
            }
            afterSequence = event.sequence;
            lastEventId = frame.id ?? event.eventCode;
            input.onEvent(event);
            terminal = TERMINAL_EVENTS.has(event.eventType);
          }
          if (result.done) break;
        }
      } finally {
        reader.releaseLock();
      }
      if (terminal || input.signal?.aborted) return;
    } catch (error: unknown) {
      if (input.signal?.aborted) return;
      if (!isRetryableStreamError(error)) throw error;
    }
    reconnectStartedAt ??= Date.now();
    attempt += 1;
  }
}

function validateConfiguration(configuration: AssistantEventStreamConfiguration): void {
  if (!configuration.accessToken) {
    throw new Error('Assistant stream requires an employee access token');
  }
  if (!configuration.enterpriseCode) {
    throw new Error('Assistant stream requires an enterprise context');
  }
  if (
    !Number.isSafeInteger(configuration.maximumEventBytes) ||
    configuration.maximumEventBytes < 1
  ) {
    throw new Error('Assistant stream event limit is invalid');
  }
  if (
    !Number.isSafeInteger(configuration.reconnectWindowMs) ||
    configuration.reconnectWindowMs < 0
  ) {
    throw new Error('Assistant stream reconnect window is invalid');
  }
  if (
    !Number.isSafeInteger(configuration.idleTimeoutMs) ||
    configuration.idleTimeoutMs < 1
  ) {
    throw new Error('Assistant stream idle timeout is invalid');
  }
}

function nonNegativeSequence(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error('Assistant stream sequence is invalid');
  }
  return value;
}

function isRetryableStreamError(error: unknown): boolean {
  if (error instanceof AssistantStreamIdleError) return true;
  if (error instanceof TypeError) return true;
  if (!(error instanceof Error)) return false;
  const status = 'status' in error ? Number(error.status) : undefined;
  return status === 408 || status === 429 || (status !== undefined && status >= 500);
}

class AssistantStreamIdleError extends Error {}

async function readWithTimeout(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  timeoutMs: number,
): Promise<ReadableStreamReadResult<Uint8Array>> {
  let timeout: ReturnType<typeof globalThis.setTimeout> | undefined;
  try {
    return await Promise.race([
      reader.read(),
      new Promise<never>((_, reject) => {
        timeout = globalThis.setTimeout(
          () => reject(new AssistantStreamIdleError('Assistant stream became idle')),
          timeoutMs,
        );
      }),
    ]);
  } finally {
    if (timeout !== undefined) globalThis.clearTimeout(timeout);
  }
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  if (milliseconds <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const timeout = globalThis.setTimeout(resolve, milliseconds);
    signal?.addEventListener(
      'abort',
      () => {
        globalThis.clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}
