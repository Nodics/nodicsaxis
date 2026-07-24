# Employee Login, Recovery, Screen Lock, and Dashboard

Axis is an employee Back Office application. Customer credentials must not be
submitted to its login flow.

## Startup journey

1. Axis reads public deployment configuration from `/axis-config.json`.
2. Axis calls the BackOffice public bootstrap.
3. BackOffice returns only active Profile/CMS endpoints and Axis CMS
   composition identifiers.
4. Axis loads `/login` directly from CMS public delivery.
5. Axis sends entered employee credentials directly to Profile.
6. Axis keeps the returned access and refresh tokens in memory only.
7. Axis calls secured BackOffice bootstrap with the access token.
8. BackOffice returns the effective tenant-scoped Axis employee policy,
   authorized module catalogue, navigation contributions, compatibility,
   availability, and client-safe environment observations.
9. Axis constructs its shell from the local Dashboard route plus authorized
   module-owned navigation.
10. If authorized, Axis loads `/dashboard` from authenticated CMS delivery.

A customer login is never used as a fallback. Authentication or authorization
failure keeps the employee outside the dashboard and displays a safe message.

## Password recovery

The public `/forgot-password` page uses the same responsive authentication
layout as login, with CMS-owned introduction, identifier label, placeholder,
action label, assistance, and legal text. Axis intentionally keeps submission
unavailable today because Profile does not yet expose an approved employee
self-recovery API.

Do not simulate success, send identifiers to BackOffice or CMS, or build a
frontend-only reset path. The future Profile contract must be anti-enumeration,
rate-limited, tenant-aware, auditable, and compatible with the existing OTP and
notification authorities before this form is connected.

## Idle screen lock

The secured bootstrap returns `axisPolicy` after employee authentication.
Version 1 supports `screenLockEnabled`, `idleTimeoutSeconds` from 60 through
86,400, the policy contract version and optimistic revision, and whether the
effective policy came from layered defaults or persistence.

Axis observes keyboard, pointer, touch, and wheel activity. Pointer movement is
throttled to one deadline update per second to avoid high-frequency work.
Background-tab timer throttling is handled by comparing the absolute deadline
when the page becomes visible again.

When the deadline passes, Axis:

1. records the current protected route in memory;
2. replaces it with `/lock-screen`;
3. keeps tokens and the employee identifier in memory only;
4. hides protected application content;
5. asks only for the current employee password; and
6. sends that password directly to Profile.

A successful unlock receives fresh Profile tokens, reloads secured BackOffice
bootstrap and policy, and returns to the prior protected route. A failed unlock
stays locked and shows a safe authentication error. “Not you? Sign out” clears
the local session, asks Profile to revoke it, and returns to `/login`.

The screen lock is presentation defense-in-depth. It never replaces bearer
expiry, revocation, Profile authentication, or target-module authorization.
Refreshing the browser clears the memory-only session and requires full login.

## Logout

Axis clears its in-memory session and redirects to `/login` immediately. It
then asks Profile to revoke both tokens. Local logout does not wait for the
network, preventing an unavailable Profile service from leaving an
authenticated interface visible.

## Configuration

The root `.env` contains only public deployment values:

```dotenv
AXIS_BACKOFFICE_BASE_URL=http://localhost:3000
AXIS_ENTERPRISE_CODE=default
AXIS_CLIENT_CONTRACT_VERSION=1
AXIS_REQUEST_TIMEOUT_MS=10000
```

Do not add Profile or CMS URLs. BackOffice discovers them from module
self-registration. Never place passwords or tokens in `.env`, browser storage,
URLs, logs, or query-cache keys.

## Failure behavior

- Invalid configuration uses static configuration recovery.
- BackOffice discovery failure uses static discovery recovery with retry.
- Missing Profile or CMS registration fails public bootstrap closed.
- CMS failure or incompatibility uses static CMS recovery with retry.
- Invalid employee credentials produce a safe login error.
- Missing BackOffice permission rejects the session before dashboard delivery.
- Direct `/dashboard` navigation without an in-memory session redirects to
  `/login`.
- Direct `/lock-screen` navigation without an authenticated locked session
  redirects safely.
- Invalid or incompatible Axis policy rejects authenticated bootstrap.
- Persistent-policy read failure is handled by BackOffice using its safe
  configured default.

Employee password recovery is not yet a Profile capability. The CMS page may
explain the process, but Axis keeps submission disabled until Profile provides
a governed, enumeration-safe recovery contract.

## Verification

```bash
npm run verify
```

Tests cover low-disclosure discovery, policy validation, credential delivery
to Profile, secured bootstrap bearer use, CMS authentication pages,
inactivity boundaries, activity deadline reset, protected routing, and logout
revocation.
