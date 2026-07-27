'use strict';

/** @description Detailed Nodics Axis documentation navigation and article content. */
const pages = [
  {
    code: 'overview',
    title: 'What Is Nodics Axis?',
    section: 'Understand Axis',
    summary:
      'Understand the reusable employee BackOffice client, what it owns, and what remains authoritative in Nodics.',
    blocks: [
      ['heading', 'Nodics Axis in plain language'],
      [
        'paragraph',
        'Nodics Axis is the responsive employee BackOffice web application for Nodics-based projects. It gives administrators, operators, merchandisers, content teams, and other authorized employees a governed way to discover modules and work with backend capabilities. It is not a customer storefront and customer accounts cannot use it.',
      ],
      ['heading', 'A client, not a second backend'],
      [
        'paragraph',
        'Axis renders pages and components, collects input, maintains bounded browser state, and calls authorized Nodics APIs. Nodics remains responsible for business rules, persistence, authentication, authorization, validation, workflows, pipelines, integrations, tenant governance, secrets, and audit behavior.',
      ],
      [
        'unordered-list',
        [
          'One Axis deployment administers one customer project.',
          'Every visible module and menu comes from the BackOffice bootstrap contract.',
          'CMS supplies configurable presentation data; Axis owns safe renderer implementations.',
          'Axis calls the owning module directly for business operations.',
          'No access token, refresh credential, password, or secret is persisted by browser code.',
        ],
      ],
      ['heading', 'Who should read this documentation'],
      [
        'paragraph',
        'Business users can learn what each workspace enables. Operators can install documentation and diagnose connectivity. Frontend developers can locate pages, components, API clients, renderers, and tests. Backend developers should use the linked Nodics capability documentation for authoritative business contracts.',
      ],
    ],
  },
  {
    code: 'architecture',
    title: 'Architecture and Repository Boundaries',
    section: 'Understand Axis',
    summary:
      'Learn how nodicsaxis, Nodics modules, CMS content, and customer projects remain independently owned.',
    blocks: [
      ['heading', 'Runtime separation'],
      [
        'paragraph',
        'The browser application and Nodics backend run as separate processes. Axis can be built and deployed independently, while Nodics modules may run together in a local monoServer or across multiple backend processes. The deployment topology never transfers business authority to the browser.',
      ],
      [
        'table',
        [
          ['Repository or runtime', 'Owns'],
          [
            'nodics',
            'Backend contracts, data, security, workflows, services, imports, and module discovery',
          ],
          [
            'nodicsaxis',
            'Employee UI rendering, interaction, responsive behavior, and client-side state',
          ],
          [
            'Customer project',
            'Project-specific backend modules, configuration, content, and deployment composition',
          ],
          ['nodicsdocs', 'Canonical Nodics framework documentation content pack'],
        ],
      ],
      ['heading', 'The request path'],
      [
        'ordered-list',
        [
          'Axis loads the public BackOffice bootstrap for Profile and CMS endpoints.',
          'Profile authenticates the employee and owns the browser session.',
          'Axis loads the secured BackOffice bootstrap.',
          'BackOffice returns permission-filtered module connections, navigation, policy, and documentation sources.',
          'Axis calls CMS or the owning business module directly.',
        ],
      ],
      ['heading', 'Avoid parallel authorities'],
      [
        'paragraph',
        'Do not add a frontend module registry, database connection, content importer, authorization engine, workflow executor, or provider credential store. Extend the corresponding Nodics contract and consume its client-safe response.',
      ],
    ],
  },
  {
    code: 'technology-stack',
    title: 'Technology Stack and Package Versions',
    section: 'Understand Axis',
    summary:
      'Review the frontend runtime, UI, routing, server-state, build, testing, and quality packages used by this Axis release.',
    blocks: [
      ['heading', 'Why these technologies are used'],
      [
        'paragraph',
        'Axis is a browser application with no backend business logic. Its technology stack is focused on typed React composition, backend-driven content rendering, direct Nodics API consumption, responsive enterprise UI, and repeatable automated verification. package.json and package-lock.json remain the dependency authority; this page records the versions used by this documentation release so developers and operators can understand the project without reading repository files first.',
      ],
      ['heading', 'Supported runtime tooling'],
      [
        'table',
        [
          ['Technology', 'Version or range', 'Purpose'],
          [
            'Node.js',
            '>=22 <23 or >=24 <25',
            'Supported local build, test, and development runtime',
          ],
          [
            'npm',
            '>=10 <12; project package manager npm 11.6.2',
            'Deterministic dependency installation using package-lock.json',
          ],
        ],
      ],
      ['heading', 'Application runtime packages'],
      [
        'table',
        [
          ['Package', 'Version', 'Responsibility'],
          ['React', '19.2.8', 'Component rendering and browser interaction'],
          ['React DOM', '19.2.8', 'React integration with the browser DOM'],
          [
            'React Router',
            '8.3.0',
            'Authentication, workspace, documentation, and deep-link routing',
          ],
          [
            'Material UI',
            '9.2.0',
            'Accessible enterprise components and theme integration',
          ],
          [
            'Emotion React / Styled',
            '11.14.0 / 11.14.1',
            'Material UI styling runtime and theme-aware styles',
          ],
          [
            'TanStack Query',
            '5.101.4',
            'Backend server-state requests, caching, retries, and invalidation',
          ],
        ],
      ],
      ['heading', 'Language and build packages'],
      [
        'table',
        [
          ['Package', 'Version', 'Responsibility'],
          [
            'TypeScript',
            '6.0.3',
            'Strict compile-time checking for UI and backend contracts',
          ],
          ['Vite', '8.1.5', 'Local development server and production build'],
          [
            'Vite React plugin',
            '6.0.4',
            'React transformation and development refresh support',
          ],
        ],
      ],
      ['heading', 'Testing and quality packages'],
      [
        'table',
        [
          ['Package', 'Version', 'Responsibility'],
          ['Vitest', '4.1.10', 'Unit, component, and contract-consumer tests'],
          [
            'Testing Library React',
            '16.3.2',
            'User-observable component and accessibility-oriented testing',
          ],
          [
            'Testing Library User Event',
            '14.6.1',
            'Realistic keyboard, pointer, and form interaction tests',
          ],
          ['jsdom', '29.1.1', 'Browser DOM environment for automated tests'],
          ['ESLint', '9.39.5', 'Static code-quality and safety rules'],
          ['typescript-eslint', '8.65.0', 'Type-aware TypeScript linting'],
          ['Prettier', '3.8.1', 'Consistent source formatting'],
        ],
      ],
      ['heading', 'How versions are governed'],
      [
        'unordered-list',
        [
          'package.json declares supported engines and direct package versions.',
          'package-lock.json locks the complete dependency graph used by npm ci.',
          'Nodics and Axis must use compatible Node.js and npm release lines.',
          'A package upgrade requires formatting, linting, strict type checking, tests, a production build, and dependency-security review.',
          'When a released package version changes, update this page and publish a newer Axis documentation content-pack version.',
        ],
      ],
    ],
  },
  {
    code: 'setup',
    title: 'Install, Configure, and Start Axis',
    section: 'Operate Axis',
    summary:
      'Set up compatible Node.js tooling, configure runtime endpoints, and start the browser application safely.',
    blocks: [
      ['heading', 'Prerequisites'],
      [
        'unordered-list',
        [
          'Use the Node.js and npm versions declared by both Nodics and Axis.',
          'Start the required Nodics backend modules before Axis.',
          'Keep environment-specific browser values in the Axis root .env file.',
          'Never place provider credentials, service tokens, database URLs, or employee passwords in frontend environment variables.',
        ],
      ],
      ['heading', 'Install and start'],
      ['code', 'npm ci\nnpm run dev'],
      [
        'paragraph',
        'The development server validates runtime configuration before login. A failed BackOffice, Profile, or CMS connection produces a bounded recovery screen instead of silently switching to a different authority.',
      ],
      ['heading', 'Documentation installation'],
      [
        'paragraph',
        'Axis ships committed import-ready records under data/core and a versioned manifest at manifest/docs-content-pack.json. Nodics nImport validates and imports the pack. Axis only requests status and an authorized import or update; it never reads its repository or writes CMS storage directly.',
      ],
    ],
  },
  {
    code: 'pages-and-renderers',
    title: 'Pages, Components, and Renderers',
    section: 'Develop Axis',
    summary:
      'Understand backend-driven composition and the strict frontend renderer hierarchy.',
    blocks: [
      ['heading', 'What comes from CMS'],
      [
        'paragraph',
        'CMS records define Sites, content catalogs, routes, pages, templates, slots, components, renderer keys, labels, help text, fragments, and other declarative properties. Updating governed CMS data can therefore change presentation content without rebuilding Axis.',
      ],
      ['heading', 'What remains in Axis'],
      [
        'paragraph',
        'Executable React and TypeScript implementations always remain in Axis. Backend renderer keys map through typed allowlisted registries. Axis never downloads or executes HTML, JavaScript, CSS, imports, expressions, or event handlers supplied as content.',
      ],
      [
        'table',
        [
          ['Kind', 'Directory'],
          ['Page renderer', 'src/cms/renderers/pages'],
          ['Template renderer', 'src/cms/renderers/templates'],
          [
            'Capability component renderer',
            'src/cms/renderers/components/<capability>',
          ],
          ['Typed registries', 'src/cms/renderers/registry'],
          ['Mirrored tests', 'test/cms/renderers'],
        ],
      ],
      ['heading', 'One renderer per file'],
      [
        'paragraph',
        'Each renderer implementation has one clear file and one exported renderer. Reusable components are grouped by capability, not copied into the first page that uses them. Every renderer declares its kind and contract version and has focused positive, invalid-contract, and boundary tests.',
      ],
    ],
  },
  {
    code: 'backend-contracts',
    title: 'Backend Contracts and Security',
    section: 'Develop Axis',
    summary:
      'Use BackOffice discovery, Profile sessions, CMS composition, OpenAPI, permissions, and direct module APIs safely.',
    blocks: [
      ['heading', 'Bootstrap and discovery'],
      [
        'paragraph',
        'The public bootstrap exposes only the minimum endpoints and composition required before login. After employee authentication, the secured bootstrap returns authorized module connections, navigation, Axis policy, and documentation sources. The returned registry is observed runtime state, not a replacement for topology or module ownership.',
      ],
      ['heading', 'Session security'],
      [
        'unordered-list',
        [
          'Access tokens remain in memory.',
          'Refresh credentials remain in Profile-scoped HttpOnly cookies.',
          'Restore and logout send the configured readable CSRF cookie.',
          'Customer identity is rejected for Axis.',
          'UI permission filtering never replaces backend authorization.',
        ],
      ],
      ['heading', 'Direct module communication'],
      [
        'paragraph',
        'After discovery, Axis calls Profile, CMS, Workflow, CronJob, Inventory, Pricing, Product, and other owning modules directly. BackOffice does not proxy ordinary business CRUD or operational traffic. Stable Nodics OpenAPI contracts remain the client contract authority.',
      ],
      ['heading', 'Failure behavior'],
      [
        'paragraph',
        'Axis fails closed when authentication, authorization, required module discovery, CMS composition, or contract validation fails. Client messages remain bounded and must not display backend stacks, queries, tokens, credentials, provider diagnostics, or record payloads.',
      ],
    ],
  },
  {
    code: 'responsive-accessibility',
    title: 'Responsive and Accessible Experiences',
    section: 'Develop Axis',
    summary:
      'Design Axis for desktop, tablet, mobile browser, and lightweight mobile WebView use.',
    blocks: [
      ['heading', 'Supported experience'],
      [
        'paragraph',
        'Axis is responsive and WebView-compatible so a lightweight native shell can host the web application later. Responsive behavior is an implementation contract, not an afterthought applied after desktop screens are complete.',
      ],
      [
        'unordered-list',
        [
          'Keyboard access for navigation, dialogs, forms, tables, and actions.',
          'Visible focus state and semantic landmarks.',
          'Screen-reader labels and meaningful status announcements.',
          'Touch targets and layouts that remain usable on narrow screens.',
          'Translated text expansion and locale direction support.',
          'Reduced-motion preferences and no interaction that depends only on color.',
        ],
      ],
      ['heading', 'Boundary testing'],
      [
        'paragraph',
        'Every significant screen should be tested at desktop and narrow viewport boundaries, with keyboard interaction and invalid or loading states. Dense business tables need an explicit responsive strategy rather than horizontal clipping that hides actions.',
      ],
    ],
  },
  {
    code: 'extend-and-test',
    title: 'Extend, Troubleshoot, and Verify Axis',
    section: 'Develop Axis',
    summary:
      'Follow reuse-first extension, diagnose contract failures, and prove changes before release.',
    blocks: [
      ['heading', 'Reuse-first implementation'],
      [
        'ordered-list',
        [
          'Reuse an existing Axis component, API client, renderer, or contract.',
          'Compose or extend the existing implementation through a typed extension point.',
          'Add a dependency or abstraction only after checking that no existing authority satisfies the requirement.',
        ],
      ],
      ['heading', 'Troubleshooting sequence'],
      [
        'ordered-list',
        [
          'Confirm runtime configuration is valid.',
          'Check the public BackOffice bootstrap.',
          'Authenticate through Profile and inspect only the client-safe error.',
          'Check the secured bootstrap for the required module and source.',
          'Verify the target module is UP or DEGRADED and its endpoint is reachable.',
          'Verify the CMS Site, route, access mode, renderer mapping, and content-pack state.',
        ],
      ],
      ['heading', 'Verification'],
      ['code', 'npm run verify'],
      [
        'paragraph',
        'Acceptance includes positive, negative, boundary, contract, integration, responsive, accessibility, security, failure/recovery, and regression behavior. When a feature changes backend authority, update and validate the Nodics repository separately.',
      ],
      ['heading', 'Documentation obligation'],
      [
        'paragraph',
        'Every frontend capability must update its project documentation data and manifest in the same implementation. Backend business behavior remains documented with the owning Nodics capability, while Axis documents its presentation, API consumption, renderer mapping, accessibility, extension, troubleshooting, and tests.',
      ],
    ],
  },
];

