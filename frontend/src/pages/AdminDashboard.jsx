import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../api/admin';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  Users, Building2, ListChecks, LayoutDashboard,
  CheckCircle, XCircle, Star, Clock, Shield, Zap,
  AlertCircle, Search, UserX, UserCheck, Archive,
  ChevronLeft, ChevronRight, Filter
} from 'lucide-react';

const TABS = [
  { id:'overview',   label:'Overview',   icon:LayoutDashboard },
  { id:'users',      label:'Users',      icon:Users },
  { id:'organizers', label:'Approvals',  icon:Building2 },
  { id:'listings',   label:'Listings',   icon:ListChecks },
];

// ── Reusable components ───────────────────────────────────────────────────────
function Badge({ children, type='default' }) {
  const s = {
    default: { bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)',   border:'rgba(255,255,255,0.1)' },
    accent:  { bg:'rgba(203,255,71,0.1)',   color:'var(--accent)',       border:'rgba(203,255,71,0.25)' },
    success: { bg:'rgba(74,222,128,0.1)',   color:'#4ade80',             border:'rgba(74,222,128,0.25)' },
    danger:  { bg:'rgba(239,68,68,0.1)',    color:'#f87171',             border:'rgba(239,68,68,0.25)' },
    warning: { bg:'rgba(251,191,36,0.1)',   color:'#fbbf24',             border:'rgba(251,191,36,0.25)' },
    blue:    { bg:'rgba(96,165,250,0.1)',   color:'#60a5fa',             border:'rgba(96,165,250,0.25)' },
  }[type] || { bg:'rgba(255,255,255,0.05)', color:'var(--text-muted)', border:'rgba(255,255,255,0.1)' };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
        fontFamily:'Bricolage Grotesque,sans-serif' }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, icon:Icon, type='default', delta }) {
  const isAccent = type === 'accent';
  return (
    <div className="p-5 rounded-2xl"
      style={{
        background: isAccent ? 'rgba(203,255,71,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${isAccent ? 'rgba(203,255,71,0.2)' : 'rgba(255,255,255,0.07)'}`,
        backdropFilter:'blur(12px)',
      }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest mb-2"
            style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
            {label}
          </p>
          <p style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'28px', lineHeight:1, letterSpacing:'-1px',
            color: isAccent ? 'var(--accent)' : 'var(--text-primary)',
            textShadow: isAccent ? '0 0 20px rgba(203,255,71,0.3)' : 'none' }}>
            {value ?? '—'}
          </p>
          {delta && <p className="text-xs mt-1.5" style={{ color:'var(--text-muted)' }}>{delta}</p>}
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl"
            style={{ background: isAccent ? 'rgba(203,255,71,0.12)' : 'rgba(255,255,255,0.05)',
              border:`1px solid ${isAccent ? 'rgba(203,255,71,0.2)' : 'rgba(255,255,255,0.07)'}` }}>
            <Icon size={18} style={{ color: isAccent ? 'var(--accent)' : 'var(--text-muted)' }}/>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel='Confirm', danger }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(6px)' }}>
      <div className="w-full max-w-sm rounded-2xl p-6 anim-fade-up"
        style={{ background:'var(--bg-elevated)', border:'1px solid rgba(255,255,255,0.1)',
          boxShadow:'0 25px 60px rgba(0,0,0,0.6)' }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-xl"
            style={{ background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(203,255,71,0.1)' }}>
            <AlertCircle size={18} style={{ color: danger ? '#f87171' : 'var(--accent)' }}/>
          </div>
          <h3 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'16px', color:'var(--text-primary)' }}>{title}</h3>
        </div>
        <p className="text-sm mb-6" style={{ color:'var(--text-secondary)', lineHeight:1.6 }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm rounded-xl font-medium transition-all"
            style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)',
              background:'transparent' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all"
            style={{ background: danger ? '#ef4444' : 'var(--accent)',
              color: danger ? 'white' : 'var(--bg-primary)',
              fontFamily:'Bricolage Grotesque,sans-serif',
              boxShadow: !danger ? '0 0 20px rgba(203,255,71,0.3)' : 'none' }}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading, onTabChange }) {
  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner text="Loading stats..."/></div>;
  if (!stats) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total Students"    value={stats.totalUsers}         icon={Users}         type="accent"/>
        <StatCard label="Organizers"        value={stats.totalOrganizers}    icon={Building2}/>
        <StatCard label="Pending Approvals" value={stats.pendingOrganizers}  icon={Clock}
          delta={stats.pendingOrganizers > 0 ? `${stats.pendingOrganizers} need review` : 'All clear'} type={stats.pendingOrganizers > 0 ? 'warning' : 'default'}/>
        <StatCard label="Active Listings"   value={stats.activeListings}     icon={Zap}           type="accent"/>
        <StatCard label="Pending Listings"  value={stats.pendingListings}    icon={ListChecks}
          delta={stats.pendingListings > 0 ? 'Awaiting review' : 'All reviewed'} type={stats.pendingListings > 0 ? 'warning' : 'default'}/>
        <StatCard label="Total Listings"    value={stats.totalOpportunities} icon={LayoutDashboard}/>
      </div>

      {/* Quick action cards */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label:'Pending Organizer Approvals', count:stats.pendingOrganizers,  tab:'organizers', urgent:stats.pendingOrganizers>0 },
            { label:'Pending Listing Reviews',      count:stats.pendingListings,    tab:'listings',   urgent:stats.pendingListings>0 },
            { label:'Manage All Users',             count:stats.totalUsers,         tab:'users',      urgent:false },
          ].map(item => (
            <button key={item.tab} onClick={() => onTabChange(item.tab)}
              className="p-4 rounded-2xl text-left transition-all duration-150 w-full"
              style={{
                background: item.urgent ? 'rgba(251,191,36,0.06)' : 'rgba(255,255,255,0.03)',
                border:`1px solid ${item.urgent ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.07)'}`,
                backdropFilter:'blur(12px)',
              }}
              onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform='none'}>
              <p className="font-bold text-sm" style={{ color:'var(--text-primary)',
                fontFamily:'Bricolage Grotesque,sans-serif' }}>
                {item.label}
              </p>
              <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>{item.count} total</p>
              {item.urgent && <Badge type="warning" >{item.count} pending</Badge>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [role, setRole]       = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [confirm, setConfirm] = useState(null);
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminAPI.getAllUsers({ page, limit:LIMIT, role, search });
      setUsers(r.data.users || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, [page, role, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const doToggle = async () => {
    const u = confirm;
    setConfirm(null);
    try {
      const r = await adminAPI.toggleUserActive(u._id);
      setUsers(p => p.map(x => x._id===u._id ? {...x, isActive:r.data.isActive} : x));
      toast.success(r.data.isActive ? 'User activated' : 'User deactivated');
    } catch { toast.error('Failed'); }
  };

  const totalPages = Math.ceil(total/LIMIT);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color:'var(--text-muted)' }}/>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or email..."
            className="input-field pl-9" style={{ fontSize:'13px' }}/>
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1); }}
          className="input-field sm:w-40" style={{ fontSize:'13px' }}>
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="organizer">Organizers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner text="Loading users..."/></div>
      ) : !users.length ? (
        <EmptyState icon="👤" title="No users found" description="Try adjusting your search filters."/>
      ) : (
        <>
          {/* Table */}
          <div className="rounded-2xl overflow-hidden"
            style={{ border:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(12px)' }}>
            {/* Header */}
            <div className="grid px-5 py-3 text-xs font-bold uppercase tracking-widest"
              style={{ gridTemplateColumns:'1fr 1fr auto auto auto',
                borderBottom:'1px solid rgba(255,255,255,0.07)',
                background:'rgba(255,255,255,0.03)',
                color:'var(--text-muted)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              <span>Name</span>
              <span>Email</span>
              <span>Role</span>
              <span>Status</span>
              <span>Action</span>
            </div>
            {/* Rows */}
            {users.map(u => (
              <div key={u._id}
                className="grid items-center px-5 py-3.5 transition-colors"
                style={{ gridTemplateColumns:'1fr 1fr auto auto auto',
                  borderBottom:'1px solid rgba(255,255,255,0.04)',
                  background:'rgba(255,255,255,0.02)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.02)'}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background:'var(--accent)', color:'var(--bg-primary)',
                      fontFamily:'Bricolage Grotesque,sans-serif' }}>
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium truncate" style={{ color:'var(--text-primary)' }}>
                    {u.name}
                  </span>
                </div>
                <span className="text-xs truncate" style={{ color:'var(--text-muted)' }}>{u.email}</span>
                <Badge type={u.role==='admin'?'accent':u.role==='organizer'?'blue':'default'}>
                  {u.role}
                </Badge>
                <Badge type={u.isActive?'success':'danger'}>
                  {u.isActive?'Active':'Inactive'}
                </Badge>
                {u.role !== 'admin' && (
                  <button onClick={() => setConfirm(u)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: u.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(74,222,128,0.1)',
                      color:      u.isActive ? '#f87171' : '#4ade80',
                      border:`1px solid ${u.isActive ? 'rgba(239,68,68,0.25)' : 'rgba(74,222,128,0.25)'}`,
                      fontFamily:'Bricolage Grotesque,sans-serif',
                    }}>
                    {u.isActive ? <><UserX size={11}/> Ban</> : <><UserCheck size={11}/> Activate</>}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                {total} users total
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p=>Math.max(1,p-1))} disabled={page===1}
                  className="p-2 rounded-xl transition-colors disabled:opacity-30"
                  style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)' }}>
                  <ChevronLeft size={14}/>
                </button>
                <span className="text-sm px-3" style={{ color:'var(--text-secondary)' }}>
                  {page} / {totalPages}
                </span>
                <button onClick={() => setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="p-2 rounded-xl transition-colors disabled:opacity-30"
                  style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)' }}>
                  <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!confirm}
        title={confirm?.isActive ? 'Deactivate User' : 'Activate User'}
        message={confirm?.isActive
          ? `Deactivate "${confirm?.name}"? They will not be able to log in.`
          : `Activate "${confirm?.name}"? They will regain access.`}
        confirmLabel={confirm?.isActive ? 'Deactivate' : 'Activate'}
        danger={confirm?.isActive}
        onConfirm={doToggle}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

// ── Organizers Tab ────────────────────────────────────────────────────────────
function OrganizersTab() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [confirm, setConfirm]       = useState(null);

  useEffect(() => {
    adminAPI.getPendingOrganizers()
      .then(r => setOrganizers(r.data.organizers||[]))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const doReview = async () => {
    const { org, action } = confirm;
    setConfirm(null);
    try {
      await adminAPI.reviewOrganizer(org._id, { action });
      setOrganizers(p => p.filter(o => o._id !== org._id));
      toast.success(`Organizer ${action}d`);
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner/></div>;
  if (!organizers.length) return (
    <EmptyState icon="✅" title="All caught up!" description="No pending organizer applications."/>
  );

  return (
    <>
      <div className="space-y-3">
        {organizers.map(org => (
          <div key={org._id} className="p-5 rounded-2xl"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
              backdropFilter:'blur(12px)', borderLeft:'3px solid var(--accent)' }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                  style={{ background:'var(--accent)', color:'var(--bg-primary)',
                    fontFamily:'Bricolage Grotesque,sans-serif' }}>
                  {org.organizerProfile?.organizationName?.[0] || org.name?.[0]}
                </div>
                <div>
                  <p className="font-bold" style={{ color:'var(--text-primary)',
                    fontFamily:'Bricolage Grotesque,sans-serif' }}>
                    {org.organizerProfile?.organizationName || 'Unnamed'}
                  </p>
                  <p className="text-xs" style={{ color:'var(--text-muted)' }}>
                    {org.name} • {org.email}
                  </p>
                  {org.organizerProfile?.emailDomain && (
                    <p className="text-xs mt-0.5" style={{ color:'var(--text-secondary)' }}>
                      Domain: {org.organizerProfile.emailDomain}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setConfirm({ org, action:'approve' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80',
                    border:'1px solid rgba(74,222,128,0.25)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                  <CheckCircle size={13}/> Approve
                </button>
                <button onClick={() => setConfirm({ org, action:'reject' })}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={{ background:'rgba(239,68,68,0.1)', color:'#f87171',
                    border:'1px solid rgba(239,68,68,0.25)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                  <XCircle size={13}/> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal open={!!confirm}
        title={confirm?.action==='approve'?'Approve Organizer':'Reject Organizer'}
        message={confirm?.action==='approve'
          ? `Approve "${confirm?.org?.organizerProfile?.organizationName}"? They can post listings.`
          : `Reject "${confirm?.org?.organizerProfile?.organizationName}"?`}
        confirmLabel={confirm?.action==='approve'?'Approve':'Reject'}
        danger={confirm?.action==='reject'}
        onConfirm={doReview} onCancel={() => setConfirm(null)}/>
    </>
  );
}

// ── Listings Tab ──────────────────────────────────────────────────────────────
function ListingsTab() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [confirm, setConfirm]   = useState(null);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      if (statusFilter === 'pending') {
        const r = await adminAPI.getPendingListings();
        setListings(r.data.listings||[]);
      } else {
        const r = await adminAPI.getAllListings({ status:statusFilter, limit:50 });
        setListings(r.data.listings||[]);
      }
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const doReview = async () => {
    const { listing, action } = confirm;
    setConfirm(null);
    try {
      await adminAPI.reviewListing(listing._id, { action });
      setListings(p => p.filter(l => l._id !== listing._id));
      toast.success(`Listing ${action}d`);
    } catch { toast.error('Failed'); }
  };

  const doArchive = async (id) => {
    try {
      await adminAPI.archiveListing(id);
      setListings(p => p.filter(l => l._id !== id));
      toast.success('Listing archived');
    } catch { toast.error('Failed'); }
  };

  const doFeature = async (id) => {
    try {
      const r = await adminAPI.toggleFeatured(id);
      setListings(p => p.map(l => l._id===id ? {...l, isFeatured:r.data.isFeatured} : l));
      toast.success(r.data.isFeatured ? '⭐ Featured!' : 'Unfeatured');
    } catch { toast.error('Failed'); }
  };

  const TYPE_COLORS = { competition:'accent', scholarship:'success', workshop:'warning', event:'blue' };

  return (
    <div className="space-y-4">
      {/* Status filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {['pending','active','archived','rejected'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
            style={{
              background: statusFilter===s ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
              color:       statusFilter===s ? 'var(--bg-primary)' : 'var(--text-muted)',
              border:`1px solid ${statusFilter===s ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
              fontFamily:'Bricolage Grotesque,sans-serif',
            }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner/></div>
      ) : !listings.length ? (
        <EmptyState icon="✅" title="No listings" description={`No ${statusFilter} listings found.`}/>
      ) : (
        <div className="space-y-3">
          {listings.map(listing => (
            <div key={listing._id} className="p-5 rounded-2xl"
              style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                backdropFilter:'blur(12px)' }}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-sm"
                      style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                      {listing.title}
                    </h3>
                    <Badge type={TYPE_COLORS[listing.type]||'default'}>{listing.type}</Badge>
                    {listing.isFeatured && <Badge type="accent">⭐ Featured</Badge>}
                  </div>
                  <p className="text-xs mb-2" style={{ color:'var(--text-muted)' }}>
                    by {listing.organizer?.organizerProfile?.organizationName || listing.organizer?.name}
                    {' • '}{listing.isOnline ? 'Online' : listing.city}
                    {' • '}Deadline: {new Date(listing.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-xs line-clamp-2" style={{ color:'var(--text-secondary)', lineHeight:1.5 }}>
                    {listing.description?.slice(0,120)}...
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 flex-shrink-0">
                  {statusFilter === 'pending' && (
                    <>
                      <button onClick={() => setConfirm({ listing, action:'approve' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background:'rgba(74,222,128,0.1)', color:'#4ade80',
                          border:'1px solid rgba(74,222,128,0.25)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                        <CheckCircle size={11}/> Approve
                      </button>
                      <button onClick={() => setConfirm({ listing, action:'reject' })}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                        style={{ background:'rgba(239,68,68,0.1)', color:'#f87171',
                          border:'1px solid rgba(239,68,68,0.25)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                        <XCircle size={11}/> Reject
                      </button>
                    </>
                  )}
                  <button onClick={() => doFeature(listing._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                    style={{ background:'rgba(203,255,71,0.08)', color:'var(--accent)',
                      border:'1px solid rgba(203,255,71,0.2)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                    <Star size={11}/> {listing.isFeatured?'Unfeature':'Feature'}
                  </button>
                  {statusFilter === 'active' && (
                    <button onClick={() => doArchive(listing._id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={{ background:'rgba(255,255,255,0.05)', color:'var(--text-muted)',
                        border:'1px solid rgba(255,255,255,0.1)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                      <Archive size={11}/> Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal open={!!confirm}
        title={confirm?.action==='approve'?'Approve Listing':'Reject Listing'}
        message={confirm?.action==='approve'
          ? `Approve "${confirm?.listing?.title}"? It will go live immediately.`
          : `Reject "${confirm?.listing?.title}"?`}
        confirmLabel={confirm?.action==='approve'?'Approve':'Reject'}
        danger={confirm?.action==='reject'}
        onConfirm={doReview} onCancel={() => setConfirm(null)}/>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab]     = useState('overview');
  const [stats, setStats]             = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setStatsLoading(false));
  }, []);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-primary)' }}>
      {/* Subtle bg glow */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(203,255,71,0.04) 0%,transparent 60%)' }}/>

      <Navbar/>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex items-start justify-between mb-8 anim-fade-up">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg" style={{ background:'rgba(203,255,71,0.1)', border:'1px solid rgba(203,255,71,0.2)' }}>
                <Shield size={15} style={{ color:'var(--accent)' }}/>
              </div>
              <span className="text-xs font-bold uppercase tracking-widest"
                style={{ color:'var(--accent)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                Admin Panel
              </span>
            </div>
            <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
              fontSize:'clamp(22px,3vw,32px)', color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
              Dashboard
            </h1>
            <p className="mt-1 text-sm" style={{ color:'var(--text-secondary)' }}>
              Welcome back, {user?.name?.split(' ')[0]}
            </p>
          </div>
          {stats && (stats.pendingOrganizers>0 || stats.pendingListings>0) && (
            <div className="hidden sm:flex items-center gap-2">
              {stats.pendingOrganizers>0 && <Badge type="warning"><Clock size={10}/> {stats.pendingOrganizers} organizers</Badge>}
              {stats.pendingListings>0   && <Badge type="warning"><Clock size={10}/> {stats.pendingListings} listings</Badge>}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit anim-fade-up delay-1"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            backdropFilter:'blur(12px)' }}>
          {TABS.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
              style={{
                background: activeTab===id ? 'var(--accent)' : 'transparent',
                color:      activeTab===id ? 'var(--bg-primary)' : 'var(--text-muted)',
                fontFamily:'Bricolage Grotesque,sans-serif',
                boxShadow:  activeTab===id ? '0 0 20px rgba(203,255,71,0.3)' : 'none',
              }}>
              <Icon size={14}/>
              <span className="hidden sm:block">{label}</span>
              {id==='organizers' && stats?.pendingOrganizers>0 && activeTab!==id && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#fbbf24', flexShrink:0 }}/>
              )}
              {id==='listings' && stats?.pendingListings>0 && activeTab!==id && (
                <span className="w-1.5 h-1.5 rounded-full" style={{ background:'#fbbf24', flexShrink:0 }}/>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="anim-fade-up delay-2">
          {activeTab==='overview'   && <OverviewTab stats={stats} loading={statsLoading} onTabChange={setActiveTab}/>}
          {activeTab==='users'      && <UsersTab/>}
          {activeTab==='organizers' && <OrganizersTab/>}
          {activeTab==='listings'   && <ListingsTab/>}
        </div>
      </div>
    </div>
  );
}
