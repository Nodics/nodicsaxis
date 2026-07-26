# Documentation Content In Axis

Axis renders Nodics documentation as authenticated CMS pages under `/docs/*`.
The documentation source and generated import data live in the separate
`nodicsdocs` repository; Nodics CMS remains the runtime content,
authorization, routing, and import authority.

## Employee Journey

1. Sign in with an authorized employee account.
2. Open **Documentation > Nodics Documentation**.
3. Axis asks the registered System module for the configured documentation
   content-pack state.
4. When the pack is absent, an authorized administrator may select **Import
   documentation**. Axis never reads a repository or imports records itself.
5. When the pack is current, Axis requests the current `/docs` path from the CMS endpoint supplied by
   BackOffice bootstrap.
6. CMS resolves the Site, locale, channel, route, page, template, component,
   renderer mappings, and access mode.
7. Axis validates the renderer contract and displays the declarative article.
8. Internal documentation links remain inside the authenticated Axis shell.

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

Refreshing a documentation URL restores the Profile-owned browser session
before resolving the same CMS path. An expired or rejected session returns the
employee to the public authentication journey.

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
