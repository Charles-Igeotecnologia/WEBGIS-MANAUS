"use client";

import {
  X,
  Building2,
  MapPin,
  Ruler,
  Maximize,
  Crosshair,
  ExternalLink,
  FileText,
  Hash,
} from "lucide-react";
import { useGisStore } from "@/lib/gis/store";
import { ZONA_COLORS, TIPO_COLORS } from "@/lib/gis/constants";
import { fmtHa, fmtM, googleMapsLink } from "@/lib/gis/geo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function FeatureInfo() {
  const selected = useGisStore((s) => s.selected);
  const setSelected = useGisStore((s) => s.setSelected);
  const setReportOpen = useGisStore((s) => s.setReportOpen);

  if (!selected) return null;
  const isBairro = selected.kind === "bairro";
  const f = selected.feature as any;
  const props = f.properties;
  const color = isBairro ? ZONA_COLORS[props.ZONAS] : TIPO_COLORS[props.TIPO_1];
  const [lat, lng] = selected.center;

  const rows: { label: string; value: string }[] = isBairro
    ? [
        { label: "Bairro", value: props.NOME_BAIRR },
        { label: "Zona", value: props.ZONAS },
        { label: "OBJECTID", value: String(props.OBJECTID) },
        { label: "Município", value: "Manaus" },
        { label: "UF", value: "AM" },
      ]
    : [
        { label: "Localidade", value: props.NOME_LOCAL },
        { label: "Tipo", value: props.TIPO_1 },
        { label: "Bairro", value: props.BAIRRO_1 },
        { label: "Zona", value: props.ZONAS },
        { label: "Município", value: props.MUNICIPI_1 },
        { label: "UF", value: props.ESTADO },
      ];

  return (
    <div className="glass-panel rounded-2xl border border-border/60 overflow-hidden shadow-2xl">
      {/* header */}
      <div className="relative p-4 border-b border-border/50">
        <div
          className="absolute inset-0 opacity-25"
          style={{ background: `linear-gradient(135deg, ${color}, transparent 70%)` }}
        />
        <div className="relative flex items-start gap-3">
          <div
            className="h-10 w-10 rounded-xl grid place-items-center shrink-0 ring-1"
            style={{ background: `${color}22`, borderColor: color }}
          >
            {isBairro ? (
              <Building2 className="h-5 w-5" style={{ color }} />
            ) : (
              <MapPin className="h-5 w-5" style={{ color }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <Badge
                variant="outline"
                className="text-[10px] py-0 px-1.5"
                style={{ borderColor: `${color}66`, color }}
              >
                {isBairro ? "BAIRRO" : "LOCALIDADE"}
              </Badge>
            </div>
            <h3 className="text-base font-bold leading-tight truncate">
              {isBairro ? props.NOME_BAIRR : props.NOME_LOCAL}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isBairro ? props.ZONAS : `${props.TIPO_1} · ${props.BAIRRO_1}`}
            </p>
          </div>
          <button
            onClick={() => setSelected(null)}
            className="p-1.5 rounded-lg hover:bg-secondary/70 text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* metrics */}
      <div className="grid grid-cols-3 gap-px bg-border/30 border-b border-border/50">
        <Metric icon={Maximize} label="Área" value={fmtHa(selected.areaHa * 10000)} />
        <Metric icon={Ruler} label="Perímetro" value={fmtM(selected.perimM)} />
        <Metric icon={Crosshair} label="Centroide" value={`${lat.toFixed(4)}, ${lng.toFixed(4)}`} small />
      </div>

      {/* properties */}
      <div className="p-4 space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-3 text-sm py-1">
            <span className="text-muted-foreground text-xs">{r.label}</span>
            <span className="font-medium text-right truncate">{r.value}</span>
          </div>
        ))}
      </div>

      {/* actions */}
      <div className="p-3 border-t border-border/50 flex flex-col gap-2">
        <Button
          onClick={() => setReportOpen(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-background font-semibold"
        >
          <FileText className="mr-2 h-4 w-4" />
          Gerar Relatório A4
        </Button>
        <a
          href={googleMapsLink(lat, lng)}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-lg bg-secondary/60 hover:bg-secondary border border-border/50 text-sm font-medium transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
          Abrir no Google Maps
        </a>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  small,
}: {
  icon: typeof Hash;
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="bg-card/60 p-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        <Icon className="h-3 w-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <p className={`font-bold ${small ? "text-xs" : "text-sm"} leading-tight`}>{value}</p>
    </div>
  );
}
