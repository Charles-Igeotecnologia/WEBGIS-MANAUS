"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2, AlertTriangle } from "lucide-react";
import { useGisStore } from "@/lib/gis/store";
import { TopBar } from "./TopBar";
import { LayersPanel } from "./LayersPanel";
import { FeatureInfo } from "./FeatureInfo";
import { ProximityPanel } from "./ProximityPanel";
import { ReportPanel } from "./ReportPanel";
import type { BairrosCollection, LocalidadesCollection } from "@/lib/gis/types";
import L from "leaflet";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
    </div>
  ),
});

interface GisAppProps {
  onExit: () => void;
}

export function GisApp({ onExit }: GisAppProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const dataLoading = useGisStore((s) => s.dataLoading);
  const dataError = useGisStore((s) => s.dataError);
  const setBairros = useGisStore((s) => s.setBairros);
  const setLocalidades = useGisStore((s) => s.setLocalidades);
  const setDataLoading = useGisStore((s) => s.setDataLoading);
  const setDataError = useGisStore((s) => s.setDataError);
  const selected = useGisStore((s) => s.selected);
  const proximityOrigin = useGisStore((s) => s.proximityOrigin);
  const reportOpen = useGisStore((s) => s.reportOpen);

  /* load data */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const [bRes, lRes] = await Promise.all([
          fetch("/data/bairros.json"),
          fetch("/data/localidades.json"),
        ]);
        if (!bRes.ok || !lRes.ok) throw new Error("Falha ao carregar dados geográficos");
        const b: BairrosCollection = await bRes.json();
        const l: LocalidadesCollection = await lRes.json();
        if (cancelled) return;
        setBairros(b);
        setLocalidades(l);
      } catch (e: any) {
        if (!cancelled) setDataError(e?.message ?? "Erro desconhecido");
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setBairros, setLocalidades, setDataLoading, setDataError]);

  function fitFeature() {
    if (!map || !selected) return;
    try {
      const bounds = L.geoJSON(selected.feature).getBounds();
      map.flyToBounds(bounds, { padding: [80, 80], maxZoom: 16, duration: 0.8 });
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-background">
      {/* Map */}
      <MapView onReady={setMap} />

      {/* loading overlay */}
      {dataLoading && (
        <div className="absolute inset-0 z-[1050] grid place-items-center bg-background/70 backdrop-blur-sm pointer-events-none">
          <div className="glass-panel rounded-2xl px-6 py-5 flex items-center gap-3 shadow-2xl">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <div>
              <p className="text-sm font-semibold">Carregando dados geográficos</p>
              <p className="text-xs text-muted-foreground">Bairros e localidades de Manaus/AM…</p>
            </div>
          </div>
        </div>
      )}

      {/* error overlay */}
      {dataError && (
        <div className="absolute inset-0 z-[1050] grid place-items-center bg-background/80 backdrop-blur-sm p-6">
          <div className="glass-panel rounded-2xl px-6 py-5 flex items-start gap-3 shadow-2xl max-w-md">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Erro ao carregar dados</p>
              <p className="text-xs text-muted-foreground mt-1">{dataError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <TopBar map={map} onExit={onExit} />

      {/* Left panel — layers */}
      {!reportOpen && (
        <div className="absolute left-3 top-[64px] sm:top-[68px] z-[900] w-[300px] max-w-[calc(100vw-1.5rem)]">
          <LayersPanel />
        </div>
      )}

      {/* Right panel — info / proximity */}
      {!reportOpen && (
        <div className="absolute right-3 top-[64px] sm:top-[68px] z-[900] w-[330px] max-w-[calc(100vw-1.5rem)] space-y-3 max-h-[calc(100vh-90px)] overflow-y-auto scrollbar-premium no-scrollbar">
          <ProximityPanel />
          <FeatureInfo />
        </div>
      )}

      {/* Report panel */}
      <ReportPanel onFitFeature={fitFeature} />

      {/* bottom hint when nothing selected and no proximity */}
      {!reportOpen && !selected && !proximityOrigin && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[800] pointer-events-none hidden sm:block">
          <div className="glass-panel rounded-full px-4 py-2 text-xs text-muted-foreground border border-border/60 shadow-lg">
            Clique em um bairro ou localidade para ver detalhes · use as ferramentas para medir e analisar
          </div>
        </div>
      )}
    </div>
  );
}
