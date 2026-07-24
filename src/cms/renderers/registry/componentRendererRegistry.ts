import { lazy, type ComponentType } from 'react';

import type { CmsComponentRendererProps } from '../shared/rendererTypes';

export const COMPONENT_RENDERER_REGISTRY = Object.freeze({
  'axis.component.brand': lazy(() =>
    import('../components/shared/BrandRenderer').then((module) => ({
      default: module.BrandRenderer,
    })),
  ),
  'axis.component.message': lazy(() =>
    import('../components/shared/MessageRenderer').then((module) => ({
      default: module.MessageRenderer,
    })),
  ),
  'axis.component.authentication-showcase': lazy(() =>
    import('../components/authentication/AuthenticationShowcaseRenderer').then(
      (module) => ({ default: module.AuthenticationShowcaseRenderer }),
    ),
  ),
  'axis.component.employee-login-form': lazy(() =>
    import('../components/authentication/EmployeeLoginFormRenderer').then((module) => ({
      default: module.EmployeeLoginFormRenderer,
    })),
  ),
  'axis.component.employee-recovery-form': lazy(() =>
    import('../components/authentication/EmployeeRecoveryFormRenderer').then(
      (module) => ({ default: module.EmployeeRecoveryFormRenderer }),
    ),
  ),
  'axis.component.employee-lock-form': lazy(() =>
    import('../components/authentication/EmployeeLockFormRenderer').then((module) => ({
      default: module.EmployeeLockFormRenderer,
    })),
  ),
  'axis.component.link': lazy(() =>
    import('../components/shared/LinkRenderer').then((module) => ({
      default: module.LinkRenderer,
    })),
  ),
  'axis.component.dashboard-summary': lazy(() =>
    import('../components/dashboard/DashboardSummaryRenderer').then((module) => ({
      default: module.DashboardSummaryRenderer,
    })),
  ),
  'axis.component.dashboard-actions': lazy(() =>
    import('../components/dashboard/DashboardActionsRenderer').then((module) => ({
      default: module.DashboardActionsRenderer,
    })),
  ),
} satisfies Readonly<Record<string, ComponentType<CmsComponentRendererProps>>>);

export type ComponentRendererKey = keyof typeof COMPONENT_RENDERER_REGISTRY;

export function getComponentRenderer(
  renderer: string,
): ComponentType<CmsComponentRendererProps> | undefined {
  return (
    COMPONENT_RENDERER_REGISTRY as Readonly<
      Record<string, ComponentType<CmsComponentRendererProps> | undefined>
    >
  )[renderer];
}