const routeOf = (code) =>
  code === 'overview' ? '/docs/nodics-axis' : '/docs/nodics-axis/' + code;
const items = pages.map((page, index) => ({
  code: 'axis.' + page.code,
  title: page.title,
  route: routeOf(page.code),
  section: page.section.toLowerCase().replaceAll(' ', '-'),
  sectionTitle: page.section,
  sectionOrder:
    page.section === 'Understand Axis' ? 10 : page.section === 'Operate Axis' ? 20 : 30,
  order: index * 10 + 10,
  audience: ['business-user', 'administrator', 'developer', 'operator'],
  summary: page.summary,
  searchText: [
    page.title,
    page.summary,
    ...page.blocks.flatMap((block) => block.slice(1)),
  ]
    .flat()
    .join(' '),
}));

const navigation = {
  code: 'axisDocumentationNavigation',
  typeCode: 'axisDocumentationNavigationComponentType',
  renderer: 'documentation.component.navigation',
  accessMode: 'AUTHENTICATED',
  properties: {
    title: 'Nodics Axis',
    searchLabel: 'Search Nodics Axis documentation',
    searchPlaceholder:
      'Search setup, architecture, renderers, security, and troubleshooting',
    emptyMessage: 'No Nodics Axis documentation matches your search.',
    sections: [
      { code: 'understand-axis', title: 'Understand Axis', order: 10 },
      { code: 'operate-axis', title: 'Operate Axis', order: 20 },
      { code: 'develop-axis', title: 'Develop Axis', order: 30 },
    ],
    items: items,
  },
  active: true,
};

