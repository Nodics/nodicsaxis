import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';

import {
  authenticateEmployee,
  logoutEmployee,
  restoreEmployeeSession,
  type EmployeeSession,
} from '../auth/employeeAuthClient';
import {
  loadAuthenticatedBootstrap,
  loadPublicBootstrap,
  selectModuleConnection,
  type AxisAuthenticatedBootstrap,
  type AxisEmployeePolicy,
  type AxisPublicBootstrap,
} from '../bootstrap/publicBootstrap';
import { AssistantRoutePage } from '../assistant/AssistantRoutePage';
import { WorkbenchRoutePage } from '../workbench/WorkbenchRoutePage';
import { DocumentationRoutePage } from '../documentation/DocumentationRoutePage';
import { useIdleScreenLock } from '../auth/useIdleScreenLock';
import type { CmsRendererActions } from '../cms/renderers/shared/rendererTypes';
import { useRuntimeConfig } from '../runtime/RuntimeConfigContext';
import { CmsRoutePage } from './CmsRoutePage';
import { LoadingScreen } from './LoadingScreen';
import { ModuleWorkspacePlaceholder } from './ModuleWorkspacePlaceholder';
import { RecoveryScreen } from './RecoveryScreen';
import { AppShell } from './shell/AppShell';

export function App() {
  const runtime = useRuntimeConfig();
  const navigate = useNavigate();
  const location = useLocation();
  const [attempt, setAttempt] = useState(0);
  const [bootstrap, setBootstrap] = useState<AxisPublicBootstrap>();
  const [bootstrapError, setBootstrapError] = useState<string>();
  const [session, setSession] = useState<EmployeeSession>();
  const [authenticatedBootstrap, setAuthenticatedBootstrap] =
    useState<AxisAuthenticatedBootstrap>();
  const [employeePolicy, setEmployeePolicy] = useState<AxisEmployeePolicy>();
  const [locked, setLocked] = useState(false);
  const [lockedReturnPath, setLockedReturnPath] = useState('/dashboard');
  const [authenticationError, setAuthenticationError] = useState<string>();
  const [restoringSession, setRestoringSession] = useState(true);

  useEffect(() => {
    let active = true;
    void loadPublicBootstrap(
      runtime.backofficeBaseUrl,
      runtime.clientContractVersion,
      runtime.requestTimeoutMs,
    )
      .then((value) => {
        if (active) setBootstrap(value);
      })
      .catch((error: unknown) => {
        if (active) {
          setBootstrapError(
            error instanceof Error ? error.message : 'BackOffice discovery failed',
          );
        }
      });
    return () => {
      active = false;
    };
  }, [attempt, runtime]);

  useEffect(() => {
    if (!bootstrap || !restoringSession) return;
    let active = true;
    void restoreEmployeeSession(
      bootstrap.endpoints.profile,
      runtime.enterpriseCode,
      runtime.browserSessionCsrfCookieName,
      runtime.requestTimeoutMs,
    )
      .then(async (nextSession) => {
        const employeeBootstrap = await loadAuthenticatedBootstrap(
          runtime.backofficeBaseUrl,
          runtime.clientContractVersion,
          nextSession.accessToken,
          runtime.requestTimeoutMs,
        );
        if (!active) return;
        setSession(nextSession);
        setAuthenticatedBootstrap(employeeBootstrap);
        setEmployeePolicy(employeeBootstrap.axisPolicy);
      })
      .catch(() => {
        if (active) {
          setSession(undefined);
          setAuthenticatedBootstrap(undefined);
          setEmployeePolicy(undefined);
        }
      })
      .finally(() => {
        if (active) setRestoringSession(false);
      });
    return () => {
      active = false;
    };
  }, [bootstrap, restoringSession, runtime]);

  const lockScreen = useCallback(() => {
    if (!session || locked) return;
    const returnPath = ['/login', '/forgot-password', '/lock-screen'].includes(
      location.pathname,
    )
      ? '/dashboard'
      : location.pathname;
    setLockedReturnPath(returnPath);
    setAuthenticationError(undefined);
    setLocked(true);
    void navigate('/lock-screen', { replace: true });
  }, [location.pathname, locked, navigate, session]);

  useIdleScreenLock(
    Boolean(session) && !locked && employeePolicy?.screenLockEnabled === true,
    employeePolicy?.idleTimeoutSeconds ?? 900,
    lockScreen,
  );

  if (bootstrapError) {
    return (
      <RecoveryScreen
        state={{ kind: 'backoffice', detail: bootstrapError, retryable: true }}
        onRetry={() => {
          setBootstrap(undefined);
          setBootstrapError(undefined);
          setAttempt((current) => current + 1);
        }}
      />
    );
  }
  if (!bootstrap || restoringSession) return <LoadingScreen />;

  const composition = bootstrap.uiComposition;
  const assistantNavigation = authenticatedBootstrap?.navigation.find(
    (item) => item.id === 'assistant' && item.moduleName === 'aiAssistant',
  );
  const assistantConnection = authenticatedBootstrap
    ? selectModuleConnection(authenticatedBootstrap, 'aiAssistant')
    : undefined;
  const workbenchNavigation = authenticatedBootstrap?.navigation.find(
    (item) => item.id === 'schema-workbench' && item.moduleName === 'backoffice',
  );
  const documentationNavigation = authenticatedBootstrap?.navigation.find(
    (item) => item.id === 'documentation' && item.moduleName === 'backoffice',
  );
  const importConnection = authenticatedBootstrap
    ? selectModuleConnection(authenticatedBootstrap, 'system')
    : undefined;
  const page = (
    path: string,
    accessToken?: string,
    actions?: CmsRendererActions,
    onLogout?: () => void,
  ) => (
    <CmsRoutePage
      accessToken={accessToken}
      actions={actions}
      authenticationError={authenticationError}
      channel={composition.channel}
      cmsBaseUrl={bootstrap.endpoints.cms}
      enterpriseCode={runtime.enterpriseCode}
      locale={composition.locale}
      onLogout={onLogout}
      path={path}
      site={composition.site}
      timeoutMs={runtime.requestTimeoutMs}
    />
  );

  const login = async (loginId: string, password: string) => {
    setAuthenticationError(undefined);
    try {
      const nextSession = await authenticateEmployee(
        bootstrap.endpoints.profile,
        runtime.enterpriseCode,
        loginId,
        password,
        runtime.requestTimeoutMs,
      );
      const employeeBootstrap = await loadAuthenticatedBootstrap(
        runtime.backofficeBaseUrl,
        runtime.clientContractVersion,
        nextSession.accessToken,
        runtime.requestTimeoutMs,
      );
      setSession(nextSession);
      setAuthenticatedBootstrap(employeeBootstrap);
      setEmployeePolicy(employeeBootstrap.axisPolicy);
      setLocked(false);
      void navigate(composition.defaultAuthenticatedPage, { replace: true });
    } catch (error: unknown) {
      setSession(undefined);
      setAuthenticationError(
        error instanceof Error ? error.message : 'Employee authentication failed',
      );
    }
  };

  const logout = () => {
    const current = session;
    if (!current) {
      void navigate(composition.defaultPublicPage, { replace: true });
      return;
    }
    setAuthenticationError(undefined);
    void logoutEmployee(
      bootstrap.endpoints.profile,
      runtime.enterpriseCode,
      runtime.browserSessionCsrfCookieName,
      runtime.requestTimeoutMs,
    )
      .then(() => {
        setSession(undefined);
        setAuthenticatedBootstrap(undefined);
        setEmployeePolicy(undefined);
        setLocked(false);
        void navigate(composition.defaultPublicPage, { replace: true });
      })
      .catch(() => {
        setAuthenticationError(
          'Secure logout could not be completed. Please retry before leaving this device.',
        );
        setLocked(true);
        void navigate('/lock-screen', { replace: true });
      });
  };

  const unlock = async (password: string) => {
    if (!session) return;
    setAuthenticationError(undefined);
    try {
      const nextSession = await authenticateEmployee(
        bootstrap.endpoints.profile,
        runtime.enterpriseCode,
        session.loginId,
        password,
        runtime.requestTimeoutMs,
      );
      const employeeBootstrap = await loadAuthenticatedBootstrap(
        runtime.backofficeBaseUrl,
        runtime.clientContractVersion,
        nextSession.accessToken,
        runtime.requestTimeoutMs,
      );
      setSession(nextSession);
      setAuthenticatedBootstrap(employeeBootstrap);
      setEmployeePolicy(employeeBootstrap.axisPolicy);
      setLocked(false);
      void navigate(lockedReturnPath, { replace: true });
    } catch (error: unknown) {
      setAuthenticationError(
        error instanceof Error ? error.message : 'Employee unlock failed',
      );
    }
  };

  const authenticatedShell = (content: ReactNode) => (
    <AppShell
      catalog={composition.catalog}
      employeeId={session?.loginId}
      enterpriseCode={runtime.enterpriseCode}
      environments={authenticatedBootstrap?.environments}
      tenantCode={authenticatedBootstrap?.tenantCode}
      navigation={authenticatedBootstrap?.navigation}
      site={composition.site}
      onLock={lockScreen}
      onLogout={logout}
    >
      {content}
    </AppShell>
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            replace
            to={
              session
                ? locked
                  ? '/lock-screen'
                  : composition.defaultAuthenticatedPage
                : composition.defaultPublicPage
            }
          />
        }
      />
      <Route
        path="/login"
        element={
          session ? (
            <Navigate
              replace
              to={locked ? '/lock-screen' : composition.defaultAuthenticatedPage}
            />
          ) : (
            page('/login', undefined, {
              onEmployeeLogin: (id, secret) => void login(id, secret),
            })
          )
        }
      />
      <Route path="/forgot-password" element={page('/forgot-password')} />
      <Route
        path="/dashboard"
        element={
          session && !locked && authenticatedBootstrap ? (
            authenticatedShell(page('/dashboard', session.accessToken))
          ) : (
            <Navigate
              replace
              to={session ? '/lock-screen' : composition.defaultPublicPage}
            />
          )
        }
      />
      <Route
        path="/assistant"
        element={
          session && !locked && authenticatedBootstrap && assistantNavigation ? (
            authenticatedShell(
              ['UP', 'DEGRADED'].includes(assistantNavigation.availability) &&
                assistantConnection ? (
                <AssistantRoutePage
                  accessToken={session.accessToken}
                  channel={composition.channel}
                  cmsBaseUrl={bootstrap.endpoints.cms}
                  connection={assistantConnection}
                  employeeId={session.loginId}
                  locale={composition.locale}
                  runtime={runtime}
                  site={composition.site}
                />
              ) : (
                <ModuleWorkspacePlaceholder item={assistantNavigation} />
              ),
            )
          ) : (
            <Navigate
              replace
              to={
                session && !locked
                  ? composition.defaultAuthenticatedPage
                  : session
                    ? '/lock-screen'
                    : composition.defaultPublicPage
              }
            />
          )
        }
      />
      <Route
        path="/schema-workbench"
        element={
          session && !locked && authenticatedBootstrap && workbenchNavigation ? (
            authenticatedShell(
              ['UP', 'DEGRADED'].includes(workbenchNavigation.availability) ? (
                <WorkbenchRoutePage
                  accessToken={session.accessToken}
                  bootstrap={authenticatedBootstrap}
                  channel={composition.channel}
                  cmsBaseUrl={bootstrap.endpoints.cms}
                  employeeId={session.loginId}
                  locale={composition.locale}
                  runtime={runtime}
                  site={composition.site}
                />
              ) : (
                <ModuleWorkspacePlaceholder item={workbenchNavigation} />
              ),
            )
          ) : (
            <Navigate
              replace
              to={
                session && !locked
                  ? composition.defaultAuthenticatedPage
                  : session
                    ? '/lock-screen'
                    : composition.defaultPublicPage
              }
            />
          )
        }
      />
      <Route
        path="/docs/*"
        element={
          session && !locked && authenticatedBootstrap && documentationNavigation ? (
            authenticatedShell(
              ['UP', 'DEGRADED'].includes(documentationNavigation.availability) &&
                importConnection ? (
                <DocumentationRoutePage
                  accessToken={session.accessToken}
                  channel={composition.channel}
                  cmsBaseUrl={bootstrap.endpoints.cms}
                  connection={importConnection}
                  locale={composition.locale}
                  path={location.pathname}
                  runtime={runtime}
                  site={composition.site}
                />
              ) : (
                <ModuleWorkspacePlaceholder item={documentationNavigation} />
              ),
            )
          ) : (
            <Navigate
              replace
              to={
                session && !locked
                  ? composition.defaultAuthenticatedPage
                  : session
                    ? '/lock-screen'
                    : composition.defaultPublicPage
              }
            />
          )
        }
      />
      {session && !locked && authenticatedBootstrap
        ? authenticatedBootstrap.navigation
            .filter(
              (item) =>
                !item.route.startsWith('/docs') &&
                ![
                  '/assistant',
                  '/schema-workbench',
                  '/dashboard',
                  '/login',
                  '/forgot-password',
                  '/lock-screen',
                ].includes(item.route),
            )
            .map((item) => (
              <Route
                key={`${item.moduleName}:${item.id}`}
                path={item.route}
                element={authenticatedShell(<ModuleWorkspacePlaceholder item={item} />)}
              />
            ))
        : null}
      <Route
        path="/lock-screen"
        element={
          session && locked ? (
            page('/lock-screen', session.accessToken, {
              currentEmployeeId: session.loginId,
              onEmployeeUnlock: (password) => void unlock(password),
              onEmployeeSignOut: logout,
            })
          ) : (
            <Navigate
              replace
              to={
                session
                  ? composition.defaultAuthenticatedPage
                  : composition.defaultPublicPage
              }
            />
          )
        }
      />
      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  );
}
