import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { BloodGroupBadge } from '../components/BloodGroupBadge';
import { useInView, useCountUp } from '../hooks/useAnimations';
import {
  Users, Droplets, AlertTriangle, Activity,
  LayoutDashboard, UserPlus, Phone, CheckCircle, Loader2, AlertCircle,
} from 'lucide-react';

interface Donor {
  id: string;
  full_name: string;
  age: number;
  blood_group: string;
  phone: string;
  city: string;
  state: string;
  availability: boolean;
  created_at: string;
  user_id: string | null;
}

interface BloodRequest {
  id: string;
  patient_name: string;
  blood_group: string;
  hospital_name: string;
  city: string;
  phone: string;
  units_needed: number;
  emergency_level: string;
  status: string;
  created_at: string;
}

type Tab = 'overview' | 'donors' | 'requests';

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'} ${className}`}>
      {children}
    </div>
  );
}

function AnimatedStat({ icon: Icon, label, value, color, bg, trigger }: {
  icon: typeof Users; label: string; value: number; color: string; bg: string; trigger: boolean;
}) {
  const count = useCountUp(value, 1200, 0, trigger);
  return (
    <div className="card-3d glass-card rounded-2xl p-5 shimmer-overlay">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{count}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { profile, isConfigured } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('overview');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);

  const bloodGroupStats: Record<string, number> = {};
  donors.forEach(d => {
    bloodGroupStats[d.blood_group] = (bloodGroupStats[d.blood_group] || 0) + 1;
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) {
      setStatsVisible(true);
    }
  }, [loading]);

  async function fetchData() {
    if (!supabase) {
      setDonors([]);
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [donorsRes, requestsRes] = await Promise.all([
        supabase.from('donors').select('*').order('created_at', { ascending: false }),
        supabase.from('blood_requests').select('*').order('created_at', { ascending: false }),
      ]);

      if (donorsRes.error) {
        console.error('Donors fetch error:', donorsRes.error.message);
        throw new Error(donorsRes.error.message);
      }
      if (requestsRes.error) {
        console.error('Requests fetch error:', requestsRes.error.message);
        throw new Error(requestsRes.error.message);
      }

      setDonors(donorsRes.data || []);
      setRequests(requestsRes.data || []);
    } catch (err) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }

  const activeRequests = requests.filter(r => r.status === 'active');
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled');
  const availableDonors = donors.filter(d => d.availability);

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'donors', label: 'Donors', icon: Users },
    { key: 'requests', label: 'Requests', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-1">
              {profile?.role === 'seeker' ? 'Seeker' : 'Donor'} <span className="text-red-500">Dashboard</span>
            </h1>
            <p className="text-slate-400 text-sm">Welcome back, {profile?.name || 'User'}</p>
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

        {/* Tabs */}
        <Section>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  tab === t.key
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md shadow-red-600/20'
                    : 'glass text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>
        </Section>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <Section>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <AnimatedStat
                      icon={Users}
                      label="Total Donors"
                      value={donors.length}
                      color="text-blue-400"
                      bg="bg-blue-500/10"
                      trigger={statsVisible}
                    />
                    <AnimatedStat
                      icon={UserPlus}
                      label="Available Donors"
                      value={availableDonors.length}
                      color="text-emerald-400"
                      bg="bg-emerald-500/10"
                      trigger={statsVisible}
                    />
                    <AnimatedStat
                      icon={AlertTriangle}
                      label="Active Requests"
                      value={activeRequests.length}
                      color="text-red-400"
                      bg="bg-red-500/10"
                      trigger={statsVisible}
                    />
                    <AnimatedStat
                      icon={CheckCircle}
                      label="Fulfilled"
                      value={fulfilledRequests.length}
                      color="text-amber-400"
                      bg="bg-amber-500/10"
                      trigger={statsVisible}
                    />
                  </div>
                </Section>

                {/* Blood Group Distribution */}
                <Section>
                  <div className="card-3d glass-card rounded-2xl p-6 shimmer-overlay">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <Droplets className="w-5 h-5 text-red-500" />
                      Blood Group Distribution
                    </h2>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(group => (
                        <div key={group} className="text-center glass-card rounded-xl p-3 border border-slate-700/30 hover:border-red-500/20 transition-all group/card">
                          <BloodGroupBadge group={group} size="sm" />
                          <p className="text-white font-bold text-xl mt-2 group-hover/card:scale-110 transition-transform">
                            {bloodGroupStats[group] || 0}
                          </p>
                          <p className="text-slate-500 text-xs">donors</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <Section>
                    <div className="card-3d glass-card rounded-2xl p-6 shimmer-overlay">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-emerald-400" />
                        Recent Donor Registrations
                      </h2>
                      <div className="space-y-3">
                        {donors.slice(0, 5).map(d => (
                          <div key={d.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] rounded-lg px-2 transition-colors">
                            <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center">
                              <Droplets className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{d.full_name}</p>
                              <p className="text-slate-500 text-xs">{d.city}, {d.state} | {d.blood_group}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${d.availability ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                              {d.availability ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        ))}
                        {donors.length === 0 && (
                          <p className="text-slate-500 text-sm text-center py-4">No donors registered yet</p>
                        )}
                      </div>
                    </div>
                  </Section>

                  <Section>
                    <div className="card-3d glass-card rounded-2xl p-6 shimmer-overlay">
                      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Recent Blood Requests
                      </h2>
                      <div className="space-y-3">
                        {requests.slice(0, 5).map(r => (
                          <div key={r.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0 hover:bg-white/[0.02] rounded-lg px-2 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              r.emergency_level === 'critical' ? 'bg-red-500/10' : r.emergency_level === 'urgent' ? 'bg-amber-500/10' : 'bg-blue-500/10'
                            }`}>
                              <Activity className={`w-4 h-4 ${
                                r.emergency_level === 'critical' ? 'text-red-400' : r.emergency_level === 'urgent' ? 'text-amber-400' : 'text-blue-400'
                              }`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{r.patient_name}</p>
                              <p className="text-slate-500 text-xs">{r.hospital_name} | {r.blood_group} | {r.units_needed} unit{r.units_needed > 1 ? 's' : ''}</p>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              r.status === 'active' ? 'bg-red-500/10 text-red-400' : r.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                            }`}>
                              {r.status}
                            </span>
                          </div>
                        ))}
                        {requests.length === 0 && (
                          <p className="text-slate-500 text-sm text-center py-4">No blood requests yet</p>
                        )}
                      </div>
                    </div>
                  </Section>
                </div>

                {/* Bar Chart */}
                <Section>
                  <div className="card-3d glass-card rounded-2xl p-6 shimmer-overlay">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-red-500" />
                      Donors by Blood Group
                    </h2>
                    <div className="space-y-3">
                      {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map(group => {
                        const count = bloodGroupStats[group] || 0;
                        const maxCount = Math.max(...Object.values(bloodGroupStats), 1);
                        const width = (count / maxCount) * 100;
                        return (
                          <div key={group} className="flex items-center gap-3 group/bar">
                            <span className="text-sm font-bold text-slate-300 w-8 group-hover/bar:text-red-400 transition-colors">{group}</span>
                            <div className="flex-1 bg-slate-800/50 rounded-full h-6 overflow-hidden border border-slate-700/30">
                              <div
                                className="h-full bg-gradient-to-r from-red-600 to-red-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2 group-hover/bar:from-red-500 group-hover/bar:to-red-400"
                                style={{ width: `${Math.max(width, 8)}%` }}
                              >
                                <span className="text-xs font-bold text-white">{count}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Section>
              </div>
            )}

            {tab === 'donors' && (
              <Section>
                <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/30">
                  <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">All Donors ({donors.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800/30">
                        <tr>
                          <th className="text-left text-slate-400 font-medium px-5 py-3">Name</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3">Blood Group</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3 hidden sm:table-cell">Phone</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3 hidden md:table-cell">Location</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {donors.map(d => (
                          <tr key={d.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-white font-medium">{d.full_name}</p>
                              <p className="text-slate-500 text-xs">{d.age} years</p>
                            </td>
                            <td className="px-5 py-3"><BloodGroupBadge group={d.blood_group} size="sm" /></td>
                            <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">{d.phone}</td>
                            <td className="px-5 py-3 text-slate-300 hidden md:table-cell">{d.city}, {d.state}</td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                d.availability ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                              }`}>
                                {d.availability ? 'Available' : 'Unavailable'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {donors.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-8">No donors registered yet</p>
                    )}
                  </div>
                </div>
              </Section>
            )}

            {tab === 'requests' && (
              <Section>
                <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/30">
                  <div className="p-5 border-b border-slate-800/50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">All Blood Requests ({requests.length})</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-800/30">
                        <tr>
                          <th className="text-left text-slate-400 font-medium px-5 py-3">Patient</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3">Blood Group</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3 hidden sm:table-cell">Hospital</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3 hidden md:table-cell">Emergency</th>
                          <th className="text-left text-slate-400 font-medium px-5 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {requests.map(r => (
                          <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-3">
                              <p className="text-white font-medium">{r.patient_name}</p>
                              <p className="text-slate-500 text-xs flex items-center gap-1"><Phone className="w-3 h-3" />{r.phone}</p>
                            </td>
                            <td className="px-5 py-3"><BloodGroupBadge group={r.blood_group} size="sm" /></td>
                            <td className="px-5 py-3 text-slate-300 hidden sm:table-cell">{r.hospital_name}</td>
                            <td className="px-5 py-3 hidden md:table-cell">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                r.emergency_level === 'critical' ? 'bg-red-500/10 text-red-400' :
                                r.emergency_level === 'urgent' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>
                                {r.emergency_level}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                r.status === 'active' ? 'bg-red-500/10 text-red-400' :
                                r.status === 'fulfilled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                              }`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {requests.length === 0 && (
                      <p className="text-slate-500 text-sm text-center py-8">No blood requests yet</p>
                    )}
                  </div>
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
