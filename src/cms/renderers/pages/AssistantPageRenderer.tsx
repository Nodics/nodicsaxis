import type { ReactNode } from 'react';

import type { CmsPagePresentationProps } from '../shared/rendererTypes';
import {
  AssistantWorkspaceTemplateRenderer,
  type AssistantWorkspaceTemplateSlots,
} from '../templates/AssistantWorkspaceTemplateRenderer';
import { renderComponentCollection } from './renderComponentCollection';

export function AssistantPageRenderer({ page, actions }: CmsPagePresentationProps) {
  if (page.templateContract.renderer !== 'axis.template.assistant') {
    throw new Error(
      `Assistant page requires axis.template.assistant, received ${page.templateContract.renderer}`,
    );
  }
  const ordered = [...page.components].sort((left, right) => left.index - right.index);
  const slot = (name: string): ReactNode =>
    renderComponentCollection(
      ordered.filter((component) => component.slot === name),
      actions,
    );
  const slots: AssistantWorkspaceTemplateSlots = {
    header: slot('header'),
    workspace: slot('workspace'),
  };

  return <AssistantWorkspaceTemplateRenderer page={page} slots={slots} />;
}
