import type { WorkbenchRecord } from '../../../../workbench/api/workbenchContracts';
import { numberValue, recordNameOrCodeSummary } from '../../mediaRecordValues';

export function mediaFolderSummary(record: WorkbenchRecord): string {
  return recordNameOrCodeSummary(record);
}

export function formatRetentionDays(record: WorkbenchRecord): string {
  const value = numberValue(record, 'retentionDays');
  if (value === undefined) return '—';
  return `${value} day${value === 1 ? '' : 's'}`;
}
