import { Link } from '@mui/material';
import { Link as RouterLink } from 'react-router';

import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

export function LinkRenderer({ component }: CmsComponentRendererProps) {
  const route = stringProperty(component, 'route');
  if (!route.startsWith('/') || route.startsWith('//')) {
    throw new Error(`${component.code}.route must be an internal absolute path`);
  }
  return (
    <Link component={RouterLink} to={route}>
      {stringProperty(component, 'label')}
    </Link>
  );
}
