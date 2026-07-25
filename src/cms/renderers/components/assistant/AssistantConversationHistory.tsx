import { Button, Divider, Stack, Typography } from '@mui/material';

import type { AssistantPresentationState } from '../../../../assistant/presentation/assistantPresentationContracts';

interface AssistantConversationHistoryProps {
  readonly state: AssistantPresentationState;
  readonly historyLabel: string;
  readonly newConversationLabel: string;
  readonly noConversationsLabel: string;
  readonly loadMoreLabel: string;
  readonly onSelect: (conversationCode: string) => Promise<void>;
  readonly onNew: () => void;
  readonly onLoadMore: () => Promise<void>;
}

export function AssistantConversationHistory(props: AssistantConversationHistoryProps) {
  const busy = ['SUBMITTING', 'STREAMING', 'CANCELLING'].includes(props.state.status);
  return (
    <Stack
      component="nav"
      aria-label={props.historyLabel}
      spacing={1}
      sx={{
        bgcolor: 'action.hover',
        borderBottom: { xs: '1px solid', md: 0 },
        borderColor: 'divider',
        borderRight: { xs: 0, md: '1px solid' },
        maxHeight: { xs: 180, md: 'none' },
        minWidth: 0,
        overflowY: 'auto',
        p: 2,
      }}
    >
      <Typography component="h2" variant="subtitle1">
        {props.historyLabel}
      </Typography>
      <Button disabled={busy} fullWidth variant="outlined" onClick={props.onNew}>
        {props.newConversationLabel}
      </Button>
      <Divider />
      {props.state.availableConversations.length ? (
        <>
          {props.state.availableConversations.map((conversation) => (
            <Button
              key={conversation.conversationCode}
              aria-current={
                props.state.activeConversationCode === conversation.conversationCode
                  ? 'page'
                  : undefined
              }
              color="secondary"
              disabled={busy || props.state.historyLoading}
              sx={{
                justifyContent: 'flex-start',
                overflow: 'hidden',
                textAlign: 'start',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              variant={
                props.state.activeConversationCode === conversation.conversationCode
                  ? 'contained'
                  : 'text'
              }
              onClick={() => void props.onSelect(conversation.conversationCode)}
            >
              {conversation.title ?? conversation.conversationCode}
            </Button>
          ))}
          {props.state.conversationsHaveMore ? (
            <Button
              disabled={busy}
              size="small"
              onClick={() => void props.onLoadMore()}
            >
              {props.loadMoreLabel}
            </Button>
          ) : null}
        </>
      ) : (
        <Typography color="text.secondary" variant="body2">
          {props.noConversationsLabel}
        </Typography>
      )}
    </Stack>
  );
}
