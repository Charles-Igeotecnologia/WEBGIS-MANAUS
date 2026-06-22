"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useGisStore } from "@/lib/gis/store";
import { BASEMAPS } from "@/lib/gis/constants";
import { bairroStyle, localidadeStyle, bairroLabelContent } from "@/lib/gis/layers";
import { featureCentroid } from "@/lib/gis/geo";

/**
 * Static, non-interactive mirror of the main map for the A4 report.
 * Inherits center/zoom/basemap + visible layers from the store (one-way sync).
 */
export function ReportMap() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const overlayRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<{
    bairros: L.LayerGroup | null;
    localidades: L.LayerGroup | null;
    highlight: L.LayerGroup | null;
  }>({ bairros: null, localidades: null, highlight: null });

  const basemap = useGisStore((s) => s.basemap);
  const center = useGisStore((s) => s.center);
  const zoom = useGisStore((s) => s.zoom);
  const layers = useGisStore((s) => s.layers);
  const bairros = useGisStore((s) => s.bairros);
  const localidades = useGisStore((s) => s.localidades);
  const selected = useGisStore((s) => s.selected);
  const fitRequestNonce = useGisStore((s) => s.fitRequestNonce);

  /* init */
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      preferCanvas: true,
    });
    mapRef.current = map;
    layersRef.current.bairros = L.layerGroup().addTo(map);
    layersRef.current.localidades = L.layerGroup().addTo(map);
    layersRef.current.highlight = L.layerGroup().addTo(map);

    // invalidateSize after mount (container sizing)
    setTimeout(() => map.invalidateSize(), 120);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  /* basemap */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const def = BASEMAPS[basemap];
    if (baseRef.current) {
      map.removeLayer(baseRef.current);
      baseRef.current = null;
    }
    if (overlayRef.current) {
      map.removeLayer(overlayRef.current);
      overlayRef.current = null;
    }
    const base = L.tileLayer(def.url, {
      maxZoom: def.maxZoom,
      subdomains: "abc",
    });
    base.addTo(map);
    base.bringToBack();
    baseRef.current = base;
    if (def.overlayUrl) {
      const ov = L.tileLayer(def.overlayUrl, { maxZoom: def.maxZoom, subdomains: "abc" });
      ov.addTo(map);
      overlayRef.current = ov;
    }
  }, [basemap]);

  /* view sync (one-way) */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setView(center, zoom, { animate: false });
    setTimeout(() => map.invalidateSize(), 60);
  }, [center, zoom]);

  /* React to fit request (Ajustar à feição) */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selected || fitRequestNonce === 0) return;
    try {
      if (selected.kind === "localidade") {
        map.setView(selected.center, 15, { animate: false });
      } else {
        const bounds = L.geoJSON(selected.feature).getBounds();
        map.fitBounds(bounds, { padding: [20, 20] });
      }
      setTimeout(() => map.invalidateSize(), 60);
    } catch (e) {
      console.error("Erro ao focar limites da feição no relatório", e);
    }
  }, [fitRequestNonce, selected]);

  /* bairros */
  useEffect(() => {
    const g = layersRef.current.bairros;
    if (!g) return;
    g.clearLayers();
    if (!bairros || !layers.bairros) return;
    bairros.features.forEach((f) => {
      const zona = f.properties.ZONAS;
      if (!layers.zonas[zona]) return;
      L.geoJSON(f, {
        style: () => bairroStyle(zona, false),
        interactive: false,
      }).addTo(g);

      if (layers.bairroLabels) {
        const [lat, lng] = featureCentroid(f);
        L.marker([lat, lng], {
          icon: L.divIcon({
            className: "bairro-halo-label",
            html: bairroLabelContent(f.properties.NOME_BAIRR),
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
        }).addTo(g);
      }
    });
  }, [bairros, layers.bairros, layers.bairroLabels, JSON.stringify(layers.zonas)]);

  /* localidades */
  useEffect(() => {
    const g = layersRef.current.localidades;
    if (!g) return;
    g.clearLayers();
    if (!localidades || !layers.localidades) return;
    localidades.features.forEach((f) => {
      if (!layers.tipos[f.properties.TIPO_1]) return;
      L.geoJSON(f, {
        style: () => localidadeStyle(f.properties.TIPO_1, false),
        interactive: false,
      }).addTo(g);
    });
  }, [localidades, layers.localidades, JSON.stringify(layers.tipos)]);

  /* selection highlight + label */
  useEffect(() => {
    const g = layersRef.current.highlight;
    const map = mapRef.current;
    if (!g || !map) return;
    g.clearLayers();
    if (!selected) return;
    const style: L.PathOptions =
      selected.kind === "bairro"
        ? bairroStyle(selected.feature.properties.ZONAS, true)
        : localidadeStyle(selected.feature.properties.TIPO_1, true);
    L.geoJSON(selected.feature, { style: () => style, interactive: false }).addTo(g);
    // label marker on the feature
    const [lat, lng] = featureCentroid(selected.feature as any);
    const name =
      selected.kind === "bairro"
        ? (selected.feature as any).properties.NOME_BAIRR
        : (selected.feature as any).properties.NOME_LOCAL;
    L.marker([lat, lng], {
      interactive: false,
      icon: L.divIcon({
        className: "",
        html: `<div style="background:rgba(10,14,20,.9);color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;white-space:nowrap;border:1px solid rgba(255,255,255,.3);text-shadow:0 1px 2px rgba(0,0,0,.6)">${name}</div>`,
        iconSize: [0, 0],
      }),
    }).addTo(g);
  }, [selected]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      style={{ background: "#0a0e14" }}
    />
  );
}
