import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BLOOD_GROUPS } from '../components/BloodGroupBadge';
import { Droplets, Mail, Lock, User, Phone, MapPin, Loader2, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', bloodGroup: '', phone: '', location: '', age: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    setLoading(true);
    try {
      await signUp(form.email, form.password, {
        full_name: form.fullName,
        blood_group: form.bloodGroup,
        phone: form.phone,
        location: form.location,
        age: form.age,
      });
      addToast('Account created! Please check your email to confirm.', 'success');
      navigate('/login');
    } catch (err: any) {
      addToast(err.message || 'Signup failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600";

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-600/3 rounded-full blur-3xl animate-float-reverse" />

      <div className="w-full max-w-md relative animate-fade-in-scale">
        <div className="card-3d glass-strong rounded-2xl p-8 glow-red shimmer-overlay">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center animate-pulse-glow-subtle">
              <Droplets className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-2xl font-bold text-white">Blood<span className="text-red-500">Link</span></span>
          </div>

          <h2 className="text-xl font-bold text-white text-center mb-2">Create Account</h2>
          <p className="text-slate-400 text-sm text-center mb-6">Join the life-saving community</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" value={form.fullName} onChange={e => update('fullName', e.target.value)} required className={inputClass} placeholder="Your full name" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required className={inputClass} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="password" value={form.password} onChange={e => update('password', e.target.value)} required minLength={6} className={inputClass} placeholder="Min 6 characters" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Blood Group</label>
                <select value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} required className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600">
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                <input type="number" value={form.age} onChange={e => update('age', e.target.value)} required min={18} max={65} className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600" placeholder="18-65" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} required className={inputClass} placeholder="+91 9876543210" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input type="text" value={form.location} onChange={e => update('location', e.target.value)} required className={inputClass} placeholder="City, State" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-premium w-full py-3 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-slate-400 text-sm text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-red-400 hover:text-red-300 font-medium transition-colors">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
