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
  GitBranch,
} from 'lucide-react';
import Logo from './Logo';
import { usePWAInstall } from '../hooks/usePWAInstall';

const menuItems = [
  { id: 'dashboard',  label: 'Monitor',       icon: LayoutDashboard },
  { id: 'diagram',    label: 'Wiring Map',    icon: GitBranch },
  { id: 'analytics',  label: 'Analytics',     icon: Activity },
  { id: 'control',    label: 'Device Control', icon: Settings },
  { id: 'history',    label: 'System History', icon: History },
];

/* ── Mobile bottom bar tab ──────────────────────────────────────── */
const MobileTab = ({ item, active, onClick }) => {
  const Icon = item.icon;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl flex-1 transition-all duration-200 ${
        active
          ? 'text-blue-500 bg-blue-500/10'
          : 'opacity-40 hover:opacity-100'
      }`}
    >
      <Icon size={18} />
      <span className="text-[8px] font-bold uppercase tracking-wide leading-none">
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border border-transparent ${
        active
          ? 'bg-blue-600/20 text-blue-500 border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.08)] font-bold'
          : 'opacity-40 hover:opacity-100 hover:bg-[var(--hover-bg)] hover:border-[var(--hover-border)]'
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
        <div className="p-6 border-b border-[var(--card-border)]">
          <Logo size={36} />
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

        <div className="p-4 border-t border-[var(--card-border)]">
          <div className="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] group hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu size={16} className={isOnline ? 'text-blue-400' : 'text-gray-500'} />
                <span className="text-[11px] font-bold uppercase tracking-wider">ESP32 Core</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-indicator' : 'bg-rose-500'}`} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] opacity-40 uppercase font-bold">Node ID</span>
                <span className="text-[10px] font-mono font-bold text-blue-400">{status?.nodeId || 'ESP32-Z90'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] opacity-40 uppercase font-bold">IP Address</span>
                <span className="text-[10px] font-mono opacity-80">{isOnline ? (status?.ipAddress || '192.168.1.42') : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] opacity-40 uppercase font-bold">Uptime</span>
                <span className="text-[10px] opacity-80">{isOnline ? (status?.uptime || '0d 0h 0m') : 'Offline'}</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--card-border)] flex items-center justify-between">
              <span className="text-[9px] opacity-40 uppercase font-bold">Status</span>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isOnline ? 'Online' : 'Offline'}
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 glass-card border-b border-[var(--card-border)]">
        <Logo size={32} />

        <div className="flex items-center gap-2">
          {/* ESP32 live dot */}
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-indicator' : 'bg-rose-500'}`} />
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="p-2 rounded-xl glass-card text-slate-400 hover:text-blue-400 transition-colors"
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
            <div className="pt-3 border-t border-white/10 mt-2 space-y-1">
              <div className="flex items-center justify-between px-4 py-1">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 pulse-indicator' : 'bg-rose-500'}`} />
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">
                    ESP32 {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-400">{status?.nodeId || 'ESP32-Z90'}</span>
              </div>
              {isOnline && (
                <div className="px-4 py-1 flex justify-between items-center">
                  <span className="text-[9px] opacity-40 uppercase font-bold tracking-widest">Network IP</span>
                  <span className="text-[10px] font-mono opacity-60">{status?.ipAddress || '192.168.1.42'}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ───────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center gap-0.5 px-1 py-2 glass-card border-t border-white/10">
        {menuItems.map(item => (
          <MobileTab key={item.id} item={item} active={activeTab === item.id} onClick={handleNav} />
        ))}
      </div>
    </>
  );
};

export default Sidebar;
