import type { BasemapKey } from "./types";

/** Manaus centroid (used for initial map view) */
export const MANAUS_CENTER: [number, number] = [-3.07, -60.025];
export const MANAUS_INITIAL_ZOOM = 11;

/** Basemap definitions. Note: hybrid layers Google labels are added as an overlay. */
export interface BasemapDef {
  key: BasemapKey;
  label: string;
  description: string;
  url: string;
  attribution: string;
  maxZoom: number;
  /** optional overlay tile url (used for hybrid labels) */
  overlayUrl?: string;
  overlayAttribution?: string;
  /** dark = tile set is already dark; used for theming labels */
  dark?: boolean;
}

export const BASEMAPS: Record<BasemapKey, BasemapDef> = {
  vector: {
    key: "vector",
    label: "Vetor (OSM)",
    description: "Mapa de ruas limpo, OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap",
    maxZoom: 19,
  },
  satellite: {
    key: "satellite",
    label: "Satélite (Esri)",
    description: "Imagem de satélite de alta resolução",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "&copy; Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },
  hybrid: {
    key: "hybrid",
    label: "Híbrido (Google)",
    description: "Satélite com logradouros sobrepostos",
    url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    attribution: "&copy; Google",
    maxZoom: 20,
    overlayUrl: "https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}",
    overlayAttribution: "&copy; Google",
  },
  dark: {
    key: "dark",
    label: "Tema Escuro",
    description: "CartoDB Dark Matter — contraste premium",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
    maxZoom: 20,
    dark: true,
  },
};

/** Zona colour palette — distinct, harmonious, avoids blue/indigo. */
export const ZONA_COLORS: Record<string, string> = {
  "ZONA NORTE": "#34d399", // emerald
  "ZONA SUL": "#fb7185", // rose
  "ZONA LESTE": "#fbbf24", // amber
  "ZONA OESTE": "#2dd4bf", // teal
  "ZONA CENTRO-OESTE": "#e879f9", // fuchsia
  "ZONA CENTRO-SUL": "#fb923c", // orange
};

export const ZONA_ORDER = [
  "ZONA NORTE",
  "ZONA SUL",
  "ZONA LESTE",
  "ZONA OESTE",
  "ZONA CENTRO-OESTE",
  "ZONA CENTRO-SUL",
];

/** Localidade tipo palette */
export const TIPO_COLORS: Record<string, string> = {
  COMUNIDADE: "#f87171",
  RESIDENCIAL: "#34d399",
  LOTEAMENTO: "#fbbf24",
  CONDOMÍNIO: "#a78bfa",
  INVASÃO: "#f472b6",
  CONJUNTO: "#22d3ee",
  PARQUE: "#4ade80",
  VILA: "#fb923c",
  NÚCLEO: "#e879f9",
  UNIVERSIDADE: "#facc15",
  "SEM DENOMINAÇÃO": "#94a3b8",
};

export const TIPO_ORDER = [
  "COMUNIDADE",
  "RESIDENCIAL",
  "LOTEAMENTO",
  "CONDOMÍNIO",
  "INVASÃO",
  "CONJUNTO",
  "PARQUE",
  "VILA",
  "NÚCLEO",
  "UNIVERSIDADE",
  "SEM DENOMINAÇÃO",
];

/** Convert hex (#rrggbb) to rgba string */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
