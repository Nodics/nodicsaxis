import type { ReactNode } from 'react';

import type { AssistantPresentationState } from '../../../assistant/presentation/assistantPresentationContracts';
import type {
  WorkbenchFilterGroup,
  WorkbenchRecord,
  WorkbenchSchema,
  WorkbenchDeleteImpact,
} from '../../../workbench/api/workbenchContracts';
import type { WorkbenchSavedView } from '../../../workbench/preferences/workbenchPreferences';
import type { WorkbenchRelationshipRuntime } from '../../../workbench/form/WorkbenchRelationshipRuntime';
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

export interface WorkbenchRendererController {
  readonly schemas: readonly WorkbenchSchema[];
  readonly schemasError?: string | undefined;
  readonly schemasLoading: boolean;
  readonly selectedSchema?: WorkbenchSchema | undefined;
  readonly records: readonly WorkbenchRecord[];
  readonly recordSearch: string;
  readonly recordFilters?: WorkbenchFilterGroup | undefined;
  readonly recordPageNumber: number;
  readonly recordPageSize: number;
  readonly recordTotalCount: number;
  readonly recordSort: {
    readonly field: string;
    readonly direction: 'ASC' | 'DESC';
  };
  readonly visibleColumns: readonly string[];
  readonly favoriteSchemas: readonly string[];
  readonly recentSchemas: readonly string[];
  readonly selectedRecordKeys: readonly string[];
  readonly savedViews: readonly WorkbenchSavedView[];
  readonly recordsError?: string | undefined;
  readonly recordsLoading: boolean;
  readonly createError?: string | undefined;
  readonly creating: boolean;
  readonly createOpen: boolean;
  readonly relationshipRuntime: WorkbenchRelationshipRuntime;
  readonly selectedRecord?: WorkbenchRecord | undefined;
  readonly editOpen: boolean;
  readonly updateError?: string | undefined;
  readonly updating: boolean;
  readonly deleteOpen: boolean;
  readonly deleteError?: string | undefined;
  readonly deleting: boolean;
  readonly deleteImpact?: WorkbenchDeleteImpact | undefined;
  readonly deleteImpactLoading?: boolean;
  readonly bulkDeleteError?: string | undefined;
  readonly bulkDeleting?: boolean;
  readonly tenantCode: string;
  readonly enterpriseCode: string;
  readonly selectSchema: (schema: WorkbenchSchema) => void;
  readonly setRecordSearch: (search: string) => void;
  readonly setRecordFilters: (filters?: WorkbenchFilterGroup) => void;
  readonly setRecordPageNumber: (pageNumber: number) => void;
  readonly setRecordPageSize: (pageSize: number) => void;
  readonly setRecordSort: (sort: {
    readonly field: string;
    readonly direction: 'ASC' | 'DESC';
  }) => void;
  readonly setVisibleColumns: (columns: readonly string[]) => void;
  readonly toggleFavoriteSchema: (schema: WorkbenchSchema) => void;
  readonly setSelectedRecordKeys: (keys: readonly string[]) => void;
  readonly saveView: (view: WorkbenchSavedView) => void;
  readonly deleteView: (name: string) => void;
  readonly applyView: (view: WorkbenchSavedView) => void;
  readonly beginCreate: () => void;
  readonly cancelCreate: () => void;
  readonly createRecord: (model: Readonly<Record<string, unknown>>) => Promise<void>;
  readonly selectRecord: (record: WorkbenchRecord) => void;
  readonly closeRecord: () => void;
  readonly beginEdit: () => void;
  readonly cancelEdit: () => void;
  readonly updateRecord: (model: Readonly<Record<string, unknown>>) => Promise<void>;
  readonly beginDelete: () => void;
  readonly cancelDelete: () => void;
  readonly confirmDelete: () => Promise<void>;
  readonly bulkDeleteSelected?: () => Promise<void>;
  readonly retrySchemas: () => void;
  readonly retryRecords: () => void;
}

export interface CmsRendererActions {
  readonly onEmployeeLogin?: (loginId: string, password: string) => void;
  readonly onEmployeeRecovery?: (identifier: string) => void;
  readonly onEmployeeUnlock?: (password: string) => void;
  readonly onEmployeeSignOut?: () => void;
  readonly currentEmployeeId?: string;
  readonly authenticationError?: string;
  readonly assistant?: AssistantRendererController | undefined;
  readonly workbench?: WorkbenchRendererController | undefined;
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
