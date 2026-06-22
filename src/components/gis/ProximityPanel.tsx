"use client";

import { X, Crosshair, Navigation, ExternalLink, Radar, MapPin } from "lucide-react";
import { useGisStore } from "@/lib/gis/store";
import { fmtM, fmtCoord, googleMapsLink } from "@/lib/gis/geo";
import { cn } from "@/lib/utils";

export function ProximityPanel() {
  const origin = useGisStore((s) => s.proximityOrigin);
  const results = useGisStore((s) => s.proximityResults);
  const clear = useGisStore((s) => s.clearProximity);
  const setTool = useGisStore((s) => s.setTool);

  if (!origin) return null;

  return (
    <div className="glass-panel rounded-2xl border border-border/60 overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-lg bg-amber-500/15 grid place-items-center shrink-0">
            <Radar className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold">Proximidade — 3 mais próximos</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Raio de 1.000 m · fórmula de Haversine
            </p>
          </div>
          <button
            onClick={() => {
              clear();
              setTool("none");
            }}
            className="p-1.5 rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2 border border-border/40">
          <Crosshair className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span className="text-xs font-mono text-muted-foreground truncate">
            {fmtCoord(origin[0], origin[1])}
          </span>
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-72 overflow-y-auto scrollbar-premium">
        {results.length === 0 && (
          <div className="text-center py-6 px-3">
            <MapPin className="h-7 w-7 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum ponto de referência em até 1 km.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Clique em outra região mais próxima das localidades.
            </p>
          </div>
        )}
        {results.map((r, idx) => {
          const isClosest = idx === 0;
          const color = isClosest ? "#34d399" : "#2dd4bf";
          return (
            <div
              key={r.id}
              className="rounded-xl bg-secondary/30 border border-border/40 p-3 hover:border-emerald-500/30 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={cn(
                    "h-7 w-7 rounded-lg grid place-items-center shrink-0 text-xs font-bold",
                  )}
                  style={{ background: `${color}22`, color }}
                >
                  {idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-tight truncate">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {r.kind}
                    {r.zona ? ` · ${r.zona}` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color }}>
                    {fmtM(r.distance)}
                  </p>
                </div>
              </div>
              <a
                href={googleMapsLink(r.lat, r.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-emerald-300 transition-colors"
              >
                <ExternalLink className="h-3 w-3" />
                {fmtCoord(r.lat, r.lng)}
              </a>
            </div>
          );
        })}
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Navigation className="h-3 w-3" />
          Clique no mapa para recalcular a partir de outro ponto.
        </div>
      </div>
    </div>
  );
}
