import { Box, Stack } from '@mui/material';
import type { ReactNode } from 'react';

import { WorkspaceContainer } from '../../../app/shell/ShellPrimitives';
import type { CmsPageContract } from '../../cmsContract';

export interface SchemaWorkbenchTemplateSlots {
  readonly header: ReactNode;
  readonly content: ReactNode;
}

interface SchemaWorkbenchTemplateRendererProps {
  readonly page: CmsPageContract;
  readonly slots: SchemaWorkbenchTemplateSlots;
}

export function SchemaWorkbenchTemplateRenderer({
  page,
  slots,
}: SchemaWorkbenchTemplateRendererProps) {
  return (
    <WorkspaceContainer>
      <Stack
        component="section"
        aria-label={page.name ?? 'Schema Workbench'}
        spacing={2.5}
      >
        <Box>{slots.header}</Box>
        <Box sx={{ minWidth: 0 }}>{slots.content}</Box>
      </Stack>
    </WorkspaceContainer>
  );
}
