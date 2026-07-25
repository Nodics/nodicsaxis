import type {
  WorkbenchFilterGroup,
  WorkbenchRecordQuery,
} from '../api/workbenchContracts';

const storagePrefix = 'nodics-axis:workbench:v1:';
const maximumSchemas = 50;
const maximumViews = 10;
const maximumStoredBytes = 50_000;

export interface WorkbenchSavedView {
  readonly name: string;
  readonly search: string;
  readonly filters?: WorkbenchFilterGroup | undefined;
  readonly pageSize: number;
  readonly sort: WorkbenchRecordQuery['sort'];
  readonly visibleColumns: readonly string[];
}

export interface WorkbenchPreferences {
  readonly favoriteSchemas: readonly string[];
  readonly recentSchemas: readonly string[];
  readonly schemaPreferences: Readonly<
    Record<
      string,
      {
        readonly visibleColumns: readonly string[];
        readonly savedViews: readonly WorkbenchSavedView[];
      }
    >
  >;
}

export interface WorkbenchPreferenceScope {
  readonly employeeId: string;
  readonly tenantCode: string;
  readonly enterpriseCode: string;
}

const emptyPreferences: WorkbenchPreferences = Object.freeze({
  favoriteSchemas: Object.freeze([]),
  recentSchemas: Object.freeze([]),
  schemaPreferences: Object.freeze({}),
});

function safePart(value: string): string {
  return encodeURIComponent(value.trim().slice(0, 128));
}

function storageKey(scope: WorkbenchPreferenceScope): string {
  return `${storagePrefix}${safePart(scope.employeeId)}:${safePart(scope.tenantCode)}:${safePart(scope.enterpriseCode)}`;
}

function stringList(value: unknown, maximum = maximumSchemas): readonly string[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    [
      ...new Set(
        value.filter(
          (item): item is string =>
            typeof item === 'string' && item.length > 0 && item.length <= 260,
        ),
      ),
    ].slice(0, maximum),
  );
}

function savedViews(value: unknown): readonly WorkbenchSavedView[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value
      .filter(
        (item): item is Record<string, unknown> =>
          typeof item === 'object' && item !== null && !Array.isArray(item),
      )
      .flatMap((item) => {
        if (
          typeof item.name !== 'string' ||
          item.name.trim() === '' ||
          item.name.length > 80 ||
          typeof item.search !== 'string' ||
          item.search.length > 100 ||
          !Number.isInteger(item.pageSize) ||
          typeof item.sort !== 'object' ||
          item.sort === null
        ) {
          return [];
        }
        const sort = item.sort as Record<string, unknown>;
        if (
          typeof sort.field !== 'string' ||
          !['ASC', 'DESC'].includes(String(sort.direction))
        ) {
          return [];
        }
        return [
          Object.freeze({
            name: item.name.trim(),
            search: item.search,
            filters: item.filters as WorkbenchFilterGroup | undefined,
            pageSize: Number(item.pageSize),
            sort: {
              field: sort.field,
              direction: sort.direction as 'ASC' | 'DESC',
            },
            visibleColumns: stringList(item.visibleColumns, 50),
          }),
        ];
      })
      .slice(0, maximumViews),
  );
}

export function loadWorkbenchPreferences(
  scope: WorkbenchPreferenceScope,
  storage: Pick<Storage, 'getItem'> = localStorage,
): WorkbenchPreferences {
  try {
    const raw = storage.getItem(storageKey(scope));
    if (!raw || raw.length > maximumStoredBytes) return emptyPreferences;
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      return emptyPreferences;
    }
    const input = value as Record<string, unknown>;
    const schemaInput =
      typeof input.schemaPreferences === 'object' &&
      input.schemaPreferences !== null &&
      !Array.isArray(input.schemaPreferences)
        ? (input.schemaPreferences as Record<string, unknown>)
        : {};
    const schemaPreferences = Object.fromEntries(
      Object.entries(schemaInput)
        .slice(0, maximumSchemas)
        .flatMap(([key, schemaValue]) => {
          if (
            key.length > 260 ||
            typeof schemaValue !== 'object' ||
            schemaValue === null ||
            Array.isArray(schemaValue)
          ) {
            return [];
          }
          const schema = schemaValue as Record<string, unknown>;
          return [
            [
              key,
              Object.freeze({
                visibleColumns: stringList(schema.visibleColumns, 50),
                savedViews: savedViews(schema.savedViews),
              }),
            ],
          ];
        }),
    );
    return Object.freeze({
      favoriteSchemas: stringList(input.favoriteSchemas),
      recentSchemas: stringList(input.recentSchemas),
      schemaPreferences: Object.freeze(schemaPreferences),
    });
  } catch {
    return emptyPreferences;
  }
}

export function saveWorkbenchPreferences(
  scope: WorkbenchPreferenceScope,
  preferences: WorkbenchPreferences,
  storage: Pick<Storage, 'setItem'> = localStorage,
): boolean {
  try {
    const serialized = JSON.stringify(preferences);
    if (serialized.length > maximumStoredBytes) return false;
    storage.setItem(storageKey(scope), serialized);
    return true;
  } catch {
    return false;
  }
}

export function schemaPreferenceKey(moduleName: string, schemaName: string): string {
  return `${moduleName}:${schemaName}`;
}
