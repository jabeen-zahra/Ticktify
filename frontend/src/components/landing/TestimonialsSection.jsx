const TESTIMONIALS = [
  { name:'Zain Abbas', role:'CS Student, FAST-NUCES Lahore', text:'Tictify helped me find the hackathon where I won my first prize. I never would have known about it otherwise.', initials:'ZA', color:'#CBFF47' },
  { name:'Fatima Malik', role:'Software Engineering, NUST', text:'The deadline reminders are a lifesaver. I applied to 3 scholarships this semester and got one!', initials:'FM', color:'#4ade80' },
  { name:'Hassan Raza', role:'Business Admin, LUMS', text:'Finally a platform that understands Pakistani students. Everything is relevant, verified and up to date.', initials:'HR', color:'#60a5fa' },
];

export default function TestimonialsSection() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'var(--bg-secondary)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.15),transparent)' }}/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto text-center mb-14">
          <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(28px,4vw,44px)', color:'var(--text-primary)',
            letterSpacing:'-1px', lineHeight:1.1 }}>
            Students love
            <span style={{ color:'var(--accent)', textShadow:'0 0 25px rgba(203,255,71,0.3)' }}> Tictify</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ name, role, text, initials, color }) => (
            <div key={name} className="p-6 rounded-2xl relative overflow-hidden"
              style={{
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)',
                backdropFilter:'blur(12px)',
              }}>
              {/* Corner glow */}
              <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
                style={{ background:`radial-gradient(circle at top right, ${color}15, transparent 70%)` }}/>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_,i) => (
                  <svg key={i} width="14" height="14" viewBox="0 0 12 12">
                    <path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3z" fill={color}/>
                  </svg>
                ))}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
                "{text}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background:`${color}18`, border:`1px solid ${color}35`, color,
                    fontFamily:'Bricolage Grotesque,sans-serif' }}>
                  {initials}
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>{name}</p>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.15),transparent)' }}/>
    </section>
  );
}
