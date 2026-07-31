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
  WorkbenchFilterCondition,
  WorkbenchFilterGroup,
  WorkbenchRecord,
  WorkbenchRecordQuery,
  WorkbenchSchema,
} from '../../workbench/api/workbenchContracts';
import {
  loadMediaSourceContexts,
  loadMediaFolderUploadPolicies,
  type MediaFolderUploadPolicy,
  type MediaSourceContext,
  type MediaUploadResult,
} from './api/mediaStoragePolicyClient';
import { MediaUploadWizard } from './components/MediaUploadWizard';
import {
  defaultFormatForSourceType,
  folderCodesForSourceType,
  folderUploadPoliciesFromContexts,
  governedMediaSourceTypes,
  mediaFormatLabel,
  mediaSourceTypesForContexts,
  mediaSourceType,
} from './mediaSourceContextPolicy';

interface MediaManagementRoutePageProps {
  readonly accessToken: string;
  readonly bootstrap: AxisAuthenticatedBootstrap;
  readonly runtime: AxisRuntimeConfig;
}

interface MediaRecordColumn {
  readonly label: string;
  readonly render: (
    record: WorkbenchRecord,
    contexts?: readonly MediaSourceContext[],
  ) => ReactNode;
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
  readonly value: (
    record: WorkbenchRecord,
    contexts?: readonly MediaSourceContext[],
  ) => string;
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

function resolveDownloadUrl(
  connection: ReturnType<typeof selectModuleConnection>,
  record: WorkbenchRecord,
): string | undefined {
  const code = record.code;
  if (typeof code !== 'string' || !code.trim() || !connection) return undefined;
  return `${connection.endpoint.replace(/\/$/, '')}/v0/download/${encodeURIComponent(code)}`;
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
  pageNumber = 1,
  pageSize = schema.queryCapabilities.defaultPageSize,
): WorkbenchRecordQuery {
  const normalizedPageSize = Math.min(
    Math.max(1, pageSize),
    schema.queryCapabilities.maximumPageSize,
  );
  return Object.freeze({
    search,
    ...(filters ? { filters } : {}),
    pageNumber: Math.max(1, pageNumber),
    pageSize: normalizedPageSize,
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

function supportedFilterOperator(
  schema: WorkbenchSchema,
  field: string,
  operator: WorkbenchFilterCondition['operator'],
): boolean {
  return Boolean(
    schema.queryCapabilities.filterFields
      .find((filterField) => filterField.field === field)
      ?.operators.includes(operator),
  );
}

function conditionFilter(condition: WorkbenchFilterCondition): WorkbenchFilterGroup {
  return Object.freeze({
    operator: 'AND',
    items: Object.freeze([Object.freeze(condition)]),
  });
}

function buildInOrEqualsFilter(
  schema: WorkbenchSchema,
  field: string,
  values: readonly string[],
): WorkbenchFilterGroup | undefined {
  const normalizedValues = uniqueSorted(
    values.map((value) => value.trim()).filter(Boolean),
  );
  if (normalizedValues.length === 0) return undefined;
  if (normalizedValues.length > 1 && supportedFilterOperator(schema, field, 'IN')) {
    return conditionFilter({
      field,
      operator: 'IN',
      value: normalizedValues,
    });
  }
  if (supportedFilterOperator(schema, field, 'EQUALS')) {
    if (
      normalizedValues.length > 1 &&
      schema.queryCapabilities.groupOperators.includes('OR')
    ) {
      return Object.freeze({
        operator: 'OR',
        items: Object.freeze(
          normalizedValues.map((value) =>
            Object.freeze({
              field,
              operator: 'EQUALS',
              value,
            }),
          ),
        ),
      });
    }
    return conditionFilter({
      field,
      operator: 'EQUALS',
      value: normalizedValues[0]!,
    });
  }
  return undefined;
}

function isFieldFilterable(schema: WorkbenchSchema, field: string): boolean {
  return (
    supportedFilterOperator(schema, field, 'EQUALS') ||
    supportedFilterOperator(schema, field, 'IN')
  );
}

function facetBackendField(
  itemId: string | undefined,
  filter: MediaRecordFacetFilter,
): string {
  if (itemId === 'media' && filter.key === 'sourceType') return 'folderCode';
  return filter.key;
}

function isFacetFilterQueryable(
  schema: WorkbenchSchema,
  itemId: string | undefined,
  filter: MediaRecordFacetFilter,
): boolean {
  return isFieldFilterable(schema, facetBackendField(itemId, filter));
}

function combineFilters(
  filters: readonly (WorkbenchFilterGroup | undefined)[],
): WorkbenchFilterGroup | undefined {
  const activeFilters = filters.filter((filter): filter is WorkbenchFilterGroup =>
    Boolean(filter && filter.items.length > 0),
  );
  if (activeFilters.length === 0) return undefined;
  if (activeFilters.length === 1) return activeFilters[0];
  return Object.freeze({
    operator: 'AND',
    items: Object.freeze(activeFilters),
  });
}

function buildFacetRecordFilter(
  schema: WorkbenchSchema,
  itemId: string | undefined,
  facetFilters: readonly MediaRecordFacetFilter[],
  selections: Readonly<Record<string, string>>,
  contexts?: readonly MediaSourceContext[],
): WorkbenchFilterGroup | undefined {
  const statePrefix = `${itemId ?? 'none'}:`;
  return combineFilters(
    facetFilters.map((filter) => {
      const selectedValue = selections[`${statePrefix}${filter.key}`] ?? 'ALL';
      if (!selectedValue || selectedValue === 'ALL') return undefined;
      if (itemId === 'media' && filter.key === 'sourceType') {
        return buildInOrEqualsFilter(
          schema,
          'folderCode',
          folderCodesForSourceType(selectedValue, contexts),
        );
      }
      return buildInOrEqualsFilter(schema, filter.key, [selectedValue]);
    }),
  );
}

function recordPageSizeOptions(schema: WorkbenchSchema | undefined): readonly number[] {
  const allowedPageSizes = schema?.queryCapabilities.allowedPageSizes ?? [10, 25, 50];
  const maximumPageSize =
    schema?.queryCapabilities.maximumPageSize ?? Number.MAX_SAFE_INTEGER;
  const boundedPageSizes = allowedPageSizes.filter((size) => size <= maximumPageSize);
  return boundedPageSizes.length ? boundedPageSizes : [10];
}

function mediaSummary(record: WorkbenchRecord): string {
  const original = textValue(record, 'originalFileName');
  if (original !== '—') return original;
  const name = textValue(record, 'name');
  if (name !== '—') return name;
  return textValue(record, 'code');
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
  const downloadUrl = resolveDownloadUrl(props.connection, props.record);
  const originalFileName = mediaSummary(props.record);
  const access = textValue(props.record, 'access');
  const status = textValue(props.record, 'status');
  const mimeType = textValue(props.record, 'mimeType');
  const previewable = Boolean(deliveryUrl && isPublicImage(props.record));
  const deliverable = Boolean(deliveryUrl && isDeliverable(props.record));
  const downloadable = Boolean(downloadUrl && isDeliverable(props.record));

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
            disabled={!downloadable}
            download={originalFileName === '—' ? undefined : originalFileName}
            href={downloadable ? downloadUrl : undefined}
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
        render: (record, contexts) =>
          mediaSourceType(textValue(record, 'folderCode'), contexts),
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
      value: (record, contexts) =>
        mediaSourceType(textValue(record, 'folderCode'), contexts),
    },
  ],
  'media-folders': [
    {
      allLabel: 'All source types',
      key: 'sourceType',
      label: 'Source type',
      value: (record, contexts) => mediaSourceType(textValue(record, 'code'), contexts),
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
  const mediaContexts = useQuery({
    enabled: Boolean(
      (currentItem?.id === 'storage-delivery' ||
        currentFacetFilters.some((filter) => filter.key === 'sourceType')) &&
      connection,
    ),
    queryKey: [
      'media-management',
      'media-contexts',
      connection?.endpoint,
      configuration.enterpriseCode,
    ],
    queryFn: () => loadMediaSourceContexts(connection!, configuration),
  });
  const currentRecordFilter =
    currentItem?.id === 'media-usage' && usageMediaCode
      ? buildEqualsFilter('mediaCode', usageMediaCode)
      : undefined;
  const queryableFacetFilters = currentSchema
    ? currentFacetFilters.filter((filter) =>
        isFacetFilterQueryable(currentSchema, currentItem?.id, filter),
      )
    : emptyFacetFilters;
  const currentFacetRecordFilter = currentSchema
    ? buildFacetRecordFilter(
        currentSchema,
        currentItem?.id,
        queryableFacetFilters,
        recordFacetFilters,
        mediaContexts.data,
      )
    : undefined;
  const activeRecordFilter = combineFilters([
    currentRecordFilter,
    currentFacetRecordFilter,
  ]);
  const recordRowsPerPageOptions = recordPageSizeOptions(currentSchema);
  const effectiveRecordRowsPerPage = recordRowsPerPageOptions.includes(
    recordRowsPerPage,
  )
    ? recordRowsPerPage
    : (recordRowsPerPageOptions[0] ?? 10);
  const records = useQuery({
    enabled: Boolean(recordWorkspaceConfiguration && connection && currentSchema),
    queryKey: [
      'media-management',
      recordWorkspaceConfiguration?.schemaName,
      connection?.endpoint,
      currentSchema?.schemaName,
      recordSearch.trim(),
      recordPage,
      effectiveRecordRowsPerPage,
      recordFacetFilters,
      mediaContexts.data?.map((context) => context.folderCodes.join(',')).join('|'),
      usageMediaCode,
    ],
    queryFn: () =>
      loadWorkbenchRecords(
        connection!,
        currentSchema!,
        configuration,
        buildRecordQuery(
          currentSchema!,
          recordSearch.trim(),
          activeRecordFilter,
          recordPage + 1,
          effectiveRecordRowsPerPage,
        ),
      ),
  });
  const loadedRecords = useMemo(
    () => records.data?.records ?? [],
    [records.data?.records],
  );
  const facetFilterOptions = queryableFacetFilters
    .map((filter) => {
      const dynamicOptions = uniqueSorted(
        loadedRecords
          .map((record) => filter.value(record, mediaContexts.data))
          .filter((value) => value && value !== '—'),
      );
      const backendSourceOptions =
        filter.key === 'sourceType'
          ? mediaSourceTypesForContexts(mediaContexts.data)
          : [];
      const options = uniqueSorted([
        ...(filter.staticOptions ?? []),
        ...backendSourceOptions,
        ...dynamicOptions,
      ]);
      return {
        filter,
        options,
      };
    })
    .filter(({ options }) => options.length > 0);
  const mediaSourceFacetOption =
    currentItem?.id === 'media'
      ? facetFilterOptions.find(({ filter }) => filter.key === 'sourceType')
      : undefined;
  const hasActiveFacetFilters = queryableFacetFilters.some((filter) => {
    const value = recordFacetFilters[`${currentItem?.id ?? 'none'}:${filter.key}`];
    return Boolean(value && value !== 'ALL');
  });
  const visibleRecords = loadedRecords;
  const totalRecordCount = records.data?.totalCount ?? visibleRecords.length;
  const effectiveRecordPage = recordPage;
  const pagedRecords = visibleRecords;
  const selectedRecord = useMemo(
    () =>
      visibleRecords.find(
        (record) =>
          typeof record.code === 'string' && record.code === selectedRecordCode,
      ) ?? visibleRecords[0],
    [visibleRecords, selectedRecordCode],
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
      connection &&
      mediaContexts.isError,
    ),
    queryKey: [
      'media-management',
      'storage-delivery-fallback',
      connection?.endpoint,
      configuration.enterpriseCode,
    ],
    queryFn: () => loadMediaFolderUploadPolicies(connection!, configuration),
  });
  const effectiveStoragePolicies = useMemo(
    () =>
      mediaContexts.data
        ? folderUploadPoliciesFromContexts(mediaContexts.data)
        : (storagePolicies.data ?? []),
    [mediaContexts.data, storagePolicies.data],
  );
  const storagePolicyLoading =
    mediaContexts.isLoading || (mediaContexts.isError && storagePolicies.isLoading);
  const storagePolicyError =
    mediaContexts.isError && storagePolicies.isError
      ? (storagePolicies.error ?? mediaContexts.error)
      : undefined;
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
                            label={`${visibleRecords.length} shown from ${totalRecordCount}`}
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
                  <MediaUploadWizard
                    connection={connection}
                    configuration={configuration}
                    error={storagePolicyError}
                    formatBytes={formatBytes}
                    loading={storagePolicyLoading}
                    policies={effectiveStoragePolicies}
                    sourceContexts={mediaContexts.data}
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
                                        {column.render(record, mediaContexts.data)}
                                      </TableCell>
                                    ),
                                  )}
                                </TableRow>
                              );
                            })}
                            {visibleRecords.length === 0 ? (
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
                          count={totalRecordCount}
                          page={effectiveRecordPage}
                          rowsPerPage={effectiveRecordRowsPerPage}
                          rowsPerPageOptions={recordRowsPerPageOptions}
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
            error={storagePolicyError}
            loading={storagePolicyLoading}
            policies={effectiveStoragePolicies}
          />
        ) : null}
      </Stack>
    </WorkspaceContainer>
  );
}
