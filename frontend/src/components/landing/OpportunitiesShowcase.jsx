import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, ExternalLink } from 'lucide-react';

const SAMPLE = [
  { type:'competition', title:'NUST Procom 2025', org:'NUST Computing Society', deadline:'Mar 30', city:'Islamabad', prize:'PKR 500K', hot:true },
  { type:'scholarship', title:'HEC Need-Based Scholarship', org:'HEC Pakistan', deadline:'Apr 15', city:'Online', prize:'Full Tuition', hot:false },
  { type:'workshop',    title:'Google Cloud Workshop', org:'Google DSC FAST', deadline:'Mar 25', city:'Lahore', prize:'Free', hot:true },
  { type:'competition', title:'ICPC Pakistan Regionals', org:'ACM Pakistan', deadline:'Apr 5', city:'Karachi', prize:'PKR 200K', hot:false },
  { type:'scholarship', title:'Fulbright Program 2025', org:'USEFP', deadline:'May 1', city:'Online', prize:'Full Scholarship', hot:true },
  { type:'workshop',    title:'UI/UX Bootcamp', org:'LUMS CES', deadline:'Mar 28', city:'Lahore', prize:'Certificate', hot:false },
];

const TYPE_CONFIG = {
  competition: { color:'#CBFF47', label:'Competition', bg:'rgba(203,255,71,0.08)', border:'rgba(203,255,71,0.2)' },
  scholarship: { color:'#4ade80', label:'Scholarship', bg:'rgba(74,222,128,0.08)',  border:'rgba(74,222,128,0.2)' },
  workshop:    { color:'#f59e0b', label:'Workshop',    bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.2)' },
};

function OpCard({ type, title, org, deadline, city, prize, hot }) {
  const c = TYPE_CONFIG[type];
  return (
    <div className="group relative p-5 rounded-2xl transition-all duration-250 cursor-pointer"
      style={{
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.07)',
        backdropFilter:'blur(12px)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform='translateY(-3px)';
        e.currentTarget.style.background='rgba(255,255,255,0.06)';
        e.currentTarget.style.borderColor=`${c.color}35`;
        e.currentTarget.style.boxShadow=`0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px ${c.color}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform='none';
        e.currentTarget.style.background='rgba(255,255,255,0.03)';
        e.currentTarget.style.borderColor='rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow='none';
      }}>

      {hot && (
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background:'rgba(203,255,71,0.15)', color:'var(--accent)',
            border:'1px solid rgba(203,255,71,0.25)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          🔥 Hot
        </div>
      )}

      <div className="flex items-start justify-between mb-3 pr-10">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`,
            fontFamily:'Bricolage Grotesque,sans-serif' }}>
          {c.label}
        </span>
      </div>

      <h3 className="font-bold text-sm mb-1 line-clamp-2"
        style={{ fontFamily:'Bricolage Grotesque,sans-serif', color:'var(--text-primary)', lineHeight:1.3 }}>
        {title}
      </h3>
      <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>{org}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs" style={{ color:'var(--text-muted)' }}>
          <span className="flex items-center gap-1"><Calendar size={10}/>{deadline}</span>
          <span className="flex items-center gap-1"><MapPin size={10}/>{city}</span>
        </div>
        {prize && (
          <span className="text-xs font-bold" style={{ color:c.color }}>{prize}</span>
        )}
      </div>
    </div>
  );
}

export default function OpportunitiesShowcase() {
  return (
    <section className="py-28 relative overflow-hidden" style={{ background:'var(--bg-primary)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.15),transparent)' }}/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
              style={{ background:'rgba(203,255,71,0.08)', color:'var(--accent)',
                border:'1px solid rgba(203,255,71,0.2)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              Live Opportunities
            </span>
            <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
              fontSize:'clamp(26px,3.5vw,40px)', color:'var(--text-primary)',
              letterSpacing:'-1px', lineHeight:1.1 }}>
              What's available
              <span style={{ color:'var(--accent)', textShadow:'0 0 25px rgba(203,255,71,0.3)' }}> right now</span>
            </h2>
          </div>
          <Link to="/opportunities"
            className="inline-flex items-center gap-2 text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ color:'var(--accent)' }}>
            View all <ArrowRight size={15}/>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SAMPLE.map(opp => <OpCard key={opp.title} {...opp}/>)}
        </div>
      </div>

      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,rgba(203,255,71,0.15),transparent)' }}/>
    </section>
  );
}
