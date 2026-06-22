"use client";

import { useState } from "react";
import {
  Layers,
  ChevronDown,
  Building2,
  MapPin,
  Eye,
  EyeOff,
  CheckCheck,
  X,
  Tag,
} from "lucide-react";
import { useGisStore } from "@/lib/gis/store";
import { ZONA_COLORS, ZONA_ORDER, TIPO_COLORS, TIPO_ORDER } from "@/lib/gis/constants";
import { cn } from "@/lib/utils";

export function LayersPanel() {
  const [open, setOpen] = useState(true);
  const [bairrosOpen, setBairrosOpen] = useState(true);
  const [localOpen, setLocalOpen] = useState(true);
  const layers = useGisStore((s) => s.layers);
  const toggleBairros = useGisStore((s) => s.toggleBairros);
  const toggleLocalidades = useGisStore((s) => s.toggleLocalidades);
  const toggleBairroLabels = useGisStore((s) => s.toggleBairroLabels);
  const toggleZona = useGisStore((s) => s.toggleZona);
  const toggleTipo = useGisStore((s) => s.toggleTipo);
  const setAllZonas = useGisStore((s) => s.setAllZonas);
  const setAllTipos = useGisStore((s) => s.setAllTipos);

  const visibleZonas = ZONA_ORDER.filter((z) => layers.zonas[z]).length;
  const visibleTipos = TIPO_ORDER.filter((t) => layers.tipos[t]).length;

  return (
    <div className="glass-panel rounded-2xl border border-border/60 overflow-hidden shadow-2xl">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-emerald-500/15 grid place-items-center">
            <Layers className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold">Camadas</p>
            <p className="text-[10px] text-muted-foreground">
              {visibleZonas} zonas · {visibleTipos} tipos ativos
            </p>
          </div>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2.5 max-h-[70vh] overflow-y-auto scrollbar-premium">
          {/* BAIRROS */}
          <div className="rounded-xl bg-secondary/30 border border-border/40 overflow-hidden">
            <div className="flex items-center">
              <button
                onClick={() => toggleBairros()}
                className={cn(
                  "flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                  layers.bairros ? "" : "opacity-50",
                )}
              >
                <Toggle on={layers.bairros} />
                <Building2 className="h-4 w-4 text-emerald-400" />
                <span className="text-sm font-semibold">Bairros</span>
                <span className="text-[10px] text-muted-foreground ml-auto">64</span>
              </button>
              <button
                onClick={() => setBairrosOpen((v) => !v)}
                className="px-2.5 h-full self-stretch grid place-items-center hover:bg-secondary/60 transition-colors"
              >
                <ChevronDown
                  className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", bairrosOpen && "rotate-180")}
                />
              </button>
            </div>
            {bairrosOpen && layers.bairros && (
              <div className="px-2.5 pb-2.5 pt-1 border-t border-border/30">
                <label className="flex items-center gap-2 py-1.5 cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <input
                    type="checkbox"
                    checked={layers.bairroLabels}
                    onChange={toggleBairroLabels}
                    className="h-3.5 w-3.5 rounded accent-emerald-500"
                  />
                  Rótulos com halo cartográfico
                </label>
                <div className="flex items-center justify-between px-1 pt-1.5 pb-1">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Zonas
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAllZonas(true)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setAllZonas(false)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                    >
                      Limpar
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {ZONA_ORDER.map((z) => (
                    <button
                      key={z}
                      onClick={() => toggleZona(z)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition-colors",
                        layers.zonas[z] ? "hover:bg-secondary/60" : "opacity-45 hover:opacity-70",
                      )}
                    >
                      <span
                        className="h-3 w-3 rounded-full ring-2 ring-white/10 shrink-0"
                        style={{ background: ZONA_COLORS[z] }}
                      />
                      <span className="font-medium flex-1 text-left">{z}</span>
                      {layers.zonas[z] ? <Eye className="h-3 w-3 text-muted-foreground" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* LOCALIDADES */}
          <div className="rounded-xl bg-secondary/30 border border-border/40 overflow-hidden">
            <div className="flex items-center">
              <button
                onClick={() => toggleLocalidades()}
                className={cn(
                  "flex-1 flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                  layers.localidades ? "" : "opacity-50",
                )}
              >
                <Toggle on={layers.localidades} />
                <MapPin className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-semibold">Localidades</span>
                <span className="text-[10px] text-muted-foreground ml-auto">662</span>
              </button>
              <button
                onClick={() => setLocalOpen((v) => !v)}
                className="px-2.5 h-full self-stretch grid place-items-center hover:bg-secondary/60 transition-colors"
              >
                <ChevronDown
                  className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", localOpen && "rotate-180")}
                />
              </button>
            </div>
            {localOpen && layers.localidades && (
              <div className="px-2.5 pb-2.5 pt-1 border-t border-border/30">
                <div className="flex items-center justify-between px-1 pt-1.5 pb-1">
                  <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <Tag className="h-3 w-3" /> Tipos
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setAllTipos(true)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-emerald-500/20 hover:text-emerald-300 transition-colors"
                    >
                      <CheckCheck className="inline h-2.5 w-2.5 mr-0.5" />
                      Todos
                    </button>
                    <button
                      onClick={() => setAllTipos(false)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
                    >
                      <X className="inline h-2.5 w-2.5 mr-0.5" />
                      Limpar
                    </button>
                  </div>
                </div>
                <div className="space-y-0.5">
                  {TIPO_ORDER.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTipo(t)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition-colors",
                        layers.tipos[t] ? "hover:bg-secondary/60" : "opacity-45 hover:opacity-70",
                      )}
                    >
                      <span
                        className="h-3 w-3 rounded-sm ring-2 ring-white/10 shrink-0"
                        style={{ background: TIPO_COLORS[t] }}
                      />
                      <span className="font-medium flex-1 text-left">{t}</span>
                      {layers.tipos[t] ? <Eye className="h-3 w-3 text-muted-foreground" /> : <EyeOff className="h-3 w-3 text-muted-foreground" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={cn(
        "relative h-4 w-7 rounded-full transition-colors shrink-0",
        on ? "bg-emerald-500" : "bg-secondary",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform",
          on ? "translate-x-3.5" : "translate-x-0.5",
        )}
      />
    </span>
  );
}
