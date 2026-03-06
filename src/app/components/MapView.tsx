import { MapNodeData } from '../types';
import { MapCanvas } from './MapCanvas';
import { NodeDetailPanel } from './NodeDetailPanel';

type MapViewProps = {
  nodes: MapNodeData[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  onSelectNode: (nodeId: string) => void;
  onOpenSupporting: () => void;
};

export function MapView({ nodes, selectedNodeId, expandedNodeIds, onSelectNode, onOpenSupporting }: MapViewProps) {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <section className="map-view-layout">
      <MapCanvas nodes={nodes} selectedNodeId={selectedNodeId} expandedNodeIds={expandedNodeIds} onNodeClick={onSelectNode} />
      <NodeDetailPanel node={selectedNode} onViewMessages={onOpenSupporting} />
    </section>
  );
}
