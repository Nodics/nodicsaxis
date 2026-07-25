import { Box, Paper } from '@mui/material';
import type { ReactNode } from 'react';

import { WorkspaceContainer } from '../../../app/shell/ShellPrimitives';
import type { CmsPageContract } from '../../cmsContract';

export interface DocumentationArticleTemplateSlots {
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
      <Paper
        component="article"
        aria-label={page.name ?? 'Documentation article'}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          mx: 'auto',
          p: { xs: 2.5, sm: 4, lg: 6 },
          width: 'min(100%, 1040px)',
        }}
      >
        <Box sx={{ minWidth: 0 }}>{slots.article}</Box>
      </Paper>
    </WorkspaceContainer>
  );
}
