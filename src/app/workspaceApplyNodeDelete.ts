import type { MapNodeData, Message } from './types';
import type { WorkspaceSnapshot } from './realtime/protocol';

export function collectSubtreeIdsIncludingSelf(rootId: string, nodes: MapNodeData[]): Set<string> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const ids = new Set<string>();
  const stack = [rootId];
  while (stack.length) {
    const id = stack.pop()!;
    if (ids.has(id)) continue;
    ids.add(id);
    const n = byId.get(id);
    if (n) for (const c of n.childrenIds) stack.push(c);
  }
  return ids;
}

/**
 * Removes a topic and its descendants; any message that referenced any removed node is reassigned to General.
 */
export function applyNodeDeletionSnapshot(snapshot: WorkspaceSnapshot, nodeId: string, generalNodeId: string): WorkspaceSnapshot {
  if (nodeId === generalNodeId || nodeId === '0') return snapshot;

  const deleted = collectSubtreeIdsIncludingSelf(nodeId, snapshot.nodes);
  if (!deleted.has(nodeId)) return snapshot;

  const nextNodes = snapshot.nodes
    .filter((n) => !deleted.has(n.id))
    .map((n) => ({
      ...n,
      childrenIds: n.childrenIds.filter((id) => !deleted.has(id)),
    }));

  const nextMessages: Message[] = snapshot.messages.map((m) => {
    if (!m.nodeIds.some((id) => deleted.has(id))) return m;
    return { ...m, nodeIds: [generalNodeId], autoMapped: false, assignedManually: false };
  });

  const nextUnassigned = snapshot.unassignedMessageIds.filter((id) => {
    const msg = nextMessages.find((m) => m.id === id);
    return Boolean(msg && msg.nodeIds.length === 0);
  });

  return {
    ...snapshot,
    nodes: nextNodes,
    messages: nextMessages,
    unassignedMessageIds: nextUnassigned,
  };
}
