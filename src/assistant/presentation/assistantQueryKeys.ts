import type { AssistantPresentationScope } from './assistantPresentationContracts';

export function assistantQueryScopeKey(scope: AssistantPresentationScope) {
  return ['assistant', scope.enterpriseCode, scope.employeeId] as const;
}

export function assistantConversationsQueryKey(scope: AssistantPresentationScope) {
  return [...assistantQueryScopeKey(scope), 'conversations'] as const;
}

export function assistantConversationQueryKey(
  scope: AssistantPresentationScope,
  conversationCode: string,
) {
  return [...assistantConversationsQueryKey(scope), conversationCode] as const;
}

export function assistantTurnQueryKey(
  scope: AssistantPresentationScope,
  conversationCode: string,
  turnCode: string,
) {
  return [
    ...assistantConversationQueryKey(scope, conversationCode),
    'turn',
    turnCode,
  ] as const;
}
