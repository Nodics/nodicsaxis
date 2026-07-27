# Nodics Axis AI Agent Contract

## Product boundary

Axis is the reusable Back Office frontend for one Nodics-based customer
project deployment. It is a separate browser application and repository from
the Nodics backend.

- Keep authoritative business logic, persistence, authentication enforcement,
  authorization, workflow execution, pipelines, integrations, secrets, and
  tenant governance in backend-owned Nodics modules.
- Before implementing a feature, complete a repository-boundary analysis.
  Identify the authoritative backend behavior, Axis presentation behavior,
  shared API or schema contract, security boundary, documentation owner, and
  tests required in each repository. Stop and resolve ambiguous ownership
  before writing feature code.
- Treat Nodics OpenAPI, bootstrap, registry, schema, permission, and runtime
  contracts as authoritative.
- Do not import source from the sibling Nodics checkout.
- Do not create frontend proxies or registries that become alternate backend
  authorities.
- Do not place backend services, business rules, persistence, workflow or
  pipeline execution, integration execution, secret resolution, tenant
  governance, or authoritative validation in Axis. Client validation may
  improve interaction but never replaces backend validation.
- One Axis deployment administers exactly one customer project. Never add
  cross-project switching or endpoint federation.

## Implementation order

For each requirement:

1. reuse an existing Axis component, contract, or pattern;
2. compose or extend an existing implementation through an explicit extension
   point;
3. add a new dependency or abstraction only after checking for duplication and
   recording why existing choices are insufficient.

Capabilities are stable; implementations may evolve.

## Frontend rules

- Use strict TypeScript and avoid `any`.
- Keep server state in TanStack Query and presentation state close to the
  feature that owns it.
- Treat CMS renderer organization as a strict code-ownership contract. Keep
  page renderers under `src/cms/renderers/pages`, template renderers under
  `src/cms/renderers/templates`, and component renderers under
  `src/cms/renderers/components/<capability>`. Put only genuinely reusable
  renderers under `components/shared`.
- Maintain one exported renderer implementation per renderer file. Do not
  accumulate unrelated page, template, or component implementations in a
  generic `renderers.tsx` file and do not use a growing switch statement as
  the renderer registry.
- Map backend-owned logical renderer keys to Axis-owned implementations only
  through the typed registries under `src/cms/renderers/registry`. Every new
  renderer must declare its supported kind and contract version in the
  renderer manifest, have a registry entry, and include focused tests in the
  mirrored `test/cms/renderers` hierarchy.
- Group a renderer by its reusable capability, not merely by the first page
  that consumes it. A page-specific directory is allowed only when the
  renderer contract is intentionally exclusive to that page. Never duplicate
  a shared renderer to simplify local page imports.
- Validate deployment configuration before authentication.
- Never store passwords, access tokens, or refresh tokens in localStorage,
  sessionStorage, IndexedDB, URLs, telemetry, or logs.
- Restore employee sessions only through the Profile-owned browser-session
  contract: access tokens remain in memory, refresh credentials remain in
  Profile-scoped HttpOnly cookies, and restore/logout send the configured
  readable CSRF cookie as `X-CSRF-Token` with credentialed requests. Never add
  a frontend refresh-token store, token authority, silent credential fallback,
  wildcard origin behavior, or client-side authorization substitute.
- Do not download or execute JavaScript supplied by CMS or another module.
  Backend composition descriptors map only to Axis-owned components.
- Treat CMS-delivered component properties as the authority for configurable
  page copy: headings, labels, placeholders, help text, empty-state text,
  action captions, and content fragments. Do not hardcode business-facing copy
  in page or component renderers when the owning backend contract can supply
  it.
- Keep copy ownership explicit. Owning backend modules provide stable domain
  error codes and client-safe messages; CMS provides configurable presentation
  copy; Axis owns only generic browser/transport fallbacks that cannot come
  from an unavailable backend. Never localize by parsing English error text.
- When surfacing backend failures, accept only the bounded stable code and
  client-safe message contract. Never render backend contexts, stack traces,
  queries, record payloads, tokens, credentials, or provider diagnostics.
- Consume the locale resolved by the backend CMS contract and preserve its
  fallback result. Renderers must tolerate translated text expansion and
  locale direction, and formatting must use locale-aware browser APIs. Axis
  must not become a second translation catalogue for backend-owned content.
