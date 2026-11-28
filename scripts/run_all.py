from common import *
from socrata import socrata
from other_sources import detroit, dc, baltimore, pittsburgh


def boston():
    # Boston 311 is published on CKAN as one table per year, plus a new
    # system that started in Nov 2026 with different column names.
    c = Collector("boston", "")
    api = "https://data.boston.gov/api/3/action/datastore_search"
    old_tables = [
        "e6013a93-1321-4f2a-bf91-8d8a02f1e62f",
        "dff4d804-5031-443a-8409-8344efd0e5c8",
        "9d7c2214-4709-478a-a2e8-fb2020a5bb94",
        "1a0b420d-99f1-4887-9851-990b2a5a6e17",
    ]
    new_table = "254adca6-64ab-4c5c-9fc0-a6da622be185"
    jobs = [(r, "type", ["Rodent Activity", "Rat Bite"]) for r in old_tables]
    jobs.append((new_table, "service_name", ["Rat Activity"]))
    for rid, fcol, vals in jobs:
        try:
            c.source = f"data.boston.gov/{rid}"
            off, names = 0, None
            while True:
                d = get(api, {"resource_id": rid, "limit": 30000, "offset": off,
                              "filters": json.dumps({fcol: vals})})["result"]
                recs = d["records"]
                if names is None:
                    names = [f["id"] for f in d["fields"]]
                    id_c = pick(names, [r"case_enquiry_id", r"enquiry", r"^_id$"])
                    date_c = pick(names, [r"open_dt", r"open_date", r"creat"])
                    lat_c = pick(names, [r"^lat"])
                    lon_c = pick(names, [r"^lon", r"^lng"])
                    st_c = pick(names, [r"case_status", r"status"])
                    print(f"   {rid}: id={id_c} date={date_c} lat={lat_c} lon={lon_c} status={st_c}")
                for r in recs:
                    c.add(r.get(id_c), r.get(fcol), "", r.get(date_c),
                          r.get(st_c), r.get(lat_c), r.get(lon_c))
                if len(recs) < 30000:
                    break
                off += 30000
        except Exception as e:
            print(f"   WARNING: Boston table {rid} failed: {e}")
    return c


TASKS = [
    ("new-york", lambda: socrata("new-york", "data.cityofnewyork.us", "erm2-nwe9",
        "complaint_type='Rodent'", "complaint_type", "descriptor")),
    ("chicago", lambda: socrata("chicago", "data.cityofchicago.org", "v6vf-nfxy",
        "sr_type='Rodent Baiting/Rat Complaint'", "sr_type")),
    ("san-francisco", lambda: socrata("san-francisco", "data.sfgov.org", "vw6y-z8j6",
        "service_details='Infestation_Rodent_Insect'", "service_details", "service_subtype")),
    ("cincinnati", lambda: socrata("cincinnati", "data.cincinnati-oh.gov", "gcej-gmiw",
        "sr_type in ('RATS','MICE-BLD')", "sr_type", "sr_type_desc")),
    ("cambridge", lambda: socrata("cambridge", "data.cambridgema.gov", "2z9k-mv9g",
        "issue_category='Rodent Sighting'", "issue_category", "issue_type")),
    ("baton-rouge", lambda: socrata("baton-rouge", "data.brla.gov", "bktv-u9ua",
        "type='RODENT'", "type")),
    ("new-orleans", lambda: socrata("new-orleans", "data.nola.gov", "2jgv-pqrq",
        "request_reason in ('Rodent Complaint (Rats)','Rodent Complaint (Mice & Rats)')",
        "request_reason", "request_type")),
    ("kansas-city", lambda: socrata("kansas-city", "data.kcmo.org", "d4px-6rwg",
        "issue_sub_type='Rats'", "issue_sub_type", "issue_type")),
    ("boston", boston),
    ("detroit", detroit),
    ("washington-dc", dc),
    ("baltimore", baltimore),
    ("pittsburgh", pittsburgh),
]

summary = []
for name, fn in TASKS:
    print(f"\n== {name}", flush=True)
    try:
        c = fn()
        path = f"{OUT}/{c.city_id}.csv.gz"
        with gzip.open(path, "wt", newline="", encoding="utf-8") as f:
            w = csv.writer(f)
            w.writerow(HEAD)
            w.writerows(c.rows)
        ds = [r[5] for r in c.rows if r[5]]
        summary.append({
            "city": c.city_id, **c.st, "kept": len(c.rows),
            "first_date": min(ds) if ds else None,
            "last_date": max(ds) if ds else None,
            "sources": sorted(x for x in c.sources if x)})
        print("   DONE:", len(c.rows), "kept", flush=True)
    except Exception as e:
        print("   FAILED:", e, flush=True)
        summary.append({"city": name, "error": str(e)})

with open(f"{OUT}/data_summary.json", "w") as f:
    json.dump({"run_at": RUN_TS, "version": VERSION, "cities": summary}, f, indent=2)

print("\n=== SUMMARY ===")
print("city | fetched | no_coords | bad_coords | duplicates | kept | first_date | last_date")
for s in summary:
    if "error" in s:
        print(f"{s['city']} | FAILED: {s['error'][:150]}")
    else:
        print(f"{s['city']} | {s['fetched']} | {s['no_coords']} | {s['bad_coords']} | "
              f"{s['duplicates']} | {s['kept']} | {s['first_date']} | {s['last_date']}")
