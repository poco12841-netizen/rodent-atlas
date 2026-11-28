const DATA_BASE = "https://raw.githubusercontent.com/poco12841-netizen/rodent-atlas/main/data/";
const NAMES = {
  "new-york": "New York City", "washington-dc": "Washington, DC",
  "baton-rouge": "Baton Rouge", "new-orleans": "New Orleans",
  "san-francisco": "San Francisco"
};

function prettyName(id) {
  return NAMES[id] || id.replace(/-/g, " ").replace(/\b\w/g, m => m.toUpperCase());
}

function makeTable() { return { list: [], map: new Map() }; }
function intern(tab, s) {
  let i = tab.map.get(s);
  if (i === undefined) { i = tab.list.length; tab.list.push(s); tab.map.set(s, i); }
  return i;
}
const TYPES = makeTable(), DESCS = makeTable(), STATUSES = makeTable(), SOURCES = makeTable();

async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
  const buf = await res.arrayBuffer();
  const u8 = new Uint8Array(buf);
  if (u8[0] === 0x1f && u8[1] === 0x8b) {
    if (typeof DecompressionStream === "undefined") {
      throw new Error("This browser cannot read compressed data. Please update your browser.");
    }
    const stream = new Blob([buf]).stream().pipeThrough(new DecompressionStream("gzip"));
    return await new Response(stream).text();
  }
  return new TextDecoder().decode(u8);
}

async function loadSummary() {
  const res = await fetch(DATA_BASE + "data_summary.json", { cache: "no-cache" });
  if (!res.ok) throw new Error("data_summary.json not found (HTTP " + res.status + ")");
  return res.json();
}

function parseCSV(text, cb) {
  const n = text.length;
  let i = 0, row = [], field = "";
  while (i < n) {
    if (text.charCodeAt(i) === 34) {
      i++;
      let s = "";
      for (;;) {
        const j = text.indexOf('"', i);
        if (j < 0) { s += text.slice(i); i = n; break; }
        s += text.slice(i, j);
        if (text.charCodeAt(j + 1) === 34) { s += '"'; i = j + 2; }
        else { i = j + 1; break; }
      }
      field = s;
    } else {
      let j = i;
      while (j < n) {
        const d = text.charCodeAt(j);
        if (d === 44 || d === 10 || d === 13) break;
        j++;
      }
      field = text.slice(i, j);
      i = j;
    }
    const d = text.charCodeAt(i);
    if (d === 44) { row.push(field); i++; }
    else {
      row.push(field);
      cb(row);
      row = [];
      if (d === 13 && text.charCodeAt(i + 1) === 10) i += 2; else i++;
    }
  }
}

async function loadCity(c) {
  const text = await fetchText(DATA_BASE + c.id + ".csv.gz");
  const n = c.expected;
  c.lat = new Float64Array(n); c.lon = new Float64Array(n);
  c.t = new Uint32Array(n); c.typ = new Uint32Array(n); c.desc = new Uint32Array(n);
  c.st = new Uint16Array(n); c.src = new Uint16Array(n); c.ids = new Array(n);
  c.typeCounts = new Map();
  let k = 0, header = null;
  const ix = {};
  parseCSV(text, row => {
    if (!header) { header = row; row.forEach((h, i) => { ix[h] = i; }); return; }
    if (k >= n) return;
    const lat = parseFloat(row[ix.latitude]), lon = parseFloat(row[ix.longitude]);
    if (!(lat === lat) || !(lon === lon)) return;
    c.lat[k] = lat; c.lon[k] = lon;
    const d = row[ix.created_at] || "";
    c.t[k] = d.length >= 10
      ? Math.floor(Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10),
          +d.slice(11, 13) || 0, +d.slice(14, 16) || 0, +d.slice(17, 19) || 0) / 1000)
      : 0;
    const ty = intern(TYPES, row[ix.complaint_type] || "(blank)");
    c.typ[k] = ty;
    c.typeCounts.set(ty, (c.typeCounts.get(ty) || 0) + 1);
    c.desc[k] = intern(DESCS, row[ix.descriptor] || "");
    c.st[k] = intern(STATUSES, row[ix.status] || "");
    c.src[k] = intern(SOURCES, row[ix.source_dataset] || "");
    c.ids[k] = row[ix.record_id] || "";
    k++;
  });
  c.n = k;
  c.loaded = true;
}
// END OF LOADER
