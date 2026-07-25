import { Box, Paper, Stack, Typography } from '@mui/material';

import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';
import { AssistantComposer } from './AssistantComposer';
import { AssistantConversationHistory } from './AssistantConversationHistory';
import { AssistantMessageTimeline } from './AssistantMessageTimeline';

export function AssistantWorkspaceRenderer({
  actions,
  component,
}: CmsComponentRendererProps) {
  const title = stringProperty(component, 'title');
  const welcomeMessage = stringProperty(component, 'welcomeMessage');
  const inputPlaceholder = stringProperty(component, 'inputPlaceholder');
  const submitLabel = stringProperty(component, 'submitLabel');
  const stopLabel = stringProperty(component, 'stopLabel');
  const emptyState = stringProperty(component, 'emptyState');
  const employeeLabel = stringProperty(component, 'employeeLabel');
  const assistantLabel = stringProperty(component, 'assistantLabel');
  const workingLabel = stringProperty(component, 'workingLabel');
  const cancellingLabel = stringProperty(component, 'cancellingLabel');
  const errorLabel = stringProperty(component, 'errorLabel');
  const historyLabel = stringProperty(component, 'historyLabel');
  const newConversationLabel = stringProperty(component, 'newConversationLabel');
  const noConversationsLabel = stringProperty(component, 'noConversationsLabel');
  const loadMoreLabel = stringProperty(component, 'loadMoreLabel');
  const clarificationTitle = stringProperty(component, 'clarificationTitle');
  const clarificationSubmitLabel = stringProperty(
    component,
    'clarificationSubmitLabel',
  );
  const toolPlanTitle = stringProperty(component, 'toolPlanTitle');
  const toolPlannedLabel = stringProperty(component, 'toolPlannedLabel');
  const toolRunningLabel = stringProperty(component, 'toolRunningLabel');
  const toolSucceededLabel = stringProperty(component, 'toolSucceededLabel');
  const toolFailedLabel = stringProperty(component, 'toolFailedLabel');
  const citationsTitle = stringProperty(component, 'citationsTitle');
  const noCitationsLabel = stringProperty(component, 'noCitationsLabel');
  const usageTitle = stringProperty(component, 'usageTitle');
  const inputTokensLabel = stringProperty(component, 'inputTokensLabel');
  const outputTokensLabel = stringProperty(component, 'outputTokensLabel');
  const cachedTokensLabel = stringProperty(component, 'cachedTokensLabel');
  const reasoningTokensLabel = stringProperty(component, 'reasoningTokensLabel');
  const embeddingTokensLabel = stringProperty(component, 'embeddingTokensLabel');
  const reconciliationLabel = stringProperty(component, 'reconciliationLabel');
  const confirmationTitle = stringProperty(component, 'confirmationTitle');
  const approveLabel = stringProperty(component, 'approveLabel');
  const executeLabel = stringProperty(component, 'executeLabel');
  const confirmationExpiredLabel = stringProperty(
    component,
    'confirmationExpiredLabel',
  );
  const confirmationCompletedLabel = stringProperty(
    component,
    'confirmationCompletedLabel',
  );
  const confirmationRejectLabel = stringProperty(component, 'rejectLabel');
  const controller = actions?.assistant;
  const disconnectedState = {
    scope: { enterpriseCode: '', employeeId: '' },
    status: 'IDLE' as const,
    availableConversations: [],
    conversationPage: 0,
    conversationsHaveMore: false,
    historyLoading: false,
    conversations: {},
  };
  const state = controller?.state ?? disconnectedState;

  return (
    <Paper
      component="section"
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        minHeight: { xs: 480, md: 600 },
        overflow: 'hidden',
      }}
    >
      <Stack sx={{ minHeight: 'inherit' }}>
        <Stack
          spacing={0.75}
          sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 3 }}
        >
          <Typography component="h1" variant="h4">
            {title}
          </Typography>
          <Typography color="text.secondary">{welcomeMessage}</Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            flexGrow: 1,
            gridTemplateColumns: { xs: '1fr', md: '240px minmax(0, 1fr)' },
            minHeight: 0,
          }}
        >
          <AssistantConversationHistory
            historyLabel={historyLabel}
            loadMoreLabel={loadMoreLabel}
            newConversationLabel={newConversationLabel}
            noConversationsLabel={noConversationsLabel}
            state={state}
            onNew={controller?.newConversation ?? (() => undefined)}
            onLoadMore={controller?.loadMoreConversations ?? (() => Promise.resolve())}
            onSelect={controller?.selectConversation ?? (() => Promise.resolve())}
          />
          <Stack sx={{ minHeight: 0, minWidth: 0 }}>
            <AssistantMessageTimeline
              assistantLabel={assistantLabel}
              approveLabel={approveLabel}
              cancellingLabel={cancellingLabel}
              cachedTokensLabel={cachedTokensLabel}
              citationsTitle={citationsTitle}
              clarificationSubmitLabel={clarificationSubmitLabel}
              clarificationTitle={clarificationTitle}
              confirmationCompletedLabel={confirmationCompletedLabel}
              confirmationExpiredLabel={confirmationExpiredLabel}
              confirmationRejectLabel={confirmationRejectLabel}
              confirmationTitle={confirmationTitle}
              employeeLabel={employeeLabel}
              embeddingTokensLabel={embeddingTokensLabel}
              emptyState={emptyState}
              errorLabel={errorLabel}
              loadMoreLabel={loadMoreLabel}
              noCitationsLabel={noCitationsLabel}
              inputTokensLabel={inputTokensLabel}
              outputTokensLabel={outputTokensLabel}
              reasoningTokensLabel={reasoningTokensLabel}
              reconciliationLabel={reconciliationLabel}
              state={state}
              executeLabel={executeLabel}
              toolPlanTitle={toolPlanTitle}
              toolFailedLabel={toolFailedLabel}
              toolPlannedLabel={toolPlannedLabel}
              toolRunningLabel={toolRunningLabel}
              toolSucceededLabel={toolSucceededLabel}
              usageTitle={usageTitle}
              workingLabel={workingLabel}
              onApprove={controller?.approveConfirmation ?? (() => Promise.resolve())}
              onExecute={controller?.executeConfirmation ?? (() => Promise.resolve())}
              onReject={controller?.rejectConfirmation ?? (() => Promise.resolve())}
              onLoadMore={controller?.loadMoreHistory ?? (() => Promise.resolve())}
              onSubmit={controller?.submit ?? (() => Promise.resolve())}
            />
            <AssistantComposer
              connected={Boolean(controller)}
              inputPlaceholder={inputPlaceholder}
              status={state.status}
              stopLabel={stopLabel}
              submitLabel={submitLabel}
              onCancel={controller?.cancel ?? (() => Promise.resolve())}
              onSubmit={controller?.submit ?? (() => Promise.resolve())}
            />
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
}
