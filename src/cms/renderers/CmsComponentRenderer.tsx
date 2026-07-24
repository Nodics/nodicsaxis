import { createElement } from 'react';

import { getComponentRenderer } from './registry/componentRendererRegistry';
import type { CmsComponentRendererProps } from './shared/rendererTypes';

export function CmsComponentRenderer({
  component,
  actions,
}: CmsComponentRendererProps) {
  const Renderer = getComponentRenderer(component.renderer);
  if (!Renderer) {
    throw new Error(`Unsupported CMS component renderer: ${component.renderer}`);
  }
  return createElement(Renderer, { actions, component });
}
