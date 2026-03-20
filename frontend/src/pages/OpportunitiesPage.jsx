import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { opportunityAPI } from '../api/opportunities';
import { bookmarkAPI } from '../api/bookmarks';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Search, Filter, X, Bookmark, BookmarkCheck,
  Calendar, MapPin, Users, ChevronLeft, ChevronRight,
  Zap, Star, ExternalLink, SlidersHorizontal
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPES = [
  { value:'',            label:'All Types' },
  { value:'competition', label:'Competitions' },
  { value:'scholarship', label:'Scholarships' },
  { value:'workshop',    label:'Workshops' },
  { value:'event',       label:'Events' },
];

const CITIES = [
  { value:'',          label:'All Cities' },
  { value:'lahore',    label:'Lahore' },
  { value:'karachi',   label:'Karachi' },
  { value:'islamabad', label:'Islamabad' },
  { value:'peshawar',  label:'Peshawar' },
  { value:'online',    label:'Online' },
];

const DEGREES = [
  { value:'',              label:'All Levels' },
  { value:'undergraduate', label:'Undergraduate' },
  { value:'graduate',      label:'Graduate' },
  { value:'phd',           label:'PhD' },
  { value:'open',          label:'Open for All' },
];

const SORT_OPTIONS = [
  { value:'-createdAt',  label:'Latest First' },
  { value:'deadline',    label:'Deadline: Soonest' },
  { value:'-bookmarkCount', label:'Most Bookmarked' },
];

const TYPE_CONFIG = {
  competition: { color:'#CBFF47', bg:'rgba(203,255,71,0.08)', border:'rgba(203,255,71,0.2)',  label:'Competition' },
  scholarship: { color:'#4ade80', bg:'rgba(74,222,128,0.08)', border:'rgba(74,222,128,0.2)', label:'Scholarship' },
  workshop:    { color:'#f59e0b', bg:'rgba(245,158,11,0.08)', border:'rgba(245,158,11,0.2)', label:'Workshop'    },
  event:       { color:'#60a5fa', bg:'rgba(96,165,250,0.08)', border:'rgba(96,165,250,0.2)', label:'Event'       },
};

// ── Deadline countdown ────────────────────────────────────────────────────────
function DeadlineBadge({ deadline }) {
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000*60*60*24));
  const isUrgent = days <= 7;
  return (
    <span className="flex items-center gap-1 text-xs font-semibold"
      style={{ color: isUrgent ? '#f87171' : 'var(--text-muted)' }}>
      <Calendar size={10}/>
      {days <= 0 ? 'Expired' : days === 1 ? '1 day left' : `${days} days left`}
    </span>
  );
}

