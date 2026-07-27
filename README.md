# Nodics Axis

Nodics Axis is the reusable Back Office frontend for a single Nodics-based
customer project deployment.

Axis is a client-side web application. It authenticates human users through
Profile, retrieves an authorized bootstrap contract from Back Office, and then
calls the authoritative APIs of discovered Nodics modules directly.

## Boundaries

- Nodics remains the backend and API authority.
- Axis contains presentation and interaction behavior, not authoritative
  business logic.
- Every customer project has an isolated Axis deployment.
- Axis does not depend on whether Nodics runs as a monoServer or distributed
  module servers.
- CMS descriptors can select Axis-owned components but cannot deliver
  executable frontend code.

See
[Axis Architecture and Ownership](docs/architecture-and-ownership.md) for the
per-customer deployment model, repository responsibilities, contract authority,
security boundary, and verification expectations.

See [Frontend Technology Stack](docs/frontend-technology-stack.md) for the
approved tools, state ownership, styling decision, repository shape, and
dependency-governance rules.

Use the [Feature Delivery Checklist](docs/feature-delivery-checklist.md) for
repository-boundary analysis, security, contract testing, accessibility,
documentation placement, and completion evidence for every Axis slice.

Read the
[Axis Implementation And Documentation Contract](docs/implementation-and-documentation-contract.md)
for partial-discovery rules, repository placement, required use cases, and the
acceptance contract followed by human developers and AI tools.

See [CMS Delivery and Renderer Integration](docs/cms-delivery-and-renderers.md)
for the resolved-page client, trusted renderer boundary, validation rules,
cache isolation, and login integration.

See [Documentation Content In Axis](docs/documentation-content.md) for dynamic
Framework, Swaggers, Nodics Axis, and future project documentation sources;
per-product CMS catalogs; the import-ready Axis content pack; renderer
ownership; security boundaries; and failure behavior.

See [Module Health](docs/module-health.md) for backend-driven operational
navigation, the typed registry client, module and node readiness presentation,
security boundaries, responsive behavior, and extension rules.

See [Imports and Exports](docs/imports-and-exports.md) for immutable init, core,
and sample release discovery, validation, installation, history, security, and
the intentionally disabled export surface.

See [Employee Login, Recovery, Screen Lock, and Dashboard](docs/employee-login.md)
for startup discovery, employee-only authentication, persistent BackOffice
policy consumption, protected routing, logout, and failure recovery.

## Prerequisites

- Node.js 24
- npm 10 or 11
- A local Nodics backend when integration behavior is required

## Start locally

Start Nodics in a separate terminal:

```bash
cd ../nodics
npm start -- ENV=startioLocal SERVER=monoServer
```

Install and start Axis:

```bash
npm ci
npm run dev
```

Axis runs at <http://localhost:3100>.

## Environment and runtime configuration

Copy `.env.example` to `.env` and configure the local/build values there.
The repository includes a safe local `.env`; Git ignores it so each developer
or deployment can use different values.

```dotenv
AXIS_BACKOFFICE_BASE_URL=http://localhost:3000
AXIS_ENTERPRISE_CODE=default
AXIS_CLIENT_CONTRACT_VERSION=1
AXIS_REQUEST_TIMEOUT_MS=10000
AXIS_BROWSER_SESSION_CSRF_COOKIE_NAME=nodics_axis_csrf
AXIS_ASSISTANT_MAXIMUM_EVENT_BYTES=65536
AXIS_ASSISTANT_RECONNECT_WINDOW_MS=120000
AXIS_ASSISTANT_IDLE_TIMEOUT_MS=45000
AXIS_DEV_HOST=0.0.0.0
AXIS_DEV_PORT=3100
AXIS_STRICT_PORT=true
AXIS_BUILD_SOURCEMAP=true
```

Vite validates these values and generates `/axis-config.json`:

```json
{
  "backofficeBaseUrl": "http://localhost:3000",
  "enterpriseCode": "default",
  "clientContractVersion": 1,
  "requestTimeoutMs": 10000,
  "browserSessionCsrfCookieName": "nodics_axis_csrf",
  "assistantMaximumEventBytes": 65536,
  "assistantReconnectWindowMs": 120000,
  "assistantIdleTimeoutMs": 45000
}
```

Axis loads that document and then obtains the active Profile and CMS endpoints
from BackOffice's low-disclosure public bootstrap. Axis does not maintain a
second module endpoint list.
Invalid or unavailable configuration produces a recovery screen instead of
attempting authentication.

`.env` and `axis-config.json` are public configuration, not secret stores.
Never place passwords, tokens, API keys, private keys, or credentials in them.
Only explicitly named `AXIS_*` variables are consumed; Axis does not expose
arbitrary environment variables to browser code.

For production, the generated `dist/axis-config.json` may be replaced during
deployment so endpoints can change without rebuilding Axis. Serve it with
`Cache-Control: no-store`. Serve hashed assets with long-lived immutable
caching.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
```

The implemented Gold and Charcoal foundations, responsive shell, recovery
states, accessibility behavior, and extension rules are documented in
[Axis Design System And Static Shell](docs/design-system-and-shell.md).

The implemented authenticated Assistant CMS route, renderer hierarchy,
direct-module connection validation, and typed HTTP client are documented in
[Axis Assistant Frontend](docs/assistant-frontend.md).

The implemented Schema Workbench discovery, schema browser, bounded record
list, relationship editor, record detail, Create, Update, and governed Delete
are documented in
[Axis Schema Workbench](docs/schema-workbench.md).

## Current scope

The current foundation proves the frontend runtime boundary, safe startup, CMS
delivery/renderers, employee authentication, secured BackOffice bootstrap,
CMS-driven login/recovery/lock pages, idle screen locking, protected dashboard
routing, logout, the CMS-driven Assistant workspace shell, typed Assistant HTTP
contracts, authenticated resumable SSE transport, isolated Assistant
presentation state, and the CMS-driven Schema Workbench browser with
direct-module schema discovery, bounded record reads, and independent Address
and Contact creation, relationship coordination, record detail, generated
Update, and governed Delete. The Operations workspace includes Module Health
with permission-filtered navigation, module summaries, on-demand registered
node details, and governed refresh. Visual designers remain future slices.
