import { Alert, Stack, Typography } from '@mui/material';

import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

export function MessageRenderer({ component }: CmsComponentRendererProps) {
  const tone = stringProperty(component, 'tone', 'default');
  const severity =
    tone === 'security' ? 'warning' : tone === 'information' ? 'info' : undefined;
  const content = (
    <Stack spacing={0.75}>
      <Typography component="h2" sx={{ fontWeight: 700 }} variant="h6">
        {stringProperty(component, 'title')}
      </Typography>
      <Typography color="text.secondary">
        {stringProperty(component, 'message')}
      </Typography>
    </Stack>
  );
  return severity ? <Alert severity={severity}>{content}</Alert> : content;
}
