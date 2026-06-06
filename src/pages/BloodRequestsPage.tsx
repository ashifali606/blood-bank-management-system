import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BLOOD_GROUPS, BloodGroupBadge } from '../components/BloodGroupBadge';
import { SkeletonCard } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useInView } from '../hooks/useAnimations';
import { AlertTriangle, Clock, Building2, Phone, MapPin, User, Loader2, Send, Droplets, ArrowRight, Zap, AlertCircle } from 'lucide-react';

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  hospital_name: string;
  city: string;
  phone: string;
  units_needed: number;
  emergency_level: string;
  message: string;
  status: string;
  created_at: string;
}

const EMERGENCY_COLORS: Record<string, string> = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/20',
  urgent: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  normal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

function Section({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
}

function RequestCard({ req, index }: { req: BloodRequest; index: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`card-3d glass-card rounded-2xl p-5 shimmer-overlay group transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${req.emergency_level === 'critical' ? 'border-red-500/30 animate-pulse-glow-subtle' : ''}`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <BloodGroupBadge group={req.blood_group} />
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${EMERGENCY_COLORS[req.emergency_level] || EMERGENCY_COLORS.normal}`}>
          {req.emergency_level === 'critical' && <Zap className="w-3 h-3 inline mr-1" />}
          {req.emergency_level.charAt(0).toUpperCase() + req.emergency_level.slice(1)}
        </span>
      </div>

      <h3 className="text-white font-semibold mb-1">{req.patient_name}</h3>
      <p className="text-slate-400 text-sm mb-3 flex items-center gap-1.5">
        <Building2 className="w-4 h-4 shrink-0" />
        {req.hospital_name}
      </p>

      <div className="space-y-1.5 mb-4">
        <p className="text-slate-400 text-sm flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-slate-500 shrink-0" />
          {req.units_needed} unit{req.units_needed > 1 ? 's' : ''} needed
        </p>
        <p className="text-slate-400 text-sm flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          {req.city}
        </p>
        <p className="text-slate-400 text-sm flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-slate-500 shrink-0" />
          {req.phone}
        </p>
      </div>

      {req.message && (
        <p className="text-slate-500 text-xs mb-3 bg-slate-800/30 rounded-lg p-2 border border-slate-700/30">{req.message}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <p className="text-slate-500 text-xs flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(req.created_at).toLocaleDateString()}
        </p>
        <a
          href={`tel:${req.phone.replace(/\D/g, '')}`}
          className="btn-premium px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-all text-sm font-medium"
        >
          Call Now
        </a>
      </div>
    </div>
  );
}

export default function BloodRequestsPage() {
  const { user, isConfigured } = useAuth();
  const { addToast } = useToast();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    hospitalName: '',
    city: '',
    phone: '',
    unitsNeeded: '1',
    emergencyLevel: 'normal',
    message: '',
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    if (!supabase) {
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      addToast('Please login to submit a blood request', 'error');
      return;
    }

    if (!supabase) {
      addToast('Database is not configured', 'error');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('blood_requests').insert({
        patient_name: form.patientName,
        blood_group: form.bloodGroup,
        hospital_name: form.hospitalName,
        city: form.city,
        phone: form.phone,
        units_needed: parseInt(form.unitsNeeded),
        emergency_level: form.emergencyLevel,
        message: form.message,
        created_by: user.id,
      });

      if (error) throw error;

      addToast('Blood request submitted successfully!', 'success');
      setForm({
        patientName: '',
        bloodGroup: '',
        hospitalName: '',
        city: '',
        phone: '',
        unitsNeeded: '1',
        emergencyLevel: 'normal',
        message: '',
      });
      setShowForm(false);
      fetchRequests();
    } catch (err: any) {
      addToast(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass = "w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600";

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Blood <span className="text-red-500">Requests</span></h1>
              <p className="text-slate-400">Active emergency blood requests from hospitals and patients</p>
            </div>
            {user && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-premium px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                New Request
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
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
            <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8">
              <p className="text-slate-400 mb-4">Please log in to submit a blood request.</p>
              <Link
                to="/login"
                className="btn-premium inline-flex px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-lg shadow-red-600/20"
              >
                Sign In to Submit Request
              </Link>
            </div>
          </Section>
        )}

        {/* Request Form */}
        {showForm && user && (
          <Section>
            <div className="card-3d glass-strong rounded-2xl p-6 mb-8 glow-red-hover animate-slide-down">
              <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Submit Emergency Blood Request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Patient Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={form.patientName}
                        onChange={e => update('patientName', e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Patient name"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Hospital Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="text"
                        value={form.hospitalName}
                        onChange={e => update('hospitalName', e.target.value)}
                        required
                        className={inputClass}
                        placeholder="Hospital name"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Blood Group</label>
                    <select
                      value={form.bloodGroup}
                      onChange={e => update('bloodGroup', e.target.value)}
                      required
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600"
                    >
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Units Needed</label>
                    <input
                      type="number"
                      value={form.unitsNeeded}
                      onChange={e => update('unitsNeeded', e.target.value)}
                      required
                      min={1}
                      max={20}
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Emergency Level</label>
                    <select
                      value={form.emergencyLevel}
                      onChange={e => update('emergencyLevel', e.target.value)}
                      required
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Contact Number</label>
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
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Additional Message</label>
                  <textarea
                    value={form.message}
                    onChange={e => update('message', e.target.value)}
                    rows={2}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none hover:border-slate-600"
                    placeholder="Any additional information"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-premium px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2"
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Request</>}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 glass text-white rounded-xl transition-all border border-white/10 hover:bg-white/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </Section>
        )}

        {/* Active Requests */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <EmptyState message="No active blood requests at the moment" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((req, i) => (
              <RequestCard key={req.id} req={req} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
