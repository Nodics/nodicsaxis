import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material';

import { WorkspaceHelpActions } from '../../../../app/help/WorkspaceHelp';
import { ShellIcon } from '../../../../app/shell/ShellIcon';
import {
  booleanProperty,
  helpProperty,
  stringProperty,
} from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

const placeholderActions = Object.freeze([
  { label: 'Review approvals', icon: 'tasks' },
  { label: 'Create content', icon: 'content' },
  { label: 'Run scheduled job', icon: 'automation' },
  { label: 'Browse schemas', icon: 'module' },
]);

export function DashboardActionsRenderer({ component }: CmsComponentRendererProps) {
  const placeholder = booleanProperty(component, 'placeholder');
  const title = stringProperty(component, 'title');
  return (
    <Card component="section" variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography component="h2" variant="h5">
                {title}
              </Typography>
              <WorkspaceHelpActions help={helpProperty(component)} label={title} />
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Start common authorized operations.
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={0.75}>
            {placeholderActions.map((action) => (
              <Button
                key={action.label}
                disabled={placeholder}
                fullWidth
                startIcon={<ShellIcon name={action.icon} />}
                sx={{ justifyContent: 'flex-start' }}
                variant="text"
              >
                {action.label}
              </Button>
            ))}
          </Stack>
          {placeholder ? (
            <Typography color="text.secondary" variant="caption">
              Actions become available when their authoritative modules advertise them.
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
