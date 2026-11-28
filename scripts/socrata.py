from common import *

DATE_T = {"calendar_date", "date", "floating_timestamp", "fixed_timestamp"}

def socrata(city_id, domain, ds, where, cat, desc=None):
    c = Collector(city_id, f"{domain}/{ds}")
    meta = get(f"https://{domain}/api/views/{ds}.json")
    cols = [(x["fieldName"], x.get("dataTypeName", ""))
            for x in meta["columns"] if not x["fieldName"].startswith(":")]
    names = [n for n, _ in cols]
    dates = [n for n, t in cols if t in DATE_T]
    date_c = pick(dates, [r"creat", r"open", r"request", r"submit",
                          r"receiv", r"date", r"time", r".*"])
    lat_c = pick(names, [r"^latitude$", r"^lat$"])
    lon_c = pick(names, [r"^longitude$", r"^long$", r"^lng$", r"^lon$"])
    pt_c = next((n for n, t in cols if t in ("point", "location")), None)
    id_c = pick(names, [r"^(unique_key|sr_number|service_request_id|ticket_id|case_id|request_id|objectid|id)$",
                        r"request.*id", r"_id$"])
    st_c = pick(names, [r"^status$", r"status"])
    cat_ok = cat if cat in names else None
    desc_ok = desc if desc in names else None
    print(f"   columns: id={id_c} date={date_c} lat={lat_c} lon={lon_c} point={pt_c} status={st_c}")
    sel = [x for x in dict.fromkeys([id_c, date_c, lat_c, lon_c, pt_c, st_c, cat_ok, desc_ok]) if x]
    url = f"https://{domain}/resource/{ds}.json"
    off = 0
    while True:
        page = get(url, {"$select": ",".join(sel), "$where": where,
                         "$order": ":id", "$limit": 50000, "$offset": off})
        for r in page:
            lat, lon = r.get(lat_c), r.get(lon_c)
            p = r.get(pt_c) if pt_c else None
            if (lat in (None, "") or lon in (None, "")) and isinstance(p, dict):
                if "latitude" in p:
                    lat, lon = p.get("latitude"), p.get("longitude")
                elif "coordinates" in p:
                    lon, lat = p["coordinates"][0], p["coordinates"][1]
            c.add(r.get(id_c), r.get(cat_ok), r.get(desc_ok),
                  r.get(date_c), r.get(st_c), lat, lon)
        if len(page) < 50000:
            break
        off += 50000
        print(f"   ... {off} rows read", flush=True)
    return c
