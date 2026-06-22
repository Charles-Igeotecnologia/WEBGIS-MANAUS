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

export function ReportPanel() {
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
  const fitToFeature = useGisStore((s) => s.fitToFeature);
  const setView = useGisStore((s) => s.setView);

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    [],
  );

  const zoomIn = () => setView(center, Math.min(20, zoom + 1));
  const zoomOut = () => setView(center, Math.max(1, zoom - 1));

  if (!reportOpen) return null;

  const isBairro = selected?.kind === "bairro";
  const f = selected?.feature as any;
  const props = f?.properties;

  const rows: { k: string; v: string }[] = selected
    ? isBairro
      ? [
          { k: "Bairro", v: props.NOME_BAIRR },
          { k: "Zona", v: props.ZONAS },
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
            onClick={fitToFeature}
            disabled={!selected}
            className="h-8 hidden sm:flex shrink-0"
            title="Ajustar o mapa à feição selecionada"
          >
            <Crosshair className="h-3.5 w-3.5 mr-1.5" />
            Ajustar à feição
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomIn}
            className="h-8 w-8 hidden sm:flex shrink-0"
            title="Aumentar Zoom (+)"
          >
            <span className="font-bold text-base leading-none">+</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={zoomOut}
            className="h-8 w-8 hidden sm:flex shrink-0"
            title="Diminuir Zoom (-)"
          >
            <span className="font-bold text-base leading-none">-</span>
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
            className="a4-page mx-auto rounded-sm relative flex flex-col"
            style={{ width: "210mm", minHeight: "297mm", padding: "14mm 14mm 12mm", boxSizing: "border-box" }}
          >
            {/* Header band */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "3px solid #0f766e", paddingBottom: 10, marginBottom: 14 }}>
              <div>
                <span style={{ fontSize: 9, letterSpacing: 2, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", display: "block" }}>
                  Prefeitura Municipal de Manaus · Web GIS
                </span>
                <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "2px 0 0 0", lineHeight: 1.1 }}>
                  {reportTitle}
                </h1>
              </div>
              <div style={{ textAlign: "right", fontSize: 9, color: "#475569", lineHeight: 1.3 }}>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>Território Digital e Igeotecnologia</div>
                <div>Manaus, Amazonas, Brasil</div>
                <div style={{ fontWeight: 600, color: "#0f766e", marginTop: 2 }}>{today}</div>
              </div>
            </div>

            {/* Map Container */}
            <div style={{ position: "relative", border: "1px solid #cbd5e1", borderRadius: 6, overflow: "hidden", marginBottom: 14, boxShadow: "0 2px 4px rgba(0,0,0,0.03)" }}>
              <div style={{ height: 280, width: "100%" }}>
                <ReportMap />
              </div>
              
              {/* Floating Map Info Overlay */}
              <div style={{ position: "absolute", bottom: 6, left: 8, zIndex: 1000, fontSize: 8, fontWeight: 500, color: "#334155", background: "rgba(255,255,255,.9)", padding: "3px 6px", borderRadius: 4, border: "1px solid #e2e8f0", backdropFilter: "blur(2px)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <strong>Base:</strong> {BASEMAPS[basemap].label} · <strong>Centro:</strong> {fmtCoord(center[0], center[1])} · <strong>Zoom:</strong> {zoom}
              </div>
              
              {/* North Arrow */}
              <div style={{ position: "absolute", top: 8, right: 8, zIndex: 1000, fontSize: 10, fontWeight: 800, color: "#0f766e", background: "rgba(255,255,255,.9)", width: 24, height: 24, borderRadius: 12, border: "1px solid #e2e8f0", display: "grid", placeItems: "center", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", select: "none" }}>
                N
              </div>

              {/* Floating Map Controls in Preview Mode (Hidden in Print) */}
              <div
                className="print:hidden absolute top-3 left-3 flex flex-col gap-1.5"
                style={{ zIndex: 1000 }}
              >
                {selected && (
                  <button
                    onClick={fitToFeature}
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    className="flex items-center justify-center h-8 px-2.5 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors gap-1.5 cursor-pointer"
                    title="Focar mapa na feição selecionada"
                  >
                    <Crosshair className="h-3.5 w-3.5 text-emerald-600" />
                    Focar Feição
                  </button>
                )}
                <div className="flex gap-1.5">
                  <button
                    onClick={zoomIn}
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Aumentar Zoom (+)"
                  >
                    +
                  </button>
                  <button
                    onClick={zoomOut}
                    style={{
                      background: "#ffffff",
                      color: "#0f172a",
                      border: "1px solid #cbd5e1",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                    className="flex items-center justify-center h-8 w-8 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Diminuir Zoom (-)"
                  >
                    -
                  </button>
                </div>
              </div>
            </div>

            {/* Feature details table */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 4, height: 10, background: "#0f766e", borderRadius: 2 }} />
                {selected ? (isBairro ? "Informações do Bairro Selecionado" : "Informações da Localidade Selecionada") : "Nenhuma feição selecionada"}
              </div>
              
              {selected ? (
                <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.02)" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9.5 }}>
                    <tbody>
                      {rows.map((r, idx) => (
                        <tr key={r.k} style={{ borderBottom: idx === rows.length - 1 ? "none" : "1px solid #e2e8f0", background: idx % 2 === 0 ? "#f8fafc" : "#fff" }}>
                          <td style={{ padding: "5px 10px", fontWeight: 700, color: "#475569", width: "30%" }}>{r.k}</td>
                          <td style={{ padding: "5px 10px", color: "#0f172a" }}>{r.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Spatial Metrics Sub-Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid #e2e8f0", background: "#f1f5f9" }}>
                    <div style={{ padding: "6px 10px", borderRight: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 7.5, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Área</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#0f766e" }}>{fmtHa(selected.areaHa * 10000)}</div>
                    </div>
                    <div style={{ padding: "6px 10px", borderRight: "1px solid #e2e8f0" }}>
                      <div style={{ fontSize: 7.5, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Perímetro</div>
                      <div style={{ fontSize: 10, fontWeight: 800, color: "#0f766e" }}>{fmtM(selected.perimM)}</div>
                    </div>
                    <div style={{ padding: "6px 10px" }}>
                      <div style={{ fontSize: 7.5, fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>Coordenadas (Lat, Lng)</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#0f172a", fontFamily: "monospace" }}>{fmtCoord(selected.center[0], selected.center[1])}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 9.5, color: "#64748b", fontStyle: "italic", padding: "12px", border: "1px dashed #cbd5e1", borderRadius: 6, textAlign: "center", background: "#f8fafc" }}>
                  Nenhum polígono ou localidade selecionado. Selecione uma feição no mapa para visualizar e documentar suas propriedades.
                </div>
              )}
            </div>

            {/* Legend Section */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 4, height: 10, background: "#0f766e", borderRadius: 2 }} />
                Legenda Temática
              </div>
              <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "8px 12px", background: "#f8fafc" }}>
                {visibleZonas.length === 0 && visibleTipos.length === 0 && (
                  <div style={{ fontSize: 9, color: "#64748b", fontStyle: "italic", textAlign: "center", padding: "4px 0" }}>
                    Nenhuma camada de dados ativa no recorte do mapa.
                  </div>
                )}
                {visibleZonas.length > 0 && (
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 7.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: 3 }}>Zonas Urbanas (Bairros)</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                      {visibleZonas.map((z) => (
                        <div key={z} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, fontWeight: 500, color: "#1e293b" }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: ZONA_COLORS[z], border: "1px solid rgba(0,0,0,0.15)", display: "inline-block" }} />
                          {z}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {visibleTipos.length > 0 && (
                  <div>
                    <div style={{ fontSize: 7.5, fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.2px", marginBottom: 3 }}>Tipos de Localidades</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px" }}>
                      {visibleTipos.map((t) => (
                        <div key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8.5, fontWeight: 500, color: "#1e293b" }}>
                          <span style={{ width: 8, height: 8, borderRadius: "50%", background: TIPO_COLORS[t], border: "1px solid rgba(0,0,0,0.15)", display: "inline-block" }} />
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes Section */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#0f766e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 4, height: 10, background: "#0f766e", borderRadius: 2 }} />
                Notas e Considerações Técnicas
              </div>
              <div style={{ border: "1px solid #cbd5e1", borderRadius: 6, overflow: "hidden", background: "#fff", boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)" }}>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Redija considerações técnicas adicionais, pareceres, metodologia aplicada, fontes secundárias ou informações de levantamento de campo..."
                  style={{
                    width: "100%",
                    minHeight: 65,
                    border: "none",
                    outline: "none",
                    resize: "none",
                    padding: "8px 10px",
                    fontSize: 9.5,
                    lineHeight: 1.4,
                    fontFamily: "inherit",
                    color: "#0f172a",
                    background: "transparent",
                  }}
                />
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: "auto", paddingTop: 8, borderTop: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", fontSize: 8, color: "#64748b" }}>
              <div>
                <strong>Fonte Cartográfica:</strong> Dados vetoriais integrados — Bairros &amp; Localidades de Manaus/AM
              </div>
              <div>Território Digital - Web GIS Manaus · Documento Técnico · Página 1 de 1</div>
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
