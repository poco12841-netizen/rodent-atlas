type CityStatus = {
  city: string;
  status: string;
  note: string;
};

const cities: CityStatus[] = [
  { city: "New York City", status: "Access verified", note: "Rodent category identified. Ingestion not yet implemented." },
  { city: "Chicago", status: "Source identified", note: "Our own access not yet verified." },
  { city: "Washington, DC", status: "Source identified", note: "Our own access not yet verified." },
  { city: "Baltimore", status: "Source identified", note: "Our own access not yet verified." },
  { city: "Boston", status: "Source identified", note: "Our own access not yet verified." },
  { city: "San Francisco", status: "Source identified", note: "Our own access not yet verified." },
  { city: "Seattle", status: "Source identified", note: "No rodent category found by third-party research; needs our own check." },
  { city: "Los Angeles", status: "Source identified", note: "No rodent category found by third-party research; needs our own check." },
  { city: "Philadelphia", status: "Source identified", note: "No rodent category found by third-party research; needs our own check." },
  { city: "Portland", status: "Not researched", note: "No verified information yet." },
];

export default function App() {
  return (
    <main className="page">
      <header className="hero">
        <p className="eyebrow">National Urban Rodent Intelligence Platform</p>
        <h1>RODENT ATLAS</h1>
        <p className="slogan">Don't just map the rats. Decode the city.</p>
      </header>

      <section className="card notice">
        <h2>Early development</h2>
        <p>
          No city is integrated yet and no data is shown on this site. Every number
          that appears here in the future will come from official public sources
          that we have accessed and validated ourselves.
        </p>
      </section>

      <section className="card">
        <h2>Important scientific limitation</h2>
        <p>
          311 complaints are not a direct measurement of actual rat populations.
          Complaint counts are influenced by population density, awareness of 311,
          access to reporting channels, local reporting habits, city response
          policies, and changes in how cities classify reports.
        </p>
      </section>

      <section className="card">
        <h2>City integration status</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.city}>
                  <td>{c.city}</td>
                  <td>{c.status}</td>
                  <td>{c.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="footer">
        <p>Open source. Source: official city open data portals.</p>
      </footer>
    </main>
  );
}
