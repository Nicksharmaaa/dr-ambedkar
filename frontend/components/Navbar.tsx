"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Search,
  Clock,
  Bot,
  Share2,
  Mic,
  ShieldCheck,
  Settings,
  Menu,
  X,
  Compass,
  GitCompare,
  Eye,
  GraduationCap,
  Sparkles,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { api } from "@/lib/api";
import { VoiceSearchModal } from "./voice/VoiceSearchModal";
import VoicePill from "./ui/VoicePill";
import { useUserMode, UserMode } from "@/lib/UserModeContext";

const navItems = [
  { name: "Archive", href: "/documents", icon: BookOpen },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Stories", href: "/stories", icon: Compass },
  { name: "Knowledge Map", href: "/knowledge-map", icon: Share2 },
  { name: "Media", href: "/media", icon: Mic },
  { name: "Compare", href: "/compare", icon: GitCompare },
  { name: "Search", href: "/search", icon: Search },
  { name: "Assistant", href: "/assistant", icon: Bot },
];

const MODES: { id: UserMode; label: string; icon: any; desc: string }[] = [
  { id: "visitor", label: "Visitor", icon: Eye, desc: "Visual discovery & touch-first storytelling" },
  { id: "student", label: "Student", icon: GraduationCap, desc: "Concept explanations & educational evidence" },
  { id: "researcher", label: "Researcher", icon: Sparkles, desc: "Scholarly search, comparison & exact citations" },
  { id: "archivist", label: "Archivist", icon: ShieldCheck, desc: "Preservation fixity, OCR review & metadata" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { mode, setMode } = useUserMode();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modeDropdownOpen, setModeDropdownOpen] = useState(false);
  const [voiceSearchOpen, setVoiceSearchOpen] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkApi = async () => {
      try {
        const health = await api.getHealth();
        if (mounted) setApiConnected(health.status === "ok");
      } catch {
        if (mounted) setApiConnected(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeModeObj = MODES.find((m) => m.id === mode) || MODES[0];
  const ActiveModeIcon = activeModeObj.icon;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="font-serif font-bold text-white text-base sm:text-lg tracking-wider">BA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Ambedkar Heritage
            </span>
            <span className="text-[10px] sm:text-xs text-amber-400 font-medium">Digital Archive</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  active
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Mode Selector + Voice + Kiosk + Status */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Mode Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setModeDropdownOpen(!modeDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 hover:border-amber-500/50 text-xs font-medium transition-all shadow-sm"
              title="Switch user perspective (Visitor, Student, Researcher, Archivist)"
              aria-label="User mode selector"
            >
              <ActiveModeIcon className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-slate-200 capitalize hidden sm:inline">{mode}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {modeDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-60 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl p-1.5 z-50 backdrop-blur-lg animate-in fade-in zoom-in-95 duration-100"
                onMouseLeave={() => setModeDropdownOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Active Experience Mode
                </div>
                {MODES.map((m) => {
                  const MIcon = m.icon;
                  const isSelected = mode === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setMode(m.id);
                        setModeDropdownOpen(false);
                      }}
                      className={`w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs transition-colors ${
                        isSelected
                          ? "bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <MIcon className={`h-4 w-4 mt-0.5 shrink-0 ${isSelected ? "text-amber-400" : "text-slate-400"}`} />
                      <div>
                        <div className="text-xs">{m.label} Mode</div>
                        <div className="text-[10px] text-slate-400 font-normal leading-tight">{m.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Voice Search Button */}
          <div className="flex items-center gap-1.5 px-1 py-0.5 rounded-full bg-blue-950/40 border border-blue-500/30" title="Voice Search: Ask the Archive in English, Hindi, or Marathi">
            <VoicePill
              accentColor="#60A5FA"
              iconColor="#93C5FD"
              background="#1E293B"
              size={26}
              shape="pill"
              reach={6}
              showTime={false}
              waveform={false}
              slideToCancel={false}
              mode="toggle"
              ariaLabel="Voice Search"
              onStart={() => setVoiceSearchOpen(true)}
            />
            <span className="hidden xl:inline pr-2 text-xs font-medium text-blue-300">Voice</span>
          </div>

          {/* Dedicated Kiosk Mode Link */}
          <Link
            href="/kiosk"
            prefetch={false}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
            title="Launch Fullscreen Touch Kiosk Experience"
          >
            <Monitor className="h-3.5 w-3.5 text-amber-400" />
            <span className="hidden sm:inline">Kiosk</span>
          </Link>

          {/* Live Turso Connection Status */}
          <div
            className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-mono border border-slate-800 bg-slate-900/60"
            title={apiConnected ? "Backend & Turso live in aws-ap-south-1" : "Backend connection pending"}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiConnected === null
                  ? "bg-amber-400 animate-pulse"
                  : apiConnected
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  : "bg-rose-500"
              }`}
            />
            <span className="text-slate-400 hidden md:inline">
              {apiConnected === null ? "CHECK" : apiConnected ? "TURSO" : "OFFLINE"}
            </span>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={voiceSearchOpen}
        onClose={() => setVoiceSearchOpen(false)}
      />

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 py-3 space-y-2">
          {/* Mode Switcher in Mobile */}
          <div className="pb-2 border-b border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Select Mode:</span>
            <div className="grid grid-cols-2 gap-1.5 mt-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMode(m.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium text-left ${
                    mode === m.id
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-slate-900 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                    active
                      ? "bg-amber-500/15 text-amber-300 font-semibold"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-400"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Admin & Ingest</span>
            </Link>
            <Link
              href="/kiosk"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 text-amber-400"
            >
              <Monitor className="h-3.5 w-3.5" />
              <span>Kiosk Mode</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
