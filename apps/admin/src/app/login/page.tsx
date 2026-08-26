"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password.");
        return;
      }

      // In dedicated admin portal, routes are /dashboard or /bookings
      const target = data.session?.role === "admin" ? "/dashboard" : "/bookings";
      router.push(target);
      router.refresh();
    } catch {
      setError("An unexpected connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: "admin" | "staff") => {
    if (role === "admin") {
      setEmail("admin@southcityhospital.in");
      setPassword("Admin@SCH2026!");
    } else {
      setEmail("staff@southcityhospital.in");
      setPassword("Staff@SCH2026!");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--navy-950)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[var(--primary)]/15 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl relative z-10 border border-white/20">
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 border border-[var(--mist)] shadow-sm">
            <Image src="/logo.jpg" alt="South City Hospital" fill sizes="64px" className="object-cover" />
          </div>
          <h1 className="font-display font-bold text-2xl text-[var(--navy-950)]">
            South City Hospital
          </h1>
          <p className="text-xs text-[var(--slate)] mt-1 font-medium">
            Internal Operations &amp; Administration Portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@southcityhospital.in"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--navy-950)] mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--slate)]" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border border-[var(--mist)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
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

        <div className="mt-8 pt-6 border-t border-[var(--mist)]">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--slate)] text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill("admin")}
              className="btn btn-outline text-xs py-2 justify-center border-[var(--mist)] hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200"
            >
              👑 Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill("staff")}
              className="btn btn-outline text-xs py-2 justify-center border-[var(--mist)] hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
            >
              📋 Front Desk Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
