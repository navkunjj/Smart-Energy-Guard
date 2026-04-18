import React, { useState } from "react";
import { ShieldCheck, Lock, Eye, EyeOff, Zap } from "lucide-react";

const ADMIN_PASSWORD = "energyguard";

const LoginScreen = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("eg_auth", "true");
      onLogin();
    } else {
      setError("Invalid credentials");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center industrial-grid px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div
        className={`w-full max-w-sm relative z-10 ${shaking ? "animate-[shake_0.5s_ease-in-out]" : ""}`}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center">
            <Zap size={28} className="text-blue-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">ENERGY GUARD</h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 mt-1">
            Admin Authentication Required
          </p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl p-6 border border-white/5 space-y-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck size={16} className="text-blue-400 opacity-60" />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
              Secure Access
            </span>
          </div>

          {/* Password Field */}
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Lock size={16} className="opacity-30" />
            </div>
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              autoFocus
              className="w-full pl-10 pr-12 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-medium placeholder:opacity-30 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-60 transition-opacity"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-rose-400 text-xs font-bold text-center animate-pulse">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
          >
            Authenticate
          </button>

          <p className="text-[9px] text-center opacity-20 font-medium uppercase tracking-wider">
            Session expires on tab close
          </p>
        </form>
      </div>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
