# Axis Architecture and Ownership

## Decision

Nodics Axis is a reusable Back Office browser application deployed once for
each Nodics-based customer project. The Axis process and the Nodics backend
processes are built, started, scaled, deployed, and rolled back independently.
One Axis deployment must not switch between customer projects or federate
their backend endpoints.

This decision keeps a clear authority boundary:

- Nodics owns business rules, persistence, authentication enforcement,
  authorization, workflows, pipelines, integrations, secrets, tenant
  governance, runtime contracts, and module APIs.
- Axis owns browser rendering, interaction, accessibility, responsive
  behavior, and non-authoritative client view state.
- Profile authenticates human users.
- BackOffice returns the caller's authorized, browser-safe module registry and
  compatibility metadata.
- After bootstrap, Axis calls each authoritative module directly. BackOffice
  does not proxy normal CMS, job, workflow, configuration, or business traffic.

## Deployment model

```text
Customer project A
  Axis deployment A
    -> Profile A
    -> BackOffice A -> authorized module discovery
    -> CMS A, Workflow A, CronJob A, and other discovered modules

Customer project B
  Axis deployment B
    -> Profile B
    -> BackOffice B -> authorized module discovery
    -> project B modules
```

Axis deployment A must never discover, select, or call project B endpoints.
Whether a project's Nodics modules run together in `monoServer` or as
distributed module servers does not change the browser contract.

## Contract authority

Axis consumes versioned backend contracts such as OpenAPI, Profile
authentication, BackOffice bootstrap, permissions, schemas, and module
operation metadata. Generated or handwritten Axis clients are consumers of
those contracts; they do not become contract authorities.

Axis must not:

- import source from the sibling Nodics checkout;
- embed backend services or persistence;
- reproduce authoritative validation or permission decisions;
- execute workflows, pipelines, integrations, AI tools, or arbitrary scripts
  in the browser;
- store service or CronJob credentials;
- create a second registry, schema authority, runtime loader, or endpoint
  federation layer.

Client-side validation may improve usability, but every target module must
validate and authorize the request independently.

## Security boundary

Human browser authentication remains separate from module-to-module and
CronJob authentication. Axis may receive only browser-safe configuration,
human-session material approved by the Profile browser-security contract, and
permission-filtered module metadata. Passwords, access tokens, refresh tokens,
service credentials, and secrets must never be written to browser storage,
URLs, logs, or telemetry.

Detailed session, refresh, revocation, CORS, CSRF, CSP, and audience behavior
will be documented only after the corresponding backend contracts are
approved and implemented.

## Documentation ownership

- This repository documents Axis installation, build, deployment, frontend
  contribution rules, browser architecture, accessibility, and implemented UI
  behavior.
- The Nodics repository documents product capabilities, business-user and
  administrator journeys, backend APIs, security enforcement, module
  configuration, operations, and backend customization.
- Temporary plans describe intended work only and must not be presented as
  implemented capability.

## Verification expectations

Every Axis slice must identify:

1. its authoritative backend owner and versioned contract;
2. its Axis presentation and local-state responsibilities;
3. authentication, authorization, tenant, and data-exposure boundaries;
4. tests belonging to each repository;
5. documentation belonging to each repository.

Implementation must cover applicable positive, negative, boundary, contract,
security, responsive, accessibility, integration, recovery, and regression
behavior. Run `npm run verify` before release-oriented commits.
