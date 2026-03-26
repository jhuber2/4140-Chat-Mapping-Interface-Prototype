type RouteResult = {
  nodeId: string | null;
  matchedKeyword: string | null;
};

const routeRules: Array<{ nodeId: string; keywords: string[] }> = [
  { nodeId: '1.1', keywords: ['meeting', 'tuesday', 'wednesday', 'weekly'] },
  { nodeId: '1.2', keywords: ['teams', 'planner', 'task tracking', 'organized'] },

  { nodeId: '2.2.1', keywords: ['stakeholders', 'stakeholder', 'students', 'instructors'] },
  { nodeId: '2.2.2', keywords: ['tools', 'teams', 'discord', 'texts', 'timeline', 'shared docs'] },
  { nodeId: '2.2.3', keywords: ['tasks', 'past decisions', 'catching up', 'responsible'] },
  { nodeId: '2.2.4', keywords: ['interviews', 'interview', 'research methods', 'background research'] },
  { nodeId: '2.1', keywords: ['problem areas', 'problem', 'buried', 'messy'] },

  { nodeId: '3.1.1', keywords: ['mapping', 'chat interface', 'topics visually'] },
  { nodeId: '3.1.2', keywords: ['mobile summary', 'mobile'] },
  { nodeId: '3.1.3', keywords: ['dashboard', 'status and responsibilities'] },
  { nodeId: '3.2.1', keywords: ['strengths', 'weaknesses', 'downside'] },
  { nodeId: '3.2.2', keywords: ['best direction', 'prototype direction', 'most unique'] },
  { nodeId: '3.1', keywords: ['different designs', 'designs'] },

  { nodeId: '4.1.1', keywords: ['interactive front end', 'backend can be simulated', 'core features', 'chat view', 'map view'] },
  { nodeId: '4.1.2', keywords: ['walkthrough', 'screenshots', 'report'] },
  { nodeId: '4.2.1', keywords: ['measurable success', 'benchmark', 'how fast', 'number of clicks', 'complete the task'] },
  { nodeId: '4.2.2', keywords: ['think-aloud', 'follow-up interview', 'qualitative'] },
  { nodeId: '4.3', keywords: ['design challenge', 'split into', 'own leaf', 'implementation challenges'] },
  { nodeId: '5', keywords: ['quick check-in', 'on track overall', 'nice progress', 'easier to demo'] },
];

export function routeMessageToNode(text: string): RouteResult {
  const lower = text.toLowerCase().trim();
  if (!lower) return { nodeId: null, matchedKeyword: null };

  for (const rule of routeRules) {
    for (const keyword of rule.keywords) {
      if (lower.includes(keyword)) {
        return { nodeId: rule.nodeId, matchedKeyword: keyword };
      }
    }
  }

  return { nodeId: '5', matchedKeyword: null };
}
