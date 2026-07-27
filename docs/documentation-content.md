# Documentation Content In Axis

Axis renders an authorized, backend-provided list of documentation products
under `/docs/*`. BackOffice aggregates the list from active module metadata;
Axis does not hardcode product tabs or maintain another registry.

- **Framework** renders the canonical `nodicsdocs` content pack through CMS.
- **Swaggers** renders the active System-owned OpenAPI contract in an
  Axis-owned, searchable reference and links to the backend's standalone
  interactive Swagger UI. API descriptions are not copied into a content
  catalog.
- **Nodics Axis** renders this repository's committed documentation content
  pack through its own CMS Site and content catalog.
- A future customer project contributes its own source from its backend project
  module and supplies import-ready data from the corresponding project
  repository.

Each CMS documentation product has a separate Site/catalog pair. CMS resolves
the Site to its catalog, so Axis never adds a second catalog-routing authority.
Nodics CMS remains runtime content and route authority; nImport remains the
only content-pack installation and update authority.

## Employee Journey

1. Sign in with an authorized employee account.
2. Open **Documentation > Nodics Documentation**.
3. Axis renders the ordered source tabs returned by the secured BackOffice
   bootstrap.
4. Select a CMS product or **Swaggers**. Axis resolves the configured runtime
   connection by `connectionModule`; it never stores a second endpoint list.
5. For a CMS source, Axis asks the registered System module for that source's
   configured content-pack state.
6. When the pack is absent, an authorized administrator may select **Import
   documentation**. Axis never reads a repository or imports records itself.
7. When the pack is current, Axis requests the selected product path from the CMS endpoint supplied by
   BackOffice bootstrap.
8. CMS resolves the Site, locale, channel, route, page, template, component,
   renderer mappings, and access mode.
9. Axis validates the renderer contract and displays the declarative article.
10. Internal documentation links remain inside the authenticated Axis shell.

For **Swaggers**, Axis uses the selected source's registered System connection,
OpenAPI path, and Swagger path. Axis fetches and bounds the JSON OpenAPI
contract, then renders searchable method, path, summary, description, and tag
information as text through its own components. The backend Swagger page is
opened as a separate browser page for interactive use; it is never embedded in
an iframe because Nodics correctly protects backend pages with
`X-Frame-Options: DENY` and `frame-ancestors 'none'`. Both routes remain subject
to Nodics API exposure policy. If exposure is disabled or the runtime is
unavailable, Axis reports the failure and does not substitute a stale copied
contract.

When a newer pack version is available, Axis keeps the installed Wiki readable
and offers the backend-authorized **Update documentation** action. Labels and
empty-state messages come from the bounded backend status contract. Axis sends
only the employee bearer token and enterprise context to the registered System
endpoint and never receives local paths, credentials, manifests, source files,
or backend diagnostics.

The shared CMS navigation component supplies the searchable article index,
category grouping, audience filters, and configurable labels. Each article
supplies breadcrumb context, its table of contents, and previous/next
references. Axis owns only their responsive and accessible presentation.

The documentation-product switcher is a responsive, horizontally scrollable
segmented control. Its ordered products, labels, routes, and selected identity
come from BackOffice bootstrap; its spacing, selected state, keyboard roles,
focus behavior, and responsive presentation belong to Axis. It must remain
visually consistent across installed documentation, import/update states,
OpenAPI reference, unavailable connections, and future project products.

Refreshing a documentation URL restores the Profile-owned browser session
before resolving the same CMS path. An expired or rejected session returns the
employee to the public authentication journey.

## Nodics Axis Content Pack

Axis documentation data is directly importable and committed under
`data/core`. Its immutable release manifest is
`manifest/docs-content-pack.json`. The manifest pack identity is `nodicsaxis`;
the configured nImport pack code is `axisDocumentation`; and its CMS binding is
`axisDocumentationSite` → `axisDocumentationContentCatalog`.

The pack explains project purpose, architecture and repository boundaries,
supported setup, page/template/component/renderer organization, backend
contracts and security, responsive/accessibility behavior, extension,
troubleshooting, and verification. Change the pack version whenever committed
content hashes change. A same-version checksum change is rejected by default.

## Renderer Ownership

- `DocumentationArticlePageRenderer` owns page-to-slot composition.
- `DocumentationArticleTemplateRenderer` owns the responsive article layout.
- `DocumentationArticleRenderer` owns safe article-block presentation.
- `DocumentationNavigationRenderer` owns bounded search, category grouping,
  audience filtering, selected-route presentation, and documentation-home
  navigation.
- The typed renderer manifest and registries are the only mapping from CMS
  logical keys to Axis implementations.

The renderer accepts bounded headings, paragraphs, ordered and unordered
lists, blockquotes, code blocks, tables, and image references. It does not
execute HTML, scripts, event handlers, expressions, CMS-provided JavaScript, or
arbitrary renderer URLs. Only `/docs`, anchor, HTTP(S), and mail links are
eligible for navigation.

Code blocks use a theme-owned high-contrast surface and bounded responsive
typography. Do not use undefined palette tokens: an unresolved background with
a light foreground can make valid documentation appear blank.

Documentation links and the on-page heading index use the readable secondary
text palette with a persistent gold underline. Signature gold remains an
accent, focus, and action color; it must not be used as small text on light
surfaces where it does not provide sufficient contrast.

## Failure And Recovery

- A missing or unavailable CMS route uses the existing CMS recovery screen and
  retry action.
- A disabled content-pack capability shows configuration guidance and no
  import action.
- A missing or checksum-invalid source shows a low-disclosure unavailable
  state.
- An unauthorized employee cannot view or run content-pack operations even if
  a control is forced in the browser.
- A failed update keeps the Wiki route available and presents a retryable,
  low-disclosure failure. Import diagnostics and data reconciliation remain
  backend responsibilities.
- A missing renderer, unsupported contract version, unsupported channel, or
  malformed property is rejected by the CMS render boundary.
- A disabled or unavailable BackOffice documentation contribution displays the
  standard module workspace state.
- Unsupported content blocks are not rendered.

Binary image delivery is not yet owned by the CMS delivery contract. Image
metadata is migrated and validated by `nodicsdocs`, while Axis presents a
non-executable placeholder until a governed CMS/DAM binary-delivery contract
is implemented. Do not add repository file paths or ad-hoc static-file loaders
to bypass that boundary.

## Contributor Verification

Run:

```bash
npm run verify
```

The suite covers registry parity, declarative article rendering, unsafe-link
rejection, executable-block rejection, TypeScript, accessibility-oriented
markup, linting, formatting, and production build behavior.
