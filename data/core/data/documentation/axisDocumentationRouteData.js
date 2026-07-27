'use strict';

/** @description Authenticated Nodics Axis documentation routes. */
const routes = [
  'overview',
  'architecture',
  'technology-stack',
  'setup',
  'pages-and-renderers',
  'backend-contracts',
  'responsive-accessibility',
  'extend-and-test',
];

module.exports = Object.fromEntries(
  routes.map((code, index) => [
    'record' + index,
    {
      code: 'axisDocsRoute' + code.replaceAll('-', ''),
      site: 'axisDocumentationSite',
      path: index === 0 ? '/docs/nodics-axis' : '/docs/nodics-axis/' + code,
      locale: 'en',
      channel: 'web',
      page: 'axisDocsPage' + code.replaceAll('-', ''),
      routeType: 'PAGE',
      deliveryState: 'ONLINE',
      accessMode: 'AUTHENTICATED',
      active: true,
    },
  ]),
);
