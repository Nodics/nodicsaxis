import { describe, expect, it } from 'vitest';

import type { MediaFolderUploadPolicy } from '../../../src/operations/mediaManagement/api/mediaStoragePolicyClient';
import {
  defaultFormatForSourceType,
  manualUploadSourceTypesForPolicies,
  mediaFormatLabel,
  mediaSourceType,
  moduleForSourceType,
  schemaForSourceType,
  selectPreferredUploadPolicy,
  sourceTypeStorageRouteLabel,
} from '../../../src/operations/mediaManagement/mediaSourceContextPolicy';

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
    expect(defaultFormatForSourceType('Content media', 'cmsAssets')).toBe(
      'contentImage',
    );
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
});
