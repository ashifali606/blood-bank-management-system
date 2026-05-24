import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Droplets, Mail, Loader2, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword, isConfigured } = useAuth();
  const { addToast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!isConfigured) {
      addToast('Supabase is not configured. Please set up environment variables.', 'error');
      return;
    }

    if (!email.trim()) {
      addToast('Please enter your email address', 'error');
      return;
    }

    setLoading(true);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      addToast(error.message || 'Failed to send reset email', 'error');
    } else {
      setSubmitted(true);
      addToast('Password reset email sent! Check your inbox.', 'success');
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-600/3 rounded-full blur-3xl animate-float-reverse" />

      <div className="w-full max-w-md relative animate-fade-in-scale">
        <div className="card-3d glass-strong rounded-2xl p-8 glow-red shimmer-overlay">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center animate-pulse-glow-subtle">
              <Droplets className="w-6 h-6 text-red-500" />
            </div>
            <span className="text-2xl font-bold text-white">Blood<span className="text-red-500">Link</span></span>
          </div>

          {!isConfigured && (
            <div className="mb-6 bg-amber-500/10 text-amber-400 text-sm px-4 py-3 rounded-xl border border-amber-500/20 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Configuration Required</p>
                <p className="text-xs text-amber-400/80 mt-1">Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.</p>
              </div>
            </div>
          )}

          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-white">Check Your Email</h2>
              <p className="text-slate-400 text-sm">
                We've sent a password reset link to <span className="text-white font-medium">{email}</span>
              </p>
              <p className="text-slate-500 text-xs">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
              >
                Try another email
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-white text-center mb-2">Forgot Password?</h2>
              <p className="text-slate-400 text-sm text-center mb-8">
                Enter your email and we'll send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 transition-all hover:border-slate-600"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isConfigured}
                  className="btn-premium w-full py-3 bg-gradient-to-r from-red-600 to-red-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-red-600/25 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
