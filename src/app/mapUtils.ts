import { MapNodeData, Message } from './types';

function parseTimestamp(value: string) {
  const parsed = new Date(`${value}, 2023`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toDateLabel(date: Date | null) {
  if (!date) return undefined;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function collectDescendants(startId: string, childrenByParent: Map<string, string[]>) {
  const collected: string[] = [];
  const stack = [startId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    collected.push(current);
    const children = childrenByParent.get(current) ?? [];
    for (const child of children) stack.push(child);
  }

  return collected;
}

// Derives consistent node stats from message assignments to keep chat/map synchronized.
export function deriveNodesWithMessageData(structureNodes: MapNodeData[], messages: Message[]): MapNodeData[] {
  const childrenByParent = new Map<string, string[]>();
  const directMessageIds = new Map<string, string[]>();

  structureNodes.forEach((node) => {
    if (node.parentId) {
      const siblings = childrenByParent.get(node.parentId) ?? [];
      childrenByParent.set(node.parentId, siblings.concat(node.id));
    }
    directMessageIds.set(node.id, []);
  });

  messages.forEach((message) => {
    message.nodeIds.forEach((nodeId) => {
      if (directMessageIds.has(nodeId)) {
        directMessageIds.set(nodeId, (directMessageIds.get(nodeId) ?? []).concat(message.id));
      }
    });
  });

  return structureNodes.map((node) => {
    const subtreeNodeIds = collectDescendants(node.id, childrenByParent);
    const subtreeMessages = messages.filter((message) => message.nodeIds.some((id) => subtreeNodeIds.includes(id)));
    const sorted = subtreeMessages
      .map((message) => parseTimestamp(message.timestamp))
      .filter((date): date is Date => Boolean(date))
      .sort((a, b) => a.getTime() - b.getTime());

    return {
      ...node,
      supportingMessageIds: directMessageIds.get(node.id) ?? [],
      metadata: {
        firstDiscussed: toDateLabel(sorted[0] ?? null),
        lastActive: toDateLabel(sorted[sorted.length - 1] ?? null),
        totalMessages: subtreeMessages.length,
      },
    };
  });
}

export type NodeSearchResult = {
  nodeId: string;
  reason: string;
  messageCount: number;
};

export function getPathToRoot(nodeId: string, nodes: MapNodeData[]) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const path: string[] = [];
  let current: string | null = nodeId;

  while (current) {
    const node = nodeById.get(current);
    if (!node) break;
    path.unshift(node.id);
    current = node.parentId;
  }

  return path;
}

export function searchNodeContexts(query: string, nodes: MapNodeData[], messages: Message[]): NodeSearchResult[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  const terms = normalized.split(/[^a-z0-9]+/).filter((term) => term.length >= 2);
  if (terms.length === 0) return [];

  return nodes
    .map((node) => {
      const loweredTitle = node.title.toLowerCase();
      const directMessages = messages.filter((message) => message.nodeIds.includes(node.id));
      const matchingTitleTerms = terms.filter((term) => loweredTitle.includes(term));
      const matchingMessages = directMessages.filter((message) => {
        const loweredText = message.text.toLowerCase();
        return terms.some((term) => loweredText.includes(term));
      });

      if (matchingTitleTerms.length === 0 && matchingMessages.length === 0) return null;

      const matchingMessageTerms = terms.filter((term) =>
        matchingMessages.some((message) => message.text.toLowerCase().includes(term))
      );
      const score = matchingTitleTerms.length * 3 + matchingMessageTerms.length * 2 + matchingMessages.length;
      const reasonParts: string[] = [];

      if (matchingTitleTerms.length > 0) reasonParts.push(`Title: ${matchingTitleTerms.join(', ')}`);
      if (matchingMessageTerms.length > 0) reasonParts.push(`Messages: ${matchingMessageTerms.join(', ')}`);

      return {
        nodeId: node.id,
        reason: reasonParts.join(' · ') || 'Matched related context',
        messageCount: matchingMessages.length,
        score,
      };
    })
    .filter((result): result is NodeSearchResult & { score: number } => Boolean(result))
    .sort((a, b) => b.score - a.score || b.messageCount - a.messageCount || a.nodeId.localeCompare(b.nodeId))
    .map(({ score: _score, ...result }) => result);
}

/**
 * Approximates rendered .map-node size from title + depth so connector geometry can match CSS
 * (min-width 108px, max-width 230px, padding 9px 14px, border 1px, line-height 1.3).
 */
export function estimateMapNodeSize(node: MapNodeData): { width: number; height: number } {
  const padH = 28;
  const padV = 18;
  const border = 2;
  const fontSize = node.depth === 0 ? 14 : 13;
  const lineHeight = fontSize * 1.3;
  const avgCharPx = fontSize * 0.52;
  const innerMax = 230 - padH - border;
  const rawTextW = node.title.length * avgCharPx;

  let width: number;
  let lines: number;

  if (rawTextW <= innerMax) {
    width = Math.max(108, Math.min(230, Math.ceil(rawTextW) + padH + border));
    lines = 1;
  } else {
    width = 230;
    const charsPerLine = Math.max(1, Math.floor(innerMax / avgCharPx));
    lines = Math.max(1, Math.ceil(node.title.length / charsPerLine));
  }

  const height = padV + border + lines * lineHeight;
  return { width, height };
}
