# Axis Feature Delivery Checklist

Use this checklist for every implemented Axis feature. Complete the ownership
analysis before changing source and retain evidence in the pull request or
delivery record.

## 1. Repository boundary

Record:

- the authoritative Nodics module and backend contract;
- the Axis route, feature, or component that consumes it;
- the contract version or supported range;
- the authentication and authorization boundary;
- the tenant, enterprise, application, Site, Store, locale, channel, and module
  context involved;
- backend changes required in `nodics`, if any;
- Axis changes required in this repository;
- documentation and tests owned by each repository.

Stop when ownership is ambiguous. Do not move backend business behavior into
Axis to avoid defining a backend contract.

## 2. Reuse and dependency check

Confirm:

- an existing Axis component, hook, client, state pattern, or test utility was
  considered first;
- an existing Nodics API, schema, permission, workflow, publishing, cache,
  search, import, or export authority is reused;
- no second registry, loader, schema authority, workflow engine, publisher,
  context authority, or provider integration is introduced;
- any new dependency has documented bundle, maintenance, security,
  accessibility, browser, WebView, and licensing impact.

## 3. Security and privacy

Confirm:

- target modules independently authorize every request;
- UI filtering is not treated as authorization;
- passwords, access tokens, refresh tokens, cookies, internal credentials, and
  secrets are absent from browser storage, URLs, logs, and telemetry;
- errors and telemetry contain safe correlation data without sensitive
  payloads;
- query keys and caches cannot cross users or validated contexts;
- logout, revocation, and context switching cancel requests and clear affected
  data;
- CMS or another module cannot supply executable browser code.
- configurable business-facing labels, help text, placeholders, empty states,
  action captions, and content fragments come from typed CMS properties rather
  than renderer literals;
- domain errors retain stable backend codes and safe messages, while generic
  Axis fallbacks are limited to browser and transport failures;
- locale, direction, translated text expansion, and locale-aware formatting
  are covered without creating a second translation authority in Axis;
- arbitrary HTML, CSS, JavaScript, expressions, event handlers, and remote
  renderer imports are rejected.

## 4. Interaction quality

Implement and verify applicable:

- loading, success, empty, unavailable, unauthorized, incompatible, validation,
  conflict, partial-failure, and recovery states;
- keyboard operation and visible focus;
- screen-reader names, roles, states, and announcements;
- responsive desktop, tablet, and mobile WebView layouts;
- long translated labels, right-to-left direction, locale fallback, and
  locale-aware dates, numbers, currency, and pluralization where applicable;
- touch target sizing and non-hover alternatives;
- reduced motion;
- the fixed comfortable workspace density;
- light and dark token compatibility;
- safe cancellation and stale-response prevention.

## 5. Contract tests

Cover applicable:

- positive behavior;
- invalid input and malformed response;
- permission and cross-tenant denial;
- minimum, maximum, empty, timeout, and payload boundaries;
- supported, degraded, incompatible, missing, and unknown contract versions;
- cancellation, retry, idempotency, and concurrency;
- backend outage and recovery;
- responsive and accessibility behavior;
- integration with `monoServer` and later distributed module topology;
- regression of the static recovery shell.

UI tests prove client behavior only. Backend authorization, validation,
persistence, workflow, publication, and integration tests belong in `nodics`.

## 6. Documentation placement

Update this repository for implemented:

- installation, build, start, and deployment behavior;
- runtime configuration consumed by Axis;
- frontend architecture and contribution rules;
- browser routes, interaction, accessibility, responsive behavior, and
  troubleshooting;
- frontend verification commands.

Update `nodics` for implemented:

- business-user and administrator journeys;
- backend architecture, configuration, permissions, APIs, schemas, workflows,
  publication, integration, security, and operations;
- customization and override guidance;
- backend tests and deployment evidence.

Keep proposals, unresolved decisions, and future action lists only in the
temporary ignored planning workspace. Do not document planned UI as available
product behavior.

## 7. Partial-discovery and use-case proof

Confirm that a contributor or AI tool opening only the nearest maintained files
can identify:

- whether behavior belongs in Axis or Nodics;
- the owning feature, route, component, hook, client, contract, and test;
- the supported extension point and prohibited bypass;
- backend authority and permission expectations;
- accessibility, responsive, WebView, security, and recovery requirements;
- the focused verification command.

Document successful, unauthorized/invalid, boundary/responsive,
failure/recovery, and supported customization examples with expected outcomes.
Link Nodics-owned business and backend guidance rather than copying it into
Axis.

## 8. Completion evidence

Before marking the feature complete:

- link the implemented source and contract;
- link focused test evidence;
- link permanent documentation for every applicable audience;
- explain any audience or operational layer that is not applicable;
- run `npm run verify`;
- record known limitations and safe fallback behavior;
- confirm the action-plan status reflects repository and test evidence.

## Customize and extend safely

For every delivered feature, name the later project-owned page, component,
renderer, typed client, hook, configuration, or style extension point. Include
the smallest working file map and example, the backend contract that remains
authoritative, prohibited browser-side shortcuts, upgrade and rollback impact,
and the focused positive, rejected, boundary, integration, regression, and
production-build tests.

A checklist that records only the shipped OOTB behavior is incomplete. If no
safe extension point exists, record that limitation explicitly rather than
suggesting that a framework file should be edited.
