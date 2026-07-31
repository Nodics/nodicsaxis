import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { selectModuleConnection } from '../../../bootstrap/publicBootstrap';
import type { WorkbenchClientConfiguration } from '../../../workbench/api/workbenchClient';
import {
  uploadMedia,
  type MediaFolderUploadPolicy,
  type MediaSourceContext,
  type MediaUploadResult,
} from '../api/mediaStoragePolicyClient';
import {
  defaultFormatForSourceType,
  manualUploadSourceTypesForPolicies,
  mediaSourceType,
  moduleForSourceType,
  schemaForSourceType,
  selectPreferredUploadPolicy,
  targetRequiredForSourceType,
} from '../mediaSourceContextPolicy';
import { MediaPreview } from './MediaPreview';

type ModuleConnection = ReturnType<typeof selectModuleConnection>;

interface MediaUploadWizardProps {
  readonly connection: ModuleConnection;
  readonly configuration: WorkbenchClientConfiguration;
  readonly enterpriseCode: string;
  readonly error: unknown;
  readonly formatBytes: (value: number | undefined) => string;
  readonly loading: boolean;
  readonly onEnterpriseCodeChange: (enterpriseCode: string) => void;
  readonly onUploaded: (media: MediaUploadResult) => void;
  readonly policies: readonly MediaFolderUploadPolicy[];
  readonly sourceContexts: readonly MediaSourceContext[] | undefined;
  readonly tenantCode: string;
}

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

function validEnterpriseCode(value: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(value.trim());
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
  formatBytes: (value: number | undefined) => string,
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
  const allowedMimeTypes = policy.allowedMimeTypes
    .map((mimeType) => mimeType.trim().toLowerCase())
    .filter(Boolean);
  if (
    file.type &&
    allowedMimeTypes.length > 0 &&
    !allowedMimeTypes.includes('*/*') &&
    !allowedMimeTypes.includes(file.type.toLowerCase())
  ) {
    return `${file.type} files are not allowed for ${policyScope}. Choose a backend-approved MIME type, or select a different source type.`;
  }
  if (policy.maxFileSizeBytes && file.size > policy.maxFileSizeBytes) {
    return `${file.name} is ${formatBytes(file.size)}, which is larger than the ${formatBytes(policy.maxFileSizeBytes)} backend upload limit for ${policyScope}.`;
  }
  return undefined;
}

function maxUploadSizeLabel(
  policy: MediaFolderUploadPolicy | undefined,
  formatBytes: (value: number | undefined) => string,
): string {
  return policy?.maxFileSizeBytes
    ? formatBytes(policy.maxFileSizeBytes)
    : 'backend default';
}

function MediaUploadReview(props: {
  readonly file: File;
  readonly formatBytes: (value: number | undefined) => string;
  readonly onRemove: () => void;
  readonly policy: MediaFolderUploadPolicy;
  readonly policyIssue: string | undefined;
}) {
  return (
    <MediaPreview
      file={props.file}
      fileName={props.file.name}
      formatBytes={props.formatBytes}
      mimeType={props.file.type}
      policy={{
        allowedExtensions: props.policy.allowedExtensions,
        allowedMimeTypes: props.policy.allowedMimeTypes,
        maxFileSizeBytes: props.policy.maxFileSizeBytes,
      }}
      policyIssue={props.policyIssue}
      sizeBytes={props.file.size}
      source="file"
      onRemove={props.onRemove}
    />
  );
}

