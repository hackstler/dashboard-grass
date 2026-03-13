import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { useAuth } from "./hooks/useAuth";
import { usePermissions } from "./hooks/usePermissions";
import { AppProvider, useApp } from "./context/AppContext";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { Layout } from "./components/Layout";
import { OverviewPage } from "./components/pages/OverviewPage";
import { WhatsAppPage } from "./components/pages/WhatsAppPage";
import { KnowledgeUploadPage } from "./components/pages/KnowledgeUploadPage";
import { KnowledgeListPage } from "./components/pages/KnowledgeListPage";
import { UsersPage } from "./components/pages/UsersPage";
import { OrganizationsPage } from "./components/pages/OrganizationsPage";
import { SettingsPage } from "./components/pages/SettingsPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { MyOrganizationPage } from "./components/pages/MyOrganizationPage";
import { CatalogPage } from "./components/pages/CatalogPage";
import { WhatsAppConnectionsPage } from "./components/pages/WhatsAppConnectionsPage";
import { QuotesPage } from "./components/pages/QuotesPage";
import { ChatPage } from "./components/pages/ChatPage";
import { Skeleton } from "./components/ui/Skeleton";
import type { ActiveView } from "./types";
import type { ReactNode } from "react";

/**
 * Maps each view to its page component.
 * The permission guard is handled centrally via VIEW_PERMISSIONS —
 * no per-view `can()` checks needed here.
 */
const VIEW_COMPONENTS: Record<ActiveView, ReactNode> = {
  overview: <OverviewPage />,
  chat: <ChatPage />,
  whatsapp: <WhatsAppPage />,
  "knowledge-upload": <KnowledgeUploadPage />,
  "knowledge-list": <KnowledgeListPage />,
  users: <UsersPage />,
  organizations: <OrganizationsPage />,
  catalogs: <CatalogPage />,
  "whatsapp-connections": <WhatsAppConnectionsPage />,
  quotes: <QuotesPage />,
  settings: <SettingsPage />,
  profile: <ProfilePage />,
  "my-organization": <MyOrganizationPage />,
};

function AppContent() {
  const auth = useAuth();
  const { authState, setAuthState, activeView, setActiveView, navKey, refreshUser } = useApp();
  const { canView } = usePermissions();

  useEffect(() => {
    if (!auth.isLoggedIn()) {
      setAuthState({ status: "unauthenticated" });
      return;
    }
    auth.getMe().then((me) => {
      if (me) {
        setAuthState({ status: "authenticated", user: me });
        setActiveView("overview");
      } else {
        auth.logout();
        setAuthState({ status: "unauthenticated" });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    auth.getMe().then((me) => {
      if (me) {
        setAuthState({ status: "authenticated", user: me });
        setActiveView("overview");
      }
    });
  };

  const handleLogout = () => {
    auth.logout();
    setAuthState({ status: "unauthenticated" });
  };

  const handleOnboardingComplete = async () => {
    await refreshUser();
    setActiveView("overview");
  };

  // Redirect to overview if user is on a view they can't access
  useEffect(() => {
    if (authState.status === "authenticated" && !canView(activeView)) {
      setActiveView("overview");
    }
  }, [authState.status, activeView, canView, setActiveView]);

  if (authState.status === "loading") {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <div className="space-y-4 w-80">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-4 w-64 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (authState.status === "unauthenticated") {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Onboarding gate: if user hasn't completed onboarding, show onboarding page
  if (authState.user.onboardingComplete === false) {
    return <OnboardingPage onComplete={handleOnboardingComplete} />;
  }

  const page = canView(activeView) ? VIEW_COMPONENTS[activeView] : <OverviewPage />;

  return (
    <Layout onLogout={handleLogout}>
      <div className="animate-fade-in-up" key={navKey}>
        {page}
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Switch>
        <Route path="/register">
          <RegisterPage />
        </Route>
        <Route>
          <AppContent />
        </Route>
      </Switch>
    </AppProvider>
  );
}

export default App;
