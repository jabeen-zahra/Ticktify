import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Enter a valid email address'); return; }

    setLoading(true);
    setError('');
    // Simulate — replace with real API call when reset endpoint is ready
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <AuthLayout heading="Reset Password" subheading="Enter your email to receive reset instructions">

      {submitted ? (
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(203,255,71,0.1)', border: '1px solid rgba(203,255,71,0.25)' }}
            >
              <CheckCircle size={32} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
          <h3
            style={{
              fontFamily: 'Bricolage Grotesque, sans-serif', fontWeight: 800,
              fontSize: '20px', color: 'var(--text-primary)', marginBottom: '10px',
            }}
          >
            Check your inbox
          </h3>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
            If an account exists for{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>{email}</strong>,
            we've sent reset instructions. Check your spam folder if not visible within 2 minutes.
          </p>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--accent)', textDecoration: 'none' }}
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-6">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="you@university.edu.pk"
              autoComplete="email"
              className={`input-field${error ? ' error' : ''}`}
            />
            {error && <p className="field-error">{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 mb-6">
            {loading
              ? <span className="flex items-center justify-center gap-2"><Loader2 size={16} className="animate-spin" /> Sending...</span>
              : <span className="flex items-center justify-center gap-2"><Mail size={16} /> Send Reset Link</span>
            }
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm transition-opacity hover:opacity-70"
              style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}