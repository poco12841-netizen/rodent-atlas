const box = { marginTop: 20, padding: 12, border: "1px solid #333", borderRadius: 12 } as const;
const h = { margin: "0 0 8px", fontSize: 18 } as const;
const p = { fontSize: 13, color: "#ccc", lineHeight: 1.6, margin: "6px 0" } as const;

export default function Methodology() {
  return (
    <div style={box}>
      <h2 style={h}>Methodology and limitations</h2>
      <p style={p}>
        <b>What is counted.</b> Each record is one 311 service request in the NYC Open Data
        dataset erm2-nwe9 whose complaint type is Rodent. We do not add, guess or edit
        records or coordinates.
      </p>
      <p style={p}>
        <b>Period.</b> This dataset covers 2020 onward. Earlier years are in a separate NYC
        dataset that is not yet included, so this page must not be used for long-term trends.
        The latest month is partial.
      </p>
      <p style={p}>
        <b>Map.</b> Points are grouped into grid cells of about 500 m. Requests without
        coordinates are left off the map and are counted in Data Trust. Heat shows relative
        concentration of requests, not rodent density.
      </p>
      <p style={p}>
        <b>Request types.</b> The data mixes sightings, signs of rodents, conditions that
        may attract rodents and a few bites. These are different events, so the total is not a
        count of rats.
      </p>

      <h2 style={{ ...h, marginTop: 16 }}>Reporting bias</h2>
      <p style={p}>311 complaints are not a direct measurement of rodent populations. They can
        be influenced by:</p>
      <ul style={{ ...p, paddingLeft: 18 }}>
        <li>Population density: more people, more chances that someone reports.</li>
        <li>Awareness of 311 and willingness to use it.</li>
        <li>Access to reporting channels (phone, app, web, language).</li>
        <li>Local reporting habits and building management practices.</li>
        <li>City response policies and how complaints are classified.</li>
        <li>Changes in the 311 system or its categories over time.</li>
      </ul>
      <p style={p}>
        A rise or fall in monthly requests may reflect any of these, not only a change in
        rodent activity. This site does not estimate rat numbers.
      </p>
    </div>
  );
}
