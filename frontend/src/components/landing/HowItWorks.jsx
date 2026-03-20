const STEPS = [
  {
    num: '01',
    title: 'Create your account',
    desc: 'Sign up in 60 seconds. Tell us your university and degree level for a personalized experience.',
  },
  {
    num: '02',
    title: 'Browse & discover',
    desc: 'Search hackathons, scholarships, workshops and more. Filter by city, category, and deadline.',
  },
  {
    num: '03',
    title: 'Bookmark & track',
    desc: 'Save opportunities you love. Get deadline reminders. Track your application status.',
  },
  {
    num: '04',
    title: 'Win & grow',
    desc: 'Apply, participate, and build your profile. Tictify students win more opportunities.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 relative" style={{ background:'var(--bg-primary)' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px',
        background:'linear-gradient(90deg,transparent,var(--border),transparent)' }}/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background:'rgba(255,255,255,0.04)', color:'var(--text-secondary)',
              border:'1px solid var(--border)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
            How It Works
          </span>
          <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(28px,4vw,42px)', color:'var(--text-primary)',
            letterSpacing:'-1px', lineHeight:1.1 }}>
            From zero to
            <span style={{ color:'var(--accent)' }}> opportunity</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
            style={{ background:'linear-gradient(90deg,transparent,var(--border-accent),var(--border-accent),transparent)' }}/>

          {STEPS.map(({ num, title, desc }, i) => (
            <div key={num} className="relative flex flex-col items-center text-center p-6 rounded-2xl"
              style={{ background:'var(--bg-card)', border:'1px solid var(--border)' }}>
              {/* Number */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 relative z-10"
                style={{ background:'var(--bg-primary)', border:'2px solid var(--accent)' }}>
                <span style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
                  fontSize:'18px', color:'var(--accent)' }}>
                  {num}
                </span>
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
        background:'linear-gradient(90deg,transparent,var(--border),transparent)' }}/>
    </section>
  );
}
