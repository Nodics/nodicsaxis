import { Button } from '@mui/material';

import { AxisSchemaRecordDetail } from '../../app/schema/AxisSchemaRecordDetail';
import { axisSchemaRecordDisplayValue } from '../../app/schema/axisSchemaRecordValues';
import type { WorkbenchRecord, WorkbenchSchema } from '../api/workbenchContracts';
import { workbenchRecordValue } from '../record/workbenchRecordPaths';

interface WorkbenchRecordDetailProps {
  readonly closeLabel: string;
  readonly editLabel: string;
  readonly deleteLabel: string;
  readonly falseLabel: string;
  readonly record: WorkbenchRecord;
  readonly schema: WorkbenchSchema;
  readonly trueLabel: string;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

export function WorkbenchRecordDetail(props: WorkbenchRecordDetailProps) {
  const titleField = props.schema.fields.find(
    (field) => field.name === props.schema.displayProperty,
  );
  return (
    <AxisSchemaRecordDetail
      actions={
        <>
          <Button onClick={props.onClose}>{props.closeLabel}</Button>
          {props.schema.operations.includes('update') ? (
            <Button variant="contained" onClick={props.onEdit}>
              {props.editLabel}
            </Button>
          ) : null}
          {props.schema.operations.includes('delete') ? (
            <Button color="error" onClick={props.onDelete}>
              {props.deleteLabel}
            </Button>
          ) : null}
        </>
      }
      falseLabel={props.falseLabel}
      record={props.record}
      schema={props.schema}
      title={axisSchemaRecordDisplayValue(
        workbenchRecordValue(props.record, props.schema.displayProperty) ??
          props.schema.label,
        titleField,
        props.trueLabel,
        props.falseLabel,
      )}
      trueLabel={props.trueLabel}
    />
  );
}
