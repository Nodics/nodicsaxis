# Axis Design System and Application Shell

## Implemented scope

Axis provides a responsive recovery workspace, CMS-composed employee
authentication experience, and authenticated dashboard shell. It contains no
backend business logic and does not infer permissions.

The implemented visual foundation uses Nodics Gold for focus and primary
actions, Charcoal for structural surfaces and text, and restrained semantic
colors for success, information, warning, and error states. Panelix informed
functional grouping only; no template source or visual asset was copied.

## Authentication layout

The implemented login, recovery, and lock-screen template follows a two-zone
enterprise authentication pattern:

- desktop and tablet layouts at or above the medium breakpoint use a
  60-percent Charcoal showcase panel and a 40-percent calm white form
  workspace;
- the showcase uses the reverse Nodics Axis lockup, Gold emphasis, a short
  platform narrative, and configurable highlights;
- the form workspace limits content to 440 pixels for readable field lengths;
- brand, introduction, form, assistance, and legal content remain separate CMS
  slots;
- mobile webviews hide the decorative showcase and retain the complete
  employee authentication journey in one column.

The layout pattern was informed by the approved external reference, but colors,
logo treatment, typography, spacing, content, accessibility, and React
implementation follow the Nodics Axis style guide. No source code, imagery,
social-login behavior, registration journey, or branding was copied.

Recovery uses the same composition with a concise reset introduction, one
employee identifier field, primary action, and return-to-login assistance.
Screen lock uses the in-memory employee identifier, one password field,
primary unlock action, and explicit sign-out alternative. Lock content is
authenticated CMS composition and is never available from public delivery.

Implemented foundation values include Gold `#FEC400`, Charcoal `#25292C`, app
background `#F5F6F7`, border `#DDE1E5`, and the guide's semantic colors. Gold
remains an action surface with Charcoal text; it is not used as warning status
or normal text on white.

## Foundations

- Light and dark color modes.
- Comfortable and compact density.
- Responsive typography and spacing.
- Consistent borders, surfaces, action sizing, and elevation.
- Visible keyboard focus.
- Reduced-motion behavior through the operating-system preference.
- Semantic success, information, warning, and error colors.
- Forty-four-pixel icon-button targets for touch and mobile WebViews.

Appearance choices remain in application memory. They are not identity,
tenant, or backend configuration and are deliberately not persisted yet.

## Shell structure

The shared authenticated shell provides:

1. an expandable desktop navigation rail, compact icon-only desktop rail, and
   temporary mobile navigation drawer;
2. a top bar with navigation search, an optional backend-advertised Axis
   Assistant shortcut, quick-create placeholder, My Work, notifications, and
   employee menu;
3. an active context bar showing the backend-reported environment, tenant,
   configured enterprise, CMS Site, and CMS Catalog;
4. employee lock and logout actions;
5. comfortable/compact density and light/dark controls;
6. the main workspace region;
7. bordered workspace panels;
8. empty-state, notification, and confirmation-dialog primitives;
9. loading and offline feedback.

After authentication, Axis consumes the authorized BackOffice `catalogue`,
`availability`, and client-safe module leases. It does not define a second
functional menu authority. The local Dashboard entry is combined with
module-owned navigation entries, ordered by their backend metadata, and grouped
for presentation by their module-owned category:

- `content` and `experience` become Content and Experience;
- `commerce` becomes Commerce;
- `core` becomes Customers and Organization;
- `operations` becomes Process and Automation;
- `platform` becomes Operations and Integration; and
- unknown categories remain visible under Other Capabilities.

Incompatible modules are excluded by the bootstrap parser. Unavailable
destinations are disabled and degraded destinations remain visible with a
warning state. A navigation item with permissions not covered by its already
authorized module contribution is rejected rather than displayed.

When the authorized `aiAssistant` contribution contains its `assistant`
navigation item, the same backend-provided label, route, icon key, and
availability also drive the top-bar shortcut. The shortcut is absent when the
employee has no contribution, enabled for `UP` and `DEGRADED`, and disabled for
`UNAVAILABLE` or `UNKNOWN`. Axis does not maintain a second Assistant route or
label authority.

The desktop menu control switches between the full rail and the compact rail.
The compact rail retains every authorized destination as an icon with an
accessible name and hover/focus tooltip; it does not hide or re-authorize
capabilities. The Nodics Axis wordmark contracts to the Nodics mark and the top
bar and content region reclaim the released width. Reduced-motion preferences
disable the width transition.

Each module-owned navigation entry may supply a semantic `icon` key. Axis maps
that non-executable key to an Axis-owned vector icon. The entry-level key takes
precedence over the module-level key, and an unknown key uses the governed
generic module icon instead of loading remote or CMS-provided executable
assets.

Discovered module routes currently open an explicit placeholder workspace until
their dedicated Axis feature is implemented. The placeholder confirms the
owning module and availability without inferring operations or calling
unapproved APIs.

Before authentication, unavailable context is labelled honestly. Future
enterprise, environment, Site, Store, and Catalog selectors must consume
governed backend context contracts rather than turn their displayed labels into
frontend authority. Future features must compose these primitives rather than
create parallel page shells.

Context identifiers are retained exactly for API requests, authorization,
query keys, caches, and diagnostics. Axis uses the generic display-name helper
only to turn a validated fallback code such as `startioLocal` into readable
text such as `Startio Local`. The helper preserves common acronyms including
AI, API, CMS, ID, and UI. A localized display name explicitly supplied by the
owning backend contract takes precedence over this fallback.

## Recovery states

The static recovery model distinguishes:

- deployment configuration;
- Profile identity authority;
- BackOffice registry;
- CMS delivery;
- contract compatibility;
- functional module availability;
- authorization denial;
- offline connectivity;
- unexpected presentation failure.

Each recovery state explains the affected boundary, whether retry is safe, and
an optional bounded correlation reference. Axis never claims that a retry is
safe for an unknown backend mutation.

## Accessibility and responsive behavior

- The main workspace uses the `main` landmark.
- Navigation has an accessible name.
- Dialogs have programmatic titles and descriptions.
- Notifications use MUI live-region behavior.
- Controls retain visible labels and keyboard focus.
- Navigation changes from permanent to temporary below the medium breakpoint.
- Authentication layouts use the exact 60/40 split at and above the medium
  breakpoint. Below it, the decorative panel is hidden and the form workspace
  uses the full width.
- Layouts stack on narrow screens, avoid hover-only interaction, and do not
  introduce horizontal page overflow.

## Extension rules

- Add new design values to the shared token module.
- Add reusable layouts and states to the shell primitives.
- Keep module-specific presentation inside its feature workspace.
- Do not put permissions, workflow execution, service credentials, or
  authoritative validation into a shell component.
- Add functional navigation through the owning module's BackOffice capability
  contribution. Do not hardcode module routes in Axis.
- Keep the single local Dashboard route recovery-safe. Every other displayed
  functional destination must come from authenticated bootstrap.
- Keep the expanded/compact navigation choice in application memory. Do not
  persist appearance or navigation state until its privacy and multi-user cache
  behavior is approved.

## Verification

Run `npm run verify`. The foundation tests cover recovery variants, retry and
correlation presentation, authorized navigation parsing and grouping,
navigation landmarks, module placeholder routing, context labels, employee
logout, Assistant shortcut capability gating, density and color controls,
dialogs, notifications, offline behavior, formatting, lint, types, and build.
Responsive browser acceptance also covers the 60/40 authentication split at
desktop and tablet widths and the single-column mobile journey.
