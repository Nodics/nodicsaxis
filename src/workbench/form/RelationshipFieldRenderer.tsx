import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { WorkbenchRelationship, WorkbenchSchema } from '../api/workbenchContracts';
import { workbenchRecordValue } from '../record/workbenchRecordPaths';
import type {
  WorkbenchRelationshipCopy,
  WorkbenchRelationshipDraft,
  WorkbenchRelationshipRuntime,
} from './WorkbenchRelationshipRuntime';
import { WorkbenchRecordForm } from './WorkbenchRecordForm';
import { RelationshipPendingRecordChips } from './RelationshipPendingRecordChips';
import { RelationshipReferenceChips } from './RelationshipReferenceChips';
import {
  workbenchRelationshipDescriptionValue,
  workbenchRelationshipRecordLabel,
} from './workbenchRelationshipLabels';

interface RelationshipFieldRendererProps {
  readonly copy: WorkbenchRelationshipCopy;
  readonly disabled: boolean;
  readonly draft: WorkbenchRelationshipDraft;
  readonly error?: string | undefined;
  readonly relationship: WorkbenchRelationship;
  readonly runtime: WorkbenchRelationshipRuntime;
  readonly targetSchema: WorkbenchSchema;
  readonly depth: number;
  readonly lineage: readonly string[];
  readonly onChange: (draft: WorkbenchRelationshipDraft) => void;
}

function referenceValue(
  record: Readonly<Record<string, unknown>>,
  property: string,
): string | undefined {
  const value = workbenchRecordValue(record, property);
  return typeof value === 'string' || typeof value === 'number'
    ? String(value)
    : undefined;
}

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

