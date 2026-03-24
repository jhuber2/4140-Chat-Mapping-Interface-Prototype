import { PointerEvent, WheelEvent, useMemo, useRef, useState } from 'react';
import { MapNodeData } from '../types';
import { MapNode } from './MapNode';

type LayoutPoint = { x: number; y: number };

type MapCanvasProps = {
  nodes: MapNodeData[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  onNodeClick: (nodeId: string) => void;
};

const depthX: Record<number, number> = {
  0: 120,
  1: 380,
  2: 700,
  3: 1000,
};

const WORLD_WIDTH = 1400;
const WORLD_HEIGHT = 980;

export function MapCanvas({ nodes, selectedNodeId, expandedNodeIds, onNodeClick }: MapCanvasProps) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const [viewport, setViewport] = useState({ x: 40, y: 120, scale: 0.92 });

  const pathIds = useMemo(() => {
    const ids = new Set<string>();
    if (!selectedNodeId) return ids;

    let current = selectedNodeId;
    while (current) {
      ids.add(current);
      const parentId = nodeById.get(current)?.parentId ?? null;
      if (!parentId) break;
      current = parentId;
    }
    return ids;
  }, [selectedNodeId, nodeById]);

  const isVisible = (node: MapNodeData) => {
    if (node.depth <= 1) return true;
    let parentId = node.parentId;
    while (parentId) {
      if (!expandedNodeIds.has(parentId)) return false;
      parentId = nodeById.get(parentId)?.parentId ?? null;
    }
    return true;
  };

  const visibleNodes = useMemo(() => nodes.filter(isVisible), [nodes, expandedNodeIds]);

  const positions = useMemo(() => {
    const map = new Map<string, LayoutPoint>();
    const clampY = (value: number) => Math.max(50, Math.min(WORLD_HEIGHT - 70, value));
    const depth0 = visibleNodes.filter((node) => node.depth === 0);
    const depth1 = visibleNodes.filter((node) => node.depth === 1);
    const depth1Gap = 120;

    depth0.forEach((node, index) => {
      map.set(node.id, { x: depthX[0], y: 420 + index * 70 });
    });

    depth1.forEach((node, index) => {
      map.set(node.id, { x: depthX[1], y: 140 + index * depth1Gap });
    });

    const maxDepth = Math.max(...visibleNodes.map((node) => node.depth), 1);
    for (let depth = 2; depth <= maxDepth; depth += 1) {
      const parentsAtPreviousDepth = visibleNodes.filter((node) => node.depth === depth - 1);
      parentsAtPreviousDepth.forEach((parent) => {
        const parentPosition = map.get(parent.id);
        if (!parentPosition) return;
        const children = visibleNodes.filter((node) => node.parentId === parent.id && node.depth === depth);
        if (children.length === 0) return;

        const childGap = depth === 2 ? 96 : 84;
        const totalHeight = childGap * (children.length - 1);
        const startY = parentPosition.y - totalHeight / 2;

        children.forEach((child, index) => {
          map.set(child.id, {
            x: depthX[depth] ?? 1200,
            y: clampY(startY + index * childGap),
          });
        });
      });
    }

    return map;
  }, [visibleNodes]);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.map-node')) return;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    dragRef.current = { active: true, x: event.clientX, y: event.clientY };
    setViewport((current) => ({ ...current, x: current.x + dx, y: current.y + dy }));
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!(event.ctrlKey || event.metaKey)) {
      setViewport((current) => ({
        ...current,
        x: current.x - event.deltaX,
        y: current.y - event.deltaY,
      }));
      return;
    }

    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) return;

    const scaleDelta = event.deltaY < 0 ? 1.06 : 0.94;
    setViewport((current) => {
      const nextScale = Math.max(0.72, Math.min(1.45, current.scale * scaleDelta));
      const pointerX = event.clientX - rect.left;
      const pointerY = event.clientY - rect.top;
      const worldX = (pointerX - current.x) / current.scale;
      const worldY = (pointerY - current.y) / current.scale;
      const nextX = pointerX - worldX * nextScale;
      const nextY = pointerY - worldY * nextScale;
      return { x: nextX, y: nextY, scale: nextScale };
    });
  };

  return (
    <div className="map-workspace">
      <div className="map-toolbar">
        <button onClick={() => setViewport((current) => ({ ...current, scale: Math.min(current.scale + 0.08, 1.45) }))}>+</button>
        <button onClick={() => setViewport((current) => ({ ...current, scale: Math.max(current.scale - 0.08, 0.72) }))}>-</button>
        <button onClick={() => setViewport({ x: 40, y: 120, scale: 0.92 })}>Reset View</button>
        <span>{Math.round(viewport.scale * 100)}%</span>
      </div>

      <div
        ref={viewportRef}
        className="map-viewport"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div
          className="map-transform-layer"
          style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
        >
          <svg className="connector-layer" viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}>
            {visibleNodes.map((node) => {
              if (!node.parentId) return null;
              const parent = positions.get(node.parentId);
              const child = positions.get(node.id);
              if (!parent || !child) return null;

              const startX = parent.x + 158;
              const startY = parent.y + 18;
              const endX = child.x;
              const endY = child.y + 18;
              const curve = Math.max(46, (endX - startX) * 0.45);
              const d = `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`;
              const active = pathIds.has(node.parentId) && pathIds.has(node.id);
              const faded = selectedNodeId && !active;

              return <path key={`${node.parentId}-${node.id}`} d={d} className={`connector ${active ? 'active' : ''} ${faded ? 'faded' : ''}`} />;
            })}
          </svg>

          {visibleNodes.map((node) => {
            const p = positions.get(node.id);
            if (!p) return null;
            const isPath = selectedNodeId !== node.id && pathIds.has(node.id);
            const isDimmed = Boolean(selectedNodeId && !pathIds.has(node.id) && node.depth > 0);

            return (
              <MapNode
                key={node.id}
                node={node}
                x={p.x}
                y={p.y}
                isSelected={selectedNodeId === node.id}
                isPath={isPath}
                isDimmed={isDimmed}
                onClick={onNodeClick}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
