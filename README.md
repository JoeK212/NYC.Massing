# MASSING

Real NYC building massing grown from actual PLUTO tax lot records — one extruded volume per lot, from its real recorded footprint and height, with its allowed zoning envelope (FAR-derived) rendered alongside it.

A sibling to [STAND](https://nycstreettrees.netlify.app/), applying the same one-structure-per-real-record idea to NYC's PLUTO dataset instead of the Street Tree Census: instead of growing a tree from a trunk diameter, this grows a building from its real footprint (NYC Building Footprints) and real roof height, joined to PLUTO's zoning and land-use attributes on BBL.

Borough-scoped (one borough loaded at a time), with three color modes (Land Use / FAR Utilization / Year Built), a near/mid/far camera-distance LOD system, and a toggleable overlay showing each lot's allowed buildable envelope against what's actually built.

Joe.K · [axisbim.io](https://axisbim.io)

## Data

- [PLUTO](https://data.cityofnewyork.us/City-Government/Primary-Land-Use-Tax-Lot-Output-Map-MapPLUTO-/64uk-42ks) — tabular PLUTO attributes (zoning, FAR, land use, year built, lot geometry), joined to Building Footprints on BBL. (MapPLUTO's `f888-ni5f` resource turned out to be a non-queryable Socrata Map asset, not a tabular one — this is the real resource the app queries.)
- [Building Footprints](https://data.cityofnewyork.us/City-Government/BUILDING/5zhs-2jue) — real building outline + real roof height
- [Borough Boundaries](https://data.cityofnewyork.us/City-Government/Borough-Boundaries/gthc-hcne) — the 5 borough context outlines and name labels

## Status

v1.4.5 — live and deployed at [nycmassing.netlify.app](https://nycmassing.netlify.app). Since the initial build: fixed the real MapPLUTO data-source issue (switched to the tabular `64uk-42ks` PLUTO resource), added 3D navigation (orbit/pan/zoom, recenter, north compass, plan view), all 5 borough context outlines with name labels, a sky gradient with day/night theme toggle, discrete filter buckets for all three color modes with a Show all/Hide all shortcut, an in-app help modal, and a collision-aware zoom-in clamp that keeps the camera from ending up inside solid geometry. Full history in the `CHANGELOG` block at the top of `index.html`.
