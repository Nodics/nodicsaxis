import { Box, Chip, Container, Paper, Stack, Typography } from '@mui/material';

import { useRuntimeConfig } from '../runtime/RuntimeConfigContext';

export function WelcomePage() {
  const runtimeConfig = useRuntimeConfig();

  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        minHeight: '100dvh',
        py: { xs: 4, md: 8 },
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            p: { xs: 3, sm: 5, md: 7 },
            position: 'relative',
          }}
        >
          <Stack spacing={4}>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip color="primary" label="Runtime configuration ready" />
              <Chip
                label={`Client contract v${String(runtimeConfig.clientContractVersion)}`}
                variant="outlined"
              />
            </Stack>
            <Stack spacing={2}>
              <Typography component="p" color="primary" sx={{ fontWeight: 700 }}>
                NODICS AXIS
              </Typography>
              <Typography component="h1" variant="h1">
                One workspace for governed operations.
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ fontSize: '1.1rem', maxWidth: 680 }}
              >
                The Axis shell is ready. Human authentication, authorized module
                discovery, and business capabilities will be added through Nodics-owned
                contracts.
              </Typography>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 5 }}>
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="caption">
                  PROFILE AUTHORITY
                </Typography>
                <Typography>{new URL(runtimeConfig.profileBaseUrl).host}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography color="text.secondary" variant="caption">
                  BACK OFFICE CONTROL PLANE
                </Typography>
                <Typography>{new URL(runtimeConfig.backofficeBaseUrl).host}</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
