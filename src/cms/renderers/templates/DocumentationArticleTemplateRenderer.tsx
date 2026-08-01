import { Box, IconButton, Paper, Stack, Tooltip } from '@mui/material';
import type { ReactNode } from 'react';
import { useState } from 'react';

import { axisTokens } from '../../../app/axisTheme';
import { ShellIcon } from '../../../app/shell/ShellIcon';
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
  const [navigationOpen, setNavigationOpen] = useState(true);
  return (
    <WorkspaceContainer horizontalPadding="3px" verticalPadding="3px">
      <Box
        sx={{
          alignItems: 'start',
          display: 'grid',
          gap: '3px',
          gridTemplateColumns: navigationOpen
            ? { xs: 'minmax(0, 1fr)', lg: '300px minmax(0, 1fr)' }
            : { xs: '56px minmax(0, 1fr)', lg: '56px minmax(0, 1fr)' },
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
            p: navigationOpen ? 2 : 1,
            position: { lg: 'sticky' },
            top: { lg: `${String(axisTokens.spacing.header + 3)}px` },
          }}
        >
          {navigationOpen ? (
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="Hide documentation navigation">
                  <IconButton
                    aria-label="Hide documentation navigation"
                    size="small"
                    onClick={() => setNavigationOpen(false)}
                  >
                    <ShellIcon fontSize="small" name="chevron-left" />
                  </IconButton>
                </Tooltip>
              </Box>
              {slots.navigation}
            </Stack>
          ) : (
            <Stack sx={{ alignItems: 'center' }}>
              <Tooltip title="Show documentation navigation">
                <IconButton
                  aria-label="Show documentation navigation"
                  onClick={() => setNavigationOpen(true)}
                >
                  <ShellIcon name="chevron-right" />
                </IconButton>
              </Tooltip>
              <ShellIcon color="disabled" name="content" sx={{ mt: 1 }} />
            </Stack>
          )}
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
