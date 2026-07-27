'use strict';

/** @description Nodics core-import header for the Nodics Axis documentation content pack. */
module.exports = {
  catalog: {
    axisDocumentationCatalogData: {
      options: {
        enabled: true,
        schemaName: 'catalog',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationCatalogData',
      },
      query: { code: '$code' },
    },
  },
  cms: {
    axisDocumentationSiteData: {
      options: {
        enabled: true,
        schemaName: 'cmsSite',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationSiteData',
      },
      query: { code: '$code' },
    },
    axisDocumentationTypeCodeData: {
      options: {
        enabled: true,
        schemaName: 'cmsTypeCode',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationTypeCodeData',
      },
      query: { code: '$code' },
    },
    axisDocumentationRendererData: {
      options: {
        enabled: true,
        schemaName: 'cmsTypeCode2Renderer',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationRendererData',
      },
      query: { code: '$code' },
    },
    axisDocumentationSlotData: {
      options: {
        enabled: true,
        schemaName: 'cmsSlotDefinition',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationSlotData',
      },
      query: { code: '$code' },
    },
    axisDocumentationTemplateData: {
      options: {
        enabled: true,
        schemaName: 'cmsPageTemplate',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationTemplateData',
      },
      query: { code: '$code' },
    },
    axisDocumentationComponentData: {
      options: {
        enabled: true,
        schemaName: 'cmsComponent',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationComponentData',
      },
      query: { code: '$code' },
    },
    axisDocumentationPageData: {
      options: {
        enabled: true,
        schemaName: 'cmsPage',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationPageData',
      },
      query: { code: '$code' },
    },
    axisDocumentationRouteData: {
      options: {
        enabled: true,
        schemaName: 'cmsPageRoute',
        operation: 'saveAll',
        dataFilePrefix: 'axisDocumentationRouteData',
      },
      query: { code: '$code' },
    },
  },
};
