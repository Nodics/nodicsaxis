import { Box, Stack, Typography } from '@mui/material';
import { memo } from 'react';

interface AssistantMessageBubbleProps {
  readonly label: string;
  readonly message: string;
  readonly speaker: 'assistant' | 'employee';
  readonly streaming?: boolean | undefined;
}

export const AssistantMessageBubble = memo(function AssistantMessageBubble({
  label,
  message,
  speaker,
  streaming = false,
}: AssistantMessageBubbleProps) {
  const employee = speaker === 'employee';
  return (
    <Stack
      component="article"
      spacing={0.75}
      sx={{ alignItems: employee ? 'flex-end' : 'flex-start', width: '100%' }}
    >
      <Typography color="text.secondary" variant="caption">
        {label}
      </Typography>
      <Box
        sx={{
          bgcolor: employee ? 'primary.main' : 'action.hover',
          border: '1px solid',
          borderColor: employee ? 'primary.dark' : 'divider',
          borderRadius: 2,
          color: employee ? 'primary.contrastText' : 'text.primary',
          maxWidth: { xs: '92%', md: '76%' },
          px: 2,
          py: 1.5,
        }}
      >
        <Typography
          component="p"
          sx={{ overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}
        >
          {message}
          {streaming ? (
            <Box
              aria-hidden="true"
              component="span"
              sx={{
                '@keyframes assistant-cursor': {
                  '0%, 45%': { opacity: 1 },
                  '46%, 100%': { opacity: 0.2 },
                },
                animation: 'assistant-cursor 1s step-end infinite',
                bgcolor: 'primary.main',
                display: 'inline-block',
                height: '1em',
                ml: 0.5,
                verticalAlign: '-0.12em',
                width: 2,
              }}
            />
          ) : null}
        </Typography>
      </Box>
    </Stack>
  );
});
