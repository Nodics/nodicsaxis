'use strict';

/** @description Generated Nodics Axis documentation navigation and article content. */
module.exports = {
  record0: {
    code: 'axisDocumentationNavigation',
    typeCode: 'axisDocumentationNavigationComponentType',
    renderer: 'documentation.component.navigation',
    accessMode: 'AUTHENTICATED',
    properties: {
      title: 'Nodics Axis',
      searchLabel: 'Search Nodics Axis documentation',
      searchPlaceholder:
        'Search setup, architecture, features, security, and troubleshooting',
      emptyMessage: 'No Nodics Axis documentation matches your search.',
      sections: [
        {
          code: 'discover-axis',
          title: 'Discover Axis',
          order: 10,
        },
        {
          code: 'build-and-operate-axis',
          title: 'Build and Operate Axis',
          order: 20,
        },
        {
          code: 'axis-capabilities',
          title: 'Axis Capabilities',
          order: 30,
        },
        {
          code: 'contribute-to-axis',
          title: 'Contribute to Axis',
          order: 40,
        },
      ],
      items: [
        {
          code: 'axis.overview',
          title: 'What Is Nodics Axis?',
          route: '/docs/nodics-axis',
          section: 'discover-axis',
          sectionTitle: 'Discover Axis',
          sectionOrder: 10,
          order: 10,
          audience: ['business-user', 'administrator', 'developer', 'operator'],
          summary:
            'Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope.',
          searchText:
            'What Is Nodics Axis? Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope. # Nodics Axis\n\nNodics Axis is the reusable Back Office frontend for a single Nodics-based\ncustomer project deployment.\n\nCanonical user and contributor documentation is authored as granular pages\nunder `source/documentation` and deterministically generated into the committed\nCMS import release under `data/core`. The current `docs/` files remain\nmigration evidence until coverage, detail-preservation, generated-pack, and\nrendered-content gates approve their retirement.\n\nAxis is a client-side web application. It authenticates human users through\nProfile, retrieves an authorized bootstrap contract from Back Office, and then\ncalls the authoritative APIs of discovered Nodics modules directly.\n\n## Boundaries\n\n- Nodics remains the backend and API authority.\n- Axis contains presentation and interaction behavior, not authoritative\n  business logic.\n- Every customer project has an isolated Axis deployment.\n- Axis does not depend on whether Nodics runs as a monoServer or distributed\n  module servers.\n- CMS descriptors can select Axis-owned components but cannot deliver\n  executable frontend code.\n\nSee\n[Axis Architecture and Ownership](docs/architecture-and-ownership.md) for the\nper-customer deployment model, repository responsibilities, contract authority,\nsecurity boundary, and verification expectations.\n\nSee [Frontend Technology Stack](docs/frontend-technology-stack.md) for the\napproved tools, state ownership, styling decision, repository shape, and\ndependency-governance rules.\n\nUse the [Feature Delivery Checklist](docs/feature-delivery-checklist.md) for\nrepository-boundary analysis, security, contract testing, accessibility,\ndocumentation placement, and completion evidence for every Axis slice.\n\nRead the\n[Axis Implementation And Documentation Contract](docs/implementation-and-documentation-contract.md)\nfor partial-discovery rules, repository placement, required use cases, and the\nacceptance contract followed by human developers and AI tools.\n\nSee [CMS Delivery and Renderer Integration](docs/cms-delivery-and-renderers.md)\nfor the resolved-page client, trusted renderer boundary, validation rules,\ncache isolation, and login integration.\n\nSee [Documentation Content In Axis](docs/documentation-content.md) for dynamic\nFramework, Swaggers, Nodics Axis, and future project documentation sources;\nper-product CMS catalogs; the import-ready Axis content pack; renderer\nownership; security boundaries; and failure behavior.\n\nSee [Module Health](docs/module-health.md) for backend-driven operational\nnavigation, the typed registry client, module and node readiness presentation,\nsecurity boundaries, responsive behavior, and extension rules.\n\nSee [Imports and Exports](docs/imports-and-exports.md) for immutable init, core,\nand sample release discovery, validation, installation, history, security, and\nthe intentionally disabled export surface.\n\nSee [Employee Login, Recovery, Screen Lock, and Dashboard](docs/employee-login.md)\nfor startup discovery, employee-only authentication, persistent BackOffice\npolicy consumption, protected routing, logout, and failure recovery.\n\n## Prerequisites\n\n- Node.js 24\n- npm 10 or 11\n- A local Nodics backend when integration behavior is required\n\n## Start locally\n\nStart Nodics in a separate terminal:\n\n```bash\ncd ../nodics\nnpm start -- ENV=startioLocal SERVER=monoServer\n```\n\nInstall and start Axis:\n\n```bash\nnpm ci\nnpm run dev\n```\n\nAxis runs at <http://localhost:3100>.\n\n## Environment and runtime configuration\n\nCopy `.env.example` to `.env` and configure the local/build values there.\nThe repository includes a safe local `.env`; Git ignores it so each developer\nor deployment can use different values.\n\n```dotenv\nAXIS_BACKOFFICE_BASE_URL=http://localhost:3000\nAXIS_ENTERPRISE_CODE=default\nAXIS_CLIENT_CONTRACT_VERSION=1\nAXIS_REQUEST_TIMEOUT_MS=10000\nAXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf\nAXIS_ASSISTANT_MAXIMUM_EVENT_BYTES=65536\nAXIS_ASSISTANT_RECONNECT_WINDOW_MS=120000\nAXIS_ASSISTANT_IDLE_TIMEOUT_MS=45000\nAXIS_DEV_HOST=0.0.0.0\nAXIS_DEV_PORT=3100\nAXIS_STRICT_PORT=true\nAXIS_BUILD_SOURCEMAP=true\n```\n\nVite validates these values and generates `/axis-config.json`:\n\n```json\n{\n  "backofficeBaseUrl": "http://localhost:3000",\n  "enterpriseCode": "default",\n  "clientContractVersion": 1,\n  "requestTimeoutMs": 10000,\n  "browserSessionCsrfCookieName": "nodics_axis_csrf",\n  "assistantMaximumEventBytes": 65536,\n  "assistantReconnectWindowMs": 120000,\n  "assistantIdleTimeoutMs": 45000\n}\n```\n\nAxis loads that document and then obtains the active Profile and CMS endpoints\nfrom BackOffice\'s low-disclosure public bootstrap. Axis does not maintain a\nsecond module endpoint list.\nInvalid or unavailable configuration produces a recovery screen instead of\nattempting authentication.\n\n`.env` and `axis-config.json` are public configuration, not secret stores.\nNever place passwords, tokens, API keys, private keys, or credentials in them.\nOnly explicitly named `AXIS_*` variables are consumed; Axis does not expose\narbitrary environment variables to browser code.\n\nFor production, the generated `dist/axis-config.json` may be replaced during\ndeployment so endpoints can change without rebuilding Axis. Serve it with\n`Cache-Control: no-store`. Serve hashed assets with long-lived immutable\ncaching.\n\n## Quality commands\n\n```bash\nnpm run format:check\nnpm run lint\nnpm run typecheck\nnpm run test\nnpm run build\nnpm run verify\n```\n\nThe implemented Gold and Charcoal foundations, responsive shell, recovery\nstates, accessibility behavior, and extension rules are documented in\n[Axis Design System And Static Shell](docs/design-system-and-shell.md).\n\nThe implemented authenticated Assistant CMS route, renderer hierarchy,\ndirect-module connection validation, and typed HTTP client are documented in\n[Axis Assistant Frontend](docs/assistant-frontend.md).\n\nThe implemented Schema Workbench discovery, schema browser, bounded record\nlist, relationship editor, record detail, Create, Update, and governed Delete\nare documented in\n[Axis Schema Workbench](docs/schema-workbench.md).\n\n## Current scope\n\nThe current foundation proves the frontend runtime boundary, safe startup, CMS\ndelivery/renderers, employee authentication, secured BackOffice bootstrap,\nCMS-driven login/recovery/lock pages, idle screen locking, protected dashboard\nrouting, logout, the CMS-driven Assistant workspace shell, typed Assistant HTTP\ncontracts, authenticated resumable SSE transport, isolated Assistant\npresentation state, and the CMS-driven Schema Workbench browser with\ndirect-module schema discovery, bounded record reads, and independent Address\nand Contact creation, relationship coordination, record detail, generated\nUpdate, and governed Delete. The Operations workspace includes Module Health\nwith permission-filtered navigation, module summaries, on-demand registered\nnode details, and governed refresh. Visual designers remain future slices.\n\n## Customize and extend safely\n\nUse Axis as the reusable frontend base and place customer-specific pages,\nrenderers, typed clients, theme composition, and CMS presentation data in the\ncustomer Axis project. Keep customer business services, schemas, workflows,\npermissions, and API implementations in its Nodics backend project.\n\nThe smallest extension adds one focused feature directory, one backend-driven\nnavigation or renderer contract, and mirrored tests. Do not modify reusable\nframework behavior for customer needs, hardcode backend-owned labels, create a\nparallel module registry, or move authorization into the browser. Prove\nstartup, permission, contract-version, malformed-data, failure recovery,\nresponsive and WebView, integration, regression, and production-build\nbehavior. Rollback removes the customer registration and deployment artifact\nwithout mutating Nodics-owned persisted contracts.\n',
        },
        {
          code: 'axis.architecture',
          title: 'Architecture and Repository Boundaries',
          route: '/docs/nodics-axis/architecture',
          section: 'discover-axis',
          sectionTitle: 'Discover Axis',
          sectionOrder: 10,
          order: 20,
          audience: ['architect', 'developer', 'security-reviewer', 'ai-tool'],
          summary:
            'Learn the per-project deployment model, contract authority, security boundary, documentation ownership, and verification expectations.',
          searchText:
            "Architecture and Repository Boundaries Learn the per-project deployment model, contract authority, security boundary, documentation ownership, and verification expectations. # Axis Architecture and Ownership\n\n## Decision\n\nNodics Axis is a reusable Back Office browser application deployed once for\neach Nodics-based customer project. The Axis process and the Nodics backend\nprocesses are built, started, scaled, deployed, and rolled back independently.\nOne Axis deployment must not switch between customer projects or federate\ntheir backend endpoints.\n\nThis decision keeps a clear authority boundary:\n\n- Nodics owns business rules, persistence, authentication enforcement,\n  authorization, workflows, pipelines, integrations, secrets, tenant\n  governance, runtime contracts, and module APIs.\n- Axis owns browser rendering, interaction, accessibility, responsive\n  behavior, and non-authoritative client view state.\n- Profile authenticates human users.\n- BackOffice returns the caller's authorized, browser-safe module registry and\n  compatibility metadata.\n- After bootstrap, Axis calls each authoritative module directly. BackOffice\n  does not proxy normal CMS, job, workflow, configuration, or business traffic.\n\n## Deployment model\n\n```text\nCustomer project A\n  Axis deployment A\n    -> Profile A\n    -> BackOffice A -> authorized module discovery\n    -> CMS A, Workflow A, CronJob A, and other discovered modules\n\nCustomer project B\n  Axis deployment B\n    -> Profile B\n    -> BackOffice B -> authorized module discovery\n    -> project B modules\n```\n\nAxis deployment A must never discover, select, or call project B endpoints.\nWhether a project's Nodics modules run together in `monoServer` or as\ndistributed module servers does not change the browser contract.\n\n## Contract authority\n\nAxis consumes versioned backend contracts such as OpenAPI, Profile\nauthentication, BackOffice bootstrap, permissions, schemas, and module\noperation metadata. Generated or handwritten Axis clients are consumers of\nthose contracts; they do not become contract authorities.\n\nAxis must not:\n\n- import source from the sibling Nodics checkout;\n- embed backend services or persistence;\n- reproduce authoritative validation or permission decisions;\n- execute workflows, pipelines, integrations, AI tools, or arbitrary scripts\n  in the browser;\n- store service or CronJob credentials;\n- create a second registry, schema authority, runtime loader, or endpoint\n  federation layer.\n\nClient-side validation may improve usability, but every target module must\nvalidate and authorize the request independently.\n\n## Security boundary\n\nHuman browser authentication remains separate from module-to-module and\nCronJob authentication. Axis may receive only browser-safe configuration,\nhuman-session material approved by the Profile browser-security contract, and\npermission-filtered module metadata. Passwords, access tokens, refresh tokens,\nservice credentials, and secrets must never be written to browser storage,\nURLs, logs, or telemetry.\n\nDetailed session, refresh, revocation, CORS, CSRF, CSP, and audience behavior\nwill be documented only after the corresponding backend contracts are\napproved and implemented.\n\n## Documentation ownership\n\n- This repository documents Axis installation, build, deployment, frontend\n  contribution rules, browser architecture, accessibility, and implemented UI\n  behavior.\n- The Nodics repository documents product capabilities, business-user and\n  administrator journeys, backend APIs, security enforcement, module\n  configuration, operations, and backend customization.\n- Temporary plans describe intended work only and must not be presented as\n  implemented capability.\n\n## Customize and extend safely\n\nCreate customer behavior in the customer backend project and customer\npresentation in its Axis project layer. A frontend extension may add a focused\npage, renderer, typed client, hook, and mirrored test, but it must continue to\nconsume the owning Nodics module's versioned API and permission contract.\n\nThe smallest safe extension is one new renderer file plus one typed registry\nentry for a backend-issued logical renderer key. Do not copy BackOffice\ndiscovery, create a browser module registry, move validation or workflow into\nReact, or edit reusable Nodics framework source. Prove the extension with\ncontract-version, unauthorized, malformed-payload, responsive, integration,\nand production-build tests. Rollback removes the project registry entry while\nleaving the backend authority and persisted data unchanged.\n\n## Verification expectations\n\nEvery Axis slice must identify:\n\n1. its authoritative backend owner and versioned contract;\n2. its Axis presentation and local-state responsibilities;\n3. authentication, authorization, tenant, and data-exposure boundaries;\n4. tests belonging to each repository;\n5. documentation belonging to each repository.\n\nImplementation must cover applicable positive, negative, boundary, contract,\nsecurity, responsive, accessibility, integration, recovery, and regression\nbehavior. Run `npm run verify` before release-oriented commits.\n",
        },
        {
          code: 'axis.technology-stack',
          title: 'Frontend Technology Stack',
          route: '/docs/nodics-axis/technology-stack',
          section: 'build-and-operate-axis',
          sectionTitle: 'Build and Operate Axis',
          sectionOrder: 20,
          order: 30,
          audience: ['developer', 'operator', 'architect', 'ai-tool'],
          summary:
            'Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification.',
          searchText:
            'Frontend Technology Stack Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification. # Frontend Technology Stack\n\n## Selected foundation\n\nNodics Axis uses one cohesive frontend application until demonstrated reuse\nand stable contracts justify extracting packages.\n\n| Concern                  | Selected technology            | Current version | Responsibility                                                                    |\n| ------------------------ | ------------------------------ | --------------- | --------------------------------------------------------------------------------- |\n| Package management       | npm                            | 11.6.2          | Reproducible dependency installation from `package-lock.json`                     |\n| UI runtime               | React / React DOM              | 19.2.8          | Axis-owned browser rendering and interaction                                      |\n| Language                 | TypeScript in strict mode      | 6.0.3           | Compile-time safety across UI and contract consumers                              |\n| Build and local server   | Vite                           | 8.1.5           | Development server and immutable production assets                                |\n| Client routing           | React Router                   | 8.3.0           | Static recovery routes and authorized application navigation                      |\n| Server state             | TanStack Query                 | 5.101.4         | Request lifecycle, caching, cancellation, and invalidation for backend-owned data |\n| Component foundation     | MUI                            | 9.2.0           | Accessible primitives and Nodics-owned tokens and components                      |\n| Styling runtime          | Emotion React / Styled         | 11.14.0/11.14.1 | Material UI styling and theme-aware presentation                                  |\n| Unit and component tests | Vitest / Testing Library React | 4.1.10/16.3.2   | User-observable frontend behavior and contract-consumer tests                     |\n| Browser test environment | jsdom                          | 29.1.1          | Browser DOM behavior in automated tests                                           |\n| Static quality           | ESLint / typescript-eslint     | 9.39.5/8.65.0   | TypeScript and React code-quality rules                                           |\n| Formatting               | Prettier                       | 3.8.1           | Consistent source and documentation formatting                                    |\n\nSupported engines and direct versions are declared in `package.json` and the\ncomplete dependency graph is locked in `package-lock.json`. Those files remain\nthe dependency authority. The table is an operator-friendly snapshot and must\nbe updated in the same change whenever a listed package version changes.\n\n## State ownership\n\n- TanStack Query owns remote server state and request lifecycle.\n- Presentation state stays close to the route or feature that owns it.\n- Backend modules remain authoritative for persisted state, validation,\n  authorization, workflows, and business outcomes.\n- Axis must not create a browser store that becomes a second copy of backend\n  registry, permission, workflow, publication, or tenant authority.\n\nA dedicated global client-state dependency may be considered only when a\nmeasured cross-feature problem cannot be handled safely by React composition,\nroute state, or TanStack Query.\n\n## Styling decision\n\nAxis uses MUI primitives, Emotion, and original Nodics design tokens. Tailwind\nis not part of the selected runtime. Commercial administration templates may\ninform information grouping only; their source code, components, assets,\nlayouts, and branding are not dependencies.\n\nThe design system must preserve keyboard operation, screen-reader support,\nresponsive behavior, reduced motion, mobile WebView compatibility, and\ncomfortable and compact density modes.\n\n## Repository shape\n\nAxis starts as one application repository with cohesive feature boundaries.\nIt is not a mandatory monorepo. A package may be extracted later only when:\n\n1. two or more real consumers need the same stable capability;\n2. its public contract and ownership are explicit;\n3. extraction does not duplicate a Nodics backend authority;\n4. independent versioning and testing provide a demonstrated benefit.\n\nThis avoids package boundaries that add governance and release overhead before\nthe product has stable reuse seams.\n\nProduction code belongs under `src/`. Tests belong under the root `test/`\ndirectory and mirror the production feature boundaries, for example\n`src/cms/` and `test/cms/`. Test-only fixtures belong below the matching test\nfeature and must not be imported by production code. `tsconfig.app.json`\nstrictly checks runtime source, while `tsconfig.test.json` strictly checks the\nseparate test tree.\n\n## CMS renderer organization\n\nCMS sends composition data and logical renderer contracts; Axis owns every\nexecutable renderer. Renderer source follows a strict, navigable hierarchy:\n\n```text\nsrc/cms/renderers/\n├── pages/                  # one page renderer per file\n├── templates/              # one template renderer per file\n├── components/\n│   ├── authentication/     # authentication-specific component renderers\n│   ├── dashboard/          # dashboard-specific component renderers\n│   └── shared/             # genuinely reusable component renderers\n├── registry/               # typed logical-key mappings and contract manifest\n└── shared/                 # renderer-only types, guards, and property readers\n```\n\nDo not add a generic file containing multiple unrelated renderer\nimplementations. A new CMS renderer requires:\n\n1. one focused renderer file in the correct capability directory;\n2. one typed registry mapping from the backend logical key;\n3. one renderer-manifest entry declaring kind and supported contract version;\n4. focused tests in the mirrored `test/cms/renderers` hierarchy; and\n5. safe failure for unknown keys, incompatible versions, or invalid properties.\n\nReusable renderers are grouped by capability rather than copied into every\npage. Page-specific placement is reserved for a renderer contract deliberately\nowned by only that page. Backend data must never contain a TypeScript import,\nReact component name, executable file path, script URL, or HTML implementation.\n\n## Dependency decision rule\n\nBefore adding a frontend dependency:\n\n1. reuse an installed capability when it satisfies the requirement;\n2. compose or extend an existing Axis pattern when safe;\n3. document why the current stack cannot provide the capability;\n4. review bundle, security, maintenance, accessibility, browser, WebView, and\n   licensing impact;\n5. add focused tests and update this decision when the architectural stack\n   changes.\n\nAxis must not add a dependency that executes backend business processes,\nstores secrets, downloads executable CMS code, or creates an alternate\ncontract authority.\n\n## Customize and extend safely\n\nExtend the stack through a focused project-owned feature directory, existing\nReact and TypeScript composition, shared theme tokens, a typed backend client,\nand mirrored tests. Prefer an installed dependency or existing pattern; when a\nnew package is necessary, document its exact supported version, browser and\nWebView impact, bundle cost, security and licensing review, and upgrade and\nremoval procedure.\n\nDo not fork the application shell, create another state or API authority,\ndownload executable CMS code, or hide business rules in components. Verify\ntype safety, lint and formatting, accessibility, narrow and touch layouts,\ncontract rejection, integration behavior, bundle output, and clean removal of\nthe extension.\n\n## Verification\n\nUse:\n\n```bash\nnpm ci\nnpm run verify\n```\n\nThe verification gate checks formatting, linting, strict TypeScript,\nunit/component tests, and the production build.\n',
        },
        {
          code: 'axis.design-system',
          title: 'Design System and Application Shell',
          route: '/docs/nodics-axis/design-system',
          section: 'build-and-operate-axis',
          sectionTitle: 'Build and Operate Axis',
          sectionOrder: 20,
          order: 40,
          audience: ['designer', 'developer', 'business-user', 'ai-tool'],
          summary:
            'Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules.',
          searchText:
            "Design System and Application Shell Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules. # Axis Design System and Application Shell\n\n## Implemented scope\n\nAxis provides a responsive recovery workspace, CMS-composed employee\nauthentication experience, and authenticated dashboard shell. It contains no\nbackend business logic and does not infer permissions.\n\nThe implemented visual foundation uses Nodics Gold for focus and primary\nactions, Charcoal for structural surfaces and text, and restrained semantic\ncolors for success, information, warning, and error states. Panelix informed\nfunctional grouping only; no template source or visual asset was copied.\n\n## Authentication layout\n\nThe implemented login, recovery, and lock-screen template follows a two-zone\nenterprise authentication pattern:\n\n- desktop and tablet layouts at or above the medium breakpoint use a\n  60-percent Charcoal showcase panel and a 40-percent calm white form\n  workspace;\n- the showcase uses the reverse Nodics Axis lockup, Gold emphasis, a short\n  platform narrative, and configurable highlights;\n- the form workspace limits content to 440 pixels for readable field lengths;\n- brand, introduction, form, assistance, and legal content remain separate CMS\n  slots;\n- mobile webviews hide the decorative showcase and retain the complete\n  employee authentication journey in one column.\n\nThe layout pattern was informed by the approved external reference, but colors,\nlogo treatment, typography, spacing, content, accessibility, and React\nimplementation follow the Nodics Axis style guide. No source code, imagery,\nsocial-login behavior, registration journey, or branding was copied.\n\nRecovery uses the same composition with a concise reset introduction, one\nemployee identifier field, primary action, and return-to-login assistance.\nScreen lock uses the in-memory employee identifier, one password field,\nprimary unlock action, and explicit sign-out alternative. Lock content is\nauthenticated CMS composition and is never available from public delivery.\n\nImplemented foundation values include Gold `#FEC400`, Charcoal `#25292C`, app\nbackground `#F5F6F7`, border `#DDE1E5`, and the guide's semantic colors. Gold\nremains an action surface with Charcoal text; it is not used as warning status\nor normal text on white.\n\n## Foundations\n\n- Light and dark color modes.\n- Comfortable and compact density.\n- Responsive typography and spacing.\n- Consistent borders, surfaces, action sizing, and elevation.\n- Visible keyboard focus.\n- Reduced-motion behavior through the operating-system preference.\n- Semantic success, information, warning, and error colors.\n- Forty-four-pixel icon-button targets for touch and mobile WebViews.\n\nAppearance choices remain in application memory. They are not identity,\ntenant, or backend configuration and are deliberately not persisted yet.\n\n## Shell structure\n\nThe shared authenticated shell provides:\n\n1. an expandable desktop navigation rail, compact icon-only desktop rail, and\n   temporary mobile navigation drawer;\n2. synchronized navigation search in the expanded left rail and top bar, an\n   optional backend-advertised Axis Assistant shortcut, quick-create\n   placeholder, My Work, notifications, and employee menu;\n3. an active context bar showing the backend-reported environment, tenant,\n   configured enterprise, CMS Site, and CMS Catalog;\n4. employee lock and logout actions;\n5. comfortable/compact density and light/dark controls;\n6. the main workspace region;\n7. bordered workspace panels;\n8. empty-state, notification, and confirmation-dialog primitives;\n9. loading and offline feedback.\n\nAfter authentication, Axis consumes the authorized BackOffice `catalogue`,\n`availability`, and client-safe module leases. It does not define a second\nfunctional menu authority. The local Dashboard entry is combined with\nmodule-owned navigation entries. Axis uses an explicitly supplied backend\nbusiness group first and retains the legacy category mapping only as a safe\nfallback for older compatible contributions:\n\n- `content` and `experience` become Content and Experience;\n- `commerce` becomes Commerce;\n- `core` becomes Customers and Organization;\n- `operations` becomes Process and Automation;\n- `platform` becomes Operations and Integration; and\n- unknown categories remain visible under Other Capabilities.\n\nAn owning module may also supply a same-module parent relationship,\nperspectives, localization key, required context dimensions, feature state,\nand a non-executable badge-provider reference. Axis validates the hierarchy\nagain and rejects duplicate identifiers, missing parents, or cycles even\nthough BackOffice has already validated the registration. Children are\ndisplayed directly after their parent with an accessible hierarchy level.\n`DISABLED` destinations remain visible but cannot be opened; `PREVIEW`\ndestinations carry a visible preview state; `HIDDEN` destinations are removed\nby BackOffice before Axis receives them.\n\nThe expanded and mobile navigation provides a real **Search menu** field. It\nmatches authorized destinations by business group, user-facing label, or\nowning module and filters the left panel immediately. The top-bar navigation\nsearch uses the same query state. Search never changes permissions, tenant\ncontext, or backend feature state, and a successful navigation clears it.\n\nEmployees may star a destination. Axis stores only bounded\n`moduleName:navigationId` values for **Favourites** and **Recent** in browser\nlocal storage. It never stores routes, labels, tokens, employee details,\ntenant data, record data, or backend payloads in navigation preferences.\nMalformed persisted values are discarded. Favourites and recent destinations\nremain conveniences over the current authenticated bootstrap; a missing or\nnewly unauthorized contribution disappears automatically.\n\nIncompatible modules are excluded by the bootstrap parser. Unavailable\ndestinations are disabled and degraded destinations remain visible with a\nwarning state. A navigation item with permissions not covered by its already\nauthorized module contribution is rejected rather than displayed.\n\nWhen the authorized `aiAssistant` contribution contains its `assistant`\nnavigation item, the same backend-provided label, route, icon key, and\navailability also drive the top-bar shortcut. The shortcut is absent when the\nemployee has no contribution, enabled for `UP` and `DEGRADED`, and disabled for\n`UNAVAILABLE` or `UNKNOWN`. Axis does not maintain a second Assistant route or\nlabel authority.\n\nThe desktop menu control switches between the full rail and the compact rail.\nThe compact rail retains every authorized destination as an icon with an\naccessible name and hover/focus tooltip; it does not hide or re-authorize\ncapabilities. The Nodics Axis wordmark contracts to the Nodics mark and the top\nbar and content region reclaim the released width. Reduced-motion preferences\ndisable the width transition.\n\nEach module-owned navigation entry may supply a semantic `icon` key. Axis maps\nthat non-executable key to an Axis-owned vector icon. The entry-level key takes\nprecedence over the module-level key, and an unknown key uses the governed\ngeneric module icon instead of loading remote or CMS-provided executable\nassets.\n\nDiscovered module routes currently open an explicit placeholder workspace until\ntheir dedicated Axis feature is implemented. The placeholder confirms the\nowning module and availability without inferring operations or calling\nunapproved APIs.\n\nBefore authentication, unavailable context is labelled honestly. Future\nenterprise, environment, Site, Store, and Catalog selectors must consume\ngoverned backend context contracts rather than turn their displayed labels into\nfrontend authority. Future features must compose these primitives rather than\ncreate parallel page shells.\n\nContext identifiers are retained exactly for API requests, authorization,\nquery keys, caches, and diagnostics. Axis uses the generic display-name helper\nonly to turn a validated fallback code such as `startioLocal` into readable\ntext such as `Startio Local`. The helper preserves common acronyms including\nAI, API, CMS, ID, and UI. A localized display name explicitly supplied by the\nowning backend contract takes precedence over this fallback.\n\n## Recovery states\n\nThe static recovery model distinguishes:\n\n- deployment configuration;\n- Profile identity authority;\n- BackOffice registry;\n- CMS delivery;\n- contract compatibility;\n- functional module availability;\n- authorization denial;\n- offline connectivity;\n- unexpected presentation failure.\n\nEach recovery state explains the affected boundary, whether retry is safe, and\nan optional bounded correlation reference. Axis never claims that a retry is\nsafe for an unknown backend mutation.\n\n## Accessibility and responsive behavior\n\n- The main workspace uses the `main` landmark.\n- Navigation has an accessible name.\n- Dialogs have programmatic titles and descriptions.\n- Notifications use MUI live-region behavior.\n- Controls retain visible labels and keyboard focus.\n- Navigation changes from permanent to temporary below the medium breakpoint.\n- Authentication layouts use the exact 60/40 split at and above the medium\n  breakpoint. Below it, the decorative panel is hidden and the form workspace\n  uses the full width.\n- Layouts stack on narrow screens, avoid hover-only interaction, and do not\n  introduce horizontal page overflow.\n\n## Customize and extend safely\n\n- Add new design values to the shared token module.\n- Add reusable layouts and states to the shell primitives.\n- Keep module-specific presentation inside its feature workspace.\n- Do not put permissions, workflow execution, service credentials, or\n  authoritative validation into a shell component.\n- Add functional navigation through the owning module's BackOffice capability\n  contribution. Do not hardcode module routes in Axis.\n- Keep the single local Dashboard route recovery-safe. Every other displayed\n  functional destination must come from authenticated bootstrap.\n- Keep the expanded/compact navigation and appearance choices in application\n  memory. Only bounded favourite/recent navigation identifiers use the\n  reviewed preference store; do not add tokens, routes, context, records, or\n  backend responses to it.\n\n## Verification\n\nRun `npm run verify`. The foundation tests cover recovery variants, retry and\ncorrelation presentation, authorized navigation parsing and grouping,\nnavigation landmarks, module placeholder routing, context labels, employee\nlogout, Assistant shortcut capability gating, density and color controls,\nhierarchy validation, backend-owned groups, perspective metadata, feature\nstates, menu search, bounded favourite/recent preferences, dialogs,\nnotifications, offline\nbehavior, formatting, lint, types, and build.\nResponsive browser acceptance also covers the 60/40 authentication split at\ndesktop and tablet widths and the single-column mobile journey.\n\nThe governed-navigation acceptance was also exercised against the real\n`startioLocal` `monoServer` bootstrap. The authenticated catalogue returned\neleven permission-filtered destinations with module-owned groups,\nperspectives, context dimensions, and active feature state. Axis rendered the\nexpected business groups, menu search, favourite controls, compact\ndesktop behavior, and the temporary 390-pixel mobile drawer. Adding Content to\nFavourites stored only `cms:cms`; no route, token, context, or record data was\npersisted.\n",
        },
        {
          code: 'axis.cms-renderers',
          title: 'CMS Delivery and Renderer Integration',
          route: '/docs/nodics-axis/cms-renderers',
          section: 'build-and-operate-axis',
          sectionTitle: 'Build and Operate Axis',
          sectionOrder: 20,
          order: 50,
          audience: ['developer', 'architect', 'security-reviewer', 'ai-tool'],
          summary:
            'Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries.',
          searchText:
            "CMS Delivery and Renderer Integration Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries. # CMS Delivery and Renderer Integration\n\nAxis renders CMS-managed Back Office pages without moving backend authority or\nbusiness logic into the browser.\n\n## Runtime boundary\n\nCMS owns routes, pages, templates, components, component properties, and the\nlogical renderer metadata attached to each page or component type. Axis owns\nthe executable React renderers. CMS never returns JavaScript, module paths, or\narbitrary renderer URLs.\n\nAxis obtains the CMS endpoint from the approved runtime bootstrap flow. The CMS\nclient accepts that discovered endpoint as an input; it does not invent a\nfallback URL or proxy CMS through the Axis server.\n\n## Delivery validation\n\nBefore rendering, Axis validates the complete resolved-page response:\n\n- delivery contract version;\n- site, path, locale, and channel;\n- page, template, and component renderer keys;\n- renderer major versions and supported channels;\n- required component properties;\n- component graph depth and total component count.\n\nUnknown renderer keys, unsupported versions or channels, malformed data, and\noversized graphs fail closed. A component rendering failure is isolated and\nreplaced with a safe error message. Deprecated renderer metadata is retained\nfor migration tooling; it does not allow CMS to select untrusted executable\ncode.\n\n## Request and cache safety\n\nThe delivery client:\n\n- sends bearer tokens only in the `Authorization` header;\n- never places tokens in URLs, storage, or cache keys;\n- omits browser credentials and rejects redirects;\n- supports cancellation, timeouts, `ETag`, and `304 Not Modified`;\n- separates cache keys by enterprise, tenant, site, path, locale, channel,\n  access mode, principal, and authenticated session generation.\n\nAuthenticated cache keys require principal and session identity. This prevents\none employee or tenant from reusing another user's resolved page.\n\n## Customize and extend safely\n\nCreate one project-owned renderer file in the relevant capability directory,\nregister its backend-issued logical key and supported contract version in the\ntyped renderer manifest, and add mirrored tests. Customize labels, help text,\nlayout options, and safe fragments through CMS component properties; keep API\ndestinations, authorization, validation, and business decisions in their\nowning backend modules.\n\nNever execute CMS HTML or JavaScript, accept arbitrary component imports, add a\nfallback renderer for unknown keys, or duplicate CMS route resolution in Axis.\nVerify valid, unknown, deprecated, incompatible, malformed, oversized,\nunauthorized, cached-session, responsive, and renderer-isolation behavior.\nRollback removes the later project registration and restores the prior CMS\ncomponent version without editing the reusable renderer framework.\n\n## Renderer development\n\nAdd a renderer only to the trusted Axis renderer manifest and implement it in\nAxis source. Keep the renderer declarative: component properties may influence\ncontent and presentation, but must not introduce API destinations, executable\nscripts, authorization rules, or backend business decisions.\n\nRun the focused checks while changing this boundary:\n\n```bash\nnpm run typecheck\nnpm test -- --run test/cms\n```\n\nRun `npm run verify` before handing off or committing the completed slice.\n\n`/login` and `/forgot-password` are resolved from public CMS delivery. The\nlogin renderer sends employee credentials only to Profile. After Profile issues\nthe human bearer token, Axis validates access through secured BackOffice\nbootstrap before loading the authenticated CMS dashboard. Tokens remain in\nmemory and are cleared locally before logout revocation is sent to Profile.\n\nThe forgot-password page is presentation-ready, but submission remains disabled\nuntil Profile owns an approved employee-recovery API. Axis does not simulate\nrecovery or create a second identity workflow.\n",
        },
        {
          code: 'axis.documentation-content',
          title: 'Documentation Content in Axis',
          route: '/docs/nodics-axis/documentation-content',
          section: 'build-and-operate-axis',
          sectionTitle: 'Build and Operate Axis',
          sectionOrder: 20,
          order: 60,
          audience: ['administrator', 'developer', 'operator', 'ai-tool'],
          summary:
            'Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification.',
          searchText:
            "Documentation Content in Axis Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification. # Documentation Content In Axis\n\nAxis renders an authorized, backend-provided list of documentation products\nunder `/docs/*`. BackOffice aggregates the list from active module metadata;\nAxis does not hardcode product tabs or maintain another registry.\n\n- **Framework** renders the canonical `nodicsdocs` content pack through CMS.\n- **Swaggers** renders the active System-owned OpenAPI contract in an\n  Axis-owned, searchable reference and links to the backend's standalone\n  interactive Swagger UI. API descriptions are not copied into a content\n  catalog.\n- **Nodics Axis** renders this repository's committed documentation content\n  pack through its own CMS Site and content catalog.\n- A future customer project contributes its own source from its backend project\n  module and supplies import-ready data from the corresponding project\n  repository.\n\nEach CMS documentation product has a separate Site/catalog pair. CMS resolves\nthe Site to its catalog, so Axis never adds a second catalog-routing authority.\nNodics CMS remains runtime content and route authority; nImport remains the\nonly content-pack installation and update authority.\n\n## Employee Journey\n\n1. Sign in with an authorized employee account.\n2. Open **Documentation > Nodics Documentation**.\n3. Axis renders the ordered source tabs returned by the secured BackOffice\n   bootstrap.\n4. Select a CMS product or **Swaggers**. Axis resolves the configured runtime\n   connection by `connectionModule`; it never stores a second endpoint list.\n5. For a CMS source, Axis asks the registered System module for that source's\n   configured content-pack state.\n6. When the pack is absent, an authorized administrator may select **Import\n   documentation**. Axis never reads a repository or imports records itself.\n7. When the pack is current, Axis requests the selected product path from the CMS endpoint supplied by\n   BackOffice bootstrap.\n8. CMS resolves the Site, locale, channel, route, page, template, component,\n   renderer mappings, and access mode.\n9. Axis validates the renderer contract and displays the declarative article.\n10. Internal documentation links remain inside the authenticated Axis shell.\n\nFor **Swaggers**, Axis uses the selected source's registered System connection,\nOpenAPI path, and Swagger path. Axis fetches and bounds the JSON OpenAPI\ncontract, then renders searchable method, path, summary, description, and tag\ninformation as text through its own components. The backend Swagger page is\nopened as a separate browser page for interactive use; it is never embedded in\nan iframe because Nodics correctly protects backend pages with\n`X-Frame-Options: DENY` and `frame-ancestors 'none'`. Both routes remain subject\nto Nodics API exposure policy. If exposure is disabled or the runtime is\nunavailable, Axis reports the failure and does not substitute a stale copied\ncontract.\n\nWhen a newer pack version is available, Axis keeps the installed Wiki readable\nand offers the backend-authorized **Update documentation** action. Labels and\nempty-state messages come from the bounded backend status contract. Axis sends\nonly the employee bearer token and enterprise context to the registered System\nendpoint and never receives local paths, credentials, manifests, source files,\nor backend diagnostics.\n\nThe shared CMS navigation component supplies the searchable article index,\ncategory grouping, audience filters, and configurable labels. Each article\nsupplies breadcrumb context, its table of contents, and previous/next\nreferences. Axis owns only their responsive and accessible presentation.\n\nThe documentation-product switcher is a responsive, horizontally scrollable\nsegmented control. Its ordered products, labels, routes, and selected identity\ncome from BackOffice bootstrap; its spacing, selected state, keyboard roles,\nfocus behavior, and responsive presentation belong to Axis. It must remain\nvisually consistent across installed documentation, import/update states,\nOpenAPI reference, unavailable connections, and future project products.\n\nRefreshing a documentation URL restores the Profile-owned browser session\nbefore resolving the same CMS path. An expired or rejected session returns the\nemployee to the public authentication journey.\n\n## Nodics Axis Content Pack\n\nAxis documentation data is directly importable and committed under\n`data/core`. Its immutable release manifest is\n`manifest/docs-content-pack.json`. The manifest pack identity is `nodicsaxis`;\nthe configured nImport pack code is `axisDocumentation`; and its CMS binding is\n`axisDocumentationSite` → `axisDocumentationContentCatalog`.\n\nThe pack explains project purpose, architecture and repository boundaries,\nsupported setup, page/template/component/renderer organization, backend\ncontracts and security, responsive/accessibility behavior, extension,\ntroubleshooting, and verification. Change the pack version whenever committed\ncontent hashes change. A same-version checksum change is rejected by default.\n\nCanonical authored pages live under `source/documentation`. The committed\nrecords under `data/core` are deterministic generated projections, not an\nindependent documentation authority. Run `npm run docs:generate` after changing\nan implemented Axis capability, then run `npm run docs:check` and\n`npm run verify`. The migration register must preserve the disposition,\ndestination, headings, and detail evidence for every README or legacy docs\nsource before those transitional files are reduced or retired.\n\n`source/documentation/navigation.json` is the only authored Axis documentation\nrelease-version authority. Generation copies that version into CMS records,\nthe migration register, and the immutable release manifest. Contributors must\nincrement it before generating changed content and must not repair generated\nversion projections by hand.\n\nThe same generation pass projects every canonical navigation page into matching\nCMS page, component, and route records. Route lists must never be maintained\nseparately. The generated manifest page and route totals therefore describe the\nrecords that are actually importable, and `npm run docs:check` rejects any\ngenerated route drift before a release can be accepted.\n\n## Renderer Ownership\n\n- `DocumentationArticlePageRenderer` owns page-to-slot composition.\n- `DocumentationArticleTemplateRenderer` owns the responsive article layout.\n- `DocumentationArticleRenderer` owns safe article-block presentation.\n- `DocumentationNavigationRenderer` owns bounded search, category grouping,\n  audience filtering, selected-route presentation, and documentation-home\n  navigation.\n- The typed renderer manifest and registries are the only mapping from CMS\n  logical keys to Axis implementations.\n\nThe renderer accepts bounded headings, paragraphs, ordered and unordered\nlists, blockquotes, code blocks, tables, and image references. It does not\nexecute HTML, scripts, event handlers, expressions, CMS-provided JavaScript, or\narbitrary renderer URLs. Only `/docs`, anchor, HTTP(S), and mail links are\neligible for navigation.\n\nCode blocks use a theme-owned high-contrast surface and bounded responsive\ntypography. Do not use undefined palette tokens: an unresolved background with\na light foreground can make valid documentation appear blank.\n\nDocumentation links and the on-page heading index use the readable secondary\ntext palette with a persistent gold underline. Signature gold remains an\naccent, focus, and action color; it must not be used as small text on light\nsurfaces where it does not provide sufficient contrast.\n\n## Failure And Recovery\n\n- A missing or unavailable CMS route uses the existing CMS recovery screen and\n  retry action.\n- A disabled content-pack capability shows configuration guidance and no\n  import action.\n- A missing or checksum-invalid source shows a low-disclosure unavailable\n  state.\n- An unauthorized employee cannot view or run content-pack operations even if\n  a control is forced in the browser.\n- A failed update keeps the Wiki route available and presents a retryable,\n  low-disclosure failure. Import diagnostics and data reconciliation remain\n  backend responsibilities.\n- An immutable-release conflict tells the operator that documentation content\n  changed without a new release version and directs the release owner to\n  increment and regenerate the pack. Axis maps the stable backend error code;\n  it never renders backend stacks, contexts, record data, or arbitrary\n  diagnostic messages.\n- A missing renderer, unsupported contract version, unsupported channel, or\n  malformed property is rejected by the CMS render boundary.\n- A disabled or unavailable BackOffice documentation contribution displays the\n  standard module workspace state.\n- Unsupported content blocks are not rendered.\n\nBinary image delivery is not yet owned by the CMS delivery contract. Image\nmetadata is migrated and validated by `nodicsdocs`, while Axis presents a\nnon-executable placeholder until a governed CMS/DAM binary-delivery contract\nis implemented. Do not add repository file paths or ad-hoc static-file loaders\nto bypass that boundary.\n\n## Customize and extend safely\n\nAuthor or extend project documentation in that project's canonical structured\nsource and generate its committed `data/core` content pack with\n`manifest/docs-content-pack.json`. Register the pack through the Nodics-owned\ndocumentation contribution contract; Axis discovers and renders the resulting\nnavigation and article blocks.\n\nDo not hand-edit generated CMS records, add repository file readers to Axis,\ncreate a browser import engine, or duplicate a project's documentation inside\nthe framework pack. Test deterministic generation, stale-pack rejection,\npermissions, checksum and version boundaries, unsafe links and blocks, missing\nmedia, import/update recovery, navigation, responsive rendering, and rollback\nto a previously accepted immutable release.\n\n## Contributor Verification\n\nRun:\n\n```bash\nnpm run verify\n```\n\nThe suite covers registry parity, declarative article rendering, unsafe-link\nrejection, executable-block rejection, TypeScript, accessibility-oriented\nmarkup, linting, formatting, and production build behavior.\n",
        },
        {
          code: 'axis.employee-access',
          title: 'Employee Login, Recovery, Lock, and Dashboard',
          route: '/docs/nodics-axis/employee-access',
          section: 'axis-capabilities',
          sectionTitle: 'Axis Capabilities',
          sectionOrder: 30,
          order: 70,
          audience: [
            'business-user',
            'administrator',
            'developer',
            'security-reviewer',
          ],
          summary:
            'Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures.',
          searchText:
            "Employee Login, Recovery, Lock, and Dashboard Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures. # Employee Login, Recovery, Screen Lock, and Dashboard\n\nAxis is an employee Back Office application. Customer credentials must not be\nsubmitted to its login flow.\n\n## Startup journey\n\n1. Axis reads public deployment configuration from `/axis-config.json`.\n2. Axis calls the BackOffice public bootstrap.\n3. BackOffice returns only active Profile/CMS endpoints and Axis CMS\n   composition identifiers.\n4. Axis loads `/login` directly from CMS public delivery.\n5. Axis sends entered employee credentials directly to Profile.\n6. Axis keeps the returned access token in memory only. Profile stores the\n   refresh credential in a scoped `HttpOnly` cookie that Axis cannot read.\n7. Axis calls secured BackOffice bootstrap with the access token.\n8. BackOffice returns the effective tenant-scoped Axis employee policy,\n   authorized module catalogue, navigation contributions, compatibility,\n   availability, and client-safe environment observations.\n9. Axis constructs its shell from the local Dashboard route plus authorized\n   module-owned navigation.\n10. If authorized, Axis loads `/dashboard` from authenticated CMS delivery.\n\nA customer login is never used as a fallback. Authentication or authorization\nfailure keeps the employee outside the dashboard and displays a safe message.\n\n## Password recovery\n\nThe public `/forgot-password` page uses the same responsive authentication\nlayout as login, with CMS-owned introduction, identifier label, placeholder,\naction label, assistance, and legal text. Axis intentionally keeps submission\nunavailable today because Profile does not yet expose an approved employee\nself-recovery API.\n\nDo not simulate success, send identifiers to BackOffice or CMS, or build a\nfrontend-only reset path. The future Profile contract must be anti-enumeration,\nrate-limited, tenant-aware, auditable, and compatible with the existing OTP and\nnotification authorities before this form is connected.\n\n## Idle screen lock\n\nThe secured bootstrap returns `axisPolicy` after employee authentication.\nVersion 1 supports `screenLockEnabled`, `idleTimeoutSeconds` from 60 through\n86,400, the policy contract version and optimistic revision, and whether the\neffective policy came from layered defaults or persistence.\n\nAxis observes keyboard, pointer, touch, and wheel activity. Pointer movement is\nthrottled to one deadline update per second to avoid high-frequency work.\nBackground-tab timer throttling is handled by comparing the absolute deadline\nwhen the page becomes visible again.\n\nWhen the deadline passes, Axis:\n\n1. records a bounded lock marker and same-application return path in\n   `sessionStorage`;\n2. replaces it with `/lock-screen`;\n3. keeps tokens and the employee identifier in memory only;\n4. hides protected application content;\n5. asks only for the current employee password; and\n6. sends that password directly to Profile.\n\nA successful unlock receives fresh Profile tokens, reloads secured BackOffice\nbootstrap and policy, removes the lock marker, and returns to the prior\nprotected route. A failed unlock stays locked and shows a safe authentication\nerror. “Not you? Sign out” clears the marker and local session, asks Profile to\nrevoke it, and returns to `/login`.\n\nThe marker contains only `locked: true` and a validated relative return path.\nIt never contains a password, access token, refresh token, employee identifier,\nbackend response, or authorization data. External, malformed, authentication,\nand lock-screen return paths fall back to `/dashboard`.\n\nThe screen lock is presentation defense-in-depth. It never replaces bearer\nexpiry, revocation, Profile authentication, or target-module authorization.\n\nOn browser refresh, Axis reads only the non-secret CSRF cookie and calls the\nProfile browser restore endpoint with credentials included. Profile requires\nthe exact allowed Origin and matching `X-CSRF-Token`, consumes the refresh\ncredential once, rotates it, and returns a replacement access token and\nemployee identifier. Axis then reloads the secured BackOffice bootstrap and\nrestores the lock gate before protected routing. A session that was locked\nbefore refresh remains on `/lock-screen` until successful password\nre-verification; refresh cannot silently return it to the dashboard. An\nexpired, revoked, replayed, or otherwise invalid session returns to the public\nlogin experience.\n\n## Logout\n\nAxis sends the configured CSRF value to Profile, which revokes refresh state\nand expires both browser-session cookies. Only after Profile confirms that\noperation does Axis clear its in-memory access token and redirect to `/login`.\nIf Profile is unavailable, Axis keeps the secured session visible and reports\nthat logout was not completed; it never presents a false signed-out state while\nan HttpOnly refresh session remains active. The existing short-lived access\ntoken remains bounded by backend expiry and revocation policy.\n\n## Configuration\n\nThe root `.env` contains only public deployment values:\n\n```dotenv\nAXIS_BACKOFFICE_BASE_URL=http://localhost:3000\nAXIS_ENTERPRISE_CODE=default\nAXIS_CLIENT_CONTRACT_VERSION=1\nAXIS_REQUEST_TIMEOUT_MS=10000\nAXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf\n```\n\nThe CSRF cookie name is public protocol configuration and must equal Profile's\neffective `profileBrowserSession.csrfCookieName`. Do not add Profile or CMS\nURLs. BackOffice discovers them from module self-registration. Never place\npasswords or tokens in `.env`, browser storage, URLs, logs, or query-cache keys.\n\n## Failure behavior\n\n- Invalid configuration uses static configuration recovery.\n- BackOffice discovery failure uses static discovery recovery with retry.\n- Missing Profile or CMS registration fails public bootstrap closed.\n- CMS failure or incompatibility uses static CMS recovery with retry.\n- Invalid employee credentials produce a safe login error.\n- Missing BackOffice permission rejects the session before dashboard delivery.\n- Direct `/dashboard` navigation attempts Profile-owned session restoration;\n  absent or invalid refresh state redirects to `/login`.\n- Direct `/lock-screen` navigation without an authenticated locked session\n  redirects safely.\n- Refreshing a locked session restores the lock marker and requires password\n  verification before any protected route is rendered.\n- Invalid or incompatible Axis policy rejects authenticated bootstrap.\n- Persistent-policy read failure is handled by BackOffice using its safe\n  configured default.\n\nEmployee password recovery is not yet a Profile capability. The CMS page may\nexplain the process, but Axis keeps submission disabled until Profile provides\na governed, enumeration-safe recovery contract.\n\n## Customize and extend safely\n\nCustomize login, recovery, and lock-screen presentation through CMS component\nproperties and project-owned renderer composition. Add a new authentication\nview only as a focused renderer with a typed logical-key registration while\ncontinuing to use Profile's browser-session, CSRF, refresh, revocation, and\nemployee-only contracts.\n\nDo not replace Profile authentication, store tokens in browser storage, embed\ncredentials in configuration, infer authorization from the UI, or implement\npassword recovery locally. Test valid and invalid credentials, customer-user\nrejection, missing permissions, refresh restoration, locked-page refresh,\nCSRF rejection, idle boundaries, logout revocation, malformed CMS properties,\nresponsive layout, and rollback of the project renderer registration.\n\n## Verification\n\n```bash\nnpm run verify\n```\n\nTests cover low-disclosure discovery, policy validation, credential delivery\nto Profile, HttpOnly refresh restoration, CSRF transport, secured bootstrap\nbearer use, protected-route preservation after remount, invalid-session\nfallback, CMS authentication pages, inactivity boundaries, activity deadline\nreset, protected routing, and logout revocation.\n",
        },
        {
          code: 'axis.assistant',
          title: 'Axis Assistant Frontend',
          route: '/docs/nodics-axis/assistant',
          section: 'axis-capabilities',
          sectionTitle: 'Axis Capabilities',
          sectionOrder: 30,
          order: 80,
          audience: ['business-user', 'developer', 'architect', 'security-reviewer'],
          summary:
            'Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior.',
          searchText:
            "Axis Assistant Frontend Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior. # Axis Assistant Frontend\n\n## Implemented scope\n\nAxis implements the authenticated `/assistant` CMS route, dedicated Assistant\npage/template/component renderer hierarchy, BackOffice-driven top navigation\nshortcut, validated direct-module connection projection, and a typed\nprovider-neutral Assistant HTTP client.\n\nThe workspace presents backend-owned CMS content, an interactive composer,\nemployee and Assistant message surfaces, smooth streamed text, progress\nfeedback, cancellation, and safe failure presentation. The authenticated SSE\ntransport and presentation state controller drive the visible experience.\nNo browser request is sent to OpenAI, Anthropic, Gemini, or another provider.\n\n## Authority and request flow\n\n1. BackOffice authenticated bootstrap advertises the authorized `aiAssistant`\n   capability, navigation entry, availability, and client-callable module\n   leases.\n2. Axis validates those values and selects only an `UP` or `DEGRADED`\n   connection. Credentials, query strings, fragments, and non-HTTP endpoints\n   are rejected.\n3. CMS authenticated delivery resolves `/assistant` for the configured Site,\n   locale, and channel.\n4. The CMS logical renderer keys map to allowlisted Axis-owned React\n   implementations.\n5. The typed Assistant client sends the employee bearer directly to the\n   discovered `aiAssistant` module endpoint.\n6. Nodics owns authorization, validation, persistence, provider selection,\n   token governance, tools, Workflow handoff, and audit.\n\nAxis does not proxy Assistant calls through BackOffice and does not select or\ncall an AI provider.\n\n## Source map\n\n- `src/bootstrap/publicBootstrap.ts`: authorized navigation and module\n  connection validation.\n- `src/cms/renderers/pages/AssistantPageRenderer.tsx`: Assistant page slot\n  composition.\n- `src/cms/renderers/templates/AssistantWorkspaceTemplateRenderer.tsx`:\n  responsive workspace structure.\n- `src/cms/renderers/components/assistant/AssistantWorkspaceRenderer.tsx`:\n  CMS-driven workspace composition.\n- `src/cms/renderers/components/assistant/AssistantMessageTimeline.tsx`:\n  stable, auto-following activity region.\n- `src/cms/renderers/components/assistant/AssistantMessageBubble.tsx`:\n  employee and Assistant text presentation.\n- `src/cms/renderers/components/assistant/AssistantStreamingStatus.tsx`:\n  accessible non-terminal progress.\n- `src/cms/renderers/components/assistant/AssistantComposer.tsx`: keyboard and\n  touch-friendly Send and Stop controls.\n- `src/cms/renderers/components/assistant/AssistantConversationHistory.tsx`:\n  responsive conversation selection and bounded pagination.\n- `src/assistant/api/assistantContracts.ts`: provider-neutral domain contracts.\n- `src/assistant/api/assistantContractParsers.ts`: untrusted response\n  validation.\n- `src/assistant/api/assistantTransport.ts`: shared authenticated HTTP\n  boundary.\n- `src/assistant/api/assistantClient.ts`: bounded Assistant commands.\n- `src/assistant/api/assistantSseParser.ts`: incremental, byte-bounded SSE\n  framing.\n- `src/assistant/api/assistantEventStream.ts`: authenticated event delivery,\n  ordering, resume, and reconnect.\n- `src/assistant/presentation/assistantPresentationContracts.ts`: UI-facing\n  state and action contracts.\n- `src/assistant/presentation/assistantPresentationReducer.ts`: pure,\n  deterministic event projection.\n- `src/assistant/presentation/assistantQueryKeys.ts`: enterprise, employee,\n  conversation, and turn cache isolation.\n- `src/assistant/presentation/useAssistantPresentation.ts`: lifecycle\n  composition for conversation creation, turn submission, streaming, and\n  cancellation.\n- `src/assistant/api/assistantError.ts`: stable backend error and correlation\n  projection.\n\n## CMS customization\n\nThe backend component properties currently control:\n\n- title;\n- welcome message;\n- composer placeholder;\n- send and stop labels;\n- empty-state text;\n- employee and Assistant speaker labels;\n- working, cancelling, and failure labels;\n- conversation history, new conversation, empty history, and load-more labels.\n\nChanging these properties in the authoritative CMS content changes Axis after\nthe next CMS delivery without rebuilding the frontend. Axis never accepts\nbackend JavaScript, component imports, event handlers, arbitrary HTML, or CSS.\n\nLocale and channel remain part of the CMS delivery request. Renderers must\ntolerate translated text expansion and future right-to-left content. Axis does\nnot translate by parsing English text.\n\n## Typed API coverage\n\nThe current client implements only backend routes that exist:\n\n- create, list, and retrieve employee-owned conversations;\n- submit and retrieve a turn;\n- replay persisted turn events;\n- cancel a turn;\n- create, retrieve, approve, and reject a mutation confirmation;\n- execute or hand off an approved confirmation.\n\nRequests use:\n\n- memory-only employee access token;\n- validated enterprise context;\n- bounded query values;\n- abort and timeout handling;\n- `Idempotency-Key` for turn and confirmation creation;\n- no browser credentials in URLs, logs, or storage.\n\nThe event stream additionally enforces the backend contract version and event\ntypes, validates conversation and turn ownership, rejects sequence gaps,\ndeduplicates replayed events, resumes with `Last-Event-ID` and\n`afterSequence`, observes an idle timeout, and limits reconnect duration.\nAuthentication failures and malformed protocol data fail closed rather than\nbeing retried.\n\n## Presentation lifecycle\n\nThe presentation reducer keeps each conversation in a separate immutable\nrecord. It projects streamed text, status, clarification, tool planning,\nconfirmation, citations, usage, completion, cancellation, and failure while\nretaining the normalized raw events for later UI projections.\n\nDuplicate and stale events are ignored. Sequence gaps fail the active\npresentation rather than silently rendering incomplete output. Events for\nanother conversation or turn cannot mutate the active state. Resetting the\nscope removes all prior employee conversation state.\n\nThe React controller creates a conversation only when required, submits one\nturn at a time, streams its ordered events, and requests cancellation without\nprematurely closing the stream that carries the authoritative terminal event.\nIt holds no provider credentials and does not reproduce backend validation.\n\nOn authenticated entry, the controller loads a bounded employee-owned\nconversation page. Selecting a conversation loads its durable turn/message and\nstructured-interaction projection from `aiAssistant`; it does not reconstruct\nlong-term history from short-lived SSE events. Clarification, tool state, safe\nusage, citations, and confirmation lifecycle therefore survive reload. Older\nconversation and turn pages are merged without changing chronological order or\ncrossing enterprise and employee scope.\n\nBackend error `code`, safe `message`, HTTP status, and optional `traceId` remain\nstructured. Axis uses a generic fallback only when the backend supplies no\nsafe response.\n\nArchive conversation and a dedicated usage-summary screen are not yet\nimplemented in Axis. The employee-owned summary endpoint belongs directly to\n`aiProviders`; Axis must discover and call that module rather than proxying\nthrough Assistant when that screen is added.\n\n## Accessibility and responsive behavior\n\n- The page and workspace use named regions and headings.\n- Every CMS-provided action retains an accessible name.\n- The layout remains single-column and bounded on desktop, tablet, mobile, and\n  WebView widths.\n- The activity region announces additions and text updates politely.\n- Enter sends, Shift+Enter creates a new line, and buttons retain touch-safe\n  targets.\n- The timeline keeps a stable minimum height and follows new output without\n  remounting existing messages.\n- System reduced-motion preferences disable smooth scrolling and the streaming\n  cursor animation through the shared Axis theme.\n\n## Failure and security behavior\n\n- Unauthenticated access redirects to the configured public page.\n- A locked employee remains on the lock-screen flow.\n- Missing capability contribution removes the Assistant shortcut.\n- `UNAVAILABLE` and `UNKNOWN` disable the shortcut.\n- Incompatible renderers use the existing safe render boundary.\n- Malformed CMS properties fail inside the render boundary.\n- Unsafe direct-module endpoints fail bootstrap parsing before a token is\n  transmitted.\n- Backend errors do not become frontend authorization decisions.\n\n## Verification\n\nFocused coverage includes:\n\n- authenticated `/assistant` CMS delivery;\n- renderer registry and contract versions;\n- backend-driven labels and malformed properties;\n- direct module URL and employee headers;\n- fragmented SSE parsing and heartbeat handling;\n- authenticated streaming, terminal closure, replay deduplication, and resume;\n- cross-turn, sequence, contract, and payload-boundary rejection;\n- immutable presentation event projection and terminal states;\n- duplicate, stale, gap, and foreign-event handling;\n- employee and enterprise query-key isolation;\n- conversation creation, turn submission, overlap prevention, and controller\n  cleanup;\n- CMS-driven workspace copy, keyboard submission, streamed text, and\n  cancellation controls;\n- persisted multi-turn history, selection, new-conversation reset, and bounded\n  pagination;\n- idempotent turn submission;\n- input bounds;\n- stable error codes and trace IDs;\n- unsafe endpoint and path rejection.\n\nRun:\n\n```bash\nnpm run verify\n```\n\n## Structured interactions\n\nAxis renders backend `CLARIFICATION`, `TOOL_PLAN`, and\n`CONFIRMATION_REQUIRED` events through separate feature components. All visible\nheadings and action labels come from the authenticated Assistant CMS component.\nAxis does not reconstruct mutation arguments, target routes, authorization, or\nconfirmation identity.\n\nApproval and rejection return the backend-issued argument digest and\noptimistic revision. Rejection is available only before execution begins.\nExecution sends only the backend-issued confirmation code. Invalid event\npayloads fail closed; expired, stale, unauthorized, conflicting, and uncertain\noutcomes remain backend decisions and are shown through the normal safe error\ncontract. The browser never retries an execution automatically.\n\n## Evidence and operational transparency\n\nThe workspace renders the backend-issued tool lifecycle as prepared, running,\nsucceeded, or failed. Only stable tool identity, owner module, operation\nidentity, lifecycle state, and a safe failure code are displayed. Raw tool\narguments, target URLs, credentials, and result content are neither projected\nnor rendered.\n\nCitation cards display backend-issued identity, title, section, locator, and\nversion. A title becomes a link only when AI Knowledge explicitly classifies\nit as `INTERNAL_ROUTE` and supplies a validated same-application path.\nUnclassified locators and rejected external or scheme-based values remain\nplain text. Axis validates the path again and never invents navigation from\nlocator text.\n\nUsage cards display the normalized input, output, cached-input, reasoning, and\nembedding token values plus reconciliation state. Reservation identifiers are\ndiscarded. Axis does not infer cost, quota, or remaining budget. `aiProviders`\nnow exposes the separate direct, employee-owned\n`GET /operations/ai-ledger/usage/me` projection for a future budget-summary\nsurface.\n\nMalformed citation, usage, tool lifecycle, and reconciliation payloads fail\nclosed through the same event-data boundary.\n\n## Customize and extend safely\n\nAdd Assistant presentation through a new focused renderer under the Assistant\nfeature, a typed logical-key registration, and bounded properties supplied by\nthe owning CMS component. Add provider, tool, prompt, budget, knowledge, or\nbusiness-operation behavior only in the appropriate Nodics AI or business\nmodule; Axis renders the provider-neutral events it receives.\n\nDo not parse prompts into business commands, select providers in the browser,\ninvent token balances, expose tool arguments, or call unregistered endpoints.\nTest the project extension with allowed and rejected renderer keys, contract\nversions, malformed SSE events, unauthorized tool proposals, confirmation\nrevision changes, reconnection boundaries, keyboard and narrow-view behavior,\nand a production build. Removing the renderer registration is the safe\nfrontend rollback; backend conversations and audit records remain owned by\nNodics.\n\n## Known next boundary\n\nNodics now supports provider-neutral `CLARIFICATION` and\n`MUTATION_PROPOSAL` planning for confirmed enterprise creation. Axis consumes\nthe resulting clarification and persisted-confirmation events through the\nexisting renderers; it does not parse natural language into business fields.\n\nThe next boundary is local end-to-end acceptance with a configured provider:\nrequest enterprise creation, answer missing fields, inspect the persisted\nconfirmation, approve it, execute it, and verify Profile's result. This requires\nprovider credentials and usage credit; deterministic contract tests remain the\noffline acceptance authority.\n\nThe offline backend acceptance now covers the full provider-neutral\nclarification, confirmation, approval, and Profile-dispatch boundary. Axis\nseparately verifies rendering, digest/revision approval, execution controls,\nmalformed-event rejection, accessibility, and responsive behavior. A live\nbrowser journey remains intentionally deferred until provider credentials and\nusage credit are configured.\n",
        },
        {
          code: 'axis.schema-workbench',
          title: 'Axis Schema Workbench',
          route: '/docs/nodics-axis/schema-workbench',
          section: 'axis-capabilities',
          sectionTitle: 'Axis Capabilities',
          sectionOrder: 30,
          order: 90,
          audience: ['business-user', 'administrator', 'developer', 'operator'],
          summary:
            'Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification.',
          searchText:
            "Axis Schema Workbench Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification. # Axis Schema Workbench\n\nAxis implements the presentation side of Nodics Schema Workbench. The owning\nbackend module remains authoritative for schemas, allowed operations,\nrelationships, generated CRUD, domain operations, validation, permissions,\ntenant isolation, and persistence.\n\nBusiness-user and backend customization guidance is maintained in the Nodics\ndocumentation:\n\n- `gDocs/backoffice/how-schema-workbench-works.md`\n- `gFramework/nDatabase/database/README.md`\n\n## Implemented frontend behavior\n\nThe authenticated `/schema-workbench` route:\n\n- appears only when BackOffice advertises its authorized navigation item;\n- resolves its page, template, renderer keys, and visible copy through CMS;\n- discovers active module endpoints through authenticated BackOffice bootstrap;\n- requests safe Workbench descriptors directly from those modules;\n- lists and filters authorized data types by readable label or module;\n- loads bounded record pages through an owning-module Workbench query that\n  delegates to existing generated CRUD services;\n- searches the full authorized result set across descriptor-advertised safe\n  text fields rather than filtering only the current browser page;\n- sorts only by descriptor-advertised scalar fields;\n- builds typed filters only from descriptor-advertised fields and operators;\n- supports bounded nested `AND`/`OR` groups with an inert JSON request preview;\n- keeps filter edits as a local draft until the employee applies them;\n- offers only backend-configured page sizes and shows the authoritative total;\n- cancels obsolete in-flight record requests when query state changes;\n- renders primary and searchable fields in a responsive record table;\n- stores employee/tenant/enterprise-scoped favourites, recents, visible\n  columns, and up to ten saved views in bounded browser storage without\n  storing records or access tokens;\n- supports current-page row selection and exposes bulk deletion only when the\n  owning descriptor explicitly advertises it;\n- requests a governed delete-impact preview before enabling final deletion;\n- consumes backend concurrency and aggregate-operation metadata without\n  inventing browser-side business authority;\n- opens a complete permitted record detail view from the record table;\n- shows Edit only when the owning descriptor advertises Update;\n- initializes Update from the selected record while excluding managed and\n  read-only fields from the mutation model;\n- sends a bounded generated Update request using the original primary identity,\n  an editable model, and `returnModified`;\n- refreshes the record list and detail view only after the owning module\n  confirms the update;\n- shows Delete only when the owning descriptor advertises it;\n- requires a modal confirmation showing record identity, authenticated tenant,\n  and enterprise;\n- sends one bounded Delete query using the original primary identity;\n- disables confirmation and cancellation while deletion is pending;\n- keeps the record and confirmation available when authorization, ownership,\n  reference integrity, or another backend business rule rejects deletion;\n- displays only the bounded backend error code/message contract and never\n  renders diagnostic contexts, records, queries, or stacks;\n- closes record details and refreshes the list only after confirmed deletion;\n- renders one typed field component per supported schema field type;\n- creates independent Address and Contact records through generated CRUD;\n- renders schema-declared relationship fields separately from ordinary arrays;\n- renders each relationship using its backend-declared business role, so\n  references to the same target type remain distinguishable;\n- combines backend-declared display properties in their configured order so\n  selectors show meaningful identities instead of only opaque record keys;\n- presents related records as `code - description`, truncating descriptions\n  longer than five words to the first five words followed by `...`;\n- exposes the complete description in a tooltip on pointer hover or keyboard\n  focus, including descriptions displayed without truncation;\n- selects existing related records through the target module's generated read\n  contract;\n- holds new related records as in-memory drafts until the parent is submitted;\n- creates drafted related records through their owning module and associates\n  only the returned reference property;\n- prevents duplicate references in a multi-value relationship;\n- bounds nested related creation by backend-advertised depth and stops cycles\n  by falling back to selecting an existing record;\n- offers inline related-record editing only when both relationship metadata\n  advertises `EDIT_RELATED` and the target schema advertises Update;\n- retains each successfully created related reference when a later related\n  operation or parent save fails, so retry does not recreate that record;\n- keeps unsaved drafts in component memory;\n- blocks visibly incomplete required fields before submission while preserving\n  backend validation as authoritative;\n- formats dates with locale-aware browser APIs and renders booleans with\n  CMS-provided user-facing labels;\n- exposes loading, empty, unavailable, and retry states.\n\nEvery backend model that is authorized and not explicitly excluded is\ndiscoverable with generated Search, Read, Create, Update, and governed Delete\noperations. An owning schema may narrow that list. Address and Contact also\ndemonstrate the Address-to-Contact relationship editor.\n\n## Request ownership\n\n```text\nAxis → BackOffice: authorized navigation and module endpoints\nAxis → CMS: Workbench page composition and presentation copy\nAxis → owning module: schema descriptors, generated reads, and authorized writes\n```\n\nAxis does not send schema operations through BackOffice and does not maintain\nits own module registry. Access tokens remain in memory and are sent only in\nthe Authorization header. Enterprise context is sent in\n`x-enterprise-code`.\n\n## Successful behavior\n\nAn authorized employee opens Schema Workbench, selects Address, and sees the\nfirst bounded page of Address records using labels supplied by the effective\nProfile schema. The employee can open Create Address, complete required fields,\nselect an existing Contact or add a new Contact draft, and submit the complete\ndraft directly to Profile.\n\nFor Update, the employee opens a record through **View**, chooses **Edit** when\npermitted, changes ordinary fields or relationship references, and submits.\nAxis uses the original primary identity as the update query even when the\neditable primary field changes. When the descriptor advertises required\noptimistic concurrency, the query also carries the record's advertised\nrevision. Update and Delete fail closed before sending a request if that\nrequired revision is unavailable.\n\nFor Delete, the employee opens the record, chooses **Delete**, verifies the\nrecord, tenant, and enterprise shown in the confirmation, and explicitly\nconfirms. Axis never cascades deletion and never treats a frontend permission\ncheck as final authority.\n\n## Unauthorized or invalid behavior\n\nThe route is unavailable when BackOffice does not advertise it. Modules omit\nschemas and operations that the employee cannot access. Malformed descriptors,\nunsupported operations, unsafe endpoints, invalid envelopes, and malformed\nrecords fail validation rather than being rendered. A relationship cannot\ncreate a target schema unless that descriptor advertises Create.\n\nAxis does not infer optimistic concurrency from timestamps. It sends an\neffective revision only when the backend descriptor advertises a compare-and-\nset field. Axis must never simulate stale-write protection in browser state.\n\nDelete rejection leaves the confirmation open with the safe backend message.\nAxis does not hide a reference-integrity failure, retry automatically, or\ndelete related records as compensation.\n\nThe HTTP client accepts only a bounded top-level backend message and code for\ndisplay. Structured diagnostic contexts and stacks are deliberately ignored.\nMalformed or non-JSON failures use a generic HTTP fallback. Translation must\nuse stable backend codes and CMS presentation content rather than parsing an\nEnglish message.\n\n## Boundary and responsive behavior\n\nAt large widths, data-type navigation and records use two columns. At smaller\nwidths they stack into one column. Record columns remain horizontally\nscrollable instead of shrinking into unreadable content. Controls retain\nlabels, keyboard operation, and semantic list/table roles.\n\n## Failure and recovery\n\nOne unavailable module does not hide descriptors successfully returned by\nother active modules. If every discovery request fails, Axis shows a safe\nretryable error. Record loading failures remain scoped to the selected schema\nand can be retried without reloading the application.\n\nWorkbench does not claim a browser-side or cross-module database transaction.\nRelated records are created sequentially during final submission. After each\nsuccessful related creation, Axis replaces that local draft with the returned\nreference. If a later related creation or the parent save fails, the form stays\nopen and the successful reference remains selected. Retrying therefore resumes\nfrom the failed step instead of creating the successful record again.\n\nThis recovery model avoids hidden deletion and unsafe compensation. It does not\nguarantee atomic commit across modules. Journeys that require strict atomicity\nmust use a backend-owned domain operation or a transaction-capable workflow,\nnot generic Workbench coordination.\n\n## Customize and extend safely\n\n- Change page copy and composition through `axisContentCatalog`.\n- Change available schemas, fields, relationships, and operations in the\n  owning Nodics module.\n- Change module availability through Nodics runtime topology and BackOffice\n  registration.\n- Extend Axis with one typed renderer per new CMS component contract.\n\nDo not add hardcoded module endpoints, backend rules, translated business\ncopy, or alternate schema definitions to Axis.\n\n## Verification\n\nRun:\n\n```bash\nnpm run verify\n```\n\nFocused tests cover direct-module headers and paths, bounded record reads,\ncreates and updates, original-identity update queries, descriptor validation,\nbounded original-identity deletion, missing-identity rejection, explicit\nconfirmation, pending duplicate-submit prevention, authenticated tenant\nparsing, partial discovery, retryable failure, schema selection, record rendering,\nrecord selection, CMS renderer registration, required-field\nvalidation, default values, framework-managed field exclusion, selecting an\nexisting relationship, related-record creation, duplicate-reference prevention,\nretry without duplicate related creation, backend conflict-message handling,\ndiagnostic-context exclusion, malformed-error fallback, and locale-aware\nrecord formatting. Coverage also includes revision forwarding for Update and\nDelete, missing-revision rejection before network access, self-referential\nrelationship cycle fallback, bounded nested relationship depth, full\ndescription tooltips, and five-word related-record summaries.\n\nThe authenticated local acceptance journey additionally verifies schema\ndiscovery across active modules, bounded search, unauthenticated rejection,\nraw-query rejection, advertised Create/Update/Delete visibility, readable\nEnterprise relationship labels, and `code - description` Tenant choices. The\njourney is read-only: it opens forms and selectors but does not submit a\nbusiness-data mutation.\n",
        },
        {
          code: 'axis.module-health',
          title: 'Module Health',
          route: '/docs/nodics-axis/module-health',
          section: 'axis-capabilities',
          sectionTitle: 'Axis Capabilities',
          sectionOrder: 30,
          order: 100,
          audience: ['administrator', 'operator', 'developer', 'security-reviewer'],
          summary:
            'Monitor the sanitized BackOffice module and node readiness projection without creating a browser-side health authority.',
          searchText:
            "Module Health Monitor the sanitized BackOffice module and node readiness projection without creating a browser-side health authority. # Module Health\n\n## Purpose and ownership\n\nModule Health gives an authorized employee a responsive view of registered\nNodics modules and runtime instances. Operators can see whether Profile, CMS,\nWorkflow, BackOffice, or another capability is healthy, degraded, unavailable,\nor unknown and identify the registered environment, server, and node involved.\n\nAxis does not decide health. Nodics System owns readiness and BackOffice owns\nthe sanitized availability observation and registry projection. Axis owns only\ntyped consumption, interaction, rendering, filtering, and accessible state\npresentation.\n\nAxis displays the backend-provided package label and renders the\nloader-discovered parent/child hierarchy. It never sends a label or canonical\npath as the operational identifier; detail, refresh, query keys, and\nauthorization continue using the original module name.\n\n## Navigation and access\n\nBackOffice contributes **Module Health** under **Operations and Integration**\nthrough `backofficeCapabilities.backoffice.navigation`; Axis does not hardcode\nthe menu. It is returned only with `backoffice.registry.admin.view`.\n\nThe route is `/operations/module-health`. Employee session and screen-lock\nguards protect direct navigation. Backend authorization remains mandatory.\n\n## Frontend structure\n\n```text\nsrc/operations/moduleHealth/\n  ModuleHealthRoutePage.tsx\n  ModuleHealthTree.tsx\n  api/\n    moduleHealthClient.ts\n    moduleHealthContracts.ts\n\ntest/operations/moduleHealth/\n  api/\n    moduleHealthClient.test.ts\n```\n\nContracts reject malformed counts, identifiers, states, and freshness.\nThe client supplies the in-memory employee token, enterprise header, request\ntimeout, no-store policy, and redirect rejection. It stores no credentials and\nrejects unsafe module path segments.\n\nTanStack Query owns server state. Summary data loads once; instance details\nload only for the selected module, avoiding an unbounded request per module.\nWindow focus and explicit actions refresh data. Axis adds no health poller.\nAn on-demand **Check now** action is enabled only when the selected module has\nat least one client-callable runtime endpoint. Non-client modules still show\ntheir registration heartbeat and observed state, but Axis does not request a\nrefresh that the backend cannot perform.\n\n## Operator workflow\n\n1. Open **Operations and Integration > Module Health**.\n2. Review totals and module states.\n3. Expand or collapse module groups.\n4. Search by label, code, canonical path, environment, server, or state.\n   Matching descendants retain their ancestor chain.\n5. Select a concrete module.\n6. Review each registered node's heartbeat, readiness observation, state,\n   freshness, and stable reason.\n7. Choose **Check now** for a governed immediate observation.\n\nExpired and intentionally deregistered nodes are not active instances. Axis\ndoes not infer expected cluster membership from previously observed nodes.\n\n## Responsive, accessible, and failure behavior\n\n- Cards wrap and list/details stack on narrow screens.\n- State always has text in addition to color.\n- Search is visibly labelled; rows are keyboard-operable buttons.\n- Loading uses announced progress and failures use alerts.\n- Dates use the browser locale.\n- BackOffice failure never falls back to invented health.\n- Unauthorized access remains a backend rejection.\n- Malformed responses fail closed.\n- Stale evidence is `UNKNOWN`, never healthy.\n- Refresh failure preserves the existing view and shows a bounded message.\n\n## Customize and extend safely\n\nPartners may change styling or compose presentation around typed contracts.\nThey must not call databases/providers from Axis, reproduce the registry,\ncall every module ping as a second authority, persist access tokens or raw\ndiagnostics, infer configured cluster membership, or bypass permissions.\n",
        },
        {
          code: 'axis.imports-exports',
          title: 'Imports and Exports Workspace',
          route: '/docs/nodics-axis/imports-exports',
          section: 'axis-capabilities',
          sectionTitle: 'Axis Capabilities',
          sectionOrder: 30,
          order: 110,
          audience: ['administrator', 'operator', 'developer', 'security-reviewer'],
          summary:
            'Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary.',
          searchText:
            'Imports and Exports Workspace Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary. # Imports and Exports Workspace\n\n## Purpose and ownership\n\nAxis gives authorized employees a responsive workspace for Nodics data\noperations. It is a client of the `import` module and does not discover files,\ncalculate installation state, sequence imports, write a database, or retain a\nbrowser-side audit authority.\n\nBackOffice contributes **Operations and Integration → Imports and Exports** at\n`/operations/imports-exports`. Axis renders it only when authenticated\nnavigation contains that entry.\n\n## Frontend organization\n\n- `src/operations/importExport/ImportExportRoutePage.tsx` owns presentation and\n  short-lived selection.\n- `src/operations/importExport/api/dataReleaseContracts.ts` owns bounded client\n  types.\n- `src/operations/importExport/api/dataReleaseClient.ts` owns authenticated\n  transport and defensive parsing.\n- Tests mirror this hierarchy under `test/operations/importExport`.\n\nTanStack Query owns catalogue server state. The browser sends selected module\ncodes and reviewed versions; Nodics re-discovers and validates the authority\nbefore doing work.\n\n## Employee workflow\n\nChoose Initialization, Core, or Sample data; review friendly module names,\ndescriptions, versions, and states; select releases; validate; then install or\nupdate when authorized. Controls stack on narrow screens, remain keyboard\noperable, and have assistive labels.\n\n## Security, failure, and extension\n\nThe in-memory employee token is sent only to the selected `import` connection\nwith enterprise context. Axis never infers authorization from a visible button.\nUnknown states and incompatible responses are rejected. Timeouts, authorization\nfailures, disabled policy, integrity failures, and stale selections are shown\nwithout backend stacks or diagnostics.\n\nExisting installations may enter this workspace with the historical\n`import.core.run` administrator permission so they can install the new\nfine-grained permission data. Nodics still enforces a separate type-specific\npermission for each execution.\n\nExport remains unavailable because backend export providers are fail-closed.\nAxis must not enable a placeholder or simulate export.\n\nExtend presentation inside this feature and reuse shell and API patterns. Never\nadd an Axis filesystem picker or importer. Run `npm run verify` and validate\ndesktop, touch, narrow viewport, keyboard, unauthorized, unavailable-module,\nvalidation, execution, recovery, integration, and regression behavior.\n\n## Customize and extend safely\n\nAdd project-specific release filters, explanatory CMS copy, or result\npresentation through focused Axis components while continuing to call the\nNodics nImport catalogue, preflight, execution, and history contracts. New\nimport or export formats, release discovery, sequencing, persistence, and\nprovider behavior belong in later backend modules behind the provider-neutral\ndata contracts.\n\nDo not add a browser filesystem picker, inspect sibling repositories, submit\narbitrary server paths, calculate installation state locally, or enable export\nbefore its backend contract is active. Test authorized and unauthorized\ncatalogues, initialization/core/sample separation, stale selection, checksum\nand compatibility rejection, execution retry, history projection, narrow and\nkeyboard use, backend unavailability, and removal of the project presentation\nextension.\n',
        },
        {
          code: 'axis.feature-delivery',
          title: 'Axis Feature Delivery Checklist',
          route: '/docs/nodics-axis/feature-delivery',
          section: 'contribute-to-axis',
          sectionTitle: 'Contribute to Axis',
          sectionOrder: 40,
          order: 120,
          audience: ['developer', 'architect', 'framework-maintainer', 'ai-tool'],
          summary:
            'Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates.',
          searchText:
            'Axis Feature Delivery Checklist Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates. # Axis Feature Delivery Checklist\n\nUse this checklist for every implemented Axis feature. Complete the ownership\nanalysis before changing source and retain evidence in the pull request or\ndelivery record.\n\n## 1. Repository boundary\n\nRecord:\n\n- the authoritative Nodics module and backend contract;\n- the Axis route, feature, or component that consumes it;\n- the contract version or supported range;\n- the authentication and authorization boundary;\n- the tenant, enterprise, application, Site, Store, locale, channel, and module\n  context involved;\n- backend changes required in `nodics`, if any;\n- Axis changes required in this repository;\n- documentation and tests owned by each repository.\n\nStop when ownership is ambiguous. Do not move backend business behavior into\nAxis to avoid defining a backend contract.\n\n## 2. Reuse and dependency check\n\nConfirm:\n\n- an existing Axis component, hook, client, state pattern, or test utility was\n  considered first;\n- an existing Nodics API, schema, permission, workflow, publishing, cache,\n  search, import, or export authority is reused;\n- no second registry, loader, schema authority, workflow engine, publisher,\n  context authority, or provider integration is introduced;\n- any new dependency has documented bundle, maintenance, security,\n  accessibility, browser, WebView, and licensing impact.\n\n## 3. Security and privacy\n\nConfirm:\n\n- target modules independently authorize every request;\n- UI filtering is not treated as authorization;\n- passwords, access tokens, refresh tokens, cookies, internal credentials, and\n  secrets are absent from browser storage, URLs, logs, and telemetry;\n- errors and telemetry contain safe correlation data without sensitive\n  payloads;\n- query keys and caches cannot cross users or validated contexts;\n- logout, revocation, and context switching cancel requests and clear affected\n  data;\n- CMS or another module cannot supply executable browser code.\n- configurable business-facing labels, help text, placeholders, empty states,\n  action captions, and content fragments come from typed CMS properties rather\n  than renderer literals;\n- domain errors retain stable backend codes and safe messages, while generic\n  Axis fallbacks are limited to browser and transport failures;\n- locale, direction, translated text expansion, and locale-aware formatting\n  are covered without creating a second translation authority in Axis;\n- arbitrary HTML, CSS, JavaScript, expressions, event handlers, and remote\n  renderer imports are rejected.\n\n## 4. Interaction quality\n\nImplement and verify applicable:\n\n- loading, success, empty, unavailable, unauthorized, incompatible, validation,\n  conflict, partial-failure, and recovery states;\n- keyboard operation and visible focus;\n- screen-reader names, roles, states, and announcements;\n- responsive desktop, tablet, and mobile WebView layouts;\n- long translated labels, right-to-left direction, locale fallback, and\n  locale-aware dates, numbers, currency, and pluralization where applicable;\n- touch target sizing and non-hover alternatives;\n- reduced motion;\n- comfortable and compact density;\n- light and dark token compatibility;\n- safe cancellation and stale-response prevention.\n\n## 5. Contract tests\n\nCover applicable:\n\n- positive behavior;\n- invalid input and malformed response;\n- permission and cross-tenant denial;\n- minimum, maximum, empty, timeout, and payload boundaries;\n- supported, degraded, incompatible, missing, and unknown contract versions;\n- cancellation, retry, idempotency, and concurrency;\n- backend outage and recovery;\n- responsive and accessibility behavior;\n- integration with `monoServer` and later distributed module topology;\n- regression of the static recovery shell.\n\nUI tests prove client behavior only. Backend authorization, validation,\npersistence, workflow, publication, and integration tests belong in `nodics`.\n\n## 6. Documentation placement\n\nUpdate this repository for implemented:\n\n- installation, build, start, and deployment behavior;\n- runtime configuration consumed by Axis;\n- frontend architecture and contribution rules;\n- browser routes, interaction, accessibility, responsive behavior, and\n  troubleshooting;\n- frontend verification commands.\n\nUpdate `nodics` for implemented:\n\n- business-user and administrator journeys;\n- backend architecture, configuration, permissions, APIs, schemas, workflows,\n  publication, integration, security, and operations;\n- customization and override guidance;\n- backend tests and deployment evidence.\n\nKeep proposals, unresolved decisions, and future action lists only in the\ntemporary ignored planning workspace. Do not document planned UI as available\nproduct behavior.\n\n## 7. Partial-discovery and use-case proof\n\nConfirm that a contributor or AI tool opening only the nearest maintained files\ncan identify:\n\n- whether behavior belongs in Axis or Nodics;\n- the owning feature, route, component, hook, client, contract, and test;\n- the supported extension point and prohibited bypass;\n- backend authority and permission expectations;\n- accessibility, responsive, WebView, security, and recovery requirements;\n- the focused verification command.\n\nDocument successful, unauthorized/invalid, boundary/responsive,\nfailure/recovery, and supported customization examples with expected outcomes.\nLink Nodics-owned business and backend guidance rather than copying it into\nAxis.\n\n## 8. Completion evidence\n\nBefore marking the feature complete:\n\n- link the implemented source and contract;\n- link focused test evidence;\n- link permanent documentation for every applicable audience;\n- explain any audience or operational layer that is not applicable;\n- run `npm run verify`;\n- record known limitations and safe fallback behavior;\n- confirm the action-plan status reflects repository and test evidence.\n\n## Customize and extend safely\n\nFor every delivered feature, name the later project-owned page, component,\nrenderer, typed client, hook, configuration, or style extension point. Include\nthe smallest working file map and example, the backend contract that remains\nauthoritative, prohibited browser-side shortcuts, upgrade and rollback impact,\nand the focused positive, rejected, boundary, integration, regression, and\nproduction-build tests.\n\nA checklist that records only the shipped OOTB behavior is incomplete. If no\nsafe extension point exists, record that limitation explicitly rather than\nsuggesting that a framework file should be edited.\n',
        },
        {
          code: 'axis.implementation-contract',
          title: 'Axis Implementation and Documentation Contract',
          route: '/docs/nodics-axis/implementation-contract',
          section: 'contribute-to-axis',
          sectionTitle: 'Contribute to Axis',
          sectionOrder: 40,
          order: 130,
          audience: ['developer', 'architect', 'framework-maintainer', 'ai-tool'],
          summary:
            'Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts.',
          searchText:
            "Axis Implementation and Documentation Contract Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts. # Axis Implementation And Documentation Contract\n\nAxis is a reusable frontend framework application, not a one-off admin screen.\nPartners, developers, and AI tools must be able to extend it without seeing the\nentire repository or moving backend authority into the browser.\n\n## Local Discovery Chain\n\nFor every feature, read:\n\n1. root `AGENTS.md`;\n2. this contract and the feature-delivery checklist;\n3. the nearest feature source and focused tests;\n4. the consuming Nodics API/OpenAPI/CMS contract;\n5. the feature guide linked from the root README.\n\nCritical rules must be repeated concisely near the implementation and protected\nby TypeScript, schema validation, linting, or focused tests. A conversation or\ntemporary plan is never an implementation authority.\n\n## Repository Ownership\n\nAxis owns:\n\n- rendering, interaction, responsive/WebView behavior, and accessibility;\n- typed client contract consumption;\n- browser routing and presentation state;\n- TanStack Query server-state coordination;\n- Axis-owned CMS renderer implementations and typed registries;\n- loading, empty, unauthorized, incompatible, failure, and recovery views.\n\nNodics owns:\n\n- business rules and authoritative validation;\n- authentication and authorization enforcement;\n- persistence, workflows, pipelines, events, jobs, and integrations;\n- secrets, tenant governance, AI execution, tool execution, and audit;\n- backend schemas, APIs, configuration, runtime contracts, and business docs.\n\nWhen both repositories change, analyze and test each boundary separately.\n\n## Placement Rules\n\n- Application composition belongs under `src/app`.\n- Feature interaction belongs in a named feature boundary, not a generic\n  utilities folder.\n- CMS page, template, and component renderers follow the paths defined in\n  `AGENTS.md`, with one renderer implementation per file.\n- Backend logical keys map through typed registries. CMS data never supplies\n  executable JavaScript.\n- Configurable page copy comes from CMS component properties. Page and\n  component renderers consume typed labels, headings, placeholders, help text,\n  empty-state text, action captions, and fragments rather than defining\n  business-facing copy in JSX.\n- Error ownership remains layered: the owning backend module supplies stable\n  domain codes and safe messages, CMS supplies configurable presentation copy,\n  and Axis supplies only generic browser or transport fallbacks needed when\n  the backend is unavailable. Axis never interprets English error text.\n- Locale, channel, and backend-resolved fallback are part of the CMS delivery\n  contract. Axis preserves that context, supports translated text expansion\n  and text direction, and uses locale-aware formatting without creating a\n  parallel backend translation catalogue.\n- Runtime values come from validated Axis configuration and backend contracts.\n  They do not belong in scattered constants or `package.json`.\n- Raw identifiers remain separate from display labels. Humanization is a\n  presentation fallback after contract validation, never a transformation of\n  request, authorization, cache, storage, audit, or telemetry identity. A\n  backend-provided localized display name always takes precedence.\n- Secrets never belong in frontend source, `.env`, generated browser config,\n  storage, URLs, telemetry, or logs.\n\n## Required Feature Documentation\n\nEvery significant feature guide explains:\n\n- purpose and current implemented scope;\n- backend authority and contract version;\n- source/component/client/test map;\n- setup and runtime configuration;\n- permissions and security;\n- keyboard, screen reader, responsive, touch, reduced-motion, and WebView\n  behavior;\n- success, unauthorized/invalid, boundary/responsive, failure/recovery, and\n  supported customization examples;\n- troubleshooting and verification;\n- known limitations and safe fallback.\n\nBusiness workflows and backend customization belong in Nodics documentation.\nAxis guides link to them and focus on frontend setup and contribution.\n\n## Customize and extend safely\n\nEvery feature guide includes this section. It\nshows the smallest supported project-owned Axis customization, identifies the\nbackend contract and security boundary that remain authoritative, lists\nprohibited frontend shortcuts or parallel authorities, and names the focused\npositive, rejected, boundary, integration, and regression tests. Explaining\nonly the out-of-the-box screen or workflow is incomplete.\n\n## Canonical Source and Generated Data\n\nAxis documentation is authored as granular, reviewable pages under\n`source/documentation`. The deterministic documentation generator creates CMS\npage, component, navigation, route, search, and immutable manifest data under\n`data/core` and `manifest/docs-content-pack.json`.\n\nDo not hand-edit generated CMS article records. Do not maintain a shorter\ngenerated summary beside a richer project guide. Every implemented feature\nmust update its canonical source page and regenerate the content pack in the\nsame change:\n\n```bash\nnpm run docs:generate\nnpm run docs:check\n```\n\nThe migration register records the original README/docs evidence, canonical\nsource, destination route, source hash, headings, word count, and disposition.\nREADME or legacy docs may be reduced only after all substantive guidance is\nmapped, generated, reviewed in Axis, and protected by content-preservation\ntests.\n\n## Required Examples\n\n### Successful\n\nAn authorized employee loads a backend descriptor, Axis validates it, maps its\nrenderer key to an Axis-owned component, and displays the result.\n\n### Unauthorized\n\nThe backend denies an operation. Axis presents an accessible unauthorized state\nand does not infer authorization from menu visibility.\n\n### Boundary\n\nThe same feature remains usable with keyboard and touch in desktop, tablet, and\nmobile WebView layouts, including long labels, empty data, and bounded payloads.\n\n### Failure And Recovery\n\nWhen BackOffice or a target module is unavailable, Axis presents a safe\nrecovery state, avoids stale privileged data, and retries through the same\nauthoritative contract.\n\n### Customization\n\nA partner adds an Axis-owned renderer and registry manifest for a backend\nlogical component key. The partner does not download code from CMS or add\nbusiness validation to the renderer.\n\nAn administrator changes a component label or locale-specific content in the\nauthoritative CMS catalog. The same allowlisted Axis renderer displays the\nresolved value without a frontend rebuild. Missing or malformed required\nproperties produce the renderer's safe generic fallback and never execute\nbackend-supplied markup or code.\n\nA validated fallback identifier such as `axisContentCatalog` may be displayed\nas `Axis Content Catalog`. The raw code remains unchanged wherever identity or\nbackend communication is involved.\n\n## Acceptance\n\nA feature is complete only when:\n\n- repository ownership is explicit;\n- the backend contract and security boundary are preserved;\n- strict TypeScript and validation cover external data;\n- accessibility and responsive states are implemented;\n- focused positive, negative, boundary, failure, integration, and regression\n  tests pass;\n- implemented documentation and known limitations are current;\n- `npm run verify` passes at the release-oriented gate.\n\n## Continue\n\n- [Feature Delivery Checklist](feature-delivery-checklist.md)\n- [Architecture And Ownership](architecture-and-ownership.md)\n- [CMS Delivery And Renderers](cms-delivery-and-renderers.md)\n- [Axis README](../README.md)\n",
        },
      ],
    },
    active: true,
  },
  record1: {
    code: 'axisDocsComponentoverview',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.overview',
      title: 'What Is Nodics Axis?',
      route: '/docs/nodics-axis',
      section: 'discover-axis',
      sectionTitle: 'Discover Axis',
      category: 'Discover Axis',
      audience: ['business-user', 'administrator', 'developer', 'operator'],
      summary:
        'Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope.',
      headings: [
        {
          text: 'Boundaries',
          anchor: 'overview-1-boundaries',
          level: 2,
        },
        {
          text: 'Prerequisites',
          anchor: 'overview-2-prerequisites',
          level: 2,
        },
        {
          text: 'Start locally',
          anchor: 'overview-3-start-locally',
          level: 2,
        },
        {
          text: 'Environment and runtime configuration',
          anchor: 'overview-4-environment-and-runtime-configuration',
          level: 2,
        },
        {
          text: 'Quality commands',
          anchor: 'overview-5-quality-commands',
          level: 2,
        },
        {
          text: 'Current scope',
          anchor: 'overview-6-current-scope',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'overview-7-customize-and-extend-safely',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Nodics Axis is the reusable Back Office frontend for a single Nodics-based customer project deployment.',
        },
        {
          kind: 'paragraph',
          text: 'Canonical user and contributor documentation is authored as granular pages under `source/documentation` and deterministically generated into the committed CMS import release under `data/core`. The current `docs/` files remain migration evidence until coverage, detail-preservation, generated-pack, and rendered-content gates approve their retirement.',
        },
        {
          kind: 'paragraph',
          text: 'Axis is a client-side web application. It authenticates human users through Profile, retrieves an authorized bootstrap contract from Back Office, and then calls the authoritative APIs of discovered Nodics modules directly.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Boundaries',
          anchor: 'overview-1-boundaries',
        },
        {
          kind: 'unordered-list',
          items: [
            'Nodics remains the backend and API authority.',
            'Axis contains presentation and interaction behavior, not authoritative business logic.',
            'Every customer project has an isolated Axis deployment.',
            'Axis does not depend on whether Nodics runs as a monoServer or distributed module servers.',
            'CMS descriptors can select Axis-owned components but cannot deliver executable frontend code.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'See [Axis Architecture and Ownership](/docs/nodics-axis/architecture) for the per-customer deployment model, repository responsibilities, contract authority, security boundary, and verification expectations.',
        },
        {
          kind: 'paragraph',
          text: 'See [Frontend Technology Stack](/docs/nodics-axis/technology-stack) for the approved tools, state ownership, styling decision, repository shape, and dependency-governance rules.',
        },
        {
          kind: 'paragraph',
          text: 'Use the [Feature Delivery Checklist](/docs/nodics-axis/feature-delivery) for repository-boundary analysis, security, contract testing, accessibility, documentation placement, and completion evidence for every Axis slice.',
        },
        {
          kind: 'paragraph',
          text: 'Read the [Axis Implementation And Documentation Contract](/docs/nodics-axis/implementation-contract) for partial-discovery rules, repository placement, required use cases, and the acceptance contract followed by human developers and AI tools.',
        },
        {
          kind: 'paragraph',
          text: 'See [CMS Delivery and Renderer Integration](/docs/nodics-axis/cms-renderers) for the resolved-page client, trusted renderer boundary, validation rules, cache isolation, and login integration.',
        },
        {
          kind: 'paragraph',
          text: 'See [Documentation Content In Axis](/docs/nodics-axis/documentation-content) for dynamic Framework, Swaggers, Nodics Axis, and future project documentation sources; per-product CMS catalogs; the import-ready Axis content pack; renderer ownership; security boundaries; and failure behavior.',
        },
        {
          kind: 'paragraph',
          text: 'See [Module Health](/docs/nodics-axis/module-health) for backend-driven operational navigation, the typed registry client, module and node readiness presentation, security boundaries, responsive behavior, and extension rules.',
        },
        {
          kind: 'paragraph',
          text: 'See [Imports and Exports](/docs/nodics-axis/imports-exports) for immutable init, core, and sample release discovery, validation, installation, history, security, and the intentionally disabled export surface.',
        },
        {
          kind: 'paragraph',
          text: 'See [Employee Login, Recovery, Screen Lock, and Dashboard](/docs/nodics-axis/employee-access) for startup discovery, employee-only authentication, persistent BackOffice policy consumption, protected routing, logout, and failure recovery.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Prerequisites',
          anchor: 'overview-2-prerequisites',
        },
        {
          kind: 'unordered-list',
          items: [
            'Node.js 24',
            'npm 10 or 11',
            'A local Nodics backend when integration behavior is required',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Start locally',
          anchor: 'overview-3-start-locally',
        },
        {
          kind: 'paragraph',
          text: 'Start Nodics in a separate terminal:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'cd ../nodics\nnpm start -- ENV=startioLocal SERVER=monoServer',
        },
        {
          kind: 'paragraph',
          text: 'Install and start Axis:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm ci\nnpm run dev',
        },
        {
          kind: 'paragraph',
          text: 'Axis runs at <http://localhost:3100>.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Environment and runtime configuration',
          anchor: 'overview-4-environment-and-runtime-configuration',
        },
        {
          kind: 'paragraph',
          text: 'Copy `.env.example` to `.env` and configure the local/build values there. The repository includes a safe local `.env`; Git ignores it so each developer or deployment can use different values.',
        },
        {
          kind: 'code',
          language: 'dotenv',
          text: 'AXIS_BACKOFFICE_BASE_URL=http://localhost:3000\nAXIS_ENTERPRISE_CODE=default\nAXIS_CLIENT_CONTRACT_VERSION=1\nAXIS_REQUEST_TIMEOUT_MS=10000\nAXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf\nAXIS_ASSISTANT_MAXIMUM_EVENT_BYTES=65536\nAXIS_ASSISTANT_RECONNECT_WINDOW_MS=120000\nAXIS_ASSISTANT_IDLE_TIMEOUT_MS=45000\nAXIS_DEV_HOST=0.0.0.0\nAXIS_DEV_PORT=3100\nAXIS_STRICT_PORT=true\nAXIS_BUILD_SOURCEMAP=true',
        },
        {
          kind: 'paragraph',
          text: 'Vite validates these values and generates `/axis-config.json`:',
        },
        {
          kind: 'code',
          language: 'json',
          text: '{\n  "backofficeBaseUrl": "http://localhost:3000",\n  "enterpriseCode": "default",\n  "clientContractVersion": 1,\n  "requestTimeoutMs": 10000,\n  "browserSessionCsrfCookieName": "nodics_axis_csrf",\n  "assistantMaximumEventBytes": 65536,\n  "assistantReconnectWindowMs": 120000,\n  "assistantIdleTimeoutMs": 45000\n}',
        },
        {
          kind: 'paragraph',
          text: "Axis loads that document and then obtains the active Profile and CMS endpoints from BackOffice's low-disclosure public bootstrap. Axis does not maintain a second module endpoint list. Invalid or unavailable configuration produces a recovery screen instead of attempting authentication.",
        },
        {
          kind: 'paragraph',
          text: '`.env` and `axis-config.json` are public configuration, not secret stores. Never place passwords, tokens, API keys, private keys, or credentials in them. Only explicitly named `AXIS_*` variables are consumed; Axis does not expose arbitrary environment variables to browser code.',
        },
        {
          kind: 'paragraph',
          text: 'For production, the generated `dist/axis-config.json` may be replaced during deployment so endpoints can change without rebuilding Axis. Serve it with `Cache-Control: no-store`. Serve hashed assets with long-lived immutable caching.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Quality commands',
          anchor: 'overview-5-quality-commands',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run format:check\nnpm run lint\nnpm run typecheck\nnpm run test\nnpm run build\nnpm run verify',
        },
        {
          kind: 'paragraph',
          text: 'The implemented Gold and Charcoal foundations, responsive shell, recovery states, accessibility behavior, and extension rules are documented in [Axis Design System And Static Shell](/docs/nodics-axis/design-system).',
        },
        {
          kind: 'paragraph',
          text: 'The implemented authenticated Assistant CMS route, renderer hierarchy, direct-module connection validation, and typed HTTP client are documented in [Axis Assistant Frontend](/docs/nodics-axis/assistant).',
        },
        {
          kind: 'paragraph',
          text: 'The implemented Schema Workbench discovery, schema browser, bounded record list, relationship editor, record detail, Create, Update, and governed Delete are documented in [Axis Schema Workbench](/docs/nodics-axis/schema-workbench).',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Current scope',
          anchor: 'overview-6-current-scope',
        },
        {
          kind: 'paragraph',
          text: 'The current foundation proves the frontend runtime boundary, safe startup, CMS delivery/renderers, employee authentication, secured BackOffice bootstrap, CMS-driven login/recovery/lock pages, idle screen locking, protected dashboard routing, logout, the CMS-driven Assistant workspace shell, typed Assistant HTTP contracts, authenticated resumable SSE transport, isolated Assistant presentation state, and the CMS-driven Schema Workbench browser with direct-module schema discovery, bounded record reads, and independent Address and Contact creation, relationship coordination, record detail, generated Update, and governed Delete. The Operations workspace includes Module Health with permission-filtered navigation, module summaries, on-demand registered node details, and governed refresh. Visual designers remain future slices.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'overview-7-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Use Axis as the reusable frontend base and place customer-specific pages, renderers, typed clients, theme composition, and CMS presentation data in the customer Axis project. Keep customer business services, schemas, workflows, permissions, and API implementations in its Nodics backend project.',
        },
        {
          kind: 'paragraph',
          text: 'The smallest extension adds one focused feature directory, one backend-driven navigation or renderer contract, and mirrored tests. Do not modify reusable framework behavior for customer needs, hardcode backend-owned labels, create a parallel module registry, or move authorization into the browser. Prove startup, permission, contract-version, malformed-data, failure recovery, responsive and WebView, integration, regression, and production-build behavior. Rollback removes the customer registration and deployment artifact without mutating Nodics-owned persisted contracts.',
        },
      ],
      searchText:
        'What Is Nodics Axis? Understand Axis, its backend boundary, supported runtime, setup, configuration, quality commands, and implemented scope. # Nodics Axis\n\nNodics Axis is the reusable Back Office frontend for a single Nodics-based\ncustomer project deployment.\n\nCanonical user and contributor documentation is authored as granular pages\nunder `source/documentation` and deterministically generated into the committed\nCMS import release under `data/core`. The current `docs/` files remain\nmigration evidence until coverage, detail-preservation, generated-pack, and\nrendered-content gates approve their retirement.\n\nAxis is a client-side web application. It authenticates human users through\nProfile, retrieves an authorized bootstrap contract from Back Office, and then\ncalls the authoritative APIs of discovered Nodics modules directly.\n\n## Boundaries\n\n- Nodics remains the backend and API authority.\n- Axis contains presentation and interaction behavior, not authoritative\n  business logic.\n- Every customer project has an isolated Axis deployment.\n- Axis does not depend on whether Nodics runs as a monoServer or distributed\n  module servers.\n- CMS descriptors can select Axis-owned components but cannot deliver\n  executable frontend code.\n\nSee\n[Axis Architecture and Ownership](docs/architecture-and-ownership.md) for the\nper-customer deployment model, repository responsibilities, contract authority,\nsecurity boundary, and verification expectations.\n\nSee [Frontend Technology Stack](docs/frontend-technology-stack.md) for the\napproved tools, state ownership, styling decision, repository shape, and\ndependency-governance rules.\n\nUse the [Feature Delivery Checklist](docs/feature-delivery-checklist.md) for\nrepository-boundary analysis, security, contract testing, accessibility,\ndocumentation placement, and completion evidence for every Axis slice.\n\nRead the\n[Axis Implementation And Documentation Contract](docs/implementation-and-documentation-contract.md)\nfor partial-discovery rules, repository placement, required use cases, and the\nacceptance contract followed by human developers and AI tools.\n\nSee [CMS Delivery and Renderer Integration](docs/cms-delivery-and-renderers.md)\nfor the resolved-page client, trusted renderer boundary, validation rules,\ncache isolation, and login integration.\n\nSee [Documentation Content In Axis](docs/documentation-content.md) for dynamic\nFramework, Swaggers, Nodics Axis, and future project documentation sources;\nper-product CMS catalogs; the import-ready Axis content pack; renderer\nownership; security boundaries; and failure behavior.\n\nSee [Module Health](docs/module-health.md) for backend-driven operational\nnavigation, the typed registry client, module and node readiness presentation,\nsecurity boundaries, responsive behavior, and extension rules.\n\nSee [Imports and Exports](docs/imports-and-exports.md) for immutable init, core,\nand sample release discovery, validation, installation, history, security, and\nthe intentionally disabled export surface.\n\nSee [Employee Login, Recovery, Screen Lock, and Dashboard](docs/employee-login.md)\nfor startup discovery, employee-only authentication, persistent BackOffice\npolicy consumption, protected routing, logout, and failure recovery.\n\n## Prerequisites\n\n- Node.js 24\n- npm 10 or 11\n- A local Nodics backend when integration behavior is required\n\n## Start locally\n\nStart Nodics in a separate terminal:\n\n```bash\ncd ../nodics\nnpm start -- ENV=startioLocal SERVER=monoServer\n```\n\nInstall and start Axis:\n\n```bash\nnpm ci\nnpm run dev\n```\n\nAxis runs at <http://localhost:3100>.\n\n## Environment and runtime configuration\n\nCopy `.env.example` to `.env` and configure the local/build values there.\nThe repository includes a safe local `.env`; Git ignores it so each developer\nor deployment can use different values.\n\n```dotenv\nAXIS_BACKOFFICE_BASE_URL=http://localhost:3000\nAXIS_ENTERPRISE_CODE=default\nAXIS_CLIENT_CONTRACT_VERSION=1\nAXIS_REQUEST_TIMEOUT_MS=10000\nAXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf\nAXIS_ASSISTANT_MAXIMUM_EVENT_BYTES=65536\nAXIS_ASSISTANT_RECONNECT_WINDOW_MS=120000\nAXIS_ASSISTANT_IDLE_TIMEOUT_MS=45000\nAXIS_DEV_HOST=0.0.0.0\nAXIS_DEV_PORT=3100\nAXIS_STRICT_PORT=true\nAXIS_BUILD_SOURCEMAP=true\n```\n\nVite validates these values and generates `/axis-config.json`:\n\n```json\n{\n  "backofficeBaseUrl": "http://localhost:3000",\n  "enterpriseCode": "default",\n  "clientContractVersion": 1,\n  "requestTimeoutMs": 10000,\n  "browserSessionCsrfCookieName": "nodics_axis_csrf",\n  "assistantMaximumEventBytes": 65536,\n  "assistantReconnectWindowMs": 120000,\n  "assistantIdleTimeoutMs": 45000\n}\n```\n\nAxis loads that document and then obtains the active Profile and CMS endpoints\nfrom BackOffice\'s low-disclosure public bootstrap. Axis does not maintain a\nsecond module endpoint list.\nInvalid or unavailable configuration produces a recovery screen instead of\nattempting authentication.\n\n`.env` and `axis-config.json` are public configuration, not secret stores.\nNever place passwords, tokens, API keys, private keys, or credentials in them.\nOnly explicitly named `AXIS_*` variables are consumed; Axis does not expose\narbitrary environment variables to browser code.\n\nFor production, the generated `dist/axis-config.json` may be replaced during\ndeployment so endpoints can change without rebuilding Axis. Serve it with\n`Cache-Control: no-store`. Serve hashed assets with long-lived immutable\ncaching.\n\n## Quality commands\n\n```bash\nnpm run format:check\nnpm run lint\nnpm run typecheck\nnpm run test\nnpm run build\nnpm run verify\n```\n\nThe implemented Gold and Charcoal foundations, responsive shell, recovery\nstates, accessibility behavior, and extension rules are documented in\n[Axis Design System And Static Shell](docs/design-system-and-shell.md).\n\nThe implemented authenticated Assistant CMS route, renderer hierarchy,\ndirect-module connection validation, and typed HTTP client are documented in\n[Axis Assistant Frontend](docs/assistant-frontend.md).\n\nThe implemented Schema Workbench discovery, schema browser, bounded record\nlist, relationship editor, record detail, Create, Update, and governed Delete\nare documented in\n[Axis Schema Workbench](docs/schema-workbench.md).\n\n## Current scope\n\nThe current foundation proves the frontend runtime boundary, safe startup, CMS\ndelivery/renderers, employee authentication, secured BackOffice bootstrap,\nCMS-driven login/recovery/lock pages, idle screen locking, protected dashboard\nrouting, logout, the CMS-driven Assistant workspace shell, typed Assistant HTTP\ncontracts, authenticated resumable SSE transport, isolated Assistant\npresentation state, and the CMS-driven Schema Workbench browser with\ndirect-module schema discovery, bounded record reads, and independent Address\nand Contact creation, relationship coordination, record detail, generated\nUpdate, and governed Delete. The Operations workspace includes Module Health\nwith permission-filtered navigation, module summaries, on-demand registered\nnode details, and governed refresh. Visual designers remain future slices.\n\n## Customize and extend safely\n\nUse Axis as the reusable frontend base and place customer-specific pages,\nrenderers, typed clients, theme composition, and CMS presentation data in the\ncustomer Axis project. Keep customer business services, schemas, workflows,\npermissions, and API implementations in its Nodics backend project.\n\nThe smallest extension adds one focused feature directory, one backend-driven\nnavigation or renderer contract, and mirrored tests. Do not modify reusable\nframework behavior for customer needs, hardcode backend-owned labels, create a\nparallel module registry, or move authorization into the browser. Prove\nstartup, permission, contract-version, malformed-data, failure recovery,\nresponsive and WebView, integration, regression, and production-build\nbehavior. Rollback removes the customer registration and deployment artifact\nwithout mutating Nodics-owned persisted contracts.\n',
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/project-overview.md',
        evidence: 'README.md',
        hash: '9f8924022eb98b7e299ccae766b718ecce40c2843637443d98641d053944e58f',
        version: '0.3.3',
      },
      next: {
        title: 'Architecture and Repository Boundaries',
        route: '/docs/nodics-axis/architecture',
      },
    },
    active: true,
  },
  record2: {
    code: 'axisDocsComponentarchitecture',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.architecture',
      title: 'Architecture and Repository Boundaries',
      route: '/docs/nodics-axis/architecture',
      section: 'discover-axis',
      sectionTitle: 'Discover Axis',
      category: 'Discover Axis',
      audience: ['architect', 'developer', 'security-reviewer', 'ai-tool'],
      summary:
        'Learn the per-project deployment model, contract authority, security boundary, documentation ownership, and verification expectations.',
      headings: [
        {
          text: 'Decision',
          anchor: 'architecture-1-decision',
          level: 2,
        },
        {
          text: 'Deployment model',
          anchor: 'architecture-2-deployment-model',
          level: 2,
        },
        {
          text: 'Contract authority',
          anchor: 'architecture-3-contract-authority',
          level: 2,
        },
        {
          text: 'Security boundary',
          anchor: 'architecture-4-security-boundary',
          level: 2,
        },
        {
          text: 'Documentation ownership',
          anchor: 'architecture-5-documentation-ownership',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'architecture-6-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Verification expectations',
          anchor: 'architecture-7-verification-expectations',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'heading',
          level: 2,
          text: 'Decision',
          anchor: 'architecture-1-decision',
        },
        {
          kind: 'paragraph',
          text: 'Nodics Axis is a reusable Back Office browser application deployed once for each Nodics-based customer project. The Axis process and the Nodics backend processes are built, started, scaled, deployed, and rolled back independently. One Axis deployment must not switch between customer projects or federate their backend endpoints.',
        },
        {
          kind: 'paragraph',
          text: 'This decision keeps a clear authority boundary:',
        },
        {
          kind: 'unordered-list',
          items: [
            'Nodics owns business rules, persistence, authentication enforcement, authorization, workflows, pipelines, integrations, secrets, tenant governance, runtime contracts, and module APIs.',
            'Axis owns browser rendering, interaction, accessibility, responsive behavior, and non-authoritative client view state.',
            'Profile authenticates human users.',
            "BackOffice returns the caller's authorized, browser-safe module registry and compatibility metadata.",
            'After bootstrap, Axis calls each authoritative module directly. BackOffice does not proxy normal CMS, job, workflow, configuration, or business traffic.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Deployment model',
          anchor: 'architecture-2-deployment-model',
        },
        {
          kind: 'code',
          language: 'text',
          text: 'Customer project A\n  Axis deployment A\n    -> Profile A\n    -> BackOffice A -> authorized module discovery\n    -> CMS A, Workflow A, CronJob A, and other discovered modules\n\nCustomer project B\n  Axis deployment B\n    -> Profile B\n    -> BackOffice B -> authorized module discovery\n    -> project B modules',
        },
        {
          kind: 'paragraph',
          text: "Axis deployment A must never discover, select, or call project B endpoints. Whether a project's Nodics modules run together in `monoServer` or as distributed module servers does not change the browser contract.",
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Contract authority',
          anchor: 'architecture-3-contract-authority',
        },
        {
          kind: 'paragraph',
          text: 'Axis consumes versioned backend contracts such as OpenAPI, Profile authentication, BackOffice bootstrap, permissions, schemas, and module operation metadata. Generated or handwritten Axis clients are consumers of those contracts; they do not become contract authorities.',
        },
        {
          kind: 'paragraph',
          text: 'Axis must not:',
        },
        {
          kind: 'unordered-list',
          items: [
            'import source from the sibling Nodics checkout;',
            'embed backend services or persistence;',
            'reproduce authoritative validation or permission decisions;',
            'execute workflows, pipelines, integrations, AI tools, or arbitrary scripts in the browser;',
            'store service or CronJob credentials;',
            'create a second registry, schema authority, runtime loader, or endpoint federation layer.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Client-side validation may improve usability, but every target module must validate and authorize the request independently.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Security boundary',
          anchor: 'architecture-4-security-boundary',
        },
        {
          kind: 'paragraph',
          text: 'Human browser authentication remains separate from module-to-module and CronJob authentication. Axis may receive only browser-safe configuration, human-session material approved by the Profile browser-security contract, and permission-filtered module metadata. Passwords, access tokens, refresh tokens, service credentials, and secrets must never be written to browser storage, URLs, logs, or telemetry.',
        },
        {
          kind: 'paragraph',
          text: 'Detailed session, refresh, revocation, CORS, CSRF, CSP, and audience behavior will be documented only after the corresponding backend contracts are approved and implemented.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Documentation ownership',
          anchor: 'architecture-5-documentation-ownership',
        },
        {
          kind: 'unordered-list',
          items: [
            'This repository documents Axis installation, build, deployment, frontend contribution rules, browser architecture, accessibility, and implemented UI behavior.',
            'The Nodics repository documents product capabilities, business-user and administrator journeys, backend APIs, security enforcement, module configuration, operations, and backend customization.',
            'Temporary plans describe intended work only and must not be presented as implemented capability.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'architecture-6-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: "Create customer behavior in the customer backend project and customer presentation in its Axis project layer. A frontend extension may add a focused page, renderer, typed client, hook, and mirrored test, but it must continue to consume the owning Nodics module's versioned API and permission contract.",
        },
        {
          kind: 'paragraph',
          text: 'The smallest safe extension is one new renderer file plus one typed registry entry for a backend-issued logical renderer key. Do not copy BackOffice discovery, create a browser module registry, move validation or workflow into React, or edit reusable Nodics framework source. Prove the extension with contract-version, unauthorized, malformed-payload, responsive, integration, and production-build tests. Rollback removes the project registry entry while leaving the backend authority and persisted data unchanged.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Verification expectations',
          anchor: 'architecture-7-verification-expectations',
        },
        {
          kind: 'paragraph',
          text: 'Every Axis slice must identify:',
        },
        {
          kind: 'ordered-list',
          items: [
            'its authoritative backend owner and versioned contract;',
            'its Axis presentation and local-state responsibilities;',
            'authentication, authorization, tenant, and data-exposure boundaries;',
            'tests belonging to each repository;',
            'documentation belonging to each repository.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Implementation must cover applicable positive, negative, boundary, contract, security, responsive, accessibility, integration, recovery, and regression behavior. Run `npm run verify` before release-oriented commits.',
        },
      ],
      searchText:
        "Architecture and Repository Boundaries Learn the per-project deployment model, contract authority, security boundary, documentation ownership, and verification expectations. # Axis Architecture and Ownership\n\n## Decision\n\nNodics Axis is a reusable Back Office browser application deployed once for\neach Nodics-based customer project. The Axis process and the Nodics backend\nprocesses are built, started, scaled, deployed, and rolled back independently.\nOne Axis deployment must not switch between customer projects or federate\ntheir backend endpoints.\n\nThis decision keeps a clear authority boundary:\n\n- Nodics owns business rules, persistence, authentication enforcement,\n  authorization, workflows, pipelines, integrations, secrets, tenant\n  governance, runtime contracts, and module APIs.\n- Axis owns browser rendering, interaction, accessibility, responsive\n  behavior, and non-authoritative client view state.\n- Profile authenticates human users.\n- BackOffice returns the caller's authorized, browser-safe module registry and\n  compatibility metadata.\n- After bootstrap, Axis calls each authoritative module directly. BackOffice\n  does not proxy normal CMS, job, workflow, configuration, or business traffic.\n\n## Deployment model\n\n```text\nCustomer project A\n  Axis deployment A\n    -> Profile A\n    -> BackOffice A -> authorized module discovery\n    -> CMS A, Workflow A, CronJob A, and other discovered modules\n\nCustomer project B\n  Axis deployment B\n    -> Profile B\n    -> BackOffice B -> authorized module discovery\n    -> project B modules\n```\n\nAxis deployment A must never discover, select, or call project B endpoints.\nWhether a project's Nodics modules run together in `monoServer` or as\ndistributed module servers does not change the browser contract.\n\n## Contract authority\n\nAxis consumes versioned backend contracts such as OpenAPI, Profile\nauthentication, BackOffice bootstrap, permissions, schemas, and module\noperation metadata. Generated or handwritten Axis clients are consumers of\nthose contracts; they do not become contract authorities.\n\nAxis must not:\n\n- import source from the sibling Nodics checkout;\n- embed backend services or persistence;\n- reproduce authoritative validation or permission decisions;\n- execute workflows, pipelines, integrations, AI tools, or arbitrary scripts\n  in the browser;\n- store service or CronJob credentials;\n- create a second registry, schema authority, runtime loader, or endpoint\n  federation layer.\n\nClient-side validation may improve usability, but every target module must\nvalidate and authorize the request independently.\n\n## Security boundary\n\nHuman browser authentication remains separate from module-to-module and\nCronJob authentication. Axis may receive only browser-safe configuration,\nhuman-session material approved by the Profile browser-security contract, and\npermission-filtered module metadata. Passwords, access tokens, refresh tokens,\nservice credentials, and secrets must never be written to browser storage,\nURLs, logs, or telemetry.\n\nDetailed session, refresh, revocation, CORS, CSRF, CSP, and audience behavior\nwill be documented only after the corresponding backend contracts are\napproved and implemented.\n\n## Documentation ownership\n\n- This repository documents Axis installation, build, deployment, frontend\n  contribution rules, browser architecture, accessibility, and implemented UI\n  behavior.\n- The Nodics repository documents product capabilities, business-user and\n  administrator journeys, backend APIs, security enforcement, module\n  configuration, operations, and backend customization.\n- Temporary plans describe intended work only and must not be presented as\n  implemented capability.\n\n## Customize and extend safely\n\nCreate customer behavior in the customer backend project and customer\npresentation in its Axis project layer. A frontend extension may add a focused\npage, renderer, typed client, hook, and mirrored test, but it must continue to\nconsume the owning Nodics module's versioned API and permission contract.\n\nThe smallest safe extension is one new renderer file plus one typed registry\nentry for a backend-issued logical renderer key. Do not copy BackOffice\ndiscovery, create a browser module registry, move validation or workflow into\nReact, or edit reusable Nodics framework source. Prove the extension with\ncontract-version, unauthorized, malformed-payload, responsive, integration,\nand production-build tests. Rollback removes the project registry entry while\nleaving the backend authority and persisted data unchanged.\n\n## Verification expectations\n\nEvery Axis slice must identify:\n\n1. its authoritative backend owner and versioned contract;\n2. its Axis presentation and local-state responsibilities;\n3. authentication, authorization, tenant, and data-exposure boundaries;\n4. tests belonging to each repository;\n5. documentation belonging to each repository.\n\nImplementation must cover applicable positive, negative, boundary, contract,\nsecurity, responsive, accessibility, integration, recovery, and regression\nbehavior. Run `npm run verify` before release-oriented commits.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/architecture-and-ownership.md',
        evidence: 'docs/architecture-and-ownership.md',
        hash: 'f47604672729255bb987075b091a9ced856766fdb0b699f3f4f6037d3439293c',
        version: '0.3.3',
      },
      previous: {
        title: 'What Is Nodics Axis?',
        route: '/docs/nodics-axis',
      },
      next: {
        title: 'Frontend Technology Stack',
        route: '/docs/nodics-axis/technology-stack',
      },
    },
    active: true,
  },
  record3: {
    code: 'axisDocsComponenttechnologystack',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.technology-stack',
      title: 'Frontend Technology Stack',
      route: '/docs/nodics-axis/technology-stack',
      section: 'build-and-operate-axis',
      sectionTitle: 'Build and Operate Axis',
      category: 'Build and Operate Axis',
      audience: ['developer', 'operator', 'architect', 'ai-tool'],
      summary:
        'Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification.',
      headings: [
        {
          text: 'Selected foundation',
          anchor: 'technology-stack-1-selected-foundation',
          level: 2,
        },
        {
          text: 'State ownership',
          anchor: 'technology-stack-2-state-ownership',
          level: 2,
        },
        {
          text: 'Styling decision',
          anchor: 'technology-stack-3-styling-decision',
          level: 2,
        },
        {
          text: 'Repository shape',
          anchor: 'technology-stack-4-repository-shape',
          level: 2,
        },
        {
          text: 'CMS renderer organization',
          anchor: 'technology-stack-5-cms-renderer-organization',
          level: 2,
        },
        {
          text: 'Dependency decision rule',
          anchor: 'technology-stack-6-dependency-decision-rule',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'technology-stack-7-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Verification',
          anchor: 'technology-stack-8-verification',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'heading',
          level: 2,
          text: 'Selected foundation',
          anchor: 'technology-stack-1-selected-foundation',
        },
        {
          kind: 'paragraph',
          text: 'Nodics Axis uses one cohesive frontend application until demonstrated reuse and stable contracts justify extracting packages.',
        },
        {
          kind: 'table',
          headers: [
            'Concern',
            'Selected technology',
            'Current version',
            'Responsibility',
          ],
          rows: [
            [
              'Package management',
              'npm',
              '11.6.2',
              'Reproducible dependency installation from `package-lock.json`',
            ],
            [
              'UI runtime',
              'React / React DOM',
              '19.2.8',
              'Axis-owned browser rendering and interaction',
            ],
            [
              'Language',
              'TypeScript in strict mode',
              '6.0.3',
              'Compile-time safety across UI and contract consumers',
            ],
            [
              'Build and local server',
              'Vite',
              '8.1.5',
              'Development server and immutable production assets',
            ],
            [
              'Client routing',
              'React Router',
              '8.3.0',
              'Static recovery routes and authorized application navigation',
            ],
            [
              'Server state',
              'TanStack Query',
              '5.101.4',
              'Request lifecycle, caching, cancellation, and invalidation for backend-owned data',
            ],
            [
              'Component foundation',
              'MUI',
              '9.2.0',
              'Accessible primitives and Nodics-owned tokens and components',
            ],
            [
              'Styling runtime',
              'Emotion React / Styled',
              '11.14.0/11.14.1',
              'Material UI styling and theme-aware presentation',
            ],
            [
              'Unit and component tests',
              'Vitest / Testing Library React',
              '4.1.10/16.3.2',
              'User-observable frontend behavior and contract-consumer tests',
            ],
            [
              'Browser test environment',
              'jsdom',
              '29.1.1',
              'Browser DOM behavior in automated tests',
            ],
            [
              'Static quality',
              'ESLint / typescript-eslint',
              '9.39.5/8.65.0',
              'TypeScript and React code-quality rules',
            ],
            [
              'Formatting',
              'Prettier',
              '3.8.1',
              'Consistent source and documentation formatting',
            ],
          ],
        },
        {
          kind: 'paragraph',
          text: 'Supported engines and direct versions are declared in `package.json` and the complete dependency graph is locked in `package-lock.json`. Those files remain the dependency authority. The table is an operator-friendly snapshot and must be updated in the same change whenever a listed package version changes.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'State ownership',
          anchor: 'technology-stack-2-state-ownership',
        },
        {
          kind: 'unordered-list',
          items: [
            'TanStack Query owns remote server state and request lifecycle.',
            'Presentation state stays close to the route or feature that owns it.',
            'Backend modules remain authoritative for persisted state, validation, authorization, workflows, and business outcomes.',
            'Axis must not create a browser store that becomes a second copy of backend registry, permission, workflow, publication, or tenant authority.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'A dedicated global client-state dependency may be considered only when a measured cross-feature problem cannot be handled safely by React composition, route state, or TanStack Query.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Styling decision',
          anchor: 'technology-stack-3-styling-decision',
        },
        {
          kind: 'paragraph',
          text: 'Axis uses MUI primitives, Emotion, and original Nodics design tokens. Tailwind is not part of the selected runtime. Commercial administration templates may inform information grouping only; their source code, components, assets, layouts, and branding are not dependencies.',
        },
        {
          kind: 'paragraph',
          text: 'The design system must preserve keyboard operation, screen-reader support, responsive behavior, reduced motion, mobile WebView compatibility, and comfortable and compact density modes.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Repository shape',
          anchor: 'technology-stack-4-repository-shape',
        },
        {
          kind: 'paragraph',
          text: 'Axis starts as one application repository with cohesive feature boundaries. It is not a mandatory monorepo. A package may be extracted later only when:',
        },
        {
          kind: 'ordered-list',
          items: [
            'two or more real consumers need the same stable capability;',
            'its public contract and ownership are explicit;',
            'extraction does not duplicate a Nodics backend authority;',
            'independent versioning and testing provide a demonstrated benefit.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'This avoids package boundaries that add governance and release overhead before the product has stable reuse seams.',
        },
        {
          kind: 'paragraph',
          text: 'Production code belongs under `src/`. Tests belong under the root `test/` directory and mirror the production feature boundaries, for example `src/cms/` and `test/cms/`. Test-only fixtures belong below the matching test feature and must not be imported by production code. `tsconfig.app.json` strictly checks runtime source, while `tsconfig.test.json` strictly checks the separate test tree.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'CMS renderer organization',
          anchor: 'technology-stack-5-cms-renderer-organization',
        },
        {
          kind: 'paragraph',
          text: 'CMS sends composition data and logical renderer contracts; Axis owns every executable renderer. Renderer source follows a strict, navigable hierarchy:',
        },
        {
          kind: 'code',
          language: 'text',
          text: 'src/cms/renderers/\n├── pages/                  # one page renderer per file\n├── templates/              # one template renderer per file\n├── components/\n│   ├── authentication/     # authentication-specific component renderers\n│   ├── dashboard/          # dashboard-specific component renderers\n│   └── shared/             # genuinely reusable component renderers\n├── registry/               # typed logical-key mappings and contract manifest\n└── shared/                 # renderer-only types, guards, and property readers',
        },
        {
          kind: 'paragraph',
          text: 'Do not add a generic file containing multiple unrelated renderer implementations. A new CMS renderer requires:',
        },
        {
          kind: 'ordered-list',
          items: [
            'one focused renderer file in the correct capability directory;',
            'one typed registry mapping from the backend logical key;',
            'one renderer-manifest entry declaring kind and supported contract version;',
            'focused tests in the mirrored `test/cms/renderers` hierarchy; and',
            'safe failure for unknown keys, incompatible versions, or invalid properties.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Reusable renderers are grouped by capability rather than copied into every page. Page-specific placement is reserved for a renderer contract deliberately owned by only that page. Backend data must never contain a TypeScript import, React component name, executable file path, script URL, or HTML implementation.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Dependency decision rule',
          anchor: 'technology-stack-6-dependency-decision-rule',
        },
        {
          kind: 'paragraph',
          text: 'Before adding a frontend dependency:',
        },
        {
          kind: 'ordered-list',
          items: [
            'reuse an installed capability when it satisfies the requirement;',
            'compose or extend an existing Axis pattern when safe;',
            'document why the current stack cannot provide the capability;',
            'review bundle, security, maintenance, accessibility, browser, WebView, and licensing impact;',
            'add focused tests and update this decision when the architectural stack changes.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Axis must not add a dependency that executes backend business processes, stores secrets, downloads executable CMS code, or creates an alternate contract authority.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'technology-stack-7-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Extend the stack through a focused project-owned feature directory, existing React and TypeScript composition, shared theme tokens, a typed backend client, and mirrored tests. Prefer an installed dependency or existing pattern; when a new package is necessary, document its exact supported version, browser and WebView impact, bundle cost, security and licensing review, and upgrade and removal procedure.',
        },
        {
          kind: 'paragraph',
          text: 'Do not fork the application shell, create another state or API authority, download executable CMS code, or hide business rules in components. Verify type safety, lint and formatting, accessibility, narrow and touch layouts, contract rejection, integration behavior, bundle output, and clean removal of the extension.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Verification',
          anchor: 'technology-stack-8-verification',
        },
        {
          kind: 'paragraph',
          text: 'Use:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm ci\nnpm run verify',
        },
        {
          kind: 'paragraph',
          text: 'The verification gate checks formatting, linting, strict TypeScript, unit/component tests, and the production build.',
        },
      ],
      searchText:
        'Frontend Technology Stack Review exact package versions, state ownership, styling, repository shape, renderer organization, dependency governance, and verification. # Frontend Technology Stack\n\n## Selected foundation\n\nNodics Axis uses one cohesive frontend application until demonstrated reuse\nand stable contracts justify extracting packages.\n\n| Concern                  | Selected technology            | Current version | Responsibility                                                                    |\n| ------------------------ | ------------------------------ | --------------- | --------------------------------------------------------------------------------- |\n| Package management       | npm                            | 11.6.2          | Reproducible dependency installation from `package-lock.json`                     |\n| UI runtime               | React / React DOM              | 19.2.8          | Axis-owned browser rendering and interaction                                      |\n| Language                 | TypeScript in strict mode      | 6.0.3           | Compile-time safety across UI and contract consumers                              |\n| Build and local server   | Vite                           | 8.1.5           | Development server and immutable production assets                                |\n| Client routing           | React Router                   | 8.3.0           | Static recovery routes and authorized application navigation                      |\n| Server state             | TanStack Query                 | 5.101.4         | Request lifecycle, caching, cancellation, and invalidation for backend-owned data |\n| Component foundation     | MUI                            | 9.2.0           | Accessible primitives and Nodics-owned tokens and components                      |\n| Styling runtime          | Emotion React / Styled         | 11.14.0/11.14.1 | Material UI styling and theme-aware presentation                                  |\n| Unit and component tests | Vitest / Testing Library React | 4.1.10/16.3.2   | User-observable frontend behavior and contract-consumer tests                     |\n| Browser test environment | jsdom                          | 29.1.1          | Browser DOM behavior in automated tests                                           |\n| Static quality           | ESLint / typescript-eslint     | 9.39.5/8.65.0   | TypeScript and React code-quality rules                                           |\n| Formatting               | Prettier                       | 3.8.1           | Consistent source and documentation formatting                                    |\n\nSupported engines and direct versions are declared in `package.json` and the\ncomplete dependency graph is locked in `package-lock.json`. Those files remain\nthe dependency authority. The table is an operator-friendly snapshot and must\nbe updated in the same change whenever a listed package version changes.\n\n## State ownership\n\n- TanStack Query owns remote server state and request lifecycle.\n- Presentation state stays close to the route or feature that owns it.\n- Backend modules remain authoritative for persisted state, validation,\n  authorization, workflows, and business outcomes.\n- Axis must not create a browser store that becomes a second copy of backend\n  registry, permission, workflow, publication, or tenant authority.\n\nA dedicated global client-state dependency may be considered only when a\nmeasured cross-feature problem cannot be handled safely by React composition,\nroute state, or TanStack Query.\n\n## Styling decision\n\nAxis uses MUI primitives, Emotion, and original Nodics design tokens. Tailwind\nis not part of the selected runtime. Commercial administration templates may\ninform information grouping only; their source code, components, assets,\nlayouts, and branding are not dependencies.\n\nThe design system must preserve keyboard operation, screen-reader support,\nresponsive behavior, reduced motion, mobile WebView compatibility, and\ncomfortable and compact density modes.\n\n## Repository shape\n\nAxis starts as one application repository with cohesive feature boundaries.\nIt is not a mandatory monorepo. A package may be extracted later only when:\n\n1. two or more real consumers need the same stable capability;\n2. its public contract and ownership are explicit;\n3. extraction does not duplicate a Nodics backend authority;\n4. independent versioning and testing provide a demonstrated benefit.\n\nThis avoids package boundaries that add governance and release overhead before\nthe product has stable reuse seams.\n\nProduction code belongs under `src/`. Tests belong under the root `test/`\ndirectory and mirror the production feature boundaries, for example\n`src/cms/` and `test/cms/`. Test-only fixtures belong below the matching test\nfeature and must not be imported by production code. `tsconfig.app.json`\nstrictly checks runtime source, while `tsconfig.test.json` strictly checks the\nseparate test tree.\n\n## CMS renderer organization\n\nCMS sends composition data and logical renderer contracts; Axis owns every\nexecutable renderer. Renderer source follows a strict, navigable hierarchy:\n\n```text\nsrc/cms/renderers/\n├── pages/                  # one page renderer per file\n├── templates/              # one template renderer per file\n├── components/\n│   ├── authentication/     # authentication-specific component renderers\n│   ├── dashboard/          # dashboard-specific component renderers\n│   └── shared/             # genuinely reusable component renderers\n├── registry/               # typed logical-key mappings and contract manifest\n└── shared/                 # renderer-only types, guards, and property readers\n```\n\nDo not add a generic file containing multiple unrelated renderer\nimplementations. A new CMS renderer requires:\n\n1. one focused renderer file in the correct capability directory;\n2. one typed registry mapping from the backend logical key;\n3. one renderer-manifest entry declaring kind and supported contract version;\n4. focused tests in the mirrored `test/cms/renderers` hierarchy; and\n5. safe failure for unknown keys, incompatible versions, or invalid properties.\n\nReusable renderers are grouped by capability rather than copied into every\npage. Page-specific placement is reserved for a renderer contract deliberately\nowned by only that page. Backend data must never contain a TypeScript import,\nReact component name, executable file path, script URL, or HTML implementation.\n\n## Dependency decision rule\n\nBefore adding a frontend dependency:\n\n1. reuse an installed capability when it satisfies the requirement;\n2. compose or extend an existing Axis pattern when safe;\n3. document why the current stack cannot provide the capability;\n4. review bundle, security, maintenance, accessibility, browser, WebView, and\n   licensing impact;\n5. add focused tests and update this decision when the architectural stack\n   changes.\n\nAxis must not add a dependency that executes backend business processes,\nstores secrets, downloads executable CMS code, or creates an alternate\ncontract authority.\n\n## Customize and extend safely\n\nExtend the stack through a focused project-owned feature directory, existing\nReact and TypeScript composition, shared theme tokens, a typed backend client,\nand mirrored tests. Prefer an installed dependency or existing pattern; when a\nnew package is necessary, document its exact supported version, browser and\nWebView impact, bundle cost, security and licensing review, and upgrade and\nremoval procedure.\n\nDo not fork the application shell, create another state or API authority,\ndownload executable CMS code, or hide business rules in components. Verify\ntype safety, lint and formatting, accessibility, narrow and touch layouts,\ncontract rejection, integration behavior, bundle output, and clean removal of\nthe extension.\n\n## Verification\n\nUse:\n\n```bash\nnpm ci\nnpm run verify\n```\n\nThe verification gate checks formatting, linting, strict TypeScript,\nunit/component tests, and the production build.\n',
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/frontend-technology-stack.md',
        evidence: 'docs/frontend-technology-stack.md',
        hash: 'b715a440e2bbd5540c037fac19ba3838852b3a13238c7e1c0c9a192cf9be7ac7',
        version: '0.3.3',
      },
      previous: {
        title: 'Architecture and Repository Boundaries',
        route: '/docs/nodics-axis/architecture',
      },
      next: {
        title: 'Design System and Application Shell',
        route: '/docs/nodics-axis/design-system',
      },
    },
    active: true,
  },
  record4: {
    code: 'axisDocsComponentdesignsystem',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.design-system',
      title: 'Design System and Application Shell',
      route: '/docs/nodics-axis/design-system',
      section: 'build-and-operate-axis',
      sectionTitle: 'Build and Operate Axis',
      category: 'Build and Operate Axis',
      audience: ['designer', 'developer', 'business-user', 'ai-tool'],
      summary:
        'Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules.',
      headings: [
        {
          text: 'Implemented scope',
          anchor: 'design-system-1-implemented-scope',
          level: 2,
        },
        {
          text: 'Authentication layout',
          anchor: 'design-system-2-authentication-layout',
          level: 2,
        },
        {
          text: 'Foundations',
          anchor: 'design-system-3-foundations',
          level: 2,
        },
        {
          text: 'Shell structure',
          anchor: 'design-system-4-shell-structure',
          level: 2,
        },
        {
          text: 'Recovery states',
          anchor: 'design-system-5-recovery-states',
          level: 2,
        },
        {
          text: 'Accessibility and responsive behavior',
          anchor: 'design-system-6-accessibility-and-responsive-behavior',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'design-system-7-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Verification',
          anchor: 'design-system-8-verification',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'heading',
          level: 2,
          text: 'Implemented scope',
          anchor: 'design-system-1-implemented-scope',
        },
        {
          kind: 'paragraph',
          text: 'Axis provides a responsive recovery workspace, CMS-composed employee authentication experience, and authenticated dashboard shell. It contains no backend business logic and does not infer permissions.',
        },
        {
          kind: 'paragraph',
          text: 'The implemented visual foundation uses Nodics Gold for focus and primary actions, Charcoal for structural surfaces and text, and restrained semantic colors for success, information, warning, and error states. Panelix informed functional grouping only; no template source or visual asset was copied.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Authentication layout',
          anchor: 'design-system-2-authentication-layout',
        },
        {
          kind: 'paragraph',
          text: 'The implemented login, recovery, and lock-screen template follows a two-zone enterprise authentication pattern:',
        },
        {
          kind: 'unordered-list',
          items: [
            'desktop and tablet layouts at or above the medium breakpoint use a 60-percent Charcoal showcase panel and a 40-percent calm white form workspace;',
            'the showcase uses the reverse Nodics Axis lockup, Gold emphasis, a short platform narrative, and configurable highlights;',
            'the form workspace limits content to 440 pixels for readable field lengths;',
            'brand, introduction, form, assistance, and legal content remain separate CMS slots;',
            'mobile webviews hide the decorative showcase and retain the complete employee authentication journey in one column.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'The layout pattern was informed by the approved external reference, but colors, logo treatment, typography, spacing, content, accessibility, and React implementation follow the Nodics Axis style guide. No source code, imagery, social-login behavior, registration journey, or branding was copied.',
        },
        {
          kind: 'paragraph',
          text: 'Recovery uses the same composition with a concise reset introduction, one employee identifier field, primary action, and return-to-login assistance. Screen lock uses the in-memory employee identifier, one password field, primary unlock action, and explicit sign-out alternative. Lock content is authenticated CMS composition and is never available from public delivery.',
        },
        {
          kind: 'paragraph',
          text: "Implemented foundation values include Gold `#FEC400`, Charcoal `#25292C`, app background `#F5F6F7`, border `#DDE1E5`, and the guide's semantic colors. Gold remains an action surface with Charcoal text; it is not used as warning status or normal text on white.",
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Foundations',
          anchor: 'design-system-3-foundations',
        },
        {
          kind: 'unordered-list',
          items: [
            'Light and dark color modes.',
            'Comfortable and compact density.',
            'Responsive typography and spacing.',
            'Consistent borders, surfaces, action sizing, and elevation.',
            'Visible keyboard focus.',
            'Reduced-motion behavior through the operating-system preference.',
            'Semantic success, information, warning, and error colors.',
            'Forty-four-pixel icon-button targets for touch and mobile WebViews.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Appearance choices remain in application memory. They are not identity, tenant, or backend configuration and are deliberately not persisted yet.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Shell structure',
          anchor: 'design-system-4-shell-structure',
        },
        {
          kind: 'paragraph',
          text: 'The shared authenticated shell provides:',
        },
        {
          kind: 'ordered-list',
          items: [
            'an expandable desktop navigation rail, compact icon-only desktop rail, and temporary mobile navigation drawer;',
            'synchronized navigation search in the expanded left rail and top bar, an optional backend-advertised Axis Assistant shortcut, quick-create placeholder, My Work, notifications, and employee menu;',
            'an active context bar showing the backend-reported environment, tenant, configured enterprise, CMS Site, and CMS Catalog;',
            'employee lock and logout actions;',
            'comfortable/compact density and light/dark controls;',
            'the main workspace region;',
            'bordered workspace panels;',
            'empty-state, notification, and confirmation-dialog primitives;',
            'loading and offline feedback.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'After authentication, Axis consumes the authorized BackOffice `catalogue`, `availability`, and client-safe module leases. It does not define a second functional menu authority. The local Dashboard entry is combined with module-owned navigation entries. Axis uses an explicitly supplied backend business group first and retains the legacy category mapping only as a safe fallback for older compatible contributions:',
        },
        {
          kind: 'unordered-list',
          items: [
            '`content` and `experience` become Content and Experience;',
            '`commerce` becomes Commerce;',
            '`core` becomes Customers and Organization;',
            '`operations` becomes Process and Automation;',
            '`platform` becomes Operations and Integration; and',
            'unknown categories remain visible under Other Capabilities.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'An owning module may also supply a same-module parent relationship, perspectives, localization key, required context dimensions, feature state, and a non-executable badge-provider reference. Axis validates the hierarchy again and rejects duplicate identifiers, missing parents, or cycles even though BackOffice has already validated the registration. Children are displayed directly after their parent with an accessible hierarchy level. `DISABLED` destinations remain visible but cannot be opened; `PREVIEW` destinations carry a visible preview state; `HIDDEN` destinations are removed by BackOffice before Axis receives them.',
        },
        {
          kind: 'paragraph',
          text: 'The expanded and mobile navigation provides a real **Search menu** field. It matches authorized destinations by business group, user-facing label, or owning module and filters the left panel immediately. The top-bar navigation search uses the same query state. Search never changes permissions, tenant context, or backend feature state, and a successful navigation clears it.',
        },
        {
          kind: 'paragraph',
          text: 'Employees may star a destination. Axis stores only bounded `moduleName:navigationId` values for **Favourites** and **Recent** in browser local storage. It never stores routes, labels, tokens, employee details, tenant data, record data, or backend payloads in navigation preferences. Malformed persisted values are discarded. Favourites and recent destinations remain conveniences over the current authenticated bootstrap; a missing or newly unauthorized contribution disappears automatically.',
        },
        {
          kind: 'paragraph',
          text: 'Incompatible modules are excluded by the bootstrap parser. Unavailable destinations are disabled and degraded destinations remain visible with a warning state. A navigation item with permissions not covered by its already authorized module contribution is rejected rather than displayed.',
        },
        {
          kind: 'paragraph',
          text: 'When the authorized `aiAssistant` contribution contains its `assistant` navigation item, the same backend-provided label, route, icon key, and availability also drive the top-bar shortcut. The shortcut is absent when the employee has no contribution, enabled for `UP` and `DEGRADED`, and disabled for `UNAVAILABLE` or `UNKNOWN`. Axis does not maintain a second Assistant route or label authority.',
        },
        {
          kind: 'paragraph',
          text: 'The desktop menu control switches between the full rail and the compact rail. The compact rail retains every authorized destination as an icon with an accessible name and hover/focus tooltip; it does not hide or re-authorize capabilities. The Nodics Axis wordmark contracts to the Nodics mark and the top bar and content region reclaim the released width. Reduced-motion preferences disable the width transition.',
        },
        {
          kind: 'paragraph',
          text: 'Each module-owned navigation entry may supply a semantic `icon` key. Axis maps that non-executable key to an Axis-owned vector icon. The entry-level key takes precedence over the module-level key, and an unknown key uses the governed generic module icon instead of loading remote or CMS-provided executable assets.',
        },
        {
          kind: 'paragraph',
          text: 'Discovered module routes currently open an explicit placeholder workspace until their dedicated Axis feature is implemented. The placeholder confirms the owning module and availability without inferring operations or calling unapproved APIs.',
        },
        {
          kind: 'paragraph',
          text: 'Before authentication, unavailable context is labelled honestly. Future enterprise, environment, Site, Store, and Catalog selectors must consume governed backend context contracts rather than turn their displayed labels into frontend authority. Future features must compose these primitives rather than create parallel page shells.',
        },
        {
          kind: 'paragraph',
          text: 'Context identifiers are retained exactly for API requests, authorization, query keys, caches, and diagnostics. Axis uses the generic display-name helper only to turn a validated fallback code such as `startioLocal` into readable text such as `Startio Local`. The helper preserves common acronyms including AI, API, CMS, ID, and UI. A localized display name explicitly supplied by the owning backend contract takes precedence over this fallback.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Recovery states',
          anchor: 'design-system-5-recovery-states',
        },
        {
          kind: 'paragraph',
          text: 'The static recovery model distinguishes:',
        },
        {
          kind: 'unordered-list',
          items: [
            'deployment configuration;',
            'Profile identity authority;',
            'BackOffice registry;',
            'CMS delivery;',
            'contract compatibility;',
            'functional module availability;',
            'authorization denial;',
            'offline connectivity;',
            'unexpected presentation failure.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Each recovery state explains the affected boundary, whether retry is safe, and an optional bounded correlation reference. Axis never claims that a retry is safe for an unknown backend mutation.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Accessibility and responsive behavior',
          anchor: 'design-system-6-accessibility-and-responsive-behavior',
        },
        {
          kind: 'unordered-list',
          items: [
            'The main workspace uses the `main` landmark.',
            'Navigation has an accessible name.',
            'Dialogs have programmatic titles and descriptions.',
            'Notifications use MUI live-region behavior.',
            'Controls retain visible labels and keyboard focus.',
            'Navigation changes from permanent to temporary below the medium breakpoint.',
            'Authentication layouts use the exact 60/40 split at and above the medium breakpoint. Below it, the decorative panel is hidden and the form workspace uses the full width.',
            'Layouts stack on narrow screens, avoid hover-only interaction, and do not introduce horizontal page overflow.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'design-system-7-customize-and-extend-safely',
        },
        {
          kind: 'unordered-list',
          items: [
            'Add new design values to the shared token module.',
            'Add reusable layouts and states to the shell primitives.',
            'Keep module-specific presentation inside its feature workspace.',
            'Do not put permissions, workflow execution, service credentials, or authoritative validation into a shell component.',
            "Add functional navigation through the owning module's BackOffice capability contribution. Do not hardcode module routes in Axis.",
            'Keep the single local Dashboard route recovery-safe. Every other displayed functional destination must come from authenticated bootstrap.',
            'Keep the expanded/compact navigation and appearance choices in application memory. Only bounded favourite/recent navigation identifiers use the reviewed preference store; do not add tokens, routes, context, records, or backend responses to it.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Verification',
          anchor: 'design-system-8-verification',
        },
        {
          kind: 'paragraph',
          text: 'Run `npm run verify`. The foundation tests cover recovery variants, retry and correlation presentation, authorized navigation parsing and grouping, navigation landmarks, module placeholder routing, context labels, employee logout, Assistant shortcut capability gating, density and color controls, hierarchy validation, backend-owned groups, perspective metadata, feature states, menu search, bounded favourite/recent preferences, dialogs, notifications, offline behavior, formatting, lint, types, and build. Responsive browser acceptance also covers the 60/40 authentication split at desktop and tablet widths and the single-column mobile journey.',
        },
        {
          kind: 'paragraph',
          text: 'The governed-navigation acceptance was also exercised against the real `startioLocal` `monoServer` bootstrap. The authenticated catalogue returned eleven permission-filtered destinations with module-owned groups, perspectives, context dimensions, and active feature state. Axis rendered the expected business groups, menu search, favourite controls, compact desktop behavior, and the temporary 390-pixel mobile drawer. Adding Content to Favourites stored only `cms:cms`; no route, token, context, or record data was persisted.',
        },
      ],
      searchText:
        "Design System and Application Shell Understand authentication layouts, design foundations, shell structure, responsive states, accessibility, recovery, and extension rules. # Axis Design System and Application Shell\n\n## Implemented scope\n\nAxis provides a responsive recovery workspace, CMS-composed employee\nauthentication experience, and authenticated dashboard shell. It contains no\nbackend business logic and does not infer permissions.\n\nThe implemented visual foundation uses Nodics Gold for focus and primary\nactions, Charcoal for structural surfaces and text, and restrained semantic\ncolors for success, information, warning, and error states. Panelix informed\nfunctional grouping only; no template source or visual asset was copied.\n\n## Authentication layout\n\nThe implemented login, recovery, and lock-screen template follows a two-zone\nenterprise authentication pattern:\n\n- desktop and tablet layouts at or above the medium breakpoint use a\n  60-percent Charcoal showcase panel and a 40-percent calm white form\n  workspace;\n- the showcase uses the reverse Nodics Axis lockup, Gold emphasis, a short\n  platform narrative, and configurable highlights;\n- the form workspace limits content to 440 pixels for readable field lengths;\n- brand, introduction, form, assistance, and legal content remain separate CMS\n  slots;\n- mobile webviews hide the decorative showcase and retain the complete\n  employee authentication journey in one column.\n\nThe layout pattern was informed by the approved external reference, but colors,\nlogo treatment, typography, spacing, content, accessibility, and React\nimplementation follow the Nodics Axis style guide. No source code, imagery,\nsocial-login behavior, registration journey, or branding was copied.\n\nRecovery uses the same composition with a concise reset introduction, one\nemployee identifier field, primary action, and return-to-login assistance.\nScreen lock uses the in-memory employee identifier, one password field,\nprimary unlock action, and explicit sign-out alternative. Lock content is\nauthenticated CMS composition and is never available from public delivery.\n\nImplemented foundation values include Gold `#FEC400`, Charcoal `#25292C`, app\nbackground `#F5F6F7`, border `#DDE1E5`, and the guide's semantic colors. Gold\nremains an action surface with Charcoal text; it is not used as warning status\nor normal text on white.\n\n## Foundations\n\n- Light and dark color modes.\n- Comfortable and compact density.\n- Responsive typography and spacing.\n- Consistent borders, surfaces, action sizing, and elevation.\n- Visible keyboard focus.\n- Reduced-motion behavior through the operating-system preference.\n- Semantic success, information, warning, and error colors.\n- Forty-four-pixel icon-button targets for touch and mobile WebViews.\n\nAppearance choices remain in application memory. They are not identity,\ntenant, or backend configuration and are deliberately not persisted yet.\n\n## Shell structure\n\nThe shared authenticated shell provides:\n\n1. an expandable desktop navigation rail, compact icon-only desktop rail, and\n   temporary mobile navigation drawer;\n2. synchronized navigation search in the expanded left rail and top bar, an\n   optional backend-advertised Axis Assistant shortcut, quick-create\n   placeholder, My Work, notifications, and employee menu;\n3. an active context bar showing the backend-reported environment, tenant,\n   configured enterprise, CMS Site, and CMS Catalog;\n4. employee lock and logout actions;\n5. comfortable/compact density and light/dark controls;\n6. the main workspace region;\n7. bordered workspace panels;\n8. empty-state, notification, and confirmation-dialog primitives;\n9. loading and offline feedback.\n\nAfter authentication, Axis consumes the authorized BackOffice `catalogue`,\n`availability`, and client-safe module leases. It does not define a second\nfunctional menu authority. The local Dashboard entry is combined with\nmodule-owned navigation entries. Axis uses an explicitly supplied backend\nbusiness group first and retains the legacy category mapping only as a safe\nfallback for older compatible contributions:\n\n- `content` and `experience` become Content and Experience;\n- `commerce` becomes Commerce;\n- `core` becomes Customers and Organization;\n- `operations` becomes Process and Automation;\n- `platform` becomes Operations and Integration; and\n- unknown categories remain visible under Other Capabilities.\n\nAn owning module may also supply a same-module parent relationship,\nperspectives, localization key, required context dimensions, feature state,\nand a non-executable badge-provider reference. Axis validates the hierarchy\nagain and rejects duplicate identifiers, missing parents, or cycles even\nthough BackOffice has already validated the registration. Children are\ndisplayed directly after their parent with an accessible hierarchy level.\n`DISABLED` destinations remain visible but cannot be opened; `PREVIEW`\ndestinations carry a visible preview state; `HIDDEN` destinations are removed\nby BackOffice before Axis receives them.\n\nThe expanded and mobile navigation provides a real **Search menu** field. It\nmatches authorized destinations by business group, user-facing label, or\nowning module and filters the left panel immediately. The top-bar navigation\nsearch uses the same query state. Search never changes permissions, tenant\ncontext, or backend feature state, and a successful navigation clears it.\n\nEmployees may star a destination. Axis stores only bounded\n`moduleName:navigationId` values for **Favourites** and **Recent** in browser\nlocal storage. It never stores routes, labels, tokens, employee details,\ntenant data, record data, or backend payloads in navigation preferences.\nMalformed persisted values are discarded. Favourites and recent destinations\nremain conveniences over the current authenticated bootstrap; a missing or\nnewly unauthorized contribution disappears automatically.\n\nIncompatible modules are excluded by the bootstrap parser. Unavailable\ndestinations are disabled and degraded destinations remain visible with a\nwarning state. A navigation item with permissions not covered by its already\nauthorized module contribution is rejected rather than displayed.\n\nWhen the authorized `aiAssistant` contribution contains its `assistant`\nnavigation item, the same backend-provided label, route, icon key, and\navailability also drive the top-bar shortcut. The shortcut is absent when the\nemployee has no contribution, enabled for `UP` and `DEGRADED`, and disabled for\n`UNAVAILABLE` or `UNKNOWN`. Axis does not maintain a second Assistant route or\nlabel authority.\n\nThe desktop menu control switches between the full rail and the compact rail.\nThe compact rail retains every authorized destination as an icon with an\naccessible name and hover/focus tooltip; it does not hide or re-authorize\ncapabilities. The Nodics Axis wordmark contracts to the Nodics mark and the top\nbar and content region reclaim the released width. Reduced-motion preferences\ndisable the width transition.\n\nEach module-owned navigation entry may supply a semantic `icon` key. Axis maps\nthat non-executable key to an Axis-owned vector icon. The entry-level key takes\nprecedence over the module-level key, and an unknown key uses the governed\ngeneric module icon instead of loading remote or CMS-provided executable\nassets.\n\nDiscovered module routes currently open an explicit placeholder workspace until\ntheir dedicated Axis feature is implemented. The placeholder confirms the\nowning module and availability without inferring operations or calling\nunapproved APIs.\n\nBefore authentication, unavailable context is labelled honestly. Future\nenterprise, environment, Site, Store, and Catalog selectors must consume\ngoverned backend context contracts rather than turn their displayed labels into\nfrontend authority. Future features must compose these primitives rather than\ncreate parallel page shells.\n\nContext identifiers are retained exactly for API requests, authorization,\nquery keys, caches, and diagnostics. Axis uses the generic display-name helper\nonly to turn a validated fallback code such as `startioLocal` into readable\ntext such as `Startio Local`. The helper preserves common acronyms including\nAI, API, CMS, ID, and UI. A localized display name explicitly supplied by the\nowning backend contract takes precedence over this fallback.\n\n## Recovery states\n\nThe static recovery model distinguishes:\n\n- deployment configuration;\n- Profile identity authority;\n- BackOffice registry;\n- CMS delivery;\n- contract compatibility;\n- functional module availability;\n- authorization denial;\n- offline connectivity;\n- unexpected presentation failure.\n\nEach recovery state explains the affected boundary, whether retry is safe, and\nan optional bounded correlation reference. Axis never claims that a retry is\nsafe for an unknown backend mutation.\n\n## Accessibility and responsive behavior\n\n- The main workspace uses the `main` landmark.\n- Navigation has an accessible name.\n- Dialogs have programmatic titles and descriptions.\n- Notifications use MUI live-region behavior.\n- Controls retain visible labels and keyboard focus.\n- Navigation changes from permanent to temporary below the medium breakpoint.\n- Authentication layouts use the exact 60/40 split at and above the medium\n  breakpoint. Below it, the decorative panel is hidden and the form workspace\n  uses the full width.\n- Layouts stack on narrow screens, avoid hover-only interaction, and do not\n  introduce horizontal page overflow.\n\n## Customize and extend safely\n\n- Add new design values to the shared token module.\n- Add reusable layouts and states to the shell primitives.\n- Keep module-specific presentation inside its feature workspace.\n- Do not put permissions, workflow execution, service credentials, or\n  authoritative validation into a shell component.\n- Add functional navigation through the owning module's BackOffice capability\n  contribution. Do not hardcode module routes in Axis.\n- Keep the single local Dashboard route recovery-safe. Every other displayed\n  functional destination must come from authenticated bootstrap.\n- Keep the expanded/compact navigation and appearance choices in application\n  memory. Only bounded favourite/recent navigation identifiers use the\n  reviewed preference store; do not add tokens, routes, context, records, or\n  backend responses to it.\n\n## Verification\n\nRun `npm run verify`. The foundation tests cover recovery variants, retry and\ncorrelation presentation, authorized navigation parsing and grouping,\nnavigation landmarks, module placeholder routing, context labels, employee\nlogout, Assistant shortcut capability gating, density and color controls,\nhierarchy validation, backend-owned groups, perspective metadata, feature\nstates, menu search, bounded favourite/recent preferences, dialogs,\nnotifications, offline\nbehavior, formatting, lint, types, and build.\nResponsive browser acceptance also covers the 60/40 authentication split at\ndesktop and tablet widths and the single-column mobile journey.\n\nThe governed-navigation acceptance was also exercised against the real\n`startioLocal` `monoServer` bootstrap. The authenticated catalogue returned\neleven permission-filtered destinations with module-owned groups,\nperspectives, context dimensions, and active feature state. Axis rendered the\nexpected business groups, menu search, favourite controls, compact\ndesktop behavior, and the temporary 390-pixel mobile drawer. Adding Content to\nFavourites stored only `cms:cms`; no route, token, context, or record data was\npersisted.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/design-system-and-shell.md',
        evidence: 'docs/design-system-and-shell.md',
        hash: 'f09663503ea69f70fa934796eed52f36c0e929e68a29415a8125d358bf0f2d46',
        version: '0.3.3',
      },
      previous: {
        title: 'Frontend Technology Stack',
        route: '/docs/nodics-axis/technology-stack',
      },
      next: {
        title: 'CMS Delivery and Renderer Integration',
        route: '/docs/nodics-axis/cms-renderers',
      },
    },
    active: true,
  },
  record5: {
    code: 'axisDocsComponentcmsrenderers',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.cms-renderers',
      title: 'CMS Delivery and Renderer Integration',
      route: '/docs/nodics-axis/cms-renderers',
      section: 'build-and-operate-axis',
      sectionTitle: 'Build and Operate Axis',
      category: 'Build and Operate Axis',
      audience: ['developer', 'architect', 'security-reviewer', 'ai-tool'],
      summary:
        'Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries.',
      headings: [
        {
          text: 'Runtime boundary',
          anchor: 'cms-renderers-1-runtime-boundary',
          level: 2,
        },
        {
          text: 'Delivery validation',
          anchor: 'cms-renderers-2-delivery-validation',
          level: 2,
        },
        {
          text: 'Request and cache safety',
          anchor: 'cms-renderers-3-request-and-cache-safety',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'cms-renderers-4-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Renderer development',
          anchor: 'cms-renderers-5-renderer-development',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Axis renders CMS-managed Back Office pages without moving backend authority or business logic into the browser.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Runtime boundary',
          anchor: 'cms-renderers-1-runtime-boundary',
        },
        {
          kind: 'paragraph',
          text: 'CMS owns routes, pages, templates, components, component properties, and the logical renderer metadata attached to each page or component type. Axis owns the executable React renderers. CMS never returns JavaScript, module paths, or arbitrary renderer URLs.',
        },
        {
          kind: 'paragraph',
          text: 'Axis obtains the CMS endpoint from the approved runtime bootstrap flow. The CMS client accepts that discovered endpoint as an input; it does not invent a fallback URL or proxy CMS through the Axis server.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Delivery validation',
          anchor: 'cms-renderers-2-delivery-validation',
        },
        {
          kind: 'paragraph',
          text: 'Before rendering, Axis validates the complete resolved-page response:',
        },
        {
          kind: 'unordered-list',
          items: [
            'delivery contract version;',
            'site, path, locale, and channel;',
            'page, template, and component renderer keys;',
            'renderer major versions and supported channels;',
            'required component properties;',
            'component graph depth and total component count.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Unknown renderer keys, unsupported versions or channels, malformed data, and oversized graphs fail closed. A component rendering failure is isolated and replaced with a safe error message. Deprecated renderer metadata is retained for migration tooling; it does not allow CMS to select untrusted executable code.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Request and cache safety',
          anchor: 'cms-renderers-3-request-and-cache-safety',
        },
        {
          kind: 'paragraph',
          text: 'The delivery client:',
        },
        {
          kind: 'unordered-list',
          items: [
            'sends bearer tokens only in the `Authorization` header;',
            'never places tokens in URLs, storage, or cache keys;',
            'omits browser credentials and rejects redirects;',
            'supports cancellation, timeouts, `ETag`, and `304 Not Modified`;',
            'separates cache keys by enterprise, tenant, site, path, locale, channel, access mode, principal, and authenticated session generation.',
          ],
        },
        {
          kind: 'paragraph',
          text: "Authenticated cache keys require principal and session identity. This prevents one employee or tenant from reusing another user's resolved page.",
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'cms-renderers-4-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Create one project-owned renderer file in the relevant capability directory, register its backend-issued logical key and supported contract version in the typed renderer manifest, and add mirrored tests. Customize labels, help text, layout options, and safe fragments through CMS component properties; keep API destinations, authorization, validation, and business decisions in their owning backend modules.',
        },
        {
          kind: 'paragraph',
          text: 'Never execute CMS HTML or JavaScript, accept arbitrary component imports, add a fallback renderer for unknown keys, or duplicate CMS route resolution in Axis. Verify valid, unknown, deprecated, incompatible, malformed, oversized, unauthorized, cached-session, responsive, and renderer-isolation behavior. Rollback removes the later project registration and restores the prior CMS component version without editing the reusable renderer framework.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Renderer development',
          anchor: 'cms-renderers-5-renderer-development',
        },
        {
          kind: 'paragraph',
          text: 'Add a renderer only to the trusted Axis renderer manifest and implement it in Axis source. Keep the renderer declarative: component properties may influence content and presentation, but must not introduce API destinations, executable scripts, authorization rules, or backend business decisions.',
        },
        {
          kind: 'paragraph',
          text: 'Run the focused checks while changing this boundary:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run typecheck\nnpm test -- --run test/cms',
        },
        {
          kind: 'paragraph',
          text: 'Run `npm run verify` before handing off or committing the completed slice.',
        },
        {
          kind: 'paragraph',
          text: '`/login` and `/forgot-password` are resolved from public CMS delivery. The login renderer sends employee credentials only to Profile. After Profile issues the human bearer token, Axis validates access through secured BackOffice bootstrap before loading the authenticated CMS dashboard. Tokens remain in memory and are cleared locally before logout revocation is sent to Profile.',
        },
        {
          kind: 'paragraph',
          text: 'The forgot-password page is presentation-ready, but submission remains disabled until Profile owns an approved employee-recovery API. Axis does not simulate recovery or create a second identity workflow.',
        },
      ],
      searchText:
        "CMS Delivery and Renderer Integration Follow the CMS delivery, validation, cache-safety, logical renderer, and frontend implementation boundaries. # CMS Delivery and Renderer Integration\n\nAxis renders CMS-managed Back Office pages without moving backend authority or\nbusiness logic into the browser.\n\n## Runtime boundary\n\nCMS owns routes, pages, templates, components, component properties, and the\nlogical renderer metadata attached to each page or component type. Axis owns\nthe executable React renderers. CMS never returns JavaScript, module paths, or\narbitrary renderer URLs.\n\nAxis obtains the CMS endpoint from the approved runtime bootstrap flow. The CMS\nclient accepts that discovered endpoint as an input; it does not invent a\nfallback URL or proxy CMS through the Axis server.\n\n## Delivery validation\n\nBefore rendering, Axis validates the complete resolved-page response:\n\n- delivery contract version;\n- site, path, locale, and channel;\n- page, template, and component renderer keys;\n- renderer major versions and supported channels;\n- required component properties;\n- component graph depth and total component count.\n\nUnknown renderer keys, unsupported versions or channels, malformed data, and\noversized graphs fail closed. A component rendering failure is isolated and\nreplaced with a safe error message. Deprecated renderer metadata is retained\nfor migration tooling; it does not allow CMS to select untrusted executable\ncode.\n\n## Request and cache safety\n\nThe delivery client:\n\n- sends bearer tokens only in the `Authorization` header;\n- never places tokens in URLs, storage, or cache keys;\n- omits browser credentials and rejects redirects;\n- supports cancellation, timeouts, `ETag`, and `304 Not Modified`;\n- separates cache keys by enterprise, tenant, site, path, locale, channel,\n  access mode, principal, and authenticated session generation.\n\nAuthenticated cache keys require principal and session identity. This prevents\none employee or tenant from reusing another user's resolved page.\n\n## Customize and extend safely\n\nCreate one project-owned renderer file in the relevant capability directory,\nregister its backend-issued logical key and supported contract version in the\ntyped renderer manifest, and add mirrored tests. Customize labels, help text,\nlayout options, and safe fragments through CMS component properties; keep API\ndestinations, authorization, validation, and business decisions in their\nowning backend modules.\n\nNever execute CMS HTML or JavaScript, accept arbitrary component imports, add a\nfallback renderer for unknown keys, or duplicate CMS route resolution in Axis.\nVerify valid, unknown, deprecated, incompatible, malformed, oversized,\nunauthorized, cached-session, responsive, and renderer-isolation behavior.\nRollback removes the later project registration and restores the prior CMS\ncomponent version without editing the reusable renderer framework.\n\n## Renderer development\n\nAdd a renderer only to the trusted Axis renderer manifest and implement it in\nAxis source. Keep the renderer declarative: component properties may influence\ncontent and presentation, but must not introduce API destinations, executable\nscripts, authorization rules, or backend business decisions.\n\nRun the focused checks while changing this boundary:\n\n```bash\nnpm run typecheck\nnpm test -- --run test/cms\n```\n\nRun `npm run verify` before handing off or committing the completed slice.\n\n`/login` and `/forgot-password` are resolved from public CMS delivery. The\nlogin renderer sends employee credentials only to Profile. After Profile issues\nthe human bearer token, Axis validates access through secured BackOffice\nbootstrap before loading the authenticated CMS dashboard. Tokens remain in\nmemory and are cleared locally before logout revocation is sent to Profile.\n\nThe forgot-password page is presentation-ready, but submission remains disabled\nuntil Profile owns an approved employee-recovery API. Axis does not simulate\nrecovery or create a second identity workflow.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/cms-delivery-and-renderers.md',
        evidence: 'docs/cms-delivery-and-renderers.md',
        hash: '906f6077a482e2a7e572b8b6cc44e0077574d72e955f7648d90254e2202e2859',
        version: '0.3.3',
      },
      previous: {
        title: 'Design System and Application Shell',
        route: '/docs/nodics-axis/design-system',
      },
      next: {
        title: 'Documentation Content in Axis',
        route: '/docs/nodics-axis/documentation-content',
      },
    },
    active: true,
  },
  record6: {
    code: 'axisDocsComponentdocumentationcontent',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.documentation-content',
      title: 'Documentation Content in Axis',
      route: '/docs/nodics-axis/documentation-content',
      section: 'build-and-operate-axis',
      sectionTitle: 'Build and Operate Axis',
      category: 'Build and Operate Axis',
      audience: ['administrator', 'developer', 'operator', 'ai-tool'],
      summary:
        'Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification.',
      headings: [
        {
          text: 'Employee Journey',
          anchor: 'documentation-content-1-employee-journey',
          level: 2,
        },
        {
          text: 'Nodics Axis Content Pack',
          anchor: 'documentation-content-2-nodics-axis-content-pack',
          level: 2,
        },
        {
          text: 'Renderer Ownership',
          anchor: 'documentation-content-3-renderer-ownership',
          level: 2,
        },
        {
          text: 'Failure And Recovery',
          anchor: 'documentation-content-4-failure-and-recovery',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'documentation-content-5-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Contributor Verification',
          anchor: 'documentation-content-6-contributor-verification',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Axis renders an authorized, backend-provided list of documentation products under `/docs/*`. BackOffice aggregates the list from active module metadata; Axis does not hardcode product tabs or maintain another registry.',
        },
        {
          kind: 'unordered-list',
          items: [
            '**Framework** renders the canonical `nodicsdocs` content pack through CMS.',
            "**Swaggers** renders the active System-owned OpenAPI contract in an Axis-owned, searchable reference and links to the backend's standalone interactive Swagger UI. API descriptions are not copied into a content catalog.",
            "**Nodics Axis** renders this repository's committed documentation content pack through its own CMS Site and content catalog.",
            'A future customer project contributes its own source from its backend project module and supplies import-ready data from the corresponding project repository.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Each CMS documentation product has a separate Site/catalog pair. CMS resolves the Site to its catalog, so Axis never adds a second catalog-routing authority. Nodics CMS remains runtime content and route authority; nImport remains the only content-pack installation and update authority.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Employee Journey',
          anchor: 'documentation-content-1-employee-journey',
        },
        {
          kind: 'ordered-list',
          items: [
            'Sign in with an authorized employee account.',
            'Open **Documentation > Nodics Documentation**.',
            'Axis renders the ordered source tabs returned by the secured BackOffice bootstrap.',
            'Select a CMS product or **Swaggers**. Axis resolves the configured runtime connection by `connectionModule`; it never stores a second endpoint list.',
            "For a CMS source, Axis asks the registered System module for that source's configured content-pack state.",
            'When the pack is absent, an authorized administrator may select **Import documentation**. Axis never reads a repository or imports records itself.',
            'When the pack is current, Axis requests the selected product path from the CMS endpoint supplied by BackOffice bootstrap.',
            'CMS resolves the Site, locale, channel, route, page, template, component, renderer mappings, and access mode.',
            'Axis validates the renderer contract and displays the declarative article.',
            'Internal documentation links remain inside the authenticated Axis shell.',
          ],
        },
        {
          kind: 'paragraph',
          text: "For **Swaggers**, Axis uses the selected source's registered System connection, OpenAPI path, and Swagger path. Axis fetches and bounds the JSON OpenAPI contract, then renders searchable method, path, summary, description, and tag information as text through its own components. The backend Swagger page is opened as a separate browser page for interactive use; it is never embedded in an iframe because Nodics correctly protects backend pages with `X-Frame-Options: DENY` and `frame-ancestors 'none'`. Both routes remain subject to Nodics API exposure policy. If exposure is disabled or the runtime is unavailable, Axis reports the failure and does not substitute a stale copied contract.",
        },
        {
          kind: 'paragraph',
          text: 'When a newer pack version is available, Axis keeps the installed Wiki readable and offers the backend-authorized **Update documentation** action. Labels and empty-state messages come from the bounded backend status contract. Axis sends only the employee bearer token and enterprise context to the registered System endpoint and never receives local paths, credentials, manifests, source files, or backend diagnostics.',
        },
        {
          kind: 'paragraph',
          text: 'The shared CMS navigation component supplies the searchable article index, category grouping, audience filters, and configurable labels. Each article supplies breadcrumb context, its table of contents, and previous/next references. Axis owns only their responsive and accessible presentation.',
        },
        {
          kind: 'paragraph',
          text: 'The documentation-product switcher is a responsive, horizontally scrollable segmented control. Its ordered products, labels, routes, and selected identity come from BackOffice bootstrap; its spacing, selected state, keyboard roles, focus behavior, and responsive presentation belong to Axis. It must remain visually consistent across installed documentation, import/update states, OpenAPI reference, unavailable connections, and future project products.',
        },
        {
          kind: 'paragraph',
          text: 'Refreshing a documentation URL restores the Profile-owned browser session before resolving the same CMS path. An expired or rejected session returns the employee to the public authentication journey.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Nodics Axis Content Pack',
          anchor: 'documentation-content-2-nodics-axis-content-pack',
        },
        {
          kind: 'paragraph',
          text: 'Axis documentation data is directly importable and committed under `data/core`. Its immutable release manifest is `manifest/docs-content-pack.json`. The manifest pack identity is `nodicsaxis`; the configured nImport pack code is `axisDocumentation`; and its CMS binding is `axisDocumentationSite` → `axisDocumentationContentCatalog`.',
        },
        {
          kind: 'paragraph',
          text: 'The pack explains project purpose, architecture and repository boundaries, supported setup, page/template/component/renderer organization, backend contracts and security, responsive/accessibility behavior, extension, troubleshooting, and verification. Change the pack version whenever committed content hashes change. A same-version checksum change is rejected by default.',
        },
        {
          kind: 'paragraph',
          text: 'Canonical authored pages live under `source/documentation`. The committed records under `data/core` are deterministic generated projections, not an independent documentation authority. Run `npm run docs:generate` after changing an implemented Axis capability, then run `npm run docs:check` and `npm run verify`. The migration register must preserve the disposition, destination, headings, and detail evidence for every README or legacy docs source before those transitional files are reduced or retired.',
        },
        {
          kind: 'paragraph',
          text: '`source/documentation/navigation.json` is the only authored Axis documentation release-version authority. Generation copies that version into CMS records, the migration register, and the immutable release manifest. Contributors must increment it before generating changed content and must not repair generated version projections by hand.',
        },
        {
          kind: 'paragraph',
          text: 'The same generation pass projects every canonical navigation page into matching CMS page, component, and route records. Route lists must never be maintained separately. The generated manifest page and route totals therefore describe the records that are actually importable, and `npm run docs:check` rejects any generated route drift before a release can be accepted.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Renderer Ownership',
          anchor: 'documentation-content-3-renderer-ownership',
        },
        {
          kind: 'unordered-list',
          items: [
            '`DocumentationArticlePageRenderer` owns page-to-slot composition.',
            '`DocumentationArticleTemplateRenderer` owns the responsive article layout.',
            '`DocumentationArticleRenderer` owns safe article-block presentation.',
            '`DocumentationNavigationRenderer` owns bounded search, category grouping, audience filtering, selected-route presentation, and documentation-home navigation.',
            'The typed renderer manifest and registries are the only mapping from CMS logical keys to Axis implementations.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'The renderer accepts bounded headings, paragraphs, ordered and unordered lists, blockquotes, code blocks, tables, and image references. It does not execute HTML, scripts, event handlers, expressions, CMS-provided JavaScript, or arbitrary renderer URLs. Only `/docs`, anchor, HTTP(S), and mail links are eligible for navigation.',
        },
        {
          kind: 'paragraph',
          text: 'Code blocks use a theme-owned high-contrast surface and bounded responsive typography. Do not use undefined palette tokens: an unresolved background with a light foreground can make valid documentation appear blank.',
        },
        {
          kind: 'paragraph',
          text: 'Documentation links and the on-page heading index use the readable secondary text palette with a persistent gold underline. Signature gold remains an accent, focus, and action color; it must not be used as small text on light surfaces where it does not provide sufficient contrast.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Failure And Recovery',
          anchor: 'documentation-content-4-failure-and-recovery',
        },
        {
          kind: 'unordered-list',
          items: [
            'A missing or unavailable CMS route uses the existing CMS recovery screen and retry action.',
            'A disabled content-pack capability shows configuration guidance and no import action.',
            'A missing or checksum-invalid source shows a low-disclosure unavailable state.',
            'An unauthorized employee cannot view or run content-pack operations even if a control is forced in the browser.',
            'A failed update keeps the Wiki route available and presents a retryable, low-disclosure failure. Import diagnostics and data reconciliation remain backend responsibilities.',
            'An immutable-release conflict tells the operator that documentation content changed without a new release version and directs the release owner to increment and regenerate the pack. Axis maps the stable backend error code; it never renders backend stacks, contexts, record data, or arbitrary diagnostic messages.',
            'A missing renderer, unsupported contract version, unsupported channel, or malformed property is rejected by the CMS render boundary.',
            'A disabled or unavailable BackOffice documentation contribution displays the standard module workspace state.',
            'Unsupported content blocks are not rendered.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Binary image delivery is not yet owned by the CMS delivery contract. Image metadata is migrated and validated by `nodicsdocs`, while Axis presents a non-executable placeholder until a governed CMS/DAM binary-delivery contract is implemented. Do not add repository file paths or ad-hoc static-file loaders to bypass that boundary.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'documentation-content-5-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: "Author or extend project documentation in that project's canonical structured source and generate its committed `data/core` content pack with `manifest/docs-content-pack.json`. Register the pack through the Nodics-owned documentation contribution contract; Axis discovers and renders the resulting navigation and article blocks.",
        },
        {
          kind: 'paragraph',
          text: "Do not hand-edit generated CMS records, add repository file readers to Axis, create a browser import engine, or duplicate a project's documentation inside the framework pack. Test deterministic generation, stale-pack rejection, permissions, checksum and version boundaries, unsafe links and blocks, missing media, import/update recovery, navigation, responsive rendering, and rollback to a previously accepted immutable release.",
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Contributor Verification',
          anchor: 'documentation-content-6-contributor-verification',
        },
        {
          kind: 'paragraph',
          text: 'Run:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run verify',
        },
        {
          kind: 'paragraph',
          text: 'The suite covers registry parity, declarative article rendering, unsafe-link rejection, executable-block rejection, TypeScript, accessibility-oriented markup, linting, formatting, and production build behavior.',
        },
      ],
      searchText:
        "Documentation Content in Axis Understand dynamic documentation products, content-pack installation, renderer ownership, failure recovery, and contributor verification. # Documentation Content In Axis\n\nAxis renders an authorized, backend-provided list of documentation products\nunder `/docs/*`. BackOffice aggregates the list from active module metadata;\nAxis does not hardcode product tabs or maintain another registry.\n\n- **Framework** renders the canonical `nodicsdocs` content pack through CMS.\n- **Swaggers** renders the active System-owned OpenAPI contract in an\n  Axis-owned, searchable reference and links to the backend's standalone\n  interactive Swagger UI. API descriptions are not copied into a content\n  catalog.\n- **Nodics Axis** renders this repository's committed documentation content\n  pack through its own CMS Site and content catalog.\n- A future customer project contributes its own source from its backend project\n  module and supplies import-ready data from the corresponding project\n  repository.\n\nEach CMS documentation product has a separate Site/catalog pair. CMS resolves\nthe Site to its catalog, so Axis never adds a second catalog-routing authority.\nNodics CMS remains runtime content and route authority; nImport remains the\nonly content-pack installation and update authority.\n\n## Employee Journey\n\n1. Sign in with an authorized employee account.\n2. Open **Documentation > Nodics Documentation**.\n3. Axis renders the ordered source tabs returned by the secured BackOffice\n   bootstrap.\n4. Select a CMS product or **Swaggers**. Axis resolves the configured runtime\n   connection by `connectionModule`; it never stores a second endpoint list.\n5. For a CMS source, Axis asks the registered System module for that source's\n   configured content-pack state.\n6. When the pack is absent, an authorized administrator may select **Import\n   documentation**. Axis never reads a repository or imports records itself.\n7. When the pack is current, Axis requests the selected product path from the CMS endpoint supplied by\n   BackOffice bootstrap.\n8. CMS resolves the Site, locale, channel, route, page, template, component,\n   renderer mappings, and access mode.\n9. Axis validates the renderer contract and displays the declarative article.\n10. Internal documentation links remain inside the authenticated Axis shell.\n\nFor **Swaggers**, Axis uses the selected source's registered System connection,\nOpenAPI path, and Swagger path. Axis fetches and bounds the JSON OpenAPI\ncontract, then renders searchable method, path, summary, description, and tag\ninformation as text through its own components. The backend Swagger page is\nopened as a separate browser page for interactive use; it is never embedded in\nan iframe because Nodics correctly protects backend pages with\n`X-Frame-Options: DENY` and `frame-ancestors 'none'`. Both routes remain subject\nto Nodics API exposure policy. If exposure is disabled or the runtime is\nunavailable, Axis reports the failure and does not substitute a stale copied\ncontract.\n\nWhen a newer pack version is available, Axis keeps the installed Wiki readable\nand offers the backend-authorized **Update documentation** action. Labels and\nempty-state messages come from the bounded backend status contract. Axis sends\nonly the employee bearer token and enterprise context to the registered System\nendpoint and never receives local paths, credentials, manifests, source files,\nor backend diagnostics.\n\nThe shared CMS navigation component supplies the searchable article index,\ncategory grouping, audience filters, and configurable labels. Each article\nsupplies breadcrumb context, its table of contents, and previous/next\nreferences. Axis owns only their responsive and accessible presentation.\n\nThe documentation-product switcher is a responsive, horizontally scrollable\nsegmented control. Its ordered products, labels, routes, and selected identity\ncome from BackOffice bootstrap; its spacing, selected state, keyboard roles,\nfocus behavior, and responsive presentation belong to Axis. It must remain\nvisually consistent across installed documentation, import/update states,\nOpenAPI reference, unavailable connections, and future project products.\n\nRefreshing a documentation URL restores the Profile-owned browser session\nbefore resolving the same CMS path. An expired or rejected session returns the\nemployee to the public authentication journey.\n\n## Nodics Axis Content Pack\n\nAxis documentation data is directly importable and committed under\n`data/core`. Its immutable release manifest is\n`manifest/docs-content-pack.json`. The manifest pack identity is `nodicsaxis`;\nthe configured nImport pack code is `axisDocumentation`; and its CMS binding is\n`axisDocumentationSite` → `axisDocumentationContentCatalog`.\n\nThe pack explains project purpose, architecture and repository boundaries,\nsupported setup, page/template/component/renderer organization, backend\ncontracts and security, responsive/accessibility behavior, extension,\ntroubleshooting, and verification. Change the pack version whenever committed\ncontent hashes change. A same-version checksum change is rejected by default.\n\nCanonical authored pages live under `source/documentation`. The committed\nrecords under `data/core` are deterministic generated projections, not an\nindependent documentation authority. Run `npm run docs:generate` after changing\nan implemented Axis capability, then run `npm run docs:check` and\n`npm run verify`. The migration register must preserve the disposition,\ndestination, headings, and detail evidence for every README or legacy docs\nsource before those transitional files are reduced or retired.\n\n`source/documentation/navigation.json` is the only authored Axis documentation\nrelease-version authority. Generation copies that version into CMS records,\nthe migration register, and the immutable release manifest. Contributors must\nincrement it before generating changed content and must not repair generated\nversion projections by hand.\n\nThe same generation pass projects every canonical navigation page into matching\nCMS page, component, and route records. Route lists must never be maintained\nseparately. The generated manifest page and route totals therefore describe the\nrecords that are actually importable, and `npm run docs:check` rejects any\ngenerated route drift before a release can be accepted.\n\n## Renderer Ownership\n\n- `DocumentationArticlePageRenderer` owns page-to-slot composition.\n- `DocumentationArticleTemplateRenderer` owns the responsive article layout.\n- `DocumentationArticleRenderer` owns safe article-block presentation.\n- `DocumentationNavigationRenderer` owns bounded search, category grouping,\n  audience filtering, selected-route presentation, and documentation-home\n  navigation.\n- The typed renderer manifest and registries are the only mapping from CMS\n  logical keys to Axis implementations.\n\nThe renderer accepts bounded headings, paragraphs, ordered and unordered\nlists, blockquotes, code blocks, tables, and image references. It does not\nexecute HTML, scripts, event handlers, expressions, CMS-provided JavaScript, or\narbitrary renderer URLs. Only `/docs`, anchor, HTTP(S), and mail links are\neligible for navigation.\n\nCode blocks use a theme-owned high-contrast surface and bounded responsive\ntypography. Do not use undefined palette tokens: an unresolved background with\na light foreground can make valid documentation appear blank.\n\nDocumentation links and the on-page heading index use the readable secondary\ntext palette with a persistent gold underline. Signature gold remains an\naccent, focus, and action color; it must not be used as small text on light\nsurfaces where it does not provide sufficient contrast.\n\n## Failure And Recovery\n\n- A missing or unavailable CMS route uses the existing CMS recovery screen and\n  retry action.\n- A disabled content-pack capability shows configuration guidance and no\n  import action.\n- A missing or checksum-invalid source shows a low-disclosure unavailable\n  state.\n- An unauthorized employee cannot view or run content-pack operations even if\n  a control is forced in the browser.\n- A failed update keeps the Wiki route available and presents a retryable,\n  low-disclosure failure. Import diagnostics and data reconciliation remain\n  backend responsibilities.\n- An immutable-release conflict tells the operator that documentation content\n  changed without a new release version and directs the release owner to\n  increment and regenerate the pack. Axis maps the stable backend error code;\n  it never renders backend stacks, contexts, record data, or arbitrary\n  diagnostic messages.\n- A missing renderer, unsupported contract version, unsupported channel, or\n  malformed property is rejected by the CMS render boundary.\n- A disabled or unavailable BackOffice documentation contribution displays the\n  standard module workspace state.\n- Unsupported content blocks are not rendered.\n\nBinary image delivery is not yet owned by the CMS delivery contract. Image\nmetadata is migrated and validated by `nodicsdocs`, while Axis presents a\nnon-executable placeholder until a governed CMS/DAM binary-delivery contract\nis implemented. Do not add repository file paths or ad-hoc static-file loaders\nto bypass that boundary.\n\n## Customize and extend safely\n\nAuthor or extend project documentation in that project's canonical structured\nsource and generate its committed `data/core` content pack with\n`manifest/docs-content-pack.json`. Register the pack through the Nodics-owned\ndocumentation contribution contract; Axis discovers and renders the resulting\nnavigation and article blocks.\n\nDo not hand-edit generated CMS records, add repository file readers to Axis,\ncreate a browser import engine, or duplicate a project's documentation inside\nthe framework pack. Test deterministic generation, stale-pack rejection,\npermissions, checksum and version boundaries, unsafe links and blocks, missing\nmedia, import/update recovery, navigation, responsive rendering, and rollback\nto a previously accepted immutable release.\n\n## Contributor Verification\n\nRun:\n\n```bash\nnpm run verify\n```\n\nThe suite covers registry parity, declarative article rendering, unsafe-link\nrejection, executable-block rejection, TypeScript, accessibility-oriented\nmarkup, linting, formatting, and production build behavior.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/documentation-content.md',
        evidence: 'docs/documentation-content.md',
        hash: 'b97ec0c316296af831dbf994711073cb89e87a2ae6df853968f3de480789204b',
        version: '0.3.3',
      },
      previous: {
        title: 'CMS Delivery and Renderer Integration',
        route: '/docs/nodics-axis/cms-renderers',
      },
      next: {
        title: 'Employee Login, Recovery, Lock, and Dashboard',
        route: '/docs/nodics-axis/employee-access',
      },
    },
    active: true,
  },
  record7: {
    code: 'axisDocsComponentemployeeaccess',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.employee-access',
      title: 'Employee Login, Recovery, Lock, and Dashboard',
      route: '/docs/nodics-axis/employee-access',
      section: 'axis-capabilities',
      sectionTitle: 'Axis Capabilities',
      category: 'Axis Capabilities',
      audience: ['business-user', 'administrator', 'developer', 'security-reviewer'],
      summary:
        'Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures.',
      headings: [
        {
          text: 'Startup journey',
          anchor: 'employee-access-1-startup-journey',
          level: 2,
        },
        {
          text: 'Password recovery',
          anchor: 'employee-access-2-password-recovery',
          level: 2,
        },
        {
          text: 'Idle screen lock',
          anchor: 'employee-access-3-idle-screen-lock',
          level: 2,
        },
        {
          text: 'Logout',
          anchor: 'employee-access-4-logout',
          level: 2,
        },
        {
          text: 'Configuration',
          anchor: 'employee-access-5-configuration',
          level: 2,
        },
        {
          text: 'Failure behavior',
          anchor: 'employee-access-6-failure-behavior',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'employee-access-7-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Verification',
          anchor: 'employee-access-8-verification',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Axis is an employee Back Office application. Customer credentials must not be submitted to its login flow.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Startup journey',
          anchor: 'employee-access-1-startup-journey',
        },
        {
          kind: 'ordered-list',
          items: [
            'Axis reads public deployment configuration from `/axis-config.json`.',
            'Axis calls the BackOffice public bootstrap.',
            'BackOffice returns only active Profile/CMS endpoints and Axis CMS composition identifiers.',
            'Axis loads `/login` directly from CMS public delivery.',
            'Axis sends entered employee credentials directly to Profile.',
            'Axis keeps the returned access token in memory only. Profile stores the refresh credential in a scoped `HttpOnly` cookie that Axis cannot read.',
            'Axis calls secured BackOffice bootstrap with the access token.',
            'BackOffice returns the effective tenant-scoped Axis employee policy, authorized module catalogue, navigation contributions, compatibility, availability, and client-safe environment observations.',
            'Axis constructs its shell from the local Dashboard route plus authorized module-owned navigation.',
            'If authorized, Axis loads `/dashboard` from authenticated CMS delivery.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'A customer login is never used as a fallback. Authentication or authorization failure keeps the employee outside the dashboard and displays a safe message.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Password recovery',
          anchor: 'employee-access-2-password-recovery',
        },
        {
          kind: 'paragraph',
          text: 'The public `/forgot-password` page uses the same responsive authentication layout as login, with CMS-owned introduction, identifier label, placeholder, action label, assistance, and legal text. Axis intentionally keeps submission unavailable today because Profile does not yet expose an approved employee self-recovery API.',
        },
        {
          kind: 'paragraph',
          text: 'Do not simulate success, send identifiers to BackOffice or CMS, or build a frontend-only reset path. The future Profile contract must be anti-enumeration, rate-limited, tenant-aware, auditable, and compatible with the existing OTP and notification authorities before this form is connected.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Idle screen lock',
          anchor: 'employee-access-3-idle-screen-lock',
        },
        {
          kind: 'paragraph',
          text: 'The secured bootstrap returns `axisPolicy` after employee authentication. Version 1 supports `screenLockEnabled`, `idleTimeoutSeconds` from 60 through 86,400, the policy contract version and optimistic revision, and whether the effective policy came from layered defaults or persistence.',
        },
        {
          kind: 'paragraph',
          text: 'Axis observes keyboard, pointer, touch, and wheel activity. Pointer movement is throttled to one deadline update per second to avoid high-frequency work. Background-tab timer throttling is handled by comparing the absolute deadline when the page becomes visible again.',
        },
        {
          kind: 'paragraph',
          text: 'When the deadline passes, Axis:',
        },
        {
          kind: 'ordered-list',
          items: [
            'records a bounded lock marker and same-application return path in `sessionStorage`;',
            'replaces it with `/lock-screen`;',
            'keeps tokens and the employee identifier in memory only;',
            'hides protected application content;',
            'asks only for the current employee password; and',
            'sends that password directly to Profile.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'A successful unlock receives fresh Profile tokens, reloads secured BackOffice bootstrap and policy, removes the lock marker, and returns to the prior protected route. A failed unlock stays locked and shows a safe authentication error. “Not you? Sign out” clears the marker and local session, asks Profile to revoke it, and returns to `/login`.',
        },
        {
          kind: 'paragraph',
          text: 'The marker contains only `locked: true` and a validated relative return path. It never contains a password, access token, refresh token, employee identifier, backend response, or authorization data. External, malformed, authentication, and lock-screen return paths fall back to `/dashboard`.',
        },
        {
          kind: 'paragraph',
          text: 'The screen lock is presentation defense-in-depth. It never replaces bearer expiry, revocation, Profile authentication, or target-module authorization.',
        },
        {
          kind: 'paragraph',
          text: 'On browser refresh, Axis reads only the non-secret CSRF cookie and calls the Profile browser restore endpoint with credentials included. Profile requires the exact allowed Origin and matching `X-CSRF-Token`, consumes the refresh credential once, rotates it, and returns a replacement access token and employee identifier. Axis then reloads the secured BackOffice bootstrap and restores the lock gate before protected routing. A session that was locked before refresh remains on `/lock-screen` until successful password re-verification; refresh cannot silently return it to the dashboard. An expired, revoked, replayed, or otherwise invalid session returns to the public login experience.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Logout',
          anchor: 'employee-access-4-logout',
        },
        {
          kind: 'paragraph',
          text: 'Axis sends the configured CSRF value to Profile, which revokes refresh state and expires both browser-session cookies. Only after Profile confirms that operation does Axis clear its in-memory access token and redirect to `/login`. If Profile is unavailable, Axis keeps the secured session visible and reports that logout was not completed; it never presents a false signed-out state while an HttpOnly refresh session remains active. The existing short-lived access token remains bounded by backend expiry and revocation policy.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Configuration',
          anchor: 'employee-access-5-configuration',
        },
        {
          kind: 'paragraph',
          text: 'The root `.env` contains only public deployment values:',
        },
        {
          kind: 'code',
          language: 'dotenv',
          text: 'AXIS_BACKOFFICE_BASE_URL=http://localhost:3000\nAXIS_ENTERPRISE_CODE=default\nAXIS_CLIENT_CONTRACT_VERSION=1\nAXIS_REQUEST_TIMEOUT_MS=10000\nAXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf',
        },
        {
          kind: 'paragraph',
          text: "The CSRF cookie name is public protocol configuration and must equal Profile's effective `profileBrowserSession.csrfCookieName`. Do not add Profile or CMS URLs. BackOffice discovers them from module self-registration. Never place passwords or tokens in `.env`, browser storage, URLs, logs, or query-cache keys.",
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Failure behavior',
          anchor: 'employee-access-6-failure-behavior',
        },
        {
          kind: 'unordered-list',
          items: [
            'Invalid configuration uses static configuration recovery.',
            'BackOffice discovery failure uses static discovery recovery with retry.',
            'Missing Profile or CMS registration fails public bootstrap closed.',
            'CMS failure or incompatibility uses static CMS recovery with retry.',
            'Invalid employee credentials produce a safe login error.',
            'Missing BackOffice permission rejects the session before dashboard delivery.',
            'Direct `/dashboard` navigation attempts Profile-owned session restoration; absent or invalid refresh state redirects to `/login`.',
            'Direct `/lock-screen` navigation without an authenticated locked session redirects safely.',
            'Refreshing a locked session restores the lock marker and requires password verification before any protected route is rendered.',
            'Invalid or incompatible Axis policy rejects authenticated bootstrap.',
            'Persistent-policy read failure is handled by BackOffice using its safe configured default.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Employee password recovery is not yet a Profile capability. The CMS page may explain the process, but Axis keeps submission disabled until Profile provides a governed, enumeration-safe recovery contract.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'employee-access-7-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: "Customize login, recovery, and lock-screen presentation through CMS component properties and project-owned renderer composition. Add a new authentication view only as a focused renderer with a typed logical-key registration while continuing to use Profile's browser-session, CSRF, refresh, revocation, and employee-only contracts.",
        },
        {
          kind: 'paragraph',
          text: 'Do not replace Profile authentication, store tokens in browser storage, embed credentials in configuration, infer authorization from the UI, or implement password recovery locally. Test valid and invalid credentials, customer-user rejection, missing permissions, refresh restoration, locked-page refresh, CSRF rejection, idle boundaries, logout revocation, malformed CMS properties, responsive layout, and rollback of the project renderer registration.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Verification',
          anchor: 'employee-access-8-verification',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run verify',
        },
        {
          kind: 'paragraph',
          text: 'Tests cover low-disclosure discovery, policy validation, credential delivery to Profile, HttpOnly refresh restoration, CSRF transport, secured bootstrap bearer use, protected-route preservation after remount, invalid-session fallback, CMS authentication pages, inactivity boundaries, activity deadline reset, protected routing, and logout revocation.',
        },
      ],
      searchText:
        "Employee Login, Recovery, Lock, and Dashboard Operate the employee-only authentication journey, recovery, persistent browser session, idle lock, logout, configuration, and safe failures. # Employee Login, Recovery, Screen Lock, and Dashboard\n\nAxis is an employee Back Office application. Customer credentials must not be\nsubmitted to its login flow.\n\n## Startup journey\n\n1. Axis reads public deployment configuration from `/axis-config.json`.\n2. Axis calls the BackOffice public bootstrap.\n3. BackOffice returns only active Profile/CMS endpoints and Axis CMS\n   composition identifiers.\n4. Axis loads `/login` directly from CMS public delivery.\n5. Axis sends entered employee credentials directly to Profile.\n6. Axis keeps the returned access token in memory only. Profile stores the\n   refresh credential in a scoped `HttpOnly` cookie that Axis cannot read.\n7. Axis calls secured BackOffice bootstrap with the access token.\n8. BackOffice returns the effective tenant-scoped Axis employee policy,\n   authorized module catalogue, navigation contributions, compatibility,\n   availability, and client-safe environment observations.\n9. Axis constructs its shell from the local Dashboard route plus authorized\n   module-owned navigation.\n10. If authorized, Axis loads `/dashboard` from authenticated CMS delivery.\n\nA customer login is never used as a fallback. Authentication or authorization\nfailure keeps the employee outside the dashboard and displays a safe message.\n\n## Password recovery\n\nThe public `/forgot-password` page uses the same responsive authentication\nlayout as login, with CMS-owned introduction, identifier label, placeholder,\naction label, assistance, and legal text. Axis intentionally keeps submission\nunavailable today because Profile does not yet expose an approved employee\nself-recovery API.\n\nDo not simulate success, send identifiers to BackOffice or CMS, or build a\nfrontend-only reset path. The future Profile contract must be anti-enumeration,\nrate-limited, tenant-aware, auditable, and compatible with the existing OTP and\nnotification authorities before this form is connected.\n\n## Idle screen lock\n\nThe secured bootstrap returns `axisPolicy` after employee authentication.\nVersion 1 supports `screenLockEnabled`, `idleTimeoutSeconds` from 60 through\n86,400, the policy contract version and optimistic revision, and whether the\neffective policy came from layered defaults or persistence.\n\nAxis observes keyboard, pointer, touch, and wheel activity. Pointer movement is\nthrottled to one deadline update per second to avoid high-frequency work.\nBackground-tab timer throttling is handled by comparing the absolute deadline\nwhen the page becomes visible again.\n\nWhen the deadline passes, Axis:\n\n1. records a bounded lock marker and same-application return path in\n   `sessionStorage`;\n2. replaces it with `/lock-screen`;\n3. keeps tokens and the employee identifier in memory only;\n4. hides protected application content;\n5. asks only for the current employee password; and\n6. sends that password directly to Profile.\n\nA successful unlock receives fresh Profile tokens, reloads secured BackOffice\nbootstrap and policy, removes the lock marker, and returns to the prior\nprotected route. A failed unlock stays locked and shows a safe authentication\nerror. “Not you? Sign out” clears the marker and local session, asks Profile to\nrevoke it, and returns to `/login`.\n\nThe marker contains only `locked: true` and a validated relative return path.\nIt never contains a password, access token, refresh token, employee identifier,\nbackend response, or authorization data. External, malformed, authentication,\nand lock-screen return paths fall back to `/dashboard`.\n\nThe screen lock is presentation defense-in-depth. It never replaces bearer\nexpiry, revocation, Profile authentication, or target-module authorization.\n\nOn browser refresh, Axis reads only the non-secret CSRF cookie and calls the\nProfile browser restore endpoint with credentials included. Profile requires\nthe exact allowed Origin and matching `X-CSRF-Token`, consumes the refresh\ncredential once, rotates it, and returns a replacement access token and\nemployee identifier. Axis then reloads the secured BackOffice bootstrap and\nrestores the lock gate before protected routing. A session that was locked\nbefore refresh remains on `/lock-screen` until successful password\nre-verification; refresh cannot silently return it to the dashboard. An\nexpired, revoked, replayed, or otherwise invalid session returns to the public\nlogin experience.\n\n## Logout\n\nAxis sends the configured CSRF value to Profile, which revokes refresh state\nand expires both browser-session cookies. Only after Profile confirms that\noperation does Axis clear its in-memory access token and redirect to `/login`.\nIf Profile is unavailable, Axis keeps the secured session visible and reports\nthat logout was not completed; it never presents a false signed-out state while\nan HttpOnly refresh session remains active. The existing short-lived access\ntoken remains bounded by backend expiry and revocation policy.\n\n## Configuration\n\nThe root `.env` contains only public deployment values:\n\n```dotenv\nAXIS_BACKOFFICE_BASE_URL=http://localhost:3000\nAXIS_ENTERPRISE_CODE=default\nAXIS_CLIENT_CONTRACT_VERSION=1\nAXIS_REQUEST_TIMEOUT_MS=10000\nAXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf\n```\n\nThe CSRF cookie name is public protocol configuration and must equal Profile's\neffective `profileBrowserSession.csrfCookieName`. Do not add Profile or CMS\nURLs. BackOffice discovers them from module self-registration. Never place\npasswords or tokens in `.env`, browser storage, URLs, logs, or query-cache keys.\n\n## Failure behavior\n\n- Invalid configuration uses static configuration recovery.\n- BackOffice discovery failure uses static discovery recovery with retry.\n- Missing Profile or CMS registration fails public bootstrap closed.\n- CMS failure or incompatibility uses static CMS recovery with retry.\n- Invalid employee credentials produce a safe login error.\n- Missing BackOffice permission rejects the session before dashboard delivery.\n- Direct `/dashboard` navigation attempts Profile-owned session restoration;\n  absent or invalid refresh state redirects to `/login`.\n- Direct `/lock-screen` navigation without an authenticated locked session\n  redirects safely.\n- Refreshing a locked session restores the lock marker and requires password\n  verification before any protected route is rendered.\n- Invalid or incompatible Axis policy rejects authenticated bootstrap.\n- Persistent-policy read failure is handled by BackOffice using its safe\n  configured default.\n\nEmployee password recovery is not yet a Profile capability. The CMS page may\nexplain the process, but Axis keeps submission disabled until Profile provides\na governed, enumeration-safe recovery contract.\n\n## Customize and extend safely\n\nCustomize login, recovery, and lock-screen presentation through CMS component\nproperties and project-owned renderer composition. Add a new authentication\nview only as a focused renderer with a typed logical-key registration while\ncontinuing to use Profile's browser-session, CSRF, refresh, revocation, and\nemployee-only contracts.\n\nDo not replace Profile authentication, store tokens in browser storage, embed\ncredentials in configuration, infer authorization from the UI, or implement\npassword recovery locally. Test valid and invalid credentials, customer-user\nrejection, missing permissions, refresh restoration, locked-page refresh,\nCSRF rejection, idle boundaries, logout revocation, malformed CMS properties,\nresponsive layout, and rollback of the project renderer registration.\n\n## Verification\n\n```bash\nnpm run verify\n```\n\nTests cover low-disclosure discovery, policy validation, credential delivery\nto Profile, HttpOnly refresh restoration, CSRF transport, secured bootstrap\nbearer use, protected-route preservation after remount, invalid-session\nfallback, CMS authentication pages, inactivity boundaries, activity deadline\nreset, protected routing, and logout revocation.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/employee-login.md',
        evidence: 'docs/employee-login.md',
        hash: 'd57cdeb689eb8f0bfe0b3c768888fabdbbf687e80139375c3e355416c7fc0aa4',
        version: '0.3.3',
      },
      previous: {
        title: 'Documentation Content in Axis',
        route: '/docs/nodics-axis/documentation-content',
      },
      next: {
        title: 'Axis Assistant Frontend',
        route: '/docs/nodics-axis/assistant',
      },
    },
    active: true,
  },
  record8: {
    code: 'axisDocsComponentassistant',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.assistant',
      title: 'Axis Assistant Frontend',
      route: '/docs/nodics-axis/assistant',
      section: 'axis-capabilities',
      sectionTitle: 'Axis Capabilities',
      category: 'Axis Capabilities',
      audience: ['business-user', 'developer', 'architect', 'security-reviewer'],
      summary:
        'Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior.',
      headings: [
        {
          text: 'Implemented scope',
          anchor: 'assistant-1-implemented-scope',
          level: 2,
        },
        {
          text: 'Authority and request flow',
          anchor: 'assistant-2-authority-and-request-flow',
          level: 2,
        },
        {
          text: 'Source map',
          anchor: 'assistant-3-source-map',
          level: 2,
        },
        {
          text: 'CMS customization',
          anchor: 'assistant-4-cms-customization',
          level: 2,
        },
        {
          text: 'Typed API coverage',
          anchor: 'assistant-5-typed-api-coverage',
          level: 2,
        },
        {
          text: 'Presentation lifecycle',
          anchor: 'assistant-6-presentation-lifecycle',
          level: 2,
        },
        {
          text: 'Accessibility and responsive behavior',
          anchor: 'assistant-7-accessibility-and-responsive-behavior',
          level: 2,
        },
        {
          text: 'Failure and security behavior',
          anchor: 'assistant-8-failure-and-security-behavior',
          level: 2,
        },
        {
          text: 'Verification',
          anchor: 'assistant-9-verification',
          level: 2,
        },
        {
          text: 'Structured interactions',
          anchor: 'assistant-10-structured-interactions',
          level: 2,
        },
        {
          text: 'Evidence and operational transparency',
          anchor: 'assistant-11-evidence-and-operational-transparency',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'assistant-12-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Known next boundary',
          anchor: 'assistant-13-known-next-boundary',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'heading',
          level: 2,
          text: 'Implemented scope',
          anchor: 'assistant-1-implemented-scope',
        },
        {
          kind: 'paragraph',
          text: 'Axis implements the authenticated `/assistant` CMS route, dedicated Assistant page/template/component renderer hierarchy, BackOffice-driven top navigation shortcut, validated direct-module connection projection, and a typed provider-neutral Assistant HTTP client.',
        },
        {
          kind: 'paragraph',
          text: 'The workspace presents backend-owned CMS content, an interactive composer, employee and Assistant message surfaces, smooth streamed text, progress feedback, cancellation, and safe failure presentation. The authenticated SSE transport and presentation state controller drive the visible experience. No browser request is sent to OpenAI, Anthropic, Gemini, or another provider.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Authority and request flow',
          anchor: 'assistant-2-authority-and-request-flow',
        },
        {
          kind: 'ordered-list',
          items: [
            'BackOffice authenticated bootstrap advertises the authorized `aiAssistant` capability, navigation entry, availability, and client-callable module leases.',
            'Axis validates those values and selects only an `UP` or `DEGRADED` connection. Credentials, query strings, fragments, and non-HTTP endpoints are rejected.',
            'CMS authenticated delivery resolves `/assistant` for the configured Site, locale, and channel.',
            'The CMS logical renderer keys map to allowlisted Axis-owned React implementations.',
            'The typed Assistant client sends the employee bearer directly to the discovered `aiAssistant` module endpoint.',
            'Nodics owns authorization, validation, persistence, provider selection, token governance, tools, Workflow handoff, and audit.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Axis does not proxy Assistant calls through BackOffice and does not select or call an AI provider.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Source map',
          anchor: 'assistant-3-source-map',
        },
        {
          kind: 'unordered-list',
          items: [
            '`src/bootstrap/publicBootstrap.ts`: authorized navigation and module connection validation.',
            '`src/cms/renderers/pages/AssistantPageRenderer.tsx`: Assistant page slot composition.',
            '`src/cms/renderers/templates/AssistantWorkspaceTemplateRenderer.tsx`: responsive workspace structure.',
            '`src/cms/renderers/components/assistant/AssistantWorkspaceRenderer.tsx`: CMS-driven workspace composition.',
            '`src/cms/renderers/components/assistant/AssistantMessageTimeline.tsx`: stable, auto-following activity region.',
            '`src/cms/renderers/components/assistant/AssistantMessageBubble.tsx`: employee and Assistant text presentation.',
            '`src/cms/renderers/components/assistant/AssistantStreamingStatus.tsx`: accessible non-terminal progress.',
            '`src/cms/renderers/components/assistant/AssistantComposer.tsx`: keyboard and touch-friendly Send and Stop controls.',
            '`src/cms/renderers/components/assistant/AssistantConversationHistory.tsx`: responsive conversation selection and bounded pagination.',
            '`src/assistant/api/assistantContracts.ts`: provider-neutral domain contracts.',
            '`src/assistant/api/assistantContractParsers.ts`: untrusted response validation.',
            '`src/assistant/api/assistantTransport.ts`: shared authenticated HTTP boundary.',
            '`src/assistant/api/assistantClient.ts`: bounded Assistant commands.',
            '`src/assistant/api/assistantSseParser.ts`: incremental, byte-bounded SSE framing.',
            '`src/assistant/api/assistantEventStream.ts`: authenticated event delivery, ordering, resume, and reconnect.',
            '`src/assistant/presentation/assistantPresentationContracts.ts`: UI-facing state and action contracts.',
            '`src/assistant/presentation/assistantPresentationReducer.ts`: pure, deterministic event projection.',
            '`src/assistant/presentation/assistantQueryKeys.ts`: enterprise, employee, conversation, and turn cache isolation.',
            '`src/assistant/presentation/useAssistantPresentation.ts`: lifecycle composition for conversation creation, turn submission, streaming, and cancellation.',
            '`src/assistant/api/assistantError.ts`: stable backend error and correlation projection.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'CMS customization',
          anchor: 'assistant-4-cms-customization',
        },
        {
          kind: 'paragraph',
          text: 'The backend component properties currently control:',
        },
        {
          kind: 'unordered-list',
          items: [
            'title;',
            'welcome message;',
            'composer placeholder;',
            'send and stop labels;',
            'empty-state text;',
            'employee and Assistant speaker labels;',
            'working, cancelling, and failure labels;',
            'conversation history, new conversation, empty history, and load-more labels.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Changing these properties in the authoritative CMS content changes Axis after the next CMS delivery without rebuilding the frontend. Axis never accepts backend JavaScript, component imports, event handlers, arbitrary HTML, or CSS.',
        },
        {
          kind: 'paragraph',
          text: 'Locale and channel remain part of the CMS delivery request. Renderers must tolerate translated text expansion and future right-to-left content. Axis does not translate by parsing English text.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Typed API coverage',
          anchor: 'assistant-5-typed-api-coverage',
        },
        {
          kind: 'paragraph',
          text: 'The current client implements only backend routes that exist:',
        },
        {
          kind: 'unordered-list',
          items: [
            'create, list, and retrieve employee-owned conversations;',
            'submit and retrieve a turn;',
            'replay persisted turn events;',
            'cancel a turn;',
            'create, retrieve, approve, and reject a mutation confirmation;',
            'execute or hand off an approved confirmation.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Requests use:',
        },
        {
          kind: 'unordered-list',
          items: [
            'memory-only employee access token;',
            'validated enterprise context;',
            'bounded query values;',
            'abort and timeout handling;',
            '`Idempotency-Key` for turn and confirmation creation;',
            'no browser credentials in URLs, logs, or storage.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'The event stream additionally enforces the backend contract version and event types, validates conversation and turn ownership, rejects sequence gaps, deduplicates replayed events, resumes with `Last-Event-ID` and `afterSequence`, observes an idle timeout, and limits reconnect duration. Authentication failures and malformed protocol data fail closed rather than being retried.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Presentation lifecycle',
          anchor: 'assistant-6-presentation-lifecycle',
        },
        {
          kind: 'paragraph',
          text: 'The presentation reducer keeps each conversation in a separate immutable record. It projects streamed text, status, clarification, tool planning, confirmation, citations, usage, completion, cancellation, and failure while retaining the normalized raw events for later UI projections.',
        },
        {
          kind: 'paragraph',
          text: 'Duplicate and stale events are ignored. Sequence gaps fail the active presentation rather than silently rendering incomplete output. Events for another conversation or turn cannot mutate the active state. Resetting the scope removes all prior employee conversation state.',
        },
        {
          kind: 'paragraph',
          text: 'The React controller creates a conversation only when required, submits one turn at a time, streams its ordered events, and requests cancellation without prematurely closing the stream that carries the authoritative terminal event. It holds no provider credentials and does not reproduce backend validation.',
        },
        {
          kind: 'paragraph',
          text: 'On authenticated entry, the controller loads a bounded employee-owned conversation page. Selecting a conversation loads its durable turn/message and structured-interaction projection from `aiAssistant`; it does not reconstruct long-term history from short-lived SSE events. Clarification, tool state, safe usage, citations, and confirmation lifecycle therefore survive reload. Older conversation and turn pages are merged without changing chronological order or crossing enterprise and employee scope.',
        },
        {
          kind: 'paragraph',
          text: 'Backend error `code`, safe `message`, HTTP status, and optional `traceId` remain structured. Axis uses a generic fallback only when the backend supplies no safe response.',
        },
        {
          kind: 'paragraph',
          text: 'Archive conversation and a dedicated usage-summary screen are not yet implemented in Axis. The employee-owned summary endpoint belongs directly to `aiProviders`; Axis must discover and call that module rather than proxying through Assistant when that screen is added.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Accessibility and responsive behavior',
          anchor: 'assistant-7-accessibility-and-responsive-behavior',
        },
        {
          kind: 'unordered-list',
          items: [
            'The page and workspace use named regions and headings.',
            'Every CMS-provided action retains an accessible name.',
            'The layout remains single-column and bounded on desktop, tablet, mobile, and WebView widths.',
            'The activity region announces additions and text updates politely.',
            'Enter sends, Shift+Enter creates a new line, and buttons retain touch-safe targets.',
            'The timeline keeps a stable minimum height and follows new output without remounting existing messages.',
            'System reduced-motion preferences disable smooth scrolling and the streaming cursor animation through the shared Axis theme.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Failure and security behavior',
          anchor: 'assistant-8-failure-and-security-behavior',
        },
        {
          kind: 'unordered-list',
          items: [
            'Unauthenticated access redirects to the configured public page.',
            'A locked employee remains on the lock-screen flow.',
            'Missing capability contribution removes the Assistant shortcut.',
            '`UNAVAILABLE` and `UNKNOWN` disable the shortcut.',
            'Incompatible renderers use the existing safe render boundary.',
            'Malformed CMS properties fail inside the render boundary.',
            'Unsafe direct-module endpoints fail bootstrap parsing before a token is transmitted.',
            'Backend errors do not become frontend authorization decisions.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Verification',
          anchor: 'assistant-9-verification',
        },
        {
          kind: 'paragraph',
          text: 'Focused coverage includes:',
        },
        {
          kind: 'unordered-list',
          items: [
            'authenticated `/assistant` CMS delivery;',
            'renderer registry and contract versions;',
            'backend-driven labels and malformed properties;',
            'direct module URL and employee headers;',
            'fragmented SSE parsing and heartbeat handling;',
            'authenticated streaming, terminal closure, replay deduplication, and resume;',
            'cross-turn, sequence, contract, and payload-boundary rejection;',
            'immutable presentation event projection and terminal states;',
            'duplicate, stale, gap, and foreign-event handling;',
            'employee and enterprise query-key isolation;',
            'conversation creation, turn submission, overlap prevention, and controller cleanup;',
            'CMS-driven workspace copy, keyboard submission, streamed text, and cancellation controls;',
            'persisted multi-turn history, selection, new-conversation reset, and bounded pagination;',
            'idempotent turn submission;',
            'input bounds;',
            'stable error codes and trace IDs;',
            'unsafe endpoint and path rejection.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Run:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run verify',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Structured interactions',
          anchor: 'assistant-10-structured-interactions',
        },
        {
          kind: 'paragraph',
          text: 'Axis renders backend `CLARIFICATION`, `TOOL_PLAN`, and `CONFIRMATION_REQUIRED` events through separate feature components. All visible headings and action labels come from the authenticated Assistant CMS component. Axis does not reconstruct mutation arguments, target routes, authorization, or confirmation identity.',
        },
        {
          kind: 'paragraph',
          text: 'Approval and rejection return the backend-issued argument digest and optimistic revision. Rejection is available only before execution begins. Execution sends only the backend-issued confirmation code. Invalid event payloads fail closed; expired, stale, unauthorized, conflicting, and uncertain outcomes remain backend decisions and are shown through the normal safe error contract. The browser never retries an execution automatically.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Evidence and operational transparency',
          anchor: 'assistant-11-evidence-and-operational-transparency',
        },
        {
          kind: 'paragraph',
          text: 'The workspace renders the backend-issued tool lifecycle as prepared, running, succeeded, or failed. Only stable tool identity, owner module, operation identity, lifecycle state, and a safe failure code are displayed. Raw tool arguments, target URLs, credentials, and result content are neither projected nor rendered.',
        },
        {
          kind: 'paragraph',
          text: 'Citation cards display backend-issued identity, title, section, locator, and version. A title becomes a link only when AI Knowledge explicitly classifies it as `INTERNAL_ROUTE` and supplies a validated same-application path. Unclassified locators and rejected external or scheme-based values remain plain text. Axis validates the path again and never invents navigation from locator text.',
        },
        {
          kind: 'paragraph',
          text: 'Usage cards display the normalized input, output, cached-input, reasoning, and embedding token values plus reconciliation state. Reservation identifiers are discarded. Axis does not infer cost, quota, or remaining budget. `aiProviders` now exposes the separate direct, employee-owned `GET /operations/ai-ledger/usage/me` projection for a future budget-summary surface.',
        },
        {
          kind: 'paragraph',
          text: 'Malformed citation, usage, tool lifecycle, and reconciliation payloads fail closed through the same event-data boundary.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'assistant-12-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Add Assistant presentation through a new focused renderer under the Assistant feature, a typed logical-key registration, and bounded properties supplied by the owning CMS component. Add provider, tool, prompt, budget, knowledge, or business-operation behavior only in the appropriate Nodics AI or business module; Axis renders the provider-neutral events it receives.',
        },
        {
          kind: 'paragraph',
          text: 'Do not parse prompts into business commands, select providers in the browser, invent token balances, expose tool arguments, or call unregistered endpoints. Test the project extension with allowed and rejected renderer keys, contract versions, malformed SSE events, unauthorized tool proposals, confirmation revision changes, reconnection boundaries, keyboard and narrow-view behavior, and a production build. Removing the renderer registration is the safe frontend rollback; backend conversations and audit records remain owned by Nodics.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Known next boundary',
          anchor: 'assistant-13-known-next-boundary',
        },
        {
          kind: 'paragraph',
          text: 'Nodics now supports provider-neutral `CLARIFICATION` and `MUTATION_PROPOSAL` planning for confirmed enterprise creation. Axis consumes the resulting clarification and persisted-confirmation events through the existing renderers; it does not parse natural language into business fields.',
        },
        {
          kind: 'paragraph',
          text: "The next boundary is local end-to-end acceptance with a configured provider: request enterprise creation, answer missing fields, inspect the persisted confirmation, approve it, execute it, and verify Profile's result. This requires provider credentials and usage credit; deterministic contract tests remain the offline acceptance authority.",
        },
        {
          kind: 'paragraph',
          text: 'The offline backend acceptance now covers the full provider-neutral clarification, confirmation, approval, and Profile-dispatch boundary. Axis separately verifies rendering, digest/revision approval, execution controls, malformed-event rejection, accessibility, and responsive behavior. A live browser journey remains intentionally deferred until provider credentials and usage credit are configured.',
        },
      ],
      searchText:
        "Axis Assistant Frontend Learn the governed Assistant request flow, typed API contracts, resumable streaming, presentation lifecycle, evidence, accessibility, and security behavior. # Axis Assistant Frontend\n\n## Implemented scope\n\nAxis implements the authenticated `/assistant` CMS route, dedicated Assistant\npage/template/component renderer hierarchy, BackOffice-driven top navigation\nshortcut, validated direct-module connection projection, and a typed\nprovider-neutral Assistant HTTP client.\n\nThe workspace presents backend-owned CMS content, an interactive composer,\nemployee and Assistant message surfaces, smooth streamed text, progress\nfeedback, cancellation, and safe failure presentation. The authenticated SSE\ntransport and presentation state controller drive the visible experience.\nNo browser request is sent to OpenAI, Anthropic, Gemini, or another provider.\n\n## Authority and request flow\n\n1. BackOffice authenticated bootstrap advertises the authorized `aiAssistant`\n   capability, navigation entry, availability, and client-callable module\n   leases.\n2. Axis validates those values and selects only an `UP` or `DEGRADED`\n   connection. Credentials, query strings, fragments, and non-HTTP endpoints\n   are rejected.\n3. CMS authenticated delivery resolves `/assistant` for the configured Site,\n   locale, and channel.\n4. The CMS logical renderer keys map to allowlisted Axis-owned React\n   implementations.\n5. The typed Assistant client sends the employee bearer directly to the\n   discovered `aiAssistant` module endpoint.\n6. Nodics owns authorization, validation, persistence, provider selection,\n   token governance, tools, Workflow handoff, and audit.\n\nAxis does not proxy Assistant calls through BackOffice and does not select or\ncall an AI provider.\n\n## Source map\n\n- `src/bootstrap/publicBootstrap.ts`: authorized navigation and module\n  connection validation.\n- `src/cms/renderers/pages/AssistantPageRenderer.tsx`: Assistant page slot\n  composition.\n- `src/cms/renderers/templates/AssistantWorkspaceTemplateRenderer.tsx`:\n  responsive workspace structure.\n- `src/cms/renderers/components/assistant/AssistantWorkspaceRenderer.tsx`:\n  CMS-driven workspace composition.\n- `src/cms/renderers/components/assistant/AssistantMessageTimeline.tsx`:\n  stable, auto-following activity region.\n- `src/cms/renderers/components/assistant/AssistantMessageBubble.tsx`:\n  employee and Assistant text presentation.\n- `src/cms/renderers/components/assistant/AssistantStreamingStatus.tsx`:\n  accessible non-terminal progress.\n- `src/cms/renderers/components/assistant/AssistantComposer.tsx`: keyboard and\n  touch-friendly Send and Stop controls.\n- `src/cms/renderers/components/assistant/AssistantConversationHistory.tsx`:\n  responsive conversation selection and bounded pagination.\n- `src/assistant/api/assistantContracts.ts`: provider-neutral domain contracts.\n- `src/assistant/api/assistantContractParsers.ts`: untrusted response\n  validation.\n- `src/assistant/api/assistantTransport.ts`: shared authenticated HTTP\n  boundary.\n- `src/assistant/api/assistantClient.ts`: bounded Assistant commands.\n- `src/assistant/api/assistantSseParser.ts`: incremental, byte-bounded SSE\n  framing.\n- `src/assistant/api/assistantEventStream.ts`: authenticated event delivery,\n  ordering, resume, and reconnect.\n- `src/assistant/presentation/assistantPresentationContracts.ts`: UI-facing\n  state and action contracts.\n- `src/assistant/presentation/assistantPresentationReducer.ts`: pure,\n  deterministic event projection.\n- `src/assistant/presentation/assistantQueryKeys.ts`: enterprise, employee,\n  conversation, and turn cache isolation.\n- `src/assistant/presentation/useAssistantPresentation.ts`: lifecycle\n  composition for conversation creation, turn submission, streaming, and\n  cancellation.\n- `src/assistant/api/assistantError.ts`: stable backend error and correlation\n  projection.\n\n## CMS customization\n\nThe backend component properties currently control:\n\n- title;\n- welcome message;\n- composer placeholder;\n- send and stop labels;\n- empty-state text;\n- employee and Assistant speaker labels;\n- working, cancelling, and failure labels;\n- conversation history, new conversation, empty history, and load-more labels.\n\nChanging these properties in the authoritative CMS content changes Axis after\nthe next CMS delivery without rebuilding the frontend. Axis never accepts\nbackend JavaScript, component imports, event handlers, arbitrary HTML, or CSS.\n\nLocale and channel remain part of the CMS delivery request. Renderers must\ntolerate translated text expansion and future right-to-left content. Axis does\nnot translate by parsing English text.\n\n## Typed API coverage\n\nThe current client implements only backend routes that exist:\n\n- create, list, and retrieve employee-owned conversations;\n- submit and retrieve a turn;\n- replay persisted turn events;\n- cancel a turn;\n- create, retrieve, approve, and reject a mutation confirmation;\n- execute or hand off an approved confirmation.\n\nRequests use:\n\n- memory-only employee access token;\n- validated enterprise context;\n- bounded query values;\n- abort and timeout handling;\n- `Idempotency-Key` for turn and confirmation creation;\n- no browser credentials in URLs, logs, or storage.\n\nThe event stream additionally enforces the backend contract version and event\ntypes, validates conversation and turn ownership, rejects sequence gaps,\ndeduplicates replayed events, resumes with `Last-Event-ID` and\n`afterSequence`, observes an idle timeout, and limits reconnect duration.\nAuthentication failures and malformed protocol data fail closed rather than\nbeing retried.\n\n## Presentation lifecycle\n\nThe presentation reducer keeps each conversation in a separate immutable\nrecord. It projects streamed text, status, clarification, tool planning,\nconfirmation, citations, usage, completion, cancellation, and failure while\nretaining the normalized raw events for later UI projections.\n\nDuplicate and stale events are ignored. Sequence gaps fail the active\npresentation rather than silently rendering incomplete output. Events for\nanother conversation or turn cannot mutate the active state. Resetting the\nscope removes all prior employee conversation state.\n\nThe React controller creates a conversation only when required, submits one\nturn at a time, streams its ordered events, and requests cancellation without\nprematurely closing the stream that carries the authoritative terminal event.\nIt holds no provider credentials and does not reproduce backend validation.\n\nOn authenticated entry, the controller loads a bounded employee-owned\nconversation page. Selecting a conversation loads its durable turn/message and\nstructured-interaction projection from `aiAssistant`; it does not reconstruct\nlong-term history from short-lived SSE events. Clarification, tool state, safe\nusage, citations, and confirmation lifecycle therefore survive reload. Older\nconversation and turn pages are merged without changing chronological order or\ncrossing enterprise and employee scope.\n\nBackend error `code`, safe `message`, HTTP status, and optional `traceId` remain\nstructured. Axis uses a generic fallback only when the backend supplies no\nsafe response.\n\nArchive conversation and a dedicated usage-summary screen are not yet\nimplemented in Axis. The employee-owned summary endpoint belongs directly to\n`aiProviders`; Axis must discover and call that module rather than proxying\nthrough Assistant when that screen is added.\n\n## Accessibility and responsive behavior\n\n- The page and workspace use named regions and headings.\n- Every CMS-provided action retains an accessible name.\n- The layout remains single-column and bounded on desktop, tablet, mobile, and\n  WebView widths.\n- The activity region announces additions and text updates politely.\n- Enter sends, Shift+Enter creates a new line, and buttons retain touch-safe\n  targets.\n- The timeline keeps a stable minimum height and follows new output without\n  remounting existing messages.\n- System reduced-motion preferences disable smooth scrolling and the streaming\n  cursor animation through the shared Axis theme.\n\n## Failure and security behavior\n\n- Unauthenticated access redirects to the configured public page.\n- A locked employee remains on the lock-screen flow.\n- Missing capability contribution removes the Assistant shortcut.\n- `UNAVAILABLE` and `UNKNOWN` disable the shortcut.\n- Incompatible renderers use the existing safe render boundary.\n- Malformed CMS properties fail inside the render boundary.\n- Unsafe direct-module endpoints fail bootstrap parsing before a token is\n  transmitted.\n- Backend errors do not become frontend authorization decisions.\n\n## Verification\n\nFocused coverage includes:\n\n- authenticated `/assistant` CMS delivery;\n- renderer registry and contract versions;\n- backend-driven labels and malformed properties;\n- direct module URL and employee headers;\n- fragmented SSE parsing and heartbeat handling;\n- authenticated streaming, terminal closure, replay deduplication, and resume;\n- cross-turn, sequence, contract, and payload-boundary rejection;\n- immutable presentation event projection and terminal states;\n- duplicate, stale, gap, and foreign-event handling;\n- employee and enterprise query-key isolation;\n- conversation creation, turn submission, overlap prevention, and controller\n  cleanup;\n- CMS-driven workspace copy, keyboard submission, streamed text, and\n  cancellation controls;\n- persisted multi-turn history, selection, new-conversation reset, and bounded\n  pagination;\n- idempotent turn submission;\n- input bounds;\n- stable error codes and trace IDs;\n- unsafe endpoint and path rejection.\n\nRun:\n\n```bash\nnpm run verify\n```\n\n## Structured interactions\n\nAxis renders backend `CLARIFICATION`, `TOOL_PLAN`, and\n`CONFIRMATION_REQUIRED` events through separate feature components. All visible\nheadings and action labels come from the authenticated Assistant CMS component.\nAxis does not reconstruct mutation arguments, target routes, authorization, or\nconfirmation identity.\n\nApproval and rejection return the backend-issued argument digest and\noptimistic revision. Rejection is available only before execution begins.\nExecution sends only the backend-issued confirmation code. Invalid event\npayloads fail closed; expired, stale, unauthorized, conflicting, and uncertain\noutcomes remain backend decisions and are shown through the normal safe error\ncontract. The browser never retries an execution automatically.\n\n## Evidence and operational transparency\n\nThe workspace renders the backend-issued tool lifecycle as prepared, running,\nsucceeded, or failed. Only stable tool identity, owner module, operation\nidentity, lifecycle state, and a safe failure code are displayed. Raw tool\narguments, target URLs, credentials, and result content are neither projected\nnor rendered.\n\nCitation cards display backend-issued identity, title, section, locator, and\nversion. A title becomes a link only when AI Knowledge explicitly classifies\nit as `INTERNAL_ROUTE` and supplies a validated same-application path.\nUnclassified locators and rejected external or scheme-based values remain\nplain text. Axis validates the path again and never invents navigation from\nlocator text.\n\nUsage cards display the normalized input, output, cached-input, reasoning, and\nembedding token values plus reconciliation state. Reservation identifiers are\ndiscarded. Axis does not infer cost, quota, or remaining budget. `aiProviders`\nnow exposes the separate direct, employee-owned\n`GET /operations/ai-ledger/usage/me` projection for a future budget-summary\nsurface.\n\nMalformed citation, usage, tool lifecycle, and reconciliation payloads fail\nclosed through the same event-data boundary.\n\n## Customize and extend safely\n\nAdd Assistant presentation through a new focused renderer under the Assistant\nfeature, a typed logical-key registration, and bounded properties supplied by\nthe owning CMS component. Add provider, tool, prompt, budget, knowledge, or\nbusiness-operation behavior only in the appropriate Nodics AI or business\nmodule; Axis renders the provider-neutral events it receives.\n\nDo not parse prompts into business commands, select providers in the browser,\ninvent token balances, expose tool arguments, or call unregistered endpoints.\nTest the project extension with allowed and rejected renderer keys, contract\nversions, malformed SSE events, unauthorized tool proposals, confirmation\nrevision changes, reconnection boundaries, keyboard and narrow-view behavior,\nand a production build. Removing the renderer registration is the safe\nfrontend rollback; backend conversations and audit records remain owned by\nNodics.\n\n## Known next boundary\n\nNodics now supports provider-neutral `CLARIFICATION` and\n`MUTATION_PROPOSAL` planning for confirmed enterprise creation. Axis consumes\nthe resulting clarification and persisted-confirmation events through the\nexisting renderers; it does not parse natural language into business fields.\n\nThe next boundary is local end-to-end acceptance with a configured provider:\nrequest enterprise creation, answer missing fields, inspect the persisted\nconfirmation, approve it, execute it, and verify Profile's result. This requires\nprovider credentials and usage credit; deterministic contract tests remain the\noffline acceptance authority.\n\nThe offline backend acceptance now covers the full provider-neutral\nclarification, confirmation, approval, and Profile-dispatch boundary. Axis\nseparately verifies rendering, digest/revision approval, execution controls,\nmalformed-event rejection, accessibility, and responsive behavior. A live\nbrowser journey remains intentionally deferred until provider credentials and\nusage credit are configured.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/assistant-frontend.md',
        evidence: 'docs/assistant-frontend.md',
        hash: '4b5f2628a6a7b3e6561fef37e68c4001f02a8385700174ffd36fb293b46b2604',
        version: '0.3.3',
      },
      previous: {
        title: 'Employee Login, Recovery, Lock, and Dashboard',
        route: '/docs/nodics-axis/employee-access',
      },
      next: {
        title: 'Axis Schema Workbench',
        route: '/docs/nodics-axis/schema-workbench',
      },
    },
    active: true,
  },
  record9: {
    code: 'axisDocsComponentschemaworkbench',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.schema-workbench',
      title: 'Axis Schema Workbench',
      route: '/docs/nodics-axis/schema-workbench',
      section: 'axis-capabilities',
      sectionTitle: 'Axis Capabilities',
      category: 'Axis Capabilities',
      audience: ['business-user', 'administrator', 'developer', 'operator'],
      summary:
        'Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification.',
      headings: [
        {
          text: 'Implemented frontend behavior',
          anchor: 'schema-workbench-1-implemented-frontend-behavior',
          level: 2,
        },
        {
          text: 'Request ownership',
          anchor: 'schema-workbench-2-request-ownership',
          level: 2,
        },
        {
          text: 'Successful behavior',
          anchor: 'schema-workbench-3-successful-behavior',
          level: 2,
        },
        {
          text: 'Unauthorized or invalid behavior',
          anchor: 'schema-workbench-4-unauthorized-or-invalid-behavior',
          level: 2,
        },
        {
          text: 'Boundary and responsive behavior',
          anchor: 'schema-workbench-5-boundary-and-responsive-behavior',
          level: 2,
        },
        {
          text: 'Failure and recovery',
          anchor: 'schema-workbench-6-failure-and-recovery',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'schema-workbench-7-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Verification',
          anchor: 'schema-workbench-8-verification',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Axis implements the presentation side of Nodics Schema Workbench. The owning backend module remains authoritative for schemas, allowed operations, relationships, generated CRUD, domain operations, validation, permissions, tenant isolation, and persistence.',
        },
        {
          kind: 'paragraph',
          text: 'Business-user and backend customization guidance is maintained in the Nodics documentation:',
        },
        {
          kind: 'unordered-list',
          items: [
            '`gDocs/backoffice/how-schema-workbench-works.md`',
            '`gFramework/nDatabase/database/README.md`',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Implemented frontend behavior',
          anchor: 'schema-workbench-1-implemented-frontend-behavior',
        },
        {
          kind: 'paragraph',
          text: 'The authenticated `/schema-workbench` route:',
        },
        {
          kind: 'unordered-list',
          items: [
            'appears only when BackOffice advertises its authorized navigation item;',
            'resolves its page, template, renderer keys, and visible copy through CMS;',
            'discovers active module endpoints through authenticated BackOffice bootstrap;',
            'requests safe Workbench descriptors directly from those modules;',
            'lists and filters authorized data types by readable label or module;',
            'loads bounded record pages through an owning-module Workbench query that delegates to existing generated CRUD services;',
            'searches the full authorized result set across descriptor-advertised safe text fields rather than filtering only the current browser page;',
            'sorts only by descriptor-advertised scalar fields;',
            'builds typed filters only from descriptor-advertised fields and operators;',
            'supports bounded nested `AND`/`OR` groups with an inert JSON request preview;',
            'keeps filter edits as a local draft until the employee applies them;',
            'offers only backend-configured page sizes and shows the authoritative total;',
            'cancels obsolete in-flight record requests when query state changes;',
            'renders primary and searchable fields in a responsive record table;',
            'stores employee/tenant/enterprise-scoped favourites, recents, visible columns, and up to ten saved views in bounded browser storage without storing records or access tokens;',
            'supports current-page row selection and exposes bulk deletion only when the owning descriptor explicitly advertises it;',
            'requests a governed delete-impact preview before enabling final deletion;',
            'consumes backend concurrency and aggregate-operation metadata without inventing browser-side business authority;',
            'opens a complete permitted record detail view from the record table;',
            'shows Edit only when the owning descriptor advertises Update;',
            'initializes Update from the selected record while excluding managed and read-only fields from the mutation model;',
            'sends a bounded generated Update request using the original primary identity, an editable model, and `returnModified`;',
            'refreshes the record list and detail view only after the owning module confirms the update;',
            'shows Delete only when the owning descriptor advertises it;',
            'requires a modal confirmation showing record identity, authenticated tenant, and enterprise;',
            'sends one bounded Delete query using the original primary identity;',
            'disables confirmation and cancellation while deletion is pending;',
            'keeps the record and confirmation available when authorization, ownership, reference integrity, or another backend business rule rejects deletion;',
            'displays only the bounded backend error code/message contract and never renders diagnostic contexts, records, queries, or stacks;',
            'closes record details and refreshes the list only after confirmed deletion;',
            'renders one typed field component per supported schema field type;',
            'creates independent Address and Contact records through generated CRUD;',
            'renders schema-declared relationship fields separately from ordinary arrays;',
            'renders each relationship using its backend-declared business role, so references to the same target type remain distinguishable;',
            'combines backend-declared display properties in their configured order so selectors show meaningful identities instead of only opaque record keys;',
            'presents related records as `code - description`, truncating descriptions longer than five words to the first five words followed by `...`;',
            'exposes the complete description in a tooltip on pointer hover or keyboard focus, including descriptions displayed without truncation;',
            "selects existing related records through the target module's generated read contract;",
            'holds new related records as in-memory drafts until the parent is submitted;',
            'creates drafted related records through their owning module and associates only the returned reference property;',
            'prevents duplicate references in a multi-value relationship;',
            'bounds nested related creation by backend-advertised depth and stops cycles by falling back to selecting an existing record;',
            'offers inline related-record editing only when both relationship metadata advertises `EDIT_RELATED` and the target schema advertises Update;',
            'retains each successfully created related reference when a later related operation or parent save fails, so retry does not recreate that record;',
            'keeps unsaved drafts in component memory;',
            'blocks visibly incomplete required fields before submission while preserving backend validation as authoritative;',
            'formats dates with locale-aware browser APIs and renders booleans with CMS-provided user-facing labels;',
            'exposes loading, empty, unavailable, and retry states.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Every backend model that is authorized and not explicitly excluded is discoverable with generated Search, Read, Create, Update, and governed Delete operations. An owning schema may narrow that list. Address and Contact also demonstrate the Address-to-Contact relationship editor.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Request ownership',
          anchor: 'schema-workbench-2-request-ownership',
        },
        {
          kind: 'code',
          language: 'text',
          text: 'Axis → BackOffice: authorized navigation and module endpoints\nAxis → CMS: Workbench page composition and presentation copy\nAxis → owning module: schema descriptors, generated reads, and authorized writes',
        },
        {
          kind: 'paragraph',
          text: 'Axis does not send schema operations through BackOffice and does not maintain its own module registry. Access tokens remain in memory and are sent only in the Authorization header. Enterprise context is sent in `x-enterprise-code`.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Successful behavior',
          anchor: 'schema-workbench-3-successful-behavior',
        },
        {
          kind: 'paragraph',
          text: 'An authorized employee opens Schema Workbench, selects Address, and sees the first bounded page of Address records using labels supplied by the effective Profile schema. The employee can open Create Address, complete required fields, select an existing Contact or add a new Contact draft, and submit the complete draft directly to Profile.',
        },
        {
          kind: 'paragraph',
          text: "For Update, the employee opens a record through **View**, chooses **Edit** when permitted, changes ordinary fields or relationship references, and submits. Axis uses the original primary identity as the update query even when the editable primary field changes. When the descriptor advertises required optimistic concurrency, the query also carries the record's advertised revision. Update and Delete fail closed before sending a request if that required revision is unavailable.",
        },
        {
          kind: 'paragraph',
          text: 'For Delete, the employee opens the record, chooses **Delete**, verifies the record, tenant, and enterprise shown in the confirmation, and explicitly confirms. Axis never cascades deletion and never treats a frontend permission check as final authority.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Unauthorized or invalid behavior',
          anchor: 'schema-workbench-4-unauthorized-or-invalid-behavior',
        },
        {
          kind: 'paragraph',
          text: 'The route is unavailable when BackOffice does not advertise it. Modules omit schemas and operations that the employee cannot access. Malformed descriptors, unsupported operations, unsafe endpoints, invalid envelopes, and malformed records fail validation rather than being rendered. A relationship cannot create a target schema unless that descriptor advertises Create.',
        },
        {
          kind: 'paragraph',
          text: 'Axis does not infer optimistic concurrency from timestamps. It sends an effective revision only when the backend descriptor advertises a compare-and- set field. Axis must never simulate stale-write protection in browser state.',
        },
        {
          kind: 'paragraph',
          text: 'Delete rejection leaves the confirmation open with the safe backend message. Axis does not hide a reference-integrity failure, retry automatically, or delete related records as compensation.',
        },
        {
          kind: 'paragraph',
          text: 'The HTTP client accepts only a bounded top-level backend message and code for display. Structured diagnostic contexts and stacks are deliberately ignored. Malformed or non-JSON failures use a generic HTTP fallback. Translation must use stable backend codes and CMS presentation content rather than parsing an English message.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Boundary and responsive behavior',
          anchor: 'schema-workbench-5-boundary-and-responsive-behavior',
        },
        {
          kind: 'paragraph',
          text: 'At large widths, data-type navigation and records use two columns. At smaller widths they stack into one column. Record columns remain horizontally scrollable instead of shrinking into unreadable content. Controls retain labels, keyboard operation, and semantic list/table roles.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Failure and recovery',
          anchor: 'schema-workbench-6-failure-and-recovery',
        },
        {
          kind: 'paragraph',
          text: 'One unavailable module does not hide descriptors successfully returned by other active modules. If every discovery request fails, Axis shows a safe retryable error. Record loading failures remain scoped to the selected schema and can be retried without reloading the application.',
        },
        {
          kind: 'paragraph',
          text: 'Workbench does not claim a browser-side or cross-module database transaction. Related records are created sequentially during final submission. After each successful related creation, Axis replaces that local draft with the returned reference. If a later related creation or the parent save fails, the form stays open and the successful reference remains selected. Retrying therefore resumes from the failed step instead of creating the successful record again.',
        },
        {
          kind: 'paragraph',
          text: 'This recovery model avoids hidden deletion and unsafe compensation. It does not guarantee atomic commit across modules. Journeys that require strict atomicity must use a backend-owned domain operation or a transaction-capable workflow, not generic Workbench coordination.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'schema-workbench-7-customize-and-extend-safely',
        },
        {
          kind: 'unordered-list',
          items: [
            'Change page copy and composition through `axisContentCatalog`.',
            'Change available schemas, fields, relationships, and operations in the owning Nodics module.',
            'Change module availability through Nodics runtime topology and BackOffice registration.',
            'Extend Axis with one typed renderer per new CMS component contract.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Do not add hardcoded module endpoints, backend rules, translated business copy, or alternate schema definitions to Axis.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Verification',
          anchor: 'schema-workbench-8-verification',
        },
        {
          kind: 'paragraph',
          text: 'Run:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run verify',
        },
        {
          kind: 'paragraph',
          text: 'Focused tests cover direct-module headers and paths, bounded record reads, creates and updates, original-identity update queries, descriptor validation, bounded original-identity deletion, missing-identity rejection, explicit confirmation, pending duplicate-submit prevention, authenticated tenant parsing, partial discovery, retryable failure, schema selection, record rendering, record selection, CMS renderer registration, required-field validation, default values, framework-managed field exclusion, selecting an existing relationship, related-record creation, duplicate-reference prevention, retry without duplicate related creation, backend conflict-message handling, diagnostic-context exclusion, malformed-error fallback, and locale-aware record formatting. Coverage also includes revision forwarding for Update and Delete, missing-revision rejection before network access, self-referential relationship cycle fallback, bounded nested relationship depth, full description tooltips, and five-word related-record summaries.',
        },
        {
          kind: 'paragraph',
          text: 'The authenticated local acceptance journey additionally verifies schema discovery across active modules, bounded search, unauthenticated rejection, raw-query rejection, advertised Create/Update/Delete visibility, readable Enterprise relationship labels, and `code - description` Tenant choices. The journey is read-only: it opens forms and selectors but does not submit a business-data mutation.',
        },
      ],
      searchText:
        "Axis Schema Workbench Use and extend governed schema discovery, record operations, relationship coordination, failure recovery, responsive behavior, and verification. # Axis Schema Workbench\n\nAxis implements the presentation side of Nodics Schema Workbench. The owning\nbackend module remains authoritative for schemas, allowed operations,\nrelationships, generated CRUD, domain operations, validation, permissions,\ntenant isolation, and persistence.\n\nBusiness-user and backend customization guidance is maintained in the Nodics\ndocumentation:\n\n- `gDocs/backoffice/how-schema-workbench-works.md`\n- `gFramework/nDatabase/database/README.md`\n\n## Implemented frontend behavior\n\nThe authenticated `/schema-workbench` route:\n\n- appears only when BackOffice advertises its authorized navigation item;\n- resolves its page, template, renderer keys, and visible copy through CMS;\n- discovers active module endpoints through authenticated BackOffice bootstrap;\n- requests safe Workbench descriptors directly from those modules;\n- lists and filters authorized data types by readable label or module;\n- loads bounded record pages through an owning-module Workbench query that\n  delegates to existing generated CRUD services;\n- searches the full authorized result set across descriptor-advertised safe\n  text fields rather than filtering only the current browser page;\n- sorts only by descriptor-advertised scalar fields;\n- builds typed filters only from descriptor-advertised fields and operators;\n- supports bounded nested `AND`/`OR` groups with an inert JSON request preview;\n- keeps filter edits as a local draft until the employee applies them;\n- offers only backend-configured page sizes and shows the authoritative total;\n- cancels obsolete in-flight record requests when query state changes;\n- renders primary and searchable fields in a responsive record table;\n- stores employee/tenant/enterprise-scoped favourites, recents, visible\n  columns, and up to ten saved views in bounded browser storage without\n  storing records or access tokens;\n- supports current-page row selection and exposes bulk deletion only when the\n  owning descriptor explicitly advertises it;\n- requests a governed delete-impact preview before enabling final deletion;\n- consumes backend concurrency and aggregate-operation metadata without\n  inventing browser-side business authority;\n- opens a complete permitted record detail view from the record table;\n- shows Edit only when the owning descriptor advertises Update;\n- initializes Update from the selected record while excluding managed and\n  read-only fields from the mutation model;\n- sends a bounded generated Update request using the original primary identity,\n  an editable model, and `returnModified`;\n- refreshes the record list and detail view only after the owning module\n  confirms the update;\n- shows Delete only when the owning descriptor advertises it;\n- requires a modal confirmation showing record identity, authenticated tenant,\n  and enterprise;\n- sends one bounded Delete query using the original primary identity;\n- disables confirmation and cancellation while deletion is pending;\n- keeps the record and confirmation available when authorization, ownership,\n  reference integrity, or another backend business rule rejects deletion;\n- displays only the bounded backend error code/message contract and never\n  renders diagnostic contexts, records, queries, or stacks;\n- closes record details and refreshes the list only after confirmed deletion;\n- renders one typed field component per supported schema field type;\n- creates independent Address and Contact records through generated CRUD;\n- renders schema-declared relationship fields separately from ordinary arrays;\n- renders each relationship using its backend-declared business role, so\n  references to the same target type remain distinguishable;\n- combines backend-declared display properties in their configured order so\n  selectors show meaningful identities instead of only opaque record keys;\n- presents related records as `code - description`, truncating descriptions\n  longer than five words to the first five words followed by `...`;\n- exposes the complete description in a tooltip on pointer hover or keyboard\n  focus, including descriptions displayed without truncation;\n- selects existing related records through the target module's generated read\n  contract;\n- holds new related records as in-memory drafts until the parent is submitted;\n- creates drafted related records through their owning module and associates\n  only the returned reference property;\n- prevents duplicate references in a multi-value relationship;\n- bounds nested related creation by backend-advertised depth and stops cycles\n  by falling back to selecting an existing record;\n- offers inline related-record editing only when both relationship metadata\n  advertises `EDIT_RELATED` and the target schema advertises Update;\n- retains each successfully created related reference when a later related\n  operation or parent save fails, so retry does not recreate that record;\n- keeps unsaved drafts in component memory;\n- blocks visibly incomplete required fields before submission while preserving\n  backend validation as authoritative;\n- formats dates with locale-aware browser APIs and renders booleans with\n  CMS-provided user-facing labels;\n- exposes loading, empty, unavailable, and retry states.\n\nEvery backend model that is authorized and not explicitly excluded is\ndiscoverable with generated Search, Read, Create, Update, and governed Delete\noperations. An owning schema may narrow that list. Address and Contact also\ndemonstrate the Address-to-Contact relationship editor.\n\n## Request ownership\n\n```text\nAxis → BackOffice: authorized navigation and module endpoints\nAxis → CMS: Workbench page composition and presentation copy\nAxis → owning module: schema descriptors, generated reads, and authorized writes\n```\n\nAxis does not send schema operations through BackOffice and does not maintain\nits own module registry. Access tokens remain in memory and are sent only in\nthe Authorization header. Enterprise context is sent in\n`x-enterprise-code`.\n\n## Successful behavior\n\nAn authorized employee opens Schema Workbench, selects Address, and sees the\nfirst bounded page of Address records using labels supplied by the effective\nProfile schema. The employee can open Create Address, complete required fields,\nselect an existing Contact or add a new Contact draft, and submit the complete\ndraft directly to Profile.\n\nFor Update, the employee opens a record through **View**, chooses **Edit** when\npermitted, changes ordinary fields or relationship references, and submits.\nAxis uses the original primary identity as the update query even when the\neditable primary field changes. When the descriptor advertises required\noptimistic concurrency, the query also carries the record's advertised\nrevision. Update and Delete fail closed before sending a request if that\nrequired revision is unavailable.\n\nFor Delete, the employee opens the record, chooses **Delete**, verifies the\nrecord, tenant, and enterprise shown in the confirmation, and explicitly\nconfirms. Axis never cascades deletion and never treats a frontend permission\ncheck as final authority.\n\n## Unauthorized or invalid behavior\n\nThe route is unavailable when BackOffice does not advertise it. Modules omit\nschemas and operations that the employee cannot access. Malformed descriptors,\nunsupported operations, unsafe endpoints, invalid envelopes, and malformed\nrecords fail validation rather than being rendered. A relationship cannot\ncreate a target schema unless that descriptor advertises Create.\n\nAxis does not infer optimistic concurrency from timestamps. It sends an\neffective revision only when the backend descriptor advertises a compare-and-\nset field. Axis must never simulate stale-write protection in browser state.\n\nDelete rejection leaves the confirmation open with the safe backend message.\nAxis does not hide a reference-integrity failure, retry automatically, or\ndelete related records as compensation.\n\nThe HTTP client accepts only a bounded top-level backend message and code for\ndisplay. Structured diagnostic contexts and stacks are deliberately ignored.\nMalformed or non-JSON failures use a generic HTTP fallback. Translation must\nuse stable backend codes and CMS presentation content rather than parsing an\nEnglish message.\n\n## Boundary and responsive behavior\n\nAt large widths, data-type navigation and records use two columns. At smaller\nwidths they stack into one column. Record columns remain horizontally\nscrollable instead of shrinking into unreadable content. Controls retain\nlabels, keyboard operation, and semantic list/table roles.\n\n## Failure and recovery\n\nOne unavailable module does not hide descriptors successfully returned by\nother active modules. If every discovery request fails, Axis shows a safe\nretryable error. Record loading failures remain scoped to the selected schema\nand can be retried without reloading the application.\n\nWorkbench does not claim a browser-side or cross-module database transaction.\nRelated records are created sequentially during final submission. After each\nsuccessful related creation, Axis replaces that local draft with the returned\nreference. If a later related creation or the parent save fails, the form stays\nopen and the successful reference remains selected. Retrying therefore resumes\nfrom the failed step instead of creating the successful record again.\n\nThis recovery model avoids hidden deletion and unsafe compensation. It does not\nguarantee atomic commit across modules. Journeys that require strict atomicity\nmust use a backend-owned domain operation or a transaction-capable workflow,\nnot generic Workbench coordination.\n\n## Customize and extend safely\n\n- Change page copy and composition through `axisContentCatalog`.\n- Change available schemas, fields, relationships, and operations in the\n  owning Nodics module.\n- Change module availability through Nodics runtime topology and BackOffice\n  registration.\n- Extend Axis with one typed renderer per new CMS component contract.\n\nDo not add hardcoded module endpoints, backend rules, translated business\ncopy, or alternate schema definitions to Axis.\n\n## Verification\n\nRun:\n\n```bash\nnpm run verify\n```\n\nFocused tests cover direct-module headers and paths, bounded record reads,\ncreates and updates, original-identity update queries, descriptor validation,\nbounded original-identity deletion, missing-identity rejection, explicit\nconfirmation, pending duplicate-submit prevention, authenticated tenant\nparsing, partial discovery, retryable failure, schema selection, record rendering,\nrecord selection, CMS renderer registration, required-field\nvalidation, default values, framework-managed field exclusion, selecting an\nexisting relationship, related-record creation, duplicate-reference prevention,\nretry without duplicate related creation, backend conflict-message handling,\ndiagnostic-context exclusion, malformed-error fallback, and locale-aware\nrecord formatting. Coverage also includes revision forwarding for Update and\nDelete, missing-revision rejection before network access, self-referential\nrelationship cycle fallback, bounded nested relationship depth, full\ndescription tooltips, and five-word related-record summaries.\n\nThe authenticated local acceptance journey additionally verifies schema\ndiscovery across active modules, bounded search, unauthenticated rejection,\nraw-query rejection, advertised Create/Update/Delete visibility, readable\nEnterprise relationship labels, and `code - description` Tenant choices. The\njourney is read-only: it opens forms and selectors but does not submit a\nbusiness-data mutation.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/schema-workbench.md',
        evidence: 'docs/schema-workbench.md',
        hash: '73c31ac8a44209c297948268e8e62a9a7121a8eacc6da0bbfbe3589e667e0abd',
        version: '0.3.3',
      },
      previous: {
        title: 'Axis Assistant Frontend',
        route: '/docs/nodics-axis/assistant',
      },
      next: {
        title: 'Module Health',
        route: '/docs/nodics-axis/module-health',
      },
    },
    active: true,
  },
  record10: {
    code: 'axisDocsComponentmodulehealth',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.module-health',
      title: 'Module Health',
      route: '/docs/nodics-axis/module-health',
      section: 'axis-capabilities',
      sectionTitle: 'Axis Capabilities',
      category: 'Axis Capabilities',
      audience: ['administrator', 'operator', 'developer', 'security-reviewer'],
      summary:
        'Monitor the sanitized BackOffice module and node readiness projection without creating a browser-side health authority.',
      headings: [
        {
          text: 'Purpose and ownership',
          anchor: 'module-health-1-purpose-and-ownership',
          level: 2,
        },
        {
          text: 'Navigation and access',
          anchor: 'module-health-2-navigation-and-access',
          level: 2,
        },
        {
          text: 'Frontend structure',
          anchor: 'module-health-3-frontend-structure',
          level: 2,
        },
        {
          text: 'Operator workflow',
          anchor: 'module-health-4-operator-workflow',
          level: 2,
        },
        {
          text: 'Responsive, accessible, and failure behavior',
          anchor: 'module-health-5-responsive-accessible-and-failure-behavior',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'module-health-6-customize-and-extend-safely',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'heading',
          level: 2,
          text: 'Purpose and ownership',
          anchor: 'module-health-1-purpose-and-ownership',
        },
        {
          kind: 'paragraph',
          text: 'Module Health gives an authorized employee a responsive view of registered Nodics modules and runtime instances. Operators can see whether Profile, CMS, Workflow, BackOffice, or another capability is healthy, degraded, unavailable, or unknown and identify the registered environment, server, and node involved.',
        },
        {
          kind: 'paragraph',
          text: 'Axis does not decide health. Nodics System owns readiness and BackOffice owns the sanitized availability observation and registry projection. Axis owns only typed consumption, interaction, rendering, filtering, and accessible state presentation.',
        },
        {
          kind: 'paragraph',
          text: 'Axis displays the backend-provided package label and renders the loader-discovered parent/child hierarchy. It never sends a label or canonical path as the operational identifier; detail, refresh, query keys, and authorization continue using the original module name.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Navigation and access',
          anchor: 'module-health-2-navigation-and-access',
        },
        {
          kind: 'paragraph',
          text: 'BackOffice contributes **Module Health** under **Operations and Integration** through `backofficeCapabilities.backoffice.navigation`; Axis does not hardcode the menu. It is returned only with `backoffice.registry.admin.view`.',
        },
        {
          kind: 'paragraph',
          text: 'The route is `/operations/module-health`. Employee session and screen-lock guards protect direct navigation. Backend authorization remains mandatory.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Frontend structure',
          anchor: 'module-health-3-frontend-structure',
        },
        {
          kind: 'code',
          language: 'text',
          text: 'src/operations/moduleHealth/\n  ModuleHealthRoutePage.tsx\n  ModuleHealthTree.tsx\n  api/\n    moduleHealthClient.ts\n    moduleHealthContracts.ts\n\ntest/operations/moduleHealth/\n  api/\n    moduleHealthClient.test.ts',
        },
        {
          kind: 'paragraph',
          text: 'Contracts reject malformed counts, identifiers, states, and freshness. The client supplies the in-memory employee token, enterprise header, request timeout, no-store policy, and redirect rejection. It stores no credentials and rejects unsafe module path segments.',
        },
        {
          kind: 'paragraph',
          text: 'TanStack Query owns server state. Summary data loads once; instance details load only for the selected module, avoiding an unbounded request per module. Window focus and explicit actions refresh data. Axis adds no health poller. An on-demand **Check now** action is enabled only when the selected module has at least one client-callable runtime endpoint. Non-client modules still show their registration heartbeat and observed state, but Axis does not request a refresh that the backend cannot perform.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Operator workflow',
          anchor: 'module-health-4-operator-workflow',
        },
        {
          kind: 'ordered-list',
          items: [
            'Open **Operations and Integration > Module Health**.',
            'Review totals and module states.',
            'Expand or collapse module groups.',
            'Search by label, code, canonical path, environment, server, or state. Matching descendants retain their ancestor chain.',
            'Select a concrete module.',
            "Review each registered node's heartbeat, readiness observation, state, freshness, and stable reason.",
            'Choose **Check now** for a governed immediate observation.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Expired and intentionally deregistered nodes are not active instances. Axis does not infer expected cluster membership from previously observed nodes.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Responsive, accessible, and failure behavior',
          anchor: 'module-health-5-responsive-accessible-and-failure-behavior',
        },
        {
          kind: 'unordered-list',
          items: [
            'Cards wrap and list/details stack on narrow screens.',
            'State always has text in addition to color.',
            'Search is visibly labelled; rows are keyboard-operable buttons.',
            'Loading uses announced progress and failures use alerts.',
            'Dates use the browser locale.',
            'BackOffice failure never falls back to invented health.',
            'Unauthorized access remains a backend rejection.',
            'Malformed responses fail closed.',
            'Stale evidence is `UNKNOWN`, never healthy.',
            'Refresh failure preserves the existing view and shows a bounded message.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'module-health-6-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Partners may change styling or compose presentation around typed contracts. They must not call databases/providers from Axis, reproduce the registry, call every module ping as a second authority, persist access tokens or raw diagnostics, infer configured cluster membership, or bypass permissions.',
        },
      ],
      searchText:
        "Module Health Monitor the sanitized BackOffice module and node readiness projection without creating a browser-side health authority. # Module Health\n\n## Purpose and ownership\n\nModule Health gives an authorized employee a responsive view of registered\nNodics modules and runtime instances. Operators can see whether Profile, CMS,\nWorkflow, BackOffice, or another capability is healthy, degraded, unavailable,\nor unknown and identify the registered environment, server, and node involved.\n\nAxis does not decide health. Nodics System owns readiness and BackOffice owns\nthe sanitized availability observation and registry projection. Axis owns only\ntyped consumption, interaction, rendering, filtering, and accessible state\npresentation.\n\nAxis displays the backend-provided package label and renders the\nloader-discovered parent/child hierarchy. It never sends a label or canonical\npath as the operational identifier; detail, refresh, query keys, and\nauthorization continue using the original module name.\n\n## Navigation and access\n\nBackOffice contributes **Module Health** under **Operations and Integration**\nthrough `backofficeCapabilities.backoffice.navigation`; Axis does not hardcode\nthe menu. It is returned only with `backoffice.registry.admin.view`.\n\nThe route is `/operations/module-health`. Employee session and screen-lock\nguards protect direct navigation. Backend authorization remains mandatory.\n\n## Frontend structure\n\n```text\nsrc/operations/moduleHealth/\n  ModuleHealthRoutePage.tsx\n  ModuleHealthTree.tsx\n  api/\n    moduleHealthClient.ts\n    moduleHealthContracts.ts\n\ntest/operations/moduleHealth/\n  api/\n    moduleHealthClient.test.ts\n```\n\nContracts reject malformed counts, identifiers, states, and freshness.\nThe client supplies the in-memory employee token, enterprise header, request\ntimeout, no-store policy, and redirect rejection. It stores no credentials and\nrejects unsafe module path segments.\n\nTanStack Query owns server state. Summary data loads once; instance details\nload only for the selected module, avoiding an unbounded request per module.\nWindow focus and explicit actions refresh data. Axis adds no health poller.\nAn on-demand **Check now** action is enabled only when the selected module has\nat least one client-callable runtime endpoint. Non-client modules still show\ntheir registration heartbeat and observed state, but Axis does not request a\nrefresh that the backend cannot perform.\n\n## Operator workflow\n\n1. Open **Operations and Integration > Module Health**.\n2. Review totals and module states.\n3. Expand or collapse module groups.\n4. Search by label, code, canonical path, environment, server, or state.\n   Matching descendants retain their ancestor chain.\n5. Select a concrete module.\n6. Review each registered node's heartbeat, readiness observation, state,\n   freshness, and stable reason.\n7. Choose **Check now** for a governed immediate observation.\n\nExpired and intentionally deregistered nodes are not active instances. Axis\ndoes not infer expected cluster membership from previously observed nodes.\n\n## Responsive, accessible, and failure behavior\n\n- Cards wrap and list/details stack on narrow screens.\n- State always has text in addition to color.\n- Search is visibly labelled; rows are keyboard-operable buttons.\n- Loading uses announced progress and failures use alerts.\n- Dates use the browser locale.\n- BackOffice failure never falls back to invented health.\n- Unauthorized access remains a backend rejection.\n- Malformed responses fail closed.\n- Stale evidence is `UNKNOWN`, never healthy.\n- Refresh failure preserves the existing view and shows a bounded message.\n\n## Customize and extend safely\n\nPartners may change styling or compose presentation around typed contracts.\nThey must not call databases/providers from Axis, reproduce the registry,\ncall every module ping as a second authority, persist access tokens or raw\ndiagnostics, infer configured cluster membership, or bypass permissions.\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/module-health.md',
        evidence: 'docs/module-health.md',
        hash: 'a518daa7d48b48e8e588acfdbb99b748117d9830c4ff5c084b7160dd56dcd70a',
        version: '0.3.3',
      },
      previous: {
        title: 'Axis Schema Workbench',
        route: '/docs/nodics-axis/schema-workbench',
      },
      next: {
        title: 'Imports and Exports Workspace',
        route: '/docs/nodics-axis/imports-exports',
      },
    },
    active: true,
  },
  record11: {
    code: 'axisDocsComponentimportsexports',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.imports-exports',
      title: 'Imports and Exports Workspace',
      route: '/docs/nodics-axis/imports-exports',
      section: 'axis-capabilities',
      sectionTitle: 'Axis Capabilities',
      category: 'Axis Capabilities',
      audience: ['administrator', 'operator', 'developer', 'security-reviewer'],
      summary:
        'Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary.',
      headings: [
        {
          text: 'Purpose and ownership',
          anchor: 'imports-exports-1-purpose-and-ownership',
          level: 2,
        },
        {
          text: 'Frontend organization',
          anchor: 'imports-exports-2-frontend-organization',
          level: 2,
        },
        {
          text: 'Employee workflow',
          anchor: 'imports-exports-3-employee-workflow',
          level: 2,
        },
        {
          text: 'Security, failure, and extension',
          anchor: 'imports-exports-4-security-failure-and-extension',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'imports-exports-5-customize-and-extend-safely',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'heading',
          level: 2,
          text: 'Purpose and ownership',
          anchor: 'imports-exports-1-purpose-and-ownership',
        },
        {
          kind: 'paragraph',
          text: 'Axis gives authorized employees a responsive workspace for Nodics data operations. It is a client of the `import` module and does not discover files, calculate installation state, sequence imports, write a database, or retain a browser-side audit authority.',
        },
        {
          kind: 'paragraph',
          text: 'BackOffice contributes **Operations and Integration → Imports and Exports** at `/operations/imports-exports`. Axis renders it only when authenticated navigation contains that entry.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Frontend organization',
          anchor: 'imports-exports-2-frontend-organization',
        },
        {
          kind: 'unordered-list',
          items: [
            '`src/operations/importExport/ImportExportRoutePage.tsx` owns presentation and short-lived selection.',
            '`src/operations/importExport/api/dataReleaseContracts.ts` owns bounded client types.',
            '`src/operations/importExport/api/dataReleaseClient.ts` owns authenticated transport and defensive parsing.',
            'Tests mirror this hierarchy under `test/operations/importExport`.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'TanStack Query owns catalogue server state. The browser sends selected module codes and reviewed versions; Nodics re-discovers and validates the authority before doing work.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Employee workflow',
          anchor: 'imports-exports-3-employee-workflow',
        },
        {
          kind: 'paragraph',
          text: 'Choose Initialization, Core, or Sample data; review friendly module names, descriptions, versions, and states; select releases; validate; then install or update when authorized. Controls stack on narrow screens, remain keyboard operable, and have assistive labels.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Security, failure, and extension',
          anchor: 'imports-exports-4-security-failure-and-extension',
        },
        {
          kind: 'paragraph',
          text: 'The in-memory employee token is sent only to the selected `import` connection with enterprise context. Axis never infers authorization from a visible button. Unknown states and incompatible responses are rejected. Timeouts, authorization failures, disabled policy, integrity failures, and stale selections are shown without backend stacks or diagnostics.',
        },
        {
          kind: 'paragraph',
          text: 'Existing installations may enter this workspace with the historical `import.core.run` administrator permission so they can install the new fine-grained permission data. Nodics still enforces a separate type-specific permission for each execution.',
        },
        {
          kind: 'paragraph',
          text: 'Export remains unavailable because backend export providers are fail-closed. Axis must not enable a placeholder or simulate export.',
        },
        {
          kind: 'paragraph',
          text: 'Extend presentation inside this feature and reuse shell and API patterns. Never add an Axis filesystem picker or importer. Run `npm run verify` and validate desktop, touch, narrow viewport, keyboard, unauthorized, unavailable-module, validation, execution, recovery, integration, and regression behavior.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'imports-exports-5-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Add project-specific release filters, explanatory CMS copy, or result presentation through focused Axis components while continuing to call the Nodics nImport catalogue, preflight, execution, and history contracts. New import or export formats, release discovery, sequencing, persistence, and provider behavior belong in later backend modules behind the provider-neutral data contracts.',
        },
        {
          kind: 'paragraph',
          text: 'Do not add a browser filesystem picker, inspect sibling repositories, submit arbitrary server paths, calculate installation state locally, or enable export before its backend contract is active. Test authorized and unauthorized catalogues, initialization/core/sample separation, stale selection, checksum and compatibility rejection, execution retry, history projection, narrow and keyboard use, backend unavailability, and removal of the project presentation extension.',
        },
      ],
      searchText:
        'Imports and Exports Workspace Review immutable data releases, validation, installation, history, security, responsive behavior, and the fail-closed export boundary. # Imports and Exports Workspace\n\n## Purpose and ownership\n\nAxis gives authorized employees a responsive workspace for Nodics data\noperations. It is a client of the `import` module and does not discover files,\ncalculate installation state, sequence imports, write a database, or retain a\nbrowser-side audit authority.\n\nBackOffice contributes **Operations and Integration → Imports and Exports** at\n`/operations/imports-exports`. Axis renders it only when authenticated\nnavigation contains that entry.\n\n## Frontend organization\n\n- `src/operations/importExport/ImportExportRoutePage.tsx` owns presentation and\n  short-lived selection.\n- `src/operations/importExport/api/dataReleaseContracts.ts` owns bounded client\n  types.\n- `src/operations/importExport/api/dataReleaseClient.ts` owns authenticated\n  transport and defensive parsing.\n- Tests mirror this hierarchy under `test/operations/importExport`.\n\nTanStack Query owns catalogue server state. The browser sends selected module\ncodes and reviewed versions; Nodics re-discovers and validates the authority\nbefore doing work.\n\n## Employee workflow\n\nChoose Initialization, Core, or Sample data; review friendly module names,\ndescriptions, versions, and states; select releases; validate; then install or\nupdate when authorized. Controls stack on narrow screens, remain keyboard\noperable, and have assistive labels.\n\n## Security, failure, and extension\n\nThe in-memory employee token is sent only to the selected `import` connection\nwith enterprise context. Axis never infers authorization from a visible button.\nUnknown states and incompatible responses are rejected. Timeouts, authorization\nfailures, disabled policy, integrity failures, and stale selections are shown\nwithout backend stacks or diagnostics.\n\nExisting installations may enter this workspace with the historical\n`import.core.run` administrator permission so they can install the new\nfine-grained permission data. Nodics still enforces a separate type-specific\npermission for each execution.\n\nExport remains unavailable because backend export providers are fail-closed.\nAxis must not enable a placeholder or simulate export.\n\nExtend presentation inside this feature and reuse shell and API patterns. Never\nadd an Axis filesystem picker or importer. Run `npm run verify` and validate\ndesktop, touch, narrow viewport, keyboard, unauthorized, unavailable-module,\nvalidation, execution, recovery, integration, and regression behavior.\n\n## Customize and extend safely\n\nAdd project-specific release filters, explanatory CMS copy, or result\npresentation through focused Axis components while continuing to call the\nNodics nImport catalogue, preflight, execution, and history contracts. New\nimport or export formats, release discovery, sequencing, persistence, and\nprovider behavior belong in later backend modules behind the provider-neutral\ndata contracts.\n\nDo not add a browser filesystem picker, inspect sibling repositories, submit\narbitrary server paths, calculate installation state locally, or enable export\nbefore its backend contract is active. Test authorized and unauthorized\ncatalogues, initialization/core/sample separation, stale selection, checksum\nand compatibility rejection, execution retry, history projection, narrow and\nkeyboard use, backend unavailability, and removal of the project presentation\nextension.\n',
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/imports-and-exports.md',
        evidence: 'docs/imports-and-exports.md',
        hash: '6a3ab7466569cb8e56246eaf5a1af22e52e8a0713ab6d5c3b5aba63dac275a5d',
        version: '0.3.3',
      },
      previous: {
        title: 'Module Health',
        route: '/docs/nodics-axis/module-health',
      },
      next: {
        title: 'Axis Feature Delivery Checklist',
        route: '/docs/nodics-axis/feature-delivery',
      },
    },
    active: true,
  },
  record12: {
    code: 'axisDocsComponentfeaturedelivery',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.feature-delivery',
      title: 'Axis Feature Delivery Checklist',
      route: '/docs/nodics-axis/feature-delivery',
      section: 'contribute-to-axis',
      sectionTitle: 'Contribute to Axis',
      category: 'Contribute to Axis',
      audience: ['developer', 'architect', 'framework-maintainer', 'ai-tool'],
      summary:
        'Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates.',
      headings: [
        {
          text: '1. Repository boundary',
          anchor: 'feature-delivery-1-1-repository-boundary',
          level: 2,
        },
        {
          text: '2. Reuse and dependency check',
          anchor: 'feature-delivery-2-2-reuse-and-dependency-check',
          level: 2,
        },
        {
          text: '3. Security and privacy',
          anchor: 'feature-delivery-3-3-security-and-privacy',
          level: 2,
        },
        {
          text: '4. Interaction quality',
          anchor: 'feature-delivery-4-4-interaction-quality',
          level: 2,
        },
        {
          text: '5. Contract tests',
          anchor: 'feature-delivery-5-5-contract-tests',
          level: 2,
        },
        {
          text: '6. Documentation placement',
          anchor: 'feature-delivery-6-6-documentation-placement',
          level: 2,
        },
        {
          text: '7. Partial-discovery and use-case proof',
          anchor: 'feature-delivery-7-7-partial-discovery-and-use-case-proof',
          level: 2,
        },
        {
          text: '8. Completion evidence',
          anchor: 'feature-delivery-8-8-completion-evidence',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'feature-delivery-9-customize-and-extend-safely',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Use this checklist for every implemented Axis feature. Complete the ownership analysis before changing source and retain evidence in the pull request or delivery record.',
        },
        {
          kind: 'heading',
          level: 2,
          text: '1. Repository boundary',
          anchor: 'feature-delivery-1-1-repository-boundary',
        },
        {
          kind: 'paragraph',
          text: 'Record:',
        },
        {
          kind: 'unordered-list',
          items: [
            'the authoritative Nodics module and backend contract;',
            'the Axis route, feature, or component that consumes it;',
            'the contract version or supported range;',
            'the authentication and authorization boundary;',
            'the tenant, enterprise, application, Site, Store, locale, channel, and module context involved;',
            'backend changes required in `nodics`, if any;',
            'Axis changes required in this repository;',
            'documentation and tests owned by each repository.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Stop when ownership is ambiguous. Do not move backend business behavior into Axis to avoid defining a backend contract.',
        },
        {
          kind: 'heading',
          level: 2,
          text: '2. Reuse and dependency check',
          anchor: 'feature-delivery-2-2-reuse-and-dependency-check',
        },
        {
          kind: 'paragraph',
          text: 'Confirm:',
        },
        {
          kind: 'unordered-list',
          items: [
            'an existing Axis component, hook, client, state pattern, or test utility was considered first;',
            'an existing Nodics API, schema, permission, workflow, publishing, cache, search, import, or export authority is reused;',
            'no second registry, loader, schema authority, workflow engine, publisher, context authority, or provider integration is introduced;',
            'any new dependency has documented bundle, maintenance, security, accessibility, browser, WebView, and licensing impact.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: '3. Security and privacy',
          anchor: 'feature-delivery-3-3-security-and-privacy',
        },
        {
          kind: 'paragraph',
          text: 'Confirm:',
        },
        {
          kind: 'unordered-list',
          items: [
            'target modules independently authorize every request;',
            'UI filtering is not treated as authorization;',
            'passwords, access tokens, refresh tokens, cookies, internal credentials, and secrets are absent from browser storage, URLs, logs, and telemetry;',
            'errors and telemetry contain safe correlation data without sensitive payloads;',
            'query keys and caches cannot cross users or validated contexts;',
            'logout, revocation, and context switching cancel requests and clear affected data;',
            'CMS or another module cannot supply executable browser code.',
            'configurable business-facing labels, help text, placeholders, empty states, action captions, and content fragments come from typed CMS properties rather than renderer literals;',
            'domain errors retain stable backend codes and safe messages, while generic Axis fallbacks are limited to browser and transport failures;',
            'locale, direction, translated text expansion, and locale-aware formatting are covered without creating a second translation authority in Axis;',
            'arbitrary HTML, CSS, JavaScript, expressions, event handlers, and remote renderer imports are rejected.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: '4. Interaction quality',
          anchor: 'feature-delivery-4-4-interaction-quality',
        },
        {
          kind: 'paragraph',
          text: 'Implement and verify applicable:',
        },
        {
          kind: 'unordered-list',
          items: [
            'loading, success, empty, unavailable, unauthorized, incompatible, validation, conflict, partial-failure, and recovery states;',
            'keyboard operation and visible focus;',
            'screen-reader names, roles, states, and announcements;',
            'responsive desktop, tablet, and mobile WebView layouts;',
            'long translated labels, right-to-left direction, locale fallback, and locale-aware dates, numbers, currency, and pluralization where applicable;',
            'touch target sizing and non-hover alternatives;',
            'reduced motion;',
            'comfortable and compact density;',
            'light and dark token compatibility;',
            'safe cancellation and stale-response prevention.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: '5. Contract tests',
          anchor: 'feature-delivery-5-5-contract-tests',
        },
        {
          kind: 'paragraph',
          text: 'Cover applicable:',
        },
        {
          kind: 'unordered-list',
          items: [
            'positive behavior;',
            'invalid input and malformed response;',
            'permission and cross-tenant denial;',
            'minimum, maximum, empty, timeout, and payload boundaries;',
            'supported, degraded, incompatible, missing, and unknown contract versions;',
            'cancellation, retry, idempotency, and concurrency;',
            'backend outage and recovery;',
            'responsive and accessibility behavior;',
            'integration with `monoServer` and later distributed module topology;',
            'regression of the static recovery shell.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'UI tests prove client behavior only. Backend authorization, validation, persistence, workflow, publication, and integration tests belong in `nodics`.',
        },
        {
          kind: 'heading',
          level: 2,
          text: '6. Documentation placement',
          anchor: 'feature-delivery-6-6-documentation-placement',
        },
        {
          kind: 'paragraph',
          text: 'Update this repository for implemented:',
        },
        {
          kind: 'unordered-list',
          items: [
            'installation, build, start, and deployment behavior;',
            'runtime configuration consumed by Axis;',
            'frontend architecture and contribution rules;',
            'browser routes, interaction, accessibility, responsive behavior, and troubleshooting;',
            'frontend verification commands.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Update `nodics` for implemented:',
        },
        {
          kind: 'unordered-list',
          items: [
            'business-user and administrator journeys;',
            'backend architecture, configuration, permissions, APIs, schemas, workflows, publication, integration, security, and operations;',
            'customization and override guidance;',
            'backend tests and deployment evidence.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Keep proposals, unresolved decisions, and future action lists only in the temporary ignored planning workspace. Do not document planned UI as available product behavior.',
        },
        {
          kind: 'heading',
          level: 2,
          text: '7. Partial-discovery and use-case proof',
          anchor: 'feature-delivery-7-7-partial-discovery-and-use-case-proof',
        },
        {
          kind: 'paragraph',
          text: 'Confirm that a contributor or AI tool opening only the nearest maintained files can identify:',
        },
        {
          kind: 'unordered-list',
          items: [
            'whether behavior belongs in Axis or Nodics;',
            'the owning feature, route, component, hook, client, contract, and test;',
            'the supported extension point and prohibited bypass;',
            'backend authority and permission expectations;',
            'accessibility, responsive, WebView, security, and recovery requirements;',
            'the focused verification command.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Document successful, unauthorized/invalid, boundary/responsive, failure/recovery, and supported customization examples with expected outcomes. Link Nodics-owned business and backend guidance rather than copying it into Axis.',
        },
        {
          kind: 'heading',
          level: 2,
          text: '8. Completion evidence',
          anchor: 'feature-delivery-8-8-completion-evidence',
        },
        {
          kind: 'paragraph',
          text: 'Before marking the feature complete:',
        },
        {
          kind: 'unordered-list',
          items: [
            'link the implemented source and contract;',
            'link focused test evidence;',
            'link permanent documentation for every applicable audience;',
            'explain any audience or operational layer that is not applicable;',
            'run `npm run verify`;',
            'record known limitations and safe fallback behavior;',
            'confirm the action-plan status reflects repository and test evidence.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'feature-delivery-9-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'For every delivered feature, name the later project-owned page, component, renderer, typed client, hook, configuration, or style extension point. Include the smallest working file map and example, the backend contract that remains authoritative, prohibited browser-side shortcuts, upgrade and rollback impact, and the focused positive, rejected, boundary, integration, regression, and production-build tests.',
        },
        {
          kind: 'paragraph',
          text: 'A checklist that records only the shipped OOTB behavior is incomplete. If no safe extension point exists, record that limitation explicitly rather than suggesting that a framework file should be edited.',
        },
      ],
      searchText:
        'Axis Feature Delivery Checklist Apply repository-boundary, reuse, security, interaction, contract-testing, documentation, partial-discovery, and completion gates. # Axis Feature Delivery Checklist\n\nUse this checklist for every implemented Axis feature. Complete the ownership\nanalysis before changing source and retain evidence in the pull request or\ndelivery record.\n\n## 1. Repository boundary\n\nRecord:\n\n- the authoritative Nodics module and backend contract;\n- the Axis route, feature, or component that consumes it;\n- the contract version or supported range;\n- the authentication and authorization boundary;\n- the tenant, enterprise, application, Site, Store, locale, channel, and module\n  context involved;\n- backend changes required in `nodics`, if any;\n- Axis changes required in this repository;\n- documentation and tests owned by each repository.\n\nStop when ownership is ambiguous. Do not move backend business behavior into\nAxis to avoid defining a backend contract.\n\n## 2. Reuse and dependency check\n\nConfirm:\n\n- an existing Axis component, hook, client, state pattern, or test utility was\n  considered first;\n- an existing Nodics API, schema, permission, workflow, publishing, cache,\n  search, import, or export authority is reused;\n- no second registry, loader, schema authority, workflow engine, publisher,\n  context authority, or provider integration is introduced;\n- any new dependency has documented bundle, maintenance, security,\n  accessibility, browser, WebView, and licensing impact.\n\n## 3. Security and privacy\n\nConfirm:\n\n- target modules independently authorize every request;\n- UI filtering is not treated as authorization;\n- passwords, access tokens, refresh tokens, cookies, internal credentials, and\n  secrets are absent from browser storage, URLs, logs, and telemetry;\n- errors and telemetry contain safe correlation data without sensitive\n  payloads;\n- query keys and caches cannot cross users or validated contexts;\n- logout, revocation, and context switching cancel requests and clear affected\n  data;\n- CMS or another module cannot supply executable browser code.\n- configurable business-facing labels, help text, placeholders, empty states,\n  action captions, and content fragments come from typed CMS properties rather\n  than renderer literals;\n- domain errors retain stable backend codes and safe messages, while generic\n  Axis fallbacks are limited to browser and transport failures;\n- locale, direction, translated text expansion, and locale-aware formatting\n  are covered without creating a second translation authority in Axis;\n- arbitrary HTML, CSS, JavaScript, expressions, event handlers, and remote\n  renderer imports are rejected.\n\n## 4. Interaction quality\n\nImplement and verify applicable:\n\n- loading, success, empty, unavailable, unauthorized, incompatible, validation,\n  conflict, partial-failure, and recovery states;\n- keyboard operation and visible focus;\n- screen-reader names, roles, states, and announcements;\n- responsive desktop, tablet, and mobile WebView layouts;\n- long translated labels, right-to-left direction, locale fallback, and\n  locale-aware dates, numbers, currency, and pluralization where applicable;\n- touch target sizing and non-hover alternatives;\n- reduced motion;\n- comfortable and compact density;\n- light and dark token compatibility;\n- safe cancellation and stale-response prevention.\n\n## 5. Contract tests\n\nCover applicable:\n\n- positive behavior;\n- invalid input and malformed response;\n- permission and cross-tenant denial;\n- minimum, maximum, empty, timeout, and payload boundaries;\n- supported, degraded, incompatible, missing, and unknown contract versions;\n- cancellation, retry, idempotency, and concurrency;\n- backend outage and recovery;\n- responsive and accessibility behavior;\n- integration with `monoServer` and later distributed module topology;\n- regression of the static recovery shell.\n\nUI tests prove client behavior only. Backend authorization, validation,\npersistence, workflow, publication, and integration tests belong in `nodics`.\n\n## 6. Documentation placement\n\nUpdate this repository for implemented:\n\n- installation, build, start, and deployment behavior;\n- runtime configuration consumed by Axis;\n- frontend architecture and contribution rules;\n- browser routes, interaction, accessibility, responsive behavior, and\n  troubleshooting;\n- frontend verification commands.\n\nUpdate `nodics` for implemented:\n\n- business-user and administrator journeys;\n- backend architecture, configuration, permissions, APIs, schemas, workflows,\n  publication, integration, security, and operations;\n- customization and override guidance;\n- backend tests and deployment evidence.\n\nKeep proposals, unresolved decisions, and future action lists only in the\ntemporary ignored planning workspace. Do not document planned UI as available\nproduct behavior.\n\n## 7. Partial-discovery and use-case proof\n\nConfirm that a contributor or AI tool opening only the nearest maintained files\ncan identify:\n\n- whether behavior belongs in Axis or Nodics;\n- the owning feature, route, component, hook, client, contract, and test;\n- the supported extension point and prohibited bypass;\n- backend authority and permission expectations;\n- accessibility, responsive, WebView, security, and recovery requirements;\n- the focused verification command.\n\nDocument successful, unauthorized/invalid, boundary/responsive,\nfailure/recovery, and supported customization examples with expected outcomes.\nLink Nodics-owned business and backend guidance rather than copying it into\nAxis.\n\n## 8. Completion evidence\n\nBefore marking the feature complete:\n\n- link the implemented source and contract;\n- link focused test evidence;\n- link permanent documentation for every applicable audience;\n- explain any audience or operational layer that is not applicable;\n- run `npm run verify`;\n- record known limitations and safe fallback behavior;\n- confirm the action-plan status reflects repository and test evidence.\n\n## Customize and extend safely\n\nFor every delivered feature, name the later project-owned page, component,\nrenderer, typed client, hook, configuration, or style extension point. Include\nthe smallest working file map and example, the backend contract that remains\nauthoritative, prohibited browser-side shortcuts, upgrade and rollback impact,\nand the focused positive, rejected, boundary, integration, regression, and\nproduction-build tests.\n\nA checklist that records only the shipped OOTB behavior is incomplete. If no\nsafe extension point exists, record that limitation explicitly rather than\nsuggesting that a framework file should be edited.\n',
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/feature-delivery-checklist.md',
        evidence: 'docs/feature-delivery-checklist.md',
        hash: 'd5375ac3b2b89ea80a08dc6b71adaf867f80e783ed63781ac085cbc86078eff1',
        version: '0.3.3',
      },
      previous: {
        title: 'Imports and Exports Workspace',
        route: '/docs/nodics-axis/imports-exports',
      },
      next: {
        title: 'Axis Implementation and Documentation Contract',
        route: '/docs/nodics-axis/implementation-contract',
      },
    },
    active: true,
  },
  record13: {
    code: 'axisDocsComponentimplementationcontract',
    typeCode: 'axisDocumentationArticleComponentType',
    renderer: 'documentation.component.article',
    accessMode: 'AUTHENTICATED',
    properties: {
      code: 'axis.implementation-contract',
      title: 'Axis Implementation and Documentation Contract',
      route: '/docs/nodics-axis/implementation-contract',
      section: 'contribute-to-axis',
      sectionTitle: 'Contribute to Axis',
      category: 'Contribute to Axis',
      audience: ['developer', 'architect', 'framework-maintainer', 'ai-tool'],
      summary:
        'Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts.',
      headings: [
        {
          text: 'Local Discovery Chain',
          anchor: 'implementation-contract-1-local-discovery-chain',
          level: 2,
        },
        {
          text: 'Repository Ownership',
          anchor: 'implementation-contract-2-repository-ownership',
          level: 2,
        },
        {
          text: 'Placement Rules',
          anchor: 'implementation-contract-3-placement-rules',
          level: 2,
        },
        {
          text: 'Required Feature Documentation',
          anchor: 'implementation-contract-4-required-feature-documentation',
          level: 2,
        },
        {
          text: 'Customize and extend safely',
          anchor: 'implementation-contract-5-customize-and-extend-safely',
          level: 2,
        },
        {
          text: 'Canonical Source and Generated Data',
          anchor: 'implementation-contract-6-canonical-source-and-generated-data',
          level: 2,
        },
        {
          text: 'Required Examples',
          anchor: 'implementation-contract-7-required-examples',
          level: 2,
        },
        {
          text: 'Successful',
          anchor: 'implementation-contract-8-successful',
          level: 3,
        },
        {
          text: 'Unauthorized',
          anchor: 'implementation-contract-9-unauthorized',
          level: 3,
        },
        {
          text: 'Boundary',
          anchor: 'implementation-contract-10-boundary',
          level: 3,
        },
        {
          text: 'Failure And Recovery',
          anchor: 'implementation-contract-11-failure-and-recovery',
          level: 3,
        },
        {
          text: 'Customization',
          anchor: 'implementation-contract-12-customization',
          level: 3,
        },
        {
          text: 'Acceptance',
          anchor: 'implementation-contract-13-acceptance',
          level: 2,
        },
        {
          text: 'Continue',
          anchor: 'implementation-contract-14-continue',
          level: 2,
        },
      ],
      blocks: [
        {
          kind: 'paragraph',
          text: 'Axis is a reusable frontend framework application, not a one-off admin screen. Partners, developers, and AI tools must be able to extend it without seeing the entire repository or moving backend authority into the browser.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Local Discovery Chain',
          anchor: 'implementation-contract-1-local-discovery-chain',
        },
        {
          kind: 'paragraph',
          text: 'For every feature, read:',
        },
        {
          kind: 'ordered-list',
          items: [
            'root `AGENTS.md`;',
            'this contract and the feature-delivery checklist;',
            'the nearest feature source and focused tests;',
            'the consuming Nodics API/OpenAPI/CMS contract;',
            'the feature guide linked from the root README.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Critical rules must be repeated concisely near the implementation and protected by TypeScript, schema validation, linting, or focused tests. A conversation or temporary plan is never an implementation authority.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Repository Ownership',
          anchor: 'implementation-contract-2-repository-ownership',
        },
        {
          kind: 'paragraph',
          text: 'Axis owns:',
        },
        {
          kind: 'unordered-list',
          items: [
            'rendering, interaction, responsive/WebView behavior, and accessibility;',
            'typed client contract consumption;',
            'browser routing and presentation state;',
            'TanStack Query server-state coordination;',
            'Axis-owned CMS renderer implementations and typed registries;',
            'loading, empty, unauthorized, incompatible, failure, and recovery views.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Nodics owns:',
        },
        {
          kind: 'unordered-list',
          items: [
            'business rules and authoritative validation;',
            'authentication and authorization enforcement;',
            'persistence, workflows, pipelines, events, jobs, and integrations;',
            'secrets, tenant governance, AI execution, tool execution, and audit;',
            'backend schemas, APIs, configuration, runtime contracts, and business docs.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'When both repositories change, analyze and test each boundary separately.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Placement Rules',
          anchor: 'implementation-contract-3-placement-rules',
        },
        {
          kind: 'unordered-list',
          items: [
            'Application composition belongs under `src/app`.',
            'Feature interaction belongs in a named feature boundary, not a generic utilities folder.',
            'CMS page, template, and component renderers follow the paths defined in `AGENTS.md`, with one renderer implementation per file.',
            'Backend logical keys map through typed registries. CMS data never supplies executable JavaScript.',
            'Configurable page copy comes from CMS component properties. Page and component renderers consume typed labels, headings, placeholders, help text, empty-state text, action captions, and fragments rather than defining business-facing copy in JSX.',
            'Error ownership remains layered: the owning backend module supplies stable domain codes and safe messages, CMS supplies configurable presentation copy, and Axis supplies only generic browser or transport fallbacks needed when the backend is unavailable. Axis never interprets English error text.',
            'Locale, channel, and backend-resolved fallback are part of the CMS delivery contract. Axis preserves that context, supports translated text expansion and text direction, and uses locale-aware formatting without creating a parallel backend translation catalogue.',
            'Runtime values come from validated Axis configuration and backend contracts. They do not belong in scattered constants or `package.json`.',
            'Raw identifiers remain separate from display labels. Humanization is a presentation fallback after contract validation, never a transformation of request, authorization, cache, storage, audit, or telemetry identity. A backend-provided localized display name always takes precedence.',
            'Secrets never belong in frontend source, `.env`, generated browser config, storage, URLs, telemetry, or logs.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Required Feature Documentation',
          anchor: 'implementation-contract-4-required-feature-documentation',
        },
        {
          kind: 'paragraph',
          text: 'Every significant feature guide explains:',
        },
        {
          kind: 'unordered-list',
          items: [
            'purpose and current implemented scope;',
            'backend authority and contract version;',
            'source/component/client/test map;',
            'setup and runtime configuration;',
            'permissions and security;',
            'keyboard, screen reader, responsive, touch, reduced-motion, and WebView behavior;',
            'success, unauthorized/invalid, boundary/responsive, failure/recovery, and supported customization examples;',
            'troubleshooting and verification;',
            'known limitations and safe fallback.',
          ],
        },
        {
          kind: 'paragraph',
          text: 'Business workflows and backend customization belong in Nodics documentation. Axis guides link to them and focus on frontend setup and contribution.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Customize and extend safely',
          anchor: 'implementation-contract-5-customize-and-extend-safely',
        },
        {
          kind: 'paragraph',
          text: 'Every feature guide includes this section. It shows the smallest supported project-owned Axis customization, identifies the backend contract and security boundary that remain authoritative, lists prohibited frontend shortcuts or parallel authorities, and names the focused positive, rejected, boundary, integration, and regression tests. Explaining only the out-of-the-box screen or workflow is incomplete.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Canonical Source and Generated Data',
          anchor: 'implementation-contract-6-canonical-source-and-generated-data',
        },
        {
          kind: 'paragraph',
          text: 'Axis documentation is authored as granular, reviewable pages under `source/documentation`. The deterministic documentation generator creates CMS page, component, navigation, route, search, and immutable manifest data under `data/core` and `manifest/docs-content-pack.json`.',
        },
        {
          kind: 'paragraph',
          text: 'Do not hand-edit generated CMS article records. Do not maintain a shorter generated summary beside a richer project guide. Every implemented feature must update its canonical source page and regenerate the content pack in the same change:',
        },
        {
          kind: 'code',
          language: 'bash',
          text: 'npm run docs:generate\nnpm run docs:check',
        },
        {
          kind: 'paragraph',
          text: 'The migration register records the original README/docs evidence, canonical source, destination route, source hash, headings, word count, and disposition. README or legacy docs may be reduced only after all substantive guidance is mapped, generated, reviewed in Axis, and protected by content-preservation tests.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Required Examples',
          anchor: 'implementation-contract-7-required-examples',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'Successful',
          anchor: 'implementation-contract-8-successful',
        },
        {
          kind: 'paragraph',
          text: 'An authorized employee loads a backend descriptor, Axis validates it, maps its renderer key to an Axis-owned component, and displays the result.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'Unauthorized',
          anchor: 'implementation-contract-9-unauthorized',
        },
        {
          kind: 'paragraph',
          text: 'The backend denies an operation. Axis presents an accessible unauthorized state and does not infer authorization from menu visibility.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'Boundary',
          anchor: 'implementation-contract-10-boundary',
        },
        {
          kind: 'paragraph',
          text: 'The same feature remains usable with keyboard and touch in desktop, tablet, and mobile WebView layouts, including long labels, empty data, and bounded payloads.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'Failure And Recovery',
          anchor: 'implementation-contract-11-failure-and-recovery',
        },
        {
          kind: 'paragraph',
          text: 'When BackOffice or a target module is unavailable, Axis presents a safe recovery state, avoids stale privileged data, and retries through the same authoritative contract.',
        },
        {
          kind: 'heading',
          level: 3,
          text: 'Customization',
          anchor: 'implementation-contract-12-customization',
        },
        {
          kind: 'paragraph',
          text: 'A partner adds an Axis-owned renderer and registry manifest for a backend logical component key. The partner does not download code from CMS or add business validation to the renderer.',
        },
        {
          kind: 'paragraph',
          text: "An administrator changes a component label or locale-specific content in the authoritative CMS catalog. The same allowlisted Axis renderer displays the resolved value without a frontend rebuild. Missing or malformed required properties produce the renderer's safe generic fallback and never execute backend-supplied markup or code.",
        },
        {
          kind: 'paragraph',
          text: 'A validated fallback identifier such as `axisContentCatalog` may be displayed as `Axis Content Catalog`. The raw code remains unchanged wherever identity or backend communication is involved.',
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Acceptance',
          anchor: 'implementation-contract-13-acceptance',
        },
        {
          kind: 'paragraph',
          text: 'A feature is complete only when:',
        },
        {
          kind: 'unordered-list',
          items: [
            'repository ownership is explicit;',
            'the backend contract and security boundary are preserved;',
            'strict TypeScript and validation cover external data;',
            'accessibility and responsive states are implemented;',
            'focused positive, negative, boundary, failure, integration, and regression tests pass;',
            'implemented documentation and known limitations are current;',
            '`npm run verify` passes at the release-oriented gate.',
          ],
        },
        {
          kind: 'heading',
          level: 2,
          text: 'Continue',
          anchor: 'implementation-contract-14-continue',
        },
        {
          kind: 'unordered-list',
          items: [
            '[Feature Delivery Checklist](/docs/nodics-axis/feature-delivery)',
            '[Architecture And Ownership](/docs/nodics-axis/architecture)',
            '[CMS Delivery And Renderers](/docs/nodics-axis/cms-renderers)',
            '[Axis README](/docs/nodics-axis)',
          ],
        },
      ],
      searchText:
        "Axis Implementation and Documentation Contract Follow local discovery, repository ownership, placement, documentation, required scenarios, customization, and acceptance contracts. # Axis Implementation And Documentation Contract\n\nAxis is a reusable frontend framework application, not a one-off admin screen.\nPartners, developers, and AI tools must be able to extend it without seeing the\nentire repository or moving backend authority into the browser.\n\n## Local Discovery Chain\n\nFor every feature, read:\n\n1. root `AGENTS.md`;\n2. this contract and the feature-delivery checklist;\n3. the nearest feature source and focused tests;\n4. the consuming Nodics API/OpenAPI/CMS contract;\n5. the feature guide linked from the root README.\n\nCritical rules must be repeated concisely near the implementation and protected\nby TypeScript, schema validation, linting, or focused tests. A conversation or\ntemporary plan is never an implementation authority.\n\n## Repository Ownership\n\nAxis owns:\n\n- rendering, interaction, responsive/WebView behavior, and accessibility;\n- typed client contract consumption;\n- browser routing and presentation state;\n- TanStack Query server-state coordination;\n- Axis-owned CMS renderer implementations and typed registries;\n- loading, empty, unauthorized, incompatible, failure, and recovery views.\n\nNodics owns:\n\n- business rules and authoritative validation;\n- authentication and authorization enforcement;\n- persistence, workflows, pipelines, events, jobs, and integrations;\n- secrets, tenant governance, AI execution, tool execution, and audit;\n- backend schemas, APIs, configuration, runtime contracts, and business docs.\n\nWhen both repositories change, analyze and test each boundary separately.\n\n## Placement Rules\n\n- Application composition belongs under `src/app`.\n- Feature interaction belongs in a named feature boundary, not a generic\n  utilities folder.\n- CMS page, template, and component renderers follow the paths defined in\n  `AGENTS.md`, with one renderer implementation per file.\n- Backend logical keys map through typed registries. CMS data never supplies\n  executable JavaScript.\n- Configurable page copy comes from CMS component properties. Page and\n  component renderers consume typed labels, headings, placeholders, help text,\n  empty-state text, action captions, and fragments rather than defining\n  business-facing copy in JSX.\n- Error ownership remains layered: the owning backend module supplies stable\n  domain codes and safe messages, CMS supplies configurable presentation copy,\n  and Axis supplies only generic browser or transport fallbacks needed when\n  the backend is unavailable. Axis never interprets English error text.\n- Locale, channel, and backend-resolved fallback are part of the CMS delivery\n  contract. Axis preserves that context, supports translated text expansion\n  and text direction, and uses locale-aware formatting without creating a\n  parallel backend translation catalogue.\n- Runtime values come from validated Axis configuration and backend contracts.\n  They do not belong in scattered constants or `package.json`.\n- Raw identifiers remain separate from display labels. Humanization is a\n  presentation fallback after contract validation, never a transformation of\n  request, authorization, cache, storage, audit, or telemetry identity. A\n  backend-provided localized display name always takes precedence.\n- Secrets never belong in frontend source, `.env`, generated browser config,\n  storage, URLs, telemetry, or logs.\n\n## Required Feature Documentation\n\nEvery significant feature guide explains:\n\n- purpose and current implemented scope;\n- backend authority and contract version;\n- source/component/client/test map;\n- setup and runtime configuration;\n- permissions and security;\n- keyboard, screen reader, responsive, touch, reduced-motion, and WebView\n  behavior;\n- success, unauthorized/invalid, boundary/responsive, failure/recovery, and\n  supported customization examples;\n- troubleshooting and verification;\n- known limitations and safe fallback.\n\nBusiness workflows and backend customization belong in Nodics documentation.\nAxis guides link to them and focus on frontend setup and contribution.\n\n## Customize and extend safely\n\nEvery feature guide includes this section. It\nshows the smallest supported project-owned Axis customization, identifies the\nbackend contract and security boundary that remain authoritative, lists\nprohibited frontend shortcuts or parallel authorities, and names the focused\npositive, rejected, boundary, integration, and regression tests. Explaining\nonly the out-of-the-box screen or workflow is incomplete.\n\n## Canonical Source and Generated Data\n\nAxis documentation is authored as granular, reviewable pages under\n`source/documentation`. The deterministic documentation generator creates CMS\npage, component, navigation, route, search, and immutable manifest data under\n`data/core` and `manifest/docs-content-pack.json`.\n\nDo not hand-edit generated CMS article records. Do not maintain a shorter\ngenerated summary beside a richer project guide. Every implemented feature\nmust update its canonical source page and regenerate the content pack in the\nsame change:\n\n```bash\nnpm run docs:generate\nnpm run docs:check\n```\n\nThe migration register records the original README/docs evidence, canonical\nsource, destination route, source hash, headings, word count, and disposition.\nREADME or legacy docs may be reduced only after all substantive guidance is\nmapped, generated, reviewed in Axis, and protected by content-preservation\ntests.\n\n## Required Examples\n\n### Successful\n\nAn authorized employee loads a backend descriptor, Axis validates it, maps its\nrenderer key to an Axis-owned component, and displays the result.\n\n### Unauthorized\n\nThe backend denies an operation. Axis presents an accessible unauthorized state\nand does not infer authorization from menu visibility.\n\n### Boundary\n\nThe same feature remains usable with keyboard and touch in desktop, tablet, and\nmobile WebView layouts, including long labels, empty data, and bounded payloads.\n\n### Failure And Recovery\n\nWhen BackOffice or a target module is unavailable, Axis presents a safe\nrecovery state, avoids stale privileged data, and retries through the same\nauthoritative contract.\n\n### Customization\n\nA partner adds an Axis-owned renderer and registry manifest for a backend\nlogical component key. The partner does not download code from CMS or add\nbusiness validation to the renderer.\n\nAn administrator changes a component label or locale-specific content in the\nauthoritative CMS catalog. The same allowlisted Axis renderer displays the\nresolved value without a frontend rebuild. Missing or malformed required\nproperties produce the renderer's safe generic fallback and never execute\nbackend-supplied markup or code.\n\nA validated fallback identifier such as `axisContentCatalog` may be displayed\nas `Axis Content Catalog`. The raw code remains unchanged wherever identity or\nbackend communication is involved.\n\n## Acceptance\n\nA feature is complete only when:\n\n- repository ownership is explicit;\n- the backend contract and security boundary are preserved;\n- strict TypeScript and validation cover external data;\n- accessibility and responsive states are implemented;\n- focused positive, negative, boundary, failure, integration, and regression\n  tests pass;\n- implemented documentation and known limitations are current;\n- `npm run verify` passes at the release-oriented gate.\n\n## Continue\n\n- [Feature Delivery Checklist](feature-delivery-checklist.md)\n- [Architecture And Ownership](architecture-and-ownership.md)\n- [CMS Delivery And Renderers](cms-delivery-and-renderers.md)\n- [Axis README](../README.md)\n",
      source: {
        repository: 'nodicsaxis',
        path: 'source/documentation/pages/implementation-and-documentation-contract.md',
        evidence: 'docs/implementation-and-documentation-contract.md',
        hash: 'c589fc75aea4d1e56c37d2870daeb7c3cfeff49899ed24ec56cbc288f397f3f9',
        version: '0.3.3',
      },
      previous: {
        title: 'Axis Feature Delivery Checklist',
        route: '/docs/nodics-axis/feature-delivery',
      },
    },
    active: true,
  },
};
