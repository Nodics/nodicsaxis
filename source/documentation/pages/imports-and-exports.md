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
- `src/operations/importExport/components/FileImportWorkspace.tsx` owns the
  governed file-import interaction only: selecting a backend-discovered target
  model, uploading one file through nMedia, validating through nImport, and
  executing only after successful validation.
- Tests mirror this hierarchy under `test/operations/importExport`.

TanStack Query owns catalogue server state. The browser sends selected module
codes and reviewed versions; Nodics re-discovers and validates the authority
before doing work.

## Employee workflow

Choose Initialization, Core, or Sample data; review friendly module names,
descriptions, versions, and states; select releases; validate; then install or
update when authorized. A release marked `CURRENT` is already installed at the
same immutable version and checksum. Axis still lets an operator validate a
current release so the backend can confirm the immutable manifest, requested
version, upgrade policy, active-module authority, tenant context, and installed
state. Validation is side-effect-free: it never runs import handlers or writes
business data. Install/update is the only action that executes init, core, or
sample import processing. After a successful install/update, Axis clears the
executed selection because the reviewed plan has become stale and must be
reloaded before another operator action.

The install/update action remains disabled when every selected release is
already current because there is no executable import work.

Controls stack on narrow screens, remain keyboard operable, and have assistive
labels.

## File import workflow

Use **File imports** when an employee has an external CSV, Excel, JSON, or
JavaScript import file that should create or update records in a Nodics schema.
Axis does not ask for a server path and does not parse the file. The file is
first uploaded through the `media` module, which stores the file according to
backend storage policy and returns a media code. Axis then sends only the media
code and selected backend model to the secured `system` import route.

The screen has four deliberate states:

1. **Choose target model.** Axis loads authorized Workbench schema metadata from
   the connected backend modules and presents business-friendly model names such
   as Tenant, Address, Product, Price, Stock Balance, or CMS Page. The selected
   model still carries its authoritative module name and schema name, but Axis
   does not make `importDefinition` the first decision. Import templates are a
   later optional convenience for reusable mappings; the generic flow starts
   from the target schema.
2. **Confirm target destination.** Axis shows the target enterprise as the
   business destination and shows the tenant only as technical traceability. The
   connected environment remains global read-only context; Axis is connected to
   one backend environment and does not offer environment switching inside file
   import. Tenant is the database or schema isolation authority resolved by
   Nodics from enterprise configuration, while the selected data type is only
   the model being imported. Business users should not independently choose a
   tenant in the normal import flow. Axis presents enterprise as a selector even
   when only one authorized enterprise is available, so the interaction is ready
   for future multi-enterprise deployments. When multiple enterprises are
   available, the selector should be populated from backend-authorized
   destinations and the tenant must remain read-only and derived from the
   selected enterprise.
3. **Upload governed file.** The chosen browser file is submitted as
   `multipart/form-data` to nMedia. Axis never sets the multipart boundary by
   hand; the browser owns that header.
4. **Validate file import.** Axis calls the media-backed import route with
   validation enabled. nImport asks nMedia for the stored file, stages a
   temporary import workspace, generates a run-local header from the selected
   module/schema target, resolves tenant scope, parses the data, prepares
   finalized records, and reports whether the file is safe to execute. This
   proves the file can pass the existing backend import initializer without
   writing schema or search data. Axis displays backend counters, such as
   records read, records finalized, and validation issues, so the operator can
   tell the difference between a superficial upload success and a real import
   validation.
5. **Install imported data.** Only after validation for the current uploaded
   media code does Axis enable the install action. The backend reruns governed
   import preparation and then executes the existing data-handler pipeline, so
   schema validation, authorization, duplicate handling, diagnostics, history,
   and cleanup stay backend-owned. Axis displays dispatched, succeeded, and
   failed record counts from the backend run summary and does not calculate
   those totals in the browser.

The generic path is intentionally schema-first. A later implementation may add
import templates for recurring business feeds, such as Product CSV import,
Stock balance Excel import, or Legacy ERP Customer import. Those templates must
remain optional nImport-owned conveniences over the same media-backed route;
they must not become a second file-import authority or a Profile-specific
pattern.

To customize file import safely, expose or refine schema metadata and import
behavior in the owning backend module. If a new parser, storage provider,
field-mapping template, transformation, or validation rule is needed, implement
that capability in the backend provider layer and expose it through the same
secured contracts. Axis may improve selection, preview, and result
presentation, but it must not parse business files or duplicate schema rules.

## Security, failure, and extension

The in-memory employee token is sent only to the selected `import` connection
for release/history reads, backend module connections for Workbench schema
discovery, the selected `media` connection for uploads, and the selected
`system` connection for media-backed import execution. Each connection comes
from BackOffice bootstrap. Axis never infers authorization from a visible
button. Unknown states and incompatible responses are rejected.
Timeouts, authorization failures, disabled policy, integrity failures, and stale
selections are shown without backend stacks or diagnostics.

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

Add project-specific release filters, explanatory CMS copy, file-import helper
copy, or result presentation through focused Axis components while continuing to
call the Nodics nImport catalogue, Workbench schema discovery, preflight,
media-backed execution, and history contracts. New import or export formats,
release discovery, sequencing, persistence, mapping templates, and provider
behavior belong in later backend modules behind the provider-neutral data
contracts.

Do not inspect sibling repositories, submit arbitrary server paths, calculate
installation state locally, parse data files in Axis, store uploaded file
content in browser state beyond the selected `File`, or enable export before
its backend contract is active. Test authorized and unauthorized catalogues,
initialization/core/sample separation, schema discovery absence, missing
media/system connections, upload failure, validation failure, stale validated
media, checksum and compatibility rejection, execution retry, history
projection, narrow and keyboard use, backend unavailability, and removal of the
project presentation extension.
