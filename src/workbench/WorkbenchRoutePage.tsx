import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router';

import { CmsRoutePage } from '../app/CmsRoutePage';
import {
  selectModuleConnection,
  type AxisAuthenticatedBootstrap,
} from '../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../runtime/runtimeConfig';
import {
  createWorkbenchRecord,
  bulkDeleteWorkbenchRecords,
  deleteWorkbenchRecord,
  loadWorkbenchRecords,
  loadWorkbenchSchemas,
  previewWorkbenchDeleteImpact,
  updateWorkbenchRecord,
} from './api/workbenchClient';
import type { WorkbenchFilterGroup, WorkbenchSchema } from './api/workbenchContracts';
import {
  loadWorkbenchPreferences,
  saveWorkbenchPreferences,
  schemaPreferenceKey,
  type WorkbenchPreferences,
  type WorkbenchSavedView,
} from './preferences/workbenchPreferences';

interface WorkbenchRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly channel: string;
  readonly cmsBaseUrl: string;
  readonly employeeId: string;
  readonly locale: string;
  readonly runtime: AxisRuntimeConfig;
  readonly site: string;
}

function workbenchRecordKey(
  record: Readonly<Record<string, unknown>>,
  index: number,
): string {
  const identity = record._id ?? record.code;
  return typeof identity === 'string' || typeof identity === 'number'
    ? String(identity)
    : `record-${String(index)}`;
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

export function WorkbenchRoutePage(props: WorkbenchRoutePageProps) {
  const location = useLocation();
  const [selectedSchema, setSelectedSchema] = useState<WorkbenchSchema>();
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<Readonly<Record<string, unknown>>>();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recordSearchInput, setRecordSearchInput] = useState('');
  const [recordSearch, setRecordSearch] = useState('');
  const [recordFilters, setRecordFilters] = useState<WorkbenchFilterGroup>();
  const [recordPageNumber, setRecordPageNumber] = useState(1);
  const [recordPageSize, setRecordPageSize] = useState(25);
  const [recordSort, setRecordSort] = useState<{
    readonly field: string;
    readonly direction: 'ASC' | 'DESC';
  }>({ field: 'code', direction: 'ASC' });
  const preferenceScope = useMemo(
    () => ({
      employeeId: props.employeeId,
      tenantCode: props.bootstrap.tenantCode,
      enterpriseCode: props.runtime.enterpriseCode,
    }),
    [props.bootstrap.tenantCode, props.employeeId, props.runtime.enterpriseCode],
  );
  const [preferences, setPreferences] = useState<WorkbenchPreferences>(() =>
    loadWorkbenchPreferences(preferenceScope),
  );
  const [visibleColumns, setVisibleColumns] = useState<readonly string[]>([]);
  const [selectedRecordKeys, setSelectedRecordKeys] = useState<readonly string[]>([]);
  const consumedDeepLinkKey = useRef<string | undefined>(undefined);
  const queryClient = useQueryClient();
  const updatePreferences = (next: WorkbenchPreferences) => {
    setPreferences(next);
    saveWorkbenchPreferences(preferenceScope, next);
  };
  const configuration = useMemo(
    () => ({
      accessToken: props.accessToken,
      enterpriseCode: props.runtime.enterpriseCode,
      timeoutMs: props.runtime.requestTimeoutMs,
    }),
    [props.accessToken, props.runtime.enterpriseCode, props.runtime.requestTimeoutMs],
  );
  const connections = useMemo(
    () =>
      Object.keys(props.bootstrap.moduleConnections)
        .map((moduleName) => selectModuleConnection(props.bootstrap, moduleName))
        .filter((connection) => connection !== undefined),
    [props.bootstrap],
  );
  const schemas = useQuery({
    queryKey: ['schema-workbench', 'schemas', props.runtime.enterpriseCode],
    queryFn: () => loadWorkbenchSchemas(connections, configuration),
  });
  const recordConnection = selectedSchema
    ? selectModuleConnection(props.bootstrap, selectedSchema.moduleName)
    : undefined;
  useEffect(() => {
    const timeout = globalThis.setTimeout(() => {
      setRecordSearch(recordSearchInput.trim());
      setRecordPageNumber(1);
    }, 300);
    return () => globalThis.clearTimeout(timeout);
  }, [recordSearchInput]);
  const records = useQuery({
    enabled: Boolean(selectedSchema && recordConnection && !createOpen && !editOpen),
    queryKey: [
      'schema-workbench',
      'records',
      props.runtime.enterpriseCode,
      selectedSchema?.moduleName,
      selectedSchema?.schemaName,
      recordSearch,
      JSON.stringify(recordFilters ?? null),
      recordPageNumber,
      recordPageSize,
      recordSort.field,
      recordSort.direction,
    ],
    queryFn: ({ signal }) => {
      if (!selectedSchema || !recordConnection) {
        throw new Error('The selected schema module is unavailable');
      }
      return loadWorkbenchRecords(
        recordConnection,
        selectedSchema,
        configuration,
        {
          search: recordSearch,
          ...(recordFilters ? { filters: recordFilters } : {}),
          pageNumber: recordPageNumber,
          pageSize: recordPageSize,
          sort: recordSort,
        },
        fetch,
        signal,
      );
    },
  });
  const createRecord = useMutation({
    mutationFn: (model: Readonly<Record<string, unknown>>) => {
      if (!selectedSchema || !recordConnection) {
        throw new Error('The selected schema module is unavailable');
      }
      return createWorkbenchRecord(
        recordConnection,
        selectedSchema,
        model,
        configuration,
      );
    },
    onSuccess: async () => {
      setCreateOpen(false);
      await queryClient.invalidateQueries({
        queryKey: [
          'schema-workbench',
          'records',
          props.runtime.enterpriseCode,
          selectedSchema?.moduleName,
          selectedSchema?.schemaName,
        ],
      });
    },
  });
  const updateRecord = useMutation({
    mutationFn: (model: Readonly<Record<string, unknown>>) => {
      if (!selectedSchema || !recordConnection || !selectedRecord) {
        throw new Error('The selected schema module is unavailable');
      }
      return updateWorkbenchRecord(
        recordConnection,
        selectedSchema,
        selectedRecord,
        model,
        configuration,
      );
    },
    onSuccess: async (updated) => {
      setSelectedRecord(updated);
      setEditOpen(false);
      await queryClient.invalidateQueries({
        queryKey: [
          'schema-workbench',
          'records',
          props.runtime.enterpriseCode,
          selectedSchema?.moduleName,
          selectedSchema?.schemaName,
        ],
      });
    },
  });
  const deleteRecord = useMutation({
    mutationFn: () => {
      if (!selectedSchema || !recordConnection || !selectedRecord) {
        throw new Error('The selected schema module is unavailable');
      }
      return deleteWorkbenchRecord(
        recordConnection,
        selectedSchema,
        selectedRecord,
        configuration,
      );
    },
    onSuccess: async () => {
      setDeleteOpen(false);
      setEditOpen(false);
      setSelectedRecord(undefined);
      await queryClient.invalidateQueries({
        queryKey: [
          'schema-workbench',
          'records',
          props.runtime.enterpriseCode,
          selectedSchema?.moduleName,
          selectedSchema?.schemaName,
        ],
      });
    },
  });
  const deleteImpact = useMutation({
    mutationFn: () => {
      if (!selectedSchema || !recordConnection || !selectedRecord) {
        throw new Error('The selected schema module is unavailable');
      }
      return previewWorkbenchDeleteImpact(
        recordConnection,
        selectedSchema,
        selectedRecord,
        configuration,
      );
    },
    onSuccess: () => setDeleteOpen(true),
  });
  const bulkDelete = useMutation({
    mutationFn: () => {
      if (!selectedSchema || !recordConnection) {
        throw new Error('The selected schema module is unavailable');
      }
      const selected = (records.data?.records ?? []).filter((record, index) =>
        selectedRecordKeys.includes(workbenchRecordKey(record, index)),
      );
      return bulkDeleteWorkbenchRecords(
        recordConnection,
        selectedSchema,
        selected,
        configuration,
        `axis-${crypto.randomUUID()}`,
      );
    },
    onSuccess: async () => {
      setSelectedRecordKeys([]);
      await queryClient.invalidateQueries({
        queryKey: [
          'schema-workbench',
          'records',
          props.runtime.enterpriseCode,
          selectedSchema?.moduleName,
          selectedSchema?.schemaName,
        ],
      });
    },
  });
  const selectWorkbenchSchema = useCallback(
    (schema: WorkbenchSchema, options: { readonly openCreate?: boolean } = {}) => {
      createRecord.reset();
      updateRecord.reset();
      deleteRecord.reset();
      deleteImpact.reset();
      bulkDelete.reset();
      setCreateOpen(Boolean(options.openCreate));
      setEditOpen(false);
      setSelectedRecord(undefined);
      setDeleteOpen(false);
      setRecordSearchInput('');
      setRecordSearch('');
      setRecordFilters(undefined);
      setRecordPageNumber(1);
      setRecordPageSize(schema.queryCapabilities.defaultPageSize);
      setRecordSort(schema.queryCapabilities.defaultSort);
      const key = schemaPreferenceKey(schema.moduleName, schema.schemaName);
      const schemaPreference = preferences.schemaPreferences[key];
      const defaultColumns = schema.fields
        .filter((field) => field.primary || field.searchable)
        .slice(0, 5)
        .map((field) => field.name);
      setVisibleColumns(
        schemaPreference?.visibleColumns.length
          ? schemaPreference.visibleColumns
          : defaultColumns.length
            ? defaultColumns
            : schema.fields.slice(0, 5).map((field) => field.name),
      );
      setSelectedRecordKeys([]);
      updatePreferences({
        ...preferences,
        recentSchemas: Object.freeze(
          [key, ...preferences.recentSchemas.filter((item) => item !== key)].slice(
            0,
            10,
          ),
        ),
      });
      setSelectedSchema(schema);
    },
    [bulkDelete, createRecord, deleteImpact, deleteRecord, preferences, updateRecord],
  );
  const deepLinkTarget = useMemo(
    () => resolveWorkbenchDeepLinkTarget(location.search, schemas.data ?? []),
    [location.search, schemas.data],
  );
  useEffect(() => {
    if (!deepLinkTarget || consumedDeepLinkKey.current === deepLinkTarget.key) return;
    consumedDeepLinkKey.current = deepLinkTarget.key;
    selectWorkbenchSchema(deepLinkTarget.schema, {
      openCreate: deepLinkTarget.mode === 'create',
    });
  }, [deepLinkTarget, selectWorkbenchSchema]);
  const relationshipRuntime = useMemo(
    () => ({
      schemas: schemas.data ?? [],
      queryScope: [props.runtime.enterpriseCode],
      createRecord: (
        schema: WorkbenchSchema,
        model: Readonly<Record<string, unknown>>,
      ) => {
        const connection = selectModuleConnection(props.bootstrap, schema.moduleName);
        if (!connection) {
          return Promise.reject(new Error('The related schema module is unavailable'));
        }
        return createWorkbenchRecord(connection, schema, model, configuration);
      },
      loadRecords: (schema: WorkbenchSchema) => {
        const connection = selectModuleConnection(props.bootstrap, schema.moduleName);
        if (!connection) {
          return Promise.reject(new Error('The related schema module is unavailable'));
        }
        return loadWorkbenchRecords(connection, schema, configuration, {
          search: '',
          pageNumber: 1,
          pageSize: schema.queryCapabilities.defaultPageSize,
          sort: schema.queryCapabilities.defaultSort,
        }).then((page) => page.records);
      },
      updateRecord: (
        schema: WorkbenchSchema,
        original: Readonly<Record<string, unknown>>,
        model: Readonly<Record<string, unknown>>,
      ) => {
        const connection = selectModuleConnection(props.bootstrap, schema.moduleName);
        if (!connection) {
          return Promise.reject(new Error('The related schema module is unavailable'));
        }
        return updateWorkbenchRecord(
          connection,
          schema,
          original,
          model,
          configuration,
        );
      },
    }),
    [configuration, props.bootstrap, props.runtime.enterpriseCode, schemas.data],
  );

  return (
    <CmsRoutePage
      accessToken={props.accessToken}
      actions={{
        workbench: {
          schemas: schemas.data ?? [],
          schemasError: schemas.error?.message,
          schemasLoading: schemas.isLoading,
          selectedSchema,
          records: records.data?.records ?? [],
          recordSearch: recordSearchInput,
          recordFilters,
          recordPageNumber,
          recordPageSize,
          recordTotalCount: records.data?.totalCount ?? 0,
          recordSort,
          visibleColumns,
          favoriteSchemas: preferences.favoriteSchemas,
          recentSchemas: preferences.recentSchemas,
          selectedRecordKeys,
          savedViews: selectedSchema
            ? (preferences.schemaPreferences[
                schemaPreferenceKey(
                  selectedSchema.moduleName,
                  selectedSchema.schemaName,
                )
              ]?.savedViews ?? [])
            : [],
          recordsError: records.error?.message,
          recordsLoading: records.isLoading,
          createError: createRecord.error?.message,
          creating: createRecord.isPending,
          createOpen,
          relationshipRuntime,
          selectedRecord,
          editOpen,
          updateError: updateRecord.error?.message,
          updating: updateRecord.isPending,
          deleteOpen,
          deleteError: deleteRecord.error?.message ?? deleteImpact.error?.message,
          deleting: deleteRecord.isPending,
          deleteImpact: deleteImpact.data,
          deleteImpactLoading: deleteImpact.isPending,
          bulkDeleteError: bulkDelete.error?.message,
          bulkDeleting: bulkDelete.isPending,
          tenantCode: props.bootstrap.tenantCode,
          enterpriseCode: props.runtime.enterpriseCode,
          selectSchema: selectWorkbenchSchema,
          setRecordSearch: setRecordSearchInput,
          setRecordFilters: (filters) => {
            setRecordPageNumber(1);
            setRecordFilters(filters);
          },
          setRecordPageNumber,
          setRecordPageSize: (pageSize) => {
            setRecordPageNumber(1);
            setRecordPageSize(pageSize);
          },
          setRecordSort: (sort) => {
            setRecordPageNumber(1);
            setRecordSort(sort);
          },
          setVisibleColumns: (columns) => {
            if (!selectedSchema) return;
            const key = schemaPreferenceKey(
              selectedSchema.moduleName,
              selectedSchema.schemaName,
            );
            setVisibleColumns(Object.freeze([...columns]));
            updatePreferences({
              ...preferences,
              schemaPreferences: {
                ...preferences.schemaPreferences,
                [key]: {
                  visibleColumns: Object.freeze([...columns]),
                  savedViews:
                    preferences.schemaPreferences[key]?.savedViews ?? Object.freeze([]),
                },
              },
            });
          },
          toggleFavoriteSchema: (schema) => {
            const key = schemaPreferenceKey(schema.moduleName, schema.schemaName);
            const exists = preferences.favoriteSchemas.includes(key);
            updatePreferences({
              ...preferences,
              favoriteSchemas: Object.freeze(
                exists
                  ? preferences.favoriteSchemas.filter((item) => item !== key)
                  : [key, ...preferences.favoriteSchemas].slice(0, 50),
              ),
            });
          },
          setSelectedRecordKeys: (keys) =>
            setSelectedRecordKeys(Object.freeze([...new Set(keys)])),
          saveView: (view) => {
            if (!selectedSchema) return;
            const key = schemaPreferenceKey(
              selectedSchema.moduleName,
              selectedSchema.schemaName,
            );
            const current = preferences.schemaPreferences[key];
            updatePreferences({
              ...preferences,
              schemaPreferences: {
                ...preferences.schemaPreferences,
                [key]: {
                  visibleColumns,
                  savedViews: Object.freeze(
                    [
                      view,
                      ...(current?.savedViews ?? []).filter(
                        (candidate) => candidate.name !== view.name,
                      ),
                    ].slice(0, 10),
                  ),
                },
              },
            });
          },
          deleteView: (name) => {
            if (!selectedSchema) return;
            const key = schemaPreferenceKey(
              selectedSchema.moduleName,
              selectedSchema.schemaName,
            );
            const current = preferences.schemaPreferences[key];
            updatePreferences({
              ...preferences,
              schemaPreferences: {
                ...preferences.schemaPreferences,
                [key]: {
                  visibleColumns,
                  savedViews: Object.freeze(
                    (current?.savedViews ?? []).filter(
                      (candidate) => candidate.name !== name,
                    ),
                  ),
                },
              },
            });
          },
          applyView: (view: WorkbenchSavedView) => {
            setRecordSearchInput(view.search);
            setRecordSearch(view.search);
            setRecordFilters(view.filters);
            setRecordPageNumber(1);
            setRecordPageSize(view.pageSize);
            setRecordSort(view.sort);
            setVisibleColumns(view.visibleColumns);
            setSelectedRecordKeys([]);
          },
          beginCreate: () => {
            createRecord.reset();
            setCreateOpen(true);
          },
          cancelCreate: () => {
            createRecord.reset();
            setCreateOpen(false);
          },
          createRecord: (model) =>
            createRecord.mutateAsync(model).then(() => undefined),
          selectRecord: (record) => {
            updateRecord.reset();
            deleteRecord.reset();
            setEditOpen(false);
            setSelectedRecord(record);
            setDeleteOpen(false);
          },
          closeRecord: () => {
            updateRecord.reset();
            deleteRecord.reset();
            setEditOpen(false);
            setSelectedRecord(undefined);
            setDeleteOpen(false);
          },
          beginEdit: () => {
            updateRecord.reset();
            setEditOpen(true);
          },
          cancelEdit: () => {
            updateRecord.reset();
            setEditOpen(false);
          },
          updateRecord: (model) =>
            updateRecord.mutateAsync(model).then(() => undefined),
          beginDelete: () => {
            deleteRecord.reset();
            deleteImpact.reset();
            setDeleteOpen(true);
            deleteImpact.mutate();
          },
          cancelDelete: () => {
            deleteRecord.reset();
            setDeleteOpen(false);
          },
          confirmDelete: () => deleteRecord.mutateAsync().then(() => undefined),
          bulkDeleteSelected: () => bulkDelete.mutateAsync().then(() => undefined),
          retryRecords: () => void records.refetch(),
          retrySchemas: () => void schemas.refetch(),
        },
      }}
      channel={props.channel}
      cmsBaseUrl={props.cmsBaseUrl}
      enterpriseCode={props.runtime.enterpriseCode}
      locale={props.locale}
      path="/schema-workbench"
      site={props.site}
      timeoutMs={props.runtime.requestTimeoutMs}
    />
  );
}
