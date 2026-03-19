import { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import type { User, ActiveView, Toast, ToastType, AuthState } from "../types";
import { getMe } from "../api/auth";

interface AppContextValue {
  authState: AuthState;
  setAuthState: (state: AuthState) => void;
  user: User | null;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  navKey: number;
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
  refreshUser: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

let toastId = 0;

export function AppProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [activeView, setActiveViewRaw] = useState<ActiveView>("overview");
  const [navKey, setNavKey] = useState(0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const setActiveView = useCallback((view: ActiveView) => {
    setActiveViewRaw(view);
    setNavKey((k) => k + 1);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = String(++toastId);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await getMe();
    if (me) {
      setAuthState({ status: "authenticated", user: me });
    }
  }, []);

  const user = authState.status === "authenticated" ? authState.user : null;

  return (
    <AppContext.Provider
      value={{
        authState,
        setAuthState,
        user,
        activeView,
        setActiveView,
        navKey,
        toasts,
        addToast,
        removeToast,
        refreshUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
