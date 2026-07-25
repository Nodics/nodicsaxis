export interface AssistantSseFrame {
  readonly id?: string | undefined;
  readonly event?: string | undefined;
  readonly data: string;
}

export interface AssistantSseParser {
  push(chunk: string): readonly AssistantSseFrame[];
  finish(): readonly AssistantSseFrame[];
}

export function createAssistantSseParser(
  maximumEventBytes: number,
): AssistantSseParser {
  if (!Number.isSafeInteger(maximumEventBytes) || maximumEventBytes < 1) {
    throw new Error('Assistant SSE event limit is invalid');
  }
  let buffer = '';

  const drain = (finish = false): readonly AssistantSseFrame[] => {
    const frames: AssistantSseFrame[] = [];
    let boundary = buffer.search(/\r?\n\r?\n/);
    while (boundary >= 0) {
      const separator = buffer.slice(boundary).startsWith('\r\n\r\n') ? 4 : 2;
      const block = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + separator);
      const frame = parseFrame(block, maximumEventBytes);
      if (frame) frames.push(frame);
      boundary = buffer.search(/\r?\n\r?\n/);
    }
    if (finish && buffer.trim()) {
      const frame = parseFrame(buffer, maximumEventBytes);
      if (frame) frames.push(frame);
      buffer = '';
    }
    if (new TextEncoder().encode(buffer).byteLength > maximumEventBytes) {
      throw new Error('Assistant SSE event exceeds the configured limit');
    }
    return Object.freeze(frames);
  };

  return Object.freeze({
    push: (chunk: string) => {
      buffer += chunk;
      return drain();
    },
    finish: () => drain(true),
  });
}

function parseFrame(
  block: string,
  maximumEventBytes: number,
): AssistantSseFrame | undefined {
  if (new TextEncoder().encode(block).byteLength > maximumEventBytes) {
    throw new Error('Assistant SSE event exceeds the configured limit');
  }
  let id: string | undefined;
  let event: string | undefined;
  const data: string[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    const colon = line.indexOf(':');
    const field = colon < 0 ? line : line.slice(0, colon);
    const rawValue = colon < 0 ? '' : line.slice(colon + 1);
    const value = rawValue.startsWith(' ') ? rawValue.slice(1) : rawValue;
    if (field === 'id' && !value.includes('\0')) id = value;
    if (field === 'event') event = value;
    if (field === 'data') data.push(value);
  }
  if (!data.length) return undefined;
  return Object.freeze({ id, event, data: data.join('\n') });
}
