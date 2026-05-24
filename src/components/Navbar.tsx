import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, Droplets } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `transition-all font-medium relative ${
      isActive(path) ? 'text-red-500' : 'text-slate-300 hover:text-white'
    }`;

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/find-blood', label: 'Find Blood' },
    { to: '/become-donor', label: 'Become Donor' },
    { to: '/blood-requests', label: 'Blood Requests' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'bg-slate-900/95 backdrop-blur-md border-b border-slate-800/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-all group-hover:shadow-lg group-hover:shadow-red-500/10">
              <Droplets className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Blood<span className="text-red-500">Link</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`${linkClass(link.to)} px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-all`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full" />
                )}
              </Link>
            ))}
            {user && (
              <Link
                to="/dashboard"
                className={`${linkClass('/dashboard')} px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-all`}
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <div className="flex items-center gap-3 ml-3 pl-3 border-l border-slate-700">
                <span className="text-sm text-slate-400">{profile?.name || user.email}</span>
                <button
                  onClick={signOut}
                  className="btn-premium px-4 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="btn-premium ml-3 px-5 py-1.5 text-sm bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg shadow-md shadow-red-600/20"
              >
                Login
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass-strong border-t border-slate-800/50 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block py-2.5 px-3 rounded-xl transition-all ${
                  isActive(link.to) ? 'bg-red-500/10 text-red-500' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className={`block py-2.5 px-3 rounded-xl transition-all ${
                  isActive('/dashboard') ? 'bg-red-500/10 text-red-500' : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={() => { signOut(); setOpen(false); }}
                className="w-full text-left py-2.5 px-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
              >
                Logout ({profile?.name || user.email})
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-500 text-white text-center font-semibold"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
