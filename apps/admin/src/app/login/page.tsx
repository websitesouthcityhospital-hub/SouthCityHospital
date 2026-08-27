"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password. Please check your credentials.");
        return;
      }

      // Route according to authenticated staff role
      const target = data.session?.role === "admin" ? "/dashboard" : "/bookings";
      router.push(target);
      router.refresh();
    } catch {
      setError("Unable to connect to the authentication server. Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--navy-950)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--primary)]/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 border border-slate-100">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 border border-[var(--mist)] shadow-sm bg-white p-1">
            <Image
              src="/logo.jpg"
              alt="South City Hospital Logo"
              fill
              sizes="64px"
              className="object-cover rounded-xl"
              priority
            />
          </div>
          <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
            South City Hospital
          </h1>
          <p className="text-xs text-[var(--slate)] mt-1 font-medium">
            Staff &amp; Administration Portal
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            role="alert"
            className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none"
              />
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@southcityhospital.in"
                required
                autoComplete="email"
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-semibold text-[var(--navy-950)]"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)] pointer-events-none"
              />
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-4 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security & Access Notice */}
        <div className="mt-8 pt-6 border-t border-[var(--mist)] flex items-center justify-center gap-2 text-[11px] text-[var(--slate)]">
          <ShieldCheck size={14} className="text-[var(--primary)] shrink-0" />
          <span>Authorized Hospital Personnel Only &bull; Supabase Protected</span>
        </div>
      </div>
    </div>
  );
}
