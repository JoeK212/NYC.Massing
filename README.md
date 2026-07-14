# MASSING

Real NYC building massing grown from actual PLUTO tax lot records — one extruded volume per lot, from its real recorded footprint and height, with its allowed zoning envelope (FAR-derived) rendered alongside it.

A sibling to [STAND](https://nycstreettrees.netlify.app/), applying the same one-structure-per-real-record idea to NYC's PLUTO dataset instead of the Street Tree Census: instead of growing a tree from a trunk diameter, this grows a building from its real footprint (NYC Building Footprints) and real roof height, joined to PLUTO's zoning and land-use attributes on BBL.

Borough-scoped (one borough loaded at a time), with three color modes (Land Use / FAR Utilization / Year Built), a near/mid/far camera-distance LOD system, and a toggleable overlay showing each lot's allowed buildable envelope against what's actually built.

Joe.K · [axisbim.io](https://axisbim.io)

## Data

- [MapPLUTO](https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-Map-MapPLUTO-/f888-ni5f) — PLUTO attributes (zoning, FAR, land use, year built) + lot polygon geometry
- [Building Footprints](https://data.cityofnewyork.us/City-Government/BUILDING/5zhs-2jue) — real building outline + real roof height, joined to MapPLUTO on `mpluto_bbl`

## Status

v1.0.0 — initial build. Field names cross-checked against two live-fetched authoritative sources (NYC OTI's Building Footprints metadata, PLUTO's data dictionary) but not yet a live query response — see the `KNOWN GAP` note in `index.html`'s header comment. First real load should be checked against the actual API response before the data pipeline is trusted.
