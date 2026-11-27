import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type P = [number, number, number];

function toGeo(points: P[]): any {
  return {
    type: "FeatureCollection",
    features: points.map(([lat, lng, n]) => ({
      type: "Feature",
      properties: { n },
      geometry: { type: "Point", coordinates: [lng, lat] },
    })),
  };
}

export default function RatMap({ points }: { points: P[] }) {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const latest = useRef(points);
  latest.current = points;

  useEffect(() => {
    const m = new maplibregl.Map({
      container: box.current!,
      style: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
      center: [-73.95, 40.72],
      zoom: 9.5,
    });
    m.on("load", () => {
      m.addSource("pts", { type: "geojson", data: toGeo(latest.current) });
      m.addLayer({
        id: "heat",
        type: "heatmap",
        source: "pts",
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "n"], 0, 0, 50, 1],
          "heatmap-radius": 18,
          "heatmap-opacity": 0.85,
          "heatmap-color": [
            "interpolate", ["linear"], ["heatmap-density"],
            0, "rgba(0,0,0,0)", 0.3, "#5a1a0a", 0.6, "#d9531e", 1, "#ffb347",
          ],
        },
      });
    });
    map.current = m;
    return () => m.remove();
  }, []);

  useEffect(() => {
    const src = map.current?.getSource("pts") as maplibregl.GeoJSONSource | undefined;
    if (src) src.setData(toGeo(points));
  }, [points]);

  return <div ref={box} style={{ width: "100%", height: "65vh", borderRadius: 12 }} />;
          }
