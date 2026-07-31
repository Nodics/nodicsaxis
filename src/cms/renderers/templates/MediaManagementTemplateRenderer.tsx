import type { ReactNode } from 'react';

import type { CmsPageContract } from '../../cmsContract';

export interface MediaManagementTemplateSlots {
  readonly workspace: ReactNode;
}

interface MediaManagementTemplateRendererProps {
  readonly page: CmsPageContract;
  readonly slots: MediaManagementTemplateSlots;
}

export function MediaManagementTemplateRenderer({
  slots,
}: MediaManagementTemplateRendererProps) {
  return <>{slots.workspace}</>;
}
