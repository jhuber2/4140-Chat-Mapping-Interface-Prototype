import type { TeamAccount } from './demoAccounts';

export type SessionUser = {
  userId: string;
  displayName: string;
};

const STORAGE_KEY = 'gpp-workspace-session';

export function readSession(): SessionUser | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser | null;
    if (!parsed?.displayName || !parsed?.userId) return null;
    if (parsed.userId === 'guest') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSession(user: SessionUser) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function sessionFromAccount(account: TeamAccount): SessionUser {
  return { userId: account.id, displayName: account.displayName };
}
