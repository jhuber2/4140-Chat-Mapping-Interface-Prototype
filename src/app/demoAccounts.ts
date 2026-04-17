export type TeamAccount = {
  id: string;
  username: string;
  password: string;
  displayName: string;
};

const TEAM_PASSWORD = 'cpsc4140';
const TEST_PASSWORD = 'pw';

export const TEAM_ACCOUNTS: TeamAccount[] = [
  { id: 'user', username: 'user', password: TEST_PASSWORD, displayName: 'Test User' },
  { id: 'jack', username: 'jack', password: TEAM_PASSWORD, displayName: 'Jack Huber' },
  { id: 'boyd', username: 'boyd', password: TEAM_PASSWORD, displayName: 'Boyd Coates' },
  { id: 'emmanuel', username: 'emmanuel', password: TEAM_PASSWORD, displayName: 'Emmanuel Jimenez' },
  { id: 'graham', username: 'graham', password: TEAM_PASSWORD, displayName: 'Graham Elgin' },
];

export function findTeamAccount(username: string, password: string): TeamAccount | null {
  const normalized = username.trim().toLowerCase();
  return TEAM_ACCOUNTS.find((a) => a.username === normalized && a.password === password) ?? null;
}
