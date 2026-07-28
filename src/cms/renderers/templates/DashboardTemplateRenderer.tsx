import { Box, Paper, Stack } from '@mui/material';
import type { ReactNode } from 'react';

import { WorkspaceContainer } from '../../../app/shell/ShellPrimitives';
import type { CmsPageContract } from '../../cmsContract';

export interface DashboardTemplateSlots {
  readonly welcome: ReactNode;
  readonly summary: ReactNode;
  readonly quickActions: ReactNode;
  readonly activity: ReactNode;
  readonly help: ReactNode;
}

interface DashboardTemplateRendererProps {
  readonly page: CmsPageContract;
  readonly slots: DashboardTemplateSlots;
}

export function DashboardTemplateRenderer({
  page,
  slots,
}: DashboardTemplateRendererProps) {
  return (
    <WorkspaceContainer>
      <Stack
        component="section"
        aria-label={page.name ?? 'Dashboard content'}
        spacing={3}
      >
        <Box>{slots.welcome}</Box>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' },
          }}
        >
          <Box sx={{ minWidth: 0 }}>{slots.summary}</Box>
          <Box sx={{ minWidth: 0 }}>{slots.quickActions}</Box>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(280px, 1fr)' },
          }}
        >
          <Paper
            component="section"
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}
          >
            {slots.activity}
          </Paper>
          <Paper
            component="aside"
            elevation={0}
            sx={{ border: '1px solid', borderColor: 'divider', p: 3 }}
          >
            {slots.help}
          </Paper>
        </Box>
      </Stack>
    </WorkspaceContainer>
  );
}
