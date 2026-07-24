import { Alert, Box, Chip, Stack, Typography } from '@mui/material';

import type { AxisNavigationItem } from '../bootstrap/publicBootstrap';
import { WorkspaceContainer } from './shell/ShellPrimitives';

interface ModuleWorkspacePlaceholderProps {
  readonly item: AxisNavigationItem;
}

export function ModuleWorkspacePlaceholder({ item }: ModuleWorkspacePlaceholderProps) {
  return (
    <WorkspaceContainer>
      <Box component="section" aria-label={`${item.label} workspace`}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip label={item.moduleName} size="small" variant="outlined" />
              <Chip
                color={item.availability === 'DEGRADED' ? 'warning' : 'success'}
                label={item.availability}
                size="small"
              />
            </Stack>
            <Typography component="h1" variant="h2">
              {item.label}
            </Typography>
            <Typography color="text.secondary">
              This authorized module capability was discovered through BackOffice.
            </Typography>
          </Stack>
          <Alert severity="info">
            The workspace renderer is not implemented yet. Axis has not inferred
            business behavior or called an unapproved operation.
          </Alert>
        </Stack>
      </Box>
    </WorkspaceContainer>
  );
}
