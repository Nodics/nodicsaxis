import { Stack, Typography } from '@mui/material';

import { AxisMark } from '../../../../app/shell/AxisMark';
import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

export function BrandRenderer({ component }: CmsComponentRendererProps) {
  const displayMode = stringProperty(component, 'displayMode', 'workspace');
  if (displayMode === 'workspace') {
    return (
      <Stack spacing={0.25} sx={{ alignItems: { md: 'flex-end' } }}>
        <Typography color="text.secondary" variant="overline">
          {stringProperty(component, 'productName')}
        </Typography>
        <Typography color="text.secondary" variant="body2">
          {stringProperty(component, 'tagline')}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.25}>
      <AxisMark />
      <Typography color="text.secondary" sx={{ fontSize: 13 }}>
        {stringProperty(component, 'tagline')}
      </Typography>
    </Stack>
  );
}
