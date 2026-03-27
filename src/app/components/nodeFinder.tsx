import { useMemo, useState } from 'react';
import type { MapNodeData } from '../types';

export function nodePath(nodeId: string, nodeById: Map<string, MapNodeData>) {
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

export function useNodeFinderState(nodes: MapNodeData[], nodeById: Map<string, MapNodeData>, initialSelectedId: string | null) {
  const roots = useMemo(() => nodes.filter((node) => !node.parentId), [nodes]);
  const [path, setPath] = useState<string[]>(() => (initialSelectedId ? nodePath(initialSelectedId, nodeById) : []));
  const selectedId = path[path.length - 1] ?? null;
  const selectedNode = selectedId ? nodeById.get(selectedId) : null;

  const columns = useMemo(() => {
    const result: MapNodeData[][] = [roots];
    for (const id of path) {
      const node = nodeById.get(id);
      if (!node || node.childrenIds.length === 0) break;
      const nextColumn = node.childrenIds.map((childId) => nodeById.get(childId)).filter((n): n is MapNodeData => Boolean(n));
      result.push(nextColumn);
    }
    return result;
  }, [roots, path, nodeById]);

  const currentPath = selectedId ? nodePath(selectedId, nodeById) : [];

  return { path, setPath, columns, currentPath, selectedId, selectedNode };
}

export function NodeFinderColumns({
  path,
  setPath,
  columns,
  currentPath,
  nodeById,
}: {
  path: string[];
  setPath: (next: string[]) => void;
  columns: MapNodeData[][];
  currentPath: string[];
  nodeById: Map<string, MapNodeData>;
}) {
  return (
    <>
      {currentPath.length > 0 ? (
        <div className="node-breadcrumb">
          {currentPath.map((id, index) => {
            const node = nodeById.get(id);
            if (!node) return null;
            return (
              <button key={id} type="button" onClick={() => setPath(currentPath.slice(0, index + 1))}>
                {node.title}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className="node-columns">
        {columns.map((column, columnIndex) => (
          <div key={columnIndex} className="node-column">
            {column.map((node) => (
              <button
                type="button"
                key={node.id}
                className={path[columnIndex] === node.id ? 'selected' : ''}
                onClick={() => setPath([...path.slice(0, columnIndex), node.id])}
              >
                {node.title}
              </button>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}
