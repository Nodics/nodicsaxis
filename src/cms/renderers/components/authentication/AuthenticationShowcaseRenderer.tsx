import { Box, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import { arrayProperty, stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

export function AuthenticationShowcaseRenderer({
  component,
}: CmsComponentRendererProps) {
  const highlights = arrayProperty(component, 'highlights');
  return (
    <Stack spacing={3} sx={{ maxWidth: 520 }}>
      <Typography
        component="p"
        sx={{
          color: 'primary.main',
          fontSize: { md: 13, lg: 14 },
          fontWeight: 800,
          letterSpacing: '0.16em',
          lineHeight: 1.4,
          textTransform: 'uppercase',
        }}
        variant="overline"
      >
        {stringProperty(component, 'eyebrow')}
      </Typography>
      <Typography
        component="h1"
        sx={{ fontSize: { md: 34, lg: 42 }, fontWeight: 700, lineHeight: 1.12 }}
      >
        {stringProperty(component, 'title')}
      </Typography>
      <Typography sx={{ color: alpha('#ffffff', 0.72), lineHeight: 1.7 }}>
        {stringProperty(component, 'message')}
      </Typography>
      <Stack spacing={1.25}>
        {highlights.map((highlight, index) => {
          if (typeof highlight !== 'string') {
            throw new Error(
              `${component.code}.highlights.${String(index)} must be a string`,
            );
          }
          return (
            <Stack
              key={highlight}
              direction="row"
              spacing={1.5}
              sx={{ alignItems: 'center' }}
            >
              <Box
                aria-hidden="true"
                sx={{ bgcolor: 'primary.main', height: 2, width: 20 }}
              />
              <Typography sx={{ fontSize: 14 }}>{highlight}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}
