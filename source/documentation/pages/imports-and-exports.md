# Imports and Exports Workspace

## Purpose and ownership

Axis gives authorized employees a responsive workspace for Nodics data
operations. It is a client of the `import` module and does not discover files,
calculate installation state, sequence imports, write a database, or retain a
browser-side audit authority.

BackOffice contributes **Operations and Integration → Imports and Exports** at
`/operations/imports-exports`. Axis renders it only when authenticated
navigation contains that entry.

## Frontend organization

- `src/operations/importExport/ImportExportRoutePage.tsx` owns presentation and
  short-lived selection.
- `src/operations/importExport/api/dataReleaseContracts.ts` owns bounded client
  types.
- `src/operations/importExport/api/dataReleaseClient.ts` owns authenticated
  transport and defensive parsing.
- Tests mirror this hierarchy under `test/operations/importExport`.

TanStack Query owns catalogue server state. The browser sends selected module
codes and reviewed versions; Nodics re-discovers and validates the authority
before doing work.

## Employee workflow

Choose Initialization, Core, or Sample data; review friendly module names,
descriptions, versions, and states; select releases; validate; then install or
update when authorized. Controls stack on narrow screens, remain keyboard
operable, and have assistive labels.

## Security, failure, and extension

The in-memory employee token is sent only to the selected `import` connection
with enterprise context. Axis never infers authorization from a visible button.
Unknown states and incompatible responses are rejected. Timeouts, authorization
failures, disabled policy, integrity failures, and stale selections are shown
without backend stacks or diagnostics.

Existing installations may enter this workspace with the historical
`import.core.run` administrator permission so they can install the new
fine-grained permission data. Nodics still enforces a separate type-specific
permission for each execution.

Export remains unavailable because backend export providers are fail-closed.
Axis must not enable a placeholder or simulate export.

Extend presentation inside this feature and reuse shell and API patterns. Never
add an Axis filesystem picker or importer. Run `npm run verify` and validate
desktop, touch, narrow viewport, keyboard, unauthorized, unavailable-module,
validation, execution, recovery, integration, and regression behavior.

## Customize and extend safely

Add project-specific release filters, explanatory CMS copy, or result
presentation through focused Axis components while continuing to call the
Nodics nImport catalogue, preflight, execution, and history contracts. New
import or export formats, release discovery, sequencing, persistence, and
provider behavior belong in later backend modules behind the provider-neutral
data contracts.

Do not add a browser filesystem picker, inspect sibling repositories, submit
arbitrary server paths, calculate installation state locally, or enable export
before its backend contract is active. Test authorized and unauthorized
catalogues, initialization/core/sample separation, stale selection, checksum
and compatibility rejection, execution retry, history projection, narrow and
keyboard use, backend unavailability, and removal of the project presentation
extension.
