import { Box, Card, CardContent, Stack, Typography } from '@mui/material';

import { WorkspaceHelpActions } from '../../../../app/help/WorkspaceHelp';
import {
  booleanProperty,
  helpProperty,
  stringProperty,
} from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

const placeholderMetrics = Object.freeze([
  { label: 'Pending approvals', hint: 'Waiting for Workflow', accent: 'warning.main' },
  {
    label: 'Modules available',
    hint: 'Waiting for registry metrics',
    accent: 'success.main',
  },
  { label: 'Scheduled jobs', hint: 'Waiting for CronJob', accent: 'info.main' },
  { label: 'Operational alerts', hint: 'Waiting for monitoring', accent: 'error.main' },
]);

export function DashboardSummaryRenderer({ component }: CmsComponentRendererProps) {
  const placeholder = booleanProperty(component, 'placeholder');
  const title = stringProperty(component, 'title');
  return (
    <Stack component="section" spacing={1.5}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Typography component="h2" variant="h5">
            {title}
          </Typography>
          <WorkspaceHelpActions help={helpProperty(component)} label={title} />
        </Stack>
        <Typography color="text.secondary" variant="caption">
          Operational overview
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {placeholderMetrics.map((metric) => (
          <Card key={metric.label} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start' }}>
                <Box
                  aria-hidden="true"
                  sx={{
                    bgcolor: metric.accent,
                    borderRadius: 1,
                    height: 40,
                    opacity: 0.14,
                    width: 40,
                  }}
                />
                <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                  <Typography color="text.secondary" variant="body2">
                    {metric.label}
                  </Typography>
                  <Typography component="p" variant="h4">
                    {placeholder ? '—' : '0'}
                  </Typography>
                  <Typography color="text.secondary" noWrap variant="caption">
                    {metric.hint}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
