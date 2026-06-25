import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchSession, logoutUser } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      try {
        const session = await fetchSession();
        if (active) {
          setAuth(session);
        }
      } catch {
        if (active) {
          setAuth(null);
        }
      } finally {
        if (active) {
          setReady(true);
        }
      }
    }

    loadSession();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => {
    return {
      role: auth?.role || null,
      email: auth?.email || null,
      userId: auth?.userId || null,
      isAuthenticated: Boolean(auth),
      isAuthReady: ready,
      refreshAuth: async () => {
        try {
          const session = await fetchSession();
          setAuth(session);
          return session;
        } catch {
          setAuth(null);
          return null;
        }
      },
      setAuth,
      logout: async () => {
        try {
          await logoutUser();
        } finally {
          setAuth(null);
        }
      },
      markReady: () => setReady(true),
      clearAuth: () => {
        setAuth(null);
      },
    };
  }, [auth, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
