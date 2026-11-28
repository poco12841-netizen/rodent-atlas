# Data Sources

This file records every city source that has been **checked by running real queries**.
Nothing here is guessed. Counts come from the verification run of **2026-11-28** and will change as cities update their data.

> 311 complaints are NOT a direct measurement of rat populations. Cities record different kinds of events (sightings, baiting requests, inspections), so counts must not be compared across cities as if they meant the same thing.

## Integration status

| City | Status | Portal type |
|---|---|---|
| New York City | Access verified | Socrata |
| Chicago | Access verified | Socrata |
| San Francisco | Access verified | Socrata |
| Cincinnati | Access verified | Socrata |
| Cambridge, MA | Access verified | Socrata |
| Baton Rouge | Access verified | Socrata |
| New Orleans | Access verified | Socrata |
| Detroit | Access verified (count only) | ArcGIS |
| Washington, DC | Access verified (count only, year per layer to confirm) | ArcGIS |
| Baltimore | Access verified for 2025 layer only | ArcGIS |
| Pittsburgh | Access verified (count only) | CKAN (WPRDC) |
| Boston | Source identified, not tested yet | CKAN |
| Denver, Minneapolis, San Diego, Columbus, Atlanta, Portland | Not tested | various |

"Access verified" means the real portal answered and returned rodent-related records. It does NOT yet mean the data is validated or ingested.

## Verified Socrata sources

| City | Domain | Dataset ID | Rodent filter | Records | With coordinates |
|---|---|---|---|---|---|
| New York City | data.cityofnewyork.us | erm2-nwe9 | complaint_type = 'Rodent' | 245,839 | 244,248 |
| Chicago | data.cityofchicago.org | v6vf-nfxy | sr_type = 'Rodent Baiting/Rat Complaint' | 392,745 | 392,340 |
| San Francisco | data.sfgov.org | vw6y-z8j6 | service_details = 'Infestation_Rodent_Insect' | 3,956 | 3,956 |
| Cincinnati | data.cincinnati-oh.gov | gcej-gmiw | sr_type IN ('RATS','MICE-BLD') | 3,806 + 4,539 | all |
| Cambridge | data.cambridgema.gov | 2z9k-mv9g | issue_category = 'Rodent Sighting' | 4,897 | 4,897 |
| Baton Rouge | data.brla.gov | bktv-u9ua | type = 'RODENT' | 18,345 | 18,325 |
| New Orleans | data.nola.gov | 2jgv-pqrq | request_reason IN ('Rodent Complaint (Rats)','Rodent Complaint (Mice & Rats)') | 4,828 + 1,692 | all |

### Notes and cautions

- **NYC:** the descriptor and descriptor_2 columns contain extra rodent-related labels. complaint_type = 'Rodent' is the base filter; keep the descriptor as a source field. The dataset is "311 Service Requests from 2020 to Present", so older years need a separate dataset.
- **Chicago:** the category is a baiting request, which includes duplicates. The portal marks duplicates in the status field.
- **San Francisco:** the same cases appear under more than one subtype label. Do not add the label counts together.
- **Cincinnati:** the detailed sr_type_desc labels overlap with sr_type. Use only one level, and do not add them together.
- **Cambridge:** issue_type is free text typed by residents (some entries are not rodent reports). issue_category = 'Rodent Sighting' is the cleaner filter.
- **New Orleans:** the request type "Mosquito, Termite & Rodent Control" mixes in non-rodent requests. Filter by request_reason and exclude the "Non-Rodent Complaint" reasons.

## Verified non-Socrata sources (count checked only)

| City | Source | Filter used | Count returned |
|---|---|---|---|
| Detroit | ArcGIS Improve Detroit FeatureServer layer 0 | request_type = 'Rodent Extermination' with latitude present | 27,179 |
| Washington, DC | ArcGIS ServiceRequests FeatureServer layers 21, 18, 16 | SERVICECODEDESCRIPTION IN ('Rodent Inspection and Treatment','DC Health Rodent & Vector Control') | 19,830 / 16,684 / 16,883 |
| Baltimore | ArcGIS "311 Customer Service Requests 2025" layer 0 | SRType IN ('SW-Rat Rubout','SW-Rat Rubout Follow-up','HCD-Rodents') | 6,019 (2025 only) |
| Pittsburgh | WPRDC CKAN datastore | subject = 'Rodent Control' | 8,465 |

To do: confirm which year each DC layer covers, check Baltimore's other years, and verify coordinates for DC, Baltimore and Pittsburgh.

## Checked and found NOT usable

| City | Result |
|---|---|
| Austin | No 311 dataset found through the automatic portal search. Rodent category not confirmed. |
| Buffalo | No 311 dataset found. |
| Hartford | Portal catalog search failed (404). Not confirmed. |
| Oakland | 311 datasets found, but no rodent category found. |
| Honolulu | Only individual comments mention rats in free text. No rodent category. Not usable. |
| Providence, Orlando, Memphis, Syracuse, Albuquerque | Nothing relevant found with this method. |

A failed automatic search does not prove a city has no data; it only means this method did not find any.

## Cities reported as unusable by another project

Seattle, Los Angeles and Philadelphia were reported by another public project as having no rodent category. This has **not** been independently verified here.

## How these numbers were obtained

A Python probe script queried each portal's public API for category names and counts. Record counts include all years available in each dataset at the time of the run.
