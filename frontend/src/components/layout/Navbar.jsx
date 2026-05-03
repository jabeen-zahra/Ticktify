import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Bell, ChevronDown, LogOut, User, LayoutDashboard, Menu, X, Zap, Shield, Building2 } from 'lucide-react';

function TictifyLogo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
      <svg width="32" height="32" viewBox="0 0 36 36" fill="none"
        style={{ transition: 'transform 0.2s ease' }}
        className="group-hover:scale-110">
        <rect x="2" y="8" width="32" height="20" rx="4" fill="#CBFF47"/>
        <circle cx="2"  cy="18" r="3.5" fill="#08090F"/>
        <circle cx="34" cy="18" r="3.5" fill="#08090F"/>
        <line x1="12" y1="8" x2="12" y2="28" stroke="#08090F" strokeWidth="1.5" strokeDasharray="3 2"/>
        <path d="M17 18.5L19.5 21L24 16" stroke="#08090F" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div>
        <div style={{ fontFamily:'Bricolage Grotesque,sans-serif', fontWeight:800,
          fontSize:'17px', color:'var(--text-primary)', letterSpacing:'-0.5px', lineHeight:1 }}>
          Tictify
        </div>
        <div style={{ fontSize:'7px', letterSpacing:'3px', color:'var(--accent)',
          textTransform:'uppercase', lineHeight:1, marginTop:'2px', fontWeight:700 }}>
          Opportunities
        </div>
      </div>
    </Link>
  );
}

const NAV_LINKS = [
  { label:'Opportunities', href:'/opportunities' },
  { label:'Competitions',  href:'/opportunities?type=competition' },
  { label:'Scholarships',  href:'/opportunities?type=scholarship' },
  { label:'Workshops',     href:'/opportunities?type=workshop' },
];

function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const getDashLink = () => {
    if (user.role === 'admin')     return '/admin';
    if (user.role === 'organizer') return '/organizer';
    return '/dashboard';
  };

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U';


   const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', action: () => navigate(getDashLink()) },
  { icon: User,            label: 'Settings',  action: () => navigate('/settings') },
  ...(user.role === 'admin'     ? [{ icon: Shield,    label: 'Admin Panel',     action: () => navigate('/admin') }]     : []),
  ...(user.role === 'organizer' ? [{ icon: Building2, label: 'Organizer Panel', action: () => navigate('/organizer') }] : []),
];
   

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all duration-150"
        style={{
          background: open ? 'var(--bg-elevated)' : 'transparent',
          border: `1px solid ${open ? 'var(--border-accent)' : 'var(--border)'}`,
        }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background:'var(--accent)', color:'var(--bg-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
          {initials}
        </div>
        <span className="hidden sm:block text-sm font-medium max-w-[90px] truncate"
          style={{ color:'var(--text-primary)' }}>
          {user.name?.split(' ')[0]}
        </span>
        <ChevronDown size={13} style={{ color:'var(--text-muted)', flexShrink:0,
          transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.2s ease' }}/>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-50 anim-fade-up"
          style={{ background:'var(--bg-elevated)', border:'1px solid var(--border)',
            boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
          {/* User info */}
          <div className="px-4 py-3" style={{ borderBottom:'1px solid var(--border)' }}>
            <p className="text-sm font-bold truncate"
              style={{ color:'var(--text-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
              {user.name}
            </p>
            <p className="text-xs mt-0.5 truncate" style={{ color:'var(--text-muted)' }}>{user.email}</p>
            <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold capitalize"
              style={{ background:'var(--accent-glow)', color:'var(--accent)', border:'1px solid var(--border-accent)',
                fontFamily:'Bricolage Grotesque,sans-serif' }}>
              {user.role}
            </span>
          </div>
          {/* Items */}
          <div className="p-1.5">
            {menuItems.map(({ icon:Icon, label, action }) => (
              <button key={label} onClick={() => { action(); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
                style={{ color:'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.05)'}
                onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                <Icon size={14} style={{ flexShrink:0 }}/>{label}
              </button>
            ))}
          </div>
          {/* Logout */}
          <div className="p-1.5" style={{ borderTop:'1px solid var(--border)' }}>
            <button onClick={() => { onLogout(); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition-colors"
              style={{ color:'#f87171' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <LogOut size={14}/>Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/');
  };

  const hideOn = ['/login', '/register', '/forgot-password'];
  if (hideOn.includes(location.pathname)) return null;

  const isActive = (href) => location.pathname === href.split('?')[0];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={{
          background:    scrolled ? 'rgba(8,9,15,0.92)' : 'transparent',
          backdropFilter:scrolled ? 'blur(16px)' : 'none',
          borderBottom:  scrolled ? '1px solid var(--border)' : '1px solid transparent',
        }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">

            {/* Logo */}
            <TictifyLogo />

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={label} to={href}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                  style={{
                    color: isActive(href) ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive(href) ? 'var(--accent-glow)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (!isActive(href)) { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='rgba(255,255,255,0.04)'; }}}
                  onMouseLeave={e => { if (!isActive(href)) { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='transparent'; }}}>
                  {label}
                </Link>
              ))}
            </div>

            {/* Right */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  <button className="relative p-2 rounded-xl transition-all"
                    style={{ color:'var(--text-muted)', border:'1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-accent)'; e.currentTarget.style.color='var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-muted)'; }}>
                    <Bell size={15}/>
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background:'var(--accent)' }}/>
                  </button>
                  <UserDropdown user={user} onLogout={handleLogout}/>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    style={{ color:'var(--text-secondary)', border:'1px solid var(--border)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--border-accent)'; e.currentTarget.style.color='var(--text-primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                    Sign In
                  </Link>
                  <Link to="/register"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                    style={{ background:'var(--accent)', color:'var(--bg-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}
                    onMouseEnter={e => { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(203,255,71,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                    Get Started <Zap size={13}/>
                  </Link>
                </>
              )}

              {/* Mobile toggle */}
              <button className="md:hidden p-2 rounded-xl transition-colors"
                style={{ border:'1px solid var(--border)', color:'var(--text-secondary)' }}
                onClick={() => setMobileOpen(p => !p)}>
                {mobileOpen ? <X size={17}/> : <Menu size={17}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden anim-fade-in"
            style={{ background:'var(--bg-card)', borderTop:'1px solid var(--border)' }}>
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ label, href }) => (
                <Link key={label} to={href}
                  className="block px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                  style={{ color: isActive(href) ? 'var(--accent)' : 'var(--text-secondary)',
                    background: isActive(href) ? 'var(--accent-glow)' : 'transparent' }}>
                  {label}
                </Link>
              ))}
              {!isAuthenticated && (
                <div className="flex gap-2 pt-3 border-t" style={{ borderColor:'var(--border)' }}>
                  <Link to="/login" className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-medium transition-colors"
                    style={{ color:'var(--text-secondary)', border:'1px solid var(--border)' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="flex-1 text-center px-4 py-3 rounded-xl text-sm font-bold"
                    style={{ background:'var(--accent)', color:'var(--bg-primary)', fontFamily:'Bricolage Grotesque,sans-serif' }}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      <div className="h-16"/>
    </>
  );
}
