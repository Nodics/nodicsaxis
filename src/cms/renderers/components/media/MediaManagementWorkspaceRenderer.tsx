import {
  MediaManagementRoutePage,
  type MediaDetailPresentation,
  type MediaDetailSection,
} from '../../../../operations/mediaManagement/MediaManagementRoutePage';
import type { MediaMetadataField } from '../../../../operations/mediaManagement/components/MediaMetadataViewer';
import type { CmsComponentContract } from '../../../cmsContract';
import { arrayProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

const supportedMediaDetailSections = new Set<MediaDetailSection>([
  'actions',
  'preview',
  'usage',
  'importExport',
  'metadata',
]);

function detailSectionsFromComponent(
  component: CmsComponentContract,
): readonly MediaDetailSection[] | undefined {
  const values = arrayProperty(component, 'detailSections');
  if (!values.length) return undefined;

  return Object.freeze(
    values.map((value, index) => {
      if (
        typeof value !== 'string' ||
        !supportedMediaDetailSections.has(value as MediaDetailSection)
      ) {
        throw new Error(
          `${component.code}.detailSections[${index}] must be a supported media detail section`,
        );
      }
      return value as MediaDetailSection;
    }),
  );
}

function metadataFieldsFromComponent(
  component: CmsComponentContract,
): readonly MediaMetadataField[] | undefined {
  const values = arrayProperty(component, 'metadataFields');
  if (!values.length) return undefined;

  return Object.freeze(
    values.map((value, index) => {
      if (!value || typeof value !== 'object' || Array.isArray(value)) {
        throw new Error(`${component.code}.metadataFields[${index}] must be an object`);
      }

      const record = value as Record<string, unknown>;
      if (typeof record.key !== 'string' || !record.key.trim()) {
        throw new Error(
          `${component.code}.metadataFields[${index}].key must be a non-empty string`,
        );
      }
      if (typeof record.label !== 'string' || !record.label.trim()) {
        throw new Error(
          `${component.code}.metadataFields[${index}].label must be a non-empty string`,
        );
      }

      return Object.freeze({
        key: record.key.trim(),
        label: record.label.trim(),
      });
    }),
  );
}

function mediaDetailPresentationFromComponent(
  component: CmsComponentContract,
): MediaDetailPresentation | undefined {
  const detailSections = detailSectionsFromComponent(component);
  const metadataFields = metadataFieldsFromComponent(component);

  if (!detailSections && !metadataFields) return undefined;

  return Object.freeze({
    detailSections,
    metadataFields,
  });
}

export function MediaManagementWorkspaceRenderer({
  actions,
  component,
}: CmsComponentRendererProps) {
  const controller = actions?.mediaManagement;
  if (!controller) {
    throw new Error('Media Management renderer requires its presentation controller');
  }
  return (
    <MediaManagementRoutePage
      accessToken={controller.accessToken}
      bootstrap={controller.bootstrap}
      mediaDetailPresentation={mediaDetailPresentationFromComponent(component)}
      runtime={controller.runtime}
    />
  );
}
