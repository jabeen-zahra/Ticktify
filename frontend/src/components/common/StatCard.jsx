export default function StatCard({ label, value, icon: Icon, accent = false, delta }) {
  return (
    <div className="card-elevated flex items-start justify-between"
      style={{ borderColor: accent ? 'var(--border-accent)' : 'var(--border)' }}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-2"
          style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          {label}
        </p>
        <p style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
          fontSize:'28px', color: accent ? 'var(--accent)' : 'var(--text-primary)',
          lineHeight:1, letterSpacing:'-1px' }}>
          {value}
        </p>
        {delta && (
          <p className="text-xs mt-1.5" style={{ color:'var(--text-muted)' }}>{delta}</p>
        )}
      </div>
      {Icon && (
        <div className="p-2.5 rounded-xl"
          style={{ background: accent ? 'var(--accent-glow)' : 'rgba(255,255,255,0.04)',
            border:'1px solid var(--border)' }}>
          <Icon size={18} style={{ color: accent ? 'var(--accent)' : 'var(--text-muted)' }}/>
        </div>
      )}
    </div>
  );
}
