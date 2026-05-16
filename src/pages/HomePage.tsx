import { Link } from 'react-router-dom';
import { useInView, useCountUp, useMouse3D } from '../hooks/useAnimations';
import { Droplets, Search, UserPlus, PhoneCall, Heart, Shield, Clock, Users, Award, Star, ArrowRight, Zap } from 'lucide-react';

function AnimatedCounter({ end, suffix = '', label }: { end: number; suffix?: string; label: string }) {
  const { ref, inView } = useInView(0.3);
  const count = useCountUp(end, 2200, 0, inView);
  return (
    <div ref={ref} className="text-center group">
      <p className="text-3xl sm:text-4xl font-bold text-red-500 mb-1 transition-all duration-500 group-hover:scale-110">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-slate-400 text-sm">{label}</p>
    </div>
  );
}

function FloatingIcon({ icon: Icon, className }: { icon: typeof Droplets; className?: string }) {
  return (
    <div className={`absolute opacity-10 text-red-500 ${className}`}>
      <Icon className="w-8 h-8 animate-float" />
    </div>
  );
}

function HeartbeatLine() {
  return (
    <div className="relative h-8 w-full overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 600 40" preserveAspectRatio="none">
        <path
          d="M0,20 L100,20 L120,20 L140,5 L160,35 L180,10 L200,20 L300,20 L320,20 L340,5 L360,35 L380,10 L400,20 L600,20"
          fill="none"
          stroke="rgba(220,38,38,0.3)"
          strokeWidth="2"
          className="animate-heartbeat"
        />
      </svg>
    </div>
  );
}

