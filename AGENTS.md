# Nodics Axis AI Agent Contract

## Product boundary

Axis is the reusable Back Office frontend for one Nodics-based customer
project deployment. It is a separate browser application and repository from
the Nodics backend.

- Keep authoritative business logic, persistence, authentication enforcement,
  authorization, workflow execution, pipelines, integrations, secrets, and
  tenant governance in backend-owned Nodics modules.
- Treat Nodics OpenAPI, bootstrap, registry, schema, permission, and runtime
  contracts as authoritative.
- Do not import source from the sibling Nodics checkout.
- Do not create frontend proxies or registries that become alternate backend
  authorities.
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
