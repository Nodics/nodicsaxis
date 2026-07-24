import { Box, CircularProgress, Stack, Typography } from '@mui/material';

import { AxisMark } from './shell/AxisMark';

export function LoadingScreen() {
  return (
    <Box
      component="main"
      sx={{
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '100dvh',
      }}
    >
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        <AxisMark />
        <CircularProgress aria-label="Loading Axis configuration" />
        <Typography color="text.secondary">
          Preparing the secure Axis workspace…
        </Typography>
      </Stack>
    </Box>
  );
}
