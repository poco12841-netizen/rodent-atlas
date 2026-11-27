# Methodology

## What this project measures
RODENT ATLAS shows official 311 service requests that city governments classify as rodent-related.
A 311 request is a report made by a person. It is NOT a count of rats and NOT a population estimate.

## Why complaint counts are not rat counts
Reports are influenced by:
- Population density (more people means more people to notice and report)
- Awareness of the 311 service
- Access to reporting channels (phone, app, web, language)
- Local reporting habits
- City response policies
- Changes in how cities classify requests

Because of this, the project never presents complaint counts as rat counts, and compares cities only with care.

## Data rules
- Only official public sources are used.
- No records, coordinates, or statistics are invented.
- Records without valid coordinates are not placed on the map. They are kept and counted as missing, never guessed.
- Original values are preserved. Every change we make is documented.
- Every displayed record keeps its original source ID, source URL, and retrieval time.

## Integration statuses
1. Not researched
2. Source identified
3. Access verified
4. Ingestion implemented
5. Data validated
6. Live updates operational

A city is called "integrated" only after status 5.

## Population-based rates
Rates per person are calculated only when a valid, documented population number is available. Otherwise they are not shown.

## Statistics
Statistical methods (hotspots, anomaly detection) are used only when data volume and assumptions support them. Methods, confidence, and limitations are shown next to every result.

## Data quality scores
Any quality indicator uses a documented formula published in this folder. No score is invented.
