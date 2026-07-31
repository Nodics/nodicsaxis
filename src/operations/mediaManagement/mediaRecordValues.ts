import type { WorkbenchRecord } from '../../workbench/api/workbenchContracts';

export function displayValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    const values = value
      .map((item) => displayValue(item))
      .filter((item) => item !== '—');
    return values.length ? values.join(', ') : '—';
  }
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '—';
    }
  }
  return '—';
}

export function textValue(record: WorkbenchRecord | undefined, key: string): string {
  return displayValue(record?.[key]);
}

export function numberValue(
  record: WorkbenchRecord | undefined,
  key: string,
): number | undefined {
  const value = record?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function formatBytes(value: number | undefined): string {
  if (value === undefined) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

export function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function recordNameOrCodeSummary(record: WorkbenchRecord): string {
  const name = textValue(record, 'name');
  if (name !== '—') return name;
  return textValue(record, 'code');
}
