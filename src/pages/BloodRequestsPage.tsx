import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BLOOD_GROUPS, BloodGroupBadge } from '../components/BloodGroupBadge';
import { SkeletonCard } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useInView } from '../hooks/useAnimations';
import { AlertTriangle, Clock, Building2, Phone, MapPin, User, FileText, Droplets, Send, Loader2, ArrowRight, Zap } from 'lucide-react';

interface BloodRequest {
  id: string;
  patient_name: string;
  hospital_name: string;
  blood_group: string;
  units_needed: number;
  emergency_level: string;
  contact_number: string;
  location: string;
  notes: string;
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
          {req.location}
        </p>
        <p className="text-slate-400 text-sm flex items-center gap-1.5">
          <Phone className="w-4 h-4 text-slate-500 shrink-0" />
          {req.contact_number}
        </p>
      </div>

      {req.notes && (
        <p className="text-slate-500 text-xs mb-3 bg-slate-800/30 rounded-lg p-2 border border-slate-700/30">{req.notes}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <p className="text-slate-500 text-xs flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {new Date(req.created_at).toLocaleDateString()}
        </p>
        <a href={`tel:${req.contact_number}`} className="btn-premium px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-all text-sm font-medium">
          Call Now
        </a>
      </div>
    </div>
  );
}

export default function BloodRequestsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    patientName: '', hospitalName: '', bloodGroup: '', unitsNeeded: '1',
    emergencyLevel: 'normal', contactNumber: '', location: '', notes: '',
  });

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  useEffect(() => { fetchRequests(); }, []);

  async function fetchRequests() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('blood_requests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      setRequests(data || []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      addToast('Please login to submit a blood request', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('blood_requests').insert({
        patient_name: form.patientName,
        hospital_name: form.hospitalName,
        blood_group: form.bloodGroup,
        units_needed: parseInt(form.unitsNeeded),
        emergency_level: form.emergencyLevel,
        contact_number: form.contactNumber,
        location: form.location,
        notes: form.notes,
      });
      if (error) throw error;
      addToast('Blood request submitted successfully!', 'success');
      setForm({ patientName: '', hospitalName: '', bloodGroup: '', unitsNeeded: '1', emergencyLevel: 'normal', contactNumber: '', location: '', notes: '' });
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
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-premium px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              New Request
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </Section>

        {/* Request Form */}
        {showForm && (
          <div className="card-3d glass-strong rounded-2xl p-6 mb-8 animate-slide-down glow-red-hover">
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
                    <input type="text" value={form.patientName} onChange={e => update('patientName', e.target.value)} required className={inputClass} placeholder="Patient name" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Hospital Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" value={form.hospitalName} onChange={e => update('hospitalName', e.target.value)} required className={inputClass} placeholder="Hospital name" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Blood Group</label>
                  <select value={form.bloodGroup} onChange={e => update('bloodGroup', e.target.value)} required className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Units Needed</label>
                  <input type="number" value={form.unitsNeeded} onChange={e => update('unitsNeeded', e.target.value)} required min={1} max={20} className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Emergency Level</label>
                  <select value={form.emergencyLevel} onChange={e => update('emergencyLevel', e.target.value)} required className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none hover:border-slate-600">
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
                    <input type="tel" value={form.contactNumber} onChange={e => update('contactNumber', e.target.value)} required className={inputClass} placeholder="+91 9876543210" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input type="text" value={form.location} onChange={e => update('location', e.target.value)} required className={inputClass} placeholder="City, Area" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Additional Notes</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                  <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all resize-none hover:border-slate-600" placeholder="Any additional information" />
                </div>
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={submitting} className="btn-premium px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Submit Request</>}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 glass text-white rounded-xl transition-all border border-white/10 hover:bg-white/5">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Active Requests */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
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
