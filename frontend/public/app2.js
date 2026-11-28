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

// Fills the two date dropdowns with years (start year / end year).
// Years come from the first_date / last_date values in the data summary.
function fillYearSelect(sel, minY, maxY, label, suffix) {
  if (!sel || sel.tagName !== "SELECT") return;
  sel.innerHTML = "";
  const any = document.createElement("option");
  any.value = "";
  any.textContent = label;
  sel.appendChild(any);
  for (let y = minY; y <= maxY; y++) {
    const o = document.createElement("option");
    o.value = y + suffix;
    o.textContent = String(y);
    sel.appendChild(o);
  }
  sel.value = "";
}

function fillDateSelects(list) {
  let minY = Infinity, maxY = -Infinity;
  list.forEach(x => {
    [x.first_date, x.last_date].forEach(d => {
      if (!d) return;
      const y = parseInt(String(d).slice(0, 4), 10);
      if (y > 1990 && y < 2100) {
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    });
  });
  if (!isFinite(minY) || !isFinite(maxY)) return;
  fillYearSelect($("from"), minY, maxY, "From: any year", "-01-01");
  fillYearSelect($("to"), minY, maxY, "To: any year", "-12-31");
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
  fillDateSelects(list);
  $("shown").textContent = "-";
  if (!cities.length) { setStatus("No city data found.", true); return; }
  setStatus("Data updated " + String(summary.run_at || "").slice(0, 16).replace("T", " ") + " UTC. Loading the smallest city first...");
  const smallest = cities.slice().sort((a, b) => a.expected - b.expected)[0];
  toggleCity(smallest, smallest.chip);
}

init();
// END OF PART 2

