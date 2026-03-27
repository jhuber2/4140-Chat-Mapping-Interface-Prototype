import { Message } from '../types';
import { MapNodeData } from '../types';
import type { NodeSearchResult } from '../mapUtils';
import { MapCanvas } from './MapCanvas';
import { NodeDetailPanel } from './NodeDetailPanel';

type MapViewProps = {
  nodes: MapNodeData[];
  selectedNodeId: string | null;
  expandedNodeIds: Set<string>;
  inStartupOverview: boolean;
  highlightedNodeIds: Set<string>;
  breadcrumbNodeIds: string[];
  searchQuery: string;
  searchResults: NodeSearchResult[];
  messages: Message[];
  messagesVisible: boolean;
  senderColorByName: Map<string, string>;
  onSelectNode: (nodeId: string) => void;
  onToggleMessages: () => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onResultSelect: (nodeId: string) => void;
  onBreadcrumbSelect: (nodeId: string) => void;
  onViewInChat: (messageId: string) => void;
};

export function MapView({
  nodes,
  selectedNodeId,
  expandedNodeIds,
  inStartupOverview,
  highlightedNodeIds,
  breadcrumbNodeIds,
  searchQuery,
  searchResults,
  messages,
  messagesVisible,
  senderColorByName,
  onSelectNode,
  onToggleMessages,
  onSearchChange,
  onClearSearch,
  onResultSelect,
  onBreadcrumbSelect,
  onViewInChat,
}: MapViewProps) {
  const selectedNode = nodes.find((node) => node.id === selectedNodeId);
  const shouldShowDetailsPanel = Boolean(selectedNode && selectedNode.id !== '0');

  return (
    <section className={`map-view-layout ${shouldShowDetailsPanel ? 'has-detail-panel' : 'no-detail-panel'}`}>
      <MapCanvas
        nodes={nodes}
        selectedNodeId={selectedNodeId}
        expandedNodeIds={expandedNodeIds}
        inStartupOverview={inStartupOverview}
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
      {shouldShowDetailsPanel ? (
        <NodeDetailPanel
          node={selectedNode}
          messages={messages}
          messagesVisible={messagesVisible}
          senderColorByName={senderColorByName}
          onToggleMessages={onToggleMessages}
          onViewInChat={onViewInChat}
        />
      ) : null}
    </section>
  );
}
