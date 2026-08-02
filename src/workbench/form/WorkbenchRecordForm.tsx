import { Alert, Box, Button, Stack, Typography } from '@mui/material';
import { useMemo, useState, type FormEvent } from 'react';

import type { AxisWorkbenchPresentation } from '../../bootstrap/publicBootstrap';
import type { WorkbenchSchema } from '../api/workbenchContracts';
import {
  compactWorkbenchDraft,
  containerFieldNames,
  workbenchRecordValue,
} from '../record/workbenchRecordPaths';
import { WorkbenchFieldRenderer } from './WorkbenchFieldRenderer';
import { RelationshipFieldRenderer } from './RelationshipFieldRenderer';
import type {
  WorkbenchRelationshipCopy,
  WorkbenchRelationshipDraft,
  WorkbenchRelationshipRuntime,
} from './WorkbenchRelationshipRuntime';

interface WorkbenchRecordFormProps {
  readonly cancelLabel: string;
  readonly error?: string | undefined;
  readonly initialModel?: Readonly<Record<string, unknown>> | undefined;
  readonly saving: boolean;
  readonly savingLabel: string;
  readonly schema: WorkbenchSchema;
  readonly submitLabel: string;
  readonly title?: string | undefined;
  readonly embedded?: boolean | undefined;
  readonly depth?: number | undefined;
  readonly lineage?: readonly string[] | undefined;
  readonly relationshipCopy?: WorkbenchRelationshipCopy | undefined;
  readonly relationshipRuntime?: WorkbenchRelationshipRuntime | undefined;
  readonly workbenchPresentation?: AxisWorkbenchPresentation | undefined;
  readonly onCancel: () => void;
  readonly onSubmit: (model: Readonly<Record<string, unknown>>) => void | Promise<void>;
}

function editableFieldNames(
  schema: WorkbenchSchema,
  presentation: AxisWorkbenchPresentation | undefined,
): ReadonlySet<string> {
  const editableFields =
    presentation?.editableFields === undefined
      ? undefined
      : new Set(presentation.editableFields);
  const readonlyFields = new Set(presentation?.readonlyFields ?? []);
  const forbiddenFields = new Set(presentation?.forbiddenFields ?? []);
  return new Set(
    schema.fields
      .filter(
        (field) =>
          !field.readOnly &&
          !readonlyFields.has(field.name) &&
          !forbiddenFields.has(field.name) &&
          (editableFields === undefined || editableFields.has(field.name)),
      )
      .map((field) => field.name),
  );
}

function initialDraft(
  schema: WorkbenchSchema,
  presentation: AxisWorkbenchPresentation | undefined,
  model?: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const editableNames = editableFieldNames(schema, presentation);
  return Object.fromEntries(
    schema.fields
      .filter(
        (field) =>
          editableNames.has(field.name) &&
          (workbenchRecordValue(model, field.name) !== undefined ||
            field.default !== undefined),
      )
      .map((field) => [
        field.name,
        workbenchRecordValue(model, field.name) !== undefined
          ? workbenchRecordValue(model, field.name)
          : field.default,
      ]),
  );
}

function initialRelationshipDrafts(
  schema: WorkbenchSchema,
  model?: Readonly<Record<string, unknown>>,
): Record<string, WorkbenchRelationshipDraft> {
  return Object.fromEntries(
    schema.relationships.map((relationship) => {
      const value = workbenchRecordValue(model, relationship.field);
      const values = Array.isArray(value) ? value : value === undefined ? [] : [value];
      const references = values.flatMap((item) => {
        if (typeof item === 'string' || typeof item === 'number') {
          return [String(item)];
        }
        if (typeof item === 'object' && item !== null) {
          const reference = workbenchRecordValue(
            item as Record<string, unknown>,
            relationship.referenceProperty,
          );
          return typeof reference === 'string' || typeof reference === 'number'
            ? [String(reference)]
            : [];
        }
        return [];
      });
      return [
        relationship.field,
        {
          references: Object.freeze([...new Set(references)]),
          pending: Object.freeze([]),
        },
      ];
    }),
  );
}

