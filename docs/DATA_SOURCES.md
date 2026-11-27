# Data Sources

Every data source used by RODENT ATLAS is listed here with its verification status.
Numbers are never copied from third parties into the app. Only data we download and validate ourselves is shown.

## New York City

- Status: Access verified (2026-11-27, GitHub Actions run #5)
- Publisher: NYC Open Data (official city portal)
- Dataset: 311 Service Requests from 2020 to Present
- Dataset ID: erm2-nwe9
- URL: https://data.cityofnewyork.us/d/erm2-nwe9
- Older dataset (2010-2019): 76ig-c548
- Rodent category: complaint_type = "Rodent"
- Descriptors seen in discovery: Rat Sighting, Mouse Sighting, Rodent Sighting, Signs of Rodents, Condition Attracting Rodents
- Key columns: unique_key, created_date, closed_date, complaint_type, descriptor, status, borough, incident_zip, latitude, longitude
- Known change: December 2025 dataset split, some column labels changed, each dataset keeps 10 years of data
- Still to verify: full coordinate completeness, duplicates, historical coverage

## Other cities

| City | Status |
|---|---|
| Chicago | Source identified |
| Washington, DC | Source identified |
| Baltimore | Source identified |
| Boston | Source identified |
| San Francisco | Source identified |
| Seattle | Source identified, no rodent category found (third-party finding, to be checked) |
| Los Angeles | Source identified, no rodent category found (third-party finding, to be checked) |
| Philadelphia | Source identified, no rodent category found (third-party finding, to be checked) |
| Portland | Not researched |

## Third-party research

Initial city status was informed by github.com/parksiihu7/us-311-rat-map (docs/DATA_SOURCES.md). It is a lead, not proof. Each city is only marked as integrated after we verify it ourselves.
