import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

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
  mediaFormatLabel,
  mediaSourceType,
  moduleForSourceType,
  schemaForSourceType,
  selectPreferredUploadPolicy,
  sourceTypeStorageRouteLabel,
  sourceTypeUploadPurpose,
} from '../mediaSourceContextPolicy';

type ModuleConnection = ReturnType<typeof selectModuleConnection>;

interface MediaUploadWizardProps {
  readonly connection: ModuleConnection;
  readonly configuration: WorkbenchClientConfiguration;
  readonly error: unknown;
  readonly formatBytes: (value: number | undefined) => string;
  readonly loading: boolean;
  readonly onUploaded: (media: MediaUploadResult) => void;
  readonly policies: readonly MediaFolderUploadPolicy[];
  readonly sourceContexts: readonly MediaSourceContext[] | undefined;
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

function csvStructureSummary(content: string): string {
  const rows = content
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean);
  if (rows.length === 0) return 'CSV summary: empty file.';
  const headers =
    rows[0]
      ?.split(',')
      .map((header) => header.trim())
      .filter(Boolean) ?? [];
  const dataRowCount = Math.max(rows.length - 1, 0);
  const sampleHeaders = headers.slice(0, 6).join(', ');
  return `CSV summary: ${headers.length} columns, ${dataRowCount} data rows. Headers: ${sampleHeaders || 'none detected'}.`;
}

function jsonStructureSummary(content: string): string {
  try {
    const value = JSON.parse(content) as unknown;
    if (Array.isArray(value)) {
      return `JSON summary: array with ${value.length} top-level items.`;
    }
    if (typeof value === 'object' && value !== null) {
      const keys = Object.keys(value);
      return `JSON summary: object with ${keys.length} top-level keys: ${keys.slice(0, 8).join(', ') || 'none'}.`;
    }
    return `JSON summary: top-level ${typeof value}.`;
  } catch {
    return 'JSON summary: Axis could not parse this file locally. Backend validation will provide the authoritative result.';
  }
}

function localStructureSummary(file: File, content: string): string {
  const extension = extensionFromFileName(file.name);
  if (extension === 'csv') return csvStructureSummary(content);
  if (extension === 'json') return jsonStructureSummary(content);
  return '';
}

function imageDimensionSummary(image: HTMLImageElement): string {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) return 'Image summary: dimensions unavailable locally.';
  return `Image summary: ${width} × ${height} px.`;
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
  readonly policy: MediaFolderUploadPolicy;
  readonly policyIssue: string | undefined;
  readonly sourceType: string;
  readonly sourceContexts: readonly MediaSourceContext[] | undefined;
}) {
  const [textPreview, setTextPreview] = useState<
    | { readonly file: File; readonly summary: string; readonly value: string }
    | undefined
  >(undefined);
  const [imageSummary, setImageSummary] = useState<
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
    if (!imagePreviewUrl) return undefined;
    let cancelled = false;
    const image = new Image();
    image.onload = () => {
      if (cancelled) return;
      setImageSummary({
        file: props.file,
        value: imageDimensionSummary(image),
      });
    };
    image.onerror = () => {
      if (cancelled) return;
      setPreviewError({
        file: props.file,
        value: 'Axis could not read local image dimensions for this file.',
      });
    };
    image.src = imagePreviewUrl;
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
    };
  }, [imagePreviewUrl, props.file]);

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
            summary: localStructureSummary(props.file, content),
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
  const currentStructureSummary =
    textPreview?.file === props.file ? textPreview.summary : '';
  const currentImageSummary =
    imageSummary?.file === props.file ? imageSummary.value : '';
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
            label={`Format: ${mediaFormatLabel(defaultFormatForSourceType(props.sourceType, props.policy.folderCode, props.sourceContexts))}`}
            size="small"
          />
          <Chip
            label={`Extension: ${extension ? `.${extension}` : 'missing'}`}
            size="small"
          />
          <Chip label={`Size: ${props.formatBytes(props.file.size)}`} size="small" />
          <Chip
            label={`Allowed: ${allowedExtensionLabel(props.policy)}`}
            size="small"
          />
        </Stack>

        <Alert severity={props.policyIssue ? 'warning' : 'info'}>{reviewMessage}</Alert>

        {currentStructureSummary ? (
          <Alert severity="info">{currentStructureSummary}</Alert>
        ) : null}

        {currentImageSummary ? (
          <Alert severity="info">{currentImageSummary}</Alert>
        ) : null}

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

export function MediaUploadWizard(props: MediaUploadWizardProps) {
  const [selectedSourceType, setSelectedSourceType] = useState('');
  const [selectedFile, setSelectedFile] = useState<File>();
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
      const moduleName = moduleForSourceType(selectedSourceType, props.sourceContexts);
      const schemaName = schemaForSourceType(selectedSourceType, props.sourceContexts);
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
                      {sourceTypeUploadPurpose(
                        selectedSourceType,
                        props.sourceContexts,
                      )}
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
                            label={`Target route: ${sourceTypeStorageRouteLabel(selectedSourceType, props.sourceContexts)}`}
                            size="small"
                          />
                          <Chip
                            label={`Format: ${mediaFormatLabel(defaultFormatForSourceType(selectedSourceType, selectedPolicy.folderCode, props.sourceContexts))}`}
                            size="small"
                          />
                          <Chip
                            label={`Allowed: ${allowedExtensionLabel(selectedPolicy)}`}
                            size="small"
                          />
                          <Chip
                            label={`Max size: ${maxUploadSizeLabel(selectedPolicy, props.formatBytes)}`}
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
                        <Chip
                          label={props.formatBytes(selectedFile.size)}
                          size="small"
                        />
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
                    formatBytes={props.formatBytes}
                    policy={selectedPolicy}
                    policyIssue={selectedFilePolicyIssue}
                    sourceContexts={props.sourceContexts}
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
