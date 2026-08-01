import type { WorkbenchSchema } from '../api/workbenchContracts';
import { workbenchRecordValue } from '../record/workbenchRecordPaths';

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

export function displayWorkbenchRelationshipValue(
  value: unknown,
  fallback: string,
): string {
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : fallback;
}

function truncateWords(value: string, limit: number): string {
  const words = value.trim().split(/\s+/u).filter(Boolean);
  return words.length > limit
    ? `${words.slice(0, limit).join(' ')}...`
    : words.join(' ');
}

export function workbenchRelationshipDescriptionValue(
  record: Readonly<Record<string, unknown>>,
): string {
  return displayWorkbenchRelationshipValue(record.description, '').trim();
}

export function workbenchRelationshipRecordLabel(
  record: Readonly<Record<string, unknown>>,
  schema: WorkbenchSchema,
  fallback: string,
): string {
  const values = schema.displayProperties
    .map((property) => {
      const value = displayWorkbenchRelationshipValue(
        workbenchRecordValue(record, property),
        '',
      ).trim();
      return property === 'description' ? truncateWords(value, 5) : value;
    })
    .filter(Boolean);
  return unique(values).join(' - ') || fallback;
}
