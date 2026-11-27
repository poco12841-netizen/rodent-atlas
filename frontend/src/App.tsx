import { useEffect, useMemo, useState } from "react";
import RatMap from "./RatMap";

type Summary = {
  meta: any;
  months: Record<string, number>;
  cells: [number, number, number, number[]][];
};

export default function App() {
  const [data, setData] = useState<Summary | null>(null);
  const [year, setYear] = useState<number | "all">("all");
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/data/nyc_summary.json")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setErr("Could not load the data file."));
  }, []);

  const points = useMemo(() => {
    if (!data) return [];
    const i = year === "all" ? -1 : data.meta.years.indexOf(year);
    return data.cells
      .map((c) => [c[0], c[1], i < 0 ? c[2] : c[3][i]] as [number, number, number])
      .filter((p) => p[2] > 0);
  }, [data, year]);

  const total = points.reduce((s, p) => s + p[2], 0);

  return (
    <div style={{ background: "#16181b", color: "#f2f2f2", minHeight: "100vh", padding: 16 }}>
      <h1 style={{ margin: 0 }}>RODENT ATLAS</h1>
      <p style={{ color: "#ff8a4c", marginTop: 4 }}>New York City: rodent-related 311 requests</p>
      <p style={{ fontSize: 13, color: "#bbb" }}>
        These are complaint counts, not rat counts. Reporting habits and 311 awareness affect them.
      </p>
      {err && <p>{err}</p>}
      {!data && !err && <p>Loading...</p>}
      {data && (
        <>
          <select
            value={String(year)}
            onChange={(e) => setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            style={{ padding: 8, marginBottom: 8 }}
          >
            <option value="all">All years (2020 to 2026)</option>
            {data.meta.years.map((y: number) => (
              <option key={y} value={y}>
                {y}
                {y === 2026 ? " (partial)" : ""}
              </option>
            ))}
          </select>
          <p style={{ margin: "4px 0" }}>Requests with coordinates shown: {total.toLocaleString()}</p>
          <RatMap points={points} />
          <p style={{ fontSize: 12, color: "#999" }}>
            Source:{" "}
            <a style={{ color: "#ff8a4c" }} href={data.meta.source_url}>
              NYC Open Data (erm2-nwe9)
            </a>
            . Retrieved {data.meta.retrieved_at_utc}. Excluded for missing coordinates:{" "}
            {data.meta.records_without_coordinates_excluded_from_map.toLocaleString()}. Heat is
            relative to ~500 m grid cells.
          </p>
        </>
      )}
    </div>
  );
}
