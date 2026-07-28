# Axis Assistant Frontend

## Implemented scope

Axis implements the authenticated `/assistant` CMS route, dedicated Assistant
page/template/component renderer hierarchy, BackOffice-driven top navigation
shortcut, validated direct-module connection projection, and a typed
provider-neutral Assistant HTTP client.

The workspace presents backend-owned CMS content, an interactive composer,
employee and Assistant message surfaces, smooth streamed text, progress
feedback, cancellation, and safe failure presentation. The authenticated SSE
transport and presentation state controller drive the visible experience.
No browser request is sent to OpenAI, Anthropic, Gemini, or another provider.

## Authority and request flow

1. BackOffice authenticated bootstrap advertises the authorized `aiAssistant`
   capability, navigation entry, availability, and client-callable module
   leases.
2. Axis validates those values and selects only an `UP` or `DEGRADED`
   connection. Credentials, query strings, fragments, and non-HTTP endpoints
   are rejected.
3. CMS authenticated delivery resolves `/assistant` for the configured Site,
   locale, and channel.
4. The CMS logical renderer keys map to allowlisted Axis-owned React
   implementations.
5. The typed Assistant client sends the employee bearer directly to the
   discovered `aiAssistant` module endpoint.
6. Nodics owns authorization, validation, persistence, provider selection,
   token governance, tools, Workflow handoff, and audit.

Axis does not proxy Assistant calls through BackOffice and does not select or
call an AI provider.

## Source map

- `src/bootstrap/publicBootstrap.ts`: authorized navigation and module
  connection validation.
- `src/cms/renderers/pages/AssistantPageRenderer.tsx`: Assistant page slot
  composition.
- `src/cms/renderers/templates/AssistantWorkspaceTemplateRenderer.tsx`:
  responsive workspace structure.
- `src/cms/renderers/components/assistant/AssistantWorkspaceRenderer.tsx`:
  CMS-driven workspace composition.
- `src/cms/renderers/components/assistant/AssistantMessageTimeline.tsx`:
  stable, auto-following activity region.
- `src/cms/renderers/components/assistant/AssistantMessageBubble.tsx`:
  employee and Assistant text presentation.
- `src/cms/renderers/components/assistant/AssistantStreamingStatus.tsx`:
  accessible non-terminal progress.
- `src/cms/renderers/components/assistant/AssistantComposer.tsx`: keyboard and
  touch-friendly Send and Stop controls.
- `src/cms/renderers/components/assistant/AssistantConversationHistory.tsx`:
  responsive conversation selection and bounded pagination.
- `src/assistant/api/assistantContracts.ts`: provider-neutral domain contracts.
- `src/assistant/api/assistantContractParsers.ts`: untrusted response
  validation.
- `src/assistant/api/assistantTransport.ts`: shared authenticated HTTP
  boundary.
- `src/assistant/api/assistantClient.ts`: bounded Assistant commands.
- `src/assistant/api/assistantSseParser.ts`: incremental, byte-bounded SSE
  framing.
- `src/assistant/api/assistantEventStream.ts`: authenticated event delivery,
  ordering, resume, and reconnect.
- `src/assistant/presentation/assistantPresentationContracts.ts`: UI-facing
  state and action contracts.
- `src/assistant/presentation/assistantPresentationReducer.ts`: pure,
  deterministic event projection.
- `src/assistant/presentation/assistantQueryKeys.ts`: enterprise, employee,
  conversation, and turn cache isolation.
- `src/assistant/presentation/useAssistantPresentation.ts`: lifecycle
  composition for conversation creation, turn submission, streaming, and
  cancellation.
- `src/assistant/api/assistantError.ts`: stable backend error and correlation
  projection.

## CMS customization

The backend component properties currently control:

- title;
- welcome message;
- composer placeholder;
- send and stop labels;
- empty-state text;
- employee and Assistant speaker labels;
- working, cancelling, and failure labels;
- conversation history, new conversation, empty history, and load-more labels.

