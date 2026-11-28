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

const part2 = document.createElement("script");
part2.src = "app2.js";
document.body.appendChild(part2);
// END OF PART 1
