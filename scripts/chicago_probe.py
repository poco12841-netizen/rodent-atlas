import json, time, urllib.request, urllib.parse

HOST = "https://data.cityofchicago.org"
BASE = HOST + "/resource/v6vf-nfxy.json"
HEAD = {"User-Agent": "Mozilla/5.0 (rodent-atlas research)", "Accept": "application/json"}


def fetch(url, tries=3, timeout=60):
    last = None
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers=HEAD)
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return json.load(r)
        except Exception as e:
            last = e
            print("  try", i + 1, "failed:", repr(e))
            time.sleep(5)
    raise last


def show(label, params):
    print(label)
    try:
        url = BASE + "?" + urllib.parse.urlencode(params)
        print("  ", json.dumps(fetch(url)))
    except Exception as e:
        print("   ERROR", repr(e))


print("columns:")
try:
    meta = fetch(HOST + "/api/views/v6vf-nfxy.json")
    print("  name:", meta.get("name"))
    print("  rowsUpdatedAt:", meta.get("rowsUpdatedAt"))
    print("  ", [c.get("fieldName") for c in meta.get("columns", [])])
except Exception as e:
    print("   ERROR", repr(e))

T = "sr_type='Rodent Baiting/Rat Complaint'"

show("types with rodent or rat:", {
    "$select": "sr_type,count(*) as n",
    "$where": "sr_type like '%Rodent%' OR sr_type like '%Rat%'",
    "$group": "sr_type",
})
show("total and range:", {
    "$select": "count(*) as n,min(created_date) as first,max(created_date) as last",
    "$where": T,
})
show("with coordinates:", {
    "$select": "count(*) as n",
    "$where": T + " AND latitude IS NOT NULL",
})
show("duplicate flag:", {
    "$select": "duplicate,count(*) as n",
    "$where": T,
    "$group": "duplicate",
})
show("status:", {
    "$select": "status,count(*) as n",
    "$where": T,
    "$group": "status",
})
