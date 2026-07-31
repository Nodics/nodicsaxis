# Frontend Technology Stack

## Selected foundation

Nodics Axis uses one cohesive frontend application until demonstrated reuse
and stable contracts justify extracting packages.

| Concern                  | Selected technology            | Current version | Responsibility                                                                    |
| ------------------------ | ------------------------------ | --------------- | --------------------------------------------------------------------------------- |
| Package management       | npm                            | 11.6.2          | Reproducible dependency installation from `package-lock.json`                     |
| UI runtime               | React / React DOM              | 19.2.8          | Axis-owned browser rendering and interaction                                      |
| Language                 | TypeScript in strict mode      | 6.0.3           | Compile-time safety across UI and contract consumers                              |
| Build and local server   | Vite                           | 8.1.5           | Development server and immutable production assets                                |
| Client routing           | React Router                   | 8.3.0           | Static recovery routes and authorized application navigation                      |
| Server state             | TanStack Query                 | 5.101.4         | Request lifecycle, caching, cancellation, and invalidation for backend-owned data |
| Component foundation     | MUI                            | 9.2.0           | Accessible primitives and Nodics-owned tokens and components                      |
| Styling runtime          | Emotion React / Styled         | 11.14.0/11.14.1 | Material UI styling and theme-aware presentation                                  |
| Unit and component tests | Vitest / Testing Library React | 4.1.10/16.3.2   | User-observable frontend behavior and contract-consumer tests                     |
| Browser test environment | jsdom                          | 29.1.1          | Browser DOM behavior in automated tests                                           |
| Static quality           | ESLint / typescript-eslint     | 9.39.5/8.65.0   | TypeScript and React code-quality rules                                           |
| Formatting               | Prettier                       | 3.8.1           | Consistent source and documentation formatting                                    |

Supported engines and direct versions are declared in `package.json` and the
complete dependency graph is locked in `package-lock.json`. Those files remain
the dependency authority. The table is an operator-friendly snapshot and must
be updated in the same change whenever a listed package version changes.

## State ownership

- TanStack Query owns remote server state and request lifecycle.
- Presentation state stays close to the route or feature that owns it.
- Backend modules remain authoritative for persisted state, validation,
  authorization, workflows, and business outcomes.
- Axis must not create a browser store that becomes a second copy of backend
  registry, permission, workflow, publication, or tenant authority.

A dedicated global client-state dependency may be considered only when a
measured cross-feature problem cannot be handled safely by React composition,
route state, or TanStack Query.

## Styling decision

Axis uses MUI primitives, Emotion, and original Nodics design tokens. Tailwind
is not part of the selected runtime. Commercial administration templates may
inform information grouping only; their source code, components, assets,
layouts, and branding are not dependencies.

The design system must preserve keyboard operation, screen-reader support,
responsive behavior, reduced motion, mobile WebView compatibility, and the
fixed comfortable workspace density.

## Repository shape

Axis starts as one application repository with cohesive feature boundaries.
It is not a mandatory monorepo. A package may be extracted later only when:

1. two or more real consumers need the same stable capability;
2. its public contract and ownership are explicit;
3. extraction does not duplicate a Nodics backend authority;
4. independent versioning and testing provide a demonstrated benefit.

This avoids package boundaries that add governance and release overhead before
the product has stable reuse seams.

Production code belongs under `src/`. Tests belong under the root `test/`
directory and mirror the production feature boundaries, for example
`src/cms/` and `test/cms/`. Test-only fixtures belong below the matching test
feature and must not be imported by production code.
`config/typescript/tsconfig.app.json` strictly checks runtime source, while
`config/typescript/tsconfig.test.json` strictly checks the
separate test tree.

## CMS renderer organization

CMS sends composition data and logical renderer contracts; Axis owns every
executable renderer. Renderer source follows a strict, navigable hierarchy:

```text
src/cms/renderers/
├── pages/                  # one page renderer per file
├── templates/              # one template renderer per file
├── components/
│   ├── authentication/     # authentication-specific component renderers
│   ├── dashboard/          # dashboard-specific component renderers
│   └── shared/             # genuinely reusable component renderers
├── registry/               # typed logical-key mappings and contract manifest
└── shared/                 # renderer-only types, guards, and property readers
```

Do not add a generic file containing multiple unrelated renderer
implementations. A new CMS renderer requires:

1. one focused renderer file in the correct capability directory;
2. one typed registry mapping from the backend logical key;
3. one renderer-manifest entry declaring kind and supported contract version;
4. focused tests in the mirrored `test/cms/renderers` hierarchy; and
5. safe failure for unknown keys, incompatible versions, or invalid properties.

Reusable renderers are grouped by capability rather than copied into every
page. Page-specific placement is reserved for a renderer contract deliberately
owned by only that page. Backend data must never contain a TypeScript import,
React component name, executable file path, script URL, or HTML implementation.

Reusable interaction patterns follow the same rule. A capability such as
schema query building, record filtering, media selection, relationship
selection, or any later business-data picker should be implemented once as a
generic Axis-owned component or CMS component renderer and then composed by
pages that need it. For example, the Schema Query Builder is a shared
workbench capability: Schema Workbench, Imports and Exports, and future
schema-backed pages should reuse the same implementation instead of creating
separate query widgets.

The content catalog may declare that a generic component is needed and may
provide labels, placeholders, help text, default presentation options, and a
logical renderer key. It must not become the query authority. Searchable
fields, filter operators, sort rules, page-size limits, authorization, and
execution remain backend-owned contracts delivered by the relevant Nodics
module. Axis owns the executable renderer and keeps it safe, typed,
localized, responsive, and reusable.

## Dependency decision rule

Before adding a frontend dependency:

1. reuse an installed capability when it satisfies the requirement;
2. compose or extend an existing Axis pattern when safe;
3. document why the current stack cannot provide the capability;
4. review bundle, security, maintenance, accessibility, browser, WebView, and
   licensing impact;
5. add focused tests and update this decision when the architectural stack
   changes.

Axis must not add a dependency that executes backend business processes,
stores secrets, downloads executable CMS code, or creates an alternate
contract authority.

## Customize and extend safely

Extend the stack through a focused project-owned feature directory, existing
React and TypeScript composition, shared theme tokens, a typed backend client,
and mirrored tests. Prefer an installed dependency or existing pattern; when a
new package is necessary, document its exact supported version, browser and
WebView impact, bundle cost, security and licensing review, and upgrade and
removal procedure.

Do not fork the application shell, create another state or API authority,
download executable CMS code, or hide business rules in components. Verify
type safety, lint and formatting, accessibility, narrow and touch layouts,
contract rejection, integration behavior, bundle output, and clean removal of
the extension.

## Verification

Use:

```bash
npm ci
npm run verify
```

The verification gate checks formatting, linting, strict TypeScript,
unit/component tests, and the production build.
