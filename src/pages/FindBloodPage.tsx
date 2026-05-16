import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BLOOD_GROUPS, BloodGroupBadge } from '../components/BloodGroupBadge';
import { SkeletonCard } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useInView } from '../hooks/useAnimations';
import { Search, Phone, MessageCircle, MapPin, AlertTriangle, Droplets, ArrowRight } from 'lucide-react';

interface Donor {
  id: string;
  full_name: string;
  age: number;
  blood_group: string;
  phone: string;
  email: string;
  location: string;
  availability_status: boolean;
  last_donation_date: string | null;
}

function DonorCard({ donor, index }: { donor: Donor; index: number }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div
      ref={ref}
      className={`card-3d glass-card rounded-2xl p-5 shimmer-overlay group transition-all duration-500 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center border border-red-500/20 group-hover:shadow-lg group-hover:shadow-red-500/10 transition-all">
            <Droplets className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <h3 className="text-white font-semibold">{donor.full_name}</h3>
            <p className="text-slate-500 text-xs">{donor.age} years old</p>
          </div>
        </div>
        <BloodGroupBadge group={donor.blood_group} />
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-slate-400 text-sm flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
          {donor.location}
        </p>
        <p className="text-slate-400 text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-500 shrink-0" />
          {donor.phone}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
          donor.availability_status
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {donor.availability_status ? 'Available' : 'Unavailable'}
        </span>
        <div className="flex gap-2">
          <a
            href={`tel:${donor.phone}`}
            className="p-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-lg transition-all hover:scale-110 hover:shadow-lg hover:shadow-emerald-500/10"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </a>
          <a
            href={`https://wa.me/91${donor.phone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/10"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function FindBloodPage() {
  const [bloodGroup, setBloodGroup] = useState('');
  const [location, setLocation] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearcheded] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setSearcheded(true);
    try {
      let query = supabase.from('donors').select('*').eq('availability_status', true);
      if (bloodGroup) query = query.eq('blood_group', bloodGroup);
      if (location) query = query.ilike('location', `%${location}%`);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setDonors(data || []);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { handleSearch(); }, []);

  return (
    <div className="min-h-screen bg-slate-950 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <Section>
          <div className="text-center mb-10">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow-subtle">
              <Search className="w-7 h-7 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Find <span className="text-red-500">Blood</span> Donors</h1>
            <p className="text-slate-400">Search for available donors by blood group and location</p>
          </div>
        </Section>

        {/* Search Form */}
        <Section>
          <div className="card-3d glass-strong rounded-2xl p-6 mb-8 glow-red-hover shimmer-overlay">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={e => setBloodGroup(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all appearance-none"
                >
                  <option value="">All Blood Groups</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    placeholder="City or area"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-premium px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Search
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </Section>

        {/* Emergency Badge */}
        <Section>
          <div className="flex items-center gap-2 bg-red-500/5 border border-red-500/20 rounded-xl px-4 py-3 mb-6 animate-pulse-glow-subtle">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-red-400 text-sm font-medium">In an emergency? Call the donor directly or use WhatsApp for fastest response.</p>
          </div>
        </Section>

        {/* Results */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : donors.length === 0 && searched ? (
          <EmptyState
            message="No donors found matching your criteria"
            action={
              <button onClick={() => { setBloodGroup(''); setLocation(''); handleSearch(); }} className="btn-premium px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-md shadow-red-600/20 text-sm">
                Clear Filters
              </button>
            }
          />
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-4">{donors.length} donor{donors.length !== 1 ? 's' : ''} found</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {donors.map((donor, i) => (
                <DonorCard key={donor.id} donor={donor} index={i} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
}
