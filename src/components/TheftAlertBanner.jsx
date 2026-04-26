import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, X } from 'lucide-react';

/* ── Toast notification (slides in from the right) ─────────────────── */
const Toast = ({ message, onDismiss, exiting }) => (
  <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 backdrop-blur-xl shadow-lg ${exiting ? 'toast-exit' : 'toast-enter'}`}>
    <AlertTriangle size={18} className="text-rose-400 shrink-0" />
    <span className="text-sm font-bold text-rose-300 flex-1">{message}</span>
    <button onClick={onDismiss} className="p-1 rounded-lg hover:bg-rose-500/20 transition-colors shrink-0">
      <X size={14} className="text-rose-400" />
    </button>
  </div>
);

/* ── Main theft alert banner + toast system ────────────────────────── */
const TheftAlertBanner = ({ theft, isOffline }) => {
  const [toasts, setToasts] = useState([]);
  const [prevTheft, setPrevTheft] = useState({ pole1Theft: false, pole2Theft: false, mainTheft: false });

  // Spawn toasts only on rising-edge transitions (normal → theft)
  useEffect(() => {
    if (isOffline) return;
    const newToasts = [];

    if (theft.mainTheft && !prevTheft.mainTheft) {
      newToasts.push({ id: Date.now() + 1, message: '⚠ Theft Detected — Main Input Mismatch', exiting: false });
    }
    if (theft.pole1Theft && !prevTheft.pole1Theft) {
      newToasts.push({ id: Date.now() + 2, message: '⚠ Theft detected at Pole 1', exiting: false });
    }
    if (theft.pole2Theft && !prevTheft.pole2Theft) {
      newToasts.push({ id: Date.now() + 3, message: '⚠ Theft detected at Pole 2', exiting: false });
    }

    if (newToasts.length > 0) {
      setToasts(prev => [...prev, ...newToasts]);
    }

    setPrevTheft({ pole1Theft: theft.pole1Theft, pole2Theft: theft.pole2Theft, mainTheft: theft.mainTheft });
  }, [theft.mainTheft, theft.pole1Theft, theft.pole2Theft, isOffline]);

  // Auto-dismiss toasts after 8 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map(t =>
      setTimeout(() => dismissToast(t.id), 8000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts.length]);

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  if (isOffline) return null;

  const messages = [];
  if (theft.mainTheft) messages.push('Main Input Mismatch — Main Input ≠ Poles Total');
  if (theft.pole1Theft) messages.push('Theft at Pole 1 — Pole 1 Total ≠ Houses Total');
  if (theft.pole2Theft) messages.push('Theft at Pole 2 — Pole 2 Total ≠ House 3');

  return (
    <>
      {/* ── Sticky top banner ─────────────────────────────────────── */}
      {theft.anyTheft && (
        <div className="theft-banner rounded-2xl px-5 py-4 mb-5 border border-rose-500/30 flex items-start gap-4">
          <div className="p-2 bg-rose-500/20 rounded-xl shrink-0 mt-0.5">
            <AlertTriangle size={22} className="text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-rose-400 uppercase tracking-wider mb-1.5">
              ⚡ Theft Alert Active
            </h3>
            <div className="space-y-1">
              {messages.map((msg, i) => (
                <p key={i} className="text-xs font-bold text-rose-300/80 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse shrink-0" />
                  {msg}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Toast stack (bottom-right) ─────────────────────────────── */}
      {toasts.length > 0 && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 lg:right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <Toast message={t.message} exiting={t.exiting} onDismiss={() => dismissToast(t.id)} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TheftAlertBanner;
