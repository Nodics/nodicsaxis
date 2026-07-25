# Documentation Content In Axis

Axis renders Nodics documentation as authenticated CMS pages under `/docs/*`.
The documentation source and generated import data live in the separate
`nodicsdocs` repository; Nodics CMS remains the runtime content,
authorization, routing, and import authority.

## Employee Journey

1. Sign in with an authorized employee account.
2. Open **Workspace > Help and Documentation**.
3. Axis requests the current `/docs` path from the CMS endpoint supplied by
   BackOffice bootstrap.
4. CMS resolves the Site, locale, channel, route, page, template, component,
   renderer mappings, and access mode.
5. Axis validates the renderer contract and displays the declarative article.
6. Internal documentation links remain inside the authenticated Axis shell.

Refreshing a documentation URL restores the Profile-owned browser session
before resolving the same CMS path. An expired or rejected session returns the
employee to the public authentication journey.

## Renderer Ownership

- `DocumentationArticlePageRenderer` owns page-to-slot composition.
- `DocumentationArticleTemplateRenderer` owns the responsive article layout.
- `DocumentationArticleRenderer` owns safe article-block presentation.
- The typed renderer manifest and registries are the only mapping from CMS
  logical keys to Axis implementations.

The renderer accepts bounded headings, paragraphs, ordered and unordered
lists, blockquotes, code blocks, tables, and image references. It does not
execute HTML, scripts, event handlers, expressions, CMS-provided JavaScript, or
arbitrary renderer URLs. Only `/docs`, anchor, HTTP(S), and mail links are
eligible for navigation.

## Failure And Recovery

- A missing or unavailable CMS route uses the existing CMS recovery screen and
  retry action.
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
