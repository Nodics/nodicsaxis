import type { ReactNode } from 'react';

import { AxisMetadataPanel, type AxisMetadataField } from '../detail/AxisMetadataPanel';
import type {
  WorkbenchRecord,
  WorkbenchSchema,
} from '../../workbench/api/workbenchContracts';
import {
  containerFieldNames,
  workbenchRecordValue,
} from '../../workbench/record/workbenchRecordPaths';
import {
  axisSchemaRecordDisplayValue,
  isLongSchemaDetailField,
} from './axisSchemaRecordValues';

export interface AxisSchemaRecordDetailProps {
  readonly actions?: ReactNode | undefined;
  readonly falseLabel?: string | undefined;
  readonly notice?: string | undefined;
  readonly record: WorkbenchRecord;
  readonly schema: WorkbenchSchema;
  readonly title?: ReactNode | undefined;
  readonly trueLabel?: string | undefined;
}

function schemaDetailFields(
  schema: WorkbenchSchema,
  record: WorkbenchRecord,
  trueLabel: string,
  falseLabel: string,
): readonly AxisMetadataField[] {
  const containerFields = containerFieldNames(schema.fields);
  return schema.fields
    .filter((field) => !containerFields.has(field.name))
    .map((field) => {
      const value = axisSchemaRecordDisplayValue(
        workbenchRecordValue(record, field.name),
        field,
        trueLabel,
        falseLabel,
      );
      return {
        key: field.name,
        label: field.label,
        value,
        fullWidth: isLongSchemaDetailField(field, value),
        monospace: /checksum|token|signature/i.test(field.name),
      };
    });
}

export function AxisSchemaRecordDetail({
  actions,
  falseLabel = 'No',
  notice,
  record,
  schema,
  title,
  trueLabel = 'Yes',
}: AxisSchemaRecordDetailProps) {
  return (
    <AxisMetadataPanel
      actions={actions}
      fields={schemaDetailFields(schema, record, trueLabel, falseLabel)}
      notice={notice}
      title={title ?? 'Metadata'}
    />
  );
}
