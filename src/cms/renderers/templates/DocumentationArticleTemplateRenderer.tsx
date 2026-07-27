import { Box, Paper } from '@mui/material';
import type { ReactNode } from 'react';

import { axisTokens } from '../../../app/axisTheme';
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
    <WorkspaceContainer horizontalPadding="3px" verticalPadding="3px">
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: '3px',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' },
        }}
      >
        <Paper
          component="aside"
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: {
              lg: `calc(100vh - ${String(axisTokens.spacing.header + 6)}px)`,
            },
            overflow: { lg: 'auto' },
            p: 2,
            position: { lg: 'sticky' },
            top: { lg: `${String(axisTokens.spacing.header + 3)}px` },
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
            pb: { xs: 2.5, sm: 4, lg: 6 },
            pt: 2,
            px: { xs: 2.5, sm: 4, lg: 6 },
          }}
        >
          <Box sx={{ minWidth: 0 }}>{slots.article}</Box>
        </Paper>
      </Box>
    </WorkspaceContainer>
  );
}
