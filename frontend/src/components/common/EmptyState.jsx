export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)' }}>
          <span style={{ color:'var(--text-muted)', fontSize:'28px' }}>{icon}</span>
        </div>
      )}
      <h3 className="text-lg font-bold mb-2"
        style={{ fontFamily:'Bricolage Grotesque,sans-serif', color:'var(--text-primary)' }}>
        {title}
      </h3>
      {description && (
        <p className="text-sm mb-6 max-w-sm" style={{ color:'var(--text-muted)', lineHeight:1.6 }}>
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
