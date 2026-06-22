"use client";

import { MousePointerClick, Ruler, Radar, FileText, X, Trash2, Info } from "lucide-react";
import { useGisStore } from "@/lib/gis/store";
import { SearchBar } from "./SearchBar";
import { BasemapSwitcher } from "./BasemapSwitcher";
import { cn } from "@/lib/utils";
import type L from "leaflet";
import { useState } from "react";

interface TopBarProps {
  map: L.Map | null;
  onExit: () => void;
}

export function TopBar({ map, onExit }: TopBarProps) {
  const tool = useGisStore((s) => s.tool);
  const setTool = useGisStore((s) => s.setTool);
  const setReportOpen = useGisStore((s) => s.setReportOpen);
  const reportOpen = useGisStore((s) => s.reportOpen);
  const [showHelp, setShowHelp] = useState(true);

  const tools = [
    { key: "none" as const, label: "Identificar", icon: MousePointerClick, hint: "Clique em um bairro ou localidade para ver detalhes" },
    { key: "measure" as const, label: "Medir", icon: Ruler, hint: "Clique para adicionar pontos · duplo clique finaliza (≥3 pts = área)" },
    { key: "proximity" as const, label: "Proximidade", icon: Radar, hint: "Clique no mapa: 3 referências mais próximas em 1 km" },
  ];

  const activeTool = tools.find((t) => t.key === tool);

  return (
    <div className="absolute top-0 inset-x-0 z-[1000] pointer-events-none">
      <div className="p-3 flex items-center gap-2 pointer-events-auto">
        {/* logo / close */}
        <button
          onClick={onExit}
          className="h-10 w-10 rounded-xl glass-panel border border-border/60 grid place-items-center hover:border-rose-500/50 hover:text-rose-300 transition-colors shrink-0"
          title="Voltar à página inicial"
        >
          <X className="h-5 w-5" />
        </button>

        {/* search */}
        <div className="flex-1 max-w-xl">
          <SearchBar map={map} />
        </div>

        {/* tools */}
        <div className="hidden md:flex items-center gap-1 glass-panel rounded-xl border border-border/60 p-1">
          {tools.map((t) => (
            <button
              key={t.key}
              onClick={() => setTool(t.key)}
              className={cn(
                "h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all",
                tool === t.key
                  ? "tool-active"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
              title={t.label}
            >
              <t.icon className="h-4 w-4" />
              <span className="hidden lg:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* mobile tools */}
        <div className="flex md:hidden items-center gap-1 glass-panel rounded-xl border border-border/60 p-1">
          {tools.map((t) => (
            <button
              key={t.key}
              onClick={() => setTool(t.key)}
              className={cn(
                "h-8 w-9 rounded-lg grid place-items-center transition-all",
                tool === t.key ? "tool-active" : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
              title={t.label}
            >
              <t.icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <BasemapSwitcher />

        <button
          onClick={() => setReportOpen(!reportOpen)}
          className={cn(
            "h-10 px-3 rounded-xl border flex items-center gap-2 text-sm font-medium transition-colors shrink-0",
            reportOpen
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-background border-transparent"
              : "glass-panel border-border/60 hover:border-amber-500/40",
          )}
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Relatório</span>
        </button>
      </div>

      {/* active tool hint */}
      {activeTool && showHelp && tool !== "none" && (
        <div className="px-3 pointer-events-auto">
          <div className="mx-auto max-w-3xl flex items-center gap-2.5 rounded-xl glass-panel border border-border/60 px-3.5 py-2 shadow-lg">
            {tool === "measure" ? (
              <button
                onClick={() => (window as any).__gisClearMeasure?.()}
                className="flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-medium transition-colors shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Limpar
              </button>
            ) : (
              <div className="h-7 w-7 rounded-lg bg-amber-500/15 grid place-items-center shrink-0">
                <activeTool.icon className="h-4 w-4 text-amber-400" />
              </div>
            )}
            <p className="text-xs text-muted-foreground flex-1 truncate">
              <span className="text-foreground font-semibold">{activeTool.label}:</span>{" "}
              {activeTool.hint}
            </p>
            <button
              onClick={() => setShowHelp(false)}
              className="p-1 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
