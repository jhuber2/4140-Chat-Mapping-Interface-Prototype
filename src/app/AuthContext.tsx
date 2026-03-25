import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { clearSession, readSession, sessionFromAccount, writeSession, type SessionUser } from './authSession';
import { findTeamAccount } from './demoAccounts';

type AuthContextValue = {
  user: SessionUser | null;
  loginWithCredentials: (username: string, password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readSession());

  const loginWithCredentials = useCallback((username: string, password: string) => {
    const account = findTeamAccount(username, password);
    if (!account) return false;
    const next = sessionFromAccount(account);
    writeSession(next);
    setUser(next);
    return true;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loginWithCredentials, logout }), [user, loginWithCredentials, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
