import { MapNodeData } from '../types';

type MapNodeProps = {
  node: MapNodeData;
  x: number;
  y: number;
  isSelected: boolean;
  isPath: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  isNeutral: boolean;
  onClick: (nodeId: string) => void;
};

export function MapNode({ node, x, y, isSelected, isPath, isHighlighted, isDimmed, isNeutral, onClick }: MapNodeProps) {
  const stateClass = isNeutral ? 'neutral' : isHighlighted ? 'highlighted' : isSelected ? 'selected' : isPath ? 'path' : isDimmed ? 'dimmed' : '';

  return (
    <button
      className={`map-node depth-${node.depth} ${stateClass}`}
      style={{ left: x, top: y }}
      onClick={() => onClick(node.id)}
    >
      {node.title}
    </button>
  );
}
