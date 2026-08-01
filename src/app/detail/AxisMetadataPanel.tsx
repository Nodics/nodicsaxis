import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export interface AxisMetadataField {
  readonly key: string;
  readonly label: string;
  readonly value: ReactNode;
  readonly fullWidth?: boolean | undefined;
  readonly monospace?: boolean | undefined;
}

export interface AxisMetadataPanelProps {
  readonly actions?: ReactNode | undefined;
  readonly fields: readonly AxisMetadataField[];
  readonly notice?: string | undefined;
  readonly title?: ReactNode | undefined;
}

export function AxisMetadataPanel({
  actions,
  fields,
  notice,
  title = 'Metadata',
}: AxisMetadataPanelProps) {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography component="h4" sx={{ fontWeight: 800 }} variant="subtitle1">
            {title}
          </Typography>
          {actions ? (
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              {actions}
            </Stack>
          ) : null}
        </Stack>
        <Grid container spacing={1.25}>
          {fields.map((field) => (
            <Grid key={field.key} size={{ xs: 12, sm: field.fullWidth ? 12 : 6 }}>
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  minHeight: '100%',
                  p: 1.25,
                }}
              >
                <Typography
                  color="text.secondary"
                  sx={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: 0.9,
                    textTransform: 'uppercase',
                  }}
                >
                  {field.label}
                </Typography>
                <Typography
                  component="div"
                  sx={{
                    fontFamily: field.monospace ? 'monospace' : undefined,
                    fontSize: field.monospace ? '0.82rem' : undefined,
                    mt: 0.5,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {field.value}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        {notice ? (
          <Alert severity="info" sx={{ py: 0.5 }}>
            {notice}
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
