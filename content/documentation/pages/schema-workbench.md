# Axis Schema Workbench

Axis implements the presentation side of Nodics Schema Workbench. The owning
backend module remains authoritative for schemas, allowed operations,
relationships, generated CRUD, domain operations, validation, permissions,
tenant isolation, and persistence.

Business-user and backend customization guidance is maintained in the Nodics
documentation:

- `gDocs/backoffice/how-schema-workbench-works.md`
- `gFramework/nDatabase/database/README.md`

## Implemented frontend behavior

The authenticated `/schema-workbench` route:

- appears only when BackOffice advertises its authorized navigation item;
- resolves its page, template, renderer keys, and visible copy through CMS;
- discovers active module endpoints through authenticated BackOffice bootstrap;
- requests safe Workbench descriptors directly from those modules;
- lists and filters authorized data types by readable label or module;
- loads bounded record pages through an owning-module Workbench query that
  delegates to existing generated CRUD services;
- searches the full authorized result set across descriptor-advertised safe
  text fields rather than filtering only the current browser page;
- uses the shared Axis Schema Query Builder for browsing, export preview, and
  any future schema-backed data retrieval screen so employees learn one
  consistent query experience;
- sorts only by descriptor-advertised scalar fields and default sort metadata;
- builds typed filters only from descriptor-advertised fields and operators;
- supports bounded nested `AND`/`OR` groups with an inert JSON request preview;
- keeps filter edits as a local draft until the employee applies them;
- offers only backend-configured page sizes and shows the authoritative total;
- cancels obsolete in-flight record requests when query state changes;
- renders primary and searchable fields in a responsive record table;
- stores employee/tenant/enterprise-scoped favourites, recents, visible
  columns, and up to ten saved views in bounded browser storage without
  storing records or access tokens;
- supports current-page row selection and exposes bulk deletion only when the
  owning descriptor explicitly advertises it;
- requests a governed delete-impact preview before enabling final deletion;
- consumes backend concurrency and aggregate-operation metadata without
  inventing browser-side business authority;
- opens a complete permitted record detail view from the record table;
- renders schema-declared reference values through one shared reference
  renderer used by record details, schema listing tables, and
  navigation-scoped schema workspaces;
- keeps the selected parent record visible when a related record is opened, and
  renders the related record detail below the current record instead of
  redirecting to another schema workspace;
- opens related values from both single-value and multi-value relationship
  fields, including list-valued references displayed in schema table columns;
- shows Edit only when the owning descriptor advertises Update;
- initializes Update from the selected record while excluding managed and
  read-only fields from the mutation model;
- sends a bounded generated Update request using the original primary identity,
  an editable model, and `returnModified`;
- refreshes the record list and detail view only after the owning module
  confirms the update;
- shows Delete only when the owning descriptor advertises it;
- requires a modal confirmation showing record identity, authenticated tenant,
  and enterprise;
- sends one bounded Delete query using the original primary identity;
- disables confirmation and cancellation while deletion is pending;
- keeps the record and confirmation available when authorization, ownership,
  reference integrity, or another backend business rule rejects deletion;
- displays only the bounded backend error code/message contract and never
  renders diagnostic contexts, records, queries, or stacks;
- closes record details and refreshes the list only after confirmed deletion;
- supports reusable feature handoff links using
  `/schema-workbench?module=<moduleName>&schema=<schemaName>` to select an
  authorized schema after discovery;
- renders WCMS and publishing management routes such as `/content/pages` and
  `/publishing/requests` from BackOffice navigation `workbenchTarget` metadata
  rather than frontend-owned route-to-schema maps;
- renders those navigation-scoped routes as focused schema workspaces, hiding
  the global data-type browser so a selected item such as Websites, Pages, or
  Publishing Requests shows only its own records, detail, create, update, and
  governed delete interactions;
- renders route-scoped business help from BackOffice navigation `help`
  metadata, including a short summary tooltip and a documentation link that
  opens the configured Axis documentation route in a new browser tab;
- renders permission-filtered, state-aware lifecycle actions declared by the
  owning backend module, including bounded text, select, hidden/default, and
  JSON input descriptors in one reusable action dialog;
- resolves an action against its declared owner-module connection, substitutes
  only record/input route parameters, sends one idempotent backend request, and
  refreshes server state after success; Axis never coordinates owner writes;
- uses the shared Axis listing interaction pattern: employees select a row
  from the records table and Axis renders the selected record detail below the
  list, instead of adding a one-action View column or moving detail above the
  table;
- preserves the authenticated shell hierarchy from BackOffice navigation and
  lets any parent navigation item with children expand or collapse its children
  independently of the top-level navigation group;
