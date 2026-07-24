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
- Do not download or execute JavaScript supplied by CMS or another module.
  Backend composition descriptors map only to Axis-owned components.
- Every route and control must respect backend-provided permissions, while
  recognizing that UI filtering never replaces backend authorization.
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

For each implemented behavior, cover applicable:

- positive, negative, and boundary behavior;
- contract and compatibility behavior;
- permissions and security;
- responsive and accessibility behavior;
- integration and regression behavior;
- failure, recovery, and troubleshooting.

Run `npm run verify` before release-oriented commits.
