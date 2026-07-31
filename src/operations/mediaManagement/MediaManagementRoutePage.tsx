import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router';

import { WorkspaceContainer } from '../../app/shell/ShellPrimitives';
import { ShellIcon } from '../../app/shell/ShellIcon';
import {
  selectModuleConnection,
  type AxisAuthenticatedBootstrap,
  type AxisNavigationItem,
} from '../../bootstrap/publicBootstrap';
import type { AxisRuntimeConfig } from '../../runtime/runtimeConfig';
import {
  loadWorkbenchRecords,
  loadWorkbenchSchemas,
  updateWorkbenchRecord,
  type WorkbenchClientConfiguration,
} from '../../workbench/api/workbenchClient';
import type {
  WorkbenchFilterGroup,
  WorkbenchRecord,
  WorkbenchRecordQuery,
  WorkbenchSchema,
} from '../../workbench/api/workbenchContracts';
import {
  loadMediaFolderUploadPolicies,
  uploadMedia,
  type MediaFolderUploadPolicy,
  type MediaUploadResult,
} from './api/mediaStoragePolicyClient';

interface MediaManagementRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly runtime: AxisRuntimeConfig;
}

interface MediaRecordColumn {
  readonly label: string;
  readonly render: (record: WorkbenchRecord) => ReactNode;
}

interface MediaRecordDetail {
  readonly label: string;
  readonly key: string;
  readonly render?: (record: WorkbenchRecord) => string;
}

interface MediaRecordWorkspaceConfiguration {
  readonly schemaName: string;
  readonly title: string;
  readonly description: string;
  readonly recordCountLabel: string;
  readonly searchPlaceholder: string;
  readonly emptyMessage: string;
  readonly detailEmptyMessage: string;
  readonly hiddenPathNotice?: string;
  readonly searchKeys: readonly string[];
  readonly columns: readonly MediaRecordColumn[];
  readonly details: readonly MediaRecordDetail[];
  readonly summary: (record: WorkbenchRecord) => string;
}

interface MediaRecordFacetFilter {
  readonly allLabel: string;
  readonly key: string;
  readonly label: string;
  readonly optionLabel?: (value: string) => string;
  readonly staticOptions?: readonly string[];
  readonly value: (record: WorkbenchRecord) => string;
}

const sectionSummaries: Readonly<Record<string, string>> = Object.freeze({
  'media-management':
    'Governed entry point for media files, folders, formats, usage, and storage delivery policy.',
  media:
    'Search, inspect, and govern uploaded media records without exposing raw storage paths to the browser.',
  'media-folders':
    'Manage purpose-based media folders such as imports, content assets, product assets, and utilities.',
  'media-sets':
    'Group related media variants, such as product galleries or responsive CMS image sets.',
  'media-formats':
    'Define reusable presentation formats such as thumbnail, desktop, mobile, zoom, or import file.',
  'media-usage':
    'Review which product, content, import, or business records are using a media item.',
  'storage-delivery':
    'Inspect backend-published folder upload policy and delivery behavior for the active runtime.',
});

const presentMediaUploadError = function (error: unknown): string {
  const message = error instanceof Error ? error.message : 'Media upload failed.';
  const prefixSeparator = ': ';
  const knownPrefixes = [
    'Media file policy validation failed',
    'Media upload failed',
    'Media storage policy request failed',
  ];

  for (const prefix of knownPrefixes) {
    if (message.startsWith(`${prefix}${prefixSeparator}`)) {
      const reason = message.slice(prefix.length + prefixSeparator.length).trim();
      return reason || 'The selected file cannot be uploaded.';
    }
  }

  return message;
};

function humanize(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function findCurrentItem(
  items: readonly AxisNavigationItem[],
  pathname: string,
): AxisNavigationItem | undefined {
  return (
    [...items]
      .sort((left, right) => right.route.length - left.route.length)
      .find(
        (item) => pathname === item.route || pathname.startsWith(`${item.route}/`),
      ) ?? items[0]
  );
}

function displayValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) {
    const values = value
      .map((item) => displayValue(item))
      .filter((item) => item !== '—');
    return values.length ? values.join(', ') : '—';
  }
  if (value && typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '—';
    }
  }
  return '—';
}

function textValue(record: WorkbenchRecord | undefined, key: string): string {
  return displayValue(record?.[key]);
}