- supports `/schema-workbench?module=<moduleName>&schema=<schemaName>&mode=create`
  only when the discovered schema advertises Create, so feature pages can hand
  users to generic generated CRUD without duplicating record forms;
- renders one typed field component per supported schema field type;
- creates independent Address and Contact records through generated CRUD;
- renders schema-declared relationship fields separately from ordinary arrays;
- renders each relationship using its backend-declared business role, so
  references to the same target type remain distinguishable;
- combines backend-declared display properties in their configured order so
  selectors show meaningful identities instead of only opaque record keys;
- presents related records as `code - description`, truncating descriptions
  longer than five words to the first five words followed by `...`;
- exposes the complete description in a tooltip on pointer hover or keyboard
  focus, including descriptions displayed without truncation;
- selects existing related records through the target module's generated read
  contract;
- holds new related records as in-memory drafts until the parent is submitted;
- creates drafted related records through their owning module and associates
  only the returned reference property;
- replaces a one-to-one pending related draft when the employee chooses an
  existing related record for the same relationship, so parent save does not
  create an unused child record;
- prevents duplicate references in a multi-value relationship;
- bounds nested related creation by backend-advertised depth and stops cycles
  by falling back to selecting an existing record;
- offers inline related-record editing only when both relationship metadata
  advertises `EDIT_RELATED` and the target schema advertises Update;
- retains each successfully created related reference when a later related
  operation or parent save fails, so retry does not recreate that record;
- keeps unsaved drafts in component memory;
- blocks visibly incomplete required fields before submission while preserving
  backend validation as authoritative;
- formats dates with locale-aware browser APIs and renders booleans with
  CMS-provided user-facing labels;
- exposes loading, empty, unavailable, and retry states.

Every backend model that is authorized and not explicitly excluded is
discoverable with generated Search, Read, Create, Update, and governed Delete
operations. An owning schema may narrow that list. Address and Contact also
demonstrate the Address-to-Contact relationship editor.

## Request ownership

```text
Axis → BackOffice: authorized navigation and module endpoints
Axis → CMS: Workbench page composition and presentation copy
Axis → owning module: schema descriptors, generated reads, and authorized writes
```

Axis does not send schema operations through BackOffice and does not maintain
its own module registry. Access tokens remain in memory and are sent only in
the Authorization header. Enterprise context is sent in
`x-enterprise-code`.

## Successful behavior

An authorized employee opens Schema Workbench, selects Address, and sees the
first bounded page of Address records using labels supplied by the effective
Profile schema. The employee can open Create Address, complete required fields,
select an existing Contact or add a new Contact draft, and submit the complete
draft directly to Profile.

For Update, the employee selects a record row, chooses **Edit** when
permitted, changes ordinary fields or relationship references, and submits.
Axis uses the original primary identity as the update query even when the
editable primary field changes. When the descriptor advertises required
optimistic concurrency, the query also carries the record's advertised
revision. Update and Delete fail closed before sending a request if that
required revision is unavailable.

For Delete, the employee opens the record, chooses **Delete**, verifies the
record, tenant, and enterprise shown in the confirmation, and explicitly
confirms. Axis never cascades deletion and never treats a frontend permission
check as final authority.

## Unauthorized or invalid behavior

The route is unavailable when BackOffice does not advertise it. Modules omit
schemas and operations that the employee cannot access. Malformed descriptors,
unsupported operations, unsafe endpoints, invalid envelopes, and malformed
records fail validation rather than being rendered. A relationship cannot
create a target schema unless that descriptor advertises Create.

Axis does not infer optimistic concurrency from timestamps. It sends an
effective revision only when the backend descriptor advertises a compare-and-
set field. Axis must never simulate stale-write protection in browser state.

Delete rejection leaves the confirmation open with the safe backend message.
Axis does not hide a reference-integrity failure, retry automatically, or
delete related records as compensation.

The HTTP client accepts only a bounded top-level backend message and code for
display. Structured diagnostic contexts and stacks are deliberately ignored.
Malformed or non-JSON failures use a generic HTTP fallback. Translation must
use stable backend codes and CMS presentation content rather than parsing an
English message.

## Boundary and responsive behavior

At large widths, the global `/schema-workbench` route uses data-type
navigation and records in two columns. Navigation-scoped workspaces such as
`/content/sites` use a focused one-column record workspace because the selected
BackOffice menu item already supplies the schema context. At smaller widths
they stack into one column. Record columns remain horizontally scrollable
instead of shrinking into unreadable content. Controls retain labels, keyboard
operation, and semantic list/table roles.

## Failure and recovery

One unavailable module does not hide descriptors successfully returned by
other active modules. If every discovery request fails, Axis shows a safe
retryable error. Record loading failures remain scoped to the selected schema
and can be retried without reloading the application.