function Section({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
}

const features = [
  { icon: Search, title: 'Find Blood Instantly', desc: 'Search for available blood donors by group and location in seconds during emergencies.' },
  { icon: UserPlus, title: 'Register as Donor', desc: 'Sign up and become part of a life-saving community. Your donation can save up to 3 lives.' },
  { icon: PhoneCall, title: 'Emergency Contact', desc: 'Directly call or WhatsApp donors when every second counts in critical situations.' },
  { icon: Shield, title: 'Verified Donors', desc: 'All donors are verified and their availability status is updated in real-time.' },
  { icon: Clock, title: '24/7 Availability', desc: 'Our platform is available round the clock because emergencies do not wait.' },
  { icon: Heart, title: 'Save Lives', desc: 'Every blood donation can save up to three lives. Be a hero, donate blood.' },
];

const testimonials = [
  { name: 'Priya Sharma', location: 'New Delhi', text: 'BloodLink helped me find a donor for my father within 30 minutes during a critical surgery. This platform is a lifesaver.', rating: 5 },
  { name: 'Rahul Verma', location: 'Mumbai', text: 'I registered as a donor and got called within a week. The feeling of saving a life is unmatched. Thank you BloodLink.', rating: 5 },
  { name: 'Dr. Anita Desai', location: 'Pune', text: 'As a hospital administrator, BloodLink has streamlined our blood procurement process significantly. Highly recommended.', rating: 5 },
];

export default function HomePage() {
  const hero3D = useMouse3D();

  return (
    <div className="bg-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/50 via-slate-950 to-slate-950 animate-gradient-shift" />

        {/* Floating background orbs */}
        <div className="absolute top-20 right-10 w-80 h-80 bg-red-500/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-red-600/5 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-red-500/3 rounded-full blur-3xl animate-bounce-slow" />

        {/* Floating blood icons */}
        <FloatingIcon icon={Droplets} className="top-[15%] left-[8%] animate-float" />
        <FloatingIcon icon={Droplets} className="top-[25%] right-[12%] animate-float-reverse delay-500" />
        <FloatingIcon icon={Heart} className="bottom-[30%] left-[15%] animate-float delay-300" />
        <FloatingIcon icon={Droplets} className="top-[60%] right-[8%] animate-float-reverse delay-700" />
        <FloatingIcon icon={Zap} className="top-[10%] left-[45%] animate-float delay-200" />
        <FloatingIcon icon={Heart} className="bottom-[15%] right-[25%] animate-float-reverse delay-1000" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-slide-up">
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-red-400 text-sm font-medium animate-pulse-glow-subtle">
                <Droplets className="w-4 h-4" />
                Every Drop Counts
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Donate Blood,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-400 to-red-600 animate-gradient-shift">
                  Save Lives
                </span>
              </h1>
              <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                BloodLink connects patients with verified blood donors in real-time. During emergencies, every second matters. Find the right donor, right now.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  to="/find-blood"
                  className="btn-premium px-7 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-red-600/25"
                >
                  <Search className="w-5 h-5" />
                  Find Blood Now
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/become-donor"
                  className="btn-premium px-7 py-3.5 glass text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-white/5 transition-all border border-white/10"
                >
                  <UserPlus className="w-5 h-5" />
                  Become a Donor
                </Link>
              </div>

              {/* Mini stats */}
              <div className="flex gap-8 pt-2">
                {[
                  { value: '10K+', label: 'Donors' },
                  { value: '25K+', label: 'Lives Saved' },
                  { value: '50+', label: 'Cities' },
                ].map((s, i) => (
                  <div key={i} className="animate-fade-in-scale delay-300" style={{ animationDelay: `${(i + 3) * 200}ms` }}>
                    <p className="text-white font-bold text-xl">{s.value}</p>
                    <p className="text-slate-500 text-xs">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="hidden lg:flex justify-center animate-fade-in delay-500">
              <div ref={hero3D} className="relative transition-transform duration-300 ease-out" style={{ transformStyle: 'preserve-3d' }}>
                <div className="w-80 h-80 bg-gradient-to-br from-red-500/15 to-red-600/5 rounded-full flex items-center justify-center border border-red-500/20 animate-pulse-glow-subtle">
                  <div className="w-56 h-56 bg-gradient-to-br from-red-500/25 to-red-600/10 rounded-full flex items-center justify-center border border-red-500/10">
                    <Droplets className="w-24 h-24 text-red-500 animate-heartbeat" />
                  </div>
                </div>

                {/* Floating info cards */}
                <div className="absolute -top-6 -right-6 glass-strong rounded-xl px-4 py-3 shadow-xl animate-float glow-red-hover">
                  <p className="text-sm font-semibold text-white">O+ Available</p>
                  <p className="text-xs text-slate-400">12 donors nearby</p>
                </div>
                <div className="absolute -bottom-6 -left-6 glass-strong rounded-xl px-4 py-3 shadow-xl animate-float-reverse glow-emerald" style={{ animationDelay: '1s' }}>
                  <p className="text-sm font-semibold text-emerald-400">Emergency</p>
                  <p className="text-xs text-slate-400">Response in 5 min</p>
                </div>
                <div className="absolute top-1/2 -right-10 glass-strong rounded-xl px-4 py-3 shadow-xl animate-float" style={{ animationDelay: '2s' }}>
                  <p className="text-sm font-semibold text-amber-400">A+ Needed</p>
                  <p className="text-xs text-slate-400">3 units urgent</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heartbeat line at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <HeartbeatLine />
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="relative bg-gradient-to-r from-red-600 to-red-700 py-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-white/5 to-red-600/0 animate-shimmer" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
            <p className="text-white font-semibold">Emergency? Need blood urgently?</p>
          </div>
          <Link
            to="/blood-requests"
            className="px-5 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-red-50 transition-all text-sm btn-premium"
          >
            Post Emergency Request
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">How <span className="text-red-500">BloodLink</span> Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">A seamless platform connecting those who need blood with those willing to donate. Simple, fast, and reliable.</p>
            </div>
          </Section>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const { ref, inView } = useInView(0.1);
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`card-3d glass-card rounded-2xl p-6 shimmer-overlay group transition-all duration-500 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-red-500/10">
                    <f.icon className="w-6 h-6 text-red-500 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats with animated counters */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-red-950/20 to-slate-900/80" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, rgba(220,38,38,0.3) 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }} />
        <Section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <AnimatedCounter end={10000} suffix="+" label="Registered Donors" />
              <AnimatedCounter end={25000} suffix="+" label="Lives Saved" />
              <AnimatedCounter end={500} suffix="+" label="Hospitals Connected" />
              <AnimatedCounter end={50} suffix="+" label="Cities Covered" />
            </div>
          </div>
        </Section>
      </section>

      {/* Awareness Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Section>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                Why Blood Donation <span className="text-red-500">Matters</span>
              </h2>
              <div className="space-y-4 text-slate-400 leading-relaxed">
                <p>Every 2 seconds, someone in India needs blood. Yet only 1% of the eligible population donates regularly. Blood cannot be manufactured -- it can only come from generous donors.</p>
                <p>A single donation can save up to 3 lives. Blood is needed for surgeries, cancer treatments, chronic illnesses, and traumatic injuries. Your contribution matters more than you know.</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { icon: Award, text: 'Safe & Quick Process' },
                  { icon: Heart, text: 'Save Up to 3 Lives' },
                  { icon: Users, text: 'Join 10K+ Donors' },
                  { icon: Clock, text: 'Only 15 Minutes' },
                ].map((item, i) => (
                  <div key={i} className="card-3d glass-card rounded-xl p-3 flex items-center gap-3 shimmer-overlay">
                    <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-red-500" />
                    </div>
                    <span className="text-sm text-slate-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section>
              <div className="card-3d bg-gradient-to-br from-red-500/10 to-slate-900/80 rounded-2xl border border-red-500/20 p-8 space-y-6 glow-red shimmer-overlay">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-red-500 animate-heartbeat" />
                  Blood Group Compatibility
                </h3>
                {[
                  { group: 'O-', canDonate: 'Universal Donor (All Groups)' },
                  { group: 'O+', canDonate: 'O+, A+, B+, AB+' },
                  { group: 'A+', canDonate: 'A+, AB+' },
                  { group: 'B+', canDonate: 'B+, AB+' },
                  { group: 'AB+', canDonate: 'AB+ Only' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 group/row hover:bg-white/[0.02] rounded-lg px-2 transition-colors">
                    <span className="font-bold text-red-400 group-hover/row:scale-110 transition-transform inline-block">{row.group}</span>
                    <span className="text-slate-400 text-sm">{row.canDonate}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Section>
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">What People <span className="text-red-500">Say</span></h2>
              <p className="text-slate-400">Real stories from people whose lives were touched by BloodLink.</p>
            </div>
          </Section>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => {
              const { ref, inView } = useInView(0.1);
              return (
                <div
                  key={i}
                  ref={ref}
                  className={`card-3d glass-card rounded-2xl p-6 shimmer-overlay transition-all duration-500 ${
                    inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-full flex items-center justify-center border border-red-500/20">
                      <Users className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.location}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-red-950/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />

        <Section>
          <div className="max-w-4xl mx-auto px-4 text-center relative">
            <div className="card-3d glass-strong rounded-3xl p-10 sm:p-14 glow-red shimmer-overlay">
              <Droplets className="w-12 h-12 text-red-500 mx-auto mb-6 animate-heartbeat" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Make a <span className="text-red-500">Difference</span>?</h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">Join thousands of donors who are making a real impact. Your blood donation can be the difference between life and death.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/become-donor" className="btn-premium px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-500 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Register as Donor
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link to="/find-blood" className="btn-premium px-8 py-3.5 glass text-white font-semibold rounded-xl flex items-center gap-2 hover:bg-white/5 border border-white/10">
                  <Search className="w-5 h-5" />
                  Find Blood
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </section>
    </div>
  );
}
