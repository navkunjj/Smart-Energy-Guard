import React, { useState } from 'react';
import { X, Settings, Shield, Bell, Database, RefreshCw, Lock, Trash2 } from 'lucide-react';

const SettingsModal = ({ 
  isOpen, 
  onClose, 
  settings, 
  updateSettings, 
  runCalibration, 
  resetSystem,
  status 
}) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Alerts', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
  ];

  const handleResetApp = () => {
    if (window.confirm('Are you sure you want to reset all app settings to default?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const storedPass = localStorage.getItem("eg_admin_pass") || "energyguard";
    
    if (passForm.current !== storedPass) {
      setPassMsg({ text: 'Current password incorrect', color: 'text-rose-400' });
      return;
    }
    if (passForm.new.length < 4) {
      setPassMsg({ text: 'New password must be at least 4 chars', color: 'text-rose-400' });
      return;
    }
    if (passForm.new !== passForm.confirm) {
      setPassMsg({ text: 'Passwords do not match', color: 'text-rose-400' });
      return;
    }

    localStorage.setItem("eg_admin_pass", passForm.new);
    setPassMsg({ text: 'Password updated successfully!', color: 'text-emerald-400' });
    setPassForm({ current: '', new: '', confirm: '' });
    setIsChangingPass(false); // Hide form after success
    setTimeout(() => setPassMsg({ text: '', color: '' }), 3000);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center px-4 backdrop-blur-md bg-slate-950/40">
      <div className="relative w-full max-w-2xl glass-card rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Settings size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">SYSTEM SETTINGS</h2>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Configure Energy Guard Surveillance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <X size={20} className="opacity-40" />
          </button>
        </div>

        <div className="flex h-[450px]">
          {/* Sidebar Tabs */}
          <div className="w-48 border-r border-white/5 bg-white/[0.02] p-4 flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-white/40 hover:bg-white/5 hover:text-white'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
            <div className="mt-auto">
              <button 
                onClick={handleResetApp}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-[10px] font-black text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all uppercase tracking-wider"
              >
                <Trash2 size={14} />
                Reset App
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <section>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 block">Application Theme</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="p-4 rounded-2xl border border-white/10 bg-white/5 text-xs font-bold text-center">Dark Industrial</button>
                    <button className="p-4 rounded-2xl border border-white/5 opacity-40 text-xs font-bold text-center cursor-not-allowed">Modern Light (Soon)</button>
                  </div>
                </section>

              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-bold">Admin Authentication</h4>
                      <p className="text-xs opacity-40">System access is locked by code-level encryption.</p>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg">
                      <Lock size={16} className="text-emerald-400" />
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-[10px] font-medium opacity-40 text-center">
                    Password management is disabled in the UI for security.
                  </div>
                </section>

                <section>
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-4 block">Safety Controls</label>
                  <button 
                    onClick={resetSystem}
                    className="w-full py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all"
                  >
                    Clear Active Theft Flags
                  </button>
                </section>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <section className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl shrink-0">
                    <Bell size={16} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">Visual Alerts Only</h4>
                    <p className="text-xs opacity-40 font-medium mt-0.5">
                      Theft events display a banner on screen. No audible alerts are active.
                    </p>
                  </div>
                </section>
              </div>
            )}


            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">Firmware</p>
                    <p className="text-xs font-bold text-blue-400">v2.4.0-PRO</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-widest mb-1">IP Address</p>
                    <p className="text-xs font-bold text-blue-400">{status.ip || '0.0.0.0'}</p>
                  </div>
                </div>

                <section>
                  <h4 className="text-sm font-bold mb-2">Sensor Calibration</h4>
                  <p className="text-xs opacity-40 mb-4 leading-relaxed font-medium">Re-zero all current sensors to eliminate noise. Ensure no load is connected during this process.</p>
                  <button 
                    onClick={() => { runCalibration(); onClose(); }}
                    className="w-full py-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Run Auto-Calibration
                  </button>
                </section>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl bg-white/5 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Close Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
