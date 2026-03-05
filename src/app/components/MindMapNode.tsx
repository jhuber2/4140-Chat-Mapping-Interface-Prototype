interface MindMapNodeProps {
  id: string;
  text: string;
  variant: 'root' | 'category' | 'standard' | 'selected' | 'path';
  x: number;
  y: number;
  onClick?: () => void;
}

export function MindMapNode({ text, variant, x, y, onClick }: MindMapNodeProps) {
  const getNodeStyles = () => {
    switch (variant) {
      case 'root':
        return {
          height: '44px',
          padding: '0 18px',
          backgroundColor: '#24324A',
          color: '#D8E1F2',
          fontSize: '15px',
          fontWeight: '600',
          boxShadow: '0px 6px 14px rgba(0,0,0,0.35)',
        };
      case 'category':
        return {
          height: '40px',
          padding: '0 18px',
          backgroundColor: '#22314A',
          color: '#D8E1F2',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0px 6px 14px rgba(0,0,0,0.35)',
        };
      case 'path':
        return {
          height: '40px',
          padding: '0 18px',
          backgroundColor: '#2A4470',
          color: '#E6EDF7',
          fontSize: '14px',
          fontWeight: '600',
          boxShadow: '0px 6px 14px rgba(0,0,0,0.35), 0 0 12px rgba(47,107,255,0.15)',
        };
      case 'selected':
        return {
          height: '40px',
          padding: '0 18px',
          backgroundColor: '#2F6BFF',
          color: '#FFFFFF',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0px 6px 14px rgba(0,0,0,0.35), 0 0 20px rgba(47,107,255,0.25)',
        };
      default: // standard
        return {
          height: '40px',
          padding: '0 18px',
          backgroundColor: '#1E2A3D',
          color: '#C7D2E6',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0px 6px 14px rgba(0,0,0,0.35)',
        };
    }
  };

  const styles = getNodeStyles();

  return (
    <div
      className="absolute flex items-center justify-center whitespace-nowrap"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        borderRadius: '20px',
        cursor: onClick ? 'pointer' : 'default',
        ...styles,
      }}
      onClick={onClick}
    >
      {text}
    </div>
  );
}
