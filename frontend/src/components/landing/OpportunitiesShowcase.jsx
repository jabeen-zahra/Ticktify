import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin, Trophy, Loader2 } from 'lucide-react';
import { opportunityAPI } from '../../api/opportunities';

const TYPE_CONFIG = {
  competition: { color: '#CBFF47', label: 'Competition', bg: 'rgba(203,255,71,0.08)',  border: 'rgba(203,255,71,0.2)'  },
  scholarship: { color: '#4ade80', label: 'Scholarship', bg: 'rgba(74,222,128,0.08)',  border: 'rgba(74,222,128,0.2)'  },
  workshop:    { color: '#f59e0b', label: 'Workshop',    bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
  event:       { color: '#60a5fa', label: 'Event',       bg: 'rgba(96,165,250,0.08)',  border: 'rgba(96,165,250,0.2)'  },
};

function OpCard({ opp }) {
  const c = TYPE_CONFIG[opp.type] || TYPE_CONFIG.event;
  const daysLeft = Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24));

  return (
    <Link
      to={`/opportunities/${opp.slug || opp._id}`}
      style={{ textDecoration: 'none' }}
    >
      <div
        className="group relative p-5 rounded-2xl transition-all duration-250 cursor-pointer h-full"
        style={{
          background:    'rgba(255,255,255,0.03)',
          border:        '1px solid rgba(255,255,255,0.07)',
          backdropFilter:'blur(12px)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform   = 'translateY(-3px)';
          e.currentTarget.style.background  = 'rgba(255,255,255,0.06)';
          e.currentTarget.style.borderColor = `${c.color}35`;
          e.currentTarget.style.boxShadow   = `0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px ${c.color}15`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform   = 'none';
          e.currentTarget.style.background  = 'rgba(255,255,255,0.03)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
          e.currentTarget.style.boxShadow   = 'none';
        }}
      >
        {/* Type badge + hot */}
        <div className="flex items-center justify-between mb-3">
          <span
            className="px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{
              background: c.bg, color: c.color, border: `1px solid ${c.border}`,
              fontFamily: 'Bricolage Grotesque, sans-serif',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}
          >
            {c.label}
          </span>
          {(daysLeft <= 7 && daysLeft > 0) && (
            <span className="text-xs font-bold" style={{ color: '#f87171' }}>🔥 Urgent</span>
          )}
          {opp.isFeatured && !(daysLeft <= 7) && (
            <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>⭐ Featured</span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-bold text-sm mb-1 line-clamp-2"
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif',
            color: 'var(--text-primary)', lineHeight: 1.35,
          }}
        >
          {opp.title}
        </h3>

        {/* Organizer */}
        <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          {opp.organizer?.organizerProfile?.organizationName || opp.organizer?.name}
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Calendar size={10} />
            {daysLeft <= 0 ? 'Expired' : `${daysLeft}d left`}
          </span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <MapPin size={10} />
            {opp.isOnline ? 'Online' : opp.city?.charAt(0).toUpperCase() + opp.city?.slice(1)}
          </span>
          {opp.prize && (
            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: c.color }}>
              <Trophy size={10} /> {opp.prize}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function OpportunitiesShowcase() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    opportunityAPI.getFeatured()
      .then(({ data }) => setOpportunities(data.opportunities?.slice(0, 6) || []))
      .catch(() => setOpportunities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--accent)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Live Opportunities
            </p>
            <h2
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
                fontSize: 'clamp(24px, 4vw, 36px)', letterSpacing: '-0.5px',
                color: 'var(--text-primary)', margin: 0,
              }}
            >
              Featured Right Now
            </h2>
          </div>
          <Link
            to="/opportunities"
            className="flex items-center gap-2 text-sm font-bold transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)', textDecoration: 'none', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Browse All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : opportunities.length === 0 ? (
          <div
            className="text-center py-20"
            style={{ color: 'var(--text-muted)', fontFamily: 'DM Sans, sans-serif' }}
          >
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</p>
            <p>New opportunities are being added soon. Check back shortly!</p>
          </div>
        ) : (
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
          >
            {opportunities.map(opp => (
              <OpCard key={opp._id} opp={opp} />
            ))}
          </div>
        )}

        {/* CTA */}
        {!loading && opportunities.length > 0 && (
          <div className="text-center mt-10">
            <Link
              to="/opportunities"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{
                background: 'var(--accent)', color: '#08090F',
                textDecoration: 'none', fontFamily: 'Bricolage Grotesque, sans-serif',
              }}
            >
              View All Opportunities <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}