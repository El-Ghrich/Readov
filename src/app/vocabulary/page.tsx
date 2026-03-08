// import ComingSoon from "@/components/ComingSoon";

// export default function VocabularyPage() {
//   return (
//     <ComingSoon
//       title="Vocabulary Builder"
//       description="Track the words you've learned, practice with flashcards, and master your target language."
//     />
//   );
// }
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Book,
  Volume2,
  Sparkles,
  Filter,
  MoreVertical,
  Loader2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  getVocabulary,
  updateMastery,
  deleteVocabulary,
  type VocabularyEntry,
} from "@/lib/actions";
import { cn } from "@/lib/utils";

export default function GrimoirePage() {
  const [vocabulary, setVocabulary] = useState<VocabularyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [allLanguages, setAllLanguages] = useState<string[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [masteredTotal, setMasteredTotal] = useState(0); // Optional: if we want overall mastered count
  const PAGE_SIZE = 12;

  const fetchVocab = useCallback(
    async (isLoadMore = false) => {
      const currentPage = isLoadMore ? page + 1 : 1;

      if (isLoadMore) setLoadingMore(true);
      else setLoading(true);

      const res = await getVocabulary({
        searchTerm: searchTerm || undefined,
        language: selectedLanguage !== "All" ? selectedLanguage : undefined,
        page: currentPage,
        pageSize: PAGE_SIZE,
      });

      if (res.success) {
        const { list, totalCount: count } = res.data;
        if (isLoadMore) {
          setVocabulary((prev) => [...prev, ...list]);
          setPage(currentPage);
        } else {
          setVocabulary(list);
          setPage(1);
          setTotalCount(count);
        }

        setHasMore(vocabulary.length + list.length < count);

        // Sync all languages only on initial load without filters
        if (selectedLanguage === "All" && !searchTerm && !isLoadMore) {
          const langs = Array.from(new Set(list.map((v) => v.language)));
          setAllLanguages(langs);
        }
      }

      setLoading(false);
      setLoadingMore(false);
    },
    [page, searchTerm, selectedLanguage, vocabulary.length],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVocab();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedLanguage]); // Trigger search/filter reset

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    fetchVocab(true);
  };

  const handleToggleMastery = async (item: VocabularyEntry) => {
    const nextLevel = (item.mastery_level + 1) % 3;
    const res = await updateMastery(item.id, nextLevel);
    if (res.success) {
      setVocabulary((prev) =>
        prev.map((v) => (v.id === item.id ? res.data : v)),
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this word from your Grimoire?")) return;
    const res = await deleteVocabulary(id);
    if (res.success) {
      setVocabulary((prev) => prev.filter((v) => v.id !== id));
    }
  };

  const handleSpeak = (word: string, lang: string) => {
    if (!window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    // Rough language mapping for speech synthesis
    const langMap: Record<string, string> = {
      French: "fr-FR",
      Spanish: "es-ES",
      German: "de-DE",
      Italian: "it-IT",
      English: "en-US",
      Portuguese: "pt-BR",
    };
    utterance.lang = langMap[lang] || "en-US";
    window.speechSynthesis.speak(utterance);
  };

  const dropdownLanguages = ["All", ...allLanguages];

  return (
    <div className="min-h-screen pt-16 pb-20 px-8 sm:px-12 lg:px-20 relative overflow-hidden">
      {/* Ambient Background Lighting */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* ─── PAGE HEADER ─── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
              Vocabulary Vault
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl">
              Every word you discovered on your adventures. Review them, master
              them, and expand your universe.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl backdrop-blur-md">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalCount}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Words
              </span>
            </div>
            <div className="flex flex-col items-center justify-center px-6 py-3 bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl backdrop-blur-md">
              <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {vocabulary.filter((v) => v.mastery_level === 2).length}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                Mastered
              </span>
            </div>
          </div>
        </div>

        {/* ─── CONTROLS (SEARCH & FILTER) ─── */}
        <div className="flex flex-col sm:flex-row gap-4 relative z-20">
          <div className="relative flex-1 max-w-md group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search words, translations, or context..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-black/20 backdrop-blur-md text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 hover:border-purple-500/50 transition-all font-medium min-w-[140px]"
            >
              <Filter className="w-5 h-5" />
              {selectedLanguage}
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  showLangDropdown && "rotate-180",
                )}
              />
            </button>

            {showLangDropdown && (
              <div className="absolute top-full mt-2 left-0 w-full bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                {dropdownLanguages.map((lang: string) => (
                  <button
                    key={lang}
                    onClick={() => {
                      setSelectedLanguage(lang);
                      setShowLangDropdown(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors",
                      selectedLanguage === lang
                        ? "text-purple-600 font-bold"
                        : "text-gray-600 dark:text-gray-400",
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── VOCABULARY GRID ─── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            <p className="text-gray-500 font-medium">
              Summoning your Grimoire...
            </p>
          </div>
        ) : vocabulary.length === 0 ? (
          <div className="text-center py-32 space-y-4">
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Sparkles className="w-10 h-10 text-gray-300 dark:text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Empty Grimoire
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto">
              You haven&apos;t saved any words yet. Start a story and click on
              words you want to remember!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vocabulary.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col p-6 bg-white/60 dark:bg-card/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/30 rounded-3xl transition-all duration-300 shadow-sm hover:shadow-xl dark:hover:shadow-[0_8px_30px_-12px_rgba(124,58,237,0.3)] hover:-translate-y-1"
              >
                {/* Top Row: Language Tag & Mastery */}
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-xs font-semibold text-gray-600 dark:text-gray-400 tracking-wider uppercase">
                    {item.language}
                  </span>

                  {/* Status Dot */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMastery(item)}
                      className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                      title={`Mastery: ${item.mastery_level === 0 ? "New" : item.mastery_level === 1 ? "Learning" : "Mastered"}`}
                    >
                      <span
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          item.mastery_level === 2
                            ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                            : item.mastery_level === 1
                              ? "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                              : "bg-gray-400 dark:bg-gray-600",
                        )}
                      />
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                        {item.mastery_level === 2
                          ? "Mastered"
                          : item.mastery_level === 1
                            ? "Learning"
                            : "New"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* The Word */}
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                    {item.word}
                  </h3>
                  <button
                    onClick={() => handleSpeak(item.word, item.language)}
                    className="p-2 rounded-full bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-lg font-medium text-purple-600 dark:text-purple-400 mb-6">
                  {item.translation}
                </p>

                {/* Context Block */}
                {item.context_sentence && (
                  <div className="mt-auto p-4 rounded-2xl bg-gray-50/80 dark:bg-black/30 border border-gray-100 dark:border-white/5 relative group-hover:bg-purple-50/50 dark:group-hover:bg-purple-900/10 transition-colors">
                    <Sparkles className="absolute top-3 right-3 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-purple-300 transition-colors" />
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-2">
                      Story Context
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic line-clamp-3">
                      &ldquo;{item.context_sentence}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── PAGINATION ─── */}
        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-4 rounded-2xl bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold hover:bg-white dark:hover:bg-white/10 transition-all flex items-center gap-2 group shadow-sm hover:shadow-md"
            >
              {loadingMore ? (
                <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              ) : (
                <>
                  <span>Load More Words</span>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
