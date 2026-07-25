import { describe, expect, it } from 'vitest';

import {
  assistantConversationQueryKey,
  assistantTurnQueryKey,
} from '../../../src/assistant/presentation/assistantQueryKeys';

describe('Assistant query isolation', () => {
  it('isolates enterprise, employee, conversation, and turn identities', () => {
    const scope = { enterpriseCode: 'default', employeeId: 'employee-a' };
    const base = assistantTurnQueryKey(scope, 'conversation-1', 'turn-1');

    expect(base).not.toEqual(
      assistantTurnQueryKey(
        { ...scope, enterpriseCode: 'another' },
        'conversation-1',
        'turn-1',
      ),
    );
    expect(base).not.toEqual(
      assistantTurnQueryKey(
        { ...scope, employeeId: 'employee-b' },
        'conversation-1',
        'turn-1',
      ),
    );
    expect(base).not.toEqual(assistantConversationQueryKey(scope, 'conversation-2'));
  });
});