function requiredErrors(
  schema: WorkbenchSchema,
  editableNames: ReadonlySet<string>,
  draft: Readonly<Record<string, unknown>>,
): Readonly<Record<string, string>> {
  return Object.fromEntries(
    schema.fields
      .filter((field) => {
        const value = draft[field.name];
        return (
          editableNames.has(field.name) &&
          field.required &&
          (value === undefined ||
            value === '' ||
            (Array.isArray(value) && value.length === 0))
        );
      })
      .map((field) => [field.name, `${field.label} is required`]),
  );
}

export function WorkbenchRecordForm(props: WorkbenchRecordFormProps) {
  const [draft, setDraft] = useState<Record<string, unknown>>(() =>
    initialDraft(props.schema, props.workbenchPresentation, props.initialModel),
  );
  const [submitted, setSubmitted] = useState(false);
  const [resolvingRelationships, setResolvingRelationships] = useState(false);
  const [relationshipError, setRelationshipError] = useState<string>();
  const [relationshipDrafts, setRelationshipDrafts] = useState<
    Record<string, WorkbenchRelationshipDraft>
  >(() => initialRelationshipDrafts(props.schema, props.initialModel));
  const relationshipFields = useMemo(
    () => new Set(props.schema.relationships.map((relationship) => relationship.field)),
    [props.schema.relationships],
  );
  const editableNames = useMemo(
    () => editableFieldNames(props.schema, props.workbenchPresentation),
    [props.schema, props.workbenchPresentation],
  );
  const relationshipCopy = props.relationshipCopy;
  const relationshipRuntime = props.relationshipRuntime;
  const containerFields = useMemo(
    () => containerFieldNames(props.schema.fields),
    [props.schema.fields],
  );
  const editableFields = useMemo(
    () =>
      props.schema.fields.filter(
        (field) =>
          editableNames.has(field.name) &&
          !relationshipFields.has(field.name) &&
          !containerFields.has(field.name),
      ),
    [containerFields, editableNames, props.schema.fields, relationshipFields],
  );
  const editableRelationships = useMemo(
    () =>
      props.schema.relationships.filter((relationship) =>
        editableNames.has(relationship.field),
      ),
    [editableNames, props.schema.relationships],
  );
  const relationshipValidationErrors = Object.fromEntries(
    editableRelationships
      .filter((relationship) => {
        const value = relationshipDrafts[relationship.field];
        return (
          relationship.required &&
          (value?.references.length ?? 0) + (value?.pending.length ?? 0) === 0
        );
      })
      .map((relationship) => [
        relationship.field,
        `${
          props.schema.fields.find((field) => field.name === relationship.field)
            ?.label ?? relationship.field
        } is required`,
      ]),
  );
  const validationErrors = {
    ...requiredErrors(
      {
        ...props.schema,
        fields: props.schema.fields.filter(
          (field) =>
            editableNames.has(field.name) &&
            !relationshipFields.has(field.name) &&
            !containerFields.has(field.name),
        ),
      },
      editableNames,
      draft,
    ),
    ...relationshipValidationErrors,
  };
  const errors = submitted ? validationErrors : {};

  const submit = async () => {
    setSubmitted(true);
    if (Object.keys(validationErrors).length > 0) return;
    setRelationshipError(undefined);
    setResolvingRelationships(true);
    const model = compactWorkbenchDraft(draft);
    const resolvedDrafts = { ...relationshipDrafts };
    try {
      for (const relationship of editableRelationships) {
        const relationshipDraft = resolvedDrafts[relationship.field] ?? {
          references: [],
          pending: [],
        };
        const targetSchema = props.relationshipRuntime?.schemas.find(
          (schema) =>
            schema.moduleName === relationship.targetModule &&
            schema.schemaName === relationship.targetSchema,
        );
        let references = [...relationshipDraft.references];
        let remainingPending = [...relationshipDraft.pending];
        if (relationshipDraft.pending.length > 0) {
          if (!props.relationshipRuntime || !targetSchema) {
            throw new Error('The related schema is not currently available');
          }
          for (const pending of relationshipDraft.pending) {
            const created = await props.relationshipRuntime.createRecord(
              targetSchema,
              pending,
            );
            const reference = created[relationship.referenceProperty];
            if (typeof reference !== 'string' && typeof reference !== 'number') {
              throw new Error('The related record did not return its reference');
            }
            references = [...new Set([...references, String(reference)])];
            remainingPending = remainingPending.slice(1);
            resolvedDrafts[relationship.field] = {
              references: Object.freeze(references),
              pending: Object.freeze(remainingPending),
            };
            setRelationshipDrafts({ ...resolvedDrafts });
          }
        }
        if (references.length > 0 || relationship.required) {
          model[relationship.field] =
            relationship.cardinality === 'ONE' ? references[0] : references;
        }
      }
      await props.onSubmit(Object.freeze(model));
    } catch (error: unknown) {
      setRelationshipError(
        error instanceof Error
          ? error.message
          : 'Related records could not be prepared',
      );
    } finally {
      setResolvingRelationships(false);
    }
  };

  return (
    <Stack
      component={props.embedded ? 'div' : 'form'}
      noValidate
      spacing={props.embedded ? 1.75 : 2.25}
      sx={
        props.embedded
          ? {
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              p: { xs: 1.5, sm: 2 },
            }
          : undefined
      }
      onSubmit={
        props.embedded
          ? undefined
          : (event: FormEvent) => {
              event.preventDefault();
              void submit();
            }
      }
    >
      <Typography component="h3" variant="h6">
        {props.title ?? `${props.submitLabel} ${props.schema.label}`}
      </Typography>
      {props.error ? <Alert severity="error">{props.error}</Alert> : null}
      {relationshipError ? <Alert severity="error">{relationshipError}</Alert> : null}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          '& > :last-child:nth-child(odd)': {
            gridColumn: { md: '1 / -1' },
          },
        }}
      >
        {editableFields.map((field) => (
          <WorkbenchFieldRenderer
            key={field.name}
            error={errors[field.name]}
            field={field}
            value={draft[field.name]}
            onChange={(value) =>
              setDraft((current) => ({ ...current, [field.name]: value }))
            }
          />
        ))}
        {relationshipRuntime && relationshipCopy
          ? editableRelationships.map((relationship) => {
              const targetSchema = relationshipRuntime.schemas.find(
                (schema) =>
                  schema.moduleName === relationship.targetModule &&
                  schema.schemaName === relationship.targetSchema,
              );
              if (!targetSchema) return null;
              return (
                <RelationshipFieldRenderer
                  key={relationship.field}
                  copy={relationshipCopy}
                  disabled={props.saving || resolvingRelationships}
                  draft={
                    relationshipDrafts[relationship.field] ?? {
                      references: [],
                      pending: [],
                    }
                  }
                  error={errors[relationship.field]}
                  relationship={relationship}
                  runtime={relationshipRuntime}
                  targetSchema={targetSchema}
                  depth={props.depth ?? 0}
                  lineage={
                    props.lineage ?? [
                      `${props.schema.moduleName}:${props.schema.schemaName}`,
                    ]
                  }
                  onChange={(value) =>
                    setRelationshipDrafts((current) => ({
                      ...current,
                      [relationship.field]: value,
                    }))
                  }
                />
              );
            })
          : null}
      </Box>
      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          borderTop: props.embedded ? 1 : 0,
          borderColor: 'divider',
          justifyContent: 'flex-end',
          pt: props.embedded ? 1.5 : 0,
        }}
      >
        <Button
          disabled={props.saving || resolvingRelationships}
          onClick={props.onCancel}
        >
          {props.cancelLabel}
        </Button>
        <Button
          disabled={props.saving || resolvingRelationships}
          type={props.embedded ? 'button' : 'submit'}
          variant="contained"
          onClick={props.embedded ? () => void submit() : undefined}
        >
          {props.saving || resolvingRelationships
            ? props.savingLabel
            : props.submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
