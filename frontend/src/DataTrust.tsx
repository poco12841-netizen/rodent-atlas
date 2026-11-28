import { useEffect, useState } from "react";

type Report = {
  retrieved_at_utc: string;
  total_records: number;
  duplicate_unique_keys: number;
  missing_coordinates: number;
  coordinates_outside_nyc_box: number;
  missing_created_date: number;
  closed_before_created: number;
  earliest_created: string;
  latest_created: string;
  by_descriptor: [string, number][];
};

const pct = (a: number, b: number) => ((a / b) * 100).toFixed(2) + "%";

export default function DataTrust() {
  const [r, setR] = useState<Report | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/data/nyc_report.json")
      .then((x) => x.json())
      .then(setR)
      .catch(() => setErr("Validation report not available."));
  }, []);

  if (err) return <p style={{ color: "#bbb" }}>{err}</p>;
  if (!r) return null;

  const n = r.total_records;
  const rows: [string, string, string][] = [
    ["Records checked", n.toLocaleString(), "count of rows downloaded"],
    ["Coordinate completeness", pct(n - r.missing_coordinates, n), "(records - missing coordinates) / records"],
    ["Missing coordinates", r.missing_coordinates.toLocaleString(), "excluded from the map"],
    ["Duplicate IDs", r.duplicate_unique_keys.toLocaleString(), "records - distinct unique_key"],
    ["Outside NYC bounding box", r.coordinates_outside_nyc_box.toLocaleString(), "lat 40.4 to 41.0, lng -74.3 to -73.6"],
    ["Missing created date", r.missing_created_date.toLocaleString(), "records without created_date"],
    ["Closed before created", r.closed_before_created.toLocaleString(), "flagged, not deleted"],
  ];

  return (
    <div style={{ marginTop: 20, padding: 12, border: "1px solid #333", borderRadius: 12 }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>Data Trust: New York City</h2>
      <p style={{ fontSize: 12, color: "#999", margin: "0 0 8px" }}>
        Period {r.earliest_created.slice(0, 10)} to {r.latest_created.slice(0, 10)}. Checked{" "}
        {r.retrieved_at_utc.slice(0, 10)}. No combined score is given, only the measured indicators.
      </p>
      {rows.map(([a, b, c]) => (
        <div key={a} style={{ padding: "6px 0", borderTop: "1px solid #2a2a2a" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{a}</span>
            <b style={{ color: "#ff8a4c" }}>{b}</b>
          </div>
          <div style={{ fontSize: 11, color: "#888" }}>{c}</div>
        </div>
      ))}
      <p style={{ margin: "10px 0 4px" }}>Request types in the data</p>
      {r.by_descriptor.map(([d, c]) => (
        <div key={d} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
          <span>{d}</span>
          <span>{c.toLocaleString()} ({pct(c, n)})</span>
        </div>
      ))}
      <p style={{ fontSize: 11, color: "#888" }}>
        Only some types are sightings. Others are conditions or signs, so totals are not rat counts.
      </p>
    </div>
  );
    }
