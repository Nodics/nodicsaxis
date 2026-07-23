import { Alert, Box, Button, Container, Stack, Typography } from '@mui/material';

interface RecoveryScreenProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function RecoveryScreen({ message, onRetry }: RecoveryScreenProps) {
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
        <Stack spacing={3}>
          <Typography component="p" color="primary" sx={{ fontWeight: 700 }}>
            NODICS AXIS
          </Typography>
          <Typography component="h1" variant="h3">
            Axis cannot start safely
          </Typography>
          <Typography color="text.secondary">
            The deployment configuration must be available and valid before
            authentication or module discovery can begin.
          </Typography>
          <Alert severity="error" role="alert">
            {message}
          </Alert>
          <Box>
            <Button variant="contained" onClick={onRetry}>
              Retry configuration
            </Button>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
