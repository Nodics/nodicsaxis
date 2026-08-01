import type { AxisNavigationDetailPanel } from '../../bootstrap/publicBootstrap';
import type { WorkbenchRecordPage, WorkbenchSchema } from '../api/workbenchContracts';

export interface WorkbenchRecordDetailPanel {
  readonly panel: AxisNavigationDetailPanel;
  readonly schema?: WorkbenchSchema | undefined;
  readonly page?: WorkbenchRecordPage | undefined;
  readonly loading: boolean;
  readonly error?: string | undefined;
}
