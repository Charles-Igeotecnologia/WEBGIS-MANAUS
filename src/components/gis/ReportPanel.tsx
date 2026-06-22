"use client";

import { useMemo } from "react";
import { X, Printer, Crosshair, FileText } from "lucide-react";
import dynamic from "next/dynamic";
import { useGisStore } from "@/lib/gis/store";
import { ZONA_COLORS, ZONA_ORDER, TIPO_COLORS, TIPO_ORDER, BASEMAPS } from "@/lib/gis/constants";
import { fmtHa, fmtM, fmtCoord } from "@/lib/gis/geo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const ReportMap = dynamic(() => import("./ReportMap").then((m) => m.ReportMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full grid place-items-center bg-[#0a0e14] text-white/40 text-xs">
      Carregando mapa...
    </div>
  ),
});

interface ReportPanelProps {
  onFitFeature: () => void;
}

export function ReportPanel({ onFitFeature }: ReportPanelProps) {
  const reportOpen = useGisStore((s) => s.reportOpen);
  const setReportOpen = useGisStore((s) => s.setReportOpen);
  const reportTitle = useGisStore((s) => s.reportTitle);
  const setReportTitle = useGisStore((s) => s.setReportTitle);
  const reportNotes = useGisStore((s) => s.reportNotes);
  const setReportNotes = useGisStore((s) => s.setReportNotes);
  const selected = useGisStore((s) => s.selected);
  const layers = useGisStore((s) => s.layers);
  const basemap = useGisStore((s) => s.basemap);
  const center = useGisStore((s) => s.center);
  const zoom = useGisStore((s) => s.zoom);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  if (!reportOpen) return null;

  const isBairro = selected?.kind === "bairro";
  const f = selected?.feature as any;
  const props = f?.properties;

  const rows: { k: string; v: string }[] = selected
    ? isBairro
      ? [
          { k: "Bairro", v: props.NOME_BAIRR },
          { k: "Zona", v: props.ZONAS },
          { k: "OBJECTID", v: String(props.OBJECTID) },
          { k: "Município", v: "Manaus" },
          { k: "UF", v: "Amazonas (AM)" },
        ]
      : [
          { k: "Localidade", v: props.NOME_LOCAL },
          { k: "Tipo", v: props.TIPO_1 },
          { k: "Bairro", v: props.BAIRRO_1 },
          { k: "Zona", v: props.ZONAS },
          { k: "Município", v: props.MUNICIPI_1 },
          { k: "UF", v: `${props.ESTADO} — Amazonas` },
        ]
    : [];

  const visibleZonas = ZONA_ORDER.filter((z) => layers.bairros && layers.zonas[z]);
  const visibleTipos = TIPO_ORDER.filter((t) => layers.localidades && layers.tipos[t]);

  return (
    <div className="absolute inset-0 z-[1100] flex flex-col md:flex-row bg-background/60 backdrop-blur-sm">
      {/* left spacer (keeps map visible on desktop) */}
      <div className="hidden md:block md:flex-1" />

      {/* report panel */}
      <aside className="relative md:w-[56%] lg:w-[48%] xl:w-[44%] h-full flex flex-col border-l border-border/60 glass-panel">
        {/* toolbar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-background/60">
          <div className="h-8 w-8 rounded-lg bg-amber-500/15 grid place-items-center shrink-0">
            <FileText className="h-4 w-4 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-tight">Relatório Técnico A4</p>
            <p className="text-[10px] text-muted-foreground">Preview em tempo real · sincronizado com o mapa</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onFitFeature}
            disabled={!selected}
            className="h-8 hidden sm:flex"
            title="Ajustar o mapa à feição selecionada"
          >
            <Crosshair className="h-3.5 w-3.5 mr-1.5" />
            Ajustar à feição
          </Button>
          <Button
            size="sm"
            onClick={() => window.print()}
            className="h-8 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-background font-semibold"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Imprimir / PDF
          </Button>
          <button
            onClick={() => setReportOpen(false)}
            className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* scrollable A4 preview */}
        <div className="flex-1 overflow-auto scrollbar-premium p-4 sm:p-6 bg-background/40">
          <div
            id="report-print-area"
            className="a4-page mx-auto rounded-sm"
            style={{ width: "210mm", minHeight: "297mm", padding: "14mm 14mm 12mm" }}
          >
            {/* Header band */}
            <div style={{ borderBottom: "3px solid #0f766e", paddingBottom: 8, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, color: "#0f766e", textTransform: "uppercase" }}>
                  Relatório Técnico Cartográfico
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", marginTop: 2 }}>
                  {reportTitle}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: 9, color: "#475569" }}>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>Web GIS Manaus</div>
                <div>Município de Manaus / AM</div>
                <div>{today}</div>
              </div>
            </div>

            {/* Map */}
            <div style={{ position: "relative", border: "1px solid #cbd5e1", borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
              <div style={{ height: 110, width: "100%" }}>
                <ReportMap />
              </div>
              <div style={{ position: "absolute", bottom: 4, left: 6, fontSize: 8, color: "#1e293b", background: "rgba(255,255,255,.82)", padding: "2px 5px", borderRadius: 3, border: "1px solid #cbd5e1" }}>
                Basemap: {BASEMAPS[basemap].label} · Centro: {fmtCoord(center[0], center[1])} · Zoom {zoom}
              </div>
              <div style={{ position: "absolute", top: 4, right: 6, fontSize: 8, fontWeight: 700, color: "#0f766e", background: "rgba(255,255,255,.82)", padding: "2px 6px", borderRadius: 3, border: "1px solid #cbd5e1" }}>
                N ↑
              </div>
            </div>

            {/* Feature table */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                {selected ? (isBairro ? "Feição selecionada — Bairro" : "Feição selecionada — Localidade") : "Nenhuma feição selecionada"}
              </div>
              {selected ? (
                <>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.k} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "3px 6px", fontWeight: 600, color: "#475569", width: "32%" }}>{r.k}</td>
                          <td style={{ padding: "3px 6px", color: "#0f172a" }}>{r.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5, marginTop: 4 }}>
                    <thead>
                      <tr style={{ background: "#0f766e", color: "#fff" }}>
                        <th style={{ padding: "3px 6px", textAlign: "left", fontSize: 9 }}>Área</th>
                        <th style={{ padding: "3px 6px", textAlign: "left", fontSize: 9 }}>Perímetro</th>
                        <th style={{ padding: "3px 6px", textAlign: "left", fontSize: 9 }}>Centroide (lat, lng)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "3px 6px" }}>{fmtHa(selected.areaHa * 10000)}</td>
                        <td style={{ padding: "3px 6px" }}>{fmtM(selected.perimM)}</td>
                        <td style={{ padding: "3px 6px", fontFamily: "monospace" }}>{fmtCoord(selected.center[0], selected.center[1])}</td>
                      </tr>
                    </tbody>
                  </table>
                </>
              ) : (
                <div style={{ fontSize: 9, color: "#64748b", fontStyle: "italic", padding: "6px 0" }}>
                  Selecione um bairro ou localidade no mapa para preencher esta tabela.
                </div>
              )}
            </div>

            {/* Legend */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Legenda — camadas ativas no recorte
              </div>
              {visibleZonas.length === 0 && visibleTipos.length === 0 && (
                <div style={{ fontSize: 9, color: "#64748b", fontStyle: "italic" }}>
                  Nenhuma camada ativa.
                </div>
              )}
              {visibleZonas.length > 0 && (
                <div style={{ marginBottom: 4 }}>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#475569", marginBottom: 2 }}>Bairros por zona</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    {visibleZonas.map((z) => (
                      <div key={z} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8.5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: ZONA_COLORS[z], border: "1px solid #00000020" }} />
                        {z}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {visibleTipos.length > 0 && (
                <div>
                  <div style={{ fontSize: 8.5, fontWeight: 700, color: "#475569", marginBottom: 2 }}>Localidades por tipo</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    {visibleTipos.map((t) => (
                      <div key={t} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 8.5 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 2, background: TIPO_COLORS[t], border: "1px solid #00000020" }} />
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>
                Observações técnicas
              </div>
              <div
                style={{
                  border: "1px solid #cbd5e1",
                  borderRadius: 4,
                  padding: 0,
                  minHeight: 48,
                  background: "#fff",
                }}
              >
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Digite observações, fontes, metodologia ou anotações de campo..."
                  style={{
                    width: "100%",
                    minHeight: 48,
                    border: "none",
                    outline: "none",
                    resize: "vertical",
                    padding: "5px 7px",
                    fontSize: 9.5,
                    fontFamily: "inherit",
                    color: "#0f172a",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 10, paddingTop: 6, borderTop: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", fontSize: 8, color: "#64748b" }}>
              <div>
                <strong style={{ color: "#0f172a" }}>Fonte:</strong> Dados vetoriais — Bairros &amp; Localidades de Manaus/AM · Web GIS Manaus
              </div>
              <div>Página 1/1</div>
            </div>
          </div>
        </div>

        {/* title editor (outside print area) */}
        <div className="border-t border-border/50 px-4 py-3 bg-background/60">
          <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            Título do relatório
          </label>
          <Input
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            className="mt-1 h-8 text-sm"
            placeholder="Relatório Técnico Cartográfico"
          />
        </div>
      </aside>
    </div>
  );
}
