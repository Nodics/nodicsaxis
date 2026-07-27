# Module Health

## Purpose and ownership

Module Health gives an authorized employee a responsive view of registered
Nodics modules and runtime instances. Operators can see whether Profile, CMS,
Workflow, BackOffice, or another capability is healthy, degraded, unavailable,
or unknown and identify the registered environment, server, and node involved.

Axis does not decide health. Nodics System owns readiness and BackOffice owns
the sanitized availability observation and registry projection. Axis owns only
typed consumption, interaction, rendering, filtering, and accessible state
presentation.

Axis displays the backend-provided package label and renders the
loader-discovered parent/child hierarchy. It never sends a label or canonical
path as the operational identifier; detail, refresh, query keys, and
authorization continue using the original module name.

## Navigation and access

BackOffice contributes **Module Health** under **Operations and Integration**
through `backofficeCapabilities.backoffice.navigation`; Axis does not hardcode
the menu. It is returned only with `backoffice.registry.admin.view`.

The route is `/operations/module-health`. Employee session and screen-lock
guards protect direct navigation. Backend authorization remains mandatory.

## Frontend structure

```text
src/operations/moduleHealth/
  ModuleHealthRoutePage.tsx
  ModuleHealthTree.tsx
  api/
    moduleHealthClient.ts
    moduleHealthContracts.ts

test/operations/moduleHealth/
  api/
    moduleHealthClient.test.ts
```

Contracts reject malformed counts, identifiers, states, and freshness.
The client supplies the in-memory employee token, enterprise header, request
timeout, no-store policy, and redirect rejection. It stores no credentials and
rejects unsafe module path segments.

TanStack Query owns server state. Summary data loads once; instance details
load only for the selected module, avoiding an unbounded request per module.
Window focus and explicit actions refresh data. Axis adds no health poller.
An on-demand **Check now** action is enabled only when the selected module has
at least one client-callable runtime endpoint. Non-client modules still show
their registration heartbeat and observed state, but Axis does not request a
refresh that the backend cannot perform.

## Operator workflow

1. Open **Operations and Integration > Module Health**.
2. Review totals and module states.
3. Expand or collapse module groups.
4. Search by label, code, canonical path, environment, server, or state.
   Matching descendants retain their ancestor chain.
5. Select a concrete module.
6. Review each registered node's heartbeat, readiness observation, state,
   freshness, and stable reason.
7. Choose **Check now** for a governed immediate observation.

Expired and intentionally deregistered nodes are not active instances. Axis
does not infer expected cluster membership from previously observed nodes.

## Responsive, accessible, and failure behavior

- Cards wrap and list/details stack on narrow screens.
- State always has text in addition to color.
- Search is visibly labelled; rows are keyboard-operable buttons.
- Loading uses announced progress and failures use alerts.
- Dates use the browser locale.
- BackOffice failure never falls back to invented health.
- Unauthorized access remains a backend rejection.
- Malformed responses fail closed.
- Stale evidence is `UNKNOWN`, never healthy.
- Refresh failure preserves the existing view and shows a bounded message.

## Extension rules

Partners may change styling or compose presentation around typed contracts.
They must not call databases/providers from Axis, reproduce the registry,
call every module ping as a second authority, persist access tokens or raw
diagnostics, infer configured cluster membership, or bypass permissions.
