from common import *

def arcgis(c, url, where, cat):
    meta = get(url, {"f": "json"})
    flds = {f["name"]: f["type"] for f in meta["fields"]}
    low = {n.lower(): n for n in flds}
    oid = meta.get("objectIdFieldName") or next(
        n for n, t in flds.items() if t == "esriFieldTypeOID")
    dates = [n for n, t in flds.items() if t == "esriFieldTypeDate"]
    date_f = pick(dates, [r"creat", r"open", r"initi", r"add",
                          r"request", r"date", r".*"])
    cat_f = low.get(cat.lower())
    st_f = pick(list(flds), [r"^status$", r"status"])
    lat_f = low.get("latitude") or low.get("lat")
    lon_f = low.get("longitude") or low.get("lon") or low.get("long")
    step = min(int(meta.get("maxRecordCount") or 1000), 2000)
    print(f"   columns: id={oid} date={date_f} category={cat_f} status={st_f}")
    off = 0
    while True:
        d = get(url + "/query", {
            "where": where, "outFields": "*", "returnGeometry": "true",
            "outSR": 4326, "orderByFields": oid, "resultOffset": off,
            "resultRecordCount": step, "f": "json"})
        feats = d.get("features", [])
        if not feats:
            break
        for f in feats:
            a, g = f.get("attributes", {}), f.get("geometry") or {}
            lon, lat = g.get("x"), g.get("y")
            if lat is None and lat_f and lon_f:
                lat, lon = a.get(lat_f), a.get(lon_f)
            ts = a.get(date_f) if date_f else None
            created = ""
            if isinstance(ts, (int, float)):
                created = datetime.fromtimestamp(ts / 1000, timezone.utc).strftime("%Y-%m-%dT%H:%M:%S")
            c.add(a.get(oid), a.get(cat_f), "", created,
                  a.get(st_f) if st_f else "", lat, lon)
        off += len(feats)
        if len(feats) < step and not d.get("exceededTransferLimit"):
            break
    return c

def detroit():
    u = "https://services2.arcgis.com/qvkbeam7Wirps6zC/arcgis/rest/services/improve_detroit/FeatureServer/0"
    c = Collector("detroit", "services2.arcgis.com improve_detroit layer 0")
    return arcgis(c, u, "request_type='Rodent Extermination'", "request_type")

def baltimore():
    u = "https://services1.arcgis.com/UWYHeuuJISiGmgXx/arcgis/rest/services/311_Customer_Service_Requests_2025/FeatureServer/0"
    c = Collector("baltimore", "services1.arcgis.com 311_Customer_Service_Requests_2025 layer 0")
    w = "SRType IN ('SW-Rat Rubout','SW-Rat Rubout Follow-up','HCD-Rodents')"
    return arcgis(c, u, w, "SRType")

def dc():
    c = Collector("washington-dc", "")
    w = ("SERVICECODEDESCRIPTION IN ('Rodent Inspection and Treatment',"
         "'DC Health Rodent & Vector Control')")
    base = "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/ServiceRequests/FeatureServer/"
    for n in (21, 18, 16):
        c.source = f"maps2.dcgis.dc.gov ServiceRequests layer {n}"
        arcgis(c, base + str(n), w, "SERVICECODEDESCRIPTION")
    return c

def pittsburgh():
    rid = "5202679a-d243-402e-b82a-63189995a942"
    c = Collector("pittsburgh", f"data.wprdc.org/{rid}")
    api = "https://data.wprdc.org/api/3/action/datastore_search"
    off, names = 0, None
    while True:
        d = get(api, {"resource_id": rid, "limit": 30000, "offset": off,
                      "filters": json.dumps({"subject": "Rodent Control"})})["result"]
        recs = d["records"]
        if names is None:
            names = [f["id"] for f in d["fields"]]
            id_c = pick(names, [r"^request_?id$", r"^_id$"])
            date_c = pick(names, [r"creat", r"open", r"date"])
            lat_c = pick(names, [r"^lat", r"^y$"])
            lon_c = pick(names, [r"^lon", r"^lng", r"^x$"])
            st_c = pick(names, [r"^status"])
            print(f"   columns: id={id_c} date={date_c} lat={lat_c} lon={lon_c} status={st_c}")
        for r in recs:
            c.add(r.get(id_c), r.get("subject"), r.get("request_type"),
                  r.get(date_c), r.get(st_c), r.get(lat_c), r.get(lon_c))
        if len(recs) < 30000:
            break
        off += 30000
    return c
