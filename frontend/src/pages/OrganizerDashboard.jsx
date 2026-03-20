import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { organizerAPI } from '../api/organizer';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  LayoutDashboard, ListPlus, BookOpen, User,
  Eye, Bookmark, Zap, Clock, Archive,
  CheckCircle, XCircle, Edit3, Trash2,
  AlertCircle, Plus, ExternalLink, Building2,
  Calendar, MapPin, ChevronLeft, ChevronRight,
  Save, X
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────
const TABS = [
  { id:'overview',  label:'Overview',      icon:LayoutDashboard },
  { id:'listings',  label:'My Listings',   icon:BookOpen },
  { id:'create',    label:'Post Listing',  icon:ListPlus },
  { id:'profile',   label:'Profile',       icon:User },
];

const STATUS_CONFIG = {
  active:   { color:'#4ade80', bg:'rgba(74,222,128,0.1)',   border:'rgba(74,222,128,0.25)',  label:'Active' },
  pending:  { color:'#fbbf24', bg:'rgba(251,191,36,0.1)',   border:'rgba(251,191,36,0.25)',  label:'Pending Review' },
  archived: { color:'#8892A4', bg:'rgba(136,146,164,0.1)',  border:'rgba(136,146,164,0.25)', label:'Archived' },
  rejected: { color:'#f87171', bg:'rgba(239,68,68,0.1)',    border:'rgba(239,68,68,0.25)',   label:'Rejected' },
  draft:    { color:'#60a5fa', bg:'rgba(96,165,250,0.1)',   border:'rgba(96,165,250,0.25)',  label:'Draft' },
};

const TYPE_OPTIONS   = ['competition','scholarship','workshop','event'];
const CATEGORY_OPTIONS = ['technology','business','design','science','arts','social_impact','research','sports','other'];
const CITY_OPTIONS   = ['lahore','karachi','islamabad','peshawar','quetta','online','other'];
const DEGREE_OPTIONS = ['undergraduate','graduate','phd','open'];

const EMPTY_FORM = {
  title:'', shortDescription:'', description:'',
  type:'competition', category:'technology',
  deadline:'', eventDate:'',
  isOnline:false, city:'online', venue:'',
  degreeLevel:['open'], teamSize:{ min:1, max:1 },
  registrationLink:'', websiteLink:'',
  prize:'',
};

