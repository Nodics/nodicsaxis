import { Box, Button, Chip, Stack } from '@mui/material';
import { useState } from 'react';

import { AxisSchemaRecordDetail } from '../../app/schema/AxisSchemaRecordDetail';
import type { WorkbenchRelationship, WorkbenchSchema } from '../api/workbenchContracts';
import type {
  WorkbenchRelationshipCopy,
  WorkbenchRelationshipRuntime,
} from './WorkbenchRelationshipRuntime';
import { WorkbenchRecordForm } from './WorkbenchRecordForm';
import {
  displayWorkbenchRelationshipValue,
  workbenchRelationshipRecordLabel,
} from './workbenchRelationshipLabels';

interface RelationshipPendingRecordChipsProps {
  readonly copy: WorkbenchRelationshipCopy;
  readonly depth: number;
  readonly disabled: boolean;
  readonly lineage: readonly string[];
  readonly pendingRecords: readonly Readonly<Record<string, unknown>>[];
  readonly relationship: WorkbenchRelationship;
  readonly runtime: WorkbenchRelationshipRuntime;
  readonly targetSchema: WorkbenchSchema;
  readonly onRemove: (index: number) => void;
  readonly onUpdate: (
    index: number,
    model: Readonly<Record<string, unknown>>,
  ) => void;
}

interface ActivePendingRecord {
  readonly index: number;
  readonly model: Readonly<Record<string, unknown>>;
}

export function RelationshipPendingRecordChips(
  props: RelationshipPendingRecordChipsProps,
) {
  const [previewRecord, setPreviewRecord] = useState<ActivePendingRecord>();
  const [editRecord, setEditRecord] = useState<ActivePendingRecord>();
  const targetKey = `${props.targetSchema.moduleName}:${props.targetSchema.schemaName}`;

  if (props.pendingRecords.length === 0) return null;

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
        {props.pendingRecords.map((model, index) => {
          const label = displayWorkbenchRelationshipValue(
            workbenchRelationshipRecordLabel(model, props.targetSchema, ''),
            `${props.relationship.label} ${String(index + 1)}`,
          );
          return (
            <Chip
              key={`pending-${String(index)}`}
              clickable
              color="warning"
              label={label}
              variant="outlined"
              onClick={() => setPreviewRecord({ index, model })}
              onDelete={props.disabled ? undefined : () => props.onRemove(index)}
            />
          );
        })}
      </Stack>
      {previewRecord ? (
        <AxisSchemaRecordDetail
          actions={
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button
                disabled={props.disabled}
                size="small"
                onClick={() => {
                  setEditRecord(previewRecord);
                  setPreviewRecord(undefined);
                }}
              >
                {props.copy.editRelatedLabel}
              </Button>
              <Button size="small" onClick={() => setPreviewRecord(undefined)}>
                {props.copy.removeRelatedLabel}
              </Button>
            </Stack>
          }
          record={previewRecord.model}
          referenceResolver={
            props.runtime.resolveRecord
              ? { resolveReference: props.runtime.resolveRecord }
              : undefined
          }
          schema={props.targetSchema}
          title={`Pending ${props.relationship.label}: ${workbenchRelationshipRecordLabel(
            previewRecord.model,
            props.targetSchema,
            String(previewRecord.index + 1),
          )}`}
        />
      ) : null}
      {editRecord ? (
        <Box>
          <WorkbenchRecordForm
            cancelLabel={props.copy.cancelLabel}
            depth={props.depth + 1}
            embedded
            initialModel={editRecord.model}
            lineage={[...props.lineage, targetKey]}
            relationshipCopy={props.copy}
            relationshipRuntime={props.runtime}
            saving={false}
            savingLabel={props.copy.editRelatedLabel}
            schema={props.targetSchema}
            submitLabel={props.copy.editRelatedLabel}
            title={`${props.copy.editRelatedLabel} ${props.relationship.label}`}
            onCancel={() => setEditRecord(undefined)}
            onSubmit={(model) => {
              props.onUpdate(editRecord.index, model);
              setEditRecord(undefined);
            }}
          />
        </Box>
      ) : null}
    </Stack>
  );
}