export function RelationshipFieldRenderer(props: RelationshipFieldRendererProps) {
  const [selectOpen, setSelectOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [editRecord, setEditRecord] = useState<Readonly<Record<string, unknown>>>();
  const backendSearch = search.trim();
  const records = useQuery({
    enabled: selectOpen,
    queryKey: [
      'schema-workbench',
      'relationship-records',
      ...props.runtime.queryScope,
      props.targetSchema.moduleName,
      props.targetSchema.schemaName,
      backendSearch,
    ],
    queryFn: () =>
      props.runtime.loadRecords(props.targetSchema, { search: backendSearch }),
  });
  const selected = new Set(props.draft.references);
  const label = props.relationship.label;
  const normalizedSearch = search.trim().toLocaleLowerCase();
  const visibleRecords = records.data?.filter((record) => {
    if (!normalizedSearch) return true;
    const reference = referenceValue(record, props.relationship.referenceProperty);
    const display = workbenchRelationshipRecordLabel(record, props.targetSchema, '');
    return `${display} ${reference ?? ''}`
      .toLocaleLowerCase()
      .includes(normalizedSearch);
  });
  const selectableRecords = (visibleRecords ?? []).flatMap((record, index) => {
    const reference = referenceValue(record, props.relationship.referenceProperty);
    if (!reference) return [];
    return [{ index, record, reference }];
  });
  const missingReferenceProperty =
    !records.isLoading &&
    !records.error &&
    (visibleRecords?.length ?? 0) > 0 &&
    selectableRecords.length === 0;
  const targetKey = `${props.targetSchema.moduleName}:${props.targetSchema.schemaName}`;
  const nestedCreateAllowed =
    props.depth < (props.relationship.maximumDepth ?? 3) &&
    !props.lineage.includes(targetKey);
  const canCreateRelated =
    props.relationship.actions.includes('CREATE_RELATED') &&
    nestedCreateAllowed &&
    props.targetSchema.operations.includes('create');
  const openCreate = () => {
    setSelectOpen(false);
    setCreateOpen(true);
  };

  return (
    <Box
      component="fieldset"
      sx={{
        border: 1,
        borderColor: props.error ? 'error.main' : 'divider',
        borderRadius: 1.5,
        gridColumn: '1 / -1',
        m: 0,
        minWidth: 0,
        p: 2,
      }}
    >
      <Typography component="legend" sx={{ px: 0.75, fontWeight: 700 }}>
        {label}
        {props.relationship.required ? ' *' : ''}
      </Typography>
      <Stack spacing={1.5}>
        {props.error ? <Alert severity="error">{props.error}</Alert> : null}
        <RelationshipReferenceChips
          copy={props.copy}
          disabled={props.disabled}
          draftReferences={props.draft.references}
          relationship={props.relationship}
          runtime={props.runtime}
          targetSchema={props.targetSchema}
          onRemove={(reference) =>
            props.onChange({
              ...props.draft,
              references: props.draft.references.filter(
                (candidate) => candidate !== reference,
              ),
            })
          }
        />
        <RelationshipPendingRecordChips
          copy={props.copy}
          depth={props.depth}
          disabled={props.disabled}
          lineage={props.lineage}
          pendingRecords={props.draft.pending}
          relationship={props.relationship}
          runtime={props.runtime}
          targetSchema={props.targetSchema}
          onRemove={(index) =>
            props.onChange({
              ...props.draft,
              pending: props.draft.pending.filter(
                (_, candidate) => candidate !== index,
              ),
            })
          }
          onUpdate={(index, model) =>
            props.onChange({
              ...props.draft,
              pending: props.draft.pending.map((candidate, candidateIndex) =>
                candidateIndex === index ? model : candidate,
              ),
            })
          }
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          {props.relationship.actions.includes('SELECT_EXISTING') ? (
            <Button
              disabled={props.disabled}
              variant="outlined"
              onClick={() => setSelectOpen((current) => !current)}
            >
              {props.copy.selectExistingLabel}
            </Button>
          ) : null}
          {canCreateRelated && !selectOpen ? (
            <Button disabled={props.disabled} variant="outlined" onClick={openCreate}>
              {props.copy.createRelatedLabel} {label}
            </Button>
          ) : null}
        </Stack>
        {selectOpen ? (
          <Stack
            aria-label={`${props.copy.selectExistingLabel} ${label}`}
            spacing={0.5}
          >
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignItems: { sm: 'flex-start' } }}
            >
              <TextField
                fullWidth
                label={props.copy.relatedSearchLabel}
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {canCreateRelated ? (
                <Button
                  disabled={props.disabled}
                  sx={{ flexShrink: 0, minHeight: 40 }}
                  variant="outlined"
                  onClick={openCreate}
                >
                  {props.copy.createRelatedLabel} {label}
                </Button>
              ) : null}
            </Stack>
            {records.isLoading ? <CircularProgress size={22} /> : null}
            {records.error ? (
              <Alert severity="error">{records.error.message}</Alert>
            ) : null}
            {!records.isLoading &&
            !records.error &&
            (visibleRecords?.length ?? 0) === 0 ? (
              <Typography color="text.secondary">
                {props.copy.noRelatedRecordsLabel}
              </Typography>
            ) : null}
            {missingReferenceProperty ? (
              <Alert severity="warning">
                {props.copy.missingReferencePropertyLabel.replace(
                  '{property}',
                  props.relationship.referenceProperty,
                )}
              </Alert>
            ) : null}
            {selectableRecords.map(({ index, record, reference }) => {
              const checked = selected.has(reference);
              const description = workbenchRelationshipDescriptionValue(record);
              const hasDescription = description.length > 0;
              const optionLabel = workbenchRelationshipRecordLabel(
                record,
                props.targetSchema,
                reference ?? `${label} ${String(index + 1)}`,
              );
              return (
                <Stack
                  key={reference}
                  direction="row"
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checked}
                        disabled={props.disabled}
                        onChange={() => {
                          const references =
                            props.relationship.cardinality === 'ONE'
                              ? checked
                                ? []
                                : [reference]
                              : checked
                                ? props.draft.references.filter(
                                    (candidate) => candidate !== reference,
                                  )
                                : unique([...props.draft.references, reference]);
                          props.onChange({ ...props.draft, references });
                        }}
                      />
                    }
                    label={
                      <Tooltip
                        arrow
                        describeChild
                        disableFocusListener={!hasDescription}
                        disableHoverListener={!hasDescription}
                        title={hasDescription ? description : ''}
                      >
                        <Typography component="span">{optionLabel}</Typography>
                      </Tooltip>
                    }
                  />
                  {props.relationship.actions.includes('EDIT_RELATED') &&
                  props.targetSchema.operations.includes('update') &&
                  props.runtime.updateRecord ? (
                    <Button
                      disabled={props.disabled}
                      size="small"
                      onClick={() => setEditRecord(record)}
                    >
                      {props.copy.editRelatedLabel}
                    </Button>
                  ) : null}
                </Stack>
              );
            })}
          </Stack>
        ) : null}
        {editRecord ? (
          <WorkbenchRecordForm
            cancelLabel={props.copy.cancelLabel}
            depth={props.depth + 1}
            embedded
            initialModel={editRecord}
            lineage={[...props.lineage, targetKey]}
            relationshipCopy={props.copy}
            relationshipRuntime={props.runtime}
            saving={false}
            savingLabel={props.copy.editRelatedLabel}
            schema={props.targetSchema}
            submitLabel={props.copy.editRelatedLabel}
            title={`${props.copy.editRelatedLabel} ${label}`}
            onCancel={() => setEditRecord(undefined)}
            onSubmit={async (model) => {
              if (!props.runtime.updateRecord) {
                throw new Error('Related record update is unavailable');
              }
              await props.runtime.updateRecord(props.targetSchema, editRecord, model);
              setEditRecord(undefined);
              await records.refetch();
            }}
          />
        ) : null}
        {createOpen ? (
          <WorkbenchRecordForm
            cancelLabel={props.copy.cancelLabel}
            embedded
            depth={props.depth + 1}
            lineage={[...props.lineage, targetKey]}
            relationshipCopy={props.copy}
            relationshipRuntime={props.runtime}
            saving={false}
            savingLabel={props.copy.addToDraftLabel}
            schema={props.targetSchema}
            submitLabel={props.copy.addToDraftLabel}
            title={`${props.copy.createRelatedLabel} ${label}`}
            onCancel={() => setCreateOpen(false)}
            onSubmit={(model) => {
              const pending =
                props.relationship.cardinality === 'ONE'
                  ? [model]
                  : [...props.draft.pending, model];
              props.onChange({
                pending: Object.freeze(pending),
                references:
                  props.relationship.cardinality === 'ONE'
                    ? Object.freeze([])
                    : props.draft.references,
              });
              setCreateOpen(false);
            }}
          />
        ) : null}
      </Stack>
    </Box>
  );
}
