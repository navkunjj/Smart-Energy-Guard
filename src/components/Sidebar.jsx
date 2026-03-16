import React, { useState } from 'react';
import {
  LayoutDashboard,
  Activity,
  Settings,
  History,
  Zap,
  Cpu,
  LogOut,
  Menu,
  X,
  Smartphone,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const menuItems = [
  { id: 'dashboard',  label: 'Monitor',       icon: LayoutDashboard },
  { id: 'analytics',  label: 'Analytics',     icon: Activity },
  { id: 'control',    label: 'Device Control', icon: Settings },
  { id: 'logs',       label: 'Event Logs',    icon: History },
];

/* ── Mobile bottom bar tab ──────────────────────────────────────── */
const MobileTab = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl flex-1 transition-all duration-200 ${
        active
          ? 'text-blue-400 bg-blue-500/10'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <Icon size={20} />
      <span className="text-[9px] font-bold uppercase tracking-wide leading-none">
        {item.label}
      </span>
    </button>
  );
};

/* ── Desktop sidebar item ────────────────────────────────────────── */
const SidebarItem = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        active
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(37,99,235,0.1)]'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium text-sm">{item.label}</span>
    </button>
  );
};

const Sidebar = ({ activeTab, setActiveTab, status }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isInstallable, installApp } = usePWAInstall();

  const handleNav = (id) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  const isOnline = status?.esp32Online;

  return (
    <>
      {/* ── Desktop sidebar (hidden on mobile) ─────────────────── */}
      <aside className="hidden lg:flex w-64 h-screen glass-card fixed left-0 top-0 flex-col z-50">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Zap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">ENERGY GUARD</h1>
            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider">Smart Power Detection</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(item => (
            <SidebarItem key={item.id} item={item} active={activeTab === item.id} onClick={handleNav} />
          ))}

          {isInstallable && (
            <button
              onClick={installApp}
              className="w-full flex items-center gap-3 px-4 py-3 mt-4 rounded-xl transition-all duration-200 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-600/20"
            >
              <Smartphone size={20} />
              <span className="font-medium text-sm">Install App</span>
            </button>
          )}
        </nav>

        {/* Status footer */}
        <div className="p-4 border-t border-white/10">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <Cpu size={18} className="text-emerald-400" />
              <span className="text-xs font-semibold text-white">ESP32 Status</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-indicator' : 'bg-rose-500'}`} />
              <span className="text-[10px] text-gray-400 uppercase tracking-tighter">
                {isOnline ? 'System Online' : 'System Offline'}
              </span>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 mt-4 text-gray-400 hover:text-red-400 transition-colors">
            <LogOut size={20} />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile top navbar ───────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 glass-card border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-600 rounded-lg">
            <Zap className="text-white" size={18} />
          </div>
          <div>
            <p className="text-xs font-bold text-white leading-none">ENERGY GUARD</p>
            <p className="text-[9px] text-gray-400 uppercase tracking-wider">Smart Power Detection</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* ESP32 live dot */}
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-indicator' : 'bg-rose-500'}`} />
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-2 rounded-xl glass-card text-slate-300 hover:text-white transition-colors"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* ── Mobile slide-down drawer (full menu) ───────────────── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex flex-col" onClick={() => setMobileOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Drawer panel */}
          <div
            className="relative mt-[60px] mx-4 glass-card rounded-2xl border border-white/10 p-4 space-y-1 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {isInstallable && (
              <button
                onClick={installApp}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-200 bg-blue-600 text-white shadow-lg shadow-blue-600/20 mb-2"
              >
                <Smartphone size={22} />
                <div className="text-left">
                  <p className="font-bold text-sm leading-none">Download App</p>
                  <p className="text-[10px] opacity-80 mt-1 uppercase tracking-widest">Install on Home Screen</p>
                </div>
              </button>
            )}

            {menuItems.map(item => (
              <SidebarItem key={item.id} item={item} active={activeTab === item.id} onClick={handleNav} />
            ))}
            <div className="pt-3 border-t border-white/10 mt-2">
              <div className="flex items-center gap-2 px-4 py-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-indicator' : 'bg-rose-500'}`} />
                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                  ESP32 {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-1 px-2 py-2 glass-card border-t border-white/10">
        {menuItems.map(item => (
          <MobileTab key={item.id} item={item} active={activeTab === item.id} onClick={handleNav} />
        ))}
      </div>
    </>
  );
};

export default Sidebar;
