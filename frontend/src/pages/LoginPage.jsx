import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import AuthLayout from '../components/auth/AuthLayout';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();

  const [form, setForm]         = useState({ email:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [errors, setErrors]     = useState({});
  const [focused, setFocused]   = useState('');

  const validate = () => {
    const e = {};
    if (!form.email)              e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password)           e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back! 👋`);
      if      (user.role === 'admin')     navigate('/admin');
      else if (user.role === 'organizer') navigate('/organizer');
      else                                navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  const onChange = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  return (
    <AuthLayout heading="Welcome back" subheading="Sign in to discover your next opportunity">
      <form onSubmit={handleSubmit} noValidate>

        {/* Email */}
        <div className="anim-fade-up delay-1 mb-5">
          <label className="form-label">Email Address</label>
          <div className="relative">
            <input
              name="email" type="email" value={form.email}
              onChange={onChange}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              placeholder="you@university.edu.pk"
              autoComplete="email"
              className={`input-field${errors.email ? ' error' : ''}`}
            />
          </div>
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="anim-fade-up delay-2 mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="form-label" style={{ marginBottom:0 }}>Password</label>
            <Link to="/forgot-password"
              style={{ fontSize:'12px', color:'var(--accent)', fontWeight:500,
                transition:'opacity 0.15s' }}
              className="hover:opacity-70">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
              placeholder="••••••••"
              autoComplete="current-password"
              className={`input-field pr-12${errors.password ? ' error' : ''}`}
            />
            <button type="button" tabIndex={-1}
              onClick={() => setShowPass(p => !p)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-100"
              style={{ color:'var(--text-muted)', opacity:0.7 }}>
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password}</p>}
        </div>

        {/* Submit */}
        <div className="anim-fade-up delay-3 mb-6">
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
            {loading
              ? <><Loader2 size={16} className="animate-spin"/> Signing in...</>
              : <><span>Sign In</span><ArrowRight size={16}/></>
            }
          </button>
        </div>

        {/* Divider */}
        <div className="divider anim-fade-up delay-4 mb-6">or continue with</div>

        {/* Register link */}
        <p className="text-center text-sm anim-fade-up delay-5"
          style={{ color:'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <Link to="/register"
            style={{ color:'var(--accent)', fontWeight:700, transition:'opacity 0.15s' }}
            className="hover:opacity-70">
            Create one free →
          </Link>
        </p>

      </form>
    </AuthLayout>
  );
}
