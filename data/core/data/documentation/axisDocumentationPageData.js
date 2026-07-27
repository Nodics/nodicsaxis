'use strict';

/** @description Nodics Axis documentation pages. */
const pages = [
  ['overview', 'What Is Nodics Axis?'],
  ['architecture', 'Architecture and Repository Boundaries'],
  ['technology-stack', 'Technology Stack and Package Versions'],
  ['setup', 'Install, Configure, and Start Axis'],
  ['pages-and-renderers', 'Pages, Components, and Renderers'],
  ['backend-contracts', 'Backend Contracts and Security'],
  ['responsive-accessibility', 'Responsive and Accessible Experiences'],
  ['extend-and-test', 'Extend, Troubleshoot, and Verify Axis'],
];

module.exports = Object.fromEntries(
  pages.map((page, index) => [
    'record' + index,
    {
      code: 'axisDocsPage' + page[0].replaceAll('-', ''),
      name: page[1],
      cmsSite: ['axisDocumentationSite'],
      typeCode: 'axisDocumentationArticlePageType',
      template: 'axisDocumentationArticleTemplate',
      renderer: 'documentation.page.article',
      cmsComponents: [
        {
          target: 'axisDocumentationNavigation',
          slot: 'navigation',
          index: 5,
          active: true,
        },
        {
          target: 'axisDocsComponent' + page[0].replaceAll('-', ''),
          slot: 'article',
          index: 10,
          active: true,
        },
      ],
      active: true,
    },
  ]),
);
