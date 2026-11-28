from common import *
from socrata import socrata
from other_sources import detroit, dc, baltimore, pittsburgh

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
