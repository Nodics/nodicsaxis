export type DataReleaseType = 'init' | 'core' | 'sample';

export type DataReleaseStatus =
  | 'NOT_INSTALLED'
  | 'CURRENT'
  | 'UPDATE_AVAILABLE'
  | 'DOWNGRADE_AVAILABLE'
  | 'INVALID_RELEASE'
  | 'RUNNING'
  | 'FAILED';

export interface DataRelease {
  readonly moduleName: string;
  readonly displayName: string;
  readonly parentModule?: string;
  readonly canonicalIdentity: string;
  readonly dataType: DataReleaseType;
  readonly version: string;
  readonly description: string;
  readonly checksum: string;
  readonly installedVersion?: string;
  readonly installedAt?: string;
  readonly lastAttemptAt?: string;
  readonly lastRunId?: string;
  readonly status: DataReleaseStatus;
}

export interface DataReleasePlan {
  readonly dataType: DataReleaseType;
  readonly modules: readonly string[];
  readonly expectedReleases: Readonly<Record<string, string>>;
}

export interface DataReleaseOperationResult {
  readonly dataType: DataReleaseType;
  readonly tenant: string;
  readonly releases: readonly DataRelease[];
  readonly importRun?: string;
}

export interface ImportRunSummary {
  readonly runId: string;
  readonly status: string;
  readonly dataType?: string;
  readonly modules: readonly string[];
  readonly requestedBy?: string;
  readonly createdAt?: string;
  readonly summary?: ImportRunRecordSummary;
}

export interface ImportRunRecordSummary {
  readonly recordsRead?: number;
  readonly recordsFinalized?: number;
  readonly recordsDispatched?: number;
  readonly recordsSucceeded?: number;
  readonly recordsFailed?: number;
  readonly recordsSkipped?: number;
  readonly validationErrors?: number;
  readonly totalRecordsHandled?: number;
}

export interface ImportDefinitionSummary {
  readonly code: string;
  readonly description: string;
  readonly moduleName: string;
  readonly schemaName?: string;
  readonly indexName?: string;
  readonly operation?: string;
  readonly dataFilePrefix: string;
  readonly allowedExtensions: readonly string[];
}

export interface MediaUploadSummary {
  readonly mediaCode: string;
  readonly name: string;
  readonly originalFileName?: string;
  readonly extension?: string;
  readonly sizeBytes?: number;
  readonly checksum?: string;
  readonly status?: string;
}

export interface MediaImportOperationResult {
  readonly validationOnly: boolean;
  readonly importRun?: ImportRunSummary;
  readonly mediaSource?: MediaUploadSummary;
  readonly importDefinition?: ImportDefinitionSummary;
}

export interface GenericMediaImportRequest {
  readonly mediaCode: string;
  readonly moduleName: string;
  readonly schemaName: string;
  readonly operation: 'saveAll';
}
