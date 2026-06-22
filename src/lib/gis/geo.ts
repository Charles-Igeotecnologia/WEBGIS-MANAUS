import type { Feature, Polygon, MultiPolygon, Position } from "geojson";

/** Earth radius in metres */
const R = 6378137;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance in metres between two [lng, lat] points */
export function haversine(a: [number, number], b: [number, number]): number {
  const [lng1, lat1] = a;
  const [lng2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** Spherical polygon area on Earth's surface (m²). Ring in [lng, lat]. */
export function ringArea(ring: Position[]): number {
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

/** Polygon perimeter in metres */
export function ringPerimeter(ring: Position[]): number {
  let p = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    p += haversine(
      [ring[i][0], ring[i][1]] as [number, number],
      [ring[i + 1][0], ring[i + 1][1]] as [number, number],
    );
  }
  return p;
}

/** Extract all rings (outer + holes) from a Polygon/MultiPolygon geometry */
function geomRings(geom: Polygon | MultiPolygon): Position[][] {
  if (geom.type === "Polygon") return geom.coordinates;
  return geom.coordinates.flat();
}

/** Compute area (m²) of a polygon/multipolygon feature */
export function featureArea(feature: Feature<Polygon | MultiPolygon>): number {
  let area = 0;
  for (const ring of geomRings(feature.geometry)) {
    area += ringArea(ring);
  }
  return area;
}

/** Compute perimeter (m) — sum of outer ring perimeters */
export function featurePerimeter(feature: Feature<Polygon | MultiPolygon>): number {
  let p = 0;
  const rings = geomRings(feature.geometry);
  for (const ring of rings) {
    p += ringPerimeter(ring);
  }
  return p;
}

/** Centroid of a polygon/multipolygon (area-weighted average of outer rings) */
export function featureCentroid(feature: Feature<Polygon | MultiPolygon>): [number, number] {
  const rings = geomRings(feature.geometry).filter((r) => r.length >= 3);
  if (rings.length === 0) {
    const c = feature.geometry.coordinates[0] as unknown as Position;
    return [c[1], c[0]];
  }
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const [x0, y0] = ring[i];
      const [x1, y1] = ring[i + 1];
      const cross = x0 * y1 - x1 * y0;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
      a += cross;
    }
  }
  a = a / 2;
  if (Math.abs(a) < 1e-12) {
    const ring = rings[0];
    let sx = 0;
    let sy = 0;
    for (const [x, y] of ring) {
      sx += x;
      sy += y;
    }
    return [sy / ring.length, sx / ring.length];
  }
  cx = cx / (6 * a);
  cy = cy / (6 * a);
  // GeoJSON is [lng, lat]; return [lat, lng] for leaflet
  return [cy, cx];
}

/** Format hectares */
export function fmtHa(m2: number): string {
  return `${(m2 / 10000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} ha`;
}

/** Format m² */
export function fmtM2(m2: number): string {
  return `${m2.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m²`;
}

/** Format metres */
export function fmtM(m: number): string {
  if (m >= 1000) return `${(m / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} km`;
  return `${m.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} m`;
}

/** Format a coordinate pair nicely */
export function fmtCoord(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/** Google Maps link for a coordinate */
export function googleMapsLink(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}
