import { Search, Bell, BookmarkCheck, Shield, Zap, Users } from 'lucide-react';

const FEATURES = [
  { icon:Search,       title:'Smart Discovery',     desc:'Filter by category, city, degree level, and deadline. Find exactly what you need in seconds.', glow:'#CBFF47' },
  { icon:Bell,         title:'Deadline Reminders',  desc:'Get email reminders 3 days before deadline. Bookmark and never miss an opportunity again.', glow:'#4ade80' },
  { icon:BookmarkCheck,title:'Application Tracker', desc:'Track from saved → applied → accepted. Stay organized across all your applications.', glow:'#60a5fa' },
  { icon:Shield,       title:'Verified Organizers', desc:'Every organizer is reviewed before posting. No fake listings, no spam.', glow:'#CBFF47' },
  { icon:Zap,          title:'Instant Updates',     desc:'New opportunities from verified organizations appear instantly on your feed.', glow:'#f59e0b' },
  { icon:Users,        title:'Built for Pakistan',  desc:'Tailored for FAST, LUMS, NUST, IBA and 50+ universities across Pakistan.', glow:'#a78bfa' },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'var(--bg-secondary)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.2),transparent)' }}/>

      {/* Background glow */}
      <div className="absolute pointer-events-none"
        style={{ top:'-200px', left:'50%', transform:'translateX(-50%)',
          width:'600px', height:'600px', borderRadius:'50%',
          background:'radial-gradient(circle,rgba(203,255,71,0.04) 0%,transparent 70%)',
          filter:'blur(40px)' }}/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
            style={{ background:'rgba(203,255,71,0.08)', color:'var(--accent)',
              border:'1px solid rgba(203,255,71,0.2)', fontFamily:'Bricolage Grotesque,sans-serif',
              backdropFilter:'blur(8px)' }}>
            Why Tictify
          </span>
          <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(28px,4vw,44px)', color:'var(--text-primary)',
            letterSpacing:'-1.5px', lineHeight:1.1 }}>
            Everything you need
            <span style={{ color:'var(--accent)', textShadow:'0 0 30px rgba(203,255,71,0.3)' }}> in one place</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon:Icon, title, desc, glow }, i) => (
            <div key={title}
              className="group relative p-6 rounded-2xl cursor-default transition-all duration-300"
              style={{
                background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)',
                backdropFilter:'blur(12px)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.background = `rgba(255,255,255,0.06)`;
                e.currentTarget.style.borderColor = `${glow}40`;
                e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px ${glow}20, inset 0 1px 0 rgba(255,255,255,0.1)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.boxShadow = 'none';
              }}>

              {/* Glow dot top-right */}
              <div className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background:glow, boxShadow:`0 0 6px ${glow}` }}/>

              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                style={{
                  background:`${glow}12`,
                  border:`1px solid ${glow}30`,
                }}>
                <Icon size={20} style={{ color:glow }}/>
              </div>
              <h3 className="font-bold text-base mb-2"
                style={{ fontFamily:'Bricolage Grotesque,sans-serif', color:'var(--text-primary)' }}>
                {title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color:'var(--text-secondary)' }}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.15),transparent)' }}/>
    </section>
  );
}