export function MediaUploadWizard(props: MediaUploadWizardProps) {
  const [selectedSourceType, setSelectedSourceType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File>();
  const selectedEnterpriseCode = props.enterpriseCode.trim();
  const enterpriseCodeIssue = validEnterpriseCode(selectedEnterpriseCode)
    ? undefined
    : 'Enter a valid target enterprise code before selecting media.';
  const uploadablePolicies = useMemo(
    () =>
      props.policies.filter(
        (policy) =>
          mediaSourceType(policy.folderCode, props.sourceContexts) !== 'Data exports',
      ),
    [props.policies, props.sourceContexts],
  );
  const uploadableSourceTypes = useMemo(
    () => manualUploadSourceTypesForPolicies(uploadablePolicies, props.sourceContexts),
    [props.sourceContexts, uploadablePolicies],
  );
  const selectedPolicy = selectPreferredUploadPolicy(
    uploadablePolicies,
    selectedSourceType,
    props.sourceContexts,
  );
  const selectedModuleName = moduleForSourceType(
    selectedSourceType,
    props.sourceContexts,
  );
  const selectedSchemaName = schemaForSourceType(
    selectedSourceType,
    props.sourceContexts,
  );
  const selectedTargetRequired = targetRequiredForSourceType(
    selectedSourceType,
    props.sourceContexts,
  );
  const selectedTargetIssue =
    selectedTargetRequired && (!selectedModuleName || !selectedSchemaName)
      ? 'This source type requires a backend target module and schema before Axis can accept a file.'
      : undefined;
  const selectedFilePolicyIssue = filePolicyIssue(
    selectedPolicy,
    selectedFile,
    props.formatBytes,
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
        props.formatBytes,
        selectedSourceType,
      );
      if (policyIssue) throw new Error(policyIssue);
      if (selectedTargetIssue) throw new Error(selectedTargetIssue);
      return uploadMedia(props.connection, props.configuration, {
        file: selectedFile,
        folderCode: selectedPolicy.folderCode,
        formatCode: defaultFormatForSourceType(
          selectedSourceType,
          selectedPolicy.folderCode,
          props.sourceContexts,
        ),
        name: selectedFile.name,
        description: `Uploaded from Nodics Axis Media Management as ${selectedSourceType}`,
        ...(selectedModuleName ? { moduleName: selectedModuleName } : {}),
        ...(selectedSchemaName ? { schemaName: selectedSchemaName } : {}),
      });
    },
    onSuccess: (media) => {
      setSelectedFile(undefined);
      props.onUploaded(media);
    },
  });
  const canUpload = Boolean(
    props.connection &&
    !enterpriseCodeIssue &&
    selectedPolicy &&
    selectedFile &&
    !selectedFilePolicyIssue &&
    !selectedTargetIssue &&
    !upload.isPending,
  );

  return (
    <Stack spacing={2}>
      {props.loading ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={20} />
          <Typography color="text.secondary">Loading upload policy…</Typography>
        </Stack>
      ) : props.error ? (
        <Alert severity="error">
          {props.error instanceof Error
            ? props.error.message
            : 'Media upload policy is unavailable.'}
        </Alert>
      ) : uploadableSourceTypes.length === 0 ? (
        <Alert severity="warning">
          No manually uploadable media source types are available for this session.
        </Alert>
      ) : (
        <>
          <Box
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: 'minmax(0, 1fr) 240px',
                  },
                  alignItems: 'flex-start',
                }}
              >
                <TextField
                  fullWidth
                  error={Boolean(enterpriseCodeIssue)}
                  helperText={enterpriseCodeIssue ?? 'Authorized enterprise'}
                  label="Target enterprise"
                  value={props.enterpriseCode}
                  onChange={(event) => {
                    props.onEnterpriseCodeChange(event.target.value);
                    setSelectedSourceType('');
                    setSelectedFile(undefined);
                    upload.reset();
                  }}
                />
                <Stack
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    minHeight: 56,
                    justifyContent: 'center',
                    px: 1.5,
                    py: 0.75,
                  }}
                >
                  <Typography
                    color="text.secondary"
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      lineHeight: 1.2,
                      textTransform: 'uppercase',
                    }}
                  >
                    Tenant
                  </Typography>
                  <Typography noWrap sx={{ fontWeight: 700 }}>
                    {props.tenantCode}
                  </Typography>
                </Stack>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'minmax(0, 1fr) 240px',
                  },
                }}
              >
                <TextField
                  fullWidth
                  select
                  disabled={Boolean(enterpriseCodeIssue)}
                  label="Source type"
                  value={selectedSourceType}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      minHeight: 56,
                    },
                  }}
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

                <Button
                  component="label"
                  disabled={
                    Boolean(enterpriseCodeIssue) ||
                    !selectedPolicy ||
                    Boolean(selectedTargetIssue) ||
                    upload.isPending
                  }
                  sx={{
                    height: 56,
                    justifySelf: 'stretch',
                    mt: { lg: 0 },
                  }}
                  variant="outlined"
                >
                  Choose file
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

                {selectedPolicy ? (
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      flexWrap: 'wrap',
                      gridColumn: { xs: '1', lg: '1 / 2' },
                    }}
                  >
                    <Chip
                      label={`Allowed: ${allowedExtensionLabel(selectedPolicy)}`}
                      size="small"
                    />
                    <Chip
                      label={`Max size: ${maxUploadSizeLabel(selectedPolicy, props.formatBytes)}`}
                      size="small"
                    />
                  </Stack>
                ) : (
                  <Typography
                    color="text.secondary"
                    sx={{ gridColumn: { xs: '1', lg: '1 / 2' } }}
                    variant="body2"
                  >
                    Select a source type to enable file selection.
                  </Typography>
                )}

                {selectedTargetIssue ? (
                  <Alert
                    severity="warning"
                    sx={{ gridColumn: { xs: '1', lg: '1 / -1' } }}
                  >
                    {selectedTargetIssue}
                  </Alert>
                ) : null}
              </Box>

              {enterpriseCodeIssue ? (
                <Alert severity="warning">{enterpriseCodeIssue}</Alert>
              ) : null}
            </Stack>
          </Box>

          {selectedFile ? (
            <Box
              sx={{
                border: 1,
                borderColor: selectedFilePolicyIssue ? 'warning.light' : 'divider',
                borderRadius: 2,
                p: 2,
              }}
            >
              <Stack spacing={1.5}>
                {selectedPolicy ? (
                  <MediaUploadReview
                    file={selectedFile}
                    formatBytes={props.formatBytes}
                    onRemove={() => {
                      setSelectedFile(undefined);
                      upload.reset();
                    }}
                    policy={selectedPolicy}
                    policyIssue={selectedFilePolicyIssue}
                  />
                ) : null}

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { sm: 'center' } }}
                >
                  <Button
                    disabled={!canUpload}
                    onClick={() => upload.mutate()}
                    variant="contained"
                  >
                    Upload to media
                  </Button>
                  {upload.isPending ? (
                    <Typography color="text.secondary" variant="body2">
                      Uploading…
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </Box>
          ) : null}

          {selectedFilePolicyIssue ? (
            <Alert severity="warning">{selectedFilePolicyIssue}</Alert>
          ) : null}
          {upload.error ? (
            <Alert severity="error">{presentMediaUploadError(upload.error)}</Alert>
          ) : null}
          {upload.data ? (
            <Alert severity="success">
              Media uploaded as {upload.data.code}. The media record list has been
              refreshed.
            </Alert>
          ) : null}
        </>
      )}
    </Stack>
  );
}