- Backend-driven presentation remains declarative and non-executable. Accept
  only allowlisted renderer keys, versioned typed properties, safe content,
  permissions, and configuration. Reject arbitrary HTML, CSS, JavaScript,
  component imports, expressions, event handlers, or URLs used as renderer
  implementations.
- Keep authoritative identifiers and presentation labels separate. A validated
  environment, tenant, enterprise, Site, Catalog, module, or schema code may be
  humanized only for display. Never send the humanized value in an API request,
  authorization context, query/cache key, storage key, audit event, or
  telemetry dimension. Prefer an explicit backend-provided localized display
  name when available.
- Every route and control must respect backend-provided permissions, while
  recognizing that UI filtering never replaces backend authorization.
- Functional navigation must come from the authenticated
  `backofficeCapabilities.navigation` contract. Axis may render validated
  groups, same-module hierarchy, perspectives, localization keys, context
  requirements, feature states, ordering, semantic icons, and non-executable
  badge-provider references, but must not create a second menu authority.
  Persist only bounded `moduleName:navigationId` values for favourites and
  recents; never persist routes, labels, tokens, context, records, or backend
  payloads as navigation preferences.
- Operational health views consume BackOffice's sanitized, freshness-bounded
  registered-instance projection. Axis must not poll each module independently,
  retain a browser health registry, expose raw diagnostics, or infer expected
  cluster membership from missing leases.
- Init, core, and sample operations may invoke only the secured nImport release
  catalogue, preflight, type-specific execution, and history APIs. Axis must
  not inspect module data folders, discover releases, calculate installation
  state, sequence imports, connect to a database, or become a second import
  authority. Permission or policy changes require a newly authenticated
  employee session; never silently elevate an existing token.
- Preserve responsive layout, touch behavior, keyboard operation, screen
  reader support, reduced motion, and WebView compatibility.
- Avoid a service worker until an explicit offline and administrative-cache
  security design is approved.

## Workflow and agentic design

Visual editors are clients of backend-owned definitions:

- `nPipeline` owns technical pipeline execution.
- Workflow/nbpm owns durable workflow state and execution.
- Agentic actions compose governed workflow, model, API, and tool contracts.
- MCP is a bridge over Nodics contracts, never a second authority.

Axis must not execute workflows, handlers, arbitrary scripts, AI calls, API
actions, or tools in the browser. A shared canvas may use separate adapters,
but its view model must never become an authoritative universal graph.

## Documentation and verification

Document implemented behavior in this repository. Keep unimplemented plans in
an explicitly temporary planning location until verified.

Axis features are incomplete until their project documentation covers project
purpose, supported technology and version ranges, setup/build/runtime
configuration, route/page/template/component organization, renderer placement
and registry contracts, CMS model-to-renderer mapping, backend API and security
boundaries, responsive/accessibility behavior, extension points,
troubleshooting, and verification. Keep business rules and backend authority in
Nodics documentation; Axis documents its owned presentation implementation and
links to the end-to-end capability guide.

When Axis supplies an importable documentation release, committed data belongs
under `data/core` and its manifest is
`manifest/docs-content-pack.json`. Axis may request status or an authorized
Nodics-owned import, but must not read sibling repositories, write CMS
collections, connect to a database, or become another content-pack/import
authority.

Design Axis for partial discovery. A developer or AI tool may read only this
file, the nearest feature source, its focused tests, and one linked guide.
Critical repository ownership, backend authority, renderer placement, security,
accessibility, responsive behavior, extension, and verification rules must
therefore be present in the nearest maintained files and enforced by tests
where possible. Do not leave mandatory implementation knowledge only in a prior
conversation, remote design sample, temporary plan, or backend repository.

Every significant implemented feature must document successful, unauthorized
or invalid, boundary/responsive, failure/recovery, and supported customization
use cases. Cover the frontend contributor and operator in this repository;
business-user, administrator, backend contract, and partner backend
customization guidance remains owned by Nodics and must be linked rather than
duplicated.

For each implemented behavior, cover applicable:

- positive, negative, and boundary behavior;
- contract and compatibility behavior;
- permissions and security;
- responsive and accessibility behavior;
- integration and regression behavior;
- failure, recovery, and troubleshooting.

Run `npm run verify` before release-oriented commits.
