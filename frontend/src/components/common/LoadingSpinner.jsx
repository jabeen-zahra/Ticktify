export default function LoadingSpinner({ size = 'md', text }) {
  const s = size === 'sm' ? 20 : size === 'lg' ? 48 : 32;
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <svg width={s} height={s} viewBox="0 0 32 32" fill="none"
        style={{ animation:'spin 0.8s linear infinite' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="16" cy="16" r="12" stroke="var(--border)" strokeWidth="3"/>
        <path d="M16 4a12 12 0 0 1 12 12" stroke="var(--accent)" strokeWidth="3"
          strokeLinecap="round"/>
      </svg>
      {text && <p className="text-sm" style={{ color:'var(--text-muted)' }}>{text}</p>}
    </div>
  );
}
