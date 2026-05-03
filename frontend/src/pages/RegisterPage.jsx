import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AuthLayout from '../components/auth/AuthLayout';
import { Eye, EyeOff, ArrowRight, Loader2, GraduationCap, Building2 } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'student',   label: 'Student',   icon: GraduationCap, desc: 'Discover & track opportunities' },
  { value: 'organizer', label: 'Organizer', icon: Building2,      desc: 'Post events & competitions'    },
];

const DEGREE_OPTIONS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'graduate',      label: 'Graduate'       },
  { value: 'phd',           label: 'PhD'            },
];

export default function RegisterPage() {
  const navigate     = useNavigate();
  const { register } = useAuth();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'student', university: '', degreeLevel: 'undergraduate',
    organizationName: '', emailDomain: '',
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};

    if (!form.name.trim())
      e.name = 'Full name is required';
    else if (form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters';

    if (!form.email)
      e.email = 'Email address is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = 'Enter a valid email address';

    if (!form.password)
      e.password = 'Password is required';
    else if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters';
    else if (!/[A-Za-z]/.test(form.password))
      e.password = 'Password must contain at least one letter (a-z)';
    else if (!/[0-9]/.test(form.password))
      e.password = 'Password must contain at least one number (0-9)';

    if (!form.confirmPassword)
      e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match';

    if (form.role === 'student' && !form.university.trim())
      e.university = 'University name is required';

    if (form.role === 'organizer' && !form.organizationName.trim())
      e.organizationName = 'Organization name is required';

    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name:        form.name.trim(),
        email:       form.email.trim(),
        password:    form.password,
        role:        form.role,
        university:  form.university.trim() || null,
        degreeLevel: form.degreeLevel || null,
        ...(form.role === 'organizer' && {
          organizerProfile: {
            organizationName: form.organizationName.trim(),
            emailDomain:      form.emailDomain.trim() || '',
          },
        }),
      };
      await register(payload);
      toast.success('Account created! Welcome to Ticktify 🎉');
      navigate(form.role === 'organizer' ? '/organizer' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const pwLen    = form.password.length >= 8;
  const pwLetter = /[A-Za-z]/.test(form.password);
  const pwNumber = /[0-9]/.test(form.password);
  const pwMatch  = form.password && form.confirmPassword && form.password === form.confirmPassword;

  return (
    <AuthLayout heading="Create account" subheading="Join thousands of students finding opportunities daily">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* ── Role toggle ───────────────────────────────────────── */}
        <div className="anim-fade-up delay-1">
          <label className="form-label">I am a...</label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
              <button key={value} type="button"
                onClick={() => setForm(p => ({ ...p, role: value }))}
                className="p-3 rounded-xl text-left transition-all duration-150"
                style={{
                  background: form.role === value ? 'var(--accent-glow)' : 'var(--bg-input)',
                  border: `1px solid ${form.role === value ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                <Icon size={16} style={{ color: form.role === value ? 'var(--accent)' : 'var(--text-muted)' }} />
                <p className="mt-1.5 font-bold text-sm"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    color: form.role === value ? 'var(--text-primary)' : 'var(--text-secondary)',
                  }}>
                  {label}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px' }}>{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Name + University / Organization ─────────────────── */}
        <div className="grid grid-cols-2 gap-3 anim-fade-up delay-2">
          <div>
            <label className="form-label">Full Name</label>
            <input name="name" value={form.name} onChange={onChange}
              placeholder="Ali Hassan"
              className={`input-field${errors.name ? ' error' : ''}`} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label className="form-label">
              {form.role === 'student' ? 'University' : 'Organization'}
            </label>
            {form.role === 'student' ? (
              <input name="university" value={form.university} onChange={onChange}
                placeholder="FAST, LUMS..."
                className={`input-field${errors.university ? ' error' : ''}`} />
            ) : (
              <input name="organizationName" value={form.organizationName} onChange={onChange}
                placeholder="FAST ACM..."
                className={`input-field${errors.organizationName ? ' error' : ''}`} />
            )}
            {(errors.university || errors.organizationName) && (
              <p className="field-error">{errors.university || errors.organizationName}</p>
            )}
          </div>
        </div>

        {/* ── Email ────────────────────────────────────────────── */}
        <div className="anim-fade-up delay-3">
          <label className="form-label">Email Address</label>
          <input name="email" type="email" value={form.email} onChange={onChange}
            placeholder="you@university.edu.pk" autoComplete="email"
            className={`input-field${errors.email ? ' error' : ''}`} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* ── Password + Confirm ────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 anim-fade-up delay-3">
          <div>
            <label className="form-label">Password</label>
            <div className="relative">
              <input name="password" type={showPass ? 'text' : 'password'}
                value={form.password} onChange={onChange}
                placeholder="Min 8 chars"
                className={`input-field pr-10${errors.password ? ' error' : ''}`} />
              <button type="button" tabIndex={-1}
                onClick={() => setShowPass(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {errors.password && <p className="field-error">{errors.password}</p>}

            {/* Live password requirements */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <p className="text-xs flex items-center gap-1.5"
                  style={{ color: pwLen ? '#4ade80' : 'var(--text-muted)' }}>
                  <span>{pwLen ? '✓' : '○'}</span> At least 8 characters
                </p>
                <p className="text-xs flex items-center gap-1.5"
                  style={{ color: pwLetter ? '#4ade80' : 'var(--text-muted)' }}>
                  <span>{pwLetter ? '✓' : '○'}</span> At least one letter
                </p>
                <p className="text-xs flex items-center gap-1.5"
                  style={{ color: pwNumber ? '#4ade80' : 'var(--text-muted)' }}>
                  <span>{pwNumber ? '✓' : '○'}</span> At least one number
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Confirm</label>
            <input name="confirmPassword" type="password"
              value={form.confirmPassword} onChange={onChange}
              placeholder="Repeat password"
              className={`input-field${errors.confirmPassword ? ' error' : ''}`} />
            {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}

            {/* Match indicator */}
            {form.confirmPassword && form.password && (
              <p className="text-xs mt-2 flex items-center gap-1.5"
                style={{ color: pwMatch ? '#4ade80' : '#f87171' }}>
                <span>{pwMatch ? '✓' : '✗'}</span>
                {pwMatch ? 'Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>
        </div>

        {/* ── Degree Level / Email Domain ───────────────────────── */}
        <div className="anim-fade-up delay-4">
          {form.role === 'student' ? (
            <>
              <label className="form-label">Degree Level</label>
              <select name="degreeLevel" value={form.degreeLevel}
                onChange={onChange} className="input-field">
                {DEGREE_OPTIONS.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label className="form-label">
                Email Domain{' '}
                <span style={{ color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>
                  (optional)
                </span>
              </label>
              <input name="emailDomain" value={form.emailDomain} onChange={onChange}
                placeholder="fast.edu.pk" className="input-field" />
              <p className="mt-2 text-xs px-3 py-2 rounded-lg"
                style={{
                  color: 'var(--accent)',
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--border-accent)',
                }}>
                ⏳ Organizer accounts require admin approval — usually within 24 hours.
              </p>
            </>
          )}
        </div>

        {/* ── Submit ────────────────────────────────────────────── */}
        <div className="anim-fade-up delay-5 pt-1">
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading
              ? <span className="flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" /> Creating account...
                </span>
              : <span className="flex items-center justify-center gap-2">
                  Create Account <ArrowRight size={16} />
                </span>
            }
          </button>
        </div>

        <div className="divider anim-fade-up delay-5">or</div>

        <p className="text-center text-sm anim-fade-up delay-5"
          style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700 }}
            className="hover:opacity-70 transition-opacity">
            Sign in →
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}