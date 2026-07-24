import React, { lazy, Suspense } from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { AppShell } from '../layout/index.js';
import { Loader } from '../design-system/index.js';
import { useWallet } from '../hooks/useWallet.js';
import { Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { pageVariants } from '../theme/animations.js';

// Lazy loaded pages
const Landing = lazy(() => import('../pages/Landing/index.js'));
const CreateWallet = lazy(() => import('../pages/CreateWallet/index.js'));
const ImportWallet = lazy(() => import('../pages/ImportWallet/index.js'));
const Unlock = lazy(() => import('../pages/Unlock/index.js'));
const Dashboard = lazy(() => import('../pages/Dashboard/index.js'));
const Send = lazy(() => import('../pages/Send/index.js'));
const Receive = lazy(() => import('../pages/Receive/index.js'));
const Portfolio = lazy(() => import('../pages/Portfolio/index.js'));
const TokenDetails = lazy(() => import('../pages/TokenDetails/index.js'));
const NFTDetails = lazy(() => import('../pages/NFTDetails/index.js'));
const Activity = lazy(() => import('../pages/Activity/index.js'));
const Settings = lazy(() => import('../pages/Settings/index.js'));
const WalletConnectSettings = lazy(() => import('../pages/WalletConnect/index.js'));
const Security = lazy(() => import('../pages/Security/index.js'));
const HiddenAccountsPage = lazy(() => import('../pages/Settings/HiddenAccountsPage.js'));
const Developer = lazy(() => import('../pages/Developer/index.js'));
const Networks = lazy(() => import('../pages/Networks/index.js'));
const NotFound = lazy(() => import('../pages/NotFound/index.js'));

// Real Settings Pages
const ChangePasswordPage = lazy(() =>
  import('../pages/Settings/ChangePasswordPage.js').then((m) => ({ default: m.ChangePasswordPage }))
);
const TwoFactorPage = lazy(() =>
  import('../pages/Settings/TwoFactorPage.js').then((m) => ({ default: m.TwoFactorPage }))
);
const RecoveryPage = lazy(() =>
  import('../pages/Settings/RecoveryPage.js').then((m) => ({ default: m.RecoveryPage }))
);
const LanguagePage = lazy(() =>
  import('../pages/Settings/LanguagePage.js').then((m) => ({ default: m.LanguagePage }))
);
const NotificationsPage = lazy(() =>
  import('../pages/Settings/NotificationsPage.js').then((m) => ({ default: m.NotificationsPage }))
);
const DevicesPage = lazy(() =>
  import('../pages/Settings/DevicesPage.js').then((m) => ({ default: m.DevicesPage }))
);
const ProfilePage = lazy(() =>
  import('../pages/Settings/ProfilePage.js').then((m) => ({ default: m.ProfilePage }))
);
const ImportAccountPage = lazy(() =>
  import('../pages/Settings/ImportAccountPage.js').then((m) => ({ default: m.ImportAccountPage }))
);

const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loader />}>{children}</Suspense>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLocked, hasVault } = useWallet();

  if (!hasVault) {
    return <Navigate to="/" replace />;
  }

  if (isLocked) {
    return <Navigate to="/unlock" replace />;
  }

  return <>{children}</>;
};

const AnimatedOutlet = () => {
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={shouldReduceMotion ? { duration: 0 } : {}}
        style={{ width: '100%', height: '100%' }}
      >
        <SuspenseWrapper>
          <Outlet />
        </SuspenseWrapper>
      </motion.div>
    </AnimatePresence>
  );
};

const AppLayout = () => {
  return (
    <ProtectedRoute>
      <AppShell>
        <AnimatedOutlet />
      </AppShell>
    </ProtectedRoute>
  );
};

const BaseLayout = () => {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent'
      }}
    >
      <AnimatedOutlet />
    </div>
  );
};

export const router = createHashRouter([
  {
    path: '/',
    element: <BaseLayout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/create-wallet', element: <CreateWallet /> },
      { path: '/import-wallet', element: <ImportWallet /> },
      { path: '/unlock', element: <Unlock /> }
    ]
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/send', element: <Send /> },
      { path: '/receive', element: <Receive /> },
      { path: '/portfolio', element: <Portfolio /> },
      { path: '/token/:address', element: <TokenDetails /> },
      { path: '/nft/:chainId/:contract/:tokenId', element: <NFTDetails /> },
      { path: '/activity', element: <Activity /> },
      { path: '/settings', element: <Settings /> },
      { path: '/settings/profile', element: <ProfilePage /> },
      { path: '/settings/import-account', element: <ImportAccountPage /> },
      { path: '/settings/language', element: <LanguagePage /> },
      { path: '/settings/notifications', element: <NotificationsPage /> },
      { path: '/networks', element: <Networks /> },
      { path: '/walletconnect', element: <WalletConnectSettings /> },
      { path: '/security', element: <Security /> },
      { path: '/security/password', element: <ChangePasswordPage /> },
      { path: '/security/2fa', element: <TwoFactorPage /> },
      { path: '/security/hidden-accounts', element: <HiddenAccountsPage /> },
      { path: '/security/recovery', element: <RecoveryPage /> },
      { path: '/security/devices', element: <DevicesPage /> },
      { path: '/developer', element: <Developer /> }
    ]
  },
  {
    path: '*',
    element: <BaseLayout />,
    children: [{ path: '*', element: <NotFound /> }]
  }
]);

export const AppRouter = () => {
  return <RouterProvider router={router} />;
};