Changing these properties in the authoritative CMS content changes Axis after
the next CMS delivery without rebuilding the frontend. Axis never accepts
backend JavaScript, component imports, event handlers, arbitrary HTML, or CSS.

Locale and channel remain part of the CMS delivery request. Renderers must
tolerate translated text expansion and future right-to-left content. Axis does
not translate by parsing English text.

## Typed API coverage

The current client implements only backend routes that exist:

- create, list, and retrieve employee-owned conversations;
- submit and retrieve a turn;
- replay persisted turn events;
- cancel a turn;
- create, retrieve, approve, and reject a mutation confirmation;
- execute or hand off an approved confirmation.

Requests use:

- memory-only employee access token;
- validated enterprise context;
- bounded query values;
- abort and timeout handling;
- `Idempotency-Key` for turn and confirmation creation;
- no browser credentials in URLs, logs, or storage.

The event stream additionally enforces the backend contract version and event
types, validates conversation and turn ownership, rejects sequence gaps,
deduplicates replayed events, resumes with `Last-Event-ID` and
`afterSequence`, observes an idle timeout, and limits reconnect duration.
Authentication failures and malformed protocol data fail closed rather than
being retried.

## Presentation lifecycle

The presentation reducer keeps each conversation in a separate immutable
record. It projects streamed text, status, clarification, tool planning,
confirmation, citations, usage, completion, cancellation, and failure while
retaining the normalized raw events for later UI projections.

Duplicate and stale events are ignored. Sequence gaps fail the active
presentation rather than silently rendering incomplete output. Events for
another conversation or turn cannot mutate the active state. Resetting the
scope removes all prior employee conversation state.

The React controller creates a conversation only when required, submits one
turn at a time, streams its ordered events, and requests cancellation without
prematurely closing the stream that carries the authoritative terminal event.
It holds no provider credentials and does not reproduce backend validation.

On authenticated entry, the controller loads a bounded employee-owned
conversation page. Selecting a conversation loads its durable turn/message and
structured-interaction projection from `aiAssistant`; it does not reconstruct
long-term history from short-lived SSE events. Clarification, tool state, safe
usage, citations, and confirmation lifecycle therefore survive reload. Older
conversation and turn pages are merged without changing chronological order or
crossing enterprise and employee scope.

Backend error `code`, safe `message`, HTTP status, and optional `traceId` remain
structured. Axis uses a generic fallback only when the backend supplies no
safe response.

Archive conversation and a dedicated usage-summary screen are not yet
implemented in Axis. The employee-owned summary endpoint belongs directly to
`aiProviders`; Axis must discover and call that module rather than proxying
through Assistant when that screen is added.

## Accessibility and responsive behavior

- The page and workspace use named regions and headings.
- Every CMS-provided action retains an accessible name.
- The layout remains single-column and bounded on desktop, tablet, mobile, and
  WebView widths.
- The activity region announces additions and text updates politely.
- Enter sends, Shift+Enter creates a new line, and buttons retain touch-safe
  targets.
- The timeline keeps a stable minimum height and follows new output without
  remounting existing messages.
- System reduced-motion preferences disable smooth scrolling and the streaming
  cursor animation through the shared Axis theme.

## Failure and security behavior

- Unauthenticated access redirects to the configured public page.
- A locked employee remains on the lock-screen flow.
- Missing capability contribution removes the Assistant shortcut.
- `UNAVAILABLE` and `UNKNOWN` disable the shortcut.
- Incompatible renderers use the existing safe render boundary.
- Malformed CMS properties fail inside the render boundary.
- Unsafe direct-module endpoints fail bootstrap parsing before a token is
  transmitted.
- Backend errors do not become frontend authorization decisions.

## Verification

Focused coverage includes:

