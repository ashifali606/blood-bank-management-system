import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-red-950/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-9 h-9 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                <Droplets className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-lg font-bold text-white">Blood<span className="text-red-500">Link</span></span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Connecting blood donors with those in need. Every drop counts, every donation saves a life.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/find-blood', label: 'Find Blood' },
                { to: '/become-donor', label: 'Become a Donor' },
                { to: '/blood-requests', label: 'Blood Requests' },
                { to: '/contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-slate-400 hover:text-red-400 text-sm transition-colors inline-flex items-center gap-1 group">
                    <span className="w-0 group-hover:w-2 h-0.5 bg-red-500 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Emergency</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2 hover:text-red-400 transition-colors"><Phone className="w-4 h-4 text-red-500" /> 1800-123-4567</li>
              <li className="flex items-center gap-2 hover:text-red-400 transition-colors"><Phone className="w-4 h-4 text-red-500" /> +91-9876543210</li>
              <li className="flex items-center gap-2 hover:text-red-400 transition-colors"><Mail className="w-4 h-4 text-red-500" /> emergency@bloodlink.in</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Location</h3>
            <div className="text-sm text-slate-400 space-y-2">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                42, Health Avenue, Sector 12, New Delhi - 110001
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">&copy; 2026 BloodLink. All rights reserved.</p>
          <p className="text-slate-500 text-sm flex items-center gap-1">Made with <Heart className="w-3.5 h-3.5 text-red-500" /> for humanity.</p>
        </div>
      </div>
    </footer>
  );
}
