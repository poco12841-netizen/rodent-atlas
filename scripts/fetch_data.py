import re, csv, gzip, json, os, time
from datetime import datetime, timezone
import requests

OUT = "data"
os.makedirs(OUT, exist_ok=True)
S = requests.Session()
S.headers["User-Agent"] = "rodent-atlas-fetch/1.0"
RUN_TS = datetime.now(timezone.utc).isoformat(timespec="seconds")
VERSION = "fetch-v1"
HEAD = ["record_id", "city_id", "source_dataset", "complaint_type", "descriptor", "created_at",
        "status", "latitude", "longitude", "ingestion_timestamp", "validation_status", "transformation_version"]

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
