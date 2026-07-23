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

## Runtime configuration

Axis loads `/axis-config.json` before rendering authenticated application
features:

```json
{
  "profileBaseUrl": "http://localhost:3000",
  "backofficeBaseUrl": "http://localhost:3000",
  "clientContractVersion": 1,
  "requestTimeoutMs": 10000
}
```

This document is deployment configuration, not a secret store. Invalid or
unavailable configuration produces a recovery screen instead of attempting
authentication.

For production, serve `axis-config.json` with `Cache-Control: no-store`. Serve
hashed assets with long-lived immutable caching.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
npm run verify
```

## Current scope

The initial scaffold proves the frontend runtime boundary and safe startup.
Authentication, Back Office bootstrap integration, CMS composition, module
features, and visual designers will be implemented as separate verified
slices.
