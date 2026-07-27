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
}