const article = (page, index) => ({
  code: 'axisDocsComponent' + page.code.replaceAll('-', ''),
  typeCode: 'axisDocumentationArticleComponentType',
  renderer: 'documentation.component.article',
  accessMode: 'AUTHENTICATED',
  properties: {
    code: 'axis.' + page.code,
    title: page.title,
    route: routeOf(page.code),
    section: page.section.toLowerCase().replaceAll(' ', '-'),
    sectionTitle: page.section,
    audience: items[index].audience,
    summary: page.summary,
    headings: page.blocks
      .filter((block) => block[0] === 'heading')
      .map((block, headingIndex) => ({
        text: block[1],
        anchor: page.code + '-' + (headingIndex + 1),
        level: 2,
      })),
    blocks: page.blocks.map((block, blockIndex) => {
      if (block[0] === 'heading') {
        return {
          kind: 'heading',
          level: 2,
          text: block[1],
          anchor:
            page.code +
            '-' +
            page.blocks
              .slice(0, blockIndex + 1)
              .filter((value) => value[0] === 'heading').length,
        };
      }
      if (block[0] === 'paragraph') return { kind: 'paragraph', text: block[1] };
      if (block[0] === 'code')
        return { kind: 'code', text: block[1], language: 'text' };
      if (block[0] === 'table')
        return { kind: 'table', headers: block[1][0], rows: block[1].slice(1) };
      return { kind: block[0], items: block[1] };
    }),
    searchText: items[index].searchText,
    previous:
      index > 0
        ? { title: pages[index - 1].title, route: routeOf(pages[index - 1].code) }
        : undefined,
    next:
      index < pages.length - 1
        ? { title: pages[index + 1].title, route: routeOf(pages[index + 1].code) }
        : undefined,
  },
  active: true,
});

module.exports = Object.assign(
  { record0: navigation },
  Object.fromEntries(
    pages.map((page, index) => ['record' + (index + 1), article(page, index)]),
  ),
);
