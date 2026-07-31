import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { AxisModuleConnection } from '../../../../src/bootstrap/publicBootstrap';
import type { WorkbenchClientConfiguration } from '../../../../src/workbench/api/workbenchClient';
import {
  uploadMedia,
  type MediaFolderUploadPolicy,
  type MediaSourceContext,
  type MediaUploadResult,
} from '../../../../src/operations/mediaManagement/api/mediaStoragePolicyClient';
import { MediaUploadWizard } from '../../../../src/operations/mediaManagement/components/MediaUploadWizard';

vi.mock(
  '../../../../src/operations/mediaManagement/api/mediaStoragePolicyClient',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('../../../../src/operations/mediaManagement/api/mediaStoragePolicyClient')
      >();
    return {
      ...actual,
      uploadMedia: vi.fn(),
    };
  },
);

const connection: AxisModuleConnection = {
  moduleName: 'media',
  instanceId: 'local:monoServer:media:1',
  endpoint: 'http://localhost:3000/nodics/media',
  environment: 'startioLocal',
  state: 'UP',
};

const configuration: WorkbenchClientConfiguration = {
  accessToken: 'employee-token',
  enterpriseCode: 'default',
  timeoutMs: 1000,
};

function formatBytes(value: number | undefined): string {
  if (value === undefined) return '—';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function policy(folderCode: string): MediaFolderUploadPolicy {
  return Object.freeze({
    folderCode,
    label: folderCode,
    access: folderCode === 'cmsAssets' ? 'PUBLIC' : 'PRIVATE',
    allowedExtensions: Object.freeze(['png']),
    allowedMimeTypes: Object.freeze(['image/png']),
    checksumAlgorithm: 'sha256',
    maxFileSizeBytes: 1024,
  });
}

function context(
  code: string,
  sourceType: string,
  folderCode: string,
  manualUploadEnabled: boolean,
): MediaSourceContext {
  const folderPolicy = policy(folderCode);
  return Object.freeze({
    code,
    sourceType,
    aliases: Object.freeze([code, folderCode]),
    label: sourceType,
    description: `${sourceType} context`,
    folderCodes: Object.freeze([folderCode]),
    defaultFolderCode: folderCode,
    allowedFolders: Object.freeze([
      Object.freeze({
        ...folderPolicy,
        storagePrefix: `media/${folderCode}`,
        retentionDays: 0,
      }),
    ]),
    allowedFormatCodes: Object.freeze(['original']),
    defaultFormatCode: 'original',
    defaultModuleName: sourceType === 'Content media' ? 'cms' : undefined,
    defaultSchemaName: sourceType === 'Content media' ? 'cmsComponent' : undefined,
    targetRequired: false,
    manualUploadEnabled,
    storageRouteTemplate: `media/${folderCode}/{mediaCode}.{extension}`,
  });
}

const sourceContexts: readonly MediaSourceContext[] = Object.freeze([
  context('contentMedia', 'Content media', 'cmsAssets', true),
  context('dataExports', 'Data exports', 'exportFiles', false),
]);

function renderWizard(props?: {
  readonly onUploaded?: (media: MediaUploadResult) => void;
}) {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MediaUploadWizard
        connection={connection}
        configuration={configuration}
        error={undefined}
        formatBytes={formatBytes}
        loading={false}
        onUploaded={props?.onUploaded ?? vi.fn()}
        policies={[policy('cmsAssets'), policy('exportFiles')]}
        sourceContexts={sourceContexts}
      />
    </QueryClientProvider>,
  );
}

async function selectContentMediaAndUpload(file: File) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('combobox', { name: 'Source type' }));
  await user.click(await screen.findByRole('option', { name: 'Content media' }));
  const fileInput = document.querySelector('input[type="file"]');
  expect(fileInput).toBeInstanceOf(HTMLInputElement);
  await user.upload(fileInput as HTMLInputElement, file);
  return user;
}

afterEach(() => {
  vi.clearAllMocks();
});

