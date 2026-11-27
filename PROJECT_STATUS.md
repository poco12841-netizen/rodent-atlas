# RODENT ATLAS - Project Status

Last updated: 2026-11-27

## Mission
Open-source platform for official urban rodent-related 311 service requests across major US cities.
Rule: 311 complaints are NOT a measure of actual rat populations.

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
- NYC source identified (not yet accessed or validated)

## Next step
- Verify access to NYC dataset erm2-nwe9 (via GitHub Actions, since no computer)
- Find the exact rodent-related complaint category names in the data

## City integration status
| City | Status |
|------|--------|
| New York City | Source identified |
| Chicago | Not researched |
| Los Angeles | Not researched |
| San Francisco | Not researched |
| Boston | Not researched |
| Philadelphia | Not researched |
| Washington, DC | Not researched |
| Seattle | Not researched |
| Baltimore | Not researched |
| Portland | Not researched |

## NYC source notes
- Dataset: 311 Service Requests from 2020 to Present, id erm2-nwe9
- URL: https://data.cityofnewyork.us/d/erm2-nwe9
- Older data (2010-2019): dataset 76ig-c548
- Dec 2025: dataset was split and some column labels changed; each dataset will keep only 10 years of data
- Not yet verified: access, freshness, rodent category names, coordinate completeness

## Decisions
- Phone-only workflow: edit files on github.com, run data jobs with GitHub Actions, publish with Cloudflare Pages
- Start without a database: scheduled jobs produce data files the site reads. Database may be added later.
