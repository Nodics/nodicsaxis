# Axis Implementation And Documentation Contract

Axis is a reusable frontend framework application, not a one-off admin screen.
Partners, developers, and AI tools must be able to extend it without seeing the
entire repository or moving backend authority into the browser.

## Local Discovery Chain

For every feature, read:

1. root `AGENTS.md`;
2. this contract and the feature-delivery checklist;
3. the nearest feature source and focused tests;
4. the consuming Nodics API/OpenAPI/CMS contract;
5. the feature guide linked from the root README.

Critical rules must be repeated concisely near the implementation and protected
by TypeScript, schema validation, linting, or focused tests. A conversation or
temporary plan is never an implementation authority.

## Repository Ownership

Axis owns:

- rendering, interaction, responsive/WebView behavior, and accessibility;
- typed client contract consumption;
- browser routing and presentation state;
- TanStack Query server-state coordination;
- Axis-owned CMS renderer implementations and typed registries;
- loading, empty, unauthorized, incompatible, failure, and recovery views.

Nodics owns:

- business rules and authoritative validation;
- authentication and authorization enforcement;
- persistence, workflows, pipelines, events, jobs, and integrations;
- secrets, tenant governance, AI execution, tool execution, and audit;
- backend schemas, APIs, configuration, runtime contracts, and business docs.

When both repositories change, analyze and test each boundary separately.

## Placement Rules

- Application composition belongs under `src/app`.
- Feature interaction belongs in a named feature boundary, not a generic
  utilities folder.
- CMS page, template, and component renderers follow the paths defined in
  `AGENTS.md`, with one renderer implementation per file.
- Backend logical keys map through typed registries. CMS data never supplies
  executable JavaScript.
- Configurable page copy comes from CMS component properties. Page and
  component renderers consume typed labels, headings, placeholders, help text,
  empty-state text, action captions, and fragments rather than defining
  business-facing copy in JSX.
- Error ownership remains layered: the owning backend module supplies stable
  domain codes and safe messages, CMS supplies configurable presentation copy,
  and Axis supplies only generic browser or transport fallbacks needed when
  the backend is unavailable. Axis never interprets English error text.
- Locale, channel, and backend-resolved fallback are part of the CMS delivery
  contract. Axis preserves that context, supports translated text expansion
  and text direction, and uses locale-aware formatting without creating a
  parallel backend translation catalogue.
- Runtime values come from validated Axis configuration and backend contracts.
  They do not belong in scattered constants or `package.json`.
- Secrets never belong in frontend source, `.env`, generated browser config,
  storage, URLs, telemetry, or logs.

## Required Feature Documentation

Every significant feature guide explains:

- purpose and current implemented scope;
- backend authority and contract version;
- source/component/client/test map;
- setup and runtime configuration;
- permissions and security;
- keyboard, screen reader, responsive, touch, reduced-motion, and WebView
  behavior;
- success, unauthorized/invalid, boundary/responsive, failure/recovery, and
  supported customization examples;
- troubleshooting and verification;
- known limitations and safe fallback.

Business workflows and backend customization belong in Nodics documentation.
Axis guides link to them and focus on frontend setup and contribution.

## Required Examples

### Successful

An authorized employee loads a backend descriptor, Axis validates it, maps its
renderer key to an Axis-owned component, and displays the result.

### Unauthorized

The backend denies an operation. Axis presents an accessible unauthorized state
and does not infer authorization from menu visibility.

### Boundary

The same feature remains usable with keyboard and touch in desktop, tablet, and
mobile WebView layouts, including long labels, empty data, and bounded payloads.

### Failure And Recovery

When BackOffice or a target module is unavailable, Axis presents a safe
recovery state, avoids stale privileged data, and retries through the same
authoritative contract.

### Customization

A partner adds an Axis-owned renderer and registry manifest for a backend
logical component key. The partner does not download code from CMS or add
business validation to the renderer.

An administrator changes a component label or locale-specific content in the
authoritative CMS catalog. The same allowlisted Axis renderer displays the
resolved value without a frontend rebuild. Missing or malformed required
properties produce the renderer's safe generic fallback and never execute
backend-supplied markup or code.

## Acceptance

A feature is complete only when:

- repository ownership is explicit;
- the backend contract and security boundary are preserved;
- strict TypeScript and validation cover external data;
- accessibility and responsive states are implemented;
- focused positive, negative, boundary, failure, integration, and regression
  tests pass;
- implemented documentation and known limitations are current;
- `npm run verify` passes at the release-oriented gate.

## Continue

- [Feature Delivery Checklist](feature-delivery-checklist.md)
- [Architecture And Ownership](architecture-and-ownership.md)
- [CMS Delivery And Renderers](cms-delivery-and-renderers.md)
- [Axis README](../README.md)
