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

## Next step
- Research New York City 311 open data source (first city candidate)

## City integration status
| City | Status |
|------|--------|
| New York City | Not researched |
| Chicago | Not researched |
| Los Angeles | Not researched |
| San Francisco | Not researched |
| Boston | Not researched |
| Philadelphia | Not researched |
| Washington, DC | Not researched |
| Seattle | Not researched |
| Baltimore | Not researched |
| Portland | Not researched |

## Decisions
- Phone-only workflow: edit files on github.com, run data jobs with GitHub Actions, publish with Cloudflare Pages
- Start without a database: scheduled jobs produce data files the site reads. Database may be added later.
