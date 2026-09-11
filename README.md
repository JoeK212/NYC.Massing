# Palette & Plan

A configurable dorm room planner. Pick a palette, drag real furniture into a
scaled 9'×12' floor plan, swap individual pieces, and see the room total
update live. "Generate look" prints a shoppable list; "Download plan" exports
the plan and list together as one PNG.

Built as a prototype for a dorm-decor concept — one room shell, two starting
palettes (Scandi Calm, Dark Academia), five swappable categories. No backend,
no database; everything runs client-side in the browser.

Live: TBD (deploy via Netlify — see below)

## Running locally

No build step. Open `index.html` directly, or serve the folder:

```
python3 -m http.server
```

## Deploying

Push this folder to a GitHub repo and connect it in Netlify (build command:
none, publish directory: `.`). `netlify.toml` is already wired for
continuous deployment from `main`.

## Local dev checklist

Run `node audit_deploy.js` before shipping any change — it checks
project-specific invariants (version sync between `index.html` and
`CHANGELOG.md`, escaping hygiene, iOS/mobile meta tags, and three
regressions hit during prototyping around the PNG export and drag
placement). Bump `APP_VERSION` and add a `CHANGELOG.md` entry for every
change, however small.

Joe.K · axisbim.io
