import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentAPI } from '../api/student';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  LayoutDashboard, Bookmark, Bell, User,
  Calendar, MapPin, ExternalLink, Trash2,
  CheckCircle, Clock, XCircle, ChevronDown,
  Zap, Trophy, BookOpen, AlertTriangle,
  Check, BellOff, ArrowRight, Edit3, Save,
  GraduationCap, Search
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:'overview',       label:'Overview',       icon:LayoutDashboard },
  { id:'bookmarks',      label:'Bookmarks',      icon:Bookmark },
  { id:'notifications',  label:'Notifications',  icon:Bell },
  { id:'profile',        label:'Profile',        icon:User },
];

const APP_STATUS = {
  saved:    { label:'Saved',    color:'var(--text-muted)',  bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)',  icon:Bookmark },
  applied:  { label:'Applied',  color:'#60a5fa',            bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.25)',  icon:Clock },
  accepted: { label:'Accepted', color:'#4ade80',            bg:'rgba(74,222,128,0.1)',  border:'rgba(74,222,128,0.25)', icon:CheckCircle },
  rejected: { label:'Rejected', color:'#f87171',            bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)',  icon:XCircle },
};

const TYPE_COLORS = {
  competition: '#CBFF47',
  scholarship: '#4ade80',
  workshop:    '#f59e0b',
  event:       '#60a5fa',
};

const DEGREE_OPTIONS = [
  { value:'undergraduate', label:'Undergraduate' },
  { value:'graduate',      label:'Graduate' },
  { value:'phd',           label:'PhD' },
];

const UNIS = ['FAST-NUCES','LUMS','NUST','IBA','COMSATS','UET','UCP','Air University','Other'];

