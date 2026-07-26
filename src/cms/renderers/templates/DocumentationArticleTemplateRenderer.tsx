import { Box, Paper } from '@mui/material';
import type { ReactNode } from 'react';

import { WorkspaceContainer } from '../../../app/shell/ShellPrimitives';
import type { CmsPageContract } from '../../cmsContract';

export interface DocumentationArticleTemplateSlots {
  readonly navigation: ReactNode;
  readonly article: ReactNode;
}

interface DocumentationArticleTemplateRendererProps {
  readonly page: CmsPageContract;
  readonly slots: DocumentationArticleTemplateSlots;
}

export function DocumentationArticleTemplateRenderer({
  page,
  slots,
}: DocumentationArticleTemplateRendererProps) {
  return (
    <WorkspaceContainer>
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' },
        }}
      >
        <Paper
          component="aside"
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: { lg: 'calc(100vh - 140px)' },
            overflow: { lg: 'auto' },
            p: 2,
            position: { lg: 'sticky' },
            top: { lg: 96 },
          }}
        >
          {slots.navigation}
        </Paper>
        <Paper
          component="article"
          aria-label={page.name ?? 'Documentation article'}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            minWidth: 0,
            p: { xs: 2.5, sm: 4, lg: 6 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>{slots.article}</Box>
        </Paper>
      </Box>
    </WorkspaceContainer>
  );
}
