import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  X,
  Download,
  ScrollText,
  BookOpen,
  Minus,
  Plus,
  AlignJustify,
  ChevronLeft,
  ChevronRight,
  Languages,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Quiet Library — Booklets by Maulana Syed Imon Rizvi" },
      {
        name: "description",
        content:
          "A curated digital library of religious, social, and ethical booklets. Read in a calm, distraction-free space.",
      },
      { property: "og:title", content: "The Quiet Library" },
      {
        property: "og:description",
        content: "A curated digital library of religious, social, and ethical booklets.",
      },
    ],
  }),
  component: Index,
});

type Language = "en" | "ur" | "ar" | "de" | "fa" | "fr" | "tr";

const LANGUAGES: { code: Language; label: string; dir: "ltr" | "rtl" }[] = [
  { code: "en", label: "English", dir: "ltr" },
  { code: "ur", label: "اردو", dir: "rtl" },
  { code: "ar", label: "العربية", dir: "rtl" },
  { code: "de", label: "Deutsch", dir: "ltr" },
  { code: "fa", label: "فارسی", dir: "rtl" },
  { code: "fr", label: "Français", dir: "ltr" },
  { code: "tr", label: "Türkçe", dir: "ltr" },
];

const LANGUAGE_MAP: Record<string, (typeof LANGUAGES)[number]> = {};
for (const lang of LANGUAGES) {
  LANGUAGE_MAP[lang.code] = lang;
}

type Booklet = {
  id: string;
  title: string;
  category: "Religious" | "Social" | "Ethical";
  description: string;
  author: string;
  readMinutes?: number;
  language: Language;
  languageLabel: string;
  sections?: { heading: string; paragraphs: string[] }[];
  pdfUrl?: string;
};

const INLINE_BOOKLETS: Booklet[] = [];

const CATEGORIES = ["All", "Religious", "Social", "Ethical"] as const;
type Category = (typeof CATEGORIES)[number];

type ManifestEntry = {
  id: string;
  title: string;
  category: string;
  description: string;
  author: string;
  variants: Record<string, { language: string; pdfUrl?: string }>;
};

