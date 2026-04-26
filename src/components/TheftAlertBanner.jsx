import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle, VolumeX, Volume2, X, ShieldAlert } from "lucide-react";

/* ── Web Audio API Siren Generator ───────────────────────────────── */
const createSiren = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.type = "square";
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.2);

    const startTime = audioCtx.currentTime;
    for (let i = 0; i < 300; i++) {
      const time = startTime + i * 1.0;
      osc.frequency.setValueAtTime(600, time);
      osc.frequency.linearRampToValueAtTime(900, time + 0.5);
      osc.frequency.linearRampToValueAtTime(600, time + 1.0);
    }

    osc.start();

    return {
      stop: () => {
        const now = audioCtx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.5);
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 600);
      }
    };
  } catch (e) {
    console.error("Audio Context Error:", e);
    return null;
  }
};

/* ── Main theft alert banner ─────────────────────────────────────── */
const TheftAlertBanner = ({ theft, isOffline, settings = {} }) => {
  const [wasTheft, setWasTheft] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const sirenRef = useRef(null);
  const timeoutRef = useRef(null);

  // 1. Handle Siren & Modal Logic
  useEffect(() => {
    if (isOffline) {
      if (sirenRef.current) {
        sirenRef.current.stop();
        sirenRef.current = null;
      }
      setShowModal(false);
      return;
    }

    const isTheftActive = theft.anyTheft;

    // Handle Siren Logic based on both Theft Status AND Settings Change
    if (isTheftActive && settings.sirenEnabled && !isMuted) {
      // If theft is happening and user enables siren, start it instantly
      if (!sirenRef.current) {
        sirenRef.current = createSiren();
        
        // Auto-stop siren after timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          if (sirenRef.current) {
            sirenRef.current.stop();
            sirenRef.current = null;
            setIsMuted(true);
          }
        }, (settings.sirenTimeout || 60) * 1000);
      }
      
      // If theft is happening and siren is enabled, show modal
      setShowModal(true);
    } else {
      // If theft ends OR user disables siren OR user mutes, stop siren
      if (sirenRef.current) {
        sirenRef.current.stop();
        sirenRef.current = null;
      }
      // If siren is disabled or theft ended, hide modal
      if (!isTheftActive || !settings.sirenEnabled) {
        setShowModal(false);
      }
    }

    // Reset mute and modal state when theft ends
    if (!isTheftActive && wasTheft) {
      setIsMuted(false);
      setShowModal(false);
    }

    setWasTheft(isTheftActive);
  }, [theft.anyTheft, isOffline, wasTheft, isMuted, settings.sirenEnabled, settings.sirenTimeout]);

  // 2. Manual Controls
  const toggleMute = () => {
    if (sirenRef.current) {
      sirenRef.current.stop();
      sirenRef.current = null;
    }
    setIsMuted(true);
  };

  const closeModal = () => setShowModal(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sirenRef.current) sirenRef.current.stop();
    };
  }, []);

  if (isOffline || !theft.anyTheft) return null;

  const messages = [];
  if (theft.mainTheft) messages.push("Main Input Mismatch");
  if (theft.pole1Theft) messages.push("Theft at Pole 1");
  if (theft.pole2Theft) messages.push("Theft at Pole 2");

  let displayMessage = messages.length > 1 
    ? "Multiple Thefts Detected Across System" 
    : (messages[0] || "Suspicious Activity Detected");

  return (
    <>
      {/* ── 1. Top-Right Fixed Banner ─────────────────────────────── */}
      <div className="fixed top-20 right-4 lg:top-24 lg:right-6 z-[100] max-w-sm w-[calc(100%-2rem)] md:w-96 theft-banner rounded-2xl px-5 py-4 border border-rose-500/50 flex items-center gap-4 shadow-2xl shadow-rose-500/20 backdrop-blur-2xl bg-slate-900/95">
        <div className="p-2 bg-rose-500/20 rounded-xl shrink-0">
          <AlertTriangle size={22} className="text-rose-400 animate-pulse" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-0.5">
            ⚡ Active Theft Alert
          </h3>
          <p className="text-xs font-bold text-rose-300/90 truncate">
            {displayMessage}
          </p>
        </div>

        <button 
          onClick={toggleMute}
          disabled={isMuted}
          className={`p-2 rounded-xl border transition-all ${
            isMuted 
              ? 'border-white/5 text-white/20' 
              : 'border-rose-500/30 text-rose-400 hover:bg-rose-500/10'
          }`}
          title={isMuted ? "Siren Muted" : "Stop Siren"}
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="animate-bounce" />}
        </button>
      </div>

      {/* ── 2. Full-Screen Pop-Up Modal ───────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 backdrop-blur-md bg-rose-950/20">
          <div className="absolute inset-0 bg-rose-500/10 animate-pulse" />
          
          <div className="relative w-full max-w-lg glass-card rounded-[2rem] border border-rose-500/50 p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldAlert size={200} />
            </div>

            <div className="relative text-center">
              <div className="w-20 h-20 bg-rose-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                <AlertTriangle size={40} className="text-rose-400 animate-pulse" />
              </div>

              <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                SYSTEM INTRUSION
              </h2>
              <p className="text-rose-400 font-bold uppercase tracking-widest text-sm mb-6">
                Power Theft Detected
              </p>

              <div className="space-y-3 mb-8">
                {messages.map((msg, i) => (
                  <div key={i} className="py-3 px-4 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-sm font-bold text-rose-200">{msg}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={toggleMute}
                  disabled={isMuted}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-wider text-xs transition-all ${
                    isMuted 
                    ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed'
                    : 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 hover:bg-rose-600 active:scale-95'
                  }`}
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  {isMuted ? "Siren Stopped" : "Silence Alarm"}
                </button>

                <button 
                  onClick={closeModal}
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-black uppercase tracking-wider text-xs bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all active:scale-95"
                >
                  <X size={16} />
                  Dismiss Pop-up
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TheftAlertBanner;