// ── Reusable ──────────────────────────────────────────────────────────────────
function Badge({ children, type='default' }) {
  const s = STATUS_CONFIG[type] || { color:'var(--text-muted)', bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.1)' };
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`,
        fontFamily:'Bricolage Grotesque,sans-serif' }}>
      {children}
    </span>
  );
}

function StatCard({ label, value, icon:Icon, accent }) {
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
            fontSize:'28px', lineHeight:1, letterSpacing:'-1px',
            color: accent ? 'var(--accent)' : 'var(--text-primary)',
            textShadow: accent ? '0 0 20px rgba(203,255,71,0.3)' : 'none' }}>
            {value ?? '—'}
          </p>
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

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger }) {
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
            style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)', background:'transparent' }}>
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl"
            style={{ background: danger ? '#ef4444' : 'var(--accent)',
              color: danger ? 'white' : 'var(--bg-primary)',
              fontFamily:'Bricolage Grotesque,sans-serif' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading, user, onTabChange }) {
  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner text="Loading..."/></div>;

  const isPending = user?.organizerProfile?.status === 'pending';
  const isRejected = user?.organizerProfile?.status === 'rejected';

  return (
    <div className="space-y-6">

      {/* Status banner */}
      {isPending && (
        <div className="p-4 rounded-2xl flex items-center gap-3"
          style={{ background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)' }}>
          <Clock size={18} style={{ color:'#fbbf24', flexShrink:0 }}/>
          <div>
            <p className="font-bold text-sm" style={{ color:'#fbbf24', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              Account Pending Approval
            </p>
            <p className="text-xs mt-0.5" style={{ color:'var(--text-secondary)' }}>
              Your organizer account is being reviewed. You can create listings but they won't go live until your account is approved.
            </p>
          </div>
        </div>
      )}
      {isRejected && (
        <div className="p-4 rounded-2xl flex items-center gap-3"
          style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)' }}>
          <XCircle size={18} style={{ color:'#f87171', flexShrink:0 }}/>
          <p className="text-sm" style={{ color:'#f87171' }}>
            Your organizer application was rejected. Contact support for more information.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Active Listings"   value={stats?.active}          icon={Zap}      accent/>
        <StatCard label="Pending Review"    value={stats?.pending}         icon={Clock}/>
        <StatCard label="Total Listings"    value={stats?.total}           icon={BookOpen}/>
        <StatCard label="Total Bookmarks"   value={stats?.totalBookmarks}  icon={Bookmark} accent/>
        <StatCard label="Total Views"       value={stats?.totalViews}      icon={Eye}/>
        <StatCard label="Archived"          value={stats?.archived}        icon={Archive}/>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button onClick={() => onTabChange('create')}
          className="p-5 rounded-2xl text-left transition-all duration-150 group"
          style={{ background:'rgba(203,255,71,0.06)', border:'1px solid rgba(203,255,71,0.2)',
            backdropFilter:'blur(12px)' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='none'}>
          <Plus size={20} style={{ color:'var(--accent)', marginBottom:'10px' }}/>
          <p className="font-bold text-sm" style={{ color:'var(--text-primary)',
            fontFamily:'Bricolage Grotesque,sans-serif' }}>Post a New Listing</p>
          <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
            Create a hackathon, scholarship, or workshop
          </p>
        </button>
        <button onClick={() => onTabChange('listings')}
          className="p-5 rounded-2xl text-left transition-all duration-150"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            backdropFilter:'blur(12px)' }}
          onMouseEnter={e => e.currentTarget.style.transform='translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform='none'}>
          <BookOpen size={20} style={{ color:'var(--text-muted)', marginBottom:'10px' }}/>
          <p className="font-bold text-sm" style={{ color:'var(--text-primary)',
            fontFamily:'Bricolage Grotesque,sans-serif' }}>Manage Listings</p>
          <p className="text-xs mt-1" style={{ color:'var(--text-muted)' }}>
            Edit, archive, or view your posted listings
          </p>
        </button>
      </div>
    </div>
  );
}

// ── Listings Tab ──────────────────────────────────────────────────────────────
function ListingsTab({ onEdit }) {
  const [listings, setListings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [statusFilter, setStatus] = useState('');
  const [page, setPage]           = useState(1);
  const [total, setTotal]         = useState(0);
  const [confirm, setConfirm]     = useState(null);
  const LIMIT = 8;

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await organizerAPI.getListings({ status:statusFilter, page, limit:LIMIT });
      setListings(r.data.listings || []);
      setTotal(r.data.total || 0);
    } catch { toast.error('Failed to load listings'); }
    finally { setLoading(false); }
  }, [statusFilter, page]);

  useEffect(() => { fetch(); }, [fetch]);

  const doArchive = async () => {
    const id = confirm;
    setConfirm(null);
    try {
      await organizerAPI.archiveListing(id);
      setListings(p => p.filter(l => l._id !== id));
      toast.success('Listing archived');
    } catch { toast.error('Failed'); }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-4">
      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        {['', 'active', 'pending', 'archived', 'rejected'].map(s => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
            style={{
              background: statusFilter===s ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
              color:      statusFilter===s ? 'var(--bg-primary)' : 'var(--text-muted)',
              border:`1px solid ${statusFilter===s ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
              fontFamily:'Bricolage Grotesque,sans-serif',
            }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><LoadingSpinner/></div>
      ) : !listings.length ? (
        <EmptyState icon="📋" title="No listings yet"
          description="Post your first opportunity to get started."/>
      ) : (
        <>
          <div className="space-y-3">
            {listings.map(l => {
              const sc = STATUS_CONFIG[l.status] || STATUS_CONFIG.pending;
              const days = Math.ceil((new Date(l.deadline) - new Date()) / (1000*60*60*24));
              return (
                <div key={l._id} className="p-5 rounded-2xl transition-all"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
                    backdropFilter:'blur(12px)' }}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-sm truncate"
                          style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                          {l.title}
                        </h3>
                        <Badge type={l.status}>{sc.label}</Badge>
                        {l.isFeatured && (
                          <span className="text-xs" style={{ color:'var(--accent)' }}>⭐</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color:'var(--text-muted)' }}>
                        <span className="capitalize">{l.type}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10}/>
                          {days > 0 ? `${days}d left` : 'Expired'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Eye size={10}/>{l.viewCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Bookmark size={10}/>{l.bookmarkCount || 0}
                        </span>
                      </div>
                      {l.status === 'rejected' && l.rejectionReason && (
                        <p className="text-xs mt-1" style={{ color:'#f87171' }}>
                          Reason: {l.rejectionReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {l.registrationLink && (
                        <a href={l.registrationLink} target="_blank" rel="noopener noreferrer"
                          className="p-2 rounded-xl transition-colors"
                          style={{ color:'var(--text-muted)', border:'1px solid rgba(255,255,255,0.1)' }}>
                          <ExternalLink size={13}/>
                        </a>
                      )}
                      {l.status !== 'archived' && (
                        <button onClick={() => onEdit(l)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background:'rgba(96,165,250,0.1)', color:'#60a5fa',
                            border:'1px solid rgba(96,165,250,0.25)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                          <Edit3 size={11}/> Edit
                        </button>
                      )}
                      {l.status !== 'archived' && (
                        <button onClick={() => setConfirm(l._id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
                          style={{ background:'rgba(239,68,68,0.08)', color:'#f87171',
                            border:'1px solid rgba(239,68,68,0.2)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                          <Archive size={11}/> Archive
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                className="p-2 rounded-xl transition-colors disabled:opacity-30"
                style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)' }}>
                <ChevronLeft size={14}/>
              </button>
              <span className="text-sm" style={{ color:'var(--text-secondary)' }}>{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                className="p-2 rounded-xl transition-colors disabled:opacity-30"
                style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-secondary)' }}>
                <ChevronRight size={14}/>
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmModal open={!!confirm} title="Archive Listing"
        message="Archive this listing? Students will no longer see it. You can't undo this."
        danger onConfirm={doArchive} onCancel={() => setConfirm(null)}/>
    </div>
  );
}

// ── Create / Edit Form ────────────────────────────────────────────────────────
function ListingForm({ editListing, onSuccess, onCancel }) {
  const isEdit = !!editListing;
  const [form, setForm]     = useState(editListing ? {
    ...EMPTY_FORM, ...editListing,
    deadline:  editListing.deadline  ? new Date(editListing.deadline).toISOString().slice(0,10)  : '',
    eventDate: editListing.eventDate ? new Date(editListing.eventDate).toISOString().slice(0,10) : '',
  } : { ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.title)            e.title = 'Title required';
    if (!form.description)      e.description = 'Description required';
    if (!form.deadline)         e.deadline = 'Deadline required';
    if (!form.registrationLink) e.registrationLink = 'Registration link required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form,
        deadline:  form.deadline  ? new Date(form.deadline).toISOString()  : null,
        eventDate: form.eventDate ? new Date(form.eventDate).toISOString() : null,
      };
      if (isEdit) {
        await organizerAPI.updateListing(editListing._id, payload);
        toast.success('Listing updated!');
      } else {
        const r = await organizerAPI.createListing(payload);
        toast.success(r.data.message || 'Listing created!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  const Field = ({ label, error, children }) => (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );

  return (
    <div>
      {isEdit && (
        <div className="flex items-center justify-between mb-6">
          <h2 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'20px', color:'var(--text-primary)' }}>Edit Listing</h2>
          <button onClick={onCancel} className="p-2 rounded-xl"
            style={{ border:'1px solid rgba(255,255,255,0.1)', color:'var(--text-muted)' }}>
            <X size={15}/>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Title */}
        <Field label="Title *" error={errors.title}>
          <input value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="e.g. NUST Procom 2025" className={`input-field${errors.title?' error':''}`}/>
        </Field>

        {/* Type + Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Type *">
            <select value={form.type} onChange={e => set('type', e.target.value)} className="input-field capitalize">
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Category *">
            <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
              {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
            </select>
          </Field>
        </div>

        {/* Short description */}
        <Field label="Short Description">
          <input value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)}
            placeholder="One line summary (shown on cards)" className="input-field" maxLength={200}/>
        </Field>

        {/* Description */}
        <Field label="Full Description *" error={errors.description}>
          <textarea value={form.description} onChange={e => set('description', e.target.value)}
            placeholder="Detailed description of the opportunity..."
            className={`input-field${errors.description?' error':''}`}
            rows={5} style={{ resize:'vertical', minHeight:'120px' }}/>
        </Field>

        {/* Deadline + Event Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Application Deadline *" error={errors.deadline}>
            <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)}
              className={`input-field${errors.deadline?' error':''}`}
              min={new Date().toISOString().slice(0,10)}/>
          </Field>
          <Field label="Event Date (optional)">
            <input type="date" value={form.eventDate} onChange={e => set('eventDate', e.target.value)}
              className="input-field"/>
          </Field>
        </div>

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="City">
            <select value={form.city} onChange={e => { set('city', e.target.value); if (e.target.value==='online') set('isOnline',true); }}
              className="input-field capitalize">
              {CITY_OPTIONS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </Field>
          <Field label="Venue (if in-person)">
            <input value={form.venue} onChange={e => set('venue', e.target.value)}
              placeholder="e.g. NUST H-12 Campus" className="input-field" disabled={form.isOnline}/>
          </Field>
        </div>

        {/* Online toggle */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => set('isOnline', !form.isOnline)}
            className="relative w-10 h-5 rounded-full transition-all"
            style={{ background: form.isOnline ? 'var(--accent)' : 'rgba(255,255,255,0.15)' }}>
            <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
              style={{ left: form.isOnline ? '22px' : '2px' }}/>
          </button>
          <span className="text-sm" style={{ color:'var(--text-secondary)' }}>This is an online opportunity</span>
        </div>

        {/* Degree Level */}
        <Field label="Eligible Degree Levels">
          <div className="flex gap-2 flex-wrap">
            {DEGREE_OPTIONS.map(d => (
              <button key={d} type="button"
                onClick={() => {
                  const current = form.degreeLevel || [];
                  set('degreeLevel', current.includes(d)
                    ? current.filter(x => x !== d)
                    : [...current, d]);
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all"
                style={{
                  background: (form.degreeLevel||[]).includes(d) ? 'rgba(203,255,71,0.1)' : 'rgba(255,255,255,0.04)',
                  color:      (form.degreeLevel||[]).includes(d) ? 'var(--accent)' : 'var(--text-muted)',
                  border:`1px solid ${(form.degreeLevel||[]).includes(d) ? 'rgba(203,255,71,0.25)' : 'rgba(255,255,255,0.07)'}`,
                }}>
                {d}
              </button>
            ))}
          </div>
        </Field>

        {/* Prize + Registration Link */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Prize / Award (optional)">
            <input value={form.prize} onChange={e => set('prize', e.target.value)}
              placeholder="e.g. PKR 500K, Full Scholarship" className="input-field"/>
          </Field>
          <Field label="Registration Link *" error={errors.registrationLink}>
            <input value={form.registrationLink} onChange={e => set('registrationLink', e.target.value)}
              placeholder="https://..." className={`input-field${errors.registrationLink?' error':''}`}/>
          </Field>
        </div>

        {/* Website */}
        <Field label="Official Website (optional)">
          <input value={form.websiteLink} onChange={e => set('websiteLink', e.target.value)}
            placeholder="https://..." className="input-field"/>
        </Field>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          {isEdit && (
            <button type="button" onClick={onCancel} className="btn-ghost flex-1 py-3">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading}
            className="btn-primary flex-1 py-3 flex items-center justify-center gap-2">
            {loading
              ? <><div style={{ width:16, height:16, border:'2px solid rgba(0,0,0,0.3)',
                  borderTop:'2px solid var(--bg-primary)', borderRadius:'50%',
                  animation:'spin 0.7s linear infinite' }}/> Saving...</>
              : <><Save size={16}/>{isEdit ? 'Update Listing' : 'Post Listing'}</>
            }
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user }) {
  const [form, setForm]     = useState({
    organizationName: user?.organizerProfile?.organizationName || '',
    emailDomain:      user?.organizerProfile?.emailDomain      || '',
    website:          user?.organizerProfile?.website          || '',
    description:      user?.organizerProfile?.description      || '',
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await organizerAPI.updateProfile(form);
      setUser(r.data.user);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  const statusConfig = STATUS_CONFIG[user?.organizerProfile?.status] || STATUS_CONFIG.pending;

  return (
    <div className="max-w-xl space-y-6">
      {/* Account status */}
      <div className="p-4 rounded-2xl flex items-center gap-3"
        style={{ background: statusConfig.bg, border:`1px solid ${statusConfig.border}` }}>
        <Building2 size={18} style={{ color: statusConfig.color, flexShrink:0 }}/>
        <div>
          <p className="font-bold text-sm" style={{ color: statusConfig.color,
            fontFamily:'Bricolage Grotesque,sans-serif' }}>
            Account Status: {statusConfig.label}
          </p>
          <p className="text-xs mt-0.5" style={{ color:'var(--text-secondary)' }}>
            {user?.organizerProfile?.status === 'approved'
              ? 'Your account is verified. Listings go live immediately.'
              : 'Admin review required for your first listing.'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="form-label">Organization Name</label>
          <input value={form.organizationName}
            onChange={e => setForm(p=>({...p,organizationName:e.target.value}))}
            placeholder="FAST ACM, HEC Pakistan..." className="input-field"/>
        </div>
        <div>
          <label className="form-label">Email Domain</label>
          <input value={form.emailDomain}
            onChange={e => setForm(p=>({...p,emailDomain:e.target.value}))}
            placeholder="fast.edu.pk" className="input-field"/>
        </div>
        <div>
          <label className="form-label">Website</label>
          <input value={form.website}
            onChange={e => setForm(p=>({...p,website:e.target.value}))}
            placeholder="https://..." className="input-field"/>
        </div>
        <div>
          <label className="form-label">Description</label>
          <textarea value={form.description}
            onChange={e => setForm(p=>({...p,description:e.target.value}))}
            placeholder="Tell students about your organization..."
            className="input-field" rows={4} style={{ resize:'vertical' }}/>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [editListing, setEditListing]   = useState(null);

  useEffect(() => {
    organizerAPI.getStats()
      .then(r => setStats(r.data.stats))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const handleEdit = (listing) => {
    setEditListing(listing);
    setActiveTab('create');
  };

  const handleFormSuccess = () => {
    setEditListing(null);
    setActiveTab('listings');
  };

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
              <Building2 size={15} style={{ color:'var(--accent)' }}/>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest"
              style={{ color:'var(--accent)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              Organizer Panel
            </span>
          </div>
          <h1 style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
            fontSize:'clamp(22px,3vw,32px)', color:'var(--text-primary)', letterSpacing:'-0.5px' }}>
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color:'var(--text-secondary)' }}>
            {user?.organizerProfile?.organizationName || user?.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-6 p-1 rounded-xl w-fit anim-fade-up delay-1"
          style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)',
            backdropFilter:'blur(12px)' }}>
          {TABS.map(({ id, label, icon:Icon }) => (
            <button key={id} onClick={() => { if (id!=='create') setEditListing(null); setActiveTab(id); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
              style={{
                background: activeTab===id ? 'var(--accent)' : 'transparent',
                color:      activeTab===id ? 'var(--bg-primary)' : 'var(--text-muted)',
                fontFamily:'Bricolage Grotesque,sans-serif',
                boxShadow:  activeTab===id ? '0 0 20px rgba(203,255,71,0.3)' : 'none',
              }}>
              <Icon size={14}/>
              <span className="hidden sm:block">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="anim-fade-up delay-2">
          {activeTab==='overview' && (
            <OverviewTab stats={stats} loading={statsLoading} user={user} onTabChange={setActiveTab}/>
          )}
          {activeTab==='listings' && (
            <ListingsTab onEdit={handleEdit}/>
          )}
          {activeTab==='create' && (
            <ListingForm
              editListing={editListing}
              onSuccess={handleFormSuccess}
              onCancel={() => { setEditListing(null); setActiveTab('listings'); }}
            />
          )}
          {activeTab==='profile' && <ProfileTab user={user}/>}
        </div>
      </div>
    </div>
  );
}