function Index() {
  const [category, setCategory] = useState<Category>("All");
  const [language, setLanguage] = useState<"all" | Language>("all");
  const [active, setActive] = useState<Booklet | null>(null);
  const [activePdf, setActivePdf] = useState<string | null>(null);
  const [booklets, setBooklets] = useState<Booklet[]>(INLINE_BOOKLETS);

  useEffect(() => {
    fetch("/sacred-pages/booklets/manifest.json")
      .then((r) => (r.ok ? r.json() : null))
      .then(async (manifest: { booklets: ManifestEntry[] } | null) => {
        if (!manifest?.booklets) return;
        const loaded: Booklet[] = [];
        for (const entry of manifest.booklets) {
          for (const [, variant] of Object.entries(entry.variants)) {
            const langInfo = LANGUAGE_MAP[variant.language] ?? {
              code: variant.language,
              label: variant.language.toUpperCase(),
              dir: "ltr",
            };
            loaded.push({
              id: entry.id,
              title: entry.title,
              category: entry.category as Booklet["category"],
              description: entry.description,
              author: entry.author,
              language: variant.language as Language,
              languageLabel: langInfo.label,
              pdfUrl: variant.pdfUrl,
            });
          }
        }
        if (loaded.length > 0) setBooklets([...INLINE_BOOKLETS, ...loaded]);
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    let result = booklets;
    if (category !== "All") {
      result = result.filter((b) => b.category === category);
    }
    if (language !== "all") {
      result = result.filter((b) => b.language === language);
    }
    return result;
  }, [category, language, booklets]);

  const groupedByOriginal = useMemo(() => {
    const groups: Record<string, Booklet[]> = {};
    for (const b of filtered) {
      if (!groups[b.id]) groups[b.id] = [];
      groups[b.id].push(b);
    }
    return groups;
  }, [filtered]);

  const availableLanguages = useMemo(() => {
    const codes = new Set<Language>();
    for (const b of booklets) codes.add(b.language);
    return LANGUAGES.filter((l) => codes.has(l.code));
  }, [booklets]);

  const handleOpenBooklet = (booklet: Booklet) => {
    if (booklet.sections) {
      setActive(booklet);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#111111]">
      <nav className="fixed top-0 inset-x-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 h-14 flex items-center justify-between">
          <a href="#top" className="font-serif text-lg tracking-tight">
            M. S. Imon Rizvi
          </a>
          <div className="flex items-center gap-8 text-sm text-[#111111]/80">
            <a href="#booklets" className="hover:text-[#111111] transition-colors">
              Booklets
            </a>
            <a href="#about" className="hover:text-[#111111] transition-colors">
              About
            </a>
          </div>
        </div>
      </nav>

      <main id="top" className="pt-14">
        <section className="max-w-3xl mx-auto px-6 sm:px-10 pt-24 sm:pt-32 pb-16 sm:pb-24">
          <p className="text-xs uppercase tracking-[0.2em] text-[#111111]/50 mb-6">
            A quiet library
          </p>
          <h1 className="font-serif text-4xl sm:text-6xl leading-[1.05] tracking-tight">
            Booklets on belief, society, and the moral life.
          </h1>
          <p className="mt-6 text-base sm:text-lg text-[#111111]/70 leading-relaxed max-w-xl">
            Short essays meant to be read slowly. No ads, no accounts, no distractions — only the
            page in front of you.
          </p>
        </section>

        <section
          id="booklets"
          className="max-w-6xl mx-auto px-6 sm:px-10 border-t border-[#E5E5E5] pt-10"
        >
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
            {CATEGORIES.map((c) => {
              const isActive = c === category;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`relative pb-1 transition-colors ${
                    isActive ? "text-[#111111]" : "text-[#111111]/50 hover:text-[#111111]"
                  }`}
                >
                  {c}
                  <span
                    className={`absolute left-0 right-0 -bottom-px h-px bg-[#111111] origin-left transition-transform duration-300 ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}

            <span className="w-px h-5 bg-[#E5E5E5]" />

            <div className="flex items-center gap-3">
              <Languages size={14} className="text-[#111111]/40" />
              <button
                onClick={() => setLanguage("all")}
                className={`relative pb-1 transition-colors ${
                  language === "all" ? "text-[#111111]" : "text-[#111111]/50 hover:text-[#111111]"
                }`}
              >
                All Languages
                {language === "all" && (
                  <span className="absolute left-0 right-0 -bottom-px h-px bg-[#111111] scale-x-100" />
                )}
              </button>
              {availableLanguages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`relative pb-1 transition-colors ${
                    language === l.code
                      ? "text-[#111111]"
                      : "text-[#111111]/50 hover:text-[#111111]"
                  }`}
                >
                  {l.label}
                  {language === l.code && (
                    <span className="absolute left-0 right-0 -bottom-px h-px bg-[#111111] scale-x-100" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#E5E5E5] mt-10 border border-[#E5E5E5]">
            {Object.entries(groupedByOriginal).flatMap(([id, variants]) =>
              variants.map((b) => (
                <article
                  key={`${b.id}-${b.language}`}
                  className="bg-white p-8 sm:p-10 flex flex-col min-h-[280px] group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#111111]/50">
                      {b.category}
                    </span>
                    {variants.length > 1 && (
                      <div className="flex gap-1.5 shrink-0">
                        {variants.map((v) => (
                          <span
                            key={v.language}
                            className={`inline-block text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                              v.language === b.language
                                ? "bg-[#111111] text-white border-[#111111]"
                                : "bg-white text-[#111111]/40 border-[#E5E5E5]"
                            }`}
                          >
                            {LANGUAGE_MAP[v.language]?.label.slice(0, 3) ?? v.language}
                          </span>
                        ))}
                      </div>
                    )}
                    {variants.length <= 1 && (
                      <span className="text-[10px] uppercase tracking-wide text-[#111111]/30 px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                        {b.languageLabel === "English" ? "EN" : b.language.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif text-2xl sm:text-3xl mt-4 leading-tight">{b.title}</h3>
                  <p className="mt-4 text-sm text-[#111111]/70 leading-relaxed flex-1">
                    {b.description}
                  </p>
                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-xs text-[#111111]/40">
                      {b.languageLabel}
                      {b.readMinutes ? ` · ${b.readMinutes} min read` : ""}
                    </span>
                    {b.pdfUrl ? (
                      <button
                        onClick={() => setActivePdf(b.pdfUrl!)}
                        className="flex items-center gap-1.5 text-sm border-b border-[#111111] pb-0.5 hover:opacity-60 transition-opacity"
                      >
                        Read booklet →
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenBooklet(b)}
                        className="flex items-center gap-1.5 text-sm border-b border-[#111111] pb-0.5 hover:opacity-60 transition-opacity"
                      >
                        Read booklet →
                      </button>
                    )}
                  </div>
                </article>
              )),
            )}
            {Object.keys(groupedByOriginal).length === 0 && (
              <div className="bg-white p-8 sm:p-10 col-span-full text-center text-sm text-[#111111]/50">
                No booklets found for this filter.
              </div>
            )}
          </div>
        </section>

        <section
          id="about"
          className="max-w-3xl mx-auto px-6 sm:px-10 pt-32 pb-32 border-t border-[#E5E5E5] mt-32"
        >
          <p className="text-xs uppercase tracking-[0.2em] text-[#111111]/50 mb-6">About</p>
          <h2 className="font-serif text-3xl sm:text-4xl tracking-tight leading-tight">
            Writing for readers, not algorithms.
          </h2>
          <div className="mt-8 space-y-5 text-[#111111]/75 leading-relaxed text-[15px]">
            <p>
              Maulana Syed Imon Rizvi is a religious scholar and agile leader — holding an MBA
              alongside PMP, PSM I/II, and PAL I certifications. His work bridges spiritual depth
              with disciplined practice. These booklets began as letters to friends and students;
              they are published here in the same spirit — personal, unhurried, and meant to be
              read more than once.
            </p>
            <p>
              Nothing on this site tracks you. Nothing asks you to sign up. If a piece is useful,
              share it. If it isn't, close the tab. The library will remain.
            </p>
            <p>
              This site is open source.
            </p>
          </div>
        </section>

        <footer className="border-t border-[#E5E5E5] py-10 text-center text-xs text-[#111111]/40">
          © {new Date().getFullYear()} Maulana Syed Imon Rizvi. All essays released for free
          reading.
        </footer>
      </main>

      {active && <Reader booklet={active} onClose={() => setActive(null)} />}
      {activePdf && <PdfReader pdfUrl={activePdf} onClose={() => setActivePdf(null)} />}
    </div>
  );
}

type ViewMode = "scroll" | "page";
type Spacing = "comfortable" | "compact";

function Reader({ booklet, onClose }: { booklet: Booklet; onClose: () => void }) {
  const [mode, setMode] = useState<ViewMode>("scroll");
  const [fontSize, setFontSize] = useState(18);
  const [spacing, setSpacing] = useState<Spacing>("comfortable");
  const [page, setPage] = useState(0);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isRtl = LANGUAGE_MAP[booklet.language]?.dir === "rtl";

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (mode === "page") {
        if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, booklet.sections!.length - 1));
        if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [mode, booklet.sections, onClose]);

  useEffect(() => {
    if (mode === "page") {
      setProgress(((page + 1) / booklet.sections!.length) * 100);
      return;
    }
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [mode, page, booklet.sections]);

  const lineHeight = spacing === "comfortable" ? 1.85 : 1.55;
  const paraSpacing = spacing === "comfortable" ? "mb-6" : "mb-3";

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 bg-white text-[#111111] flex flex-col">
      <div className="absolute top-0 inset-x-0 h-px bg-[#E5E5E5] z-20 no-print">
        <div
          className="h-full bg-[#111111] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="no-print sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-[#111111]/70 hover:text-[#111111] transition-colors"
            aria-label="Close reader"
          >
            <X size={16} />
            <span className="hidden sm:inline">Close</span>
          </button>

          <div className="flex items-center gap-1 sm:gap-2 text-[#111111]/70">
            <ToggleGroup>
              <IconBtn
                active={mode === "scroll"}
                onClick={() => setMode("scroll")}
                label="Scroll mode"
              >
                <ScrollText size={16} />
              </IconBtn>
              <IconBtn active={mode === "page"} onClick={() => setMode("page")} label="Page mode">
                <BookOpen size={16} />
              </IconBtn>
            </ToggleGroup>

            <Divider />

            <ToggleGroup>
              <IconBtn
                onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                label="Decrease font"
              >
                <Minus size={14} />
                <span className="text-xs ml-0.5">A</span>
              </IconBtn>
              <IconBtn
                onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                label="Increase font"
              >
                <span className="text-xs mr-0.5">A</span>
                <Plus size={14} />
              </IconBtn>
            </ToggleGroup>

            <Divider />

            <IconBtn
              active={spacing === "comfortable"}
              onClick={() => setSpacing((s) => (s === "comfortable" ? "compact" : "comfortable"))}
              label="Toggle line spacing"
            >
              <AlignJustify size={16} />
            </IconBtn>

            <Divider />

            <IconBtn onClick={handlePrint} label="Download as PDF">
              <Download size={16} />
            </IconBtn>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto print-area">
        <article
          className="max-w-2xl mx-auto px-6 sm:px-8 py-16 sm:py-24"
          style={{ fontSize: `${fontSize}px`, lineHeight, direction: isRtl ? "rtl" : "ltr" }}
        >
          <header className="mb-14 text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#111111]/50 mb-5">
              {booklet.category}
            </p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-[10px] uppercase tracking-wide text-[#111111]/40 px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                {booklet.languageLabel}
              </span>
            </div>
            <h1
              className="font-serif tracking-tight leading-[1.1]"
              style={{ fontSize: `${fontSize * 2.2}px`, lineHeight: 1.1 }}
            >
              {booklet.title}
            </h1>
            <p className="mt-5 text-sm text-[#111111]/50">
              {booklet.author} · {booklet.readMinutes} min
            </p>
          </header>

          {mode === "scroll" ? (
            <div>
              {booklet.sections?.map((s, i) => (
                <section key={i} className="mb-12">
                  <h2
                    className="font-serif mb-6"
                    style={{ fontSize: `${fontSize * 1.35}px`, lineHeight: 1.3 }}
                  >
                    {s.heading}
                  </h2>
                  {s.paragraphs.map((p, j) => (
                    <p key={j} className={`${paraSpacing} text-[#111111]/85`}>
                      {p}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          ) : (
            <PageMode
              section={booklet.sections![page]}
              fontSize={fontSize}
              paraSpacing={paraSpacing}
              pageIndex={page}
              total={booklet.sections!.length}
            />
          )}
        </article>
      </div>

      {mode === "page" && (
        <div className="no-print border-t border-[#E5E5E5] bg-white">
          <div className="max-w-2xl mx-auto px-6 sm:px-8 h-14 flex items-center justify-between text-sm text-[#111111]/70">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
              disabled={page === 0}
              className="flex items-center gap-2 disabled:opacity-30 hover:text-[#111111] transition-colors"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="text-xs tracking-[0.15em] text-[#111111]/50">
              {page + 1} / {booklet.sections!.length}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, booklet.sections!.length - 1))}
              disabled={page === booklet.sections!.length - 1}
              className="flex items-center gap-2 disabled:opacity-30 hover:text-[#111111] transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageMode({
  section,
  fontSize,
  paraSpacing,
  pageIndex,
  total,
}: {
  section: Booklet["sections"][number];
  fontSize: number;
  paraSpacing: string;
  pageIndex: number;
  total: number;
}) {
  return (
    <div key={pageIndex} className="animate-[fadeSlide_320ms_ease-out]">
      <style>{`
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <h2 className="font-serif mb-8" style={{ fontSize: `${fontSize * 1.4}px`, lineHeight: 1.3 }}>
        {section.heading}
      </h2>
      {section.paragraphs.map((p, j) => (
        <p key={j} className={`${paraSpacing} text-[#111111]/85`}>
          {p}
        </p>
      ))}
      <p className="mt-16 text-center text-xs tracking-[0.2em] text-[#111111]/30">
        — {pageIndex + 1} of {total} —
      </p>
    </div>
  );
}

function IconBtn({
  children,
  onClick,
  active,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`h-9 px-2.5 inline-flex items-center justify-center rounded transition-colors ${
        active
          ? "bg-[#111111] text-white"
          : "text-[#111111]/70 hover:bg-[#F9F9F9] hover:text-[#111111]"
      }`}
    >
      {children}
    </button>
  );
}

function PdfReader({ pdfUrl, onClose }: { pdfUrl: string; onClose: () => void }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-[#F5F5F0] flex flex-col">
      <div className="sticky top-0 z-10 border-b border-[#E5E5E5] bg-white/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm text-[#111111]/70 hover:text-[#111111] transition-colors"
            aria-label="Close reader"
          >
            <X size={16} />
            <span className="hidden sm:inline">Close</span>
          </button>

          <div className="flex items-center gap-2 text-[#111111]/70">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="h-8 px-2 text-xs hover:bg-[#F9F9F9] rounded transition-colors"
              aria-label="Zoom out"
            >
              <Minus size={14} />
            </button>
            <span className="text-xs tabular-nums min-w-[3ch] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
              className="h-8 px-2 text-xs hover:bg-[#F9F9F9] rounded transition-colors"
              aria-label="Zoom in"
            >
              <Plus size={14} />
            </button>

            <span className="w-px h-5 bg-[#E5E5E5] mx-1" />

            <a
              href={`/sacred-pages/booklets/${pdfUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-8 px-2.5 inline-flex items-center gap-1.5 text-xs hover:bg-[#F9F9F9] rounded transition-colors"
              aria-label="Download PDF"
            >
              <Download size={14} />
              Download
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#F5F5F0] flex justify-center p-4 sm:p-8">
        <div
          className="origin-top transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        >
          <embed
            src={`/sacred-pages/booklets/${pdfUrl}`}
            type="application/pdf"
            className="shadow-xl bg-white"
            style={{ width: "800px", height: "1100px" }}
          />
        </div>
      </div>
    </div>
  );
}

function ToggleGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function Divider() {
  return <span className="hidden sm:block w-px h-5 bg-[#E5E5E5] mx-1" />;
}
