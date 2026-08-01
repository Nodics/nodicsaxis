import type { ReactNode } from 'react';

import {
  AxisMetadataPanel,
  type AxisMetadataField,
} from '../../../app/detail/AxisMetadataPanel';

export type MediaMetadataRecord = Readonly<Record<string, unknown>>;

export interface MediaMetadataField {
  readonly label: string;
  readonly key: string;
  readonly render?: (record: MediaMetadataRecord) => ReactNode;
}

function metadataValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    const values = value.map(metadataValue).filter((item) => item !== '—');
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

export function MediaMetadataViewer(props: {
  readonly fields: readonly MediaMetadataField[];
  readonly hiddenPathNotice?: string | undefined;
  readonly record: MediaMetadataRecord;
  readonly title?: string | undefined;
}) {
  const fields: readonly AxisMetadataField[] = props.fields.map((field) => {
    const rawValue = metadataValue(props.record[field.key]);
    return {
      key: field.key,
      label: field.label,
      value: field.render ? field.render(props.record) : rawValue,
      fullWidth: field.key.toLowerCase().includes('checksum'),
      monospace: field.key.toLowerCase().includes('checksum'),
    };
  });
  return (
    <AxisMetadataPanel
      fields={fields}
      notice={props.hiddenPathNotice}
      title={props.title ?? 'Metadata'}
    />
  );
}
