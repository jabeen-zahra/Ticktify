import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.15),transparent)' }}/>

      {/* Central glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 60% 70% at 50% 50%,rgba(203,255,71,0.07) 0%,transparent 70%)' }}/>

      {/* Decorative ring */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width:'600px', height:'600px', borderRadius:'50%',
          border:'1px solid rgba(203,255,71,0.06)' }}/>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ width:'400px', height:'400px', borderRadius:'50%',
          border:'1px solid rgba(203,255,71,0.08)' }}/>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="mb-6"
          style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(32px,5vw,56px)', color:'var(--text-primary)',
            letterSpacing:'-2px', lineHeight:1.05 }}>
          Your next opportunity
          <br/>
          <span style={{ color:'var(--accent)', textShadow:'0 0 40px rgba(203,255,71,0.4)' }}>
            is waiting for you.
          </span>
        </h2>
        <p className="text-base mb-10" style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
          Join 12,000+ Pakistani students discovering hackathons, scholarships and workshops on Tictify. Free forever for students.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base"
            style={{
              background:'var(--accent)', color:'var(--bg-primary)',
              fontFamily:'Bricolage Grotesque,sans-serif',
              boxShadow:'0 0 40px rgba(203,255,71,0.35)',
              transition:'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 60px rgba(203,255,71,0.55)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 40px rgba(203,255,71,0.35)'; }}>
            Create free account <ArrowRight size={18}/>
          </Link>
          <Link to="/opportunities"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-medium text-base transition-all"
            style={{
              color:'var(--text-secondary)',
              background:'rgba(255,255,255,0.04)',
              border:'1px solid rgba(255,255,255,0.1)',
              backdropFilter:'blur(8px)',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(203,255,71,0.3)'; e.currentTarget.style.color='var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
            Browse first
          </Link>
        </div>
      </div>
    </section>
  );
}
