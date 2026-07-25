import type { ReactNode } from 'react';

import type { AssistantPresentationState } from '../../../assistant/presentation/assistantPresentationContracts';
import type { CmsComponentContract, CmsPageContract } from '../../cmsContract';

export interface AssistantRendererController {
  readonly state: AssistantPresentationState;
  readonly submit: (message: string) => Promise<void>;
  readonly cancel: () => Promise<void>;
  readonly selectConversation: (conversationCode: string) => Promise<void>;
  readonly newConversation: () => void;
  readonly loadMoreConversations: () => Promise<void>;
  readonly loadMoreHistory: () => Promise<void>;
  readonly approveConfirmation: () => Promise<void>;
  readonly rejectConfirmation: () => Promise<void>;
  readonly executeConfirmation: () => Promise<void>;
}

export interface CmsRendererActions {
  readonly onEmployeeLogin?: (loginId: string, password: string) => void;
  readonly onEmployeeRecovery?: (identifier: string) => void;
  readonly onEmployeeUnlock?: (password: string) => void;
  readonly onEmployeeSignOut?: () => void;
  readonly currentEmployeeId?: string;
  readonly authenticationError?: string;
  readonly assistant?: AssistantRendererController | undefined;
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
