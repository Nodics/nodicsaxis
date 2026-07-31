import { describe, expect, it } from 'vitest';

import {
  resolveWorkbenchRecordSort,
  resolveWorkbenchDeepLinkTarget,
  schemaWithValidQueryCapabilities,
  type WorkbenchDeepLinkTarget,
} from '../../src/workbench/WorkbenchRoutePage';
import type { WorkbenchSchema } from '../../src/workbench/api/workbenchContracts';

function schema(
  moduleName: string,
  schemaName: string,
  operations: WorkbenchSchema['operations'],
): WorkbenchSchema {
  return {
    moduleName,
    schemaName,
    label: schemaName,
    description: '',
    displayProperty: 'code',
    displayProperties: ['code'],
    queryCapabilities: {
      searchableFields: ['code'],
      sortableFields: ['code'],
      filterFields: [],
      groupOperators: ['AND'],
      textOperator: 'CONTAINS',
      allowedPageSizes: [10],
      defaultPageSize: 10,
      maximumPageSize: 10,
      defaultSort: { field: 'code', direction: 'ASC' },
    },
    mutationMode: 'GENERATED_CRUD',
    operations,
    fields: [
      {
        name: 'code',
        label: 'Code',
        type: 'string',
        required: true,
        readOnly: false,
        primary: true,
        description: '',
        searchable: true,
      },
    ],
    relationships: [],
  };
}

function summarize(target: WorkbenchDeepLinkTarget | undefined) {
  if (!target) return undefined;
  return {
    key: target.key,
    mode: target.mode,
    moduleName: target.schema.moduleName,
    schemaName: target.schema.schemaName,
  };
}

describe('resolveWorkbenchDeepLinkTarget', () => {
  it('selects the requested schema from URL parameters', () => {
    expect(
      summarize(
        resolveWorkbenchDeepLinkTarget('?module=media&schema=mediaFolder', [
          schema('media', 'mediaFolder', ['search', 'read']),
        ]),
      ),
    ).toEqual({
      key: 'media:mediaFolder:browse',
      mode: undefined,
      moduleName: 'media',
      schemaName: 'mediaFolder',
    });
  });

  it('opens create mode only when the discovered schema allows create', () => {
    expect(
      summarize(
        resolveWorkbenchDeepLinkTarget('?module=media&schema=mediaFolder&mode=create', [
          schema('media', 'mediaFolder', ['search', 'read', 'create']),
        ]),
      ),
    ).toEqual({
      key: 'media:mediaFolder:create',
      mode: 'create',
      moduleName: 'media',
      schemaName: 'mediaFolder',
    });

    expect(
      summarize(
        resolveWorkbenchDeepLinkTarget('?module=media&schema=mediaFolder&mode=create', [
          schema('media', 'mediaFolder', ['search', 'read']),
        ]),
      ),
    ).toEqual({
      key: 'media:mediaFolder:browse',
      mode: undefined,
      moduleName: 'media',
      schemaName: 'mediaFolder',
    });
  });

  it('ignores unresolved or incomplete deep links', () => {
    expect(
      resolveWorkbenchDeepLinkTarget('?module=media&schema=unknown', [
        schema('media', 'mediaFolder', ['search', 'read']),
      ]),
    ).toBeUndefined();
    expect(
      resolveWorkbenchDeepLinkTarget('?module=media', [
        schema('media', 'mediaFolder', ['search', 'read']),
      ]),
    ).toBeUndefined();
  });
});

describe('resolveWorkbenchRecordSort', () => {
  it('uses a real sortable schema field when default sort points to a missing field', () => {
    const employee = {
      ...schema('profile', 'employee', ['search', 'read']),
      displayProperty: 'employeeId',
      displayProperties: ['employeeId'],
      queryCapabilities: {
        ...schema('profile', 'employee', ['search', 'read']).queryCapabilities,
        sortableFields: ['code', 'employeeId'],
        defaultSort: { field: 'code', direction: 'ASC' as const },
      },
      fields: [
        {
          name: 'employeeId',
          label: 'Employee Id',
          type: 'string' as const,
          required: true,
          readOnly: false,
          primary: true,
          description: '',
          searchable: true,
        },
      ],
    } satisfies WorkbenchSchema;

    expect(resolveWorkbenchRecordSort(employee, undefined)).toEqual({
      field: 'employeeId',
      direction: 'ASC',
    });
    expect(schemaWithValidQueryCapabilities(employee).queryCapabilities).toMatchObject({
      sortableFields: ['employeeId'],
      defaultSort: { field: 'employeeId', direction: 'ASC' },
    });
  });
});
