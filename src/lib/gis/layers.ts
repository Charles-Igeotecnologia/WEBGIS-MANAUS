import type Ltype from "leaflet";
import type { PathOptions } from "leaflet";
import { hexToRgba, ZONA_COLORS, TIPO_COLORS } from "./constants";
import type { BairrosFeature, LocalidadesFeature } from "./types";

/** Style for a bairro polygon */
export function bairroStyle(zona: string, isSelected = false): PathOptions {
  const color = ZONA_COLORS[zona] ?? "#94a3b8";
  return {
    color: isSelected ? "#ffffff" : color,
    weight: isSelected ? 3 : 1.4,
    opacity: 1,
    fillColor: color,
    fillOpacity: isSelected ? 0.42 : 0.16,
    dashArray: isSelected ? undefined : undefined,
  };
}

/** Style for a localidade polygon */
export function localidadeStyle(tipo: string, isSelected = false): PathOptions {
  const color = TIPO_COLORS[tipo] ?? "#94a3b8";
  return {
    color: isSelected ? "#ffffff" : color,
    weight: isSelected ? 2.6 : 1,
    opacity: 1,
    fillColor: color,
    fillOpacity: isSelected ? 0.55 : 0.32,
  };
}

/** Hover style boost */
export function hoverStyle(base: PathOptions): PathOptions {
  return {
    ...base,
    weight: (base.weight ?? 1) + 1,
    fillOpacity: Math.min(1, (base.fillOpacity ?? 0.2) + 0.18),
  };
}

/**
 * Build the permanent halo label tooltip options for a bairro.
 * Returns tooltip options + the html content.
 */
export function bairroLabelContent(name: string): string {
  return `<span class="bairro-label-text">${escapeHtml(name)}</span>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type LeafletRef = typeof Ltype;
