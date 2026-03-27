import { PointerEvent, WheelEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MapNodeData } from '../types';
import { estimateMapNodeSize, type NodeSearchResult } from '../mapUtils';
import { MapNode } from './MapNode';

type LayoutPoint = { x: number; y: number };

type MapCanvasProps = {
  nodes: MapNodeData[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  inStartupOverview: boolean;
  highlightedNodeIds: Set<string>;
  breadcrumbNodeIds: string[];
  searchQuery: string;
  searchResults: NodeSearchResult[];
  onNodeClick: (nodeId: string) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onResultSelect: (nodeId: string) => void;
  onBreadcrumbSelect: (nodeId: string) => void;
};

const depthX: Record<number, number> = {
  0: 120,
  1: 380,
  2: 700,
  3: 1000,
};

const WORLD_WIDTH = 1400;
const WORLD_HEIGHT = 980;
const DEFAULT_SCALE = 0.9;
type NodeSize = { width: number; height: number };

export function MapCanvas({
  nodes,
  selectedNodeId,
  expandedNodeIds,
  inStartupOverview,
  highlightedNodeIds,
  breadcrumbNodeIds,
  searchQuery,
  searchResults,
  onNodeClick,
  onSearchChange,
  onClearSearch,
  onResultSelect,
  onBreadcrumbSelect,
}: MapCanvasProps) {
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const hasSelection = Boolean(selectedNodeId);
  const isNeutralOverview = !hasSelection && !inStartupOverview;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const transformLayerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ active: boolean; x: number; y: number }>({ active: false, x: 0, y: 0 });
  const didInitialCenterRef = useRef(false);
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: DEFAULT_SCALE });
  const [measuredNodeSizes, setMeasuredNodeSizes] = useState<Record<string, NodeSize>>({});

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
    if (node.depth === 0) return true;
    let parentId = node.parentId;
    while (parentId) {
      if (!expandedNodeIds.has(parentId)) return false;
      parentId = nodeById.get(parentId)?.parentId ?? null;
    }
    return true;
  };

  const visibleNodes = useMemo(() => nodes.filter(isVisible), [nodes, expandedNodeIds, nodeById]);

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

  useLayoutEffect(() => {
    const layer = transformLayerRef.current;
    if (!layer) return;

    const next: Record<string, NodeSize> = {};
    const nodeElements = layer.querySelectorAll<HTMLButtonElement>('.map-node[data-node-id]');
    nodeElements.forEach((element) => {
      const id = element.dataset.nodeId;
      if (!id) return;
      next[id] = { width: element.offsetWidth, height: element.offsetHeight };
    });

    setMeasuredNodeSizes((current) => {
      const currentKeys = Object.keys(current);
      const nextKeys = Object.keys(next);
      if (currentKeys.length !== nextKeys.length) return next;
      for (const key of nextKeys) {
        const currentSize = current[key];
        const nextSize = next[key];
        if (!currentSize || currentSize.width !== nextSize.width || currentSize.height !== nextSize.height) {
          return next;
        }
      }
      return current;
    });
  }, [visibleNodes, positions, selectedNodeId, searchQuery]);

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

    const scaleDelta = event.deltaY < 0 ? 1.06 : 0.94;
    setViewport((current) => {
      const nextScale = Math.max(0.72, Math.min(1.45, current.scale * scaleDelta));
      const rect = viewportRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0 || rect.height <= 0 || visibleNodes.length === 0) {
        return { ...current, scale: nextScale };
      }
      return centerVisibleNodes(rect.width, rect.height, visibleNodes, positions, nextScale);
    });
  };

  const resetViewportForRoot = () => {
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect) {
      setViewport({ x: 0, y: 0, scale: DEFAULT_SCALE });
      return;
    }

    const centered = centerVisibleNodes(rect.width, rect.height, visibleNodes, positions, DEFAULT_SCALE);
    setViewport(centered);
  };

  useEffect(() => {
    if (didInitialCenterRef.current) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0 || visibleNodes.length === 0) return;
    setViewport(centerVisibleNodes(rect.width, rect.height, visibleNodes, positions, DEFAULT_SCALE));
    didInitialCenterRef.current = true;
  }, [positions, visibleNodes]);

  useEffect(() => {
    if (!didInitialCenterRef.current) return;
    const rect = viewportRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0 || visibleNodes.length === 0) return;
    setViewport((current) => centerVisibleNodes(rect.width, rect.height, visibleNodes, positions, current.scale));
  }, [expandedNodeIds, selectedNodeId, visibleNodes, positions]);

  return (
    <div className="map-workspace">
      <div className="map-toolbar">
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() =>
            setViewport((current) => {
              const nextScale = Math.min(current.scale + 0.08, 1.45);
              const rect = viewportRef.current?.getBoundingClientRect();
              if (!rect || rect.width <= 0 || rect.height <= 0 || visibleNodes.length === 0) {
                return { ...current, scale: nextScale };
              }
              return centerVisibleNodes(rect.width, rect.height, visibleNodes, positions, nextScale);
            })
          }
        >
          +
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() =>
            setViewport((current) => {
              const nextScale = Math.max(current.scale - 0.08, 0.72);
              const rect = viewportRef.current?.getBoundingClientRect();
              if (!rect || rect.width <= 0 || rect.height <= 0 || visibleNodes.length === 0) {
                return { ...current, scale: nextScale };
              }
              return centerVisibleNodes(rect.width, rect.height, visibleNodes, positions, nextScale);
            })
          }
        >
          -
        </button>
        <button onClick={resetViewportForRoot}>Reset View</button>
        <span>{Math.round(viewport.scale * 100)}%</span>
      </div>
      <div className="map-search-row">
        <input
          value={searchQuery}
          placeholder="Search topics or supporting messages"
          onChange={(event) => onSearchChange(event.target.value)}
        />
        <button type="button" onClick={onClearSearch} disabled={!searchQuery.trim()}>
          Clear
        </button>
      </div>
      {breadcrumbNodeIds.length > 0 ? (
        <div className="map-breadcrumb">
          {breadcrumbNodeIds.map((nodeId) => {
            const node = nodeById.get(nodeId);
            if (!node) return null;
            return (
              <button key={nodeId} type="button" onClick={() => onBreadcrumbSelect(nodeId)}>
                {node.title}
              </button>
            );
          })}
        </div>
      ) : null}
      <div className={`map-canvas-shell ${searchQuery.trim() ? 'has-search-results' : ''}`}>
        {searchQuery.trim() ? (
          <aside className="map-search-results-panel">
            <div className="map-search-results">
              {searchResults.length > 0 ? (
                searchResults.slice(0, 6).map((result) => {
                  const node = nodeById.get(result.nodeId);
                  if (!node) return null;
                  return (
                    <button key={result.nodeId} type="button" className="search-result-item" onClick={() => onResultSelect(result.nodeId)}>
                      <strong>{node.title}</strong>
                      <span>{result.reason}</span>
                      <span>{result.messageCount} direct supporting messages</span>
                    </button>
                  );
                })
              ) : (
                <p className="map-search-empty">No topics match this search yet.</p>
              )}
            </div>
          </aside>
        ) : null}

        <div
          ref={viewportRef}
          className="map-viewport"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          <div
            ref={transformLayerRef}
            className="map-transform-layer"
            style={{ width: WORLD_WIDTH, height: WORLD_HEIGHT, transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})` }}
          >
            <svg className="connector-layer" viewBox={`0 0 ${WORLD_WIDTH} ${WORLD_HEIGHT}`}>
              {visibleNodes.map((node) => {
                if (!node.parentId) return null;
                const parent = positions.get(node.parentId);
                const child = positions.get(node.id);
                if (!parent || !child) return null;

                const parentData = nodeById.get(node.parentId);
                const childData = nodeById.get(node.id);
                if (!parentData || !childData) return null;

                const parentSize = measuredNodeSizes[parentData.id] ?? estimateMapNodeSize(parentData);
                const childSize = measuredNodeSizes[childData.id] ?? estimateMapNodeSize(childData);
                const startX = parent.x + parentSize.width;
                const startY = parent.y + parentSize.height / 2;
                const endX = child.x;
                const endY = child.y + childSize.height / 2;
                const curve = Math.max(46, (endX - startX) * 0.45);
                const d = `M ${startX} ${startY} C ${startX + curve} ${startY}, ${endX - curve} ${endY}, ${endX} ${endY}`;
                const active = hasSelection ? pathIds.has(node.parentId) && pathIds.has(node.id) : false;
                const highlighted = highlightedNodeIds.has(node.parentId) && highlightedNodeIds.has(node.id);
                const faded = hasSelection && !active && !highlighted;

                return (
                  <path
                    key={`${node.parentId}-${node.id}`}
                    d={d}
                    className={`connector ${active ? 'active' : ''} ${highlighted ? 'highlighted' : ''} ${faded ? 'faded' : ''}`}
                  />
                );
              })}
            </svg>

            {visibleNodes.map((node) => {
              const p = positions.get(node.id);
              if (!p) return null;
              const isPath = hasSelection ? selectedNodeId !== node.id && pathIds.has(node.id) : false;
              const isHighlighted = highlightedNodeIds.has(node.id);
              const isDimmed = inStartupOverview ? node.depth > 0 : hasSelection ? !pathIds.has(node.id) && !isHighlighted && node.depth > 0 : false;

              return (
                <MapNode
                  key={node.id}
                  node={node}
                  x={p.x}
                  y={p.y}
                  isSelected={selectedNodeId === node.id}
                  isPath={isPath}
                  isHighlighted={isHighlighted}
                  isDimmed={isDimmed}
                  isNeutral={isNeutralOverview}
                  onClick={onNodeClick}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function centerVisibleNodes(
  width: number,
  height: number,
  visibleNodes: MapNodeData[],
  positions: Map<string, LayoutPoint>,
  scale: number
) {
  const fallback = { x: 0, y: 0, scale };
  if (visibleNodes.length === 0) return fallback;

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  visibleNodes.forEach((node) => {
    const position = positions.get(node.id);
    if (!position) return;
    const { width, height } = estimateMapNodeSize(node);
    minX = Math.min(minX, position.x);
    maxX = Math.max(maxX, position.x + width);
    minY = Math.min(minY, position.y);
    maxY = Math.max(maxY, position.y + height);
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    return fallback;
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  return {
    x: width / 2 - centerX * scale,
    y: height / 2 - centerY * scale,
    scale,
  };
}
