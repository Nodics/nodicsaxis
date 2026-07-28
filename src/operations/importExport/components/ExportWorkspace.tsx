import {
  Box,
  Card,
  CardContent,
  Chip,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';

const exportSteps: ReadonlyArray<readonly [string, string]> = [
  [
    'Choose export contract',
    'Backend modules will publish exportable contracts and permission rules.',
  ],
  [
    'Select scope',
    'Operators will choose tenant, module, schema, and safe filters without bypassing backend policy.',
  ],
  [
    'Generate package',
    'The backend export provider will create the file, checksum, and run record.',
  ],
];

export function ExportWorkspace() {
  return (
    <Stack spacing={1.5}>
      <Paper
        elevation={0}
        sx={(theme) => ({
          bgcolor: alpha(theme.palette.info.main, 0.08),
          border: 1,
          borderColor: alpha(theme.palette.info.main, 0.18),
          p: { xs: 1.75, md: 2 },
        })}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          sx={{ alignItems: { md: 'center' }, gap: 1.25 }}
        >
          <Stack sx={{ flex: 1 }} spacing={0.35}>
            <Typography component="h3" variant="h6">
              Export execution is not enabled yet
            </Typography>
            <Typography color="text.secondary">
              Nodics will keep this control unavailable until the governed export
              contract and provider implementations are complete.
            </Typography>
          </Stack>
          <Chip label="Backend contract pending" />
        </Stack>
      </Paper>
      <Box
        sx={{
          display: 'grid',
          gap: 1.25,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        }}
      >
        {exportSteps.map(([title, body]) => (
          <Card key={title} variant="outlined" sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
              <Stack spacing={0.75}>
                <Chip label="Planned" size="small" sx={{ alignSelf: 'flex-start' }} />
                <Typography component="h3" variant="h6">
                  {title}
                </Typography>
                <Typography color="text.secondary">{body}</Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
