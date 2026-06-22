import { create } from "zustand";
import type {
  BasemapKey,
  LayerVisibility,
  RefPoint,
  SearchHit,
  SelectedFeature,
  ToolMode,
  BairrosCollection,
  LocalidadesCollection,
} from "./types";
import { TIPO_ORDER, ZONA_ORDER } from "./constants";
import { MANAUS_CENTER, MANAUS_INITIAL_ZOOM } from "./constants";

interface GisState {
  // data
  bairros: BairrosCollection | null;
  localidades: LocalidadesCollection | null;
  dataLoading: boolean;
  dataError: string | null;

  // map view (sync source-of-truth used by main map AND report map)
  basemap: BasemapKey;
  center: [number, number];
  zoom: number;

  // layers
  layers: LayerVisibility;

  // tools
  tool: ToolMode;

  // selection
  selected: SelectedFeature | null;

  // proximity
  proximityOrigin: [number, number] | null;
  proximityResults: RefPoint[];

  // report
  reportOpen: boolean;
  reportNotes: string;
  reportTitle: string;

  // actions
  setBairros: (d: BairrosCollection) => void;
  setLocalidades: (d: LocalidadesCollection) => void;
  setDataLoading: (b: boolean) => void;
  setDataError: (s: string | null) => void;

  setBasemap: (b: BasemapKey) => void;
  setView: (center: [number, number], zoom: number) => void;

  toggleBairros: () => void;
  toggleLocalidades: () => void;
  toggleBairroLabels: () => void;
  toggleZona: (z: string) => void;
  toggleTipo: (t: string) => void;
  setAllZonas: (v: boolean) => void;
  setAllTipos: (v: boolean) => void;

  setTool: (t: ToolMode) => void;

  setSelected: (s: SelectedFeature | null) => void;

  setProximity: (origin: [number, number] | null, results: RefPoint[]) => void;
  clearProximity: () => void;

  setReportOpen: (b: boolean) => void;
  setReportNotes: (s: string) => void;
  setReportTitle: (s: string) => void;
}

const allZonasOn = Object.fromEntries(ZONA_ORDER.map((z) => [z, true]));
const allTiposOn = Object.fromEntries(TIPO_ORDER.map((t) => [t, true]));

export const useGisStore = create<GisState>((set) => ({
  bairros: null,
  localidades: null,
  dataLoading: true,
  dataError: null,

  basemap: "satellite",
  center: MANAUS_CENTER,
  zoom: MANAUS_INITIAL_ZOOM,

  layers: {
    bairros: true,
    localidades: true,
    bairroLabels: true,
    zonas: { ...allZonasOn },
    tipos: { ...allTiposOn },
  },

  tool: "none",

  selected: null,

  proximityOrigin: null,
  proximityResults: [],

  reportOpen: false,
  reportNotes: "",
  reportTitle: "Relatório Técnico Cartográfico",

  setBairros: (d) => set({ bairros: d }),
  setLocalidades: (d) => set({ localidades: d }),
  setDataLoading: (b) => set({ dataLoading: b }),
  setDataError: (s) => set({ dataError: s }),

  setBasemap: (b) => set({ basemap: b }),
  setView: (center, zoom) => set({ center, zoom }),

  toggleBairros: () =>
    set((s) => ({ layers: { ...s.layers, bairros: !s.layers.bairros } })),
  toggleLocalidades: () =>
    set((s) => ({ layers: { ...s.layers, localidades: !s.layers.localidades } })),
  toggleBairroLabels: () =>
    set((s) => ({ layers: { ...s.layers, bairroLabels: !s.layers.bairroLabels } })),
  toggleZona: (z) =>
    set((s) => ({
      layers: {
        ...s.layers,
        zonas: { ...s.layers.zonas, [z]: !s.layers.zonas[z] },
      },
    })),
  toggleTipo: (t) =>
    set((s) => ({
      layers: {
        ...s.layers,
        tipos: { ...s.layers.tipos, [t]: !s.layers.tipos[t] },
      },
    })),
  setAllZonas: (v) =>
    set((s) => ({
      layers: {
        ...s.layers,
        zonas: Object.fromEntries(ZONA_ORDER.map((z) => [z, v])),
      },
    })),
  setAllTipos: (v) =>
    set((s) => ({
      layers: {
        ...s.layers,
        tipos: Object.fromEntries(TIPO_ORDER.map((t) => [t, v])),
      },
    })),

  setTool: (t) => set({ tool: t }),

  setSelected: (sel) => set({ selected: sel }),

  setProximity: (origin, results) =>
    set({ proximityOrigin: origin, proximityResults: results }),
  clearProximity: () =>
    set({ proximityOrigin: null, proximityResults: [] }),

  setReportOpen: (b) => set({ reportOpen: b }),
  setReportNotes: (s) => set({ reportNotes: s }),
  setReportTitle: (s) => set({ reportTitle: s }),
}));

/** Build a flat searchable index from the loaded data. */
export function buildSearchIndex(
  bairros: BairrosCollection | null,
  localidades: LocalidadesCollection | null,
): SearchHit[] {
  const hits: SearchHit[] = [];
  if (bairros) {
    bairros.features.forEach((f, i) => {
      // centroid returns [lat,lng]
      // we re-compute lazily here to avoid importing geo into a potentially SSR context
      hits.push({
        id: `b-${i}`,
        kind: "bairro",
        name: f.properties.NOME_BAIRR,
        subtitle: "Bairro",
        zona: f.properties.ZONAS,
        center: [0, 0], // filled below
        feature: f,
      });
    });
  }
  if (localidades) {
    localidades.features.forEach((f, i) => {
      hits.push({
        id: `l-${i}`,
        kind: "localidade",
        name: f.properties.NOME_LOCAL,
        subtitle: `${f.properties.TIPO_1} · ${f.properties.BAIRRO_1}`,
        zona: f.properties.ZONAS,
        center: [0, 0],
        feature: f,
      });
    });
  }
  return hits;
}
