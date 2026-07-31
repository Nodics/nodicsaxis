import { Alert, Box, Grid, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

export type MediaMetadataRecord = Readonly<Record<string, unknown>>;

export interface MediaMetadataField {
  readonly label: string;
  readonly key: string;
  readonly render?: (record: MediaMetadataRecord) => ReactNode;
}

function metadataValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    const values = value.map(metadataValue).filter((item) => item !== '—');
    return values.length ? values.join(', ') : '—';
  }
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '—';
    }
  }
  return '—';
}

export function MediaMetadataViewer(props: {
  readonly fields: readonly MediaMetadataField[];
  readonly hiddenPathNotice?: string | undefined;
  readonly record: MediaMetadataRecord;
  readonly title?: string | undefined;
}) {
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
        <Typography component="h4" sx={{ fontWeight: 800 }} variant="subtitle1">
          {props.title ?? 'Metadata'}
        </Typography>
        <Grid container spacing={1.25}>
          {props.fields.map((field) => {
            const rawValue = metadataValue(props.record[field.key]);
            const value = field.render ? field.render(props.record) : rawValue;
            const isChecksum = field.key.toLowerCase().includes('checksum');
            return (
              <Grid key={field.key} size={{ xs: 12, sm: isChecksum ? 12 : 6 }}>
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
                  {isChecksum ? (
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        mt: 0.5,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {rawValue}
                    </Typography>
                  ) : (
                    <Typography sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
                      {value}
                    </Typography>
                  )}
                </Box>
              </Grid>
            );
          })}
        </Grid>
        {props.hiddenPathNotice ? (
          <Alert severity="info" sx={{ py: 0.5 }}>
            {props.hiddenPathNotice}
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
