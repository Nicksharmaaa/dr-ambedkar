'use client';

import React, { useState, useRef } from 'react';
import { 
  X, Award, Printer, Download, Sparkles, CheckCircle2, 
  ShieldCheck, Share2, Landmark, Copy, Check
} from 'lucide-react';
import { soundEffects } from '@/utils/soundEffects';
import { Language } from '@/types/museum';

interface ConstitutionalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  totalQuestions: number;
  rankTitle: string;
  rankBadge: string;
  language: Language;
}

export const ConstitutionalCertificateModal: React.FC<ConstitutionalCertificateModalProps> = ({
  isOpen,
  onClose,
  score,
  totalQuestions,
  rankTitle,
  rankBadge,
  language
}) => {
  const [scholarName, setScholarName] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const percentage = Math.round((score / totalQuestions) * 100);
  const verificationHash = `AMB-CERT-${Date.now().toString(36).toUpperCase()}-${percentage}PCT`;

  const handlePrint = () => {
    soundEffects.playClick();
    window.print();
  };

  const handleCopyLink = () => {
    soundEffects.playClick();
    const shareText = `🏛️ Dr. B. R. Ambedkar Archival Heritage Certificate of Scholarship awarded to ${scholarName || 'Scholar'} with ${percentage}% score (${score}/${totalQuestions}) - Rank: ${rankTitle}. Verification Code: ${verificationHash}`;
    navigator.clipboard.writeText(shareText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2947]/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FAF7F0] border-2 border-[#C89D56] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/80 hover:bg-white text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Name Customization Input */}
        <div className="mb-6 space-y-2 border-b border-[#E2D9C8] pb-4">
          <label className="block text-xs font-mono uppercase tracking-wider text-[#8B5E3C] font-bold">
            Enter Scholar's Full Name for Certificate:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={scholarName}
              onChange={(e) => setScholarName(e.target.value)}
              placeholder="e.g. Anand Kumar, Dr. Priya Deshmukh, etc."
              className="flex-1 px-4 py-2.5 bg-white border border-[#D3D4C0] rounded-xl text-sm font-serif-editorial text-[#0A2947] focus:outline-none focus:ring-2 focus:ring-[#C89D56]"
            />
          </div>
        </div>

        {/* PRINTABLE ARCHIVAL CERTIFICATE */}
        <div
          ref={certificateRef}
          className="bg-white border-8 border-double border-[#C89D56] rounded-2xl p-6 sm:p-10 shadow-lg text-center relative overflow-hidden space-y-6"
        >
          {/* Subtle Guilloche Pattern Background Watermark */}
          <Landmark className="absolute -right-12 -bottom-12 w-64 h-64 text-[#C89D56]/[0.06] pointer-events-none select-none" />

          {/* Certificate Corner Ornaments */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-[#C89D56]" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-[#C89D56]" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-[#C89D56]" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-[#C89D56]" />

          {/* Certificate Header Seal */}
          <div className="space-y-1">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#0A2947] text-[#C89D56] border-2 border-[#C89D56] shadow-md mb-2">
              <span className="text-2xl">{rankBadge}</span>
            </div>
            <div className="text-[11px] font-mono tracking-widest uppercase text-[#8B5E3C]">
              DR. B. R. AMBEDKAR DIGITAL ARCHIVES & HERITAGE MUSEUM
            </div>
            <h3 className="text-2xl sm:text-4xl font-serif-editorial font-bold text-[#0A2947] tracking-tight">
              Certificate of Archival Scholarship
            </h3>
            <div className="w-24 h-0.5 bg-[#C89D56] mx-auto mt-2" />
          </div>

          {/* Certificate Body Text */}
          <div className="space-y-3 font-serif-editorial text-[#0A2947]">
            <p className="text-xs uppercase tracking-wider font-mono text-[#8B5E3C]">
              This is curatorial verification that
            </p>
            <div className="text-2xl sm:text-3xl font-bold text-[#0A2947] underline decoration-[#C89D56] decoration-2 underline-offset-8">
              {scholarName.trim() || 'Scholarly Inquirer'}
            </div>
            <p className="text-sm max-w-lg mx-auto leading-relaxed text-[#0A2947]/90 pt-2 font-dmsans">
              has successfully undertaken the primary-source Constitutional Quest, demonstrating mastery of the 22 BAWS archival volumes, the Constituent Assembly Debates, and Dr. Ambedkar’s principles of social democracy.
            </p>
          </div>

          {/* Rank & Score Pill */}
          <div className="inline-flex flex-wrap items-center justify-center gap-4 bg-[#FAF7F0] border border-[#E2D9C8] rounded-xl px-5 py-2.5">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8B5E3C] block">Grade Attained</span>
              <span className="text-sm font-bold font-serif-editorial text-[#0A2947]">
                {rankTitle}
              </span>
            </div>
            <div className="w-px h-6 bg-[#D3D4C0]" />
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8B5E3C] block">Score Accuracy</span>
              <span className="text-sm font-bold font-mono text-emerald-800">
                {score} / {totalQuestions} ({percentage}%)
              </span>
            </div>
            <div className="w-px h-6 bg-[#D3D4C0]" />
            <div>
              <span className="text-[10px] font-mono uppercase text-[#8B5E3C] block">Issue Date</span>
              <span className="text-xs font-mono text-[#0A2947]">
                {issueDate}
              </span>
            </div>
          </div>

          {/* Bottom Seal & Verification Hash */}
          <div className="pt-4 border-t border-[#E2D9C8] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-[#8B5E3C]">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#C89D56]" />
              <span>Fixity Signature: {verificationHash}</span>
            </div>
            <div>
              <span>Curatorial Board of Archival Preservation</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#D3D4C0] bg-white text-[#0A2947] font-semibold text-xs hover:bg-[#F3E4C9] transition-colors cursor-pointer"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Certificate Copied!' : 'Copy Verification Summary'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A2947] text-[#FAF7F0] font-bold text-xs hover:bg-[#041424] transition-colors cursor-pointer shadow-md"
          >
            <Printer className="w-4 h-4 text-[#C89D56]" />
            <span>Print / Save PDF Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConstitutionalCertificateModal;
