"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  BookOpen,
  Scale,
  Award,
  Users,
  Flag,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface TimelineEvent {
  year: string;
  exactDate?: string;
  title: string;
  category: "education" | "movement" | "politics" | "constitution" | "dhamma";
  description: string;
  archivalCitation?: string;
  linkedDocId?: string;
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: "1891",
    exactDate: "14 April 1891",
    title: "Birth at Mhow",
    category: "education",
    description:
      "Bhimrao Ramji Ambedkar was born in the military cantonment town of Mhow (now Dr. Ambedkar Nagar, Madhya Pradesh) into a Mahar family.",
  },
  {
    year: "1913–1916",
    exactDate: "June 1913 – June 1916",
    title: "Columbia University, New York",
    category: "education",
    description:
      "Studied economics, sociology, and political science under John Dewey, Edwin Seligman, and Alexander Goldenweiser. Presented his landmark paper 'Castes in India: Their Mechanism, Genesis and Development'.",
    archivalCitation: "BAWS Vol. 1",
    linkedDocId: "baws-vol01-castes-mechanism",
  },
  {
    year: "1916–1923",
    exactDate: "1916 – 1923",
    title: "London School of Economics & Gray's Inn",
    category: "education",
    description:
      "Admitted to Gray's Inn to read for the Bar and enrolled at the London School of Economics. Completed his thesis 'The Problem of the Rupee: Its Origin and Its Solution' earning the prestigious D.Sc. in Economics.",
    archivalCitation: "BAWS Vol. 6",
    linkedDocId: "baws-vol06-rupee",
  },
  {
    year: "1920",
    exactDate: "31 January 1920",
    title: "Launch of Mooknayak",
    category: "movement",
    description:
      "Started the fortnightly Marathi newspaper 'Mooknayak' (Leader of the Silent) to champion the civil rights and social awakening of the oppressed classes.",
    archivalCitation: "BAWS Vol. 19",
  },
  {
    year: "1924",
    exactDate: "20 July 1924",
    title: "Founding of Bahishkrit Hitakarini Sabha",
    category: "movement",
    description:
      "Established the Bahishkrit Hitakarini Sabha in Bombay with the timeless motto: 'Educate, Agitate, Organise' to promote social and political equality.",
  },
  {
    year: "1927",
    exactDate: "20 March 1927",
    title: "Mahad Satyagraha",
    category: "movement",
    description:
      "Led thousands of people to the Chhadar Tank in Mahad to assert their right to drink water from the public reservoir. On 25 December 1927, publicly burned the Manusmriti as a rejection of institutional inequality.",
    archivalCitation: "BAWS Vol. 17",
  },
  {
    year: "1930–1932",
    exactDate: "1930 – 1932",
    title: "Round Table Conferences in London",
    category: "politics",
    description:
      "Represented the Depressed Classes at all three Round Table Conferences in London, arguing fearlessly for constitutional safeguards, universal adult franchise, and separate electorates.",
    archivalCitation: "BAWS Vol. 2",
  },
  {
    year: "1932",
    exactDate: "24 September 1932",
    title: "The Poona Pact",
    category: "politics",
    description:
      "Signed the historic agreement with caste Hindu representatives following Gandhi's fast unto death at Yerwada Jail, securing reserved seats in provincial legislatures for the Depressed Classes.",
    archivalCitation: "BAWS Vol. 9",
  },
  {
    year: "1936",
    exactDate: "May 1936",
    title: "Publication of 'Annihilation of Caste'",
    category: "education",
    description:
      "Published his most famous monograph after the Jat-Pat Todak Mandal cancelled his presidential address in Lahore due to its radical content challenging the authority of the Shastras.",
    archivalCitation: "BAWS Vol. 1, p. 23-96",
    linkedDocId: "baws-vol01-annihilation",
  },
  {
    year: "1942–1946",
    exactDate: "July 1942 – June 1946",
    title: "Member for Labour, Viceroy's Executive Council",
    category: "politics",
    description:
      "Introduced transformative labour legislation in India: established the 8-hour workday, maternity benefits, Employees' State Insurance, and the Central Waterways, Irrigation and Navigation Commission (CWINC).",
    archivalCitation: "BAWS Vol. 10",
  },
  {
    year: "1947",
    exactDate: "29 August 1947",
    title: "Chairman of the Constitution Drafting Committee",
    category: "constitution",
    description:
      "Appointed first Law Minister of independent India and elected Chairman of the Drafting Committee to frame the Constitution of India.",
    archivalCitation: "BAWS Vol. 13",
  },
  {
    year: "1949",
    exactDate: "25 November 1949",
    title: "Adoption of the Constitution of India",
    category: "constitution",
    description:
      "Delivered his monumental final address to the Constituent Assembly, warning against political 'bhakti' and urging India to eliminate social and economic inequality to protect democracy.",
    archivalCitation: "CAD Vol. XI, 25 Nov 1949",
    linkedDocId: "baws-vol13-cad-final-speech",
  },
  {
    year: "1951",
    exactDate: "September 1951",
    title: "Resignation over the Hindu Code Bill",
    category: "politics",
    description:
      "Resigned from the Union Cabinet after parliamentary delays on the Hindu Code Bill, which sought to codify women's rights to inheritance, marriage, and divorce.",
    archivalCitation: "BAWS Vol. 14",
  },
  {
    year: "1956",
    exactDate: "14 October 1956",
    title: "Historic Deeksha at Nagpur",
    category: "dhamma",
    description:
      "Along with his wife Dr. Savita Ambedkar and approximately 500,000 followers, formally embraced Buddhism at Deekshabhoomi, Nagpur, administering the 22 vows.",
    archivalCitation: "BAWS Vol. 17 (Part 3)",
  },
  {
    year: "1956",
    exactDate: "6 December 1956",
    title: "Mahaparinirvan",
    category: "dhamma",
    description:
      "Passed away peacefully at his residence at 26 Alipur Road, New Delhi. His final monumental work, 'The Buddha and His Dhamma', was published posthumously in 1957.",
    archivalCitation: "BAWS Vol. 11",
    linkedDocId: "baws-vol11-buddha-dhamma",
  },
];

