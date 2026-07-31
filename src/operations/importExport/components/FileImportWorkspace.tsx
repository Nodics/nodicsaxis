import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import { useMemo, useRef, useState } from 'react';

import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';
import {
  loadWorkbenchSchemas,
  type WorkbenchClientConfiguration,
} from '../../../workbench/api/workbenchClient';
import type { WorkbenchSchema } from '../../../workbench/api/workbenchContracts';
import {
  installMediaImport,
  type DataReleaseClientConfiguration,
  uploadImportMedia,
  validateMediaImport,
} from '../api/dataReleaseClient';
import type {
  ImportRunFailure,
  ImportValidationReport,
  ImportValidationRow,
  MediaImportOperationResult,
  MediaUploadSummary,
} from '../api/dataReleaseContracts';

interface FileImportWorkspaceProps {
  readonly configuration: DataReleaseClientConfiguration;
  readonly enterpriseCode: string;
  readonly importConnection: AxisModuleConnection | undefined;
  readonly mediaConnection: AxisModuleConnection | undefined;
  readonly schemaConnections: readonly AxisModuleConnection[];
  readonly tenantCode: string;
}

function formatBytes(value: number | undefined): string | undefined {
  if (value === undefined) return undefined;
  if (value < 1024) return `${value.toString()} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function titleCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function schemaLabel(schema: WorkbenchSchema): string {
  return `${schema.label} - ${titleCase(schema.moduleName)}`;
}

function uploadName(upload: MediaUploadSummary | undefined): string {
  return (
    upload?.originalFileName ?? upload?.name ?? upload?.mediaCode ?? 'No file uploaded'
  );
}

function countText(value: number | undefined): string {
  return value === undefined ? '0' : value.toLocaleString();
}

function validationSummaryText(result: MediaImportOperationResult): string {
  const summary = result.importRun?.summary;
  const validationErrors =
    result.validationErrorCount ??
    result.validationErrors?.length ??
    result.importRun?.validationErrors?.length ??
    summary?.validationErrors;
  return [
    `${countText(summary?.recordsRead)} record(s) read`,
    `${countText(summary?.recordsFinalized)} finalized for review`,
    `${countText(validationErrors)} validation issue(s)`,
  ].join(' · ');
}

function validationIssues(
  result: MediaImportOperationResult | undefined,
): readonly ImportRunFailure[] {
  return result?.validationErrors ?? result?.importRun?.validationErrors ?? [];
}

function validationReport(
  result: MediaImportOperationResult | undefined,
): ImportValidationReport | undefined {
  return result?.validationReport;
}

function hasValidationIssues(result: MediaImportOperationResult | undefined): boolean {
  return (
    result?.validationPassed === false ||
    (result?.validationErrorCount ?? 0) > 0 ||
    validationIssues(result).length > 0 ||
    (result?.importRun?.summary?.validationErrors ?? 0) > 0
  );
}

function rowStatusLabel(row: ImportValidationRow): string {
  const status = row.status.toUpperCase();
  if (status === 'VALID') return 'Valid';
  if (status === 'INVALID') return 'Needs correction';
  if (status === 'WARNING') return 'Warning';
  return titleCase(status);
}

function rowStatusColor(
  row: ImportValidationRow,
): 'success' | 'error' | 'warning' | 'default' {
  const status = row.status.toUpperCase();
  if (status === 'VALID') return 'success';
  if (status === 'INVALID') return 'error';
  if (status === 'WARNING') return 'warning';
  return 'default';
}

function rowSearchText(row: ImportValidationRow): string {
  return [
    row.rowNumber?.toString(),
    row.recordKey,
    row.status,
    row.field,
    row.message,
    row.howToFix,
    row.fileName,
    row.schemaName,
    row.operation,
    row.technicalCode,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function installationSummaryText(result: MediaImportOperationResult): string {
  const summary = result.importRun?.summary;
  return [
    `${countText(summary?.recordsDispatched)} dispatched`,
    `${countText(summary?.recordsSucceeded)} succeeded`,
    `${countText(summary?.recordsFailed)} failed`,
  ].join(' · ');
}

function importFailures(
  result: MediaImportOperationResult | undefined,
): readonly ImportRunFailure[] {
  return result?.importRun?.failures ?? [];
}

function importFailureMessage(failure: ImportRunFailure): string {
  return (
    failure.error?.message ??
    failure.error?.code ??
    'Record failed during import processing'
  );
}

function importFailureTarget(failure: ImportRunFailure): string {
  return (
    [
      failure.targetModule ?? failure.owningModule,
      failure.schemaName ?? failure.indexName,
    ]
      .filter(Boolean)
      .map((value) => titleCase(value ?? ''))
      .join(' / ') || '—'
  );
}

function importFailureHowToFix(failure: ImportRunFailure): string {
  if (failure.propertyName) {
    return `Review the "${failure.propertyName}" value in the source file and retry the import.`;
  }
  return 'Review the backend error, correct the source data, and retry the import.';
}

export function FileImportWorkspace(props: FileImportWorkspaceProps) {
  return <FileImportWorkspaceContent key={props.enterpriseCode.trim()} {...props} />;
}

function FileImportWorkspaceContent(props: FileImportWorkspaceProps) {
  const [schemaKey, setSchemaKey] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [targetEnterpriseCode, setTargetEnterpriseCode] = useState(
    props.enterpriseCode.trim(),
  );
  const [validationStatusFilter, setValidationStatusFilter] = useState('ALL');
  const [validationSearch, setValidationSearch] = useState('');
  const [validationPage, setValidationPage] = useState(0);
  const [validationRowsPerPage, setValidationRowsPerPage] = useState(10);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadSummary | undefined>(
    undefined,
  );
  const [validatedMediaCode, setValidatedMediaCode] = useState<string | undefined>(
    undefined,
  );
  const workspaceEnterpriseCode = props.enterpriseCode.trim();
  const selectedEnterpriseCode = targetEnterpriseCode.trim();
  const selectedClientConfiguration = useMemo<DataReleaseClientConfiguration>(
    () => ({
      ...props.configuration,
      enterpriseCode:
        selectedEnterpriseCode || props.configuration.enterpriseCode.trim(),
    }),
    [props.configuration, selectedEnterpriseCode],
  );
  const workbenchConfiguration = useMemo<WorkbenchClientConfiguration>(
    () => ({
      accessToken: selectedClientConfiguration.accessToken,
      enterpriseCode: selectedClientConfiguration.enterpriseCode,
      timeoutMs: selectedClientConfiguration.timeoutMs,
    }),
    [
      selectedClientConfiguration.accessToken,
      selectedClientConfiguration.enterpriseCode,
      selectedClientConfiguration.timeoutMs,
    ],
  );

  const hasTargetEnterprise = selectedEnterpriseCode.length > 0;
  const schemas = useQuery({
    queryKey: ['file-import-schemas', selectedClientConfiguration.enterpriseCode],
    queryFn: () => {
      if (props.schemaConnections.length === 0) {
        throw new Error('Schema discovery is unavailable');
      }
      return loadWorkbenchSchemas(props.schemaConnections, workbenchConfiguration);
    },
    enabled: props.schemaConnections.length > 0 && hasTargetEnterprise,
  });
  const schemaOptions = useMemo(() => {
    const byKey = new Map<string, WorkbenchSchema>();
    for (const schema of schemas.data ?? []) {
      byKey.set(`${schema.moduleName}/${schema.schemaName}`, schema);
    }
    return Object.freeze([...byKey.values()]);
  }, [schemas.data]);
  const selectedSchema = useMemo(
    () =>
      schemaOptions.find(
        (schema) => `${schema.moduleName}/${schema.schemaName}` === schemaKey,
      ),
    [schemaKey, schemaOptions],
  );
  const upload = useMutation({
    mutationFn: async () => {
      if (!props.mediaConnection) throw new Error('Media service is unavailable');
      if (!hasTargetEnterprise)
        throw new Error('Select the target enterprise before uploading');
      if (!selectedSchema) throw new Error('Choose a target model before uploading');
      if (!file) throw new Error('Select a file before uploading');
      return uploadImportMedia(
        props.mediaConnection,
        selectedClientConfiguration,
        file,
        {
          enterpriseCode: selectedEnterpriseCode,
          moduleName: selectedSchema.moduleName,
          schemaName: selectedSchema.schemaName,
          tenantCode: props.tenantCode,
        },
      );
    },
    onSuccess: (media) => {
      setUploadedMedia(media);
      setValidatedMediaCode(undefined);
    },
  });
  const validate = useMutation({
    mutationFn: async () => {
      if (!props.importConnection) throw new Error('Import service is unavailable');
      if (!hasTargetEnterprise)
        throw new Error('Select the target enterprise before validation');
      if (!uploadedMedia || !selectedSchema)
        throw new Error('Upload a file and select a target model first');
      return validateMediaImport(props.importConnection, selectedClientConfiguration, {
        mediaCode: uploadedMedia.mediaCode,
        moduleName: selectedSchema.moduleName,
        schemaName: selectedSchema.schemaName,
        operation: 'saveAll',
      });
    },
    onSuccess: (result) => {
      setValidatedMediaCode(
        hasValidationIssues(result) ? undefined : uploadedMedia?.mediaCode,
      );
    },
  });
  const install = useMutation({
    mutationFn: async () => {
      if (!props.importConnection) throw new Error('Import service is unavailable');
      if (!hasTargetEnterprise)
        throw new Error('Select the target enterprise before importing');
      if (!uploadedMedia || !selectedSchema)
        throw new Error('Upload a file and select a target model first');
      return installMediaImport(props.importConnection, selectedClientConfiguration, {
        mediaCode: uploadedMedia.mediaCode,
        moduleName: selectedSchema.moduleName,
        schemaName: selectedSchema.schemaName,
        operation: 'saveAll',
      });
    },
  });
  const missingServices = [
    !props.importConnection ? 'Import service' : undefined,
    !props.mediaConnection ? 'Media upload' : undefined,
    props.schemaConnections.length === 0 ? 'Schema discovery' : undefined,
  ].filter((value): value is string => Boolean(value));
  const operationError =
    upload.error?.message ?? validate.error?.message ?? install.error?.message;
  const currentValidationReport = useMemo(
    () => validationReport(validate.data),
    [validate.data],
  );
  const currentImportSummary = install.data?.importRun?.summary;
  const currentImportFailures = importFailures(install.data);
  const validationRows = useMemo(
    () => currentValidationReport?.rows ?? [],
    [currentValidationReport],
  );
  const importedRows = useMemo(
    () => validationRows.filter((row) => row.status.toUpperCase() === 'VALID'),
    [validationRows],
  );
  const filteredValidationRows = useMemo(() => {
    const normalizedSearch = validationSearch.trim().toLowerCase();
    return validationRows.filter((row) => {
      const statusMatches =
        validationStatusFilter === 'ALL' ||
        row.status.toUpperCase() === validationStatusFilter;
      if (!statusMatches) return false;
      if (!normalizedSearch) return true;
      return rowSearchText(row).includes(normalizedSearch);
    });
  }, [validationRows, validationSearch, validationStatusFilter]);
  const pagedValidationRows = filteredValidationRows.slice(
    validationPage * validationRowsPerPage,
    validationPage * validationRowsPerPage + validationRowsPerPage,
  );
  const pagedImportedRows = importedRows.slice(
    validationPage * validationRowsPerPage,
    validationPage * validationRowsPerPage + validationRowsPerPage,
  );
  const canChooseModel = hasTargetEnterprise;
  const canChooseFile = Boolean(selectedSchema);
  const canValidate = Boolean(hasTargetEnterprise && uploadedMedia && selectedSchema);
  const canInstall =
    canValidate &&
    validatedMediaCode === uploadedMedia?.mediaCode &&
    !hasValidationIssues(validate.data);
  const busy = upload.isPending || validate.isPending || install.isPending;
  const hasFileSelection = Boolean(file || uploadedMedia);
  const clearSelectedFile = () => {
    setFile(undefined);
    setUploadedMedia(undefined);
    setValidatedMediaCode(undefined);
    resetValidationReportView();
    upload.reset();
    validate.reset();
    install.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const resetValidationReportView = () => {
    setValidationSearch('');
    setValidationStatusFilter('ALL');
    setValidationPage(0);
  };

  return (
    <Stack spacing={1.5}>
      <Alert severity="info">
        Upload files through nMedia, then validate and import through nImport. Axis
        never reads server paths or parses business data in the browser.
      </Alert>

      {missingServices.length > 0 ? (
        <Alert severity="error">
          Required backend connection is unavailable: {missingServices.join(', ')}.
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
        }}
      >
        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
            <Stack spacing={1.25}>
              <Stack spacing={0.25}>
                <Typography component="h2" variant="h6">
                  1. Confirm target destination
                </Typography>
                <Typography color="text.secondary">
                  Records will be imported for the selected enterprise. Nodics resolves
                  the tenant from enterprise configuration for technical traceability.
                </Typography>
              </Stack>
              <Stack spacing={1.25}>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    p: 1.25,
                  }}
                >
                  <Stack spacing={1}>
                    <Box>
                      <TextField
                        fullWidth
                        label="Target enterprise"
                        select
                        disabled={!workspaceEnterpriseCode}
                        value={targetEnterpriseCode}
                        onChange={(event) => {
                          setTargetEnterpriseCode(event.target.value);
                          setSchemaKey('');
                          setFile(undefined);
                          setUploadedMedia(undefined);
                          upload.reset();
                          validate.reset();
                          install.reset();
                          setValidatedMediaCode(undefined);
                          resetValidationReportView();
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <MenuItem value={workspaceEnterpriseCode}>
                          {titleCase(workspaceEnterpriseCode)}
                        </MenuItem>
                      </TextField>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                      <Typography
                        color="text.secondary"
                        sx={{
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          letterSpacing: '0.12em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Technical tenant
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>
                        {props.tenantCode}
                      </Typography>
                    </Stack>
                  </Stack>
                </Paper>
                <Alert severity="info">
                  Business users choose the enterprise destination. Tenant remains a
                  backend-resolved isolation detail and is not selected independently.
                </Alert>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
            <Stack spacing={1.25}>
              <Stack spacing={0.25}>
                <Typography component="h2" variant="h6">
                  2. Choose target model
                </Typography>
                <Typography color="text.secondary">
                  Select the backend schema that owns the records inside this file.
                  Import templates will be added later as optional reusable mappings.
                </Typography>
              </Stack>
              <Stack spacing={1.25}>
                {!hasTargetEnterprise ? (
                  <Alert severity="info">
                    Select the target enterprise first. Axis will then allow target
                    model selection for that business destination.
                  </Alert>
                ) : null}
                {hasTargetEnterprise && schemas.isLoading ? (
                  <Box sx={{ display: 'grid', minHeight: 120, placeItems: 'center' }}>
                    <CircularProgress aria-label="Loading target models" />
                  </Box>
                ) : null}
                {hasTargetEnterprise && schemas.isError ? (
                  <Alert severity="error">{schemas.error.message}</Alert>
                ) : null}
                {hasTargetEnterprise &&
                schemas.isSuccess &&
                schemaOptions.length === 0 ? (
                  <Alert severity="warning">
                    No importable target models are available for this enterprise.
                  </Alert>
                ) : null}
                {schemaOptions.length > 0 ? (
                  <Autocomplete
                    fullWidth
                    autoHighlight
                    disablePortal
                    groupBy={(schema) => titleCase(schema.moduleName)}
                    getOptionLabel={schemaLabel}
                    isOptionEqualToValue={(option, value) =>
                      option.moduleName === value.moduleName &&
                      option.schemaName === value.schemaName
                    }
                    options={schemaOptions}
                    disabled={!canChooseModel}
                    value={selectedSchema ?? null}
                    onChange={(_event, schema) => {
                      setSchemaKey(
                        schema ? `${schema.moduleName}/${schema.schemaName}` : '',
                      );
                      setFile(undefined);
                      setUploadedMedia(undefined);
                      upload.reset();
                      validate.reset();
                      install.reset();
                      setValidatedMediaCode(undefined);
                      resetValidationReportView();
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Target model"
                        placeholder="Search schemas by model or module"
                        helperText={
                          hasTargetEnterprise
                            ? undefined
                            : 'Select target enterprise first'
                        }
                      />
                    )}
                    renderOption={(optionProps, schema) => (
                      <Box
                        component="li"
                        {...optionProps}
                        key={`${schema.moduleName}/${schema.schemaName}`}
                      >
                        <Stack spacing={0.25}>
                          <Typography component="span" sx={{ fontWeight: 700 }}>
                            {schema.label}
                          </Typography>
                          <Typography
                            color="text.secondary"
                            component="span"
                            variant="body2"
                          >
                            {schema.description ||
                              `${titleCase(schema.moduleName)} schema: ${schema.schemaName}`}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                    slotProps={{
                      listbox: {
                        sx: {
                          '& .MuiAutocomplete-groupLabel': {
                            bgcolor: 'background.default',
                            color: 'text.secondary',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            letterSpacing: '0.12em',
                            lineHeight: 2.4,
                            textTransform: 'uppercase',
                          },
                        },
                      },
                    }}
                  />
                ) : null}
                {selectedSchema ? (
                  <Paper
                    elevation={0}
                    sx={(theme) => ({
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      border: 1,
                      borderColor: alpha(theme.palette.primary.main, 0.2),
                      p: 1.25,
                    })}
                  >
                    <Stack spacing={0.75}>
                      <Typography component="p" sx={{ fontWeight: 700 }}>
                        {selectedSchema.label}
                      </Typography>
                      <Typography color="text.secondary">
                        {selectedSchema.description ||
                          `Import records into the ${selectedSchema.label} model.`}
                      </Typography>
                      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        <Chip
                          label={`Data owner: ${titleCase(selectedSchema.moduleName)}`}
                          size="small"
                        />
                        <Chip
                          label={`Schema: ${selectedSchema.schemaName}`}
                          size="small"
                        />
                        <Chip label="Operation: Save or update records" size="small" />
                        <Chip
                          label={`Display: ${titleCase(selectedSchema.displayProperty)}`}
                          size="small"
                        />
                      </Stack>
                    </Stack>
                  </Paper>
                ) : null}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: { xs: 1.75, md: 2 } }}>
            <Stack spacing={1.25}>
              <Stack spacing={0.25}>
                <Typography component="h2" variant="h6">
                  3. Upload governed file
                </Typography>
                <Typography color="text.secondary">
                  The file is stored by nMedia first. nImport receives only the returned
                  media code and selected backend model.
                </Typography>
              </Stack>
              <Stack spacing={1.25}>
                <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1 }}>
                  <Button
                    component="label"
                    disabled={!canChooseFile}
                    variant="outlined"
                  >
                    Choose file
                    <input
                      hidden
                      disabled={!canChooseFile}
                      ref={fileInputRef}
                      type="file"
                      onChange={(event) => {
                        setFile(event.target.files?.[0]);
                        setUploadedMedia(undefined);
                        setValidatedMediaCode(undefined);
                        upload.reset();
                        validate.reset();
                        install.reset();
                        resetValidationReportView();
                      }}
                    />
                  </Button>
                  <Button
                    disabled={busy || !canChooseFile || !file || !props.mediaConnection}
                    variant="contained"
                    onClick={() => upload.mutate()}
                  >
                    {upload.isPending ? 'Uploading…' : 'Upload to media'}
                  </Button>
                </Stack>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'background.default',
                    border: 1,
                    borderColor: 'divider',
                    p: 1.25,
                  }}
                >
                  <Stack
                    direction="row"
                    sx={{
                      alignItems: 'flex-start',
                      gap: 1,
                      justifyContent: 'space-between',
                    }}
                  >
                    <Stack spacing={0.5}>
                      <Typography component="p" sx={{ fontWeight: 700 }}>
                        {uploadedMedia
                          ? uploadName(uploadedMedia)
                          : (file?.name ?? 'No file selected')}
                      </Typography>
                      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        {uploadedMedia ? (
                          <Chip
                            label={`Media: ${uploadedMedia.mediaCode}`}
                            size="small"
                          />
                        ) : null}
                        {formatBytes(uploadedMedia?.sizeBytes ?? file?.size) ? (
                          <Chip
                            label={formatBytes(uploadedMedia?.sizeBytes ?? file?.size)}
                            size="small"
                            variant="outlined"
                          />
                        ) : null}
                        {uploadedMedia?.status ? (
                          <Chip
                            label={uploadedMedia.status}
                            size="small"
                            variant="outlined"
                          />
                        ) : null}
                      </Stack>
                    </Stack>
                    {hasFileSelection ? (
                      <IconButton
                        aria-label="Remove selected import file"
                        disabled={busy}
                        onClick={clearSelectedFile}
                        size="small"
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          color: 'text.secondary',
                          flex: '0 0 auto',
                        }}
                      >
                        <Box
                          component="span"
                          sx={{ fontSize: '1.25rem', lineHeight: 1 }}
                        >
                          ×
                        </Box>
                      </IconButton>
                    ) : null}
                  </Stack>
                </Paper>
              </Stack>
              {!selectedSchema ? (
                <Alert severity="info">
                  Choose the target model before selecting or uploading a file.
                </Alert>
              ) : null}
            </Stack>
          </CardContent>
        </Card>
      </Box>

      <Divider />
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
        <Button
          disabled={busy || !canValidate || !props.importConnection}
          variant="outlined"
          onClick={() => {
            install.reset();
            validate.mutate();
          }}
        >
          {validate.isPending ? 'Validating…' : 'Validate file import'}
        </Button>
        <Button
          disabled={busy || !canInstall || !props.importConnection}
          variant="contained"
          onClick={() => {
            setValidationPage(0);
            install.mutate();
          }}
        >
          {install.isPending ? 'Importing…' : 'Install imported data'}
        </Button>
      </Stack>
      {canValidate && !validate.isSuccess && !validate.isError && !canInstall ? (
        <Alert severity="info">
          Validate this uploaded file before installation. If you change the file or
          contract, validation must be repeated.
        </Alert>
      ) : null}
      {operationError ? <Alert severity="error">{operationError}</Alert> : null}
      {validate.isSuccess && !install.isSuccess ? (
        hasValidationIssues(validate.data) ? (
          <Alert severity="warning">
            File import validation completed for {uploadName(uploadedMedia)}, but{' '}
            {(
              currentValidationReport?.invalidRecords ??
              validate.data.validationErrorCount ??
              0
            ).toLocaleString()}{' '}
            record(s) need correction before installation. Review the validation report
            below.
          </Alert>
        ) : (
          <Alert severity="success">
            File import validation completed for {uploadName(uploadedMedia)}.{' '}
            {validationSummaryText(validate.data)}
          </Alert>
        )
      ) : null}
      {currentValidationReport && !install.isSuccess ? (
        <Paper
          variant="outlined"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.84),
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Stack spacing={1.5} sx={{ p: { xs: 1.5, md: 2 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography component="h3" sx={{ fontWeight: 800 }}>
                  Validation report
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Review record-level results before importing data into Nodics.
                </Typography>
              </Box>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Chip
                  size="small"
                  label={`${currentValidationReport.totalRecords.toLocaleString()} total`}
                />
                <Chip
                  color="success"
                  size="small"
                  label={`${currentValidationReport.validRecords.toLocaleString()} valid`}
                />
                <Chip
                  color={
                    currentValidationReport.invalidRecords > 0 ? 'error' : 'default'
                  }
                  size="small"
                  label={`${currentValidationReport.invalidRecords.toLocaleString()} needs correction`}
                />
                <Chip
                  color={
                    currentValidationReport.warningRecords > 0 ? 'warning' : 'default'
                  }
                  size="small"
                  label={`${currentValidationReport.warningRecords.toLocaleString()} warnings`}
                />
              </Stack>
            </Stack>
            <Divider />
            <TextField
              fullWidth
              placeholder="Search records, fields, messages, or fix guidance"
              value={validationSearch}
              onChange={(event) => {
                setValidationSearch(event.target.value);
                setValidationPage(0);
              }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box
                        component="span"
                        sx={{ color: 'text.secondary', fontSize: '1.5rem' }}
                      >
                        ⌕
                      </Box>
                    </InputAdornment>
                  ),
                  endAdornment: validationSearch ? (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Clear validation search"
                        edge="end"
                        onClick={() => {
                          setValidationSearch('');
                          setValidationPage(0);
                        }}
                      >
                        ×
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 0.75,
              }}
            >
              <Typography
                color="text.secondary"
                variant="caption"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                Show
              </Typography>
              {(
                [
                  ['ALL', 'All'],
                  ['VALID', 'Valid'],
                  ['INVALID', 'Needs correction'],
                  ['WARNING', 'Warnings'],
                ] as const
              ).map(([value, label]) => (
                <Chip
                  key={value}
                  clickable
                  color={validationStatusFilter === value ? 'primary' : 'default'}
                  label={label}
                  size="small"
                  variant={validationStatusFilter === value ? 'filled' : 'outlined'}
                  onClick={() => {
                    setValidationStatusFilter(value);
                    setValidationPage(0);
                  }}
                />
              ))}
            </Stack>
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 960 }}>
              <TableHead
                sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }}
              >
                <TableRow>
                  <TableCell sx={{ width: '26%' }}>Record</TableCell>
                  <TableCell sx={{ width: '12%' }}>Status</TableCell>
                  <TableCell sx={{ width: '12%' }}>Field</TableCell>
                  <TableCell sx={{ width: '26%' }}>Message</TableCell>
                  <TableCell sx={{ width: '24%' }}>How to fix</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedValidationRows.map((row, index) => {
                  const sourceRecordIndex = validationRows.findIndex(
                    (candidate) => candidate === row,
                  );
                  const displayRowNumber =
                    sourceRecordIndex >= 0
                      ? sourceRecordIndex + 1
                      : validationPage * validationRowsPerPage + index + 1;
                  return (
                    <TableRow
                      key={`${row.fileName ?? 'file'}-${row.recordKey ?? index}`}
                    >
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography sx={{ fontWeight: 800 }}>
                          #{displayRowNumber.toString()}
                        </Typography>
                        {row.recordKey ? (
                          <Typography
                            color="text.secondary"
                            variant="caption"
                            sx={{ display: 'block', wordBreak: 'break-all' }}
                          >
                            {row.recordKey}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip
                          color={rowStatusColor(row)}
                          label={rowStatusLabel(row)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{row.field ?? '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 340 }}>{row.message ?? '—'}</TableCell>
                      <TableCell sx={{ maxWidth: 340 }}>
                        {row.howToFix || '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {pagedValidationRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary">
                        No validation records match the current filters.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Box>
          <TablePagination
            component="div"
            count={filteredValidationRows.length}
            page={validationPage}
            rowsPerPage={validationRowsPerPage}
            rowsPerPageOptions={[10, 25, 50, 100]}
            sx={{ borderTop: 1, borderColor: 'divider' }}
            onPageChange={(_, page) => setValidationPage(page)}
            onRowsPerPageChange={(event) => {
              setValidationRowsPerPage(Number(event.target.value));
              setValidationPage(0);
            }}
          />
        </Paper>
      ) : null}
      {install.isSuccess ? (
        <Paper
          variant="outlined"
          sx={{
            bgcolor: (theme) => alpha(theme.palette.background.paper, 0.84),
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <Stack spacing={1.5} sx={{ p: { xs: 1.5, md: 2 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              sx={{
                alignItems: { md: 'center' },
                justifyContent: 'space-between',
                gap: 1.5,
              }}
            >
              <Box>
                <Typography component="h3" sx={{ fontWeight: 800 }}>
                  Import report
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Review backend execution results for the installed file.
                </Typography>
              </Box>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 0.75,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                }}
              >
                <Chip
                  size="small"
                  label={`${countText(currentImportSummary?.recordsDispatched)} dispatched`}
                />
                <Chip
                  color="success"
                  size="small"
                  label={`${countText(currentImportSummary?.recordsSucceeded)} succeeded`}
                />
                <Chip
                  color={
                    (currentImportSummary?.recordsFailed ?? 0) > 0 ? 'error' : 'default'
                  }
                  size="small"
                  label={`${countText(currentImportSummary?.recordsFailed)} failed`}
                />
                <Chip
                  size="small"
                  label={`${countText(currentImportSummary?.totalRecordsHandled)} handled`}
                />
              </Stack>
            </Stack>
            <Divider />
            {importedRows.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHead
                    sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }}
                  >
                    <TableRow>
                      <TableCell sx={{ width: '24%' }}>Record</TableCell>
                      <TableCell sx={{ width: '14%' }}>Status</TableCell>
                      <TableCell sx={{ width: '22%' }}>Target</TableCell>
                      <TableCell sx={{ width: '40%' }}>Message</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pagedImportedRows.map((row, index) => {
                      const sourceRecordIndex = validationRows.findIndex(
                        (candidate) => candidate === row,
                      );
                      const displayRowNumber =
                        sourceRecordIndex >= 0
                          ? sourceRecordIndex + 1
                          : validationPage * validationRowsPerPage + index + 1;
                      return (
                        <TableRow
                          key={`${row.fileName ?? 'file'}-${row.recordKey ?? index}`}
                        >
                          <TableCell sx={{ maxWidth: 280 }}>
                            <Typography sx={{ fontWeight: 800 }}>
                              #{displayRowNumber.toString()}
                            </Typography>
                            {row.recordKey ? (
                              <Typography
                                color="text.secondary"
                                variant="caption"
                                sx={{ display: 'block', wordBreak: 'break-all' }}
                              >
                                {row.recordKey}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell sx={{ whiteSpace: 'nowrap' }}>
                            <Chip color="success" label="Imported" size="small" />
                          </TableCell>
                          <TableCell>
                            {titleCase(
                              row.schemaName ?? selectedSchema?.schemaName ?? 'record',
                            )}
                          </TableCell>
                          <TableCell>Record was installed successfully.</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={importedRows.length}
                  page={validationPage}
                  rowsPerPage={validationRowsPerPage}
                  rowsPerPageOptions={[10, 25, 50, 100]}
                  sx={{ borderTop: 1, borderColor: 'divider' }}
                  onPageChange={(_, page) => setValidationPage(page)}
                  onRowsPerPageChange={(event) => {
                    setValidationRowsPerPage(Number(event.target.value));
                    setValidationPage(0);
                  }}
                />
              </Box>
            ) : currentImportFailures.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Table size="small" sx={{ minWidth: 960 }}>
                  <TableHead
                    sx={{ bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04) }}
                  >
                    <TableRow>
                      <TableCell sx={{ width: '24%' }}>Record</TableCell>
                      <TableCell sx={{ width: '20%' }}>Target</TableCell>
                      <TableCell sx={{ width: '32%' }}>Message</TableCell>
                      <TableCell sx={{ width: '24%' }}>How to fix</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentImportFailures.slice(0, 100).map((failure, index) => (
                      <TableRow
                        key={`${failure.fileName ?? 'file'}-${failure.recordKey ?? index}`}
                      >
                        <TableCell sx={{ maxWidth: 280 }}>
                          <Typography sx={{ fontWeight: 800 }}>
                            #{(failure.rowNumber ?? index + 1).toString()}
                          </Typography>
                          {failure.recordKey ? (
                            <Typography
                              color="text.secondary"
                              variant="caption"
                              sx={{ display: 'block', wordBreak: 'break-all' }}
                            >
                              {failure.recordKey}
                            </Typography>
                          ) : null}
                        </TableCell>
                        <TableCell>{importFailureTarget(failure)}</TableCell>
                        <TableCell sx={{ maxWidth: 360 }}>
                          {importFailureMessage(failure)}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 340 }}>
                          {importFailureHowToFix(failure)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {currentImportFailures.length > 100 ? (
                  <Typography color="text.secondary" variant="caption" sx={{ p: 1.5 }}>
                    Showing first 100 failed records. Use import history for the
                    complete backend run record.
                  </Typography>
                ) : null}
              </Box>
            ) : (
              <Alert severity="success">
                All dispatched records completed successfully. The backend did not
                return row-level execution details for this run.
              </Alert>
            )}
          </Stack>
        </Paper>
      ) : null}
      {install.isSuccess ? (
        <Alert severity="success">
          File import completed. {installationSummaryText(install.data)}. Refresh
          history to review the backend run record.
        </Alert>
      ) : null}
    </Stack>
  );
}
