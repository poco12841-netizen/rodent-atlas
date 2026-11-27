# RODENT ATLAS - Project Status

Last updated: 2026-11-27

## Mission
Open-source platform for official urban rodent-related 311 service requests across major US cities. Rule: 311 complaints are NOT a measure of actual rat populations.

## Owner constraints
- Complete beginner, no programming experience
- Works only from a phone (no computer)
- Prefers free tools
- Limited free AI credit: owner confirms steps by writing "done" (no screenshots needed)

## Current phase
Phase 1 - Foundation

## Done and verified
- Repository exists
- PROJECT_STATUS.md and README.md written
- NYC access check workflow (verify-nyc-access.yml) run successfully (run #5, HTTP 200)
- NYC access verified: dataset reachable, last updated 2026-11-27 UTC, 48 columns including latitude, longitude, created_date, complaint_type, descriptor
- NYC rodent category found: complaint_type = "Rodent"
- NYC descriptors seen in discovery sample: Rat Sighting, Condition Attracting Rodents, Rodent Sighting, Signs of Rodents, Mouse Sighting. descriptor_2 includes "Rodent Infestation"
- "Rodents/Insects/Garbage" descriptor appeared in text search under other complaint types; needs separate review before inclusion

## Next step
- Project folder structure and documentation (Phase 1)
- Then NYC ingestion (Phase 2): download real records with complaint_type = "Rodent", validate coordinates and dates

## City integration status

| City | Status | Notes |
|---|---|---|
| New York City | Access verified | Rodent category identified. Ingestion not yet implemented. |
| Chicago | Source identified | Third-party research lists mapped data; our access not verified |
| Washington, DC | Source identified | Same as above |
| Baltimore | Source identified | Same as above |
| Boston | Source identified | Same as above |
| San Francisco | Source identified | Low volume reported by third-party research; to be checked |
| Seattle | Source identified, no rodent category found | Third-party finding; needs our own check |
| Los Angeles | Source identified, no rodent category found | Third-party finding; needs our own check |
| Philadelphia | Source identified, no rodent category found | Third-party finding; needs our own check |
| Portland | Not researched | Not verified in third-party research |

Third-party research source: github.com/parksiihu7/us-311-rat-map (statuses only; no numbers are shown until we validate our own data).

## NYC source notes
- Dataset: 311 Service Requests from 2020 to Present, id erm2-nwe9
- URL: https://data.cityofnewyork.us/d/erm2-nwe9
- Older data (2010-2019): dataset 76ig-c548
- Dec 2025: dataset was split and some column labels changed; each dataset will keep only 10 years of data
- Discovery sample numbers are not statistics and must not be displayed
- Not yet verified: full coordinate completeness, duplicates, historical coverage

## Decisions
- Free tools first; warn before anything that could cost money
- Verification runs through GitHub Actions because the owner has no computer
- NYC is the first city to integrate (Phase 2)
- No city is called "Integrated" until we access and validate its source ourselves
