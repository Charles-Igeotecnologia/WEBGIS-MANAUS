"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { useGisStore } from "@/lib/gis/store";
import { BASEMAPS, MANAUS_CENTER, MANAUS_INITIAL_ZOOM } from "@/lib/gis/constants";
import { bairroStyle, localidadeStyle, bairroLabelContent } from "@/lib/gis/layers";
import { featureCentroid, featureArea, featurePerimeter, haversine, fmtM, fmtHa } from "@/lib/gis/geo";
import type { BairrosFeature, LocalidadesFeature, SelectedFeature } from "@/lib/gis/types";

interface MapViewProps {
  onReady: (map: L.Map) => void;
}

export default function MapView({ onReady }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const baseLayerRef = useRef<L.TileLayer | null>(null);
  const overlayLayerRef = useRef<L.TileLayer | null>(null);
  const bairrosGroupRef = useRef<L.LayerGroup | null>(null);
  const localidadesGroupRef = useRef<L.LayerGroup | null>(null);
  const highlightRef = useRef<L.LayerGroup | null>(null);
  const labelsGroupRef = useRef<L.LayerGroup | null>(null);
  const measureGroupRef = useRef<L.LayerGroup | null>(null);
  const measureStateRef = useRef<{
    points: L.LatLng[];
    polyline: L.Polyline | null;
    markers: L.Marker[];
    finishedItems: L.Layer[];
  }>({ points: [], polyline: null, markers: [], finishedItems: [] });
  const proximityGroupRef = useRef<L.LayerGroup | null>(null);
  const clickHandlerRef = useRef<((e: L.LeafletMouseEvent) => void) | null>(null);

  const basemap = useGisStore((s) => s.basemap);
  const layers = useGisStore((s) => s.layers);
  const bairros = useGisStore((s) => s.bairros);
  const localidades = useGisStore((s) => s.localidades);
  const tool = useGisStore((s) => s.tool);
  const selected = useGisStore((s) => s.selected);
  const proximityOrigin = useGisStore((s) => s.proximityOrigin);
  const proximityResults = useGisStore((s) => s.proximityResults);
  const setView = useGisStore((s) => s.setView);
  const setSelected = useGisStore((s) => s.setSelected);
  const setProximity = useGisStore((s) => s.setProximity);

  /* ===================== helper functions (declared before effects) ===================== */

  function selectFeature(kind: "bairro" | "localidade", f: BairrosFeature | LocalidadesFeature) {
    const [lat, lng] = featureCentroid(f);
    const area = featureArea(f);
    const perim = featurePerimeter(f);
    const sel: SelectedFeature = {
      kind,
      feature: f,
      center: [lat, lng],
      areaHa: area / 10000,
      perimM: perim,
    };
    setSelected(sel);
  }

  function polylineLength(pts: L.LatLng[]): number {
    let total = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      total += haversine([pts[i].lng, pts[i].lat], [pts[i + 1].lng, pts[i + 1].lat]);
    }
    return total;
  }

  function polygonArea(pts: L.LatLng[]): number {
    const ring = pts.map((p) => [p.lng, p.lat] as [number, number]);
    return ringAreaLocal(ring);
  }

  function ringCentroid(pts: L.LatLng[]): L.LatLng {
    let cx = 0;
    let cy = 0;
    pts.forEach((p) => {
      cx += p.lat;
      cy += p.lng;
    });
    return L.latLng(cx / pts.length, cy / pts.length);
  }

  function addMeasurePoint(latlng: L.LatLng) {
    const st = measureStateRef.current;
    const group = measureGroupRef.current;
    if (!group) return;
    st.points.push(latlng);
    const color = "#fbbf24";
    const dot = L.circleMarker(latlng, {
      radius: 5,
      color: "#fff",
      weight: 2,
      fillColor: color,
      fillOpacity: 1,
    });
    dot.addTo(group);
    st.markers.push(dot);

    if (st.polyline) {
      st.polyline.setLatLngs(st.points);
    } else if (st.points.length >= 2) {
      st.polyline = L.polyline(st.points, { color, weight: 2.5, dashArray: "6 6" }).addTo(group);
    }

    const total = polylineLength(st.points);
    dot.bindTooltip(
      `<div style="font-weight:700">${fmtM(total)}</div><div style="font-size:10px;opacity:.8">${st.points.length} pt(s) · clique para adicionar</div>`,
      { className: "gis-tooltip", direction: "top", permanent: false },
    );
  }

  function finishMeasure() {
    const st = measureStateRef.current;
    const group = measureGroupRef.current;
    if (!group || st.points.length < 2) return;

    const isPolygon = st.points.length >= 3;
    const color = isPolygon ? "#34d399" : "#fbbf24";
    if (st.polyline) {
      group.removeLayer(st.polyline);
      st.polyline = null;
    }
    st.markers.forEach((m) => group.removeLayer(m));
    st.markers = [];

    if (isPolygon) {
      const ring = st.points;
      const poly = L.polygon(ring, {
        color,
        weight: 2.4,
        fillColor: color,
        fillOpacity: 0.18,
      }).addTo(group);
      st.finishedItems.push(poly);
      const area = polygonArea(ring);
      const perim = polylineLength([...ring, ring[0]]);
      const centroid = ringCentroid(ring);
      L.marker(centroid, {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:rgba(10,14,20,.92);border:1px solid ${color};color:${color};border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.4)">Área: ${fmtHa(area)}<br/>Perímetro: ${fmtM(perim)}</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
      }).addTo(group);
    } else {
      const line = L.polyline(st.points, { color, weight: 3 }).addTo(group);
      st.finishedItems.push(line);
      const total = polylineLength(st.points);
      const last = st.points[st.points.length - 1];
      L.marker(last, {
        icon: L.divIcon({
          className: "",
          html: `<div style="background:rgba(10,14,20,.92);border:1px solid ${color};color:${color};border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;white-space:nowrap">Comprimento: ${fmtM(total)}</div>`,
          iconSize: [0, 0],
        }),
        interactive: false,
      }).addTo(group);
    }
    st.points = [];
  }

  function doProximity(latlng: L.LatLng) {
    const st = useGisStore.getState();
    const b = st.bairros;
    const l = st.localidades;
    if (!b && !l) return;
    const origin: [number, number] = [latlng.lng, latlng.lat];
    const candidates: {
      id: string;
      name: string;
      kind: string;
      zona?: string;
      lat: number;
      lng: number;
      dist: number;
    }[] = [];
    if (b) {
      b.features.forEach((f, i) => {
        const [lat, lng] = featureCentroid(f);
        candidates.push({
          id: `bairro-${i}`,
          name: f.properties.NOME_BAIRR,
          kind: "Bairro",
          zona: f.properties.ZONAS,
          lat,
          lng,
          dist: haversine(origin, [lng, lat]),
        });
      });
    }
    if (l) {
      l.features.forEach((f, i) => {
        const [lat, lng] = featureCentroid(f);
        candidates.push({
          id: `localidade-${i}`,
          name: f.properties.NOME_LOCAL,
          kind: f.properties.TIPO_1,
          zona: f.properties.ZONAS,
          lat,
          lng,
          dist: haversine(origin, [lng, lat]),
        });
      });
    }
    candidates.sort((a, b2) => a.dist - b2.dist);
    const inRange = candidates.filter((c) => c.dist <= 1000).slice(0, 3);
    setProximity(
      [latlng.lat, latlng.lng],
      inRange.map((c) => ({
        id: c.id,
        name: c.name,
        kind: c.kind,
        zona: c.zona,
        lat: c.lat,
        lng: c.lng,
        distance: c.dist,
      })),
    );
  }

  /* ===================== effects ===================== */

  // init map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, {
      center: MANAUS_CENTER,
      zoom: MANAUS_INITIAL_ZOOM,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
      worldCopyJump: true,
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.control.scale({ position: "bottomleft", imperial: false, metric: true }).addTo(map);
    mapRef.current = map;

    bairrosGroupRef.current = L.layerGroup().addTo(map);
    localidadesGroupRef.current = L.layerGroup().addTo(map);
    labelsGroupRef.current = L.layerGroup().addTo(map);
    highlightRef.current = L.layerGroup().addTo(map);
    measureGroupRef.current = L.layerGroup().addTo(map);
    proximityGroupRef.current = L.layerGroup().addTo(map);

    const onViewChange = () => {
      const c = map.getCenter();
      setView([c.lat, c.lng], map.getZoom());
    };
    map.on("moveend", onViewChange);
    map.on("zoomend", onViewChange);
    onViewChange();

    onReady(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onReady, setView]);

  // basemap
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const def = BASEMAPS[basemap];
    if (baseLayerRef.current) {
      map.removeLayer(baseLayerRef.current);
      baseLayerRef.current = null;
    }
    if (overlayLayerRef.current) {
      map.removeLayer(overlayLayerRef.current);
      overlayLayerRef.current = null;
    }
    const base = L.tileLayer(def.url, {
      attribution: def.attribution,
      maxZoom: def.maxZoom,
      subdomains: "abc",
    });
    base.addTo(map);
    base.bringToBack();
    baseLayerRef.current = base;
    if (def.overlayUrl) {
      const overlay = L.tileLayer(def.overlayUrl, {
        attribution: def.overlayAttribution,
        maxZoom: def.maxZoom,
        subdomains: "abc",
      });
      overlay.addTo(map);
      overlay.bringToBack();
      overlayLayerRef.current = overlay;
    }
  }, [basemap]);

  // bairros layer
  const zonasKey = JSON.stringify(layers.zonas);
  useEffect(() => {
    const group = bairrosGroupRef.current;
    const labelsGroup = labelsGroupRef.current;
    if (!group || !labelsGroup) return;
    group.clearLayers();
    labelsGroup.clearLayers();
    if (!bairros || !layers.bairros) return;

    bairros.features.forEach((f) => {
      const zona = f.properties.ZONAS;
      if (!layers.zonas[zona]) return;
      const layer = L.geoJSON(f, {
        style: () => bairroStyle(zona, false),
        onEachFeature: (_, lyr) => {
          const ll = lyr as L.Polygon;
          ll.bindTooltip(
            `<div style="font-weight:700">${f.properties.NOME_BAIRR}</div><div style="opacity:.8;font-size:11px">${zona}</div>`,
            { className: "gis-tooltip", direction: "top", sticky: true },
          );
          ll.on("mouseover", () => ll.setStyle({ weight: 3, fillOpacity: 0.32 }));
          ll.on("mouseout", () => ll.setStyle(bairroStyle(zona, false)));
          ll.on("click", (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            selectFeature("bairro", f);
          });
        },
      });
      layer.addTo(group);

      if (layers.bairroLabels) {
        const [lat, lng] = featureCentroid(f);
        const label = L.marker([lat, lng], {
          icon: L.divIcon({
            className: "bairro-halo-label",
            html: bairroLabelContent(f.properties.NOME_BAIRR),
            iconSize: [0, 0],
            iconAnchor: [0, 0],
          }),
          interactive: false,
          keyboard: false,
        });
        label.addTo(labelsGroup);
      }
    });
  }, [bairros, layers.bairros, layers.bairroLabels, zonasKey, layers.zonas]);

  // localidades layer
  const tiposKey = JSON.stringify(layers.tipos);
  useEffect(() => {
    const group = localidadesGroupRef.current;
    if (!group) return;
    group.clearLayers();
    if (!localidades || !layers.localidades) return;

    localidades.features.forEach((f) => {
      const tipo = f.properties.TIPO_1;
      if (!layers.tipos[tipo]) return;
      const layer = L.geoJSON(f, {
        style: () => localidadeStyle(tipo, false),
        onEachFeature: (_, lyr) => {
          const ll = lyr as L.Polygon;
          ll.bindTooltip(
            `<div style="font-weight:700">${f.properties.NOME_LOCAL}</div><div style="opacity:.85;font-size:11px">${tipo} · ${f.properties.BAIRRO_1}</div>`,
            { className: "gis-tooltip", direction: "top", sticky: true },
          );
          ll.on("mouseover", () => ll.setStyle({ weight: 2.6, fillOpacity: 0.6 }));
          ll.on("mouseout", () => ll.setStyle(localidadeStyle(tipo, false)));
          ll.on("click", (e: L.LeafletMouseEvent) => {
            L.DomEvent.stopPropagation(e);
            selectFeature("localidade", f);
          });
        },
      });
      layer.addTo(group);
    });
  }, [localidades, layers.localidades, tiposKey, layers.tipos]);

  // selection highlight
  useEffect(() => {
    const group = highlightRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    if (!selected) return;
    const style: L.PathOptions =
      selected.kind === "bairro"
        ? bairroStyle(selected.feature.properties.ZONAS, true)
        : localidadeStyle(selected.feature.properties.TIPO_1, true);
    const layer = L.geoJSON(selected.feature, { style: () => style, interactive: false });
    layer.addTo(group);
    try {
      const bounds = L.geoJSON(selected.feature).getBounds();
      map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 15, duration: 0.8 });
    } catch {
      /* ignore */
    }
  }, [selected]);

  // tools
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (clickHandlerRef.current) {
      map.off("click", clickHandlerRef.current);
      clickHandlerRef.current = null;
    }
    map.getContainer().style.cursor = tool === "none" ? "" : "crosshair";

    if (tool === "measure") {
      const handler = (e: L.LeafletMouseEvent) => addMeasurePoint(e.latlng);
      clickHandlerRef.current = handler;
      map.on("click", handler);
      map.doubleClickZoom.disable();
      map.on("dblclick", finishMeasure);
    } else if (tool === "proximity") {
      const handler = (e: L.LeafletMouseEvent) => doProximity(e.latlng);
      clickHandlerRef.current = handler;
      map.on("click", handler);
    } else {
      map.doubleClickZoom.enable();
    }

    return () => {
      if (clickHandlerRef.current) {
        map.off("click", clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      map.off("dblclick", finishMeasure);
      map.doubleClickZoom.enable();
      map.getContainer().style.cursor = "";
    };
  }, [tool]);

  // reset in-progress measurement when leaving measure tool
  useEffect(() => {
    if (tool !== "measure") {
      const st = measureStateRef.current;
      st.points = [];
      st.polyline = null;
      st.markers = [];
    }
  }, [tool]);

  // draw proximity results
  useEffect(() => {
    const group = proximityGroupRef.current;
    const map = mapRef.current;
    if (!group || !map) return;
    group.clearLayers();
    if (!proximityOrigin) return;

    const originLatLng = L.latLng(proximityOrigin[0], proximityOrigin[1]);
    const originIcon = L.divIcon({
      className: "",
      html: `<div style="position:relative;width:24px;height:24px"><span style="position:absolute;inset:0;border-radius:50%;background:#fbbf24;opacity:.9"></span><span class="animate-pulse-ring" style="position:absolute;inset:0;border-radius:50%;border:2px solid #fbbf24"></span></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker(originLatLng, { icon: originIcon, interactive: false }).addTo(group);

    L.circle(originLatLng, {
      radius: 1000,
      color: "#fbbf24",
      weight: 1,
      opacity: 0.5,
      fillColor: "#fbbf24",
      fillOpacity: 0.05,
      dashArray: "4 6",
    }).addTo(group);

    proximityResults.forEach((r, idx) => {
      const ll = L.latLng(r.lat, r.lng);
      const isClosest = idx === 0;
      const color = isClosest ? "#34d399" : "#2dd4bf";
      L.polyline([originLatLng, ll], {
        color,
        weight: 1.6,
        opacity: 0.8,
        dashArray: "5 5",
      }).addTo(group);
      const m = L.circleMarker(ll, {
        radius: 7,
        color: "#fff",
        weight: 2,
        fillColor: color,
        fillOpacity: 1,
      }).addTo(group);
      m.bindTooltip(
        `<div style="font-weight:700">${r.name}</div><div style="font-size:11px;opacity:.85">${r.kind}${r.zona ? " · " + r.zona : ""}</div><div style="font-size:11px;color:${color}">${fmtM(r.distance)}</div>`,
        { className: "gis-tooltip", direction: "top", permanent: false },
      );
    });
  }, [proximityOrigin, proximityResults]);

  // expose clear-measurement for the toolbar button
  useEffect(() => {
    (window as any).__gisClearMeasure = () => {
      const st = measureStateRef.current;
      const group = measureGroupRef.current;
      st.points = [];
      if (st.polyline && group) group.removeLayer(st.polyline);
      st.polyline = null;
      st.markers.forEach((m) => group?.removeLayer(m));
      st.markers = [];
      st.finishedItems.forEach((it) => group?.removeLayer(it));
      st.finishedItems = [];
      if (group) group.clearLayers();
    };
    return () => {
      delete (window as any).__gisClearMeasure;
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}

function ringAreaLocal(ring: [number, number][]): number {
  const R = 6378137;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const n = ring.length;
  if (n < 3) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const [lng1, lat1] = ring[i];
    const [lng2, lat2] = ring[(i + 1) % n];
    total += toRad(lng2 - lng1) * (2 + Math.sin(toRad(lat1)) + Math.sin(toRad(lat2)));
  }
  return Math.abs((total * R * R) / 2);
}
