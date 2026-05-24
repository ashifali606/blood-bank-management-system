import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BLOOD_GROUPS, BloodGroupBadge } from '../components/BloodGroupBadge';
import { SkeletonCard } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import { useInView } from '../hooks/useAnimations';
import { useAuth } from '../contexts/AuthContext';
import { Search, Phone, MessageCircle, MapPin, AlertTriangle, Droplets, ArrowRight, AlertCircle } from 'lucide-react';

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
          {donor.city}, {donor.state}
        </p>
        <p className="text-slate-400 text-sm flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-500 shrink-0" />
          {donor.phone}
        </p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full transition-all ${
          donor.availability
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
            : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
        }`}>
          {donor.availability ? 'Available' : 'Unavailable'}
        </span>
        <div className="flex gap-2">
          <a
            href={`tel:${donor.phone.replace(/\D/g, '')}`}
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

function Section({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
}

export default function FindBloodPage() {
  const { isConfigured } = useAuth();
  const [bloodGroup, setBloodGroup] = useState('');
  const [city, setCity] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();

    if (!supabase) {
      setDonors([]);
      setLoading(false);
      setSearched(true);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      let query = supabase
        .from('donors')
        .select('*')
        .eq('availability', true)
          .order('created_at', { ascending: false });

      if (bloodGroup) {
        query = query.eq('blood_group', bloodGroup);
      }
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDonors(data || []);
    } catch (err) {
      console.error('Search error:', err);
      setDonors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleSearch();
  }, []);

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
            <p className="text-slate-400">Search for available donors by blood group and city</p>
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
                  {BLOOD_GROUPS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all"
                    placeholder="Search by city"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="btn-premium px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2"
                >
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
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : donors.length === 0 && searched ? (
          <EmptyState
            message="No available donors found matching your criteria"
            action={
              <button
                onClick={() => {
                  setBloodGroup('');
                  setCity('');
                  handleSearch();
                }}
                className="btn-premium px-5 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl shadow-md shadow-red-600/20 text-sm"
              >
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
