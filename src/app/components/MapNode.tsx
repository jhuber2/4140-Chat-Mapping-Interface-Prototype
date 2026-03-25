import { MapNodeData } from '../types';

type MapNodeProps = {
  node: MapNodeData;
  x: number;
  y: number;
  isSelected: boolean;
  isPath: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
  onClick: (nodeId: string) => void;
};

export function MapNode({ node, x, y, isSelected, isPath, isHighlighted, isDimmed, onClick }: MapNodeProps) {
  return (
    <button
      className={`map-node depth-${node.depth} ${isSelected ? 'selected' : ''} ${isPath ? 'path' : ''} ${isHighlighted ? 'highlighted' : ''} ${isDimmed ? 'dimmed' : ''}`}
      style={{ left: x, top: y }}
      onClick={() => onClick(node.id)}
    >
      {node.title}
    </button>
  );
}
