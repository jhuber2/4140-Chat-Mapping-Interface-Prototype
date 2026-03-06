type RouteResult = {
  nodeId: string | null;
  matchedKeyword: string | null;
};

const routeGroups: Array<{ nodeId: string; keywords: string[] }> = [
  { nodeId: 'topic-auth', keywords: ['auth', 'login', 'token', '401', 'logout', 'session'] },
  { nodeId: 'topic-api', keywords: ['api', 'endpoint', 'response', 'request', 'payload', 'status code'] },
  { nodeId: 'topic-ui', keywords: ['ui', 'frontend', 'button', 'layout', 'figma', 'spacing'] },
  { nodeId: 'topic-deploy', keywords: ['deploy', 'docker', 'env', 'render', 'postgres', 'staging', 'ssl'] },
  { nodeId: 'topic-meeting', keywords: ['meeting', 'schedule', 'tomorrow', 'sync', 'standup', 'demo'] },
];

// This is intentionally simple Wizard-of-Oz keyword routing, not NLP.
export function routeMessageToNode(text: string): RouteResult {
  const lower = text.toLowerCase();

  for (const group of routeGroups) {
    for (const keyword of group.keywords) {
      if (!lower.includes(keyword)) continue;

      if (group.nodeId === 'topic-auth') {
        if (lower.includes('401') || lower.includes('expire') || lower.includes('lifetime')) {
          return { nodeId: 'auth-401-expiration', matchedKeyword: keyword };
        }
        if (lower.includes('header')) {
          return { nodeId: 'auth-401-missing-header', matchedKeyword: keyword };
        }
        if (lower.includes('refresh')) {
          return { nodeId: 'auth-refresh', matchedKeyword: keyword };
        }
        if (lower.includes('logout')) {
          return { nodeId: 'auth-logout', matchedKeyword: keyword };
        }
      }

      if (group.nodeId === 'topic-api') {
        if (lower.includes('validation') || lower.includes('error code') || lower.includes('payload')) {
          return { nodeId: 'api-validation', matchedKeyword: keyword };
        }
        return { nodeId: 'api-response-shape', matchedKeyword: keyword };
      }

      if (group.nodeId === 'topic-ui') {
        if (lower.includes('button') || lower.includes('loading') || lower.includes('disabled')) {
          return { nodeId: 'ui-button-states', matchedKeyword: keyword };
        }
        return { nodeId: 'ui-layout', matchedKeyword: keyword };
      }

      if (group.nodeId === 'topic-deploy') {
        if (lower.includes('postgres') || lower.includes('ssl')) {
          return { nodeId: 'deploy-postgres', matchedKeyword: keyword };
        }
        return { nodeId: 'deploy-docker-env', matchedKeyword: keyword };
      }

      if (group.nodeId === 'topic-meeting') {
        return { nodeId: 'meeting-sprint-planning', matchedKeyword: keyword };
      }

      return { nodeId: group.nodeId, matchedKeyword: keyword };
    }
  }

  if (lower.trim().length > 0) {
    return { nodeId: 'topic-general', matchedKeyword: null };
  }

  return { nodeId: null, matchedKeyword: null };
}
