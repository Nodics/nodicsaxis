import { Alert, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';

import { AxisMetadataPanel, type AxisMetadataField } from '../detail/AxisMetadataPanel';
import type {
  WorkbenchRecord,
  WorkbenchRelationship,
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
import {
  AxisSchemaReferenceValues,
  axisSchemaRelationshipReferences,
  type AxisSchemaReferenceValue,
} from './AxisSchemaReferenceValues';

export interface AxisSchemaRecordDetailProps {
  readonly actions?: ReactNode | undefined;
  readonly falseLabel?: string | undefined;
  readonly notice?: string | undefined;
  readonly record: WorkbenchRecord;
  readonly referenceResolver?: AxisSchemaRecordReferenceResolver | undefined;
  readonly referenceDepth?: number | undefined;
  readonly schema: WorkbenchSchema;
  readonly title?: ReactNode | undefined;
  readonly trueLabel?: string | undefined;
}

export interface AxisSchemaRecordReferenceResult {
  readonly record: WorkbenchRecord;
  readonly schema: WorkbenchSchema;
}

export interface AxisSchemaRecordReferenceResolver {
  readonly resolveReference: (
    relationship: WorkbenchRelationship,
    reference: string,
  ) => Promise<AxisSchemaRecordReferenceResult | undefined>;
}

interface AxisSchemaLoadedReference extends AxisSchemaReferenceValue {
  readonly record: WorkbenchRecord;
  readonly schema: WorkbenchSchema;
}

function schemaDetailFields(
  schema: WorkbenchSchema,
  record: WorkbenchRecord,
  trueLabel: string,
  falseLabel: string,
  referenceResolver: AxisSchemaRecordReferenceResolver | undefined,
  referenceDepth: number,
  onReferenceOpen: (reference: AxisSchemaReferenceValue) => void,
): readonly AxisMetadataField[] {
  const containerFields = containerFieldNames(schema.fields);
  const relationships = new Map(
    schema.relationships.map((relationship) => [relationship.field, relationship]),
  );
  return schema.fields
    .filter((field) => !containerFields.has(field.name))
    .map((field) => {
      const rawValue = workbenchRecordValue(record, field.name);
      const relationship = relationships.get(field.name);
      const relationshipCanOpen =
        relationship &&
        referenceResolver &&
        referenceDepth < Math.max(0, relationship.maximumDepth ?? 3);
      const references = relationshipCanOpen
        ? axisSchemaRelationshipReferences(rawValue, relationship)
        : Object.freeze([]);
      const value =
        relationship && references.length > 0 ? (
          <AxisSchemaReferenceValues
            references={references}
            variant="outlined"
            onReferenceClick={onReferenceOpen}
          />
        ) : (
          axisSchemaRecordDisplayValue(rawValue, field, trueLabel, falseLabel)
        );
      return {
        key: field.name,
        label: field.label,
        value,
        fullWidth:
          references.length > 2 ||
          (typeof value === 'string' && isLongSchemaDetailField(field, value)),
        monospace: /checksum|token|signature/i.test(field.name),
      };
    });
}

export function AxisSchemaRecordDetail({
  actions,
  falseLabel = 'No',
  notice,
  record,
  referenceDepth = 0,
  referenceResolver,
  schema,
  title,
  trueLabel = 'Yes',
}: AxisSchemaRecordDetailProps) {
  const [loadedReference, setLoadedReference] = useState<AxisSchemaLoadedReference>();
  const [loadingReference, setLoadingReference] = useState(false);
  const [referenceError, setReferenceError] = useState<string>();
  const canOpenReferences = Boolean(referenceResolver);
  const openReference = (reference: AxisSchemaReferenceValue) => {
    const maximumReferenceDepth = Math.max(0, reference.relationship.maximumDepth ?? 3);
    if (!referenceResolver || referenceDepth >= maximumReferenceDepth) return;
    setLoadedReference(undefined);
    setReferenceError(undefined);
    setLoadingReference(true);
    void referenceResolver
      .resolveReference(reference.relationship, reference.reference)
      .then((result) => {
        if (!result) {
          setReferenceError('Referenced record was not found or is not authorized.');
          return;
        }
        setLoadedReference({
          ...reference,
          record: result.record,
          schema: result.schema,
        });
      })
      .catch((error: unknown) =>
        setReferenceError(
          error instanceof Error
            ? error.message
            : 'Referenced record could not be loaded.',
        ),
      )
      .finally(() => setLoadingReference(false));
  };
  return (
    <AxisMetadataPanel
      actions={actions}
      fields={schemaDetailFields(
        schema,
        record,
        trueLabel,
        falseLabel,
        canOpenReferences ? referenceResolver : undefined,
        referenceDepth,
        openReference,
      )}
      notice={notice}
      title={title ?? 'Metadata'}
    >
      {loadingReference ? (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <CircularProgress size={18} />
          <Typography color="text.secondary" variant="body2">
            Loading referenced record
          </Typography>
        </Stack>
      ) : null}
      {referenceError ? <Alert severity="warning">{referenceError}</Alert> : null}
      {loadedReference ? (
        <AxisSchemaRecordDetail
          actions={
            <Button size="small" onClick={() => setLoadedReference(undefined)}>
              Close reference
            </Button>
          }
          falseLabel={falseLabel}
          record={loadedReference.record}
          referenceDepth={referenceDepth + 1}
          referenceResolver={referenceResolver}
          schema={loadedReference.schema}
          title={`${loadedReference.relationship.label}: ${loadedReference.displayValue}`}
          trueLabel={trueLabel}
        />
      ) : null}
    </AxisMetadataPanel>
  );
}
