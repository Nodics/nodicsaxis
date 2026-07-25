import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { AssistantWorkspaceRenderer } from '../../../../../src/cms/renderers/components/assistant/AssistantWorkspaceRenderer';
import type { CmsComponentContract } from '../../../../../src/cms/cmsContract';

const workspace: CmsComponentContract = {
  code: 'axisAssistantWorkspaceComponent',
  typeCode: 'axisAssistantWorkspaceComponentType',
  renderer: 'axis.component.assistant-workspace',
  rendererContractVersion: 1,
  rendererChannels: ['web', 'mobile-webview'],
  rendererDeprecated: false,
  properties: {
    title: 'Ask the governed assistant',
    welcomeMessage: 'Use authorized business capabilities.',
    inputPlaceholder: 'Describe the business task',
    submitLabel: 'Submit request',
    stopLabel: 'Stop request',
    emptyState: 'Conversation activity appears here.',
    employeeLabel: 'Operator',
    assistantLabel: 'Assistant',
    workingLabel: 'Working',
    cancellingLabel: 'Stopping',
    errorLabel: 'Request failed',
    historyLabel: 'Conversations',
    newConversationLabel: 'New conversation',
    noConversationsLabel: 'No conversations',
    loadMoreLabel: 'Load more',
    clarificationTitle: 'More information required',
    clarificationSubmitLabel: 'Continue',
    toolPlanTitle: 'Proposed governed action',
    confirmationTitle: 'Review and confirm',
    approveLabel: 'Approve action',
    executeLabel: 'Execute approved action',
    confirmationExpiredLabel: 'Confirmation expired',
    confirmationCompletedLabel: 'Action completed',
    toolPlannedLabel: 'Action prepared',
    toolRunningLabel: 'Action in progress',
    toolSucceededLabel: 'Action completed',
    toolFailedLabel: 'Action failed',
    citationsTitle: 'Sources',
    noCitationsLabel: 'No sources supplied',
    usageTitle: 'AI usage',
    inputTokensLabel: 'Input',
    outputTokensLabel: 'Output',
    cachedTokensLabel: 'Cached input',
    reasoningTokensLabel: 'Reasoning',
    embeddingTokensLabel: 'Embedding',
    reconciliationLabel: 'Accounting status',
  },
  slot: 'workspace',
  index: 20,
  components: [],
};

describe('AssistantWorkspaceRenderer', () => {
  it('renders all presentation copy from CMS component properties', () => {
    render(<AssistantWorkspaceRenderer component={workspace} />);

    expect(
      screen.getByRole('heading', { name: 'Ask the governed assistant' }),
    ).toBeVisible();
    expect(screen.getByText('Use authorized business capabilities.')).toBeVisible();
    expect(screen.getByText('Conversation activity appears here.')).toBeVisible();
    expect(
      screen.getByRole('textbox', { name: 'Describe the business task' }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Submit request' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Stop request' })).toBeDisabled();
  });

  it('rejects malformed backend properties through the shared property contract', () => {
    expect(() =>
      render(
        <AssistantWorkspaceRenderer
          component={{
            ...workspace,
            properties: { ...workspace.properties, submitLabel: 42 },
          }}
        />,
      ),
    ).toThrow('axisAssistantWorkspaceComponent.submitLabel must be a string');
  });

  it('submits and cancels through the presentation controller', async () => {
    const user = userEvent.setup();
    const submit = vi.fn().mockResolvedValue(undefined);
    const cancel = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <AssistantWorkspaceRenderer
        actions={{
          assistant: {
            state: {
              scope: { enterpriseCode: 'default', employeeId: 'operator' },
              status: 'IDLE',
              availableConversations: [],
              conversationPage: 1,
              conversationsHaveMore: false,
              historyLoading: false,
              conversations: {},
            },
            submit,
            cancel,
            selectConversation: vi.fn(),
            newConversation: vi.fn(),
            loadMoreConversations: vi.fn(),
            loadMoreHistory: vi.fn(),
            approveConfirmation: vi.fn(),
            executeConfirmation: vi.fn(),
          },
        }}
        component={workspace}
      />,
    );

    await user.type(
      screen.getByRole('textbox', { name: 'Describe the business task' }),
      'Create an enterprise',
    );
    await user.click(screen.getByRole('button', { name: 'Submit request' }));
    expect(submit).toHaveBeenCalledWith('Create an enterprise');

    rerender(
      <AssistantWorkspaceRenderer
        actions={{
          assistant: {
            state: {
              scope: { enterpriseCode: 'default', employeeId: 'operator' },
              status: 'STREAMING',
              activeConversationCode: 'conversation-1',
              availableConversations: [],
              conversationPage: 1,
              conversationsHaveMore: false,
              historyLoading: false,
              conversations: {
                'conversation-1': {
                  conversation: {
                    conversationCode: 'conversation-1',
                    definitionCode: 'axisAssistant',
                    state: 'ACTIVE',
                    lastSequence: 1,
                  },
                  turn: {
                    conversationCode: 'conversation-1',
                    turnCode: 'turn-1',
                    state: 'PROCESSING',
                  },
                  history: [],
                  historyPage: 1,
                  historyHasMore: false,
                  submittedMessage: 'Create an enterprise',
                  events: [],
                  lastSequence: 1,
                  streamedText: 'I am preparing the operation.',
                },
              },
            },
            submit,
            cancel,
            selectConversation: vi.fn(),
            newConversation: vi.fn(),
            loadMoreConversations: vi.fn(),
            loadMoreHistory: vi.fn(),
            approveConfirmation: vi.fn(),
            executeConfirmation: vi.fn(),
          },
        }}
        component={workspace}
      />,
    );

    expect(screen.getByText('Create an enterprise')).toBeVisible();
    expect(screen.getByText(/I am preparing the operation/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Stop request' }));
    expect(cancel).toHaveBeenCalledOnce();
  });
});
