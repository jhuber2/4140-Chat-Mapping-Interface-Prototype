export function EmptyDetailPanel() {
  return (
    <div
      className="absolute right-8 top-[180px]"
      style={{
        width: '520px',
        backgroundColor: '#121C2F',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0px 20px 50px rgba(0,0,0,0.45)',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          height: '200px',
          fontSize: '15px',
          color: '#8FA3C7',
        }}
      >
        Select a node to view details.
      </div>
    </div>
  );
}