export default function TimelinePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredEvents = TIMELINE_EVENTS.filter((evt) => {
    if (selectedCategory === "all") return true;
    return evt.category === selectedCategory;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 mb-3">
          <Calendar className="h-3.5 w-3.5" />
          <span>Historical Chronology 1891–1956</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-100">
          Biographical & Archival Timeline
        </h1>
        <p className="mt-2 text-sm text-slate-400 max-w-xl mx-auto">
          Trace Dr. Ambedkar&apos;s transformative life, scholarly publications, civil rights
          movements, and constitutional drafting through linked primary records.
        </p>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center justify-center gap-2 flex-wrap pb-8 border-b border-white/10 text-xs">
        {[
          { id: "all", label: "All Milestones" },
          { id: "education", label: "Scholarship & Degrees" },
          { id: "movement", label: "Civil Rights & Satyagraha" },
          { id: "constitution", label: "Constitutional Drafting" },
          { id: "politics", label: "Governance & Labour" },
          { id: "dhamma", label: "Philosophy & Dhamma" },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setSelectedCategory(btn.id)}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all ${
              selectedCategory === btn.id
                ? "bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20"
                : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Timeline Stream */}
      <div className="relative mt-10 pl-6 md:pl-10 border-l border-amber-500/30 space-y-10">
        {filteredEvents.map((evt, idx) => (
          <div key={idx} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] md:-left-[47px] top-1.5 h-4 w-4 rounded-full bg-slate-950 border-2 border-amber-500 group-hover:scale-125 group-hover:bg-amber-500 transition-all shadow-[0_0_10px_rgba(245,158,11,0.5)]" />

            <div className="glass-card rounded-xl p-5 border border-slate-800 hover:border-amber-500/40 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-2">
                <span className="text-amber-400 font-mono font-bold text-sm">{evt.year}</span>
                {evt.exactDate && (
                  <span className="text-slate-400 font-mono text-[11px]">{evt.exactDate}</span>
                )}
              </div>

              <h3 className="text-lg font-serif font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                {evt.title}
              </h3>

              <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
                {evt.description}
              </p>

              {(evt.archivalCitation || evt.linkedDocId) && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {evt.archivalCitation && (
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <BookOpen className="h-3 w-3 text-amber-400" />
                      Archival Record: {evt.archivalCitation}
                    </span>
                  )}

                  {evt.linkedDocId && (
                    <Link
                      href={`/documents/${evt.linkedDocId}`}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold text-xs ml-auto"
                    >
                      <span>Read Document</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
