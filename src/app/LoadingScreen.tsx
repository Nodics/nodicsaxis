import { Box, CircularProgress, Stack, Typography } from '@mui/material';

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
        <CircularProgress aria-label="Loading Axis configuration" />
        <Typography color="text.secondary">
          Preparing the secure Axis workspace…
        </Typography>
      </Stack>
    </Box>
  );
}
