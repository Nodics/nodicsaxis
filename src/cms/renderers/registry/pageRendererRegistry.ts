import { lazy, type ComponentType } from 'react';

import type { CmsPagePresentationProps } from '../shared/rendererTypes';

export const PAGE_RENDERER_REGISTRY = Object.freeze({
  'axis.page.authentication': lazy(() =>
    import('../pages/AuthenticationPageRenderer').then((module) => ({
      default: module.AuthenticationPageRenderer,
    })),
  ),
  'axis.page.dashboard': lazy(() =>
    import('../pages/DashboardPageRenderer').then((module) => ({
      default: module.DashboardPageRenderer,
    })),
  ),
  'axis.page.assistant': lazy(() =>
    import('../pages/AssistantPageRenderer').then((module) => ({
      default: module.AssistantPageRenderer,
    })),
  ),
} satisfies Readonly<Record<string, ComponentType<CmsPagePresentationProps>>>);

export function getPageRenderer(
  renderer: string,
): ComponentType<CmsPagePresentationProps> | undefined {
  return (
    PAGE_RENDERER_REGISTRY as Readonly<
      Record<string, ComponentType<CmsPagePresentationProps> | undefined>
    >
  )[renderer];
}