// ── Opportunity Card ──────────────────────────────────────────────────────────
function OpportunityCard({ opportunity, isBookmarked, onBookmark, loading }) {
  const c = TYPE_CONFIG[opportunity.type] || TYPE_CONFIG.event;
  const days = Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000*60*60*24));
  const isUrgent = days <= 7 && days > 0;

  return (
    <div className="group relative flex flex-col rounded-2xl transition-all duration-200"
      style={{
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.07)',
        backdropFilter:'blur(12px)',
        overflow:'hidden',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = `${c.color}35`;
        e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.3), 0 0 0 1px ${c.color}15`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}>

      {/* Top accent line */}
      <div style={{ height:'2px', background:`linear-gradient(90deg,${c.color},transparent)` }}/>

      <div className="flex flex-col flex-1 p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`,
                fontFamily:'Bricolage Grotesque,sans-serif' }}>
              {c.label}
            </span>
            {opportunity.isFeatured && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background:'rgba(203,255,71,0.08)', color:'var(--accent)',
                  border:'1px solid rgba(203,255,71,0.2)' }}>
                <Star size={9}/> Featured
              </span>
            )}
            {isUrgent && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold"
                style={{ background:'rgba(239,68,68,0.1)', color:'#f87171',
                  border:'1px solid rgba(239,68,68,0.2)' }}>
                🔥 Urgent
              </span>
            )}
          </div>

          {/* Bookmark button */}
          <button onClick={() => onBookmark(opportunity._id, isBookmarked)}
            disabled={loading}
            className="p-2 rounded-xl transition-all flex-shrink-0"
            style={{
              background: isBookmarked ? 'rgba(203,255,71,0.1)' : 'rgba(255,255,255,0.04)',
              border:`1px solid ${isBookmarked ? 'rgba(203,255,71,0.25)' : 'rgba(255,255,255,0.1)'}`,
              color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
            }}>
            {isBookmarked ? <BookmarkCheck size={14}/> : <Bookmark size={14}/>}
          </button>
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm mb-1 line-clamp-2 flex-1"
          style={{ fontFamily:'Bricolage Grotesque,sans-serif', color:'var(--text-primary)',
            lineHeight:1.3 }}>
          {opportunity.title}
        </h3>

        {/* Organizer */}
        <p className="text-xs mb-3" style={{ color:'var(--text-muted)' }}>
          {opportunity.organizer?.organizerProfile?.organizationName || opportunity.organizer?.name}
        </p>

        {/* Description */}
        {opportunity.shortDescription && (
          <p className="text-xs mb-3 line-clamp-2" style={{ color:'var(--text-secondary)', lineHeight:1.5 }}>
            {opportunity.shortDescription}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between mt-auto pt-3"
          style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <DeadlineBadge deadline={opportunity.deadline}/>
            <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-muted)' }}>
              <MapPin size={10}/>
              {opportunity.isOnline ? 'Online' : opportunity.city}
            </span>
          </div>
          {opportunity.prize && (
            <span className="text-xs font-bold" style={{ color:c.color }}>
              {opportunity.prize}
            </span>
          )}
        </div>

        {/* CTA */}
        {opportunity.registrationLink && (
          <a href={opportunity.registrationLink} target="_blank" rel="noopener noreferrer"
            className="mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background:`${c.color}12`, color:c.color,
              border:`1px solid ${c.border}`,
              fontFamily:'Bricolage Grotesque,sans-serif',
            }}
            onMouseEnter={e => e.currentTarget.style.background=`${c.color}20`}
            onMouseLeave={e => e.currentTarget.style.background=`${c.color}12`}>
            Apply / Register <ExternalLink size={11}/>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onReset, mobile, onClose }) {
  const content = (
    <div className="space-y-5">
      {mobile && (
        <div className="flex items-center justify-between mb-1">
          <p className="font-bold text-base" style={{ fontFamily:'Bricolage Grotesque,sans-serif', color:'var(--text-primary)' }}>Filters</p>
          <button onClick={onClose} className="p-1.5 rounded-lg"
            style={{ color:'var(--text-muted)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <X size={14}/>
          </button>
        </div>
      )}

      {/* Type */}
      <div>
        <p className="form-label mb-2">Type</p>
        <div className="flex flex-col gap-1.5">
          {TYPES.map(({ value, label }) => (
            <button key={value} onClick={() => onChange('type', value)}
              className="text-left px-3 py-2 rounded-xl text-sm transition-all"
              style={{
                background: filters.type===value ? 'rgba(203,255,71,0.1)' : 'transparent',
                color:      filters.type===value ? 'var(--accent)' : 'var(--text-secondary)',
                border:`1px solid ${filters.type===value ? 'rgba(203,255,71,0.25)' : 'transparent'}`,
                fontWeight: filters.type===value ? 600 : 400,
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* City */}
      <div>
        <p className="form-label mb-2">City</p>
        <select value={filters.city} onChange={e => onChange('city', e.target.value)}
          className="input-field text-sm">
          {CITIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      {/* Degree */}
      <div>
        <p className="form-label mb-2">Degree Level</p>
        <select value={filters.degreeLevel} onChange={e => onChange('degreeLevel', e.target.value)}
          className="input-field text-sm">
          {DEGREES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Featured toggle */}
      <div>
        <button onClick={() => onChange('isFeatured', filters.isFeatured ? '' : 'true')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{
            background: filters.isFeatured ? 'rgba(203,255,71,0.1)' : 'rgba(255,255,255,0.03)',
            color:      filters.isFeatured ? 'var(--accent)' : 'var(--text-secondary)',
            border:`1px solid ${filters.isFeatured ? 'rgba(203,255,71,0.25)' : 'rgba(255,255,255,0.07)'}`,
          }}>
          <Star size={14}/> Featured Only
        </button>
      </div>

      {/* Reset */}
      <button onClick={onReset}
        className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ color:'var(--text-muted)', border:'1px solid rgba(255,255,255,0.07)' }}>
        Reset Filters
      </button>
    </div>
  );

  if (mobile) return (
    <div className="fixed inset-0 z-50 flex" style={{ background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)' }}>
      <div className="ml-auto w-72 h-full overflow-y-auto p-5"
        style={{ background:'var(--bg-elevated)', borderLeft:'1px solid rgba(255,255,255,0.1)' }}>
        {content}
      </div>
    </div>
  );

  return <div className="sticky top-24">{content}</div>;
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OpportunitiesPage() {
  const { isAuthenticated } = useAuth();

  const [opportunities, setOpportunities] = useState([]);
  const [bookmarks,     setBookmarks]     = useState(new Set());
  const [loading,       setLoading]       = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(new Set());
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [mobileFilter,  setMobileFilter]  = useState(false);
  const searchTimer = useRef(null);

  const [filters, setFilters] = useState({
    search: '', type: '', city: '', degreeLevel: '', isFeatured: '', sort: '-createdAt',
  });

  const LIMIT = 12;

  // Fetch opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:LIMIT };
      if (filters.search)      params.search      = filters.search;
      if (filters.type)        params.type        = filters.type;
      if (filters.city)        params.city        = filters.city;
      if (filters.degreeLevel) params.degreeLevel = filters.degreeLevel;
      if (filters.isFeatured)  params.isFeatured  = filters.isFeatured;
      if (filters.sort)        params.sort        = filters.sort;

      const r = await opportunityAPI.getAll(params);
      setOpportunities(r.data.data || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Failed to load opportunities'); }
    finally { setLoading(false); }
  }, [page, filters]);

  useEffect(() => { fetchOpportunities(); }, [fetchOpportunities]);

  // Fetch bookmarks if logged in
  useEffect(() => {
    if (!isAuthenticated) return;
    bookmarkAPI.getAll()
      .then(r => {
        const ids = new Set((r.data.bookmarks || []).map(b => b.opportunity?._id));
        setBookmarks(ids);
      })
      .catch(() => {});
  }, [isAuthenticated]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    if (key === 'search') {
      clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => setFilters(p => ({ ...p, search: value })), 400);
    } else {
      setFilters(p => ({ ...p, [key]: value }));
    }
  };

  const resetFilters = () => {
    setPage(1);
    setFilters({ search:'', type:'', city:'', degreeLevel:'', isFeatured:'', sort:'-createdAt' });
  };

  const handleBookmark = async (opportunityId, isBookmarked) => {
    if (!isAuthenticated) { toast.error('Sign in to bookmark opportunities'); return; }
    setBookmarkLoading(p => new Set([...p, opportunityId]));
    try {
      if (isBookmarked) {
        await bookmarkAPI.remove(opportunityId);
        setBookmarks(p => { const n = new Set(p); n.delete(opportunityId); return n; });
        toast.success('Bookmark removed');
      } else {
        await bookmarkAPI.add(opportunityId, { emailReminder: true });
        setBookmarks(p => new Set([...p, opportunityId]));
        toast.success('Bookmarked! 🔖');
      }
    } catch { toast.error('Failed'); }
    finally { setBookmarkLoading(p => { const n = new Set(p); n.delete(opportunityId); return n; }); }
  };

  const totalPages = Math.ceil(total / LIMIT);
  const activeFilterCount = [filters.type, filters.city, filters.degreeLevel, filters.isFeatured]
    .filter(Boolean).length;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      {/* Bg glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 80% 40% at 50% 0%,rgba(203,255,71,0.04) 0%,transparent 60%)' }}/>

      <Navbar/>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)',
              boxShadow:'0 0 6px var(--accent)' }}/>
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color:'var(--accent)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              {total} opportunities
            </span>
          </div>
          <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(24px,3vw,36px)', color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
            Browse Opportunities
          </h1>
          <p className="mt-1 text-sm" style={{ color:'var(--text-secondary)' }}>
            Hackathons, scholarships, workshops and more — all verified and curated.
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex gap-3 mb-6 anim-fade-up delay-1">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
              style={{ color:'var(--text-muted)' }}/>
            <input
              defaultValue={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              placeholder="Search opportunities..."
              className="input-field pl-10"
              style={{ fontSize:'14px' }}/>
          </div>

          <select value={filters.sort} onChange={e => handleFilterChange('sort', e.target.value)}
            className="input-field hidden sm:block sm:w-48" style={{ fontSize:'13px' }}>
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>

          {/* Mobile filter toggle */}
          <button onClick={() => setMobileFilter(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold relative"
            style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)',
              background:'rgba(255,255,255,0.03)' }}>
            <SlidersHorizontal size={14}/>
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background:'var(--accent)', color:'var(--bg-primary)' }}>
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Type quick filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1 anim-fade-up delay-2">
          {TYPES.map(({ value, label }) => (
            <button key={value} onClick={() => handleFilterChange('type', value)}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: filters.type===value ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                color:      filters.type===value ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border:`1px solid ${filters.type===value ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                fontFamily:'Bricolage Grotesque,sans-serif',
                boxShadow: filters.type===value ? '0 0 15px rgba(203,255,71,0.25)' : 'none',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Main layout */}
        <div className="flex gap-8">

          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-52 flex-shrink-0">
            <FilterPanel filters={filters} onChange={handleFilterChange} onReset={resetFilters}/>
          </aside>

          {/* Opportunities grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex justify-center py-24">
                <LoadingSpinner size="lg" text="Loading opportunities..."/>
              </div>
            ) : !opportunities.length ? (
              <EmptyState
                icon="🔍"
                title="No opportunities found"
                description="Try adjusting your filters or search term."
                action={
                  <button onClick={resetFilters} className="btn-primary px-6 py-2.5 text-sm">
                    Clear Filters
                  </button>
                }
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
                  {opportunities.map(opp => (
                    <OpportunityCard
                      key={opp._id}
                      opportunity={opp}
                      isBookmarked={bookmarks.has(opp._id)}
                      onBookmark={handleBookmark}
                      loading={bookmarkLoading.has(opp._id)}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                      style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)',
                        background:'rgba(255,255,255,0.03)' }}>
                      <ChevronLeft size={15}/> Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = i + 1;
                        return (
                          <button key={p} onClick={() => setPage(p)}
                            className="w-9 h-9 rounded-xl text-sm font-bold transition-all"
                            style={{
                              background: page===p ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                              color:      page===p ? 'var(--bg-primary)' : 'var(--text-muted)',
                              border:`1px solid ${page===p ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
                              fontFamily:'Bricolage Grotesque,sans-serif',
                              boxShadow: page===p ? '0 0 12px rgba(203,255,71,0.3)' : 'none',
                            }}>
                            {p}
                          </button>
                        );
                      })}
                    </div>
                    <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                      style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)',
                        background:'rgba(255,255,255,0.03)' }}>
                      Next <ChevronRight size={15}/>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter panel */}
      {mobileFilter && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={resetFilters}
          mobile
          onClose={() => setMobileFilter(false)}
        />
      )}
    </div>
  );
}
