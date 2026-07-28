import type { ReactNode } from 'react';

import type { CmsPagePresentationProps } from '../shared/rendererTypes';
import {
  DashboardTemplateRenderer,
  type DashboardTemplateSlots,
} from '../templates/DashboardTemplateRenderer';
import { renderComponentCollection } from './renderComponentCollection';

export function DashboardPageRenderer({ page, actions }: CmsPagePresentationProps) {
  if (page.templateContract.renderer !== 'axis.template.dashboard') {
    throw new Error(
      `Dashboard page requires axis.template.dashboard, received ${page.templateContract.renderer}`,
    );
  }
  const ordered = [...page.components].sort((left, right) => left.index - right.index);
  const slot = (name: string): ReactNode =>
    renderComponentCollection(
      ordered.filter((component) => component.slot === name),
      actions,
    );
  const slots: DashboardTemplateSlots = {
    welcome: slot('welcome'),
    summary: slot('summary'),
    quickActions: slot('quickActions'),
    activity: slot('activity'),
    help: slot('help'),
  };

  return <DashboardTemplateRenderer page={page} slots={slots} />;
}
