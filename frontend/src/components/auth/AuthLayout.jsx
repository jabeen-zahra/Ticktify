import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';

const OPPORTUNITY_TYPES = ['Hackathons','Scholarships','Workshops','Competitions','Internships','Seminars','Research'];

const STATS = [
  { value: '500+', label: 'Opportunities' },
  { value: '12K+', label: 'Students' },
  { value: '200+', label: 'Organizers' },
];

function TictifyLogo({ size = 'md', bgOverride }) {
  const s = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none"
        style={{ transition: 'transform 0.2s ease', flexShrink: 0 }}
        className="group-hover:scale-110">
        <rect x="2" y="8" width="32" height="20" rx="4" fill="#CBFF47"/>
        <circle cx="2"  cy="18" r="3.5" fill={bgOverride || '#08090F'}/>
        <circle cx="34" cy="18" r="3.5" fill={bgOverride || '#08090F'}/>
        <line x1="12" y1="8" x2="12" y2="28"
          stroke={bgOverride || '#08090F'} strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M17 18.5L19.5 21L24 16"
          stroke={bgOverride || '#08090F'} strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
          fontSize: size==='sm'?'14px':size==='lg'?'20px':'17px',
          color:'var(--text-primary)', letterSpacing:'-0.4px', lineHeight:1 }}>
          Tictify
        </div>
        <div style={{ fontSize:'8px', letterSpacing:'3px', color:'var(--accent)',
          textTransform:'uppercase', lineHeight:1, marginTop:'2px', fontWeight:600 }}>
          Opportunities
        </div>
      </div>
    </Link>
  );
}

function AnimatedCounter({ value }) {
  return (
    <span style={{ fontFamily:'Bricolage Grotesque,sans-serif',
      color:'var(--accent)', fontWeight:800 }}>
      {value}
    </span>
  );
}

export { TictifyLogo };

export default function AuthLayout({ heading, subheading, children }) {
  const canvasRef = useRef(null);

  // Subtle particle dots on left panel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const dots = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(203,255,71,${d.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row"
      style={{ background:'var(--bg-primary)' }}>

      {/* ── LEFT PANEL ──────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col"
        style={{ background:'var(--bg-secondary)', borderRight:'1px solid var(--border)' }}>

        {/* Particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity:0.7 }} />

        {/* Stripe texture */}
        <div className="absolute inset-0 stripe-bg pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute pointer-events-none"
          style={{ top:'-80px', right:'-80px', width:'320px', height:'320px',
            borderRadius:'50%', background:'radial-gradient(circle,rgba(203,255,71,0.07) 0%,transparent 70%)' }} />
        <div className="absolute pointer-events-none"
          style={{ bottom:'-60px', left:'-60px', width:'240px', height:'240px',
            borderRadius:'50%', background:'radial-gradient(circle,rgba(203,255,71,0.04) 0%,transparent 70%)' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-10 xl:p-12">

          {/* Logo */}
          <div className="anim-fade-up">
            <TictifyLogo size="md" bgOverride="var(--bg-secondary)" />
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center py-10">
            <div className="anim-fade-up delay-1 mb-4">
              <span className="badge badge-accent">
                <span className="glow-dot" style={{width:'5px',height:'5px'}} />
                Pakistan's Student Hub
              </span>
            </div>

            <h2 className="anim-fade-up delay-2 mb-4"
              style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
                fontSize:'clamp(28px,3vw,40px)', lineHeight:1.1, letterSpacing:'-1px',
                color:'var(--text-primary)' }}>
              Find your next<br/>
              <span style={{ color:'var(--accent)' }}>big opportunity.</span>
            </h2>

            <p className="anim-fade-up delay-3 mb-8 text-sm leading-relaxed"
              style={{ color:'var(--text-secondary)', maxWidth:'340px' }}>
              From hackathons at NUST to HEC scholarships — everything curated in one place for Pakistani university students.
            </p>

            {/* Opportunity type pills */}
            <div className="anim-fade-up delay-3 flex flex-wrap gap-2 mb-8">
              {OPPORTUNITY_TYPES.map((t, i) => (
                <span key={t} className="badge"
                  style={{
                    background: i === 0 ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                    color:      i === 0 ? 'var(--bg-primary)' : 'var(--text-muted)',
                    border:     `1px solid ${i === 0 ? 'transparent' : 'var(--border)'}`,
                    animation:  `float ${3.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
                    fontSize:   '11px',
                  }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="anim-fade-up delay-4 flex gap-6 p-4 rounded-2xl"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
              {STATS.map(({ value, label }, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div>
                    <div style={{ fontSize:'22px', lineHeight:1 }}>
                      <AnimatedCounter value={value} />
                    </div>
                    <div style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'3px', fontWeight:500 }}>
                      {label}
                    </div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div style={{ width:'1px', height:'32px', background:'var(--border)' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div className="anim-fade-up delay-5 p-4 rounded-2xl"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid var(--border)' }}>
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_,i) => (
                <svg key={i} width="12" height="12" viewBox="0 0 12 12" fill="#CBFF47">
                  <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3z"/>
                </svg>
              ))}
            </div>
            <p className="text-sm italic mb-2"
              style={{ color:'var(--text-secondary)', lineHeight:1.6 }}>
              "Tictify helped me find the hackathon where I won my first prize."
            </p>
            <p style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:600 }}>
              — Zain Abbas, FAST-NUCES Lahore
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ─────────────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4"
          style={{ borderBottom:'1px solid var(--border)' }}>
          <TictifyLogo size="sm" />
          <span className="badge badge-accent" style={{ fontSize:'9px' }}>Student Hub</span>
        </div>

        {/* Scrollable form area */}
        <div className="flex-1 flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">

            {/* Heading block */}
            <div className="mb-8 anim-fade-up">
              <div className="flex items-center gap-2 mb-3">
                <div className="glow-dot" />
                <span style={{ fontSize:'10px', fontWeight:700, letterSpacing:'3px',
                  color:'var(--accent)', textTransform:'uppercase',
                  fontFamily:'Bricolage Grotesque,sans-serif' }}>
                  Tictify
                </span>
              </div>
              <h1 className="mb-2"
                style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
                  fontSize:'clamp(24px,4vw,32px)', letterSpacing:'-0.5px',
                  color:'var(--text-primary)', lineHeight:1.1 }}>
                {heading}
              </h1>
              <p style={{ fontSize:'14px', color:'var(--text-secondary)', lineHeight:1.6 }}>
                {subheading}
              </p>
            </div>

            {/* Form */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
