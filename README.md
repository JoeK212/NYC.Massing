# MASSING

Real NYC building massing, grown from actual PLUTO tax lot records and Building Footprints —
one extruded volume per real lot, at its true recorded height and footprint, with its allowed
zoning envelope (FAR-derived) rendered alongside it.

**Live at [nycmassing.netlify.app](https://nycmassing.netlify.app)**

Joe.K · [axisbim.io](https://axisbim.io)

## Highlights

- Real lot geometry and height for every building, not a stylized block
- Zoning envelope overlay — built vs. allowed FAR, at a glance
- Four color modes: Land Use, FAR Utilization, Year Built, Neighborhood
- Search any NYC neighborhood by name
- Click any building for its real PLUTO record (address, BBL, height, floors, FAR, etc.)

## Stack

Single-file Three.js app (r128), no build step, no dependencies to install. Data from NYC Open
Data (PLUTO + Building Footprints, joined on BBL) via the Socrata API.

## Deploying

Static site — push to `main` and Netlify deploys automatically. Run `node audit_deploy.js`
before shipping (a pre-flight check, not a linter).

Full version history lives in the `CHANGELOG` comment at the top of `index.html`.
