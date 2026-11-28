import re, csv, gzip, json, os, time
from datetime import datetime, timezone
import requests

OUT = "data"
os.makedirs(OUT, exist_ok=True)
S = requests.Session()
S.headers["User-Agent"] = "rodent-atlas-fetch/1.0"
RUN_TS = datetime.now(timezone.utc).isoformat(timespec="seconds")
VERSION = "fetch-v1"
HEAD = ["record_id", "city_id", "source_dataset", "complaint_type", "descriptor",
        "created_at", "status", "latitude", "longitude", "ingestion_timestamp",
        "validation_status", "transformation_version"]

def get(url, params=None):
    for i in range(4):
        try:
            r = S.get(url, params=params, timeout=300)
            r.raise_for_status()
            d = r.json()
            if isinstance(d, dict) and d.get("error"):
                raise RuntimeError(d["error"])
            return d
        except Exception:
            if i == 3:
                raise
            time.sleep(4 * (i + 1))

def valid_coord(lat, lon):
    try:
        lat, lon = float(lat), float(lon)
    except (TypeError, ValueError):
        return None
    if 24 <= lat <= 50 and -125 <= lon <= -66:
        return round(lat, 6), round(lon, 6)
    return None

def pick(names, patterns):
    for p in patterns:
        for n in names:
            if re.search(p, n, re.I):
                return n
    return None

class Collector:
    def __init__(self, city_id, source):
        self.city_id, self.source = city_id, source
        self.sources = {source} if source else set()
        self.rows, self.seen = [], set()
        self.st = dict(fetched=0, no_coords=0, bad_coords=0, duplicates=0)

    def add(self, rid, ctype, desc, created, status, lat, lon):
        self.sources.add(self.source)
        s = self.st
        s["fetched"] += 1
        if lat in (None, "") or lon in (None, ""):
            s["no_coords"] += 1
            return
        c = valid_coord(lat, lon)
        if not c:
            s["bad_coords"] += 1
            return
        if rid not in (None, ""):
            key = (self.source, str(rid))
            if key in self.seen:
                s["duplicates"] += 1
                return
            self.seen.add(key)
        self.rows.append([rid or "", self.city_id, self.source, ctype or "",
                          desc or "", str(created or "")[:19], status or "",
                          c[0], c[1], RUN_TS, "ok", VERSION])
