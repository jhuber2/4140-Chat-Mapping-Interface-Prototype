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