describe('MediaUploadWizard', () => {
  it('offers only backend contexts that allow manual upload', async () => {
    const user = userEvent.setup();
    renderWizard();

    expect(
      screen.queryByRole('button', { name: 'Choose media' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('combobox', { name: 'Source type' }));

    expect(await screen.findByRole('option', { name: 'Content media' })).toBeVisible();
    expect(
      screen.queryByRole('option', { name: 'Data exports' }),
    ).not.toBeInTheDocument();
  });

  it('uploads through nMedia with backend-derived context and reports the created media', async () => {
    const user = userEvent.setup();
    const onUploaded = vi.fn();
    const uploadMediaMock = vi.mocked(uploadMedia);
    uploadMediaMock.mockResolvedValue({
      code: 'media_content_001',
      name: 'hero.png',
      originalFileName: 'hero.png',
      folderCode: 'cmsAssets',
      formatCode: 'original',
      access: 'PUBLIC',
      status: 'ACTIVE',
      mimeType: 'image/png',
      extension: 'png',
      sizeBytes: 8,
      accessUrl: undefined,
    });
    renderWizard({ onUploaded });

    await user.click(screen.getByRole('combobox', { name: 'Source type' }));
    await user.click(await screen.findByRole('option', { name: 'Content media' }));
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInstanceOf(HTMLInputElement);
    await user.upload(
      fileInput as HTMLInputElement,
      new File(['png-data'], 'hero.png', { type: 'image/png' }),
    );
    await user.click(screen.getByRole('button', { name: 'Upload to media' }));

    await waitFor(() => expect(uploadMediaMock).toHaveBeenCalledTimes(1));
    expect(uploadMediaMock).toHaveBeenCalledWith(connection, configuration, {
      file: expect.any(File),
      folderCode: 'cmsAssets',
      formatCode: 'original',
      name: 'hero.png',
      description: 'Uploaded from Nodics Axis Media Management as Content media',
      moduleName: 'cms',
      schemaName: 'cmsComponent',
    });
    await waitFor(() =>
      expect(onUploaded).toHaveBeenCalledWith(
        expect.objectContaining({ code: 'media_content_001' }),
      ),
    );
    expect(
      await screen.findByText(/Media uploaded as media_content_001/i),
    ).toBeVisible();
  });

  it('blocks unsupported file extensions before calling nMedia', async () => {
    const uploadMediaMock = vi.mocked(uploadMedia);
    renderWizard();

    await selectContentMediaAndUpload(
      new File(['not-png'], 'hero.gif', { type: 'image/png' }),
    );

    expect(await screen.findAllByText(/\.gif files are not allowed/i)).not.toHaveLength(
      0,
    );
    expect(screen.getByRole('button', { name: 'Upload to media' })).toBeDisabled();
    expect(uploadMediaMock).not.toHaveBeenCalled();
  });

  it('blocks oversized files before calling nMedia', async () => {
    const uploadMediaMock = vi.mocked(uploadMedia);
    renderWizard();

    await selectContentMediaAndUpload(
      new File(['x'.repeat(1025)], 'hero.png', { type: 'image/png' }),
    );

    expect(
      await screen.findAllByText(/larger than the 1\.0 KB backend upload limit/i),
    ).not.toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Upload to media' })).toBeDisabled();
    expect(uploadMediaMock).not.toHaveBeenCalled();
  });

  it('presents backend upload policy failures without service-name prefixes', async () => {
    const uploadMediaMock = vi.mocked(uploadMedia);
    uploadMediaMock.mockRejectedValue(
      new Error('Media upload failed: Backend policy rejected this file.'),
    );
    renderWizard();

    const user = await selectContentMediaAndUpload(
      new File(['png-data'], 'hero.png', { type: 'image/png' }),
    );
    await user.click(screen.getByRole('button', { name: 'Upload to media' }));

    expect(await screen.findByText('Backend policy rejected this file.')).toBeVisible();
    expect(
      screen.queryByText(/Media upload failed: Backend policy rejected this file/i),
    ).not.toBeInTheDocument();
  });
});
