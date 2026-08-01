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

interface AxisSchemaSelectedReference {
  readonly displayValue: string;
  readonly relationship: WorkbenchRelationship;
  readonly reference: string;
}

interface AxisSchemaLoadedReference extends AxisSchemaSelectedReference {
  readonly record: WorkbenchRecord;
  readonly schema: WorkbenchSchema;
}

function referenceValue(value: unknown, referenceProperty: string): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const objectValue = value as Readonly<Record<string, unknown>>;
    return referenceValue(
      objectValue[referenceProperty] ??
        objectValue.code ??
        objectValue.id ??
        objectValue.name,
      referenceProperty,
    );
  }
  return undefined;
}

function relationshipReferences(
  value: unknown,
  relationship: WorkbenchRelationship,
): readonly AxisSchemaSelectedReference[] {
  const values = Array.isArray(value) ? value : [value];
  return Object.freeze(
    values
      .map((item) => {
        const reference = referenceValue(item, relationship.referenceProperty);
        if (!reference) return undefined;
        return Object.freeze({
          displayValue: axisSchemaRecordDisplayValue(item),
          reference,
          relationship,
        });
      })
      .filter((item) => item !== undefined),
  );
}

function schemaDetailFields(
  schema: WorkbenchSchema,
  record: WorkbenchRecord,
  trueLabel: string,
  falseLabel: string,
  referenceResolver: AxisSchemaRecordReferenceResolver | undefined,
  referenceDepth: number,
  onReferenceOpen: (reference: AxisSchemaSelectedReference) => void,
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
        ? relationshipReferences(rawValue, relationship)
        : Object.freeze([]);
      const value =
        relationship && references.length > 0 ? (
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap', rowGap: 0.75 }}>
            {references.map((reference) => (
              <Button
                key={`${relationship.field}:${reference.reference}`}
                size="small"
                variant="outlined"
                onClick={() => onReferenceOpen(reference)}
              >
                {reference.displayValue}
              </Button>
            ))}
          </Stack>
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
  const openReference = (reference: AxisSchemaSelectedReference) => {
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
