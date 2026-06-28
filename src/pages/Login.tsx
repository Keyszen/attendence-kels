import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "../types";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";

export function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        onLogin(data.user);
        if (data.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/employee");
        }
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0A0A0A] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1A1A1A] to-[#050505] font-sans text-white">
      <div className="w-full max-w-md bg-[#121212] rounded-[32px] p-8 shadow-2xl border border-[#C8B6A6]/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C8B6A6] to-transparent opacity-50"></div>
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#C8B6A6]/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-8 relative z-10">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#1A1A1A] border border-[#C8B6A6]/40 flex items-center justify-center text-[#C8B6A6] mb-4 shadow-[0_0_15px_rgba(200,182,166,0.2)]">
            <span className="font-serif italic text-2xl font-bold">K</span>
          </div>
          <h1 className="text-3xl font-serif italic text-[#C8B6A6] tracking-tight drop-shadow-sm">
            Kels Beauty Studio
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#A0A0A0] font-semibold mt-1">
            Staff Attendance System
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-[#333] text-white focus:outline-none focus:ring-2 focus:ring-[#C8B6A6] focus:border-transparent transition-shadow placeholder:text-zinc-600"
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#E0E0E0] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-[#333] text-white focus:outline-none focus:ring-2 focus:ring-[#C8B6A6] focus:border-transparent transition-shadow placeholder:text-zinc-600"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 text-red-400 text-sm rounded-xl text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#5C1616] to-[#7A2021] text-[#E8DCC4] py-4 rounded-2xl font-bold text-sm hover:from-[#7A2021] hover:to-[#9B292A] transition-all duration-300 shadow-[0_4px_14px_rgba(200,182,166,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C8B6A6] focus:ring-offset-[#121212] disabled:opacity-70 disabled:cursor-not-allowed mt-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>Masuk</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
        </div>
      </div>
    </div>
  );
}
