# MASSING

Real NYC building massing, grown from actual PLUTO tax lot records and Building Footprints —
one extruded volume per real lot, from its real recorded height and footprint, with its
allowed zoning envelope (FAR-derived) rendered alongside it.

Live at **[nycmassing.netlify.app](https://nycmassing.netlify.app)**

Joe.K · [axisbim.io](https://axisbim.io)

Sibling project to [STAND](https://github.com/JoeK212) (procedurally-grown forest from the NYC
Street Tree Census) — same "one volume per real record, not a model" approach applied to
870K+ NYC tax lots instead of trees.

## What it does

- Fetches real PLUTO tax lot records + Building Footprints per borough (or per searched
  neighborhood) from NYC Open Data, joins them on BBL, and extrudes each lot to its actual
  recorded height with floor-line banding — not a stylized block.
- Renders each lot's zoning envelope (lot area × the greatest of residential/commercial/
  community-facility FAR) as a toggleable translucent volume, so built-vs-allowed capacity
  reads directly in the massing.
- Four color modes — **Land Use**, **FAR Utilization**, **Year Built**, and **Neighborhood**
  (colored by real NYC Neighborhood Tabulation Area boundaries) — each with a clickable,
  filterable legend.
- **Major streets** overlay (avenue-width and up) for orientation.
- **Neighborhood search** — jump straight to a named area (e.g. Hell's Kitchen) with every real
  lot loaded, uncapped, instead of browsing its whole borough.
- Near/mid/far LOD (full massing → simplified block → billboard dot) so the scene stays
  responsive at any zoom.
- Click any building for its real PLUTO record: address, BBL, land use, year built, height,
  floor count, lot area, and FAR utilization.
- Custom pointer-based orbit controls, plan (top-down) view, recenter, and a north-up compass.
- Vacant/no-footprint lots render as a flat lot-polygon marker rather than being skipped.
- localStorage caching for both per-borough data and the citywide static layers (borough
  outlines, major streets, neighborhood boundaries), so repeat loads skip the network fetch.

## Data sources (NYC Open Data / Socrata)

| Resource | ID | Used for |
|---|---|---|
| PLUTO (tabular) | `64uk-42ks` | Tax lot attributes (land use, FAR, year built, area, etc.) |
| Building Footprints | `5zhs-2jue` | Real footprint geometry + roof height, joined on `mappluto_bbl` |
| Borough Boundaries | `gthc-hcne` | Borough outline context layer |
| NYC Street Centerline (CSCL) | `inkn-q76z` | Major streets overlay, filtered to `streetwidth >= 60` |
| 2020 Neighborhood Tabulation Areas | `9nt8-h7nd` | Neighborhood search + Neighborhood color mode |

Boroughs are capped at 15,000 lots each for performance (raise once real-world frame time is
reverified live at a higher cap). A searched neighborhood loads in full, uncapped, since even
the largest single NTA stays comfortably under that limit.

## Files

- `index.html` — the entire app (Three.js r128, no build step, no other dependencies)
- `audit_deploy.js` — local pre-ship check (`node audit_deploy.js`); not a linter, checks
  project-specific invariants that have broken before or would silently break the app if
  regressed. Every version bump adds a check() for whatever it fixed, so this file doubles as
  a testable copy of the changelog.
- `netlify.toml` — static publish config
- `LICENSE`

## Deploying

Static site, no build step. Push to the connected GitHub repo and Netlify deploys
automatically, or drag the folder onto Netlify directly. Run `node audit_deploy.js` before
every deploy — see the header comment in that file for the full policy.

## Changelog

See the `CHANGELOG` block at the top of `index.html`'s `<script>` for full version history.
Current version: **v1.7.4**.
