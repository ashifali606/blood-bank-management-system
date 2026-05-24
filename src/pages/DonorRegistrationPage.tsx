import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BLOOD_GROUPS } from '../components/BloodGroupBadge';
import { useInView } from '../hooks/useAnimations';
import { UserPlus, User, Phone, MapPin, Loader2, CheckCircle, Heart, ArrowRight, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];

function Section({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
}

export default function DonorRegistrationPage() {
  const { user, isConfigured } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [success, setSuccess] = useState(false);
  const [existingDonor, setExistingDonor] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    bloodGroup: '',
    phone: '',
    city: '',
    state: '',
    available: true,
  });

  useEffect(() => {
    async function checkExistingDonor() {
      if (!supabase || !user) {
        setChecking(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('donors')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        if (data) {
          setExistingDonor(true);
          setForm({
            fullName: data.full_name,
            age: data.age.toString(),
            bloodGroup: data.blood_group,
            phone: data.phone,
            city: data.city,
            state: data.state,
            available: data.availability,
          });
        }
      } catch (err) {
        console.error('Error checking donor:', err);
      } finally {
        setChecking(false);
      }
    }
    checkExistingDonor();
  }, [user]);

  function update(field: string, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!supabase) {
      addToast('Database is not configured. Please set up Supabase environment variables.', 'error');
      return;
    }

    if (!user) {
      addToast('Please log in to register as a donor.', 'error');
      return;
    }

    setLoading(true);

    try {
      const donorData = {
        user_id: user.id,
        full_name: form.fullName,
        age: parseInt(form.age),
        blood_group: form.bloodGroup,
        phone: form.phone,
        city: form.city,
        state: form.state,
        availability: form.available,
      };

      let error;
      if (existingDonor) {
        const result = await supabase
          .from('donors')
          .update(donorData)
          .eq('user_id', user.id);
        error = result.error;
      } else {
        const result = await supabase
          .from('donors')
          .insert(donorData);
        error = result.error;
      }

      if (error) throw error;

      setSuccess(true);
      addToast(existingDonor ? 'Donor profile updated successfully!' : 'Donor registered successfully!', 'success');
      setExistingDonor(true);
    } catch (err: any) {
      addToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600";

  if (success) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center space-y-6 animate-fade-in-scale">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto glow-emerald animate-pulse-glow-subtle">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-white">Registration Successful!</h2>
          <p className="text-slate-400 max-w-md">Thank you for registering as a blood donor. Your profile is now visible to those in need.</p>
          <div className="flex gap-3 justify-center mt-6">
            <button
              onClick={() => setSuccess(false)}
              className="btn-premium px-6 py-2.5 glass text-white rounded-xl transition-all border border-white/10"
            >
              {existingDonor ? 'Edit Profile' : 'Register Another'}
            </button>
            <a
              href="/find-blood"
              className="btn-premium px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              Find Blood <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute top-20 right-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-600/3 rounded-full blur-3xl animate-float-reverse" />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 relative">
        <Section>
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow-subtle">
              <UserPlus className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {existingDonor ? 'Update Your ' : 'Become a '}<span className="text-red-500">Donor</span> Profile
            </h1>
            <p className="text-slate-400">
              {existingDonor ? 'Update your donor information and availability' : 'Register yourself and help save lives in your community'}
            </p>
          </div>
        </Section>

        {!isConfigured && (
          <Section>
            <div className="mb-6 bg-amber-500/10 text-amber-400 text-sm px-4 py-3 rounded-xl border border-amber-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Configuration Required</p>
                <p className="text-xs text-amber-400/80 mt-1">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.</p>
              </div>
            </div>
          </Section>
        )}

        {!user && isConfigured && (
          <Section>
            <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
              <p className="text-slate-400 mb-4">Please log in to register as a donor.</p>
              <a
                href="/login"
                className="btn-premium inline-flex px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg shadow-red-600/20"
              >
                Sign In
              </a>
            </div>
          </Section>
        )}

        {user && (
          <Section>
            <div className="card-3d glass-strong rounded-2xl p-6 sm:p-8 glow-red-hover shimmer-overlay">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={e => update('fullName', e.target.value)}
                      required
                      className={inputClass}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Age</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={e => update('age', e.target.value)}
                      required
                      min={18}
                      max={65}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600"
                      placeholder="18-65"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Blood Group</label>
                    <select
                      value={form.bloodGroup}
                      onChange={e => update('bloodGroup', e.target.value)}
                      required
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600"
                    >
                      <option value="">Select Blood Group</option>
                      {BLOOD_GROUPS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => update('phone', e.target.value)}
                      required
                      className={inputClass}
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={form.city}
                        onChange={e => update('city', e.target.value)}
                        required
                        className={inputClass}
                        placeholder="e.g. New Delhi"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">State</label>
                    <select
                      value={form.state}
                      onChange={e => update('state', e.target.value)}
                      required
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between glass-card rounded-xl p-4 border border-slate-700/50">
                  <div className="flex items-center gap-3">
                    <Heart className="w-5 h-5 text-red-500 animate-heartbeat" />
                    <div>
                      <p className="text-white font-medium text-sm">Available to Donate</p>
                      <p className="text-slate-400 text-xs">Toggle if you are currently available</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => update('available', !form.available)}
                    className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                      form.available ? 'bg-red-600 shadow-md shadow-red-600/30' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-sm ${
                        form.available ? 'left-6' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="btn-premium w-full py-3.5 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      {existingDonor ? 'Update Profile' : 'Register as Donor'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
