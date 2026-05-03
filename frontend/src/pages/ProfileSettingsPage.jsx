import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../api/user';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { Lock, Mail, AlertTriangle, Eye, EyeOff, Loader2, Check, ArrowLeft } from 'lucide-react';

const TABS = [
  { id: 'password', label: 'Change Password', icon: Lock },
  { id: 'email',    label: 'Change Email',    icon: Mail },
  { id: 'danger',   label: 'Danger Zone',     icon: AlertTriangle },
];

function InputField({ label, name, type = 'text', value, onChange, error, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  return (
    <div className="mb-4">
      <label
        className="block text-xs font-bold uppercase tracking-widest mb-2"
        style={{ color: 'var(--text-muted)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          name={name}
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`input-field${error ? ' error' : ''}${isPassword ? ' pr-12' : ''}`}
        />
        {isPassword && (
          <button
            type="button" tabIndex={-1}
            onClick={() => setShow(p => !p)}
            className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
            style={{ color: 'var(--text-muted)', opacity: 0.7, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default function ProfileSettingsPage() {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [activeTab, setActiveTab] = useState('password');

  // ── Change Password state ─────────────────────────────────────────────────
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = (e) => {
    setPwForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (pwErrors[e.target.name]) setPwErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword)                             errs.currentPassword    = 'Required';
    if (!pwForm.newPassword)                                 errs.newPassword        = 'Required';
    else if (pwForm.newPassword.length < 8)                  errs.newPassword        = 'Minimum 8 characters';
    if (pwForm.newPassword !== pwForm.confirmNewPassword)    errs.confirmNewPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setPwErrors(errs); return; }

    setPwLoading(true);
    try {
      await userAPI.changePassword(pwForm);
      toast.success('Password changed! Please login again.');
      setPwForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setTimeout(() => { logout(); navigate('/login'); }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      if (msg.toLowerCase().includes('current')) setPwErrors({ currentPassword: msg });
      else toast.error(msg);
    } finally {
      setPwLoading(false);
    }
  };

  // ── Change Email state ────────────────────────────────────────────────────
  const [emForm, setEmForm]     = useState({ newEmail: '', currentPassword: '' });
  const [emErrors, setEmErrors] = useState({});
  const [emLoading, setEmLoading] = useState(false);

  const handleEmChange = (e) => {
    setEmForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (emErrors[e.target.name]) setEmErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!emForm.newEmail)                                   errs.newEmail        = 'Required';
    else if (!/^\S+@\S+\.\S+$/.test(emForm.newEmail))      errs.newEmail        = 'Invalid email';
    if (!emForm.currentPassword)                            errs.currentPassword = 'Required';
    if (Object.keys(errs).length) { setEmErrors(errs); return; }

    setEmLoading(true);
    try {
      await userAPI.changeEmail(emForm);
      toast.success('Email changed! Please login again.');
      setTimeout(() => { logout(); navigate('/login'); }, 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change email');
    } finally {
      setEmLoading(false);
    }
  };

  // ── Deactivate state ──────────────────────────────────────────────────────
  const [deactivatePass, setDeactivatePass]       = useState('');
  const [deactivateLoading, setDeactivateLoading] = useState(false);
  const [showConfirm, setShowConfirm]             = useState(false);

  const submitDeactivate = async () => {
    if (!deactivatePass) { toast.error('Enter your password to confirm'); return; }
    setDeactivateLoading(true);
    try {
      await userAPI.deactivateAccount({ currentPassword: deactivatePass });
      toast.success('Account deactivated');
      logout();
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setDeactivateLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8" style={{ paddingTop: '88px' }}>

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Heading */}
        <h1
          style={{
            fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
            fontSize: '28px', letterSpacing: '-0.5px',
            color: 'var(--text-primary)', marginBottom: '4px',
          }}
        >
          Account Settings
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          {user?.email}
        </p>

        {/* Tabs */}
        <div
          className="flex gap-1 mb-6 p-1 rounded-xl flex-wrap"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            width: 'fit-content',
          }}
        >
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                fontFamily: 'Bricolage Grotesque, sans-serif',
                cursor: 'pointer',
                background: activeTab === tab.id
                  ? (tab.id === 'danger' ? 'rgba(239,68,68,0.15)' : 'rgba(203,255,71,0.1)')
                  : 'transparent',
                color: activeTab === tab.id
                  ? (tab.id === 'danger' ? '#f87171' : 'var(--accent)')
                  : 'var(--text-muted)',
                border: activeTab === tab.id
                  ? `1px solid ${tab.id === 'danger' ? 'rgba(239,68,68,0.3)' : 'rgba(203,255,71,0.25)'}`
                  : '1px solid transparent',
              }}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* ── Password Tab ────────────────────────────────────────────── */}
          {activeTab === 'password' && (
            <form onSubmit={submitPassword}>
              <h2
                style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
                  fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px',
                }}
              >
                Change Password
              </h2>
              <InputField
                label="Current Password" name="currentPassword" type="password"
                value={pwForm.currentPassword} onChange={handlePwChange}
                error={pwErrors.currentPassword} placeholder="Your current password"
                autoComplete="current-password"
              />
              <InputField
                label="New Password" name="newPassword" type="password"
                value={pwForm.newPassword} onChange={handlePwChange}
                error={pwErrors.newPassword} placeholder="Minimum 8 characters"
                autoComplete="new-password"
              />
              <InputField
                label="Confirm New Password" name="confirmNewPassword" type="password"
                value={pwForm.confirmNewPassword} onChange={handlePwChange}
                error={pwErrors.confirmNewPassword} placeholder="Repeat new password"
                autoComplete="new-password"
              />
              <button type="submit" disabled={pwLoading} className="btn-primary w-full py-3 mt-2">
                {pwLoading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Updating...</span>
                  : <span className="flex items-center justify-center gap-2"><Check size={15} /> Update Password</span>
                }
              </button>
            </form>
          )}

          {/* ── Email Tab ───────────────────────────────────────────────── */}
          {activeTab === 'email' && (
            <form onSubmit={submitEmail}>
              <h2
                style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
                  fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px',
                }}
              >
                Change Email
              </h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                Current:{' '}
                <strong style={{ color: 'var(--text-secondary)' }}>{user?.email}</strong>
              </p>
              <InputField
                label="New Email Address" name="newEmail" type="email"
                value={emForm.newEmail} onChange={handleEmChange}
                error={emErrors.newEmail} placeholder="your@newemail.com"
                autoComplete="email"
              />
              <InputField
                label="Confirm with Password" name="currentPassword" type="password"
                value={emForm.currentPassword} onChange={handleEmChange}
                error={emErrors.currentPassword} placeholder="Your current password"
                autoComplete="current-password"
              />
              <button type="submit" disabled={emLoading} className="btn-primary w-full py-3 mt-2">
                {emLoading
                  ? <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" /> Updating...</span>
                  : <span className="flex items-center justify-center gap-2"><Check size={15} /> Update Email</span>
                }
              </button>
            </form>
          )}

          {/* ── Danger Zone Tab ─────────────────────────────────────────── */}
          {activeTab === 'danger' && (
            <div>
              <h2
                style={{
                  fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 700,
                  fontSize: '18px', color: '#f87171', marginBottom: '12px',
                }}
              >
                ⚠️ Danger Zone
              </h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                Deactivating your account will immediately log you out and hide your data.
                Your data is preserved — an admin can restore your account. Contact support to reverse this.
              </p>

              {!showConfirm ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="w-full py-3 rounded-xl font-bold text-sm"
                  style={{
                    background: 'rgba(239,68,68,0.1)', color: '#f87171',
                    border: '1px solid rgba(239,68,68,0.3)',
                    fontFamily: 'Bricolage Grotesque, sans-serif', cursor: 'pointer',
                  }}
                >
                  Deactivate My Account
                </button>
              ) : (
                <div
                  className="rounded-xl p-4"
                  style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <p className="text-sm font-semibold mb-3" style={{ color: '#f87171' }}>
                    Enter your password to confirm:
                  </p>
                  <input
                    type="password"
                    value={deactivatePass}
                    onChange={e => setDeactivatePass(e.target.value)}
                    placeholder="Your current password"
                    className="input-field mb-3"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowConfirm(false)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                      style={{
                        background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)',
                        border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitDeactivate}
                      disabled={deactivateLoading}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold"
                      style={{
                        background: 'rgba(239,68,68,0.2)', color: '#f87171',
                        border: '1px solid rgba(239,68,68,0.4)',
                        fontFamily: 'Bricolage Grotesque, sans-serif',
                        cursor: deactivateLoading ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {deactivateLoading ? 'Deactivating...' : 'Yes, Deactivate'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}