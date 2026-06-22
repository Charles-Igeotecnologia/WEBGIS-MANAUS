"use client";

import { useMemo, useRef, useState } from "react";
import { Search, MapPin, Building2, X, CornerDownLeft } from "lucide-react";
import { useGisStore, buildSearchIndex } from "@/lib/gis/store";
import { featureCentroid, featureArea, featurePerimeter } from "@/lib/gis/geo";
import type { SearchHit, SelectedFeature } from "@/lib/gis/types";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  map: L.Map | null;
  onSelect?: (hit: SearchHit) => void;
}

export function SearchBar({ map, onSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bairros = useGisStore((s) => s.bairros);
  const localidades = useGisStore((s) => s.localidades);
  const setSelected = useGisStore((s) => s.setSelected);

  const index = useMemo(() => buildSearchIndex(bairros, localidades), [bairros, localidades]);

  // fill centers lazily (featureCentroid is cheap but only available client-side)
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const scored = index
      .map((h) => {
        // compute center on demand
        if (h.center[0] === 0 && h.center[1] === 0) {
          h.center = featureCentroid(h.feature as any);
        }
        const name = h.name.toLowerCase();
        const sub = h.subtitle.toLowerCase();
        let score = 999;
        if (name === q) score = 0;
        else if (name.startsWith(q)) score = 1;
        else if (name.includes(q)) score = 2;
        else if (sub.includes(q)) score = 3;
        return { h, score };
      })
      .filter((x) => x.score < 999)
      .sort((a, b) => a.score - b.score || a.h.name.localeCompare(b.h.name))
      .slice(0, 12)
      .map((x) => x.h);
    return scored;
  }, [index, query]);

  function choose(hit: SearchHit) {
    const [lat, lng] = hit.center;
    map?.flyTo([lat, lng], Math.max(map.getZoom(), 15), { duration: 1.1 });
    const area = featureArea(hit.feature as any);
    const perim = featurePerimeter(hit.feature as any);
    const sel: SelectedFeature = {
      kind: hit.kind,
      feature: hit.feature,
      center: [lat, lng],
      areaHa: area / 10000,
      perimM: perim,
    };
    setSelected(sel);
    onSelect?.(hit);
    setQuery(hit.name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(0);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Buscar bairro, condomínio, conjunto, comunidade..."
          className="w-full h-10 pl-10 pr-9 rounded-xl bg-secondary/70 border border-border/60 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/40 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute z-40 mt-2 w-full rounded-xl glass-panel border border-border/60 shadow-2xl overflow-hidden max-h-80 overflow-y-auto scrollbar-premium">
            {results.map((h, i) => (
              <button
                key={h.id}
                onMouseEnter={() => setActiveIdx(i)}
                onClick={() => choose(h)}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 flex items-center gap-3 transition-colors border-b border-border/40 last:border-0",
                  i === activeIdx ? "bg-emerald-500/15" : "hover:bg-secondary/60",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg grid place-items-center shrink-0",
                    h.kind === "bairro"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-amber-500/15 text-amber-400",
                  )}
                >
                  {h.kind === "bairro" ? <Building2 className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{h.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {h.subtitle} · {h.zona}
                  </p>
                </div>
                {i === activeIdx && <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
