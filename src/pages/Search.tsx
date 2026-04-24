import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, X, Clock, Pill, Loader2 } from "lucide-react";
import {
  getMedicineSuggestions,
  searchMedicines,
  Medicine,
} from "@/lib/medicineApi";
import { addRecentSearch, getRecentSearches, clearRecentSearches, addHistory } from "@/lib/storage";

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [results, setResults] = useState<Medicine[]>([]);
  const [recents, setRecents] = useState<string[]>(getRecentSearches());
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<number | null>(null);

  // debounced suggestions
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      const s = await getMedicineSuggestions(query);
      setSuggestions(s);
    }, 400);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setQuery(q);
    setLoading(true);
    setSearched(true);
    setSuggestions([]);
    addRecentSearch(q);
    setRecents(getRecentSearches());
    try {
      const r = await searchMedicines(q);
      setResults(r);
    } finally {
      setLoading(false);
    }
  };

  const openMedicine = (m: Medicine) => {
    const item = addHistory({ medicine: m, source: "search" });
    navigate(`/medicine/${item.id}`);
  };

  return (
    <div className="px-5 pt-12 max-w-md mx-auto animate-fade-in-up">
      <h1 className="text-2xl font-extrabold text-foreground mb-1 tracking-tight">Search</h1>
      <p className="text-sm text-muted-foreground mb-5">
        Search any medicine name in the world
      </p>

      {/* Search bar */}
      <div className="glass-strong rounded-2xl flex items-center gap-2 px-4 py-3 mb-3 shadow-glass">
        <SearchIcon className="w-5 h-5 text-primary flex-shrink-0" strokeWidth={2.4} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
          placeholder="Search any medicine name in the world…"
          className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setSearched(false);
            }}
            className="w-7 h-7 rounded-full glass-subtle flex items-center justify-center"
            aria-label="Clear"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Autocomplete */}
      {suggestions.length > 0 && (
        <div className="glass rounded-2xl overflow-hidden mb-3 animate-fade-in-up">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => runSearch(s)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary/5 active:scale-[0.99] border-b border-white/30 last:border-b-0 transition-colors"
            >
              <SearchIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground truncate">{s}</span>
            </button>
          ))}
        </div>
      )}

      {/* Recent searches */}
      {!searched && recents.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Recent
            </h3>
            <button
              onClick={() => {
                clearRecentSearches();
                setRecents([]);
              }}
              className="text-xs font-semibold text-primary"
            >
              Clear
            </button>
          </div>
          <div className="space-y-1.5">
            {recents.map((r) => (
              <button
                key={r}
                onClick={() => runSearch(r)}
                className="w-full glass rounded-2xl px-4 py-3 flex items-center gap-3 active:scale-[0.99] hover:shadow-glass-lg transition-all"
              >
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-foreground flex-1 text-left">{r}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="space-y-2 mt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="glass rounded-2xl p-4 flex items-center gap-3 animate-pulse-soft">
              <div className="w-12 h-12 rounded-xl bg-primary/10" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-primary/10 rounded w-2/3" />
                <div className="h-3 bg-primary/5 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <div className="glass rounded-3xl p-6 text-center mt-3">
          <p className="text-sm text-muted-foreground">
            No results. Try a different name or scan the packaging.
          </p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="space-y-2 mt-3">
          {results.map((m) => (
            <button
              key={m.medicineName}
              onClick={() => openMedicine(m)}
              className="w-full glass rounded-2xl p-4 flex items-center gap-3 text-left active:scale-[0.99] hover:shadow-glass-lg transition-all"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-glow flex-shrink-0"
                style={{ background: "var(--gradient-primary)" }}
              >
                <Pill className="w-5 h-5 rotate-45" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground truncate">{m.medicineName}</p>
                {m.composition && (
                  <p className="text-xs text-muted-foreground truncate">{m.composition}</p>
                )}
                {m.uses && (
                  <p className="text-xs text-foreground/70 truncate mt-0.5">
                    {m.uses.split(/\.|\n/)[0]}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Search;
