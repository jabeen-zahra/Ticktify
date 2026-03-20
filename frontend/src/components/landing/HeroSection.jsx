import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Trophy, BookOpen, Users } from 'lucide-react';
import { useEffect, useRef } from 'react';

const MARQUEE_ITEMS = [
  'Hackathons','Scholarships','Workshops','Competitions',
  'Internships','Seminars','Research Programs','Boot Camps',
  'Hackathons','Scholarships','Workshops','Competitions',
  'Internships','Seminars','Research Programs','Boot Camps',
];

const FLOATING_CARDS = [
  { icon: Trophy, label:'NUST Procom', sub:'Prize: PKR 500K', color:'#CBFF47', delay:0 },
  { icon: BookOpen, label:'HEC Scholarship', sub:'Full Tuition', color:'#4ade80', delay:0.5 },
  { icon: Users, label:'Google DSC Workshop', sub:'Free • Online', color:'#60a5fa', delay:1 },
];

export default function HeroSection() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.offsetWidth, H = canvas.offsetHeight;
    canvas.width = W; canvas.height = H;

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.2 + 0.3,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(203,255,71,${p.alpha})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(203,255,71,${0.06 * (1 - dist/100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      style={{ background:'var(--bg-primary)' }}>

      {/* Particle network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"/>

      {/* Radial glow center */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(203,255,71,0.07) 0%, transparent 70%)' }}/>

      {/* Grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:'linear-gradient(rgba(203,255,71,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(203,255,71,0.03) 1px,transparent 1px)',
          backgroundSize:'60px 60px',
          maskImage:'radial-gradient(ellipse 80% 80% at 50% 50%,black 30%,transparent 100%)',
        }}/>

      {/* Floating cards — desktop only */}
      <div className="hidden xl:block">
        {FLOATING_CARDS.map(({ icon:Icon, label, sub, color, delay }, i) => (
          <div key={label}
            className="absolute glass-card"
            style={{
              top: i === 0 ? '20%' : i === 1 ? '55%' : '30%',
              left: i === 0 ? '4%' : undefined,
              right: i === 1 ? '4%' : i === 2 ? '6%' : undefined,
              animation: `heroFloat 4s ease-in-out ${delay}s infinite`,
              background:'rgba(255,255,255,0.04)',
              backdropFilter:'blur(16px)',
              border:'1px solid rgba(255,255,255,0.08)',
              borderRadius:'16px',
              padding:'14px 18px',
              minWidth:'180px',
              boxShadow:`0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)`,
            }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background:`${color}18`, border:`1px solid ${color}40` }}>
                <Icon size={16} style={{ color }}/>
              </div>
              <div>
                <p style={{ fontSize:'12px', fontWeight:700, color:'var(--text-primary)',
                  fontFamily:'Bricolage Grotesque,sans-serif', lineHeight:1.2 }}>{label}</p>
                <p style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'2px' }}>{sub}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-3xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 anim-fade-up"
            style={{
              background:'rgba(203,255,71,0.08)',
              border:'1px solid rgba(203,255,71,0.25)',
              backdropFilter:'blur(8px)',
            }}>
            <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)',
              boxShadow:'0 0 6px var(--accent)', display:'inline-block' }}/>
            <span style={{ fontSize:'12px', color:'var(--accent)', fontWeight:600, letterSpacing:'0.05em' }}>
              Pakistan's #1 Student Opportunity Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="anim-fade-up delay-1 mb-6"
            style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
              fontSize:'clamp(42px,7vw,84px)', lineHeight:1.0, letterSpacing:'-3px',
              color:'var(--text-primary)' }}>
            Find your next
            <br/>
            <span style={{
              color:'var(--accent)',
              textShadow:'0 0 40px rgba(203,255,71,0.4), 0 0 80px rgba(203,255,71,0.15)',
            }}>
              big opportunity.
            </span>
          </h1>

          <p className="anim-fade-up delay-2 mb-10 text-lg max-w-xl mx-auto"
            style={{ color:'var(--text-secondary)', lineHeight:1.7 }}>
            Hackathons, scholarships, workshops — all curated in one place.
            Never miss a deadline again.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 anim-fade-up delay-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-base w-full sm:w-auto justify-center"
              style={{
                background:'var(--accent)', color:'var(--bg-primary)',
                fontFamily:'Bricolage Grotesque,sans-serif',
                boxShadow:'0 0 30px rgba(203,255,71,0.3)',
                transition:'all 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 0 50px rgba(203,255,71,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 0 30px rgba(203,255,71,0.3)'; }}>
              Start for free <ArrowRight size={18}/>
            </Link>
            <Link to="/opportunities"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-xl font-medium text-base w-full sm:w-auto justify-center transition-all"
              style={{
                color:'var(--text-secondary)',
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(255,255,255,0.1)',
                backdropFilter:'blur(8px)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(203,255,71,0.3)'; e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='rgba(203,255,71,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'; e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}>
              Browse opportunities
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-14 anim-fade-up delay-4">
            {[
              { value:'500+', label:'Opportunities' },
              { value:'12K+', label:'Students' },
              { value:'200+', label:'Organizers' },
              { value:'50+',  label:'Universities' },
            ].map(({ value, label }, i) => (
              <div key={label} className="text-center">
                <p style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
                  fontSize:'clamp(20px,2.5vw,30px)', color:'var(--accent)',
                  textShadow:'0 0 20px rgba(203,255,71,0.4)', letterSpacing:'-0.5px' }}>
                  {value}
                </p>
                <p style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'3px', fontWeight:500 }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-0 left-0 right-0 py-3.5 overflow-hidden"
        style={{
          background:'rgba(8,9,15,0.7)',
          backdropFilter:'blur(12px)',
          borderTop:'1px solid rgba(255,255,255,0.06)',
        }}>
        <div className="flex whitespace-nowrap">
          <div className="flex gap-10 marquee-track">
            {MARQUEE_ITEMS.map((item, i) => (
              <span key={i} className="flex items-center gap-3 text-sm font-semibold"
                style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                <span style={{ color:'var(--accent)', fontSize:'8px',
                  textShadow:'0 0 8px var(--accent)' }}>✦</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroFloat {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(0.5deg); }
        }
      `}</style>
    </section>
  );
}
