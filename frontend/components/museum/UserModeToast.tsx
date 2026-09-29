'use client';

import React, { useEffect, useState } from 'react';
import { GraduationCap, Eye, UserCheck, Key, X, BookOpen, Microscope, ShieldCheck, Zap } from 'lucide-react';
import { UserMode } from '@/types/museum';

interface UserModeToastProps {
  mode: UserMode;
  visible: boolean;
  onDismiss: () => void;
}

const MODE_CONFIG: Record<UserMode, {
  icon: React.ElementType;
  label: string;
  tagline: string;
  color: string;
  bg: string;
  border: string;
  features: string[];
}> = {
  visitor: {
    icon: Eye,
    label: 'Visitor Mode',
    tagline: 'Narrative storytelling & curated exhibits',
    color: '#0A2947',
    bg: 'linear-gradient(135deg, #F3E4C9 0%, #FAF7F0 100%)',
    border: '#D3D4C0',
    features: ['Guided exhibit narration', 'Illustrated timelines', 'Heritage photo gallery', 'Curated stories'],
  },
  student: {
    icon: GraduationCap,
    label: 'Student Mode',
    tagline: 'Guided exploration with educational trivia & quizzes',
    color: '#1a5276',
    bg: 'linear-gradient(135deg, #d6eaf8 0%, #eaf4fb 100%)',
    border: '#7fb3d3',
    features: ['Interactive flashcards', 'Constitution quest game', 'Study highlights', 'Fact annotations'],
  },
  researcher: {
    icon: Microscope,
    label: 'Researcher Mode',
    tagline: 'Full citations, PREMIS fixity checksums & source metadata',
    color: '#1a3a1a',
    bg: 'linear-gradient(135deg, #d5f5e3 0%, #eafaf1 100%)',
    border: '#82e0aa',
    features: ['Archival citations (APA/MLA/BibTeX)', 'Fixity checksums', 'OCR confidence scores', 'Knowledge graph'],
  },
  archivist: {
    icon: ShieldCheck,
    label: 'Archivist Mode',
    tagline: 'OCR pipeline, digital preservation & ingestion control',
    color: '#4a235a',
    bg: 'linear-gradient(135deg, #e8daef 0%, #f5eef8 100%)',
    border: '#c39bd3',
    features: ['PREMIS preservation events', 'OCR review pipeline', 'METS/DC metadata export', 'Fixity audit log'],
  },
};

export const UserModeToast: React.FC<UserModeToastProps> = ({ mode, visible, onDismiss }) => {
  const [animOut, setAnimOut] = useState(false);
  const cfg = MODE_CONFIG[mode];
  const Icon = cfg.icon;

  // Auto-dismiss after 5s
  useEffect(() => {
    if (!visible) return;
    setAnimOut(false);
    const t = setTimeout(() => {
      setAnimOut(true);
      setTimeout(onDismiss, 400);
    }, 5000);
    return () => clearTimeout(t);
  }, [visible, mode]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        transform: animOut ? 'translateY(120%) scale(0.95)' : 'translateY(0) scale(1)',
        opacity: animOut ? 0 : 1,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        maxWidth: '340px',
        width: '100%',
      }}
    >
      <div
        style={{
          background: cfg.bg,
          border: `1.5px solid ${cfg.border}`,
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: '3px', background: cfg.color, opacity: 0.7 }} />

        <div style={{ padding: '16px 18px 14px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${cfg.color}40`,
              }}>
                <Icon style={{ width: '18px', height: '18px', color: '#fff' }} />
              </div>
              <div>
                <div style={{
                  fontSize: '13px', fontWeight: 800, color: cfg.color,
                  fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em', lineHeight: 1.2,
                }}>
                  {cfg.label}
                </div>
                <div style={{
                  fontSize: '10px', color: cfg.color, opacity: 0.65,
                  fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase',
                }}>
                  Interface Active
                </div>
              </div>
            </div>
            <button
              onClick={() => { setAnimOut(true); setTimeout(onDismiss, 300); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                color: cfg.color, opacity: 0.5, borderRadius: '8px',
              }}
            >
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {/* Tagline */}
          <p style={{
            fontSize: '11.5px', color: cfg.color, opacity: 0.8, lineHeight: 1.5,
            fontFamily: 'DM Sans, sans-serif', margin: '0 0 12px',
          }}>
            {cfg.tagline}
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {cfg.features.map((f) => (
              <span
                key={f}
                style={{
                  padding: '3px 9px', borderRadius: '20px',
                  background: `${cfg.color}12`, border: `1px solid ${cfg.color}25`,
                  fontSize: '10px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
                  color: cfg.color, letterSpacing: '0.03em',
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom progress bar (5s auto-dismiss) */}
        <div style={{ height: '2px', background: `${cfg.color}18` }}>
          <div
            style={{
              height: '100%',
              background: cfg.color,
              animation: 'shrinkBar 5s linear forwards',
              opacity: 0.45,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrinkBar {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default UserModeToast;
