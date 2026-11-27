export default function MonthChart({ months }: { months: Record<string, number> }) {
  const keys = Object.keys(months).sort();
  const max = Math.max(...keys.map((k) => months[k]), 1);
  const w = 600;
  const h = 150;
  const bw = w / keys.length;
  const last = keys[keys.length - 1];

  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ margin: "4px 0" }}>Requests per month (all complaint types)</p>
      <svg viewBox={`0 0 ${w} ${h + 20}`} style={{ width: "100%" }}>
        {keys.map((k, i) => {
          const bh = (months[k] / max) * h;
          return (
            <rect
              key={k}
              x={i * bw + 1}
              y={h - bh}
              width={Math.max(bw - 2, 1)}
              height={bh}
              fill={k === last ? "#7a4a33" : "#d9531e"}
            >
              <title>{k + ": " + months[k].toLocaleString()}</title>
            </rect>
          );
        })}
        <text x="0" y={h + 14} fill="#999" fontSize="11">{keys[0]}</text>
        <text x={w} y={h + 14} fill="#999" fontSize="11" textAnchor="end">{last + " (partial)"}</text>
        <text x="0" y="10" fill="#999" fontSize="11">{"max " + max.toLocaleString()}</text>
      </svg>
      <p style={{ fontSize: 12, color: "#999", margin: 0 }}>
        Changes may reflect reporting habits or 311 system changes, not only rodent activity.
      </p>
    </div>
  );
}
