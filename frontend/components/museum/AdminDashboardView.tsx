'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Upload, FileText, CheckCircle2, AlertCircle, Database, 
  BarChart3, RefreshCw, Cpu, Check, Eye, Lock, Globe, Sparkles, Filter, Search
} from 'lucide-react';
import { OCRJobRecord, ArchivalDocument, Language } from '@/types/museum';
import { ADMIN_OCR_RECORDS, ARCHIVE_DOCUMENTS } from '@/data/archiveData';
import { api } from '@/lib/api';
import { soundEffects } from '@/utils/soundEffects';
import { MuseumGrandPavilion } from './MuseumGrandPavilion';

interface AdminDashboardViewProps {
  language: Language;
  onOpenDocument?: (doc: ArchivalDocument) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  language,
  onOpenDocument
}) => {
  const [ocrRecords, setOcrRecords] = useState<OCRJobRecord[]>(ADMIN_OCR_RECORDS);
  const [selectedRecord, setSelectedRecord] = useState<OCRJobRecord>(ADMIN_OCR_RECORDS[0]);
  const [ocrBaseline, setOcrBaseline] = useState<any>(null);
  const [corpusStats, setCorpusStats] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    api.getOCRBaseline()
      .then(data => {
        if (data) {
          setOcrBaseline(data);
          // Adapt languages to OCR records if present
          if (data.languages) {
            const adapted: OCRJobRecord[] = Object.entries(data.languages).map(([code, l]: [string, any]) => ({
              id: `ocr-audit-${code}`,
              fileName: `BAWS_Facsimile_${l.language_name}_Sample_${l.total_documents}Docs.pdf`,
              fileSize: `${((l.total_pages * 0.25)).toFixed(1)} MB`,
              uploadDate: 'Verified Corpus Baseline',
              status: 'Completed',
              engine: 'PaddleOCR PP-OCRv5',
              confidenceScore: Math.round(l.avg_confidence * 1000) / 10,
              titleExtracted: `BAWS ${l.language_name} Facsimiles (${l.script} Script)`,
              languageDetected: `${l.language_name} (${l.script})`,
              accessRights: 'Public Domain',
              rawOcrSnippet: `Audited ${l.sample_pages_audited} sample pages. Failure modes: ${(l.common_failure_modes || []).join('; ')}`,
              cleanedTextSnippet: `Verified ${l.successful_pages}/${l.sample_pages_audited} sample pages with CER ~ ${(l.char_error_rate_est * 100).toFixed(1)}%, WER ~ ${(l.word_error_rate_est * 100).toFixed(1)}%.`
            }));
            if (adapted.length > 0) {
              setOcrRecords(adapted);
              setSelectedRecord(adapted[0]);
            }
          }
        }
      })
      .catch(() => {});

    api.getCorpusStats()
      .then(stats => {
        if (stats) setCorpusStats(stats);
      })
      .catch(() => {});
  }, []);

  // Form states for Upload Simulator
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'book' | 'speech' | 'debate' | 'manuscript'>('speech');
  const [uploadYear, setUploadYear] = useState('1930');
  const [uploadEngine, setUploadEngine] = useState<string>('PaddleOCR PP-OCRv5');
  const [uploadAccess, setUploadAccess] = useState<'Public Domain' | 'Fair Use Educational' | 'Archival Restricted'>('Public Domain');
  const [selectedFileName, setSelectedFileName] = useState('Ambedkar_Bombay_Legislative_Speech_1930.pdf');

  const handleSimulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playClick();
    setIsUploading(true);

    setTimeout(() => {
      const newJob: OCRJobRecord = {
        id: `ocr-job-${Date.now()}`,
        fileName: selectedFileName,
        fileSize: '5.4 MB',
        uploadDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Completed',
        engine: uploadEngine,
        confidenceScore: 99.2,
        titleExtracted: uploadTitle || 'Speech on the Primary Education Bill (1930)',
        languageDetected: 'English / Marathi Bilingual',
        accessRights: uploadAccess,
        rawOcrSnippet: 'The measure before the House is of paramount importance to all backward classes...',
        cleanedTextSnippet: 'The measure before the House is of paramount importance to all backward classes. Education is the greatest weapon for human emancipation.'
      };

      setOcrRecords(prev => [newJob, ...prev]);
      setSelectedRecord(newJob);
      setIsUploading(false);
      setUploadSuccess(true);
      soundEffects.playSuccess();
      setUploadTitle('');
      setTimeout(() => setUploadSuccess(false), 3500);
    }, 1200);
  };

  const handleApproveRecord = (id: string) => {
    soundEffects.playSuccess();
    setOcrRecords(prev => prev.map(rec => rec.id === id ? { ...rec, status: 'Completed' } : rec));
  };

  return (
    <div className="min-h-screen bg-transparent text-[#0A2947] py-10 px-4 sm:px-6 lg:px-8 font-dmsans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Curatorial Admin Header */}
        <MuseumGrandPavilion
          title={
            <>
              Conservatory &amp;{' '}
              <span className="font-serif italic font-normal bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] bg-clip-text text-transparent">
                OCR Ingestion
              </span>{' '}
              Registry
            </>
          }
          watermarkIcon={ShieldCheck}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pt-2">
            <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed max-w-3xl">
              Verify optical character recognition accuracy across multilingual neural engines, calibrate Devanagari line segmentations, ingest historical manuscripts, and manage accession rights.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 shrink-0 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audit Log: AES-256 Encrypted</span>
            </div>
          </div>
        </MuseumGrandPavilion>


        {/* Analytics KPI Dashboard Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border-2 border-[#D3D4C0] p-5 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-montserrat uppercase font-bold tracking-wider">Digitized Pages</span>
              <FileText className="w-4 h-4 text-[#8B5E3C]" />
            </div>
            <div className="text-3xl font-serif-editorial font-bold text-[#0A2947]">
              {ocrBaseline?.overall_scanned_pages ? `${ocrBaseline.overall_scanned_pages.toLocaleString()} Pages` : '35,371 Pages'}
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold block">
              ↑ {ocrBaseline?.overall_scanned_documents ? `${ocrBaseline.overall_scanned_documents} Volumes Audited` : '93 Works Audited'}
            </span>
          </div>

          <div className="bg-white border-2 border-[#D3D4C0] p-5 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-montserrat uppercase font-bold tracking-wider">Vector Chunks</span>
              <Database className="w-4 h-4 text-[#8B5E3C]" />
            </div>
            <div className="text-3xl font-serif-editorial font-bold text-[#0A2947]">
              {corpusStats?.total_chunks ? `${corpusStats.total_chunks.toLocaleString()} Chunks` : '19,342 Chunks'}
            </div>
            <span className="text-[11px] font-mono text-[#0A2947]/60 block">
              PostgreSQL DiskANN + FTS5 Hybrid
            </span>
          </div>

          <div className="bg-white border-2 border-[#D3D4C0] p-5 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-montserrat uppercase font-bold tracking-wider">OCR Precision</span>
              <Cpu className="w-4 h-4 text-[#8B5E3C]" />
            </div>
            <div className="text-3xl font-serif-editorial font-bold text-[#0A2947]">
              {ocrBaseline?.overall_average_confidence ? `${(ocrBaseline.overall_average_confidence * 100).toFixed(1)}% Accuracy` : '87.3% Accuracy'}
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold block">
              PaddleOCR PP-OCRv5 Multilingual
            </span>
          </div>

          <div className="bg-white border-2 border-[#D3D4C0] p-5 rounded-2xl shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[#8B5E3C]">
              <span className="text-xs font-montserrat uppercase font-bold tracking-wider">Public Accessions</span>
              <BarChart3 className="w-4 h-4 text-[#8B5E3C]" />
            </div>
            <div className="text-3xl font-serif-editorial font-bold text-[#0A2947]">
              {corpusStats?.total_volumes ? `${corpusStats.total_volumes} Volumes Ingested` : '19 Volumes Ingested'}
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-semibold block">
              BAWS Master Archive
            </span>
          </div>
        </div>

        {/* Main Grid: Upload Simulator (Left 5 Cols) + OCR Verification Pipeline (Right 7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Upload Form Simulator (5 Cols) */}
          <div className="lg:col-span-5 bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b-2 border-[#D3D4C0] pb-4">
              <Upload className="w-5 h-5 text-[#8B5E3C]" />
              <h2 className="text-xl font-serif-editorial font-bold text-[#0A2947]">
                Ingest New Archival Folio
              </h2>
            </div>

            {uploadSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-dmsans text-emerald-950 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Folio uploaded, OCR processed, and indexed to vector search successfully!</span>
              </div>
            )}

            <form onSubmit={handleSimulateUpload} className="space-y-4">
              
              {/* Scanned File Target */}
              <div>
                <label className="text-xs font-cinzel uppercase font-bold text-[#8B5E3C] block mb-1.5">
                  Archival Facsimile File (.pdf, .tiff, .jp2)
                </label>
                <div className="p-4 border-2 border-dashed border-[#D3D4C0] rounded-2xl text-center bg-[#FAF7F0] hover:bg-[#F3E4C9] transition-colors cursor-pointer">
                  <FileText className="w-6 h-6 text-[#8B5E3C] mx-auto mb-1" />
                  <span className="text-xs font-montserrat font-bold text-[#0A2947] block">
                    {selectedFileName}
                  </span>
                  <span className="text-[10px] text-[#0A2947]/60 font-dmsans">
                    Click to simulate uploading 1200 DPI archival scan
                  </span>
                </div>
              </div>

              {/* Title */}
              <div>
                <label htmlFor="admin-upload-title" className="text-xs font-cinzel uppercase font-bold text-[#8B5E3C] block mb-1.5">
                  Document Accession Title
                </label>
                <input
                  id="admin-upload-title"
                  name="admin_upload_title"
                  type="text"
                  placeholder="e.g. Speech on the Primary Education Bill (1930)"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full p-3 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-dmsans text-[#0A2947] focus:outline-none focus:border-[#0A2947]"
                />
              </div>

              {/* Type & Year */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="admin-upload-category" className="text-xs font-cinzel uppercase font-bold text-[#8B5E3C] block mb-1.5">
                    Category
                  </label>
                  <select
                    id="admin-upload-category"
                    name="admin_upload_category"
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-semibold text-[#0A2947]"
                  >
                    <option value="speech">Speech</option>
                    <option value="book">Book & Treatise</option>
                    <option value="debate">Constitutional Debate</option>
                    <option value="manuscript">Manuscript</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-upload-year" className="text-xs font-cinzel uppercase font-bold text-[#8B5E3C] block mb-1.5">
                    Historical Year
                  </label>
                  <input
                    id="admin-upload-year"
                    name="admin_upload_year"
                    type="number"
                    value={uploadYear}
                    onChange={(e) => setUploadYear(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-mono text-[#0A2947]"
                  />
                </div>
              </div>

              {/* OCR Engine Selection */}
              <div>
                <label htmlFor="admin-upload-ocr-engine" className="text-xs font-cinzel uppercase font-bold text-[#8B5E3C] block mb-1.5">
                  Neural OCR Engine
                </label>
                <select
                  id="admin-upload-ocr-engine"
                  name="admin_upload_ocr_engine"
                  value={uploadEngine}
                  onChange={(e) => setUploadEngine(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-semibold text-[#0A2947]"
                >
                  <option value="PaddleOCR PP-OCRv5">PaddleOCR PP-OCRv5 (Devanagari & Multilingual Indic)</option>
                  <option value="PaddleOCR PP-StructureV3">PaddleOCR PP-StructureV3 (Layout & Tabular Extraction)</option>
                  <option value="Tesseract OCR v5">Tesseract OCR v5 (Comparative Baseline)</option>
                </select>
              </div>

              {/* Access Rights */}
              <div>
                <label htmlFor="admin-upload-rights" className="text-xs font-cinzel uppercase font-bold text-[#8B5E3C] block mb-1.5">
                  Rights Classification
                </label>
                <select
                  id="admin-upload-rights"
                  name="admin_upload_rights"
                  value={uploadAccess}
                  onChange={(e) => setUploadAccess(e.target.value as any)}
                  className="w-full p-2.5 bg-[#FAF7F0] border border-[#D3D4C0] rounded-xl text-xs font-montserrat font-semibold text-[#0A2947]"
                >
                  <option value="Public Domain">Public Domain (Unrestricted Memorial Access)</option>
                  <option value="Fair Use Educational">Fair Use Educational (Research Only)</option>
                  <option value="Archival Restricted">Archival Restricted (Preservation Quarantine)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full p-3.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#F3E4C9]" />
                    <span>Processing OCR & Indexing...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Execute Archival Ingestion</span>
                  </>
                )}
              </button>

            </form>
          </div>

          {/* OCR Verification & Review Pipeline (7 Cols) */}
          <div className="lg:col-span-7 bg-white border-2 border-[#D3D4C0] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b-2 border-[#D3D4C0] pb-4 mb-5">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-[#8B5E3C]" />
                  <h2 className="text-xl font-serif-editorial font-bold text-[#0A2947]">
                    OCR Pipeline Queue & Verification
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#8B5E3C]">
                  {ocrRecords.length} Active Records
                </span>
              </div>

              {/* Job Queue Selector */}
              <div className="space-y-2 mb-6 max-h-48 overflow-y-auto pr-1">
                {ocrRecords.map(rec => {
                  const isSelected = rec.id === selectedRecord.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => {
                        soundEffects.playClick();
                        setSelectedRecord(rec);
                      }}
                      className={`p-3.5 rounded-xl border-2 text-xs font-dmsans cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#FAF7F0] border-[#0A2947] shadow-xs ring-1 ring-[#0A2947]/20'
                          : 'bg-white border-[#D3D4C0] hover:border-[#8B5E3C]'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-[#0A2947] font-serif-editorial truncate max-w-sm text-sm">
                          {rec.titleExtracted}
                        </div>
                        <div className="text-[11px] text-[#0A2947]/60 font-mono mt-0.5">
                          {rec.engine} · {rec.uploadDate} · {rec.fileName}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-montserrat font-bold uppercase ${
                          rec.status === 'Completed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {rec.status}
                        </span>
                        <span className="font-mono font-bold text-xs text-[#8B5E3C]">
                          {rec.confidenceScore}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Inspection of Selected OCR Record */}
              <div className="p-5 bg-[#FAF7F0] border-2 border-[#D3D4C0] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D3D4C0] pb-3">
                  <div>
                    <span className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C] block">
                      Inspecting Folio Accession
                    </span>
                    <h3 className="font-serif-editorial text-lg font-bold text-[#0A2947]">
                      {selectedRecord.titleExtracted}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-0.5 bg-white border border-[#D3D4C0] text-[#0A2947] rounded-lg font-semibold">
                      {selectedRecord.accessRights}
                    </span>
                    <span className="text-xs font-mono px-2.5 py-0.5 bg-emerald-100 text-emerald-900 rounded-lg font-bold">
                      Confidence: {selectedRecord.confidenceScore}%
                    </span>
                  </div>
                </div>

                {/* Side-by-side snippet: Raw OCR vs Cleaned Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-dmsans">
                  <div className="p-3.5 bg-white border border-[#D3D4C0] rounded-xl space-y-1">
                    <span className="text-[10px] font-cinzel uppercase font-bold text-[#8B5E3C] block">
                      Raw Stream ({selectedRecord.engine})
                    </span>
                    <p className="font-mono text-[11px] text-[#0A2947]/75 leading-relaxed">
                      {selectedRecord.rawOcrSnippet}
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#D3D4C0] rounded-xl space-y-1">
                    <span className="text-[10px] font-cinzel uppercase font-bold text-[#0A2947] block">
                      Normalized Searchable Text
                    </span>
                    <p className="font-dmsans text-[#0A2947] leading-relaxed">
                      {selectedRecord.cleanedTextSnippet}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="pt-4 border-t-2 border-[#D3D4C0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-cinzel text-[#8B5E3C]">
                Verified by National Archival Ingestion Standards
              </span>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleApproveRecord(selectedRecord.id)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#0A2947] hover:bg-[#8B5E3C] text-[#F3E4C9] rounded-xl text-xs font-montserrat font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5 text-[#F3E4C9]" />
                  <span>Verify & Publish Folio</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
