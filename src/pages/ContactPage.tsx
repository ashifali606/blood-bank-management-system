import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';
import { useInView } from '../hooks/useAnimations';
import { Phone, Mail, MapPin, Clock, MessageCircle, ChevronDown, Send, Loader2, Droplets, Heart } from 'lucide-react';

const faqs = [
  { q: 'Who can donate blood?', a: 'Anyone between 18-65 years of age, weighing at least 50 kg, and in good health can donate blood. You should not have donated blood in the last 3 months.' },
  { q: 'How often can I donate blood?', a: 'You can donate whole blood every 3 months (90 days). This gives your body enough time to replenish the red blood cells.' },
  { q: 'Is blood donation safe?', a: 'Yes, blood donation is completely safe. Sterile, disposable equipment is used for each donor. You cannot get any disease from donating blood.' },
  { q: 'How long does donation take?', a: 'The actual blood draw takes about 5-10 minutes. The entire process including registration and rest takes about 30-45 minutes.' },
  { q: 'What should I do before donating?', a: 'Eat a healthy meal, drink plenty of water, avoid fatty foods, and get a good night\'s sleep. Do not consume alcohol 24 hours before donation.' },
  { q: 'How is BloodLink different from a blood bank?', a: 'BloodLink connects patients directly with voluntary donors in real-time. We are a platform that facilitates quick connections during emergencies, not a physical blood storage facility.' },
];

function Section({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
      {children}
    </div>
  );
}

export default function ContactPage() {
  const { addToast } = useToast();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1000));
    addToast('Message sent! We will get back to you soon.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  }

  const inputClass = "w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600";

  return (
    <div className="min-h-screen bg-slate-950 py-20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/3 rounded-full blur-3xl animate-float-reverse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <Section>
          <div className="text-center mb-14">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Get in <span className="text-red-500">Touch</span></h1>
            <p className="text-slate-400 max-w-xl mx-auto">We are here to help. Reach out for emergencies, support, or any questions about blood donation.</p>
          </div>
        </Section>

        {/* Emergency Contacts */}
        <Section>
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {[
              { icon: Phone, label: 'Emergency Helpline', value: '1800-123-4567', sub: '24/7 Available', color: 'text-red-400', bg: 'bg-red-500/10', glow: 'glow-red' },
              { icon: Mail, label: 'Email Support', value: 'support@bloodlink.in', sub: 'Response within 2 hours', color: 'text-blue-400', bg: 'bg-blue-500/10', glow: '' },
              { icon: MapPin, label: 'Head Office', value: 'New Delhi, India', sub: 'Sector 12, Health Avenue', color: 'text-emerald-400', bg: 'bg-emerald-500/10', glow: 'glow-emerald' },
            ].map((item, i) => (
              <div key={i} className={`card-3d glass-card rounded-2xl p-6 text-center shimmer-overlay ${item.glow}`}>
                <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="text-white font-semibold mb-1">{item.label}</h3>
                <p className={`${item.color} font-medium text-sm`}>{item.value}</p>
                <p className="text-slate-500 text-xs mt-1">{item.sub}</p>
              </div>
            ))}
          </div>
        </Section>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {/* Contact Form */}
          <Section>
            <div className="card-3d glass-strong rounded-2xl p-6 sm:p-8 glow-red-hover shimmer-overlay">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-red-500" />
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                    <input type="text" value={form.name} onChange={e => update('name', e.target.value)} required className={inputClass} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)} required className={inputClass} placeholder="you@example.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Subject</label>
                  <input type="text" value={form.subject} onChange={e => update('subject', e.target.value)} required className={inputClass} placeholder="How can we help?" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Message</label>
                  <textarea value={form.message} onChange={e => update('message', e.target.value)} required rows={4} className={`${inputClass} resize-none`} placeholder="Tell us more..." />
                </div>
                <button type="submit" disabled={sending} className="btn-premium w-full py-3 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/20 flex items-center justify-center gap-2">
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Message</>}
                </button>
              </form>
            </div>
          </Section>

          {/* Location */}
          <Section>
            <div className="space-y-6">
              <div className="card-3d glass-card rounded-2xl p-6 sm:p-8 shimmer-overlay">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-500" />
                  Our Location
                </h2>
                <div className="bg-slate-800/50 rounded-xl h-48 flex items-center justify-center mb-4 overflow-hidden border border-slate-700/30 relative">
                  <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(220,38,38,0.5) 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                  }} />
                  <div className="text-center relative">
                    <MapPin className="w-8 h-8 text-red-500 mx-auto mb-2 animate-heartbeat" />
                    <p className="text-slate-400 text-sm">42, Health Avenue, Sector 12</p>
                    <p className="text-slate-500 text-xs">New Delhi - 110001, India</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">Mon - Fri: 9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">+91-11-2345-6789</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-slate-300">info@bloodlink.in</span>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="card-3d glass-card rounded-xl p-4 text-center shimmer-overlay">
                  <Droplets className="w-6 h-6 text-red-500 mx-auto mb-2 animate-heartbeat" />
                  <p className="text-white font-bold text-lg">10K+</p>
                  <p className="text-slate-500 text-xs">Active Donors</p>
                </div>
                <div className="card-3d glass-card rounded-xl p-4 text-center shimmer-overlay">
                  <Heart className="w-6 h-6 text-red-500 mx-auto mb-2 animate-heartbeat" style={{ animationDelay: '0.5s' }} />
                  <p className="text-white font-bold text-lg">25K+</p>
                  <p className="text-slate-500 text-xs">Lives Saved</p>
                </div>
              </div>
            </div>
          </Section>
        </div>

        {/* FAQ */}
        <Section>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked <span className="text-red-500">Questions</span></h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card rounded-xl overflow-hidden border border-slate-700/30 hover:border-slate-600/50 transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                  >
                    <span className="text-white font-medium text-sm pr-4">{faq.q}</span>
                    <span className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ${openFaq === i ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="px-5 pb-4 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
