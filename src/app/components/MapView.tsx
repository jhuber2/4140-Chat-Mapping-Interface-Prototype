import { MapNodeData } from '../types';
import type { NodeSearchResult } from '../mapUtils';
import { MapCanvas } from './MapCanvas';
import { NodeDetailPanel } from './NodeDetailPanel';

type MapViewProps = {
  nodes: MapNodeData[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  highlightedNodeIds: Set<string>;
  breadcrumbNodeIds: string[];
  searchQuery: string;
  searchResults: NodeSearchResult[];
  onSelectNode: (nodeId: string) => void;
  onOpenSupporting: () => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onResultSelect: (nodeId: string) => void;
  onBreadcrumbSelect: (nodeId: string) => void;
};

export function MapView({
  nodes,
  selectedNodeId,
  expandedNodeIds,
  highlightedNodeIds,
  breadcrumbNodeIds,
  searchQuery,
  searchResults,
  onSelectNode,
  onOpenSupporting,
  onSearchChange,
  onClearSearch,
  onResultSelect,
  onBreadcrumbSelect,
}: MapViewProps) {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <section className="map-view-layout">
      <MapCanvas
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        expandedNodeIds={expandedNodeIds}
        highlightedNodeIds={highlightedNodeIds}
        breadcrumbNodeIds={breadcrumbNodeIds}
        searchQuery={searchQuery}
        searchResults={searchResults}
        onNodeClick={onSelectNode}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        onResultSelect={onResultSelect}
        onBreadcrumbSelect={onBreadcrumbSelect}
      />
      <NodeDetailPanel node={selectedNode} onViewMessages={onOpenSupporting} />
    </section>
  );
}
