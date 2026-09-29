'use client';

import React from 'react';
import { X, Smartphone, ShieldCheck } from 'lucide-react';
import { Language, OCRJobRecord } from '@/types/museum';
import { MobileDocumentScanner } from './MobileDocumentScanner';
import { soundEffects } from '@/utils/soundEffects';

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  language?: Language;
  onIngestFolio?: (newRecord: OCRJobRecord) => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  language = 'en',
  onIngestFolio,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-[#0A2947]/70 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div 
        className="relative w-full max-w-5xl bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b-2 border-[#D3D4C0]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#0A2947] text-[#F3E4C9]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-editorial font-bold text-lg sm:text-xl text-[#0A2947]">
                Archival Folio Scanner &amp; OCR Digitizer
              </h3>
              <p className="text-xs text-[#8B5E3C] font-mono">
                Capture primary document scans from mobile or web camera for preservation indexing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-full hover:bg-[#FAF7F0] text-[#0A2947]/70 hover:text-[#0A2947] border border-[#D3D4C0] transition-colors cursor-pointer"
            aria-label="Close Scanner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <MobileDocumentScanner
            language={language}
            onIngestFolio={(record) => {
              if (onIngestFolio) {
                onIngestFolio(record);
              }
            }}
            onClose={onClose}
          />
        </div>

      </div>

    </div>
  );
};
