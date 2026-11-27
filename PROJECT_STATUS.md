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
- PROJECT_STATUS.md created
- README.md rewritten with project description, scientific limitation, and principles
- NYC access-check workflow file added (verify-nyc-access.yml); not yet run or verified
- NYC source identified (not yet accessed or validated)

## Next step
- Run the NYC access check in the Actions tab (dataset erm2-nwe9)
- Find the exact rodent-related complaint category names in the data

## City integration status

| City | Status | Notes |
|---|---|---|
| New York City | Source identified | First city for Phase 2 |
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
- Not yet verified: access, freshness, rodent category names, coordinate completeness

## Decisions
- Free tools first; warn before anything that could cost money
- Verification runs through GitHub Actions because the owner has no computer
- NYC is the first city to integrate (Phase 2)
- No city is called "Integrated" until we access and validate its source ourselves
