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
  Database,
  Compass,
} from "lucide-react";
import { api } from "@/lib/api";
import { VoiceSearchModal } from "./voice/VoiceSearchModal";

const navItems = [
  { name: "Archive", href: "/documents", icon: BookOpen },
  { name: "Knowledge Map", href: "/knowledge-map", icon: Share2 },
  { name: "Timeline", href: "/timeline", icon: Clock },
  { name: "Stories", href: "/stories", icon: Compass },
  { name: "Media", href: "/media", icon: Mic },
  { name: "Assistant", href: "/assistant", icon: Bot },
  { name: "Search", href: "/search", icon: Search },
  { name: "Preservation", href: "/preservation", icon: ShieldCheck },
  { name: "Admin", href: "/admin", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <span className="font-serif font-bold text-white text-lg tracking-wider">BA</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-wide text-slate-100 uppercase">
              Ambedkar Heritage
            </span>
            <span className="text-xs text-amber-400 font-medium">Digital Preservation Archive</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Voice Search [ 🎤 Ask the Archive ] & System Status */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setVoiceSearchOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-medium shadow-sm transition-all"
            title="Voice Search: Ask the Archive in English, Hindi, or Marathi"
          >
            <Mic className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
            <span className="hidden xl:inline">Ask the Archive</span>
          </button>

          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border border-slate-800 bg-slate-900/60"
            title={apiConnected ? "Backend & Turso connected" : "Backend connection pending"}
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
            <span className="text-slate-400 text-[11px]">
              {apiConnected === null ? "API CHECK" : apiConnected ? "TURSO LIVE" : "API OFFLINE"}
            </span>
          </div>
        </div>

        {/* Voice Search Modal */}
        <VoiceSearchModal
          isOpen={voiceSearchOpen}
          onClose={() => setVoiceSearchOpen(false)}
        />

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 text-slate-400 hover:text-white focus:outline-none"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                  active
                    ? "bg-amber-500/15 text-amber-300 font-medium"
                    : "text-slate-300 hover:bg-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
