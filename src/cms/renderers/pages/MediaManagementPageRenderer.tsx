import type { ReactNode } from 'react';

import type { CmsPagePresentationProps } from '../shared/rendererTypes';
import {
  MediaManagementTemplateRenderer,
  type MediaManagementTemplateSlots,
} from '../templates/MediaManagementTemplateRenderer';
import { renderComponentCollection } from './renderComponentCollection';

export function MediaManagementPageRenderer({
  page,
  actions,
}: CmsPagePresentationProps) {
  if (page.templateContract.renderer !== 'axis.template.media-management') {
    throw new Error(
      `Media Management requires axis.template.media-management, received ${page.templateContract.renderer}`,
    );
  }
  const ordered = [...page.components].sort((left, right) => left.index - right.index);
  const slot = (name: string): ReactNode =>
    renderComponentCollection(
      ordered.filter((component) => component.slot === name),
      actions,
    );
  const slots: MediaManagementTemplateSlots = {
    workspace: slot('workspace'),
  };
  return <MediaManagementTemplateRenderer page={page} slots={slots} />;
}
