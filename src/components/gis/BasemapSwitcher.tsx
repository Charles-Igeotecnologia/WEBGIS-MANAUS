"use client";

import { useState } from "react";
import { Map, Satellite, Globe2, Palette, Check, Layers3 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useGisStore } from "@/lib/gis/store";
import { BASEMAPS } from "@/lib/gis/constants";
import type { BasemapKey } from "@/lib/gis/types";
import { cn } from "@/lib/utils";

const iconMap: Record<BasemapKey, typeof Map> = {
  vector: Map,
  satellite: Satellite,
  hybrid: Globe2,
  dark: Palette,
};

export function BasemapSwitcher() {
  const [open, setOpen] = useState(false);
  const basemap = useGisStore((s) => s.basemap);
  const setBasemap = useGisStore((s) => s.setBasemap);
  const Current = iconMap[basemap];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="h-10 px-3 rounded-xl glass-panel border border-border/60 flex items-center gap-2 text-sm font-medium hover:border-emerald-500/40 transition-colors"
          title="Mapas base"
        >
          <Current className="h-4 w-4 text-emerald-400" />
          <span className="hidden sm:inline">{BASEMAPS[basemap].label}</span>
          <Layers3 className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2 glass-panel border-border/60" align="end">
        <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Mapa base
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {(Object.keys(BASEMAPS) as BasemapKey[]).map((k) => {
            const def = BASEMAPS[k];
            const Icon = iconMap[k];
            const active = basemap === k;
            return (
              <button
                key={k}
                onClick={() => {
                  setBasemap(k);
                  setOpen(false);
                }}
                className={cn(
                  "relative rounded-lg p-3 text-left border transition-all",
                  active
                    ? "border-emerald-500/60 bg-emerald-500/12"
                    : "border-border/50 bg-secondary/40 hover:border-emerald-500/30",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mb-2",
                    active ? "text-emerald-400" : "text-muted-foreground",
                  )}
                />
                <p className="text-xs font-semibold leading-tight">{def.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                  {def.description}
                </p>
                {active && (
                  <Check className="absolute top-2 right-2 h-3.5 w-3.5 text-emerald-400" />
                )}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
