# CMS Delivery and Renderer Integration

Axis renders CMS-managed Back Office pages without moving backend authority or
business logic into the browser.

## Runtime boundary

CMS owns routes, pages, templates, components, component properties, and the
logical renderer metadata attached to each page or component type. Axis owns
the executable React renderers. CMS never returns JavaScript, module paths, or
arbitrary renderer URLs.

Axis obtains the CMS endpoint from the approved runtime bootstrap flow. The CMS
client accepts that discovered endpoint as an input; it does not invent a
fallback URL or proxy CMS through the Axis server.

## Delivery validation

Before rendering, Axis validates the complete resolved-page response:

- delivery contract version;
- site, path, locale, and channel;
- page, template, and component renderer keys;
- renderer major versions and supported channels;
- required component properties;
- component graph depth and total component count.

Unknown renderer keys, unsupported versions or channels, malformed data, and
oversized graphs fail closed. A component rendering failure is isolated and
replaced with a safe error message. Deprecated renderer metadata is retained
for migration tooling; it does not allow CMS to select untrusted executable
code.

## Request and cache safety

The delivery client:

- sends bearer tokens only in the `Authorization` header;
- never places tokens in URLs, storage, or cache keys;
- omits browser credentials and rejects redirects;
- supports cancellation, timeouts, `ETag`, and `304 Not Modified`;
- separates cache keys by enterprise, tenant, site, path, locale, channel,
  access mode, principal, and authenticated session generation.

Authenticated cache keys require principal and session identity. This prevents
one employee or tenant from reusing another user's resolved page.

## Customize and extend safely

Create one project-owned renderer file in the relevant capability directory,
register its backend-issued logical key and supported contract version in the
typed renderer manifest, and add mirrored tests. Customize labels, help text,
layout options, and safe fragments through CMS component properties; keep API
destinations, authorization, validation, and business decisions in their
owning backend modules.

Never execute CMS HTML or JavaScript, accept arbitrary component imports, add a
fallback renderer for unknown keys, or duplicate CMS route resolution in Axis.
Verify valid, unknown, deprecated, incompatible, malformed, oversized,
unauthorized, cached-session, responsive, and renderer-isolation behavior.
Rollback removes the later project registration and restores the prior CMS
component version without editing the reusable renderer framework.

## Renderer development

Add a renderer only to the trusted Axis renderer manifest and implement it in
Axis source. Keep the renderer declarative: component properties may influence
content and presentation, but must not introduce API destinations, executable
scripts, authorization rules, or backend business decisions.

Run the focused checks while changing this boundary:

```bash
npm run typecheck
npm test -- --run test/cms
```

Run `npm run verify` before handing off or committing the completed slice.

`/login` and `/forgot-password` are resolved from public CMS delivery. The
login renderer sends employee credentials only to Profile. After Profile issues
the human bearer token, Axis validates access through secured BackOffice
bootstrap before loading the authenticated CMS dashboard. Tokens remain in
memory and are cleared locally before logout revocation is sent to Profile.

The forgot-password page is presentation-ready, but submission remains disabled
until Profile owns an approved employee-recovery API. Axis does not simulate
recovery or create a second identity workflow.
