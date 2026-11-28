(function () {
  const CAP = 50000;
  const $ = id => document.getElementById(id);
  const fmtN = n => Number(n).toLocaleString("en-US");
  const cities = [];
  const selected = new Set();
  let map = null, mapReady = false, pendingData = null, lastFilter = null;

  function setStatus(msg, bad) {
    const el = $("status");
    el.textContent = msg;
    el.style.color = bad ? "#f87171" : "";
  }

  function makeMap() {
    map = new maplibregl.Map({
      container: "map",
      center: [-96, 38],
      zoom: 3.4,
      style: {
        version: 8,
        glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
        sources: {
          base: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors"
          }
        },
        layers: [{ id: "base", type: "raster", source: "base",
          paint: { "raster-brightness-max": 0.45, "raster-saturation": -0.7, "raster-contrast": 0.1 } }]
      }
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.addSource("pts", {
        type: "geojson",
        data: pendingData || { type: "FeatureCollection", features: [] },
        cluster: true, clusterRadius: 45, clusterMaxZoom: 13
      });
      map.addLayer({
        id: "clusters", type: "circle", source: "pts", filter: ["has", "point_count"],
        paint: {
          "circle-color": ["step", ["get", "point_count"], "#fb923c", 100, "#ea580c", 1000, "#dc2626"],
          "circle-radius": ["step", ["get", "point_count"], 14, 100, 19, 1000, 25],
          "circle-opacity": 0.85
        }
      });
      map.addLayer({
        id: "cluster-count", type: "symbol", source: "pts", filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["Open Sans Regular"],
          "text-size": 12
        },
        paint: { "text-color": "#ffffff" }
      });
      map.addLayer({
        id: "point", type: "circle", source: "pts", filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#fb923c", "circle-radius": 5, "circle-opacity": 0.9,
          "circle-stroke-width": 1, "circle-stroke-color": "#15171a"
        }
      });
      map.on("click", "clusters", async e => {
        const f = map.queryRenderedFeatures(e.point, { layers: ["clusters"] })[0];
        if (!f) return;
        const z = await map.getSource("pts").getClusterExpansionZoom(f.properties.cluster_id);
        map.easeTo({ center: f.geometry.coordinates, zoom: z });
      });
      map.on("click", "point", e => {
        const f = e.features[0];
        const c = cities[f.properties.ci], k = f.properties.k;
        const rec = document.createElement("div");
        rec.className = "rec";
        const t = c.t[k];
        const rows = [
          ["City", prettyName(c.id)],
          ["Category", TYPES.list[c.typ[k]]],
          ["Detail", DESCS.list[c.desc[k]]],
          ["Status", STATUSES.list[c.st[k]]],
          ["Date", t ? new Date(t * 1000).toISOString().slice(0, 10) : "n/a"],
          ["Record", c.ids[k]]
        ];
        rows.forEach(r => {
          if (!r[1]) return;
          const line = document.createElement("div");
          const lab = document.createElement("span");
          lab.textContent = r[0] + ": ";
          line.appendChild(lab);
          line.appendChild(document.createTextNode(r[1]));
          rec.appendChild(line);
        });
        new maplibregl.Popup({ closeButton: true }).setLngLat(f.geometry.coordinates).setDOMContent(rec).addTo(map);
      });
      ["clusters", "point"].forEach(l => {
        map.on("mouseenter", l, () => { map.getCanvas().style.cursor = "pointer"; });
        map.on("mouseleave", l, () => { map.getCanvas().style.cursor = ""; });
      });
      mapReady = true;
      pendingData = null;
    });
  }

  function pushData(fc) {
    if (mapReady) map.getSource("pts").setData(fc);
    else pendingData = fc;
  }

  function median(arr) {
    const a = Array.prototype.slice.call(arr).sort((x, y) => x - y);
    return a[Math.floor(a.length / 2)];
  }

  function flyToCity(c) {
    if (!map || !c.n) return;
    const step = Math.max(1, Math.floor(c.n / 1000));
    const la = [], lo = [];
    for (let k = 0; k < c.n; k += step) { la.push(c.lat[k]); lo.push(c.lon[k]); }
    map.flyTo({ center: [median(lo), median(la)], zoom: 10 });
  }

  function buildTypes() {
    const sel = $("type");
    const prev = sel.value;
    const counts = new Map();
    cities.forEach(c => {
      if (!c.loaded || !selected.has(c.id)) return;
      c.typeCounts.forEach((v, k) => counts.set(k, (counts.get(k) || 0) + v));
    });
    const arr = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    sel.innerHTML = "";
    const all = document.createElement("option");
    all.value = "-1"; all.textContent = "All categories";
    sel.appendChild(all);
    arr.forEach(p => {
      const o = document.createElement("option");
      o.value = String(p[0]);
      o.textContent = TYPES.list[p[0]] + " (" + fmtN(p[1]) + ")";
      sel.appendChild(o);
    });
    sel.value = counts.has(+prev) ? prev : "-1";
  }

  function monthLabel(key) {
    const y = Math.floor(key / 12), m = (key % 12) + 1;
    return y + "-" + (m < 10 ? "0" + m : m);
  }

  function drawChart(months) {
    const cv = $("chart"), g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    if (!months.size) return;
    let min = Infinity, max = -Infinity, maxv = 0;
    months.forEach((v, k) => {
      if (k < min) min = k;
      if (k > max) max = k;
      if (v > maxv) maxv = v;
    });
    const n = max - min + 1, H = cv.height, bw = cv.width / n;
    g.fillStyle = "#ea580c";
    months.forEach((v, k) => {
      const h = (v / maxv) * (H - 20);
      g.fillRect((k - min) * bw, H - 14 - h, Math.max(1, bw - 1), h);
    });
    g.fillStyle = "#9a9fa6";
    g.font = "10px sans-serif";
    g.textAlign = "left";
    g.fillText(monthLabel(min), 2, H - 3);
    g.textAlign = "right";
    g.fillText(monthLabel(max) + "  (reports per month)", cv.width - 2, H - 3);
  }

  function makeTest() {
    const type = +$("type").value;
    const fromV = $("from").value, toV = $("to").value;
    const t0 = fromV ? Date.parse(fromV + "T00:00:00Z") / 1000 : null;
    const t1 = toV ? Date.parse(toV + "T00:00:00Z") / 1000 + 86400 : null;
    return (c, k) => {
      if (type >= 0 && c.typ[k] !== type) return false;
      if (t0 !== null || t1 !== null) {
        const t = c.t[k];
        if (!t) return false;
        if (t0 !== null && t < t0) return false;
        if (t1 !== null && t >= t1) return false;
      }
      return true;
    };
  }

  function apply() {
    const active = cities.filter(c => c.loaded && selected.has(c.id));
    const test = makeTest();
    lastFilter = { active, test };
    let total = 0;
    active.forEach(c => { for (let k = 0; k < c.n; k++) if (test(c, k)) total++; });
    const stride = Math.max(1, Math.ceil(total / CAP));
    const feats = [], months = new Map();
    let seen = 0;
    active.forEach(c => {
      const ci = cities.indexOf(c);
      for (let k = 0; k < c.n; k++) {
        if (!test(c, k)) continue;
        if (seen % stride === 0) {
          feats.push({
            type: "Feature",
            geometry: { type: "Point", coordinates: [c.lon[k], c.lat[k]] },
            properties: { ci: ci, k: k }
          });
        }
        seen++;
        const t = c.t[k];
        if (t) {
          const d = new Date(t * 1000);
          const key = d.getUTCFullYear() * 12 + d.getUTCMonth();
          months.set(key, (months.get(key) || 0) + 1);
        }
      }
    });
    pushData({ type: "FeatureCollection", features: feats });
    $("shown").textContent = fmtN(total) + " reports";
    drawChart(months);
    $("csv").disabled = total === 0;
    if (stride > 1) {
      setStatus("The map shows an evenly spaced sample of " + fmtN(feats.length) + " points. The count above and the CSV include all " + fmtN(total) + ".");
    } else if (active.length) {
      setStatus("Showing all matching points.");
    } else {
      setStatus("Tap a city above to load its data.");
    }
  }

  function q(s) {
    s = s == null ? "" : String(s);
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function downloadCSV() {
    if (!lastFilter) return;
    const parts = [], rows = [];
    rows.push("city,record_id,created_at,latitude,longitude,complaint_type,descriptor,status,source_dataset");
    lastFilter.active.forEach(c => {
      for (let k = 0; k < c.n; k++) {
        if (!lastFilter.test(c, k)) continue;
        const t = c.t[k];
        rows.push([
          c.id, q(c.ids[k]), t ? new Date(t * 1000).toISOString().slice(0, 19) : "",
          c.lat[k], c.lon[k], q(TYPES.list[c.typ[k]]), q(DESCS.list[c.desc[k]]),
          q(STATUSES.list[c.st[k]]), q(SOURCES.list[c.src[k]])
        ].join(","));
        if (rows.length >= 5000) { parts.push(rows.join("\n") + "\n"); rows.length = 0; }
      }
    });
    if (rows.length) parts.push(rows.join("\n") + "\n");
    const blob = new Blob(parts, { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "rodent-atlas-filtered.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  async function toggleCity(c, el) {
    if (selected.has(c.id)) {
      selected.delete(c.id);
      el.classList.remove("on");
      buildTypes();
      apply();
      return;
    }
    if (c.loading) return;
    let firstLoad = false;
    if (!c.loaded) {
      c.loading = true;
      el.classList.add("loading");
      setStatus("Loading " + prettyName(c.id) + " (" + fmtN(c.expected) + " records)...");
      try {
        await loadCity(c);
      } catch (e) {
        c.loading = false;
        el.classList.remove("loading");
        setStatus("Could not load " + prettyName(c.id) + ": " + e.message, true);
        return;
      }
      c.loading = false;
      el.classList.remove("loading");
      firstLoad = true;
    }
    selected.add(c.id);
    el.classList.add("on");
    buildTypes();
    apply();
    if (firstLoad) flyToCity(c);
  }

  function buildChips(list) {
    const box = $("cities");
    box.innerHTML = "";
    list.slice().sort((a, b) => prettyName(a.id).localeCompare(prettyName(b.id))).forEach(c => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "chip";
      el.textContent = prettyName(c.id);
      const sm = document.createElement("small");
      sm.textContent = fmtN(c.expected);
      el.appendChild(sm);
      el.addEventListener("click", () => toggleCity(c, el));
      c.chip = el;
      box.appendChild(el);
    });
  }

  function buildCoverage(all) {
    const tb = $("coverage");
    tb.innerHTML = "";
    const head = document.createElement("tr");
    ["City", "Records", "From", "To"].forEach(h => {
      const th = document.createElement("th");
      th.textContent = h;
      head.appendChild(th);
    });
    tb.appendChild(head);
    all.forEach(x => {
      const tr = document.createElement("tr");
      const cells = x.kept > 0
        ? [prettyName(x.city), fmtN(x.kept), x.first_date ? x.first_date.slice(0, 10) : "n/a", x.last_date ? x.last_date.slice(0, 10) : "n/a"]
        : [prettyName(x.city), "unavailable", "", ""];
      cells.forEach(v => {
        const td = document.createElement("td");
        td.textContent = v;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }

  async function init() {
    makeMap();
    $("toggle").addEventListener("click", () => {
      $("panel").classList.toggle("hidden");
      setTimeout(() => map.resize(), 50);
    });
    $("type").addEventListener("change", apply);
    $("from").addEventListener("change", apply);
    $("to").addEventListener("change", apply);
    $("csv").addEventListener("click", downloadCSV);
    let summary;
    try {
      summary = await loadSummary();
    } catch (e) {
      setStatus("Could not load data: " + e.message, true);
      return;
    }
    const list = summary.cities || [];
    list.filter(x => x.kept > 0).forEach(x => {
      cities.push({ id: x.city, expected: x.kept, loaded: false, loading: false });
    });
    buildChips(cities);
    buildCoverage(list);
    $("shown").textContent = "-";
    if (!cities.length) { setStatus("No city data found.", true); return; }
    setStatus("Data updated " + String(summary.run_at || "").slice(0, 16).replace("T", " ") + " UTC. Loading the smallest city first...");
    const smallest = cities.slice().sort((a, b) => a.expected - b.expected)[0];
    toggleCity(smallest, smallest.chip);
  }

  in
