'use strict';

/** @description Nodics Axis documentation page and component types. */
module.exports = {
  record0: {
    code: 'axisDocumentationArticlePageType',
    kind: 'PAGE',
    contractVersion: 2,
    active: true,
  },
  record1: {
    code: 'axisDocumentationArticleComponentType',
    kind: 'COMPONENT',
    contractVersion: 2,
    propertySchema: {
      code: 'string',
      title: 'string',
      route: 'string',
      section: 'string',
      sectionTitle: 'string',
      audience: 'array',
      summary: 'string',
      headings: 'array',
      blocks: 'array',
      searchText: 'string',
      previous: 'object',
      next: 'object',
    },
    active: true,
  },
  record2: {
    code: 'axisDocumentationNavigationComponentType',
    kind: 'COMPONENT',
    contractVersion: 2,
    propertySchema: {
      title: 'string',
      searchLabel: 'string',
      searchPlaceholder: 'string',
      emptyMessage: 'string',
      sections: 'array',
      items: 'array',
    },
    active: true,
  },
};
