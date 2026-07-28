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
  MenuItem,
  Paper,
  Stack,
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
  MediaImportOperationResult,
  MediaUploadSummary,
} from '../api/dataReleaseContracts';

interface FileImportWorkspaceProps {
  readonly configuration: DataReleaseClientConfiguration;
  readonly enterpriseCode: string;
  readonly importConnection: AxisModuleConnection | undefined;
  readonly mediaConnection: AxisModuleConnection | undefined;
  readonly schemaConnections: readonly AxisModuleConnection[];
  readonly systemConnection: AxisModuleConnection | undefined;
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
  return [
    `${countText(summary?.recordsRead)} record(s) read`,
    `${countText(summary?.recordsFinalized)} finalized for review`,
    `${countText(summary?.validationErrors)} validation issue(s)`,
  ].join(' · ');
}

function installationSummaryText(result: MediaImportOperationResult): string {
  const summary = result.importRun?.summary;
  return [
    `${countText(summary?.recordsDispatched)} dispatched`,
    `${countText(summary?.recordsSucceeded)} succeeded`,
    `${countText(summary?.recordsFailed)} failed`,
  ].join(' · ');
}

export function FileImportWorkspace(props: FileImportWorkspaceProps) {
  const [schemaKey, setSchemaKey] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [targetEnterpriseCode, setTargetEnterpriseCode] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadedMedia, setUploadedMedia] = useState<MediaUploadSummary | undefined>(
    undefined,
  );
  const [validatedMediaCode, setValidatedMediaCode] = useState<string | undefined>(
    undefined,
  );
  const workbenchConfiguration = useMemo<WorkbenchClientConfiguration>(
    () => ({
      accessToken: props.configuration.accessToken,
      enterpriseCode: props.configuration.enterpriseCode,
      timeoutMs: props.configuration.timeoutMs,
    }),
    [
      props.configuration.accessToken,
      props.configuration.enterpriseCode,
      props.configuration.timeoutMs,
    ],
  );

  const schemas = useQuery({
    queryKey: ['file-import-schemas', props.configuration.enterpriseCode],
    queryFn: () => {
      if (props.schemaConnections.length === 0) {
        throw new Error('Schema discovery is unavailable');
      }
      return loadWorkbenchSchemas(props.schemaConnections, workbenchConfiguration);
    },
    enabled: props.schemaConnections.length > 0,
  });
  const schemaOptions = useMemo(
    () => {
      const byKey = new Map<string, WorkbenchSchema>();
      for (const schema of schemas.data ?? []) {
        byKey.set(`${schema.moduleName}/${schema.schemaName}`, schema);
      }
      return Object.freeze([...byKey.values()]);
    },
    [schemas.data],
  );
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
      if (!selectedSchema) throw new Error('Choose a target model before uploading');
      if (!file) throw new Error('Select a file before uploading');
      return uploadImportMedia(props.mediaConnection, props.configuration, file);
    },
    onSuccess: (media) => {
      setUploadedMedia(media);
      setValidatedMediaCode(undefined);
    },
  });
  const validate = useMutation({
    mutationFn: async () => {
      if (!props.systemConnection)
        throw new Error('System import service is unavailable');
      if (!hasTargetEnterprise)
        throw new Error('Select the target enterprise before validation');
      if (!uploadedMedia || !selectedSchema)
        throw new Error('Upload a file and select a target model first');
      return validateMediaImport(props.systemConnection, props.configuration, {
        mediaCode: uploadedMedia.mediaCode,
        moduleName: selectedSchema.moduleName,
        schemaName: selectedSchema.schemaName,
        operation: 'saveAll',
      });
    },
    onSuccess: () => {
      setValidatedMediaCode(uploadedMedia?.mediaCode);
    },
  });
  const install = useMutation({
    mutationFn: async () => {
      if (!props.systemConnection)
        throw new Error('System import service is unavailable');
      if (!hasTargetEnterprise)
        throw new Error('Select the target enterprise before importing');
      if (!uploadedMedia || !selectedSchema)
        throw new Error('Upload a file and select a target model first');
      return installMediaImport(props.systemConnection, props.configuration, {
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
    !props.systemConnection ? 'System import execution' : undefined,
  ].filter((value): value is string => Boolean(value));
  const operationError =
    upload.error?.message ?? validate.error?.message ?? install.error?.message;
  const hasTargetEnterprise = targetEnterpriseCode.trim().length > 0;
  const canChooseModel = hasTargetEnterprise;
  const canChooseFile = Boolean(selectedSchema);
  const canValidate = Boolean(hasTargetEnterprise && uploadedMedia && selectedSchema);
  const canInstall = canValidate && validatedMediaCode === uploadedMedia?.mediaCode;
  const busy = upload.isPending || validate.isPending || install.isPending;
  const hasFileSelection = Boolean(file || uploadedMedia);
  const clearSelectedFile = () => {
    setFile(undefined);
    setUploadedMedia(undefined);
    setValidatedMediaCode(undefined);
    upload.reset();
    validate.reset();
    install.reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
                        }}
                      >
                        <MenuItem value={props.enterpriseCode}>
                          {titleCase(props.enterpriseCode)}
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
                      <Typography sx={{ fontWeight: 700 }}>{props.tenantCode}</Typography>
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
                {hasTargetEnterprise && schemas.isSuccess && schemaOptions.length === 0 ? (
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
                        <Chip
                          label="Operation: Save or update records"
                          size="small"
                        />
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
                    sx={{ alignItems: 'flex-start', gap: 1, justifyContent: 'space-between' }}
                  >
                    <Stack spacing={0.5}>
                      <Typography component="p" sx={{ fontWeight: 700 }}>
                        {uploadedMedia
                          ? uploadName(uploadedMedia)
                          : (file?.name ?? 'No file selected')}
                      </Typography>
                      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                        {uploadedMedia ? (
                          <Chip label={`Media: ${uploadedMedia.mediaCode}`} size="small" />
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
                        <Box component="span" sx={{ fontSize: '1.25rem', lineHeight: 1 }}>
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
          disabled={busy || !canValidate || !props.systemConnection}
          variant="outlined"
          onClick={() => validate.mutate()}
        >
          {validate.isPending ? 'Validating…' : 'Validate file import'}
        </Button>
        <Button
          disabled={busy || !canInstall || !props.systemConnection}
          variant="contained"
          onClick={() => install.mutate()}
        >
          {install.isPending ? 'Importing…' : 'Install imported data'}
        </Button>
      </Stack>
      {canValidate && !canInstall ? (
        <Alert severity="info">
          Validate this uploaded file before installation. If you change the file or
          contract, validation must be repeated.
        </Alert>
      ) : null}
      {operationError ? <Alert severity="error">{operationError}</Alert> : null}
      {validate.isSuccess ? (
        <Alert severity="success">
          File import validation completed for {uploadName(uploadedMedia)}.{' '}
          {validationSummaryText(validate.data)}
        </Alert>
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
