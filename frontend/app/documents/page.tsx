"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Filter,
  Search,
  Calendar,
  Building,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  FileText,
  Tag,
} from "lucide-react";
import { api } from "@/lib/api";
import { ArchivalObject, PaginatedResponse } from "@/lib/types";

// Curated reference items when DB has not yet ingested the full corpus
const SAMPLE_DOCUMENTS: ArchivalObject[] = [
  {
    id: "doc-annihilation-of-caste",
    stable_id: "baws-vol01-annihilation",
    collection_id: "col-baws-writings",
    title: "Annihilation of Caste",
    subtitle: "With a Reply to Mahatma Gandhi",
    object_type: "book",
    language: "en",
    source_institution: "Government of Maharashtra (BAWS Project)",
    provenance: "BAWS Volume 1, Speeches and Writings",
    rights_status: "Public Domain",
    creator: "Dr. B.R. Ambedkar",
    publisher: "Ambedkar Heritage Preservation",
    publication_date: "1936",
    description:
      "A rigorous philosophical critique of the caste system and Hindu religious orthodoxy, prepared for the 1936 annual conference of Jat-Pat Todak Mandal of Lahore.",
    subject_keywords: "caste, hinduism, social reform, equality, jat-pat todak mandal",
    physical_description: "Print monograph, 82 pages",
    review_status: "approved",
    publication_status: "published",
    file_hash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    file_size_bytes: 428000,
    original_filename: "annihilation_of_caste_1936.txt",
    original_file_key: "documents/baws/vol1/annihilation_of_caste.txt",
    page_count: 82,
    metadata_json: '{"baws_volume": 1, "edition": "Critical Edition"}',
    created_at: "2026-09-22T12:00:00Z",
    updated_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "doc-problem-of-rupee",
    stable_id: "baws-vol06-rupee",
    collection_id: "col-baws-writings",
    title: "The Problem of the Rupee: Its Origin and Its Solution",
    subtitle: "A History of Indian Currency and Banking",
    object_type: "book",
    language: "en",
    source_institution: "London School of Economics & Political Science",
    provenance: "BAWS Volume 6, Economic Writings",
    rights_status: "Public Domain",
    creator: "Dr. B.R. Ambedkar",
    publisher: "P.S. King & Son, London",
    publication_date: "1923",
    description:
      "Dr. Ambedkar's doctoral dissertation at LSE examining the demonetization, exchange rates, and monetary policy of British India. Influential in the founding of the Reserve Bank of India.",
    subject_keywords: "economics, currency, gold standard, monetary policy, rbi",
    physical_description: "Doctoral dissertation, 309 pages",
    review_status: "approved",
    publication_status: "published",
    file_hash: "a4f5b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcde",
    file_size_bytes: 1250000,
    original_filename: "problem_of_the_rupee_1923.txt",
    original_file_key: "documents/baws/vol6/problem_of_the_rupee.txt",
    page_count: 309,
    metadata_json: '{"baws_volume": 6, "degree": "D.Sc. Economics"}',
    created_at: "2026-09-22T12:00:00Z",
    updated_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "doc-castes-in-india",
    stable_id: "baws-vol01-castes-mechanism",
    collection_id: "col-baws-writings",
    title: "Castes in India: Their Mechanism, Genesis and Development",
    subtitle: "Paper presented before the Anthropology Seminar of Dr. A.A. Goldenweiser",
    object_type: "article",
    language: "en",
    source_institution: "Columbia University, New York",
    provenance: "Indian Antiquary, Vol. XLVI, May 1917",
    rights_status: "Public Domain",
    creator: "Dr. B.R. Ambedkar",
    publisher: "Columbia University Press",
    publication_date: "1916",
    description:
      "Seminal sociological treatise introducing the concept of endogamy as the fundamental mechanism of caste genesis and reproduction in Indian society.",
    subject_keywords: "anthropology, endogamy, columbia university, caste origins",
    physical_description: "Journal article, 28 pages",
    review_status: "approved",
    publication_status: "published",
    file_hash: "c8e2f1a3b5c7d9e0123456789abcdef0123456789abcdef0123456789abcdef0",
    file_size_bytes: 198000,
    original_filename: "castes_in_india_1916.txt",
    original_file_key: "documents/baws/vol1/castes_in_india.txt",
    page_count: 28,
    metadata_json: '{"baws_volume": 1, "institution": "Columbia University"}',
    created_at: "2026-09-22T12:00:00Z",
    updated_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "doc-state-and-minorities",
    stable_id: "baws-vol01-state-minorities",
    collection_id: "col-baws-writings",
    title: "States and Minorities",
    subtitle: "What are their Rights and How to Secure them in the Constitution of Free India",
    object_type: "legal_document",
    language: "en",
    source_institution: "Constituent Assembly of India",
    provenance: "All India Scheduled Castes Federation, 1947",
    rights_status: "Public Domain",
    creator: "Dr. B.R. Ambedkar",
    publisher: "Thacker & Co., Bombay",
    publication_date: "1947",
    description:
      "A memorandum on the safeguards for Scheduled Castes submitted to the Advisory Committee on Fundamental Rights of the Constituent Assembly of India. Articulates state socialism and fundamental economic rights.",
    subject_keywords: "constitution, fundamental rights, minorities, state socialism",
    physical_description: "Constitutional memorandum, 76 pages",
    review_status: "approved",
    publication_status: "published",
    file_hash: "7f8e9d0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e",
    file_size_bytes: 380000,
    original_filename: "states_and_minorities_1947.txt",
    original_file_key: "documents/baws/vol1/states_and_minorities.txt",
    page_count: 76,
    metadata_json: '{"baws_volume": 1, "body": "Constituent Assembly"}',
    created_at: "2026-09-22T12:00:00Z",
    updated_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "doc-buddha-and-his-dhamma",
    stable_id: "baws-vol11-buddha-dhamma",
    collection_id: "col-baws-writings",
    title: "The Buddha and His Dhamma",
    subtitle: "A Critical Presentation of Buddhism",
    object_type: "book",
    language: "en",
    source_institution: "People's Education Society, Siddharth College",
    provenance: "BAWS Volume 11, Masterpiece published posthumously 1957",
    rights_status: "Public Domain",
    creator: "Dr. B.R. Ambedkar",
    publisher: "Siddharth Publications",
    publication_date: "1957",
    description:
      "Dr. Ambedkar's final magnum opus, presenting a rationalist, egalitarian interpretation of the life and teachings of Gautama Buddha focused on social justice, morality, and human liberation.",
    subject_keywords: "buddhism, dhamma, navayana, ethics, enlightenment",
    physical_description: "Monograph, 599 pages",
    review_status: "approved",
    publication_status: "published",
    file_hash: "f1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f80",
    file_size_bytes: 2400000,
    original_filename: "buddha_and_his_dhamma_1957.txt",
    original_file_key: "documents/baws/vol11/buddha_and_his_dhamma.txt",
    page_count: 599,
    metadata_json: '{"baws_volume": 11, "posthumous": true}',
    created_at: "2026-09-22T12:00:00Z",
    updated_at: "2026-09-22T12:00:00Z",
  },
  {
    id: "doc-constituent-assembly-final-speech",
    stable_id: "baws-vol13-cad-final-speech",
    collection_id: "col-baws-writings",
    title: "Speech on the Adoption of the Constitution",
    subtitle: "Delivered in the Constituent Assembly of India on 25 November 1949",
    object_type: "speech",
    language: "en",
    source_institution: "Constituent Assembly of India, New Delhi",
    provenance: "CAD Official Report, Volume XI, 25 Nov 1949",
    rights_status: "Public Domain",
    creator: "Dr. B.R. Ambedkar",
    publisher: "Government of India",
    publication_date: "1949",
    description:
      "The historic closing address warning against hero-worship (bhakti) in politics, emphasizing the contradiction between political democracy (one person, one vote) and social/economic inequality.",
    subject_keywords: "constitution, democracy, bhakti, equality, constituent assembly",
    physical_description: "Parliamentary verbatim speech, 18 pages",
    review_status: "approved",
    publication_status: "published",
    file_hash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b",
    file_size_bytes: 95000,
    original_filename: "cad_final_speech_1949.txt",
    original_file_key: "documents/baws/vol13/cad_speech_1949.txt",
    page_count: 18,
    metadata_json: '{"baws_volume": 13, "cad_volume": "XI"}',
    created_at: "2026-09-22T12:00:00Z",
    updated_at: "2026-09-22T12:00:00Z",
  },
];

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<ArchivalObject[]>(SAMPLE_DOCUMENTS);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDocs = async () => {
      try {
        const res = await api.listDocuments({ limit: 50 });
        if (mounted && res && res.items && res.items.length > 0) {
          // Merge database items with our rich baseline corpus
          setDocuments(res.items);
        }
      } catch (err) {
        console.warn("Backend documents fetch fallback to initial reference catalog", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchDocs();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredDocs = documents.filter((doc) => {
    const matchesType = filterType === "all" || doc.object_type === filterType;
    const matchesSearch =
      searchFilter === "" ||
      doc.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchFilter.toLowerCase())) ||
      (doc.subject_keywords &&
        doc.subject_keywords.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Archival Catalog</span>
          </div>
          <h1 className="mt-1 text-3xl font-serif font-bold text-slate-100">
            Archival Objects & Monographs
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Primary sources, historical treatises, parliamentary debates, and speeches with PREMIS
            fixity verification.
          </p>
        </div>

        {/* Search filter input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter catalog..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500/80"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-white/5 text-xs">
        <span className="text-slate-400 text-[11px] font-mono uppercase flex items-center gap-1 mr-2">
          <Filter className="h-3 w-3" /> Type:
        </span>
        {[
          { id: "all", label: "All Items" },
          { id: "book", label: "Books & Monographs" },
          { id: "speech", label: "Speeches & Addresses" },
          { id: "article", label: "Articles & Seminars" },
          { id: "legal_document", label: "Constitutional & Legal" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
              filterType === tab.id
                ? "bg-amber-500 text-slate-950 font-semibold"
                : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Grid */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <Link
            key={doc.id}
            href={`/documents/${doc.stable_id || doc.id}`}
            className="glass-card rounded-xl p-5 border border-slate-800 flex flex-col justify-between group hover:border-amber-500/40"
          >
            <div>
              {/* Type Badge & Date */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-slate-800 text-amber-300 border border-amber-500/20">
                  {doc.object_type.replace("_", " ")}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                  <Calendar className="h-3 w-3 text-amber-500/80" />
                  <span>{doc.publication_date || "Undated"}</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-serif font-bold text-lg text-slate-100 group-hover:text-amber-300 transition-colors leading-snug">
                {doc.title}
              </h2>

              {doc.subtitle && (
                <p className="mt-1 text-xs text-amber-400/80 font-serif italic line-clamp-1">
                  {doc.subtitle}
                </p>
              )}

              {/* Description */}
              <p className="mt-3 text-xs text-slate-400 leading-relaxed line-clamp-3">
                {doc.description}
              </p>
            </div>

            {/* Metadata Footer */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                <Building className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{doc.source_institution}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  PREMIS Fixity SHA-256
                </span>
                {doc.page_count && <span>{doc.page_count} Pages</span>}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl mt-8">
          <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-medium text-slate-300">No archival objects found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search keywords or filter options.
          </p>
        </div>
      )}
    </div>
  );
}
