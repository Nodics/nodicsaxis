'use strict';

/** @description Nodics Axis documentation template slots. */
module.exports = {
  record0: {
    code: 'axisDocumentationNavigationSlot',
    template: 'axisDocumentationArticleTemplate',
    name: 'navigation',
    minItems: 1,
    maxItems: 1,
    allowedComponentTypes: ['axisDocumentationNavigationComponentType'],
    active: true,
  },
  record1: {
    code: 'axisDocumentationArticleSlot',
    template: 'axisDocumentationArticleTemplate',
    name: 'article',
    minItems: 1,
    maxItems: 1,
    allowedComponentTypes: ['axisDocumentationArticleComponentType'],
    active: true,
  },
};
