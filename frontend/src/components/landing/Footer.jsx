import { Link } from 'react-router-dom';

function TictifyLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
        <rect x="2" y="8" width="32" height="20" rx="4" fill="#CBFF47"/>
        <circle cx="2"  cy="18" r="3.5" fill="#08090F"/>
        <circle cx="34" cy="18" r="3.5" fill="#08090F"/>
        <line x1="12" y1="8" x2="12" y2="28" stroke="#08090F" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M17 18.5L19.5 21L24 16" stroke="#08090F" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
          fontSize:'15px', color:'var(--text-primary)', letterSpacing:'-0.4px', lineHeight:1 }}>
          Tictify
        </div>
        <div style={{ fontSize:'7px', letterSpacing:'3px', color:'var(--accent)',
          textTransform:'uppercase', lineHeight:1, marginTop:'2px', fontWeight:700 }}>
          Opportunities
        </div>
      </div>
    </div>
  );
}

const LINKS = {
  Platform: [
    { label:'Browse Opportunities', href:'/opportunities' },
    { label:'Hackathons', href:'/opportunities?type=competition' },
    { label:'Scholarships', href:'/opportunities?type=scholarship' },
    { label:'Workshops', href:'/opportunities?type=workshop' },
  ],
  Account: [
    { label:'Sign Up', href:'/register' },
    { label:'Sign In', href:'/login' },
    { label:'Student Dashboard', href:'/dashboard' },
    { label:'Post an Opportunity', href:'/register' },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background:'var(--bg-primary)', borderTop:'1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <TictifyLogo/>
            <p className="mt-4 text-sm leading-relaxed max-w-xs" style={{ color:'var(--text-muted)' }}>
              Pakistan's student opportunity platform. Connecting university students with hackathons, scholarships, and workshops.
            </p>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                {group}
              </p>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link to={href} className="text-sm transition-colors"
                      style={{ color:'var(--text-secondary)' }}
                      onMouseEnter={e => e.currentTarget.style.color='var(--accent)'}
                      onMouseLeave={e => e.currentTarget.style.color='var(--text-secondary)'}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop:'1px solid var(--border)' }}>
          <p className="text-xs" style={{ color:'var(--text-muted)' }}>
            © 2025 Tictify. Built for Pakistani students.
          </p>
          <p className="text-xs" style={{ color:'var(--text-muted)' }}>
            FAST-NUCES Web Engineering Project — 23L-3061 & 23L-3065
          </p>
        </div>
      </div>
    </footer>
  );
}
