import json, urllib.request, urllib.parse, os, datetime
from collections import Counter, defaultdict

BASE = "https://data.cityofnewyork.us/resource/erm2-nwe9.json"
rows, off = [], 0
while True:
    q = urllib.parse.urlencode({
        "$select": "unique_key,created_date,latitude,longitude",
        "$where": "complaint_type='Rodent'",
        "$order": "unique_key",
        "$limit": 50000,
        "$offset": off,
    })
    with urllib.request.urlopen(BASE + "?" + q, timeout=180) as r:
        p = json.load(r)
    rows += p
    if len(p) < 50000:
        break
    off += 50000

S = 0.005
Y = list(range(2020, 2027))
M = Counter()
C = defaultdict(lambda: [0] * len(Y))
N = 0
for r in rows:
    d = (r.get("created_date") or "")[:7]
    if d:
        M[d] += 1
    try:
        la = float(r["latitude"])
        lo = float(r["longitude"])
    except (KeyError, TypeError, ValueError):
        N += 1
        continue
    y = int(d[:4]) if d else None
    if y in Y:
        k = (round(la // S * S + S / 2, 4), round(lo // S * S + S / 2, 4))
        C[k][Y.index(y)] += 1

out = {
    "meta": {
        "city": "New York City",
        "source": "NYC Open Data erm2-nwe9, complaint_type = Rodent",
        "source_url": "https://data.cityofnewyork.us/resource/erm2-nwe9",
        "retrieved_at_utc": datetime.datetime.utcnow().isoformat() + "Z",
        "total_records": len(rows),
        "records_without_coordinates_excluded_from_map": N,
        "grid_size_degrees": S,
        "years": Y,
        "note": "Counts of 311 service requests, not rat counts.",
    },
    "months": dict(sorted(M.items())),
    "cells": [[k[0], k[1], sum(v), v] for k, v in C.items()],
}
os.makedirs("frontend/public/data", exist_ok=True)
with open("frontend/public/data/nyc_summary.json", "w") as f:
    json.dump(out, f, separators=(",", ":"))
print("records:", len(rows), "cells:", len(C), "no coords:", N)