- authenticated `/assistant` CMS delivery;
- renderer registry and contract versions;
- backend-driven labels and malformed properties;
- direct module URL and employee headers;
- fragmented SSE parsing and heartbeat handling;
- authenticated streaming, terminal closure, replay deduplication, and resume;
- cross-turn, sequence, contract, and payload-boundary rejection;
- immutable presentation event projection and terminal states;
- duplicate, stale, gap, and foreign-event handling;
- employee and enterprise query-key isolation;
- conversation creation, turn submission, overlap prevention, and controller
  cleanup;
- CMS-driven workspace copy, keyboard submission, streamed text, and
  cancellation controls;
- persisted multi-turn history, selection, new-conversation reset, and bounded
  pagination;
- idempotent turn submission;
- input bounds;
- stable error codes and trace IDs;
- unsafe endpoint and path rejection.

Run:

```bash
npm run verify
```

## Structured interactions

Axis renders backend `CLARIFICATION`, `TOOL_PLAN`, and
`CONFIRMATION_REQUIRED` events through separate feature components. All visible
headings and action labels come from the authenticated Assistant CMS component.
Axis does not reconstruct mutation arguments, target routes, authorization, or
confirmation identity.

Approval and rejection return the backend-issued argument digest and
optimistic revision. Rejection is available only before execution begins.
Execution sends only the backend-issued confirmation code. Invalid event
payloads fail closed; expired, stale, unauthorized, conflicting, and uncertain
outcomes remain backend decisions and are shown through the normal safe error
contract. The browser never retries an execution automatically.

## Evidence and operational transparency

The workspace renders the backend-issued tool lifecycle as prepared, running,
succeeded, or failed. Only stable tool identity, owner module, operation
identity, lifecycle state, and a safe failure code are displayed. Raw tool
arguments, target URLs, credentials, and result content are neither projected
nor rendered.

Citation cards display backend-issued identity, title, section, locator, and
version. A title becomes a link only when AI Knowledge explicitly classifies
it as `INTERNAL_ROUTE` and supplies a validated same-application path.
Unclassified locators and rejected external or scheme-based values remain
plain text. Axis validates the path again and never invents navigation from
locator text.

Usage cards display the normalized input, output, cached-input, reasoning, and
embedding token values plus reconciliation state. Reservation identifiers are
discarded. Axis does not infer cost, quota, or remaining budget. `aiProviders`
now exposes the separate direct, employee-owned
`GET /operations/ai-ledger/usage/me` projection for a future budget-summary
surface.

Malformed citation, usage, tool lifecycle, and reconciliation payloads fail
closed through the same event-data boundary.

## Customize and extend safely

Add Assistant presentation through a new focused renderer under the Assistant
feature, a typed logical-key registration, and bounded properties supplied by
the owning CMS component. Add provider, tool, prompt, budget, knowledge, or
business-operation behavior only in the appropriate Nodics AI or business
module; Axis renders the provider-neutral events it receives.

Do not parse prompts into business commands, select providers in the browser,
invent token balances, expose tool arguments, or call unregistered endpoints.
Test the project extension with allowed and rejected renderer keys, contract
versions, malformed SSE events, unauthorized tool proposals, confirmation
revision changes, reconnection boundaries, keyboard and narrow-view behavior,
and a production build. Removing the renderer registration is the safe
frontend rollback; backend conversations and audit records remain owned by
Nodics.

## Known next boundary

Nodics now supports provider-neutral `CLARIFICATION` and
`MUTATION_PROPOSAL` planning for confirmed enterprise creation. Axis consumes
the resulting clarification and persisted-confirmation events through the
existing renderers; it does not parse natural language into business fields.

The next boundary is local end-to-end acceptance with a configured provider:
request enterprise creation, answer missing fields, inspect the persisted
confirmation, approve it, execute it, and verify Profile's result. This requires
provider credentials and usage credit; deterministic contract tests remain the
offline acceptance authority.

The offline backend acceptance now covers the full provider-neutral
clarification, confirmation, approval, and Profile-dispatch boundary. Axis
separately verifies rendering, digest/revision approval, execution controls,
malformed-event rejection, accessibility, and responsive behavior. A live
browser journey remains intentionally deferred until provider credentials and
usage credit are configured.