Workbench does not claim a browser-side or cross-module database transaction.
Related records are created sequentially during final submission. After each
successful related creation, Axis replaces that local draft with the returned
reference. If a later related creation or the parent save fails, the form stays
open and the successful reference remains selected. Retrying therefore resumes
from the failed step instead of creating the successful record again.

For one-to-one relationships, selecting an existing target record clears any
pending create draft for that relationship before submission. This keeps the
frontend draft aligned with the backend `refSchema` contract: the parent stores
only the selected reference value, and the owning module remains responsible for
validating whether that reference is allowed.

This recovery model avoids hidden deletion and unsafe compensation. It does not
guarantee atomic commit across modules. Journeys that require strict atomicity
must use a backend-owned domain operation or a transaction-capable workflow,
not generic Workbench coordination.

Lifecycle action forms keep entered evidence open after a safe backend failure
so the employee can correct or retry it. JSON descriptors are parsed only as
request data; they never execute code. Backend authorization, optimistic
versions, maker-checker rules, Workflow decisions, Pipelines, owner adapters,
and audit remain authoritative even when Axis hides an inapplicable action.

## Customize and extend safely

- Change page copy and composition through `axisContentCatalog`.
- Change available schemas, fields, relationships, and operations in the
  owning Nodics module.
- Change module availability through Nodics runtime topology and BackOffice
  registration.
- Extend Axis with one typed renderer per new CMS component contract.
- Reuse shared interaction components when the same behavior appears on more
  than one page. The Schema Query Builder is a generic workbench capability,
  not a private Schema Workbench widget. If another page needs schema search,
  filtering, sorting, grouping, or preview behavior, compose the shared query
  builder and feed it backend-advertised capabilities instead of creating a
  local query form.

Do not add hardcoded module endpoints, backend rules, translated business
copy, or alternate schema definitions to Axis.

## Notifications & Messaging workspace

When the backend advertises the `notifications-messaging` capability, Axis uses the same authenticated navigation and Schema Workbench contracts to expose Templates, Scenarios, Channels, Message Types, Providers, Provider Accounts, Delivery Logs, Attempts, Suppressions, Verification, and In-App Inbox. Axis does not contain a notification catalogue, provider list, consent rule, template lifecycle, OTP value, or delivery policy. Removing the backend capability or employee permission removes the workspace.

Business users may traverse Channel -> Scenario -> Template or Scenario -> Channel -> Template using backend-advertised schema filters and relationships. Template preview and lifecycle operations execute only backend-declared secured routes. Real OTPs, provider credentials, raw destinations, raw provider payloads, and diagnostic stacks must never enter Axis records, browser storage, telemetry, or preview state. Provider-account forms accept secret references only.

Customer projects customize this surface by contributing higher-layer Nodics schemas, capability navigation, presentation metadata, lifecycle actions, permissions, and CMS help. Add Axis code only for a genuinely new reusable presentation contract; do not fork a channel-specific editor or duplicate backend policy. Successful, denied, suppressed, retry/recovery, maker-checker, narrow-screen, keyboard, and partial-discovery behavior remains protected by the generic Workbench and bootstrap suites.

## Verification

Run:

```bash
npm run verify
```

Focused tests cover direct-module headers and paths, bounded record reads,
creates and updates, original-identity update queries, descriptor validation,
bounded original-identity deletion, missing-identity rejection, explicit
confirmation, pending duplicate-submit prevention, authenticated tenant
parsing, partial discovery, retryable failure, schema selection, record rendering,
record selection, CMS renderer registration, required-field
validation, default values, framework-managed field exclusion, selecting an
existing relationship, related-record creation, duplicate-reference prevention,
retry without duplicate related creation, backend conflict-message handling,
diagnostic-context exclusion, malformed-error fallback, and locale-aware
record formatting. Coverage also includes backend-declared lifecycle action
inputs, JSON parsing, owner-module routing, safe route substitution, stable
idempotency, and route-scoped schema workspaces that
hide the global schema browser, nested shell navigation expansion and collapse,
revision forwarding for Update and Delete, missing-revision rejection before
network access, self-referential relationship cycle fallback, bounded nested
relationship depth, full description tooltips, five-word related-record
summaries, shared clickable reference rendering in details and tables, inline
related-record details that preserve parent context, clearing stale one-to-one
pending drafts when selecting an existing target, and preserving remaining
one-to-many references when another selected reference is removed.

The authenticated local acceptance journey additionally verifies schema
discovery across active modules, bounded search, unauthenticated rejection,
raw-query rejection, advertised Create/Update/Delete visibility, readable
Enterprise relationship labels, and `code - description` Tenant choices. The
journey is read-only: it opens forms and selectors but does not submit a
business-data mutation.
