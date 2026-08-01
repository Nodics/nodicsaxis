import type { AxisSort } from '../app/table/axisTableSorting';
import type { AxisNavigationItem } from '../bootstrap/publicBootstrap';
import type {
  WorkbenchFilterGroup,
  WorkbenchRecord,
  WorkbenchRecordQuery,
  WorkbenchRelationship,
  WorkbenchSchema,
} from './api/workbenchContracts';

export interface WorkbenchRouteSchemaSelection {
  readonly moduleName: string;
  readonly schemaName: string;
  readonly mode?: 'create' | undefined;
}

export interface WorkbenchDeepLinkTarget {
  readonly key: string;
  readonly mode?: 'create' | undefined;
  readonly schema: WorkbenchSchema;
}

export function resolveWorkbenchDeepLinkTarget(
  search: string,
  schemas: readonly WorkbenchSchema[],
): WorkbenchDeepLinkTarget | undefined {
  const parameters = new URLSearchParams(search);
  const moduleName = parameters.get('module')?.trim();
  const schemaName = parameters.get('schema')?.trim();
  if (!moduleName || !schemaName) return undefined;
  const schema = schemas.find(
    (candidate) =>
      candidate.moduleName === moduleName && candidate.schemaName === schemaName,
  );
  if (!schema) return undefined;
  const requestedMode = parameters.get('mode')?.trim();
  const mode =
    requestedMode === 'create' && schema.operations.includes('create')
      ? 'create'
      : undefined;
  return Object.freeze({
    key: `${schema.moduleName}:${schema.schemaName}:${mode ?? 'browse'}`,
    ...(mode ? { mode } : {}),
    schema,
  });
}

export function resolveWorkbenchRouteTarget(
  routeSchema: WorkbenchRouteSchemaSelection | undefined,
  schemas: readonly WorkbenchSchema[],
): WorkbenchDeepLinkTarget | undefined {
  if (!routeSchema) return undefined;
  const schema = schemas.find(
    (candidate) =>
      candidate.moduleName === routeSchema.moduleName &&
      candidate.schemaName === routeSchema.schemaName,
  );
  if (!schema) return undefined;
  const mode =
    routeSchema.mode === 'create' && schema.operations.includes('create')
      ? 'create'
      : undefined;
  return Object.freeze({
    key: `${schema.moduleName}:${schema.schemaName}:${mode ?? 'browse'}:route`,
    ...(mode ? { mode } : {}),
    schema,
  });
}

export function schemaFieldNames(schema: WorkbenchSchema): ReadonlySet<string> {
  return new Set(schema.fields.map((field) => field.name));
}

export function validWorkbenchSortFields(schema: WorkbenchSchema): readonly string[] {
  const fieldNames = schemaFieldNames(schema);
  return Object.freeze(
    schema.queryCapabilities.sortableFields.filter((field) => fieldNames.has(field)),
  );
}

export function resolveWorkbenchRecordSort(
  schema: WorkbenchSchema | undefined,
  preferred: AxisSort | undefined,
): AxisSort {
  if (!schema) return Object.freeze({ field: 'code', direction: 'ASC' });
  const fieldNames = schemaFieldNames(schema);
  const sortableFields = validWorkbenchSortFields(schema);
  if (
    preferred &&
    fieldNames.has(preferred.field) &&
    sortableFields.includes(preferred.field)
  ) {
    return preferred;
  }
  const defaultSort = schema.queryCapabilities.defaultSort;
  if (fieldNames.has(defaultSort.field) && sortableFields.includes(defaultSort.field)) {
    return defaultSort;
  }
  const fallback =
    sortableFields[0] ??
    schema.displayProperties.find((field) => fieldNames.has(field)) ??
    (fieldNames.has(schema.displayProperty) ? schema.displayProperty : undefined) ??
    schema.fields.find((field) => field.primary)?.name ??
    schema.fields[0]?.name ??
    defaultSort.field;
  return Object.freeze({ field: fallback, direction: defaultSort.direction });
}

export function resolveWorkbenchLookupPageSize(schema: WorkbenchSchema): number {
  const firstAllowed = schema.queryCapabilities.allowedPageSizes[0];
  return typeof firstAllowed === 'number'
    ? firstAllowed
    : schema.queryCapabilities.defaultPageSize;
}

export function schemaWithValidQueryCapabilities(
  schema: WorkbenchSchema,
): WorkbenchSchema {
  const sortableFields = validWorkbenchSortFields(schema);
  const defaultSort = resolveWorkbenchRecordSort(schema, undefined);
  return Object.freeze({
    ...schema,
    queryCapabilities: Object.freeze({
      ...schema.queryCapabilities,
      sortableFields,
      defaultSort,
    }),
  });
}

function workbenchFilterValue(value: unknown): string | number | boolean | undefined {
  return typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
    ? value
    : undefined;
}

export function workbenchReferenceLookupQuery(
  schema: WorkbenchSchema,
  relationship: WorkbenchRelationship,
  reference: string,
): WorkbenchRecordQuery {
  const field = schema.queryCapabilities.filterFields.find(
    (candidate) => candidate.field === relationship.referenceProperty,
  );
  const baseQuery = {
    pageNumber: 1,
    pageSize: resolveWorkbenchLookupPageSize(schema),
    sort: resolveWorkbenchRecordSort(schema, undefined),
  };
  if (field?.operators.includes('EQUALS')) {
    return Object.freeze({
      ...baseQuery,
      search: '',
      filters: Object.freeze({
        operator: 'AND',
        items: Object.freeze([
          Object.freeze({
            field: relationship.referenceProperty,
            operator: 'EQUALS',
            value: reference,
          }),
        ]),
      }),
    });
  }
  return Object.freeze({
    ...baseQuery,
    search: reference,
  });
}

export function selectWorkbenchReferencedRecord(
  records: readonly WorkbenchRecord[],
  referenceProperty: string,
  reference: string,
): WorkbenchRecord | undefined {
  const exact = records.find((record) => {
    const value = workbenchFilterValue(record[referenceProperty]);
    return value !== undefined && String(value) === reference;
  });
  if (exact) return exact;
  return records.length === 1 ? records[0] : undefined;
}

export function relatedRecordPanelFilter(
  record: WorkbenchRecord | undefined,
  panel: NonNullable<AxisNavigationItem['detailPanels']>[number],
): WorkbenchFilterGroup | undefined {
  if (!record || !panel.relation) return undefined;
  const value = workbenchFilterValue(record[panel.relation.sourceField]);
  if (value === undefined) return undefined;
  return Object.freeze({
    operator: 'AND',
    items: Object.freeze([
      Object.freeze({
        field: panel.relation.targetField,
        operator: 'EQUALS',
        value,
      }),
    ]),
  });
}
