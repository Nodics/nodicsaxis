import type { ReactNode } from 'react';

import type { CmsComponentContract, CmsPageContract } from '../../cmsContract';

export interface CmsRendererActions {
  readonly onEmployeeLogin?: (loginId: string, password: string) => void;
  readonly onEmployeeRecovery?: (identifier: string) => void;
  readonly onEmployeeUnlock?: (password: string) => void;
  readonly onEmployeeSignOut?: () => void;
  readonly currentEmployeeId?: string;
  readonly authenticationError?: string;
}

export interface CmsComponentRendererProps {
  readonly component: CmsComponentContract;
  readonly actions?: CmsRendererActions | undefined;
}

export interface CmsTemplateRendererProps {
  readonly page: CmsPageContract;
  readonly children: ReactNode;
}

export interface CmsPagePresentationProps {
  readonly page: CmsPageContract;
  readonly actions?: CmsRendererActions | undefined;
}
