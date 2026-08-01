import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material';

import { AxisMetadataPanel } from '../../app/detail/AxisMetadataPanel';
import { AxisSchemaRecordDetail } from '../../app/schema/AxisSchemaRecordDetail';
import { axisSchemaRecordDisplayValue } from '../../app/schema/axisSchemaRecordValues';
import { AxisSchemaDataListing } from '../../app/table/AxisSchemaDataListing';
import type { WorkbenchRecord, WorkbenchSchema } from '../api/workbenchContracts';
import type { WorkbenchRelationshipRuntime } from '../form/WorkbenchRelationshipRuntime';
import { workbenchRecordValue } from '../record/workbenchRecordPaths';
import type { WorkbenchRecordDetailPanel } from './workbenchRecordDetailPanels';

interface WorkbenchRecordDetailProps {
  readonly closeLabel: string;
  readonly editLabel: string;
  readonly deleteLabel: string;
  readonly falseLabel: string;
  readonly detailPanels?: readonly WorkbenchRecordDetailPanel[] | undefined;
  readonly record: WorkbenchRecord;
  readonly relationshipRuntime?: WorkbenchRelationshipRuntime | undefined;
  readonly schema: WorkbenchSchema;
  readonly trueLabel: string;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

function relatedRecordKey(record: WorkbenchRecord, index: number): string {
  const identity = record._id ?? record.code;
  return typeof identity === 'string' || typeof identity === 'number'
    ? String(identity)
    : `related-record-${String(index)}`;
}

function relatedDefaultColumns(schema: WorkbenchSchema): readonly string[] {
  const keys = [
    ...schema.displayProperties,
    ...schema.fields
      .filter((field) => field.primary || field.searchable)
      .map((field) => field.name),
  ];
  return Object.freeze([...new Set(keys)].slice(0, 5));
}

function WorkbenchRelatedDetailPanel({
  detailPanel,
}: {
  readonly detailPanel: WorkbenchRecordDetailPanel;
}) {
  const { panel, schema, page, loading, error } = detailPanel;
  if (!schema) {
    return (
      <AxisMetadataPanel
        fields={[
          {
            key: 'target',
            label: 'Target schema',
            value: `${panel.target.moduleName}.${panel.target.schemaName}`,
          },
        ]}
        notice="The related schema is not available in the authorized workbench catalogue."
        title={panel.label}
      />
    );
  }
  const records = page?.records ?? [];
  return (
    <AxisMetadataPanel fields={[]} notice={panel.summary} title={panel.label}>
      <Stack spacing={1}>
        <Typography color="text.secondary" variant="body2">
          {loading
            ? 'Loading'
            : `${String(page?.totalCount ?? records.length)} records`}
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {loading ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', color: 'text.secondary' }}
          >
            <CircularProgress size={18} />
            <Typography variant="body2">Loading related records</Typography>
          </Stack>
        ) : (
          <Box>
            <AxisSchemaDataListing
              ariaLabel={`${panel.label} related records`}
              defaultVisibleColumnKeys={relatedDefaultColumns(schema)}
              emptyMessage="No related records found."
              exportEnabled={false}
              getRowKey={relatedRecordKey}
              maxBodyHeight={260}
              minTableWidth={Math.max(640, schema.fields.length * 140)}
              records={records}
              schema={schema}
              size="small"
              toolbarStart={
                <Typography color="text.secondary" variant="body2">
                  {schema.label}
                </Typography>
              }
            />
          </Box>
        )}
      </Stack>
    </AxisMetadataPanel>
  );
}

export function WorkbenchRecordDetail(props: WorkbenchRecordDetailProps) {
  const titleField = props.schema.fields.find(
    (field) => field.name === props.schema.displayProperty,
  );
  const title = axisSchemaRecordDisplayValue(
    workbenchRecordValue(props.record, props.schema.displayProperty) ??
      props.schema.label,
    titleField,
    props.trueLabel,
    props.falseLabel,
  );
  return (
    <Stack spacing={1.5}>
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
        referenceResolver={
          props.relationshipRuntime?.resolveRecord
            ? { resolveReference: props.relationshipRuntime.resolveRecord }
            : undefined
        }
        schema={props.schema}
        title={title}
        trueLabel={props.trueLabel}
      />
      {props.detailPanels?.map((detailPanel) => (
        <WorkbenchRelatedDetailPanel
          key={detailPanel.panel.id}
          detailPanel={detailPanel}
        />
      ))}
    </Stack>
  );
}
