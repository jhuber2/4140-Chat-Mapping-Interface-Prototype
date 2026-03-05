interface ConnectorProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isActive?: boolean;
}

export function MindMapConnector({ x1, y1, x2, y2, isActive = false }: ConnectorProps) {
  // Calculate control points for smooth Bezier curve
  const controlPointX = x1 + (x2 - x1) * 0.5;
  
  const pathData = `M ${x1} ${y1} C ${controlPointX} ${y1}, ${controlPointX} ${y2}, ${x2} ${y2}`;

  return (
    <path
      d={pathData}
      fill="none"
      stroke={isActive ? '#3B82F6' : 'rgba(255,255,255,0.12)'}
      strokeWidth={isActive ? 2 : 1.5}
      style={{
        filter: isActive ? 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.3))' : 'none',
      }}
    />
  );
}
