import { describe, expect, it } from 'vitest';

import { createAssistantSseParser } from '../../../src/assistant/api/assistantSseParser';

describe('Assistant SSE parser', () => {
  it('assembles fragmented frames and ignores heartbeat comments', () => {
    const parser = createAssistantSseParser(1024);

    expect(parser.push(': heartbeat\n\nid: turn-1')).toEqual([]);
    expect(parser.push('-1\nevent: status\ndata: {"sequence":1}\n\n')).toEqual([
      {
        id: 'turn-1-1',
        event: 'status',
        data: '{"sequence":1}',
      },
    ]);
  });

  it('rejects an event that exceeds the configured byte limit', () => {
    const parser = createAssistantSseParser(10);
    expect(() => parser.push('data: a-value-that-is-too-long')).toThrow(
      /configured limit/,
    );
  });
});
