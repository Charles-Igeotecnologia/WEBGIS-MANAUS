import type { Feature, FeatureCollection, Polygon } from "geojson";

/** Bairros feature properties */
export interface BairrosProps {
  OBJECTID: number;
  NOME_BAIRR: string;
  ZONAS: string;
}

/** Localidades feature properties */
export interface LocalidadesProps {
  NOME_LOCAL: string;
  ESTADO: string;
  MUNICIPI_1: string;
  TIPO_1: string;
  NOME: string;
  BAIRRO_1: string;
  ZONAS: string;
}

export type BairrosFeature = Feature<Polygon, BairrosProps>;
export type LocalidadesFeature = Feature<Polygon, LocalidadesProps>;
export type BairrosCollection = FeatureCollection<Polygon, BairrosProps>;
export type LocalidadesCollection = FeatureCollection<Polygon, LocalidadesProps>;

/** A generic "search hit" used by the autocomplete */
export interface SearchHit {
  id: string;
  kind: "bairro" | "localidade";
  name: string;
  subtitle: string;
  zona: string;
  /** centroid [lat, lng] */
  center: [number, number];
  feature: BairrosFeature | LocalidadesFeature;
}

/** Reference point used by the proximity tool */
export interface RefPoint {
  id: string;
  name: string;
  kind: string;
  zona?: string;
  lat: number;
  lng: number;
  /** metres from the clicked point */
  distance: number;
}

export type ToolMode =
  | "none"
  | "measure"
  | "proximity"
  | "identify";

export type BasemapKey = "vector" | "satellite" | "hybrid" | "dark";

export interface LayerVisibility {
  bairros: boolean;
  localidades: boolean;
  bairroLabels: boolean;
  /** which zonas of bairros are visible */
  zonas: Record<string, boolean>;
  /** which tipos of localidades are visible */
  tipos: Record<string, boolean>;
}

export interface SelectedFeature {
  kind: "bairro" | "localidade";
  feature: BairrosFeature | LocalidadesFeature;
  center: [number, number];
  areaHa: number;
  perimM: number;
}
