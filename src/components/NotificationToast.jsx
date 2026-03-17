import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Bell, Zap, Power, Lightbulb, ShieldAlert } from 'lucide-react';

const icons = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-rose-500" />,
  info: <Info size={18} className="text-blue-500" />,
  warning: <AlertCircle size={18} className="text-amber-500" />,
  control: <Zap size={18} className="text-purple-500" />,
  led: <Lightbulb size={18} className="text-yellow-500" />,
  relay: <Power size={18} className="text-blue-500" />,
  alarm: <Bell size={18} className="text-rose-500" />,
  theft: <ShieldAlert size={18} className="text-rose-600" />,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
  error: 'border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
  info: 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  warning: 'border-amber-500/30 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
  control: 'border-purple-500/30 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.1)]',
  led: 'border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_15px_rgba(234,179,8,0.1)]',
  relay: 'border-blue-500/30 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
  alarm: 'border-rose-500/30 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
  theft: 'border-rose-600/50 bg-rose-600/20 shadow-[0_0_20px_rgba(225,29,72,0.2)]',
};

const Toast = ({ message, type = 'info', onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onRemove, 300);
    }, 1000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  return (
    <div
      className={`glass-card p-4 rounded-2xl border flex items-center gap-4 min-w-[300px] transition-all duration-300 transform ${
        isExiting ? 'opacity-0 translate-x-12 scale-95' : 'opacity-100 translate-x-0 scale-100'
      } ${colors[type] || colors.info}`}
    >
      <div className={`p-2 rounded-xl bg-white/5`}>
        {icons[type] || icons.info}
      </div>
      <div className="flex-1">
        <p className="text-xs font-black opacity-40 uppercase tracking-widest leading-none mb-1">{type}</p>
        <p className="text-sm font-bold leading-tight">{message}</p>
      </div>
      <button 
        onClick={() => {
          setIsExiting(true);
          setTimeout(onRemove, 300);
        }}
        className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-40 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
};

const NotificationContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <div className="flex flex-col gap-3 pointer-events-auto">
        {notifications.map((notif) => (
          <Toast
            key={notif.id}
            message={notif.message}
            type={notif.type}
            onRemove={() => removeNotification(notif.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationContainer;
