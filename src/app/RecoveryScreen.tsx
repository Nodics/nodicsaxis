import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { AxisMark } from './shell/AxisMark';
import { getRecoveryContent, type RecoveryState } from './recoveryState';

interface RecoveryScreenProps {
  readonly state: RecoveryState;
  readonly onRetry: () => void;
}

export function RecoveryScreen({ state, onRetry }: RecoveryScreenProps) {
  const content = getRecoveryContent(state.kind);

  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        minHeight: '100dvh',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', p: 4 }}>
          <Stack spacing={3}>
            <AxisMark />
            <Stack direction="row" spacing={1}>
              <Chip color="warning" label="Recovery mode" size="small" />
              <Chip label={content.eyebrow} size="small" variant="outlined" />
            </Stack>
            <Stack spacing={1.5}>
              <Typography component="h1" variant="h3">
                {content.title}
              </Typography>
              <Typography color="text.secondary">{content.description}</Typography>
            </Stack>
            {state.detail ? (
              <Alert severity={state.kind === 'unauthorized' ? 'warning' : 'error'}>
                {state.detail}
              </Alert>
            ) : null}
            {state.correlationId ? (
              <Typography color="text.secondary" variant="body2">
                Support reference: <strong>{state.correlationId}</strong>
              </Typography>
            ) : null}
            <Box>
              <Button variant="contained" onClick={onRetry}>
                {state.retryable ? content.action : 'Return to workspace'}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
