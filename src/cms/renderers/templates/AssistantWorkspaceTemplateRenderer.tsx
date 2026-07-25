import { Box, Stack } from '@mui/material';
import type { ReactNode } from 'react';

import { WorkspaceContainer } from '../../../app/shell/ShellPrimitives';
import type { CmsPageContract } from '../../cmsContract';

export interface AssistantWorkspaceTemplateSlots {
  readonly header: ReactNode;
  readonly workspace: ReactNode;
}

interface AssistantWorkspaceTemplateRendererProps {
  readonly page: CmsPageContract;
  readonly slots: AssistantWorkspaceTemplateSlots;
}

export function AssistantWorkspaceTemplateRenderer({
  page,
  slots,
}: AssistantWorkspaceTemplateRendererProps) {
  return (
    <WorkspaceContainer>
      <Stack
        component="section"
        aria-label={page.name ?? 'Assistant workspace'}
        spacing={2.5}
      >
        <Box>{slots.header}</Box>
        <Box sx={{ minWidth: 0 }}>{slots.workspace}</Box>
      </Stack>
    </WorkspaceContainer>
  );
}