// ── Helpers ───────────────────────────────────────────────────────────────────
function Badge({ children, type = 'default' }) {
  const s = APP_STATUS[type] || { color:'var(--text-muted)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
        fontFamily:'Bricolage Grotesque,sans-serif' }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, icon:Icon, accent, sub }) {
  return (
    <div className="p-5 rounded-2xl"
      style={{
        background: accent ? 'rgba(203,255,71,0.06)' : 'rgba(255,255,255,0.03)',
        border:`1px solid ${accent ? 'rgba(203,255,71,0.2)' : 'rgba(255,255,255,0.07)'}`,
        backdropFilter:'blur(12px)',
      }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
            {label}
          </p>
          <p style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'30px', lineHeight:1, letterSpacing:'-1px',
            color: accent ? 'var(--accent)' : 'var(--text-primary)',
            textShadow: accent ? '0 0 20px rgba(203,255,71,0.3)' : 'none' }}>
            {value ?? 0}
          </p>
          {sub && <p className="text-xs mt-1.5" style={{ color:'var(--text-muted)' }}>{sub}</p>}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl"
            style={{ background: accent ? 'rgba(203,255,71,0.12)' : 'rgba(255,255,255,0.05)',
              border:`1px solid ${accent ? 'rgba(203,255,71,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
            <Icon size={18} style={{ color: accent ? 'var(--accent)' : 'var(--text-muted)' }}/>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Deadline Countdown ────────────────────────────────────────────────────────
function Countdown({ deadline }) {
  const days = Math.ceil((new Date(deadline) - new Date()) / (1000*60*60*24));
  if (days <= 0) return <span className="text-xs font-semibold" style={{ color:'#f87171' }}>Expired</span>;
  const urgent = days <= 3;
  const soon   = days <= 7;
  return (
    <span className="flex items-center gap-1 text-xs font-semibold"
      style={{ color: urgent ? '#f87171' : soon ? '#fbbf24' : 'var(--text-muted)' }}>
      <Calendar size={10}/>
      {urgent ? `${days}d left!` : soon ? `${days} days left` : `${days} days`}
    </span>
  );
}

// ── Bookmark Card ─────────────────────────────────────────────────────────────
function BookmarkCard({ bookmark, onRemove, onStatusChange }) {
  const opp = bookmark.opportunity;
  if (!opp) return null;

  const typeColor = TYPE_COLORS[opp.type] || '#8892A4';
  const appStatus = APP_STATUS[bookmark.applicationStatus] || APP_STATUS.saved;
  const StatusIcon = appStatus.icon;
  const days = Math.ceil((new Date(opp.deadline) - new Date()) / (1000*60*60*24));
  const isExpired = days <= 0;
  const isUrgent  = days > 0 && days <= 3;

  return (
    <div className="group relative flex flex-col rounded-2xl transition-all duration-200"
      style={{
        background:'rgba(255,255,255,0.03)',
        border:`1px solid ${isUrgent ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.07)'}`,
        backdropFilter:'blur(12px)',
        opacity: isExpired ? 0.6 : 1,
      }}
      onMouseEnter={e => { if (!isExpired) { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.borderColor=`${typeColor}30`; }}}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor=isUrgent?'rgba(251,191,36,0.25)':'rgba(255,255,255,0.07)'; }}>

      {/* Top color bar */}
      <div style={{ height:'2px', background:`linear-gradient(90deg,${typeColor},transparent)`, borderRadius:'16px 16px 0 0' }}/>

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm line-clamp-2"
              style={{ fontFamily:'Bricolage Grotesque,sans-serif', color:'var(--text-primary)', lineHeight:1.3 }}>
              {opp.title}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color:'var(--text-muted)' }}>
              {opp.organizer?.organizerProfile?.organizationName || opp.organizer?.name}
            </p>
          </div>
          <button onClick={() => onRemove(opp._id)}
            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
            style={{ color:'#f87171', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={12}/>
          </button>
        </div>

        {/* Type + urgent badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
            style={{ background:`${typeColor}12`, color:typeColor, border:`1px solid ${typeColor}30`,
              fontFamily:'Bricolage Grotesque,sans-serif' }}>
            {opp.type}
          </span>
          {isUrgent && <span className="text-xs font-bold" style={{ color:'#fbbf24' }}>🔥 Urgent</span>}
          {isExpired && <span className="text-xs font-bold" style={{ color:'#f87171' }}>Expired</span>}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mb-3">
          <Countdown deadline={opp.deadline}/>
          <span className="flex items-center gap-1 text-xs" style={{ color:'var(--text-muted)' }}>
            <MapPin size={10}/>{opp.isOnline ? 'Online' : opp.city}
          </span>
          {opp.prize && <span className="text-xs font-bold" style={{ color:typeColor }}>{opp.prize}</span>}
        </div>

        {/* Status selector */}
        <div className="mt-auto">
          <label className="text-xs font-bold uppercase tracking-wider mb-1.5 block"
            style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
            Status
          </label>
          <select
            value={bookmark.applicationStatus}
            onChange={e => onStatusChange(opp._id, e.target.value)}
            className="input-field text-xs py-2"
            style={{ background:'var(--bg-input)', fontSize:'12px' }}>
            {Object.entries(APP_STATUS).map(([val, { label }]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {/* Apply link */}
        {opp.registrationLink && !isExpired && (
          <a href={opp.registrationLink} target="_blank" rel="noopener noreferrer"
            className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
            style={{ background:`${typeColor}10`, color:typeColor, border:`1px solid ${typeColor}25` }}>
            Apply Now <ExternalLink size={10}/>
          </a>
        )}
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading, user, bookmarks, onTabChange }) {
  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner text="Loading..."/></div>;

  const urgentBookmarks = bookmarks.filter(b => {
    if (!b.opportunity) return false;
    const days = Math.ceil((new Date(b.opportunity.deadline) - new Date()) / (1000*60*60*24));
    return days > 0 && days <= 7;
  }).slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="p-6 rounded-2xl relative overflow-hidden"
        style={{ background:'rgba(203,255,71,0.05)', border:'1px solid rgba(203,255,71,0.15)' }}>
        <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none"
          style={{ background:'radial-gradient(circle at top right,rgba(203,255,71,0.12),transparent 70%)' }}/>
        <p className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color:'var(--accent)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          Welcome back
        </p>
        <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
          fontSize:'clamp(18px,2.5vw,24px)', color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
          {user?.name?.split(' ')[0]} 👋
        </h2>
        <p className="text-sm mt-1" style={{ color:'var(--text-secondary)' }}>
          {user?.university && `${user.university} • `}
          {user?.degreeLevel && user.degreeLevel.charAt(0).toUpperCase() + user.degreeLevel.slice(1)}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Bookmarked"  value={stats?.totalBookmarks} icon={Bookmark} accent/>
        <StatCard label="Applied"     value={stats?.applied}        icon={Clock}
          sub="in progress"/>
        <StatCard label="Accepted"    value={stats?.accepted}       icon={Trophy}
          sub="congrats!"/>
        <StatCard label="Urgent"      value={stats?.urgentDeadlines} icon={AlertTriangle}
          sub="due this week"/>
      </div>

      {/* Urgent deadlines */}
      {urgentBookmarks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold uppercase tracking-widest"
              style={{ color:'#fbbf24', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              ⚡ Urgent Deadlines
            </p>
            <button onClick={() => onTabChange('bookmarks')}
              className="text-xs flex items-center gap-1 transition-opacity hover:opacity-70"
              style={{ color:'var(--accent)' }}>
              View all <ArrowRight size={12}/>
            </button>
          </div>
          <div className="space-y-2">
            {urgentBookmarks.map(b => {
              const days = Math.ceil((new Date(b.opportunity.deadline) - new Date()) / (1000*60*60*24));
              const typeColor = TYPE_COLORS[b.opportunity.type] || '#8892A4';
              return (
                <div key={b._id} className="flex items-center justify-between p-4 rounded-xl"
                  style={{ background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.15)' }}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background:typeColor, boxShadow:`0 0 6px ${typeColor}` }}/>
                    <p className="text-sm font-semibold truncate"
                      style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                      {b.opportunity.title}
                    </p>
                  </div>
                  <span className="text-xs font-bold flex-shrink-0 ml-3"
                    style={{ color: days <= 3 ? '#f87171' : '#fbbf24' }}>
                    {days}d left
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon:Search,   label:'Browse Opportunities', sub:'Find new hackathons & scholarships', href:'/opportunities', external:true },
            { icon:Bookmark, label:'My Bookmarks',         sub:`${stats?.totalBookmarks||0} saved`, tab:'bookmarks' },
            { icon:User,     label:'Edit Profile',         sub:'Update your info', tab:'profile' },
          ].map(item => (
            item.href ? (
              <Link key={item.label} to={item.href}
                className="p-4 rounded-2xl text-left transition-all"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                  backdropFilter:'blur(12px)' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform='none'}>
                <item.icon size={18} style={{ color:'var(--accent)', marginBottom:'8px' }}/>
                <p className="font-bold text-sm" style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{item.sub}</p>
              </Link>
            ) : (
              <button key={item.label} onClick={() => onTabChange(item.tab)}
                className="p-4 rounded-2xl text-left transition-all w-full"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                  backdropFilter:'blur(12px)' }}
                onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform='none'}>
                <item.icon size={18} style={{ color:'var(--text-muted)', marginBottom:'8px' }}/>
                <p className="font-bold text-sm" style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color:'var(--text-muted)' }}>{item.sub}</p>
              </button>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Bookmarks Tab ─────────────────────────────────────────────────────────────
function BookmarksTab() {
  const [bookmarks, setBookmarks]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]               = useState(1);
  const [total, setTotal]             = useState(0);
  const LIMIT = 9;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit:LIMIT };
      if (statusFilter) params.applicationStatus = statusFilter;
      const r = await studentAPI.getBookmarks(params);
      setBookmarks(r.data.bookmarks || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Failed to load bookmarks'); }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleRemove = async (opportunityId) => {
    try {
      await studentAPI.removeBookmark(opportunityId);
      setBookmarks(p => p.filter(b => b.opportunity?._id !== opportunityId));
      setTotal(p => p - 1);
      toast.success('Bookmark removed');
    } catch { toast.error('Failed'); }
  };

  const handleStatusChange = async (opportunityId, status) => {
    try {
      await studentAPI.updateBookmark(opportunityId, { applicationStatus: status });
      setBookmarks(p => p.map(b =>
        b.opportunity?._id === opportunityId ? { ...b, applicationStatus: status } : b
      ));
      toast.success(`Marked as ${status}`);
    } catch { toast.error('Failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {[{v:'',label:'All'}, ...Object.entries(APP_STATUS).map(([v,{label}])=>({v,label}))].map(({ v, label }) => (
          <button key={v} onClick={() => { setStatusFilter(v); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: statusFilter===v ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
              color:      statusFilter===v ? 'var(--bg-primary)' : 'var(--text-muted)',
              border:`1px solid ${statusFilter===v ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
              fontFamily:'Bricolage Grotesque,sans-serif',
            }}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LoadingSpinner text="Loading bookmarks..."/></div>
      ) : !bookmarks.length ? (
        <EmptyState icon="🔖" title="No bookmarks yet"
          description={statusFilter ? `No ${statusFilter} opportunities.` : 'Browse opportunities and bookmark ones you like!'}
          action={
            <Link to="/opportunities" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
              Browse Opportunities <ArrowRight size={14}/>
            </Link>
          }/>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarks.map(b => (
              <BookmarkCard
                key={b._id} bookmark={b}
                onRemove={handleRemove}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)' }}>
                Previous
              </button>
              <span className="text-sm" style={{ color:'var(--text-secondary)' }}>{page}/{totalPages}</span>
              <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-30"
                style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)' }}>
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────────────────
function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [unreadCount, setUnreadCount]     = useState(0);

  useEffect(() => {
    studentAPI.getNotifications()
      .then(r => {
        setNotifications(r.data.notifications || []);
        setUnreadCount(r.data.unreadCount || 0);
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const markAll = async () => {
    try {
      await studentAPI.markAllRead();
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch { toast.error('Failed'); }
  };

  const markOne = async (id) => {
    try {
      await studentAPI.markOneRead(id);
      setNotifications(p => p.map(n => n._id===id ? {...n, isRead:true} : n));
      setUnreadCount(p => Math.max(0, p-1));
    } catch {}
  };

  const NOTIF_ICONS = {
    deadline_reminder:   { icon:'⏰', color:'#fbbf24' },
    new_opportunity:     { icon:'✨', color:'var(--accent)' },
    organizer_approved:  { icon:'✅', color:'#4ade80' },
    organizer_rejected:  { icon:'❌', color:'#f87171' },
    listing_approved:    { icon:'🚀', color:'#4ade80' },
    listing_rejected:    { icon:'⛔', color:'#f87171' },
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner/></div>;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="font-bold text-sm" style={{ color:'var(--text-primary)',
            fontFamily:'Bricolage Grotesque,sans-serif' }}>
            Notifications
          </p>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background:'var(--accent)', color:'var(--bg-primary)',
                fontFamily:'Bricolage Grotesque,sans-serif' }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAll}
            className="flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color:'var(--accent)' }}>
            <Check size={12}/> Mark all read
          </button>
        )}
      </div>

      {!notifications.length ? (
        <EmptyState icon="🔔" title="No notifications" description="You're all caught up!"/>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const cfg = NOTIF_ICONS[n.type] || { icon:'📢', color:'var(--text-secondary)' };
            return (
              <div key={n._id}
                className="flex gap-4 p-4 rounded-2xl transition-all cursor-pointer"
                style={{
                  background: n.isRead ? 'rgba(255,255,255,0.02)' : 'rgba(203,255,71,0.04)',
                  border:`1px solid ${n.isRead ? 'rgba(255,255,255,0.06)' : 'rgba(203,255,71,0.15)'}`,
                }}
                onClick={() => !n.isRead && markOne(n._id)}>
                <span style={{ fontSize:'20px', flexShrink:0, lineHeight:1.4 }}>{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{ color:'var(--text-primary)',
                    fontFamily:'Bricolage Grotesque,sans-serif' }}>
                    {n.title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color:'var(--text-secondary)' }}>
                    {n.message}
                  </p>
                  <p className="text-xs mt-1.5" style={{ color:'var(--text-muted)' }}>
                    {new Date(n.createdAt).toLocaleDateString('en-PK', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                    style={{ background:'var(--accent)', boxShadow:'0 0 6px var(--accent)' }}/>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const { setUser } = useAuth();
  const [form, setForm]   = useState({
    name:        user?.name        || '',
    university:  user?.university  || '',
    degreeLevel: user?.degreeLevel || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await studentAPI.updateProfile(form);
      setUser(r.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2) || 'ST';

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
          style={{ background:'var(--accent)', color:'var(--bg-primary)',
            fontFamily:'Bricolage Grotesque,sans-serif',
            boxShadow:'0 0 30px rgba(203,255,71,0.3)' }}>
          {initials}
        </div>
        <div>
          <p className="font-bold text-lg" style={{ fontFamily:'Bricolage Grotesque,sans-serif',
            color:'var(--text-primary)', letterSpacing:'-0.3px' }}>
            {user?.name}
          </p>
          <p className="text-sm" style={{ color:'var(--text-muted)' }}>{user?.email}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background:'rgba(203,255,71,0.1)', color:'var(--accent)',
              border:'1px solid rgba(203,255,71,0.2)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
            <GraduationCap size={10}/> Student
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="form-label">Full Name</label>
          <input value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))}
            placeholder="Your full name" className="input-field"/>
        </div>
        <div>
          <label className="form-label">University</label>
          <select value={form.university} onChange={e => setForm(p=>({...p,university:e.target.value}))}
            className="input-field">
            <option value="">Select university</option>
            {UNIS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label">Degree Level</label>
          <select value={form.degreeLevel} onChange={e => setForm(p=>({...p,degreeLevel:e.target.value}))}
            className="input-field">
            <option value="">Select degree level</option>
            {DEGREE_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Account info */}
      <div className="p-4 rounded-2xl space-y-2"
        style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          Account Info
        </p>
        {[
          { label:'Email',      value: user?.email },
          { label:'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PK', { month:'long', year:'numeric' }) : '—' },
          { label:'Last login', value: user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between text-sm">
            <span style={{ color:'var(--text-muted)' }}>{label}</span>
            <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const { user } = useAuth();
  const [activeTab,    setActiveTab]    = useState('overview');
  const [stats,        setStats]        = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [bookmarks,    setBookmarks]    = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);

  useEffect(() => {
    studentAPI.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));

    studentAPI.getBookmarks({ limit:6 })
      .then(r => setBookmarks(r.data.bookmarks || []))
      .catch(() => {});

    studentAPI.getNotifications()
      .then(r => setUnreadCount(r.data.unreadCount || 0))
      .catch(() => {});
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      <div className="fixed inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 80% 40% at 50% 0%,rgba(203,255,71,0.04) 0%,transparent 60%)' }}/>

      <Navbar/>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8 anim-fade-up">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg"
              style={{ background:'rgba(203,255,71,0.1)', border:'1px solid rgba(203,255,71,0.2)' }}>
              <GraduationCap size={15} style={{ color:'var(--accent)' }}/>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color:'var(--accent)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              Student Dashboard
            </span>
          </div>
          <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(22px,3vw,32px)', color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
            My Dashboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit anim-fade-up delay-1"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            backdropFilter:'blur(12px)' }}>
          {TABS.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
              style={{
                background: activeTab===id ? 'var(--accent)' : 'transparent',
                color:      activeTab===id ? 'var(--bg-primary)' : 'var(--text-muted)',
                fontFamily:'Bricolage Grotesque,sans-serif',
                boxShadow:  activeTab===id ? '0 0 20px rgba(203,255,71,0.3)' : 'none',
              }}>
              <Icon size={14}/>
              <span className="hidden sm:block">{label}</span>
              {id==='notifications' && unreadCount > 0 && activeTab !== id && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center"
                  style={{ background:'var(--accent)', color:'var(--bg-primary)', fontSize:'9px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="anim-fade-up delay-2">
          {activeTab==='overview' && (
            <OverviewTab stats={stats} loading={statsLoading} user={user}
              bookmarks={bookmarks} onTabChange={setActiveTab}/>
          )}
          {activeTab==='bookmarks'     && <BookmarksTab/>}
          {activeTab==='notifications' && <NotificationsTab/>}
          {activeTab==='profile'       && <ProfileTab user={user}/>}
        </div>
      </div>
    </div>
  );
}
