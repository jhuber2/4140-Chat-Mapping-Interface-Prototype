type RouteResult = {
  nodeId: string | null;
  matchedKeyword: string | null;
};

const routeGroups: Array<{ nodeId: string; keywords: string[] }> = [
  { nodeId: 'planning', keywords: ['meeting', 'schedule', 'time', 'thursday', 'friday', 'timeline', 'deadline', 'due'] },
  { nodeId: 'deliverables', keywords: ['deliverable', 'submit', 'presentation', 'deck', 'slides', 'demo', 'script', 'summary pdf'] },
  { nodeId: 'assignments', keywords: ['research', 'outline', 'slides', 'present', 'presenter', 'demo', 'walk through', 'citations'] },
  { nodeId: 'questions', keywords: ['question', 'confused', 'not sure', 'supposed to', 'unclear', 'scope'] },
  { nodeId: 'decisions', keywords: ['let us', 'lets', 'decide', 'decision', 'going with', 'we should use', 'commit to'] },
  { nodeId: 'issues', keywords: ['cannot', "can't", 'conflict', 'late', 'behind', 'missing', 'have not seen', 'blocked'] },
];

// Lightweight keyword-based routing for incoming chat messages.
export function routeMessageToNode(text: string): RouteResult {
  const lower = text.toLowerCase();

  for (const group of routeGroups) {
    for (const keyword of group.keywords) {
      if (!lower.includes(keyword)) continue;

      if (group.nodeId === 'planning') {
        if (lower.includes('timeline') || lower.includes('deadline') || lower.includes('due') || lower.includes('finish')) {
          return { nodeId: 'planning-timeline', matchedKeyword: keyword };
        }
        if (lower.includes('meeting') || lower.includes('schedule') || lower.includes('time') || lower.includes('thursday') || lower.includes('friday')) {
          return { nodeId: 'planning-meeting-time', matchedKeyword: keyword };
        }
        return { nodeId: 'topic-planning', matchedKeyword: keyword };
      }

      if (group.nodeId === 'deliverables') {
        if (lower.includes('script') || (lower.includes('demo') && lower.includes('script'))) {
          return { nodeId: 'deliverable-demo-script', matchedKeyword: keyword };
        }
        if (lower.includes('presentation') || lower.includes('deck') || lower.includes('slides')) {
          return { nodeId: 'deliverable-presentation', matchedKeyword: keyword };
        }
        return { nodeId: 'planning-deliverables', matchedKeyword: keyword };
      }

      if (group.nodeId === 'assignments') {
        if (lower.includes('research') || lower.includes('outline') || lower.includes('citations')) {
          return { nodeId: 'assign-research', matchedKeyword: keyword };
        }
        if (lower.includes('slides') || lower.includes('deck')) {
          return { nodeId: 'assign-slides', matchedKeyword: keyword };
        }
        if (lower.includes('demo') || lower.includes('present') || lower.includes('walk through') || lower.includes('narrat')) {
          return { nodeId: 'assign-demo', matchedKeyword: keyword };
        }
        return { nodeId: 'topic-assignments', matchedKeyword: keyword };
      }

      if (group.nodeId === 'questions') {
        if (lower.includes('scope') || lower.includes('supposed to')) {
          return { nodeId: 'question-scope', matchedKeyword: keyword };
        }
        return { nodeId: 'question-confusion', matchedKeyword: keyword };
      }

      if (group.nodeId === 'decisions') {
        if (lower.includes('topic') || lower.includes('idea')) {
          return { nodeId: 'decision-topic', matchedKeyword: keyword };
        }
        if (lower.includes('react') || lower.includes('tool') || lower.includes('use')) {
          return { nodeId: 'decision-tool', matchedKeyword: keyword };
        }
        return { nodeId: 'topic-decisions', matchedKeyword: keyword };
      }

      if (group.nodeId === 'issues') {
        if (lower.includes('cannot') || lower.includes("can't") || lower.includes('conflict') || lower.includes('late')) {
          return { nodeId: 'issue-scheduling', matchedKeyword: keyword };
        }
        return { nodeId: 'issue-missing-work', matchedKeyword: keyword };
      }
    }
  }

  if (lower.trim().length > 0) {
    return { nodeId: 'topic-general', matchedKeyword: null };
  }

  return { nodeId: null, matchedKeyword: null };
}
