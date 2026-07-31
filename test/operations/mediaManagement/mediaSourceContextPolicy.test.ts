import { describe, expect, it } from 'vitest';

import type { MediaFolderUploadPolicy } from '../../../src/operations/mediaManagement/api/mediaStoragePolicyClient';
import {
  defaultFormatForSourceType,
  folderCodesForSourceType,
  folderUploadPoliciesFromContexts,
  manualUploadSourceTypesForPolicies,
  mediaFormatLabel,
  mediaSourceTypesForContexts,
  mediaSourceType,
  moduleForSourceType,
  schemaForSourceType,
  selectPreferredUploadPolicy,
  sourceTypeStorageRouteLabel,
  targetRequiredForSourceType,
} from '../../../src/operations/mediaManagement/mediaSourceContextPolicy';
import type { MediaSourceContext } from '../../../src/operations/mediaManagement/api/mediaStoragePolicyClient';

function policy(folderCode: string): MediaFolderUploadPolicy {
  return Object.freeze({
    folderCode,
    label: folderCode,
    access: 'PRIVATE',
    allowedExtensions: Object.freeze(['csv']),
    allowedMimeTypes: Object.freeze(['text/csv']),
    checksumAlgorithm: 'sha256',
    maxFileSizeBytes: 1024,
  });
}

function contextFolder(folderCode: string) {
  return Object.freeze({
    ...policy(folderCode),
    storagePrefix: `media/${folderCode}`,
    retentionDays: 0,
  });
}

const backendContexts: readonly MediaSourceContext[] = Object.freeze([
  Object.freeze({
    code: 'dataImports',
    sourceType: 'Data imports',
    aliases: Object.freeze(['dataImport', 'dataImports', 'importSources']),
    label: 'Data imports',
    description: 'Backend import context',
    folderCodes: Object.freeze(['importSources']),
    defaultFolderCode: 'importSources',
    allowedFolders: Object.freeze([contextFolder('importSources')]),
    allowedFormatCodes: Object.freeze(['importFile']),
    defaultFormatCode: 'importFile',
    defaultModuleName: 'import',
    defaultSchemaName: 'mediaImport',
    targetRequired: true,
    manualUploadEnabled: true,
    storageRouteTemplate: 'data/import/{mediaCode}.{extension}',
  }),
  Object.freeze({
    code: 'dataExports',
    sourceType: 'Data exports',
    aliases: Object.freeze(['dataExport', 'dataExports', 'exportFiles']),
    label: 'Data exports',
    description: 'Backend export context',
    folderCodes: Object.freeze(['exportFiles']),
    defaultFolderCode: 'exportFiles',
    allowedFolders: Object.freeze([contextFolder('exportFiles')]),
    allowedFormatCodes: Object.freeze(['exportFile']),
    defaultFormatCode: 'exportFile',
    defaultModuleName: undefined,
    defaultSchemaName: undefined,
    targetRequired: true,
    manualUploadEnabled: false,
    storageRouteTemplate: 'data/export/{mediaCode}.{extension}',
  }),
  Object.freeze({
    code: 'contentMedia',
    sourceType: 'Content media',
    aliases: Object.freeze(['contentMedia', 'cmsAssets', 'contentAssets']),
    label: 'Content media',
    description: 'Backend content context',
    folderCodes: Object.freeze(['cmsAssets']),
    defaultFolderCode: 'cmsAssets',
    allowedFolders: Object.freeze([contextFolder('cmsAssets')]),
    allowedFormatCodes: Object.freeze(['original', 'desktop']),
    defaultFormatCode: 'original',
    defaultModuleName: 'cms',
    defaultSchemaName: 'cmsComponent',
    targetRequired: false,
    manualUploadEnabled: true,
    storageRouteTemplate: 'media/content/{mediaCode}.{extension}',
  }),
]);

describe('mediaSourceContextPolicy', () => {
  it('maps known backend folder codes to business source types', () => {
    expect(mediaSourceType('importSources')).toBe('Data imports');
    expect(mediaSourceType('exportFiles')).toBe('Data exports');
    expect(mediaSourceType('cmsAssets')).toBe('Content media');
    expect(mediaSourceType('productAssets')).toBe('Product media');
    expect(mediaSourceType('default')).toBe('Utility media');
  });

  it('derives manual upload source types from active backend folder policies', () => {
    const policies = [
      policy('importSources'),
      policy('exportFiles'),
      policy('cmsAssets'),
      policy('productAssets'),
      policy('default'),
    ];

    expect(manualUploadSourceTypesForPolicies(policies)).toEqual([
      'Data imports',
      'Product media',
      'Content media',
      'Utility media',
    ]);
  });

  it('selects preferred folder policies for compatibility aliases', () => {
    const policies = [
      policy('contentAssets'),
      policy('cmsAssets'),
      policy('productAssets'),
    ];

    expect(selectPreferredUploadPolicy(policies, 'Content media')?.folderCode).toBe(
      'cmsAssets',
    );
    expect(defaultFormatForSourceType('Content media', 'cmsAssets')).toBe('original');
    expect(moduleForSourceType('Content media')).toBe('cms');
    expect(schemaForSourceType('Content media')).toBe('cmsComponent');
  });

  it('keeps generated export route visible without enabling manual upload', () => {
    expect(sourceTypeStorageRouteLabel('Data exports')).toContain('data/export');
    expect(defaultFormatForSourceType('Data exports', 'exportFiles')).toBe(
      'exportFile',
    );
    expect(mediaFormatLabel('exportFile')).toBe('Export file');
  });

  it('prefers backend media source contexts when available', () => {
    const policies = folderUploadPoliciesFromContexts(backendContexts);

    expect(mediaSourceType('cmsAssets', backendContexts)).toBe('Content media');
    expect(manualUploadSourceTypesForPolicies(policies, backendContexts)).toEqual([
      'Data imports',
      'Content media',
    ]);
    expect(
      selectPreferredUploadPolicy(policies, 'Content media', backendContexts)
        ?.folderCode,
    ).toBe('cmsAssets');
    expect(
      defaultFormatForSourceType('Content media', 'cmsAssets', backendContexts),
    ).toBe('original');
    expect(moduleForSourceType('Content media', backendContexts)).toBe('cms');
    expect(schemaForSourceType('Content media', backendContexts)).toBe('cmsComponent');
    expect(targetRequiredForSourceType('Data imports', backendContexts)).toBe(true);
    expect(targetRequiredForSourceType('Content media', backendContexts)).toBe(false);
    expect(sourceTypeStorageRouteLabel('Content media', backendContexts)).toBe(
      'media/content/{mediaCode}.{extension}',
    );
    expect(mediaSourceTypesForContexts(backendContexts)).toEqual([
      'Data imports',
      'Data exports',
      'Content media',
    ]);
    expect(folderCodesForSourceType('Content media', backendContexts)).toEqual([
      'cmsAssets',
    ]);
  });

  it('uses backend aliases instead of regex inference when contexts are available', () => {
    expect(mediaSourceType('contentAssets', backendContexts)).toBe('Content media');
    expect(mediaSourceType('cms-unknown', backendContexts)).toBe('Cms Unknown');
    expect(folderCodesForSourceType('contentAssets', backendContexts)).toEqual([
      'cmsAssets',
    ]);
  });
});
