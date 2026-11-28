import json, urllib.request, urllib.parse

BASE = "https://data.cityofchicago.org/resource/v6vf-nfxy.json"


def get(params):
    url = BASE + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=180) as r:
        return json.load(r)


def show(label, params):
    try:
        print(label, json.dumps(get(params)))
    except Exception as e:
        print(label, "ERROR", e)


sample = get({"$limit": 1})
print("columns:", sorted(sample[0].keys()))

show("types:", {
    "$select": "sr_type,count(*) as n",
    "$where": "sr_type like '%Rodent%' OR sr_type like '%Rat%'",
    "$group": "sr_type",
})

T = "sr_type='Rodent Baiting/Rat Complaint'"
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