function numberValue(
  record: WorkbenchRecord | undefined,
  key: string,
): number | undefined {
  const value = record?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function formatBytes(value: number | undefined): string {
  if (value === undefined) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function resolveDeliveryUrl(
  connection: ReturnType<typeof selectModuleConnection>,
  record: WorkbenchRecord,
): string | undefined {
  const accessUrl = record.accessUrl ?? record.url;
  if (typeof accessUrl === 'string' && accessUrl.trim()) {
    if (/^https?:\/\//i.test(accessUrl)) return accessUrl;
    if (connection) {
      const endpoint = new URL(connection.endpoint);
      return new URL(accessUrl, endpoint.origin).toString();
    }
    return accessUrl;
  }
  const code = record.code;
  if (typeof code !== 'string' || !code.trim() || !connection) return undefined;
  return `${connection.endpoint.replace(/\/$/, '')}/v0/content/${encodeURIComponent(code)}`;
}

function isPublicImage(record: WorkbenchRecord): boolean {
  return (
    textValue(record, 'access') === 'PUBLIC' &&
    textValue(record, 'status') === 'READY' &&
    textValue(record, 'mimeType').toLowerCase().startsWith('image/')
  );
}

function isDeliverable(record: WorkbenchRecord): boolean {
  return (
    ['READY', 'CONSUMED'].includes(textValue(record, 'status')) &&
    textValue(record, 'access') === 'PUBLIC'
  );
}

function buildRecordQuery(
  schema: WorkbenchSchema,
  search: string,
  filters?: WorkbenchFilterGroup,
): WorkbenchRecordQuery {
  return Object.freeze({
    search,
    ...(filters ? { filters } : {}),
    pageNumber: 1,
    pageSize: Math.min(25, schema.queryCapabilities.maximumPageSize),
    sort: schema.queryCapabilities.defaultSort,
  });
}

function buildEqualsFilter(field: string, value: string): WorkbenchFilterGroup {
  return Object.freeze({
    operator: 'AND',
    items: Object.freeze([
      Object.freeze({
        field,
        operator: 'EQUALS',
        value,
      }),
    ]),
  });
}

function recordSearchText(
  record: WorkbenchRecord,
  searchKeys: readonly string[],
): string {
  return searchKeys
    .map((key) => displayValue(record[key]))
    .filter((value) => value !== '—')
    .join(' ')
    .toLowerCase();
}

function mediaSummary(record: WorkbenchRecord): string {
  const original = textValue(record, 'originalFileName');
  if (original !== '—') return original;
  const name = textValue(record, 'name');
  if (name !== '—') return name;
  return textValue(record, 'code');
}

const sourceTypeByFolderCode: Readonly<Record<string, string>> = Object.freeze({
  cmsAssets: 'Content media',
  contentMedia: 'Content media',
  contentAssets: 'Content media',
  dataExport: 'Data exports',
  dataExports: 'Data exports',
  dataImport: 'Data imports',
  dataImports: 'Data imports',
  default: 'Utility media',
  exportFiles: 'Data exports',
  exportResults: 'Data exports',
  importSources: 'Data imports',
  productMedia: 'Product media',
  productAssets: 'Product media',
  utilityFiles: 'Utility media',
  utilityMedia: 'Utility media',
});

const governedMediaSourceTypes = Object.freeze([
  'Data imports',
  'Data exports',
  'Product media',
  'Content media',
  'Utility media',
]);

const manualMediaUploadSourceTypes = Object.freeze([
  'Data imports',
  'Product media',
  'Content media',
  'Utility media',
]);

const preferredUploadFolderCodesBySourceType: Readonly<
  Record<string, readonly string[]>
> = Object.freeze({
  'Content media': Object.freeze(['contentMedia', 'cmsAssets', 'contentAssets']),
  'Data imports': Object.freeze(['dataImport', 'dataImports', 'importSources']),
  'Product media': Object.freeze(['productMedia', 'productAssets']),
  'Utility media': Object.freeze(['utilityMedia', 'utilityFiles', 'default']),
});

const formatLabelByCode: Readonly<Record<string, string>> = Object.freeze({
  contentImage: 'Content image',
  exportFile: 'Export file',
  importFile: 'Import file',
  original: 'Original media',
  productGallery: 'Product gallery image',
  productImage: 'Product image',
  thumbnail: 'Thumbnail',
  utilityFile: 'Utility file',
});

function normalizedPolicyCode(value: string): string {
  return value.trim().toLowerCase();
}

function mediaSourceType(folderCode: string): string {
  const normalized = folderCode.trim();
  if (!normalized || normalized === '—') return 'Utility media';
  const mappedSourceType = sourceTypeByFolderCode[normalized];
  if (mappedSourceType) return mappedSourceType;
  if (/import/i.test(normalized)) return 'Data imports';
  if (/export/i.test(normalized)) return 'Data exports';
  if (/product|catalog/i.test(normalized)) return 'Product media';
  if (/content|cms|banner|page/i.test(normalized)) return 'Content media';
  if (/document|kyc|process/i.test(normalized)) return 'Business documents';
  return humanize(normalized);
}

function selectPreferredUploadPolicy(
  policies: readonly MediaFolderUploadPolicy[],
  sourceType: string,
): MediaFolderUploadPolicy | undefined {
  if (!sourceType) return undefined;
  const preferredCodes = preferredUploadFolderCodesBySourceType[sourceType] ?? [];
  const preferredPolicy = preferredCodes
    .map((code) =>
      policies.find(
        (policy) =>
          normalizedPolicyCode(policy.folderCode) === normalizedPolicyCode(code),
      ),
    )
    .find((policy): policy is MediaFolderUploadPolicy => Boolean(policy));
  return (
    preferredPolicy ??
    policies.find((policy) => mediaSourceType(policy.folderCode) === sourceType)
  );
}

function mediaFormatLabel(formatCode: string): string {
  const normalized = formatCode.trim();
  if (!normalized || normalized === '—') return 'Unassigned format';
  return formatLabelByCode[normalized] ?? humanize(normalized);
}

function uniqueSorted(values: readonly string[]): string[] {
  return [...new Set(values.filter((value) => value.trim() && value !== '—'))].sort(
    (left, right) => left.localeCompare(right),
  );
}

function folderSummary(record: WorkbenchRecord): string {
  const name = textValue(record, 'name');
  if (name !== '—') return name;
  return textValue(record, 'code');
}

function formatRetentionDays(record: WorkbenchRecord): string {
  const value = numberValue(record, 'retentionDays');
  if (value === undefined) return '—';
  return `${value} day${value === 1 ? '' : 's'}`;
}

function formatDimensions(record: WorkbenchRecord): string {
  const width = numberValue(record, 'width');
  const height = numberValue(record, 'height');
  if (width === undefined && height === undefined) return '—';
  if (width !== undefined && height !== undefined) return `${width} × ${height} px`;
  if (width !== undefined) return `${width} px wide`;
  return `${height} px high`;
}

function MediaSetEntriesPanel(props: {
  readonly entries: readonly WorkbenchRecord[];
  readonly error: unknown;
  readonly loading: boolean;
  readonly schemaAvailable: boolean;
  readonly setCode: string;
}) {
  const sortedEntries = useMemo(
    () =>
      [...props.entries].sort((left, right) => {
        const leftPosition = numberValue(left, 'position') ?? Number.MAX_SAFE_INTEGER;
        const rightPosition = numberValue(right, 'position') ?? Number.MAX_SAFE_INTEGER;
        return (
          leftPosition - rightPosition ||
          textValue(left, 'variantRole').localeCompare(
            textValue(right, 'variantRole'),
          ) ||
          textValue(left, 'mediaCode').localeCompare(textValue(right, 'mediaCode'))
        );
      }),
    [props.entries],
  );

  return (
    <Stack spacing={1.5}>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h4" variant="h6">
            Set variants
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Media files linked to this set through governed set entries.
          </Typography>
        </Box>
        <Chip label={`${sortedEntries.length} entries`} size="small" />
      </Stack>

      {!props.schemaAvailable ? (
        <Alert severity="warning">
          The authorized media set-entry schema is not available for this employee
          session.
        </Alert>
      ) : props.loading ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary" variant="body2">
            Loading variants for {props.setCode}…
          </Typography>
        </Stack>
      ) : props.error ? (
        <Alert severity="error">
          {props.error instanceof Error
            ? props.error.message
            : 'Media set variants are unavailable.'}
        </Alert>
      ) : sortedEntries.length === 0 ? (
        <Alert severity="info">
          No variants are currently linked to this media set.
        </Alert>
      ) : (
        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            overflowX: 'auto',
          }}
        >
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Media</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Locale</TableCell>
                <TableCell>Dimensions</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedEntries.map((entry) => {
                const code = textValue(entry, 'code');
                return (
                  <TableRow key={code}>
                    <TableCell>{textValue(entry, 'position')}</TableCell>
                    <TableCell sx={{ overflowWrap: 'anywhere' }}>
                      {textValue(entry, 'mediaCode')}
                    </TableCell>
                    <TableCell>{textValue(entry, 'formatCode')}</TableCell>
                    <TableCell>{textValue(entry, 'variantRole')}</TableCell>
                    <TableCell>{textValue(entry, 'localeCode')}</TableCell>
                    <TableCell>{formatDimensions(entry)}</TableCell>
                    <TableCell>
                      <Chip
                        color={
                          textValue(entry, 'status') === 'ACTIVE'
                            ? 'success'
                            : 'default'
                        }
                        label={textValue(entry, 'status')}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Stack>
  );
}

function folderList(values: readonly string[]): string {
  return values.length > 0 ? values.join(', ') : 'Any allowed by backend policy';
}

function StorageDeliveryPolicyPanel(props: {
  readonly connectionAvailable: boolean;
  readonly deliveryBaseUrl: string | undefined;
  readonly error: unknown;
  readonly loading: boolean;
  readonly policies: readonly MediaFolderUploadPolicy[];
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography component="h2" variant="h4">
                Storage and delivery policy
              </Typography>
              <Typography color="text.secondary">
                Read-only view of media upload constraints and delivery entry points.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip
                color={props.connectionAvailable ? 'success' : 'default'}
                label={
                  props.connectionAvailable
                    ? 'Media service connected'
                    : 'Media service unavailable'
                }
              />
              <Chip label="Paths hidden" />
              <Chip label="Provider secrets hidden" />
            </Stack>
          </Stack>

          <Alert severity="info">
            Axis does not resolve storage locations on this screen. The media service
            owns provider selection, key generation, absolute paths, upload validation,
            and delivery authorization.
          </Alert>

          {props.loading ? (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <CircularProgress size={24} />
              <Typography color="text.secondary">
                Loading media folder policy…
              </Typography>
            </Stack>
          ) : props.error ? (
            <Alert severity="error">
              {props.error instanceof Error
                ? props.error.message
                : 'Media storage policy is unavailable.'}
            </Alert>
          ) : !props.connectionAvailable ? (
            <Alert severity="warning">
              The media service is not available in the current BackOffice registry
              response.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, xl: 8 }}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Folder</TableCell>
                        <TableCell>Visibility</TableCell>
                        <TableCell>Extensions</TableCell>
                        <TableCell>MIME types</TableCell>
                        <TableCell>Max size</TableCell>
                        <TableCell>Checksum</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {props.policies.map((policy) => (
                        <TableRow key={policy.folderCode}>
                          <TableCell>
                            <Typography sx={{ fontWeight: 700 }}>
                              {policy.label}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {policy.folderCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip label={humanize(policy.access)} size="small" />
                          </TableCell>
                          <TableCell>{folderList(policy.allowedExtensions)}</TableCell>
                          <TableCell>{folderList(policy.allowedMimeTypes)}</TableCell>
                          <TableCell>{formatBytes(policy.maxFileSizeBytes)}</TableCell>
                          <TableCell>{policy.checksumAlgorithm}</TableCell>
                        </TableRow>
                      ))}
                      {props.policies.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography
                              color="text.secondary"
                              sx={{ py: 3, textAlign: 'center' }}
                            >
                              No folder policy was returned by the media service.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, xl: 4 }}>
                <Box
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    height: '100%',
                    p: 2,
                  }}
                >
                  <Stack spacing={2}>
                    <Box>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: 1.5,
                          textTransform: 'uppercase',
                        }}
                        variant="caption"
                      >
                        Delivery endpoint
                      </Typography>
                      <Typography sx={{ overflowWrap: 'anywhere' }}>
                        {props.deliveryBaseUrl
                          ? `${props.deliveryBaseUrl.replace(/\/$/, '')}/v0/content/{mediaCode}`
                          : '/nodics/media/v0/content/{mediaCode}'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontWeight: 800,
                          letterSpacing: 1.5,
                          textTransform: 'uppercase',
                        }}
                        variant="caption"
                      >
                        What is intentionally hidden
                      </Typography>
                      <Stack component="ul" spacing={1} sx={{ mb: 0, mt: 1, pl: 2.5 }}>
                        <Typography component="li" variant="body2">
                          Local, NAS, or cloud absolute storage paths.
                        </Typography>
                        <Typography component="li" variant="body2">
                          Provider credentials, buckets, certificates, and signed URL
                          secrets.
                        </Typography>
                        <Typography component="li" variant="body2">
                          Resolved write locations, because they belong to upload
                          execution.
                        </Typography>
                      </Stack>
                    </Box>
                    <Alert severity="success">
                      Partners customize storage in media service configuration and
                      provider services. Axis updates automatically when the media
                      service publishes safe policy metadata.
                    </Alert>
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function MediaDeliveryPreviewPanel(props: {
  readonly connection: ReturnType<typeof selectModuleConnection>;
  readonly record: WorkbenchRecord;
}) {
  const deliveryUrl = resolveDeliveryUrl(props.connection, props.record);
  const originalFileName = mediaSummary(props.record);
  const access = textValue(props.record, 'access');
  const status = textValue(props.record, 'status');
  const mimeType = textValue(props.record, 'mimeType');
  const previewable = Boolean(deliveryUrl && isPublicImage(props.record));
  const deliverable = Boolean(deliveryUrl && isDeliverable(props.record));

  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {previewable ? (
        <Box
          component="img"
          src={deliveryUrl}
          alt={originalFileName === '—' ? 'Media preview' : originalFileName}
          sx={{
            bgcolor: 'action.hover',
            display: 'block',
            maxHeight: 260,
            objectFit: 'contain',
            width: '100%',
          }}
        />
      ) : (
        <Box
          sx={{
            bgcolor: 'action.hover',
            p: 3,
            textAlign: 'center',
          }}
        >
          <ShellIcon
            color="action"
            name={mimeType.startsWith('image/') ? 'media' : 'content'}
          />
          <Typography sx={{ mt: 1, fontWeight: 700 }}>
            {mimeType.startsWith('image/')
              ? 'Preview is not available'
              : 'No inline preview for this file type'}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            {access === 'PUBLIC'
              ? 'Use the media delivery action below.'
              : 'This media item is not public. The media service will require signed or private delivery support before Axis can open it directly.'}
          </Typography>
        </Box>
      )}
      <Stack spacing={1.5} sx={{ p: 2 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={`Visibility: ${humanize(access)}`} size="small" />
          <Chip label={`Status: ${status}`} size="small" />
          <Chip label={`MIME: ${mimeType}`} size="small" />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            component="a"
            disabled={!deliverable}
            href={deliverable ? deliveryUrl : undefined}
            rel="noreferrer"
            target="_blank"
            variant="outlined"
          >
            Open through media delivery
          </Button>
          <Button
            component="a"
            disabled={!deliverable}
            download={originalFileName === '—' ? undefined : originalFileName}
            href={deliverable ? deliveryUrl : undefined}
            rel="noreferrer"
            target="_blank"
            variant="text"
          >
            Download
          </Button>
        </Stack>
        {!deliverable ? (
          <Alert severity="info">
            This media item is not currently available for direct browser delivery. The
            media service will reject direct delivery until backend access and lifecycle
            policy allows it.
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}

function acceptFromPolicy(
  policy: MediaFolderUploadPolicy | undefined,
): string | undefined {
  if (!policy) return undefined;
  const mimeTypes = policy.allowedMimeTypes.filter((value) => value !== '*/*');
  const extensions = policy.allowedExtensions.map((value) =>
    value.startsWith('.') ? value : `.${value}`,
  );
  const accept = [...mimeTypes, ...extensions].filter((value) => value.trim());
  return accept.length > 0 ? accept.join(',') : undefined;
}

function normalizedExtension(value: string): string {
  return value.trim().toLowerCase().replace(/^\./, '');
}

function extensionFromFileName(fileName: string): string {
  const name = fileName.trim();
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex < 0 || dotIndex === name.length - 1) return '';
  return normalizedExtension(name.slice(dotIndex + 1));
}

function allowedExtensionLabel(policy: MediaFolderUploadPolicy): string {
  if (policy.allowedExtensions.includes('*')) return 'any backend-approved file';
  return policy.allowedExtensions
    .map((extension) => `.${normalizedExtension(extension)}`)
    .join(', ');
}

function filePolicyIssue(
  policy: MediaFolderUploadPolicy | undefined,
  file: File | undefined,
  sourceType = '',
): string | undefined {
  if (!policy || !file) return undefined;
  const policyScope = sourceType || policy.label;
  const extension = extensionFromFileName(file.name);
  if (!extension) {
    return 'The selected file does not have a file extension. Choose a file with a governed extension for this source type.';
  }
  const allowedExtensions = policy.allowedExtensions.map(normalizedExtension);
  if (
    allowedExtensions.length > 0 &&
    !allowedExtensions.includes('*') &&
    !allowedExtensions.includes(extension)
  ) {
    return `.${extension} files are not allowed for ${policyScope}. Choose ${allowedExtensionLabel(policy)}, or select a different source type.`;
  }
  return undefined;
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

function isTextPreviewFile(file: File): boolean {
  const extension = extensionFromFileName(file.name);
  return (
    file.type.startsWith('text/') ||
    ['csv', 'json', 'js', 'md', 'txt', 'xml'].includes(extension)
  );
}

function defaultFormatForFolder(folderCode: string): string {
  if (['dataImport', 'dataImports', 'importSources'].includes(folderCode)) {
    return 'importFile';
  }
  if (
    ['dataExport', 'dataExports', 'exportFiles', 'exportResults'].includes(folderCode)
  ) {
    return 'exportFile';
  }
  if (['cmsAssets', 'contentAssets', 'contentMedia'].includes(folderCode)) {
    return 'contentImage';
  }
  if (['productAssets', 'productMedia'].includes(folderCode)) return 'productImage';
  if (['default', 'utilityFiles', 'utilityMedia'].includes(folderCode))
    return 'utilityFile';
  return 'original';
}

function defaultFormatForSourceType(sourceType: string, folderCode: string): string {
  if (sourceType === 'Data imports') return 'importFile';
  if (sourceType === 'Data exports') return 'exportFile';
  if (sourceType === 'Product media') return 'productImage';
  if (sourceType === 'Content media') return 'contentImage';
  if (sourceType === 'Utility media') return 'utilityFile';
  return defaultFormatForFolder(folderCode);
}

function moduleForSourceType(sourceType: string): string | undefined {
  if (sourceType === 'Content media') return 'cms';
  if (sourceType === 'Product media') return 'product';
  if (sourceType === 'Data imports') return 'import';
  return undefined;
}

function schemaForSourceType(sourceType: string): string | undefined {
  if (sourceType === 'Content media') return 'cmsComponent';
  if (sourceType === 'Product media') return 'product';
  if (sourceType === 'Data imports') return 'mediaImport';
  return undefined;
}

function mediaReviewType(file: File): string {
  const extension = extensionFromFileName(file.name);
  if (isImageFile(file)) return 'Image preview';
  if (extension === 'csv') return 'CSV data file';
  if (['xls', 'xlsx'].includes(extension)) return 'Spreadsheet workbook';
  if (extension === 'pdf') return 'PDF document';
  if (extension === 'json') return 'JSON document';
  if (isTextPreviewFile(file)) return 'Text file';
  return 'Metadata review';
}

function sourceTypeStorageRouteLabel(sourceType: string): string {
  if (sourceType === 'Data imports') {
    return 'data/import/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}';
  }
  if (sourceType === 'Data exports') {
    return 'data/export/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}';
  }
  if (sourceType === 'Product media') {
    return 'media/product/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}';
  }
  if (sourceType === 'Content media') {
    return 'media/content/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}';
  }
  if (sourceType === 'Utility media') {
    return 'media/utility/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}';
  }
  return 'Select a source type to see backend-routed storage.';
}

function sourceTypeUploadPurpose(sourceType: string): string {
  if (sourceType === 'Data imports') {
    return 'Upload governed files that will later be validated and processed by nImport.';
  }
  if (sourceType === 'Product media') {
    return 'Upload product images, galleries, or product-owned media assets.';
  }
  if (sourceType === 'Content media') {
    return 'Upload CMS and storefront content assets such as banners, icons, and page imagery.';
  }
  if (sourceType === 'Utility media') {
    return 'Upload general governed files that are not owned by product, content, import, or export flows.';
  }
  return 'Choose a source type before selecting a file.';
}

function maxUploadSizeLabel(policy: MediaFolderUploadPolicy | undefined): string {
  return policy?.maxFileSizeBytes
    ? formatBytes(policy.maxFileSizeBytes)
    : 'backend default';
}

function MediaUploadReview(props: {
  readonly file: File;
  readonly policy: MediaFolderUploadPolicy;
  readonly policyIssue: string | undefined;
  readonly sourceType: string;
}) {
  const [textPreview, setTextPreview] = useState<
    { readonly file: File; readonly value: string } | undefined
  >(undefined);
  const [previewError, setPreviewError] = useState<
    { readonly file: File; readonly value: string } | undefined
  >(undefined);
  const imagePreviewUrl = useMemo(
    () => (isImageFile(props.file) ? URL.createObjectURL(props.file) : ''),
    [props.file],
  );

  useEffect(() => {
    if (!imagePreviewUrl) return undefined;
    return () => URL.revokeObjectURL(imagePreviewUrl);
  }, [imagePreviewUrl]);

  useEffect(() => {
    if (isTextPreviewFile(props.file)) {
      let cancelled = false;
      props.file
        .text()
        .then((content) => {
          if (cancelled) return;
          const lines = content.split(/\r?\n/).slice(0, 12).join('\n');
          setTextPreview({
            file: props.file,
            value: lines || 'The selected text file is empty.',
          });
        })
        .catch(() => {
          if (!cancelled) {
            setPreviewError({
              file: props.file,
              value: 'Axis could not read a local text preview for this file.',
            });
          }
        });
      return () => {
        cancelled = true;
      };
    }

    return undefined;
  }, [props.file]);

  const extension = extensionFromFileName(props.file.name);
  const currentTextPreview = textPreview?.file === props.file ? textPreview.value : '';
  const currentPreviewError =
    previewError?.file === props.file ? previewError.value : '';
  const reviewMessage = props.policyIssue
    ? props.policyIssue
    : isImageFile(props.file)
      ? 'Image preview is available before upload. Backend policy still performs final validation.'
      : isTextPreviewFile(props.file)
        ? 'A small local text preview is shown below. Backend import/export processes perform governed content validation.'
        : 'This file type uses metadata review in Axis. Detailed content validation is handled by its owning backend process.';

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: 1,
        borderColor: props.policyIssue ? 'warning.light' : 'divider',
        borderRadius: 2,
        p: 1.5,
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          sx={{ alignItems: { md: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700 }}>Review selected media</Typography>
            <Typography color="text.secondary" variant="body2">
              Confirm the source type, file type, and backend policy before uploading.
            </Typography>
          </Box>
          <Chip
            color={props.policyIssue ? 'warning' : 'success'}
            label={props.policyIssue ? 'Needs correction' : 'Ready for upload'}
            size="small"
          />
        </Stack>

        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip label={`Source type: ${props.sourceType}`} size="small" />
          <Chip label={`Review: ${mediaReviewType(props.file)}`} size="small" />
          <Chip
            label={`Format: ${mediaFormatLabel(defaultFormatForSourceType(props.sourceType, props.policy.folderCode))}`}
            size="small"
          />
          <Chip
            label={`Extension: ${extension ? `.${extension}` : 'missing'}`}
            size="small"
          />
          <Chip label={`Size: ${formatBytes(props.file.size)}`} size="small" />
          <Chip
            label={`Allowed: ${allowedExtensionLabel(props.policy)}`}
            size="small"
          />
        </Stack>

        <Alert severity={props.policyIssue ? 'warning' : 'info'}>{reviewMessage}</Alert>

        {imagePreviewUrl ? (
          <Box
            component="img"
            alt={`Preview of ${props.file.name}`}
            src={imagePreviewUrl}
            sx={{
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              maxHeight: 220,
              maxWidth: '100%',
              objectFit: 'contain',
              p: 1,
            }}
          />
        ) : null}

        {currentTextPreview ? (
          <Box
            component="pre"
            sx={{
              bgcolor: 'action.hover',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1.5,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              m: 0,
              maxHeight: 220,
              overflow: 'auto',
              p: 1.5,
              whiteSpace: 'pre-wrap',
            }}
          >
            {currentTextPreview}
          </Box>
        ) : null}

        {currentPreviewError ? (
          <Alert severity="warning">{currentPreviewError}</Alert>
        ) : null}
      </Stack>
    </Box>
  );
}

function MediaUploadPanel(props: {
  readonly connection: ReturnType<typeof selectModuleConnection>;
  readonly configuration: WorkbenchClientConfiguration;
  readonly error: unknown;
  readonly loading: boolean;
  readonly onUploaded: (media: MediaUploadResult) => void;
  readonly policies: readonly MediaFolderUploadPolicy[];
}) {
  const [selectedSourceType, setSelectedSourceType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File>();
  const uploadablePolicies = useMemo(
    () =>
      props.policies.filter(
        (policy) => mediaSourceType(policy.folderCode) !== 'Data exports',
      ),
    [props.policies],
  );
  const uploadableSourceTypes = useMemo(
    () =>
      manualMediaUploadSourceTypes.filter((sourceType) =>
        Boolean(selectPreferredUploadPolicy(uploadablePolicies, sourceType)),
      ),
    [uploadablePolicies],
  );
  const selectedPolicy = selectPreferredUploadPolicy(
    uploadablePolicies,
    selectedSourceType,
  );
  const selectedFilePolicyIssue = filePolicyIssue(
    selectedPolicy,
    selectedFile,
    selectedSourceType,
  );
  const upload = useMutation({
    mutationFn: () => {
      if (!props.connection) throw new Error('Media service is unavailable.');
      if (!selectedSourceType) throw new Error('Select a media source type first.');
      if (!selectedPolicy) {
        throw new Error(
          'The selected source type does not have an active backend upload policy.',
        );
      }
      if (!selectedFile) throw new Error('Choose a media file before uploading.');
      const policyIssue = filePolicyIssue(
        selectedPolicy,
        selectedFile,
        selectedSourceType,
      );
      if (policyIssue) throw new Error(policyIssue);
      const moduleName = moduleForSourceType(selectedSourceType);
      const schemaName = schemaForSourceType(selectedSourceType);
      return uploadMedia(props.connection, props.configuration, {
        file: selectedFile,
        folderCode: selectedPolicy.folderCode,
        formatCode: defaultFormatForSourceType(
          selectedSourceType,
          selectedPolicy.folderCode,
        ),
        name: selectedFile.name,
        description: `Uploaded from Nodics Axis Media Management as ${selectedSourceType}`,
        ...(moduleName ? { moduleName } : {}),
        ...(schemaName ? { schemaName } : {}),
      });
    },
    onSuccess: (media) => {
      setSelectedFile(undefined);
      props.onUploaded(media);
    },
  });
  const canUpload = Boolean(
    props.connection &&
    selectedPolicy &&
    selectedFile &&
    !selectedFilePolicyIssue &&
    !upload.isPending,
  );

  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{ alignItems: { lg: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography component="h3" variant="h5">
              Upload media
            </Typography>
            <Typography color="text.secondary">
              Store the file through the governed media service first. Axis receives
              only the media code and refreshes this list after upload.
            </Typography>
          </Box>
          <Chip label="Governed upload" />
        </Stack>

        {props.loading ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CircularProgress size={20} />
            <Typography color="text.secondary">Loading folder policy…</Typography>
          </Stack>
        ) : props.error ? (
          <Alert severity="error">
            {props.error instanceof Error
              ? props.error.message
              : 'Media upload policy is unavailable.'}
          </Alert>
        ) : uploadableSourceTypes.length === 0 ? (
          <Alert severity="warning">
            The media service did not publish upload folder policy for this employee
            session.
          </Alert>
        ) : (
          <>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography component="h4" variant="h6">
                      1. Select source type
                    </Typography>
                    <Typography color="text.secondary">
                      Source type tells the backend which governed storage route, folder
                      policy, format, and allowed file types apply.
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    select
                    label="Source type"
                    value={selectedSourceType}
                    helperText="Data exports are generated by the Exports workspace and are not uploaded manually here."
                    onChange={(event) => {
                      setSelectedSourceType(event.target.value);
                      setSelectedFile(undefined);
                      upload.reset();
                    }}
                  >
                    {uploadableSourceTypes.map((sourceType) => (
                      <MenuItem key={sourceType} value={sourceType}>
                        {sourceType}
                      </MenuItem>
                    ))}
                  </TextField>
                  {selectedSourceType ? (
                    <Alert severity="info">
                      {sourceTypeUploadPurpose(selectedSourceType)}
                    </Alert>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography component="h4" variant="h6">
                      2. Review backend policy and select media
                    </Typography>
                    <Typography color="text.secondary">
                      Axis shows the policy before upload. The media service still
                      performs final validation when the file is submitted.
                    </Typography>
                  </Box>

                  {selectedPolicy ? (
                    <Stack spacing={1.5}>
                      <Box
                        sx={{
                          bgcolor: 'background.default',
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          p: 1.5,
                        }}
                      >
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                          <Chip
                            label={`Target route: ${sourceTypeStorageRouteLabel(selectedSourceType)}`}
                            size="small"
                          />
                          <Chip
                            label={`Format: ${mediaFormatLabel(defaultFormatForSourceType(selectedSourceType, selectedPolicy.folderCode))}`}
                            size="small"
                          />
                          <Chip
                            label={`Allowed: ${allowedExtensionLabel(selectedPolicy)}`}
                            size="small"
                          />
                          <Chip
                            label={`Max size: ${maxUploadSizeLabel(selectedPolicy)}`}
                            size="small"
                          />
                        </Stack>
                      </Box>

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ alignItems: { sm: 'center' } }}
                      >
                        <Button
                          component="label"
                          disabled={upload.isPending}
                          variant="outlined"
                        >
                          Choose media
                          <Box
                            component="input"
                            type="file"
                            hidden
                            accept={acceptFromPolicy(selectedPolicy)}
                            onChange={(event) => {
                              setSelectedFile(event.currentTarget.files?.[0]);
                              upload.reset();
                              event.currentTarget.value = '';
                            }}
                          />
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Alert severity="info">
                      Select the source type first. File selection stays disabled until
                      Axis can show the owning backend policy.
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {selectedFile ? (
              <Stack spacing={1}>
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    sx={{
                      alignItems: { sm: 'center' },
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {selectedFile.name}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ flexWrap: 'wrap', mt: 0.5 }}
                      >
                        <Chip
                          label={selectedFile.type || 'Unknown MIME'}
                          size="small"
                        />
                        <Chip label={formatBytes(selectedFile.size)} size="small" />
                        <Chip label="LOCAL SELECTION" size="small" />
                      </Stack>
                    </Box>
                    <IconButton
                      aria-label="Remove selected media upload file"
                      onClick={() => {
                        setSelectedFile(undefined);
                        upload.reset();
                      }}
                    >
                      ×
                    </IconButton>
                  </Stack>
                </Box>
                {selectedPolicy ? (
                  <MediaUploadReview
                    file={selectedFile}
                    policy={selectedPolicy}
                    policyIssue={selectedFilePolicyIssue}
                    sourceType={selectedSourceType}
                  />
                ) : null}
              </Stack>
            ) : selectedPolicy ? (
              <Alert severity="info">
                Choose a media file to review before upload.
              </Alert>
            ) : null}

            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1.5}>
                  <Box>
                    <Typography component="h4" variant="h6">
                      3. Upload governed media
                    </Typography>
                    <Typography color="text.secondary">
                      Upload becomes available only after source type, policy, file, and
                      local review are all valid.
                    </Typography>
                  </Box>
                  <Button
                    disabled={!canUpload}
                    onClick={() => upload.mutate()}
                    sx={{ alignSelf: 'flex-start' }}
                    variant="contained"
                  >
                    Upload to media
                  </Button>
                  {selectedFilePolicyIssue ? (
                    <Alert severity="warning">{selectedFilePolicyIssue}</Alert>
                  ) : null}
                  {upload.error ? (
                    <Alert severity="error">
                      {presentMediaUploadError(upload.error)}
                    </Alert>
                  ) : null}
                  {upload.data ? (
                    <Alert severity="success">
                      Media uploaded as {upload.data.code}. The media record list has
                      been refreshed.
                    </Alert>
                  ) : null}
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
}

function MediaUsageSummaryPanel(props: {
  readonly error: unknown;
  readonly loading: boolean;
  readonly mediaCode: string;
  readonly records: readonly WorkbenchRecord[];
}) {
  const activeCount = props.records.filter(
    (record) => textValue(record, 'status') === 'ACTIVE',
  ).length;
  return (
    <Stack spacing={1.5}>
      <Divider />
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h4" variant="h6">
            Usage
          </Typography>
          <Typography color="text.secondary" variant="body2">
            References recorded by the media service for this media code.
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          size="small"
          to={`/media-management/usage?mediaCode=${encodeURIComponent(props.mediaCode)}`}
          variant="outlined"
        >
          Open usage
        </Button>
      </Stack>
      {props.loading ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary" variant="body2">
            Checking active references…
          </Typography>
        </Stack>
      ) : props.error ? (
        <Alert severity="warning">
          {props.error instanceof Error
            ? props.error.message
            : 'Media usage references are unavailable.'}
        </Alert>
      ) : activeCount > 0 ? (
        <Alert severity="warning">
          This media item has {activeCount} active usage reference
          {activeCount === 1 ? '' : 's'}. Review usage before retiring or replacing it.
        </Alert>
      ) : (
        <Alert severity="success">
          No active usage references were found for this media item.
        </Alert>
      )}
    </Stack>
  );
}

function MediaLifecycleActionsPanel(props: {
  readonly configuration: WorkbenchClientConfiguration;
  readonly connection: ReturnType<typeof selectModuleConnection>;
  readonly mediaSchema: WorkbenchSchema;
  readonly onChanged: () => void;
  readonly record: WorkbenchRecord;
  readonly usageRecords: readonly WorkbenchRecord[];
}) {
  const status = textValue(props.record, 'status');
  const activeUsageCount = props.usageRecords.filter(
    (record) => textValue(record, 'status') === 'ACTIVE',
  ).length;
  const mutation = useMutation({
    mutationFn: (nextStatus: string) =>
      updateWorkbenchRecord(
        props.connection!,
        props.mediaSchema,
        props.record,
        { status: nextStatus },
        props.configuration,
      ),
    onSuccess: () => props.onChanged(),
  });
  const canUpdate =
    Boolean(props.connection) &&
    props.mediaSchema.mutationMode === 'GENERATED_CRUD' &&
    props.mediaSchema.operations.includes('update');
  const retireDisabled =
    !canUpdate ||
    mutation.isPending ||
    activeUsageCount > 0 ||
    ['RETIRED', 'EXPIRED', 'FAILED'].includes(status);
  const restoreDisabled =
    !canUpdate ||
    mutation.isPending ||
    !['RETIRED', 'EXPIRED', 'FAILED'].includes(status);

  return (
    <Stack spacing={1.5}>
      <Divider />
      <Typography component="h4" variant="h6">
        Lifecycle actions
      </Typography>
      {!canUpdate ? (
        <Alert severity="info">
          This employee session does not expose generated update permission for media
          lifecycle changes.
        </Alert>
      ) : activeUsageCount > 0 ? (
        <Alert severity="warning">
          Retire is disabled while this media item has active usage references.
        </Alert>
      ) : null}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button
          color="warning"
          disabled={retireDisabled}
          onClick={() => mutation.mutate('RETIRED')}
          variant="outlined"
        >
          Retire media
        </Button>
        <Button
          disabled={restoreDisabled}
          onClick={() => mutation.mutate('READY')}
          variant="outlined"
        >
          Restore to ready
        </Button>
      </Stack>
      {mutation.error ? (
        <Alert severity="error">
          {mutation.error instanceof Error
            ? mutation.error.message
            : 'Media lifecycle update failed.'}
        </Alert>
      ) : null}
      {mutation.data ? (
        <Alert severity="success">Media lifecycle status was updated.</Alert>
      ) : null}
    </Stack>
  );
}

const recordWorkspaceConfigurations: Readonly<
  Record<string, MediaRecordWorkspaceConfiguration>
> = Object.freeze({
  media: {
    schemaName: 'media',
    title: 'Media records',
    description:
      'Search uploaded and generated media metadata through the authorized media schema contract. Raw storage paths stay hidden from Axis.',
    recordCountLabel: 'records',
    searchPlaceholder: 'Search by code, filename, folder, status, MIME type, or format',
    emptyMessage: 'No media records match the current search.',
    detailEmptyMessage: 'Select a media record to review governed metadata.',
    hiddenPathNotice:
      'Internal full paths are intentionally not displayed. Use media delivery or backend-governed processing APIs for file access.',
    searchKeys: [
      'code',
      'name',
      'originalFileName',
      'folderCode',
      'formatCode',
      'providerCode',
      'access',
      'status',
      'mimeType',
      'extension',
    ],
    summary: mediaSummary,
    columns: [
      {
        label: 'Media',
        render: (record) => (
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{mediaSummary(record)}</Typography>
            <Typography color="text.secondary" variant="body2">
              {textValue(record, 'code')}
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Source type',
        render: (record) => mediaSourceType(textValue(record, 'folderCode')),
      },
      {
        label: 'Format',
        render: (record) => mediaFormatLabel(textValue(record, 'formatCode')),
      },
      {
        label: 'Visibility',
        render: (record) => (
          <Chip label={humanize(textValue(record, 'access'))} size="small" />
        ),
      },
      {
        label: 'Status',
        render: (record) => (
          <Chip
            color={textValue(record, 'status') === 'READY' ? 'success' : 'default'}
            label={textValue(record, 'status')}
            size="small"
          />
        ),
      },
      {
        label: 'Size',
        render: (record) => formatBytes(numberValue(record, 'sizeBytes')),
      },
    ],
    details: [
      { label: 'Folder', key: 'folderCode' },
      { label: 'Format', key: 'formatCode' },
      { label: 'Provider', key: 'providerCode' },
      { label: 'MIME type', key: 'mimeType' },
      { label: 'Extension', key: 'extension' },
      { label: 'Checksum', key: 'checksum' },
      { label: 'Checksum algorithm', key: 'checksumAlgorithm' },
    ],
  },
  'media-folders': {
    schemaName: 'mediaFolder',
    title: 'Media folders',
    description:
      'Review purpose-based folder policy through the media service. Axis shows folder rules but does not decide storage routing.',
    recordCountLabel: 'folders',
    searchPlaceholder:
      'Search by folder code, name, storage prefix, visibility, extension, or MIME policy',
    emptyMessage: 'No media folders match the current search.',
    detailEmptyMessage: 'Select a media folder to review governed folder policy.',
    hiddenPathNotice:
      'Folder storage policy remains backend-owned. Axis shows configured rules, not resolved absolute file locations.',
    searchKeys: [
      'code',
      'name',
      'description',
      'storagePrefix',
      'access',
      'allowedExtensions',
      'allowedMimeTypes',
    ],
    summary: folderSummary,
    columns: [
      {
        label: 'Folder',
        render: (record) => (
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{folderSummary(record)}</Typography>
            <Typography color="text.secondary" variant="body2">
              {textValue(record, 'code')}
            </Typography>
          </Box>
        ),
      },
      {
        label: 'Storage prefix',
        render: (record) => textValue(record, 'storagePrefix'),
      },
      {
        label: 'Visibility',
        render: (record) => (
          <Chip label={humanize(textValue(record, 'access'))} size="small" />
        ),
      },
      {
        label: 'Max size',
        render: (record) => formatBytes(numberValue(record, 'maximumFileSizeBytes')),
      },
      { label: 'Retention', render: formatRetentionDays },
    ],
    details: [
      { label: 'Code', key: 'code' },
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Storage prefix', key: 'storagePrefix' },
      {
        label: 'Visibility',
        key: 'access',
        render: (record) => humanize(textValue(record, 'access')),
      },
      { label: 'Allowed extensions', key: 'allowedExtensions' },
      { label: 'Allowed MIME types', key: 'allowedMimeTypes' },
      {
        label: 'Maximum file size',
        key: 'maximumFileSizeBytes',
        render: (record) => formatBytes(numberValue(record, 'maximumFileSizeBytes')),
      },
      { label: 'Retention', key: 'retentionDays', render: formatRetentionDays },
    ],
  },
  'media-formats': {
    schemaName: 'mediaFormat',
    title: 'Media formats',
    description:
      'Review reusable media presentation and processing formats through the media service, such as original, thumbnail, desktop, mobile, zoom, or import file.',
    recordCountLabel: 'formats',
    searchPlaceholder:
      'Search by format code, name, purpose, description, or dimensions',
    emptyMessage: 'No media formats match the current search.',
    detailEmptyMessage: 'Select a media format to review governed format policy.',
    hiddenPathNotice:
      'Formats describe how media may be presented or processed. They do not store files and do not replace frontend rendering rules.',
    searchKeys: ['code', 'name', 'description', 'purpose', 'width', 'height'],
    summary: folderSummary,
    columns: [
      {
        label: 'Format',
        render: (record) => (
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{folderSummary(record)}</Typography>
            <Typography color="text.secondary" variant="body2">
              {textValue(record, 'code')}
            </Typography>
          </Box>
        ),
      },
      { label: 'Purpose', render: (record) => textValue(record, 'purpose') },
      { label: 'Dimensions', render: formatDimensions },
      { label: 'Description', render: (record) => textValue(record, 'description') },
    ],
    details: [
      { label: 'Code', key: 'code' },
      { label: 'Name', key: 'name' },
      { label: 'Purpose', key: 'purpose' },
      { label: 'Description', key: 'description' },
      { label: 'Dimensions', key: 'width', render: formatDimensions },
      { label: 'Width', key: 'width' },
      { label: 'Height', key: 'height' },
    ],
  },
  'media-sets': {
    schemaName: 'mediaSet',
    title: 'Media sets',
    description:
      'Review logical media groups through the media service, such as product galleries, CMS image groups, documentation assets, or mixed file bundles.',
    recordCountLabel: 'sets',
    searchPlaceholder:
      'Search by set code, name, media type, business purpose, description, or status',
    emptyMessage: 'No media sets match the current search.',
    detailEmptyMessage: 'Select a media set to review governed set metadata.',
    hiddenPathNotice:
      'A media set is a logical grouping record. Variant files are owned by mediaSetEntry records and media items, not by Axis.',
    searchKeys: [
      'code',
      'name',
      'description',
      'mediaType',
      'businessPurpose',
      'status',
    ],
    summary: folderSummary,
    columns: [
      {
        label: 'Media set',
        render: (record) => (
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{folderSummary(record)}</Typography>
            <Typography color="text.secondary" variant="body2">
              {textValue(record, 'code')}
            </Typography>
          </Box>
        ),
      },
      { label: 'Type', render: (record) => textValue(record, 'mediaType') },
      {
        label: 'Business purpose',
        render: (record) => textValue(record, 'businessPurpose'),
      },
      {
        label: 'Status',
        render: (record) => (
          <Chip
            color={textValue(record, 'status') === 'ACTIVE' ? 'success' : 'default'}
            label={textValue(record, 'status')}
            size="small"
          />
        ),
      },
    ],
    details: [
      { label: 'Code', key: 'code' },
      { label: 'Name', key: 'name' },
      { label: 'Description', key: 'description' },
      { label: 'Media type', key: 'mediaType' },
      { label: 'Business purpose', key: 'businessPurpose' },
      { label: 'Status', key: 'status' },
    ],
  },
  'media-usage': {
    schemaName: 'mediaReference',
    title: 'Media usage references',
    description:
      'Search which backend-owned business records reference a media item or media set. The media service records the reference; the owning module keeps business authority.',
    recordCountLabel: 'references',
    searchPlaceholder:
      'Search by owner module, owner schema, owner record, media, media set, relation, or status',
    emptyMessage: 'No media usage references match the current search.',
    detailEmptyMessage:
      'Select a usage reference to review the owning business object.',
    hiddenPathNotice:
      'Usage references are trace records, not ownership transfer. Product, CMS, import, and partner modules remain authoritative for their own records.',
    searchKeys: [
      'code',
      'ownerModule',
      'ownerSchema',
      'ownerCode',
      'mediaCode',
      'mediaSetCode',
      'relationType',
      'status',
    ],
    summary: (record) => {
      const ownerModule = textValue(record, 'ownerModule');
      const ownerSchema = textValue(record, 'ownerSchema');
      const ownerCode = textValue(record, 'ownerCode');
      if (ownerModule !== '—' || ownerSchema !== '—' || ownerCode !== '—') {
        return `${ownerModule}.${ownerSchema} ${ownerCode}`.replace(/\s+—$/, '');
      }
      return textValue(record, 'code');
    },
    columns: [
      {
        label: 'Owner',
        render: (record) => (
          <Box>
            <Typography sx={{ fontWeight: 700 }}>
              {textValue(record, 'ownerCode')}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {textValue(record, 'ownerModule')} / {textValue(record, 'ownerSchema')}
            </Typography>
          </Box>
        ),
      },
      { label: 'Relation', render: (record) => textValue(record, 'relationType') },
      {
        label: 'Media',
        render: (record) => {
          const mediaCode = textValue(record, 'mediaCode');
          return mediaCode === '—' ? textValue(record, 'mediaSetCode') : mediaCode;
        },
      },
      { label: 'Position', render: (record) => textValue(record, 'position') },
      {
        label: 'Status',
        render: (record) => (
          <Chip
            color={textValue(record, 'status') === 'ACTIVE' ? 'success' : 'default'}
            label={textValue(record, 'status')}
            size="small"
          />
        ),
      },
    ],
    details: [
      { label: 'Reference code', key: 'code' },
      { label: 'Owner module', key: 'ownerModule' },
      { label: 'Owner schema', key: 'ownerSchema' },
      { label: 'Owner record', key: 'ownerCode' },
      { label: 'Media item', key: 'mediaCode' },
      { label: 'Media set', key: 'mediaSetCode' },
      { label: 'Relation type', key: 'relationType' },
      { label: 'Position', key: 'position' },
      { label: 'Status', key: 'status' },
    ],
  },
});

const emptyFacetFilters: readonly MediaRecordFacetFilter[] = Object.freeze([]);

const recordWorkspaceFacetFilters: Readonly<
  Record<string, readonly MediaRecordFacetFilter[]>
> = Object.freeze({
  media: [
    {
      allLabel: 'All source types',
      key: 'sourceType',
      label: 'Source type',
      staticOptions: governedMediaSourceTypes,
      value: (record) => mediaSourceType(textValue(record, 'folderCode')),
    },
  ],
  'media-folders': [
    {
      allLabel: 'All source types',
      key: 'sourceType',
      label: 'Source type',
      value: (record) => mediaSourceType(textValue(record, 'code')),
    },
    {
      allLabel: 'All visibility rules',
      key: 'access',
      label: 'Visibility',
      optionLabel: humanize,
      value: (record) => textValue(record, 'access'),
    },
    {
      allLabel: 'All storage prefixes',
      key: 'storagePrefix',
      label: 'Storage prefix',
      optionLabel: humanize,
      value: (record) => textValue(record, 'storagePrefix'),
    },
  ],
  'media-formats': [
    {
      allLabel: 'All purposes',
      key: 'purpose',
      label: 'Purpose',
      optionLabel: humanize,
      value: (record) => textValue(record, 'purpose'),
    },
    {
      allLabel: 'All dimensions',
      key: 'dimensions',
      label: 'Dimensions',
      value: formatDimensions,
    },
  ],
  'media-sets': [
    {
      allLabel: 'All media types',
      key: 'mediaType',
      label: 'Media type',
      optionLabel: humanize,
      value: (record) => textValue(record, 'mediaType'),
    },
    {
      allLabel: 'All business purposes',
      key: 'businessPurpose',
      label: 'Business purpose',
      optionLabel: humanize,
      value: (record) => textValue(record, 'businessPurpose'),
    },
    {
      allLabel: 'All statuses',
      key: 'status',
      label: 'Status',
      optionLabel: humanize,
      value: (record) => textValue(record, 'status'),
    },
  ],
  'media-usage': [
    {
      allLabel: 'All owner modules',
      key: 'ownerModule',
      label: 'Owner module',
      optionLabel: humanize,
      value: (record) => textValue(record, 'ownerModule'),
    },
    {
      allLabel: 'All owner schemas',
      key: 'ownerSchema',
      label: 'Owner schema',
      optionLabel: humanize,
      value: (record) => textValue(record, 'ownerSchema'),
    },
    {
      allLabel: 'All relations',
      key: 'relationType',
      label: 'Relation',
      optionLabel: humanize,
      value: (record) => textValue(record, 'relationType'),
    },
    {
      allLabel: 'All statuses',
      key: 'status',
      label: 'Status',
      optionLabel: humanize,
      value: (record) => textValue(record, 'status'),
    },
  ],
});

export function MediaManagementRoutePage(props: MediaManagementRoutePageProps) {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [recordSearch, setRecordSearch] = useState('');
  const [recordFacetFilters, setRecordFacetFilters] = useState<Record<string, string>>(
    {},
  );
  const [recordPage, setRecordPage] = useState(0);
  const [recordRowsPerPage, setRecordRowsPerPage] = useState(10);
  const [selectedRecordCode, setSelectedRecordCode] = useState<string>();
  const connection = selectModuleConnection(props.bootstrap, 'media');
  const usageMediaCode =
    new URLSearchParams(location.search).get('mediaCode')?.trim() ?? '';
  const configuration: WorkbenchClientConfiguration = useMemo(
    () => ({
      accessToken: props.accessToken,
      enterpriseCode: props.runtime.enterpriseCode,
      timeoutMs: props.runtime.requestTimeoutMs,
    }),
    [props.accessToken, props.runtime.enterpriseCode, props.runtime.requestTimeoutMs],
  );
  const mediaNavigation = useMemo(
    () =>
      props.bootstrap.navigation
        .filter((item) => item.moduleName === 'media')
        .filter((item) => item.route.startsWith('/media-management'))
        .sort((left, right) => left.order - right.order),
    [props.bootstrap.navigation],
  );
  const currentItem = findCurrentItem(mediaNavigation, location.pathname);
  const childItems = mediaNavigation.filter(
    (item) => item.parentId === 'media-management',
  );
  const recordWorkspaceConfiguration = currentItem
    ? recordWorkspaceConfigurations[currentItem.id]
    : undefined;
  const currentFacetFilters = currentItem
    ? (recordWorkspaceFacetFilters[currentItem.id] ?? emptyFacetFilters)
    : emptyFacetFilters;
  const facetStateKey = (key: string) => `${currentItem?.id ?? 'none'}:${key}`;
  const schemas = useQuery({
    enabled: Boolean(recordWorkspaceConfiguration && connection),
    queryKey: ['media-management', 'schemas', connection?.endpoint],
    queryFn: () => loadWorkbenchSchemas(connection ? [connection] : [], configuration),
  });
  const currentSchema = useMemo(
    () =>
      schemas.data?.find(
        (schema) =>
          schema.moduleName === 'media' &&
          schema.schemaName === recordWorkspaceConfiguration?.schemaName,
      ),
    [recordWorkspaceConfiguration?.schemaName, schemas.data],
  );
  const mediaSetEntrySchema = useMemo(
    () =>
      schemas.data?.find(
        (schema) =>
          schema.moduleName === 'media' && schema.schemaName === 'mediaSetEntry',
      ),
    [schemas.data],
  );
  const mediaReferenceSchema = useMemo(
    () =>
      schemas.data?.find(
        (schema) =>
          schema.moduleName === 'media' && schema.schemaName === 'mediaReference',
      ),
    [schemas.data],
  );
  const currentRecordFilter =
    currentItem?.id === 'media-usage' && usageMediaCode
      ? buildEqualsFilter('mediaCode', usageMediaCode)
      : undefined;
  const records = useQuery({
    enabled: Boolean(recordWorkspaceConfiguration && connection && currentSchema),
    queryKey: [
      'media-management',
      recordWorkspaceConfiguration?.schemaName,
      connection?.endpoint,
      currentSchema?.schemaName,
      recordSearch.trim(),
      usageMediaCode,
    ],
    queryFn: () =>
      loadWorkbenchRecords(
        connection!,
        currentSchema!,
        configuration,
        buildRecordQuery(currentSchema!, recordSearch.trim(), currentRecordFilter),
      ),
  });
  const loadedRecords = useMemo(
    () => records.data?.records ?? [],
    [records.data?.records],
  );
  const facetFilterOptions = useMemo(
    () =>
      currentFacetFilters
        .map((filter) => {
          const dynamicOptions = uniqueSorted(
            loadedRecords
              .map((record) => filter.value(record))
              .filter((value) => value && value !== '—'),
          );
          const options = uniqueSorted([
            ...(filter.staticOptions ?? []),
            ...dynamicOptions,
          ]);
          return {
            filter,
            options,
          };
        })
        .filter(({ options }) => options.length > 0),
    [currentFacetFilters, loadedRecords],
  );
  const mediaSourceFacetOption =
    currentItem?.id === 'media'
      ? facetFilterOptions.find(({ filter }) => filter.key === 'sourceType')
      : undefined;
  const hasActiveFacetFilters = useMemo(
    () =>
      currentFacetFilters.some((filter) => {
        const value = recordFacetFilters[`${currentItem?.id ?? 'none'}:${filter.key}`];
        return Boolean(value && value !== 'ALL');
      }),
    [currentFacetFilters, currentItem?.id, recordFacetFilters],
  );
  const filteredRecords = useMemo(() => {
    const normalizedSearch = recordSearch.trim().toLowerCase();
    return loadedRecords.filter((record) => {
      if (
        normalizedSearch &&
        !recordSearchText(
          record,
          recordWorkspaceConfiguration?.searchKeys ?? [],
        ).includes(normalizedSearch)
      ) {
        return false;
      }
      return currentFacetFilters.every((filter) => {
        const selectedValue =
          recordFacetFilters[`${currentItem?.id ?? 'none'}:${filter.key}`] ?? 'ALL';
        return selectedValue === 'ALL' || filter.value(record) === selectedValue;
      });
    });
  }, [
    currentFacetFilters,
    currentItem?.id,
    loadedRecords,
    recordFacetFilters,
    recordSearch,
    recordWorkspaceConfiguration?.searchKeys,
  ]);
  const effectiveRecordPage =
    filteredRecords.length === 0
      ? 0
      : Math.min(
          recordPage,
          Math.floor((filteredRecords.length - 1) / recordRowsPerPage),
        );
  const pagedRecords = useMemo(
    () =>
      filteredRecords.slice(
        effectiveRecordPage * recordRowsPerPage,
        effectiveRecordPage * recordRowsPerPage + recordRowsPerPage,
      ),
    [effectiveRecordPage, filteredRecords, recordRowsPerPage],
  );
  const selectedRecord = useMemo(
    () =>
      filteredRecords.find(
        (record) =>
          typeof record.code === 'string' && record.code === selectedRecordCode,
      ) ?? filteredRecords[0],
    [filteredRecords, selectedRecordCode],
  );
  const selectedMediaSetCode =
    currentItem?.id === 'media-sets' ? textValue(selectedRecord, 'code') : '—';
  const selectedMediaCode =
    currentItem?.id === 'media' ? textValue(selectedRecord, 'code') : '—';
  const selectedMediaUsage = useQuery({
    enabled: Boolean(
      currentItem?.id === 'media' &&
      connection &&
      mediaReferenceSchema &&
      selectedMediaCode !== '—',
    ),
    queryKey: [
      'media-management',
      'selected-media-usage',
      connection?.endpoint,
      selectedMediaCode,
    ],
    queryFn: () =>
      loadWorkbenchRecords(
        connection!,
        mediaReferenceSchema!,
        configuration,
        buildRecordQuery(
          mediaReferenceSchema!,
          '',
          buildEqualsFilter('mediaCode', selectedMediaCode),
        ),
      ),
  });
  const mediaSetEntries = useQuery({
    enabled: Boolean(
      currentItem?.id === 'media-sets' &&
      connection &&
      mediaSetEntrySchema &&
      selectedMediaSetCode !== '—',
    ),
    queryKey: [
      'media-management',
      'media-set-entries',
      connection?.endpoint,
      selectedMediaSetCode,
    ],
    queryFn: () =>
      loadWorkbenchRecords(
        connection!,
        mediaSetEntrySchema!,
        configuration,
        buildRecordQuery(
          mediaSetEntrySchema!,
          '',
          buildEqualsFilter('mediaSetCode', selectedMediaSetCode),
        ),
      ),
  });
  const storagePolicies = useQuery({
    enabled: Boolean(
      (currentItem?.id === 'storage-delivery' || currentItem?.id === 'media') &&
      connection,
    ),
    queryKey: [
      'media-management',
      'storage-delivery',
      connection?.endpoint,
      configuration.enterpriseCode,
    ],
    queryFn: () => loadMediaFolderUploadPolicies(connection!, configuration),
  });
  const refreshMediaRecords = (uploaded?: MediaUploadResult) => {
    if (uploaded) setSelectedRecordCode(uploaded.code);
    void queryClient.invalidateQueries({ queryKey: ['media-management'] });
  };

  if (!currentItem) {
    return (
      <WorkspaceContainer>
        <Alert severity="warning">
          Media Management navigation is not available for this employee session.
        </Alert>
      </WorkspaceContainer>
    );
  }

  return (
    <WorkspaceContainer>
      <Stack spacing={3}>
        <Box>
          <Typography
            color="text.secondary"
            sx={{ fontWeight: 800, letterSpacing: 4, textTransform: 'uppercase' }}
            variant="overline"
          >
            Governed media operations
          </Typography>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Typography component="h1" variant="h2">
                Media Management
              </Typography>
              <Typography color="text.secondary" variant="body1">
                Manage media lifecycle, references, formats, and storage delivery
                through backend-owned media contracts.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
              <Chip
                color={connection ? 'success' : 'default'}
                label={connection ? connection.state : 'Unavailable'}
              />
              <Chip label={`Enterprise: ${humanize(props.runtime.enterpriseCode)}`} />
            </Stack>
          </Stack>
        </Box>

        {currentItem.id === 'media-management' ? (
          <Grid container spacing={2}>
            {childItems.map((item) => {
              const workspace = recordWorkspaceConfigurations[item.id];
              return (
                <Grid key={item.id} size={{ xs: 12, md: 6, xl: 4 }}>
                  <Card
                    component={RouterLink}
                    to={item.route}
                    variant="outlined"
                    sx={{
                      color: 'inherit',
                      display: 'block',
                      height: '100%',
                      textDecoration: 'none',
                      transition:
                        'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 3,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: 'flex-start' }}
                        >
                          <ShellIcon color="primary" name={item.icon} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography component="h2" variant="h5">
                              {item.label}
                            </Typography>
                            <Typography color="text.secondary" variant="body2">
                              {sectionSummaries[item.id] ??
                                'Manage this governed media capability.'}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                          {workspace?.schemaName ? (
                            <Chip
                              label={`Schema: ${humanize(workspace.schemaName)}`}
                              size="small"
                            />
                          ) : (
                            <Chip label="Storage policy" size="small" />
                          )}
                          <Chip label="Backend governed" size="small" />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : null}

        {recordWorkspaceConfiguration ? (
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={2.5}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  sx={{ alignItems: { md: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography component="h2" variant="h4">
                      {recordWorkspaceConfiguration.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {recordWorkspaceConfiguration.description}
                    </Typography>
                  </Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: 'center',
                      flexShrink: 0,
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'flex-start', md: 'flex-end' },
                    }}
                  >
                    <Chip
                      label={`${records.data?.totalCount ?? 0} ${recordWorkspaceConfiguration.recordCountLabel}`}
                    />
                    <Chip
                      color={connection ? 'success' : 'default'}
                      label={
                        connection
                          ? 'Media service connected'
                          : 'Media service unavailable'
                      }
                    />
                  </Stack>
                </Stack>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { md: 'center' } }}
                >
                  <TextField
                    fullWidth
                    placeholder={recordWorkspaceConfiguration.searchPlaceholder}
                    value={recordSearch}
                    onChange={(event) => {
                      setSelectedRecordCode(undefined);
                      setRecordPage(0);
                      setRecordSearch(event.target.value);
                    }}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <ShellIcon color="action" name="search" />
                          </InputAdornment>
                        ),
                        endAdornment: recordSearch ? (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={`Clear ${recordWorkspaceConfiguration.title.toLowerCase()} search`}
                              edge="end"
                              onClick={() => {
                                setSelectedRecordCode(undefined);
                                setRecordPage(0);
                                setRecordSearch('');
                              }}
                            >
                              ×
                            </IconButton>
                          </InputAdornment>
                        ) : undefined,
                      },
                    }}
                  />
                  {mediaSourceFacetOption ? (
                    <TextField
                      label={mediaSourceFacetOption.filter.label}
                      select
                      sx={{ minWidth: { xs: '100%', md: 280 } }}
                      value={
                        recordFacetFilters[
                          facetStateKey(mediaSourceFacetOption.filter.key)
                        ] ?? 'ALL'
                      }
                      onChange={(event) => {
                        setSelectedRecordCode(undefined);
                        setRecordPage(0);
                        setRecordFacetFilters((current) => ({
                          ...current,
                          [facetStateKey(mediaSourceFacetOption.filter.key)]:
                            event.target.value,
                        }));
                      }}
                    >
                      <MenuItem value="ALL">
                        {mediaSourceFacetOption.filter.allLabel}
                      </MenuItem>
                      {mediaSourceFacetOption.options.map((option) => (
                        <MenuItem key={option} value={option}>
                          {mediaSourceFacetOption.filter.optionLabel
                            ? mediaSourceFacetOption.filter.optionLabel(option)
                            : option}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : null}
                </Stack>

                {currentFacetFilters.length > 0 && !mediaSourceFacetOption ? (
                  <Box
                    sx={{
                      backgroundColor: 'background.default',
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 2,
                      p: 2,
                    }}
                  >
                    <Stack spacing={1.5}>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1.5}
                        sx={{
                          alignItems: { md: 'center' },
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography component="h3" variant="h6">
                            Filter {recordWorkspaceConfiguration.title.toLowerCase()}
                          </Typography>
                          <Typography color="text.secondary" variant="body2">
                            Narrow this workspace by source type. Search still covers
                            code, filename, folder, status, MIME type, and format.
                          </Typography>
                        </Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                        >
                          <Chip
                            label={`${filteredRecords.length} shown from ${records.data?.totalCount ?? loadedRecords.length}`}
                            size="small"
                          />
                          <Button
                            disabled={!recordSearch.trim() && !hasActiveFacetFilters}
                            size="small"
                            variant="text"
                            onClick={() => {
                              setSelectedRecordCode(undefined);
                              setRecordPage(0);
                              setRecordSearch('');
                              setRecordFacetFilters({});
                            }}
                          >
                            Reset filters
                          </Button>
                        </Stack>
                      </Stack>
                      <Grid container spacing={1.5}>
                        {facetFilterOptions.map(({ filter, options }) => (
                          <Grid
                            key={filter.key}
                            size={{
                              xs: 12,
                              md: 4,
                              lg: facetFilterOptions.length > 4 ? 2.4 : 3,
                            }}
                          >
                            <TextField
                              fullWidth
                              label={filter.label}
                              select
                              size="small"
                              value={
                                recordFacetFilters[facetStateKey(filter.key)] ?? 'ALL'
                              }
                              onChange={(event) => {
                                setSelectedRecordCode(undefined);
                                setRecordPage(0);
                                setRecordFacetFilters((current) => ({
                                  ...current,
                                  [facetStateKey(filter.key)]: event.target.value,
                                }));
                              }}
                            >
                              <MenuItem value="ALL">{filter.allLabel}</MenuItem>
                              {options.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {filter.optionLabel
                                    ? filter.optionLabel(option)
                                    : option}
                                </MenuItem>
                              ))}
                            </TextField>
                          </Grid>
                        ))}
                      </Grid>
                      <Typography color="text.secondary" variant="caption">
                        Filters are presentation helpers only. The selected workspace
                        still reads records through the owning backend schema contract.
                      </Typography>
                    </Stack>
                  </Box>
                ) : null}

                {currentItem.id === 'media' ? (
                  <MediaUploadPanel
                    connection={connection}
                    configuration={configuration}
                    error={storagePolicies.error}
                    loading={storagePolicies.isLoading}
                    policies={storagePolicies.data ?? []}
                    onUploaded={refreshMediaRecords}
                  />
                ) : null}

                {currentItem.id === 'media-usage' && usageMediaCode ? (
                  <Alert
                    action={
                      <Button
                        component={RouterLink}
                        size="small"
                        to="/media-management/usage"
                        variant="text"
                      >
                        Clear usage filter
                      </Button>
                    }
                    severity="info"
                  >
                    Showing references for media code {usageMediaCode}. Search can still
                    narrow this filtered result set.
                  </Alert>
                ) : null}

                {schemas.isLoading || records.isLoading ? (
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography color="text.secondary">
                      Loading {recordWorkspaceConfiguration.title.toLowerCase()}…
                    </Typography>
                  </Stack>
                ) : schemas.error || records.error ? (
                  <Alert severity="error">
                    {schemas.error instanceof Error
                      ? schemas.error.message
                      : records.error instanceof Error
                        ? records.error.message
                        : `${recordWorkspaceConfiguration.title} are unavailable.`}
                  </Alert>
                ) : !currentSchema ? (
                  <Alert severity="warning">
                    The authorized {recordWorkspaceConfiguration.schemaName} media
                    schema is not available for this employee session.
                  </Alert>
                ) : (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, xl: 8 }}>
                      <Box
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              {recordWorkspaceConfiguration.columns.map((column) => (
                                <TableCell key={column.label}>{column.label}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {pagedRecords.map((record) => {
                              const code = textValue(record, 'code');
                              const selected =
                                code !== '—' &&
                                code === textValue(selectedRecord, 'code');
                              return (
                                <TableRow
                                  hover
                                  key={code}
                                  selected={selected}
                                  sx={{ cursor: 'pointer' }}
                                  onClick={() => {
                                    setSelectedRecordCode(
                                      code === '—' ? undefined : code,
                                    );
                                  }}
                                >
                                  {recordWorkspaceConfiguration.columns.map(
                                    (column) => (
                                      <TableCell key={column.label}>
                                        {column.render(record)}
                                      </TableCell>
                                    ),
                                  )}
                                </TableRow>
                              );
                            })}
                            {filteredRecords.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={recordWorkspaceConfiguration.columns.length}
                                >
                                  <Typography
                                    color="text.secondary"
                                    sx={{ py: 3, textAlign: 'center' }}
                                  >
                                    {recordWorkspaceConfiguration.emptyMessage}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </TableBody>
                        </Table>
                        <TablePagination
                          component="div"
                          count={filteredRecords.length}
                          page={effectiveRecordPage}
                          rowsPerPage={recordRowsPerPage}
                          rowsPerPageOptions={[10, 25, 50]}
                          onPageChange={(_event, page) => {
                            setRecordPage(page);
                          }}
                          onRowsPerPageChange={(event) => {
                            setRecordRowsPerPage(
                              Number.parseInt(event.target.value, 10),
                            );
                            setRecordPage(0);
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, xl: 4 }}>
                      <Box
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          height: '100%',
                          p: 2,
                        }}
                      >
                        {selectedRecord ? (
                          <Stack spacing={2}>
                            <Box>
                              <Typography component="h3" variant="h5">
                                {recordWorkspaceConfiguration.summary(selectedRecord)}
                              </Typography>
                              <Typography color="text.secondary">
                                {textValue(selectedRecord, 'code')}
                              </Typography>
                            </Box>
                            <Divider />
                            {currentItem.id === 'media' ? (
                              <MediaDeliveryPreviewPanel
                                connection={connection}
                                record={selectedRecord}
                              />
                            ) : null}
                            {currentItem.id === 'media' && selectedMediaCode !== '—' ? (
                              <MediaUsageSummaryPanel
                                error={selectedMediaUsage.error}
                                loading={selectedMediaUsage.isLoading}
                                mediaCode={selectedMediaCode}
                                records={selectedMediaUsage.data?.records ?? []}
                              />
                            ) : null}
                            {currentItem.id === 'media' && currentSchema ? (
                              <MediaLifecycleActionsPanel
                                configuration={configuration}
                                connection={connection}
                                mediaSchema={currentSchema}
                                record={selectedRecord}
                                usageRecords={selectedMediaUsage.data?.records ?? []}
                                onChanged={() => {
                                  void records.refetch();
                                  void selectedMediaUsage.refetch();
                                }}
                              />
                            ) : null}
                            {recordWorkspaceConfiguration.details.map((detail) => (
                              <Box key={detail.key}>
                                <Typography
                                  color="text.secondary"
                                  sx={{
                                    fontWeight: 800,
                                    letterSpacing: 1.5,
                                    textTransform: 'uppercase',
                                  }}
                                  variant="caption"
                                >
                                  {detail.label}
                                </Typography>
                                <Typography sx={{ overflowWrap: 'anywhere' }}>
                                  {detail.render
                                    ? detail.render(selectedRecord)
                                    : textValue(selectedRecord, detail.key)}
                                </Typography>
                              </Box>
                            ))}
                            {recordWorkspaceConfiguration.hiddenPathNotice ? (
                              <Alert severity="info">
                                {recordWorkspaceConfiguration.hiddenPathNotice}
                              </Alert>
                            ) : null}
                            {currentItem.id === 'media-sets' ? (
                              <MediaSetEntriesPanel
                                entries={mediaSetEntries.data?.records ?? []}
                                error={mediaSetEntries.error}
                                loading={mediaSetEntries.isLoading}
                                schemaAvailable={Boolean(mediaSetEntrySchema)}
                                setCode={selectedMediaSetCode}
                              />
                            ) : null}
                          </Stack>
                        ) : (
                          <Typography color="text.secondary">
                            {recordWorkspaceConfiguration.detailEmptyMessage}
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                )}
              </Stack>
            </CardContent>
          </Card>
        ) : null}

        {currentItem.id === 'storage-delivery' ? (
          <StorageDeliveryPolicyPanel
            connectionAvailable={Boolean(connection)}
            deliveryBaseUrl={connection?.endpoint}
            error={storagePolicies.error}
            loading={storagePolicies.isLoading}
            policies={storagePolicies.data ?? []}
          />
        ) : null}
      </Stack>
    </WorkspaceContainer>
  );
}
