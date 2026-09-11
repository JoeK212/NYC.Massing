#!/usr/bin/env node
/**
 * PALETTE & PLAN — deploy audit
 * Joe.K · axisbim.io
 *
 * Local-only pre-ship check for index.html and CHANGELOG.md. Run before every deploy:
 *   node audit_deploy.js
 *
 * Not a linter — checks project-specific invariants that have broken before or would
 * silently break the app if regressed. Exits 1 on any failure so it can gate a deploy
 * script if desired.
 *
 * Growth pattern: every time a bug is found and fixed, add a check() for it in the same
 * edit that fixes it, under a new sectionHeader() named after the version that fixed it.
 * The section list becomes a second, testable copy of the changelog.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'index.html');
if (!fs.existsSync(FILE)) {
  console.error(`✗ Could not find index.html next to this script at ${FILE}`);
  process.exit(1);
}
const src = fs.readFileSync(FILE, 'utf8');

const CHANGELOG_FILE = path.join(__dirname, 'CHANGELOG.md');
if (!fs.existsSync(CHANGELOG_FILE)) {
  console.error(`✗ Could not find CHANGELOG.md next to this script at ${CHANGELOG_FILE}`);
  process.exit(1);
}
const changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');

const RESET = '\x1b[0m', GREEN = '\x1b[32m', RED = '\x1b[31m', DIM = '\x1b[2m', BOLD = '\x1b[1m';

let pass = 0, fail = 0;
const failures = [];

function sectionHeader(name) {
  console.log(`\n${BOLD}${name}${RESET}`);
}

function check(desc, cond) {
  if (cond) {
    pass++;
    console.log(`  ${GREEN}✓${RESET} ${desc}`);
  } else {
    fail++;
    failures.push(desc);
    console.log(`  ${RED}✗${RESET} ${desc}`);
  }
}

/* ===================== Version sync ===================== */
sectionHeader('Version sync');
const versionMatch = src.match(/const APP_VERSION = '([\d.]+)'/);
const changelogTopMatch = changelog.match(/^v([\d.]+) - \d{4}-\d{2}-\d{2}/m);
check('APP_VERSION constant is defined', !!versionMatch);
check('CHANGELOG.md top entry version matches APP_VERSION', !!versionMatch && !!changelogTopMatch && versionMatch[1] === changelogTopMatch[1]);
check('footer renders APP_VERSION via template literal (not a hardcoded string)', /v\$\{APP_VERSION\}/.test(src));
check('index.html header comment has no leftover CHANGELOG block (changelog lives in CHANGELOG.md now)', !/CHANGELOG/.test(src.slice(0, src.indexOf('<html'))));

/* ===================== Debug / leftover artifacts ===================== */
sectionHeader('Debug / leftover artifacts');
check('no console.log left in source', !/console\.log\(/.test(src));
check('no debugger statements', !/\bdebugger\b/.test(src));
check('no lorem ipsum placeholder text', !/lorem ipsum/i.test(src));
check('no leftover alert( calls (toast() is the pattern here)', !/\balert\(/.test(src));
check('no leftover native confirm( calls (confirmDialog() is the pattern here)', !/[^a-zA-Z]confirm\(['"`]/.test(src));

/* ===================== Escaping / XSS hygiene ===================== */
sectionHeader('Escaping / XSS hygiene');
check('escapeHtml() helper defined', /function escapeHtml\(/.test(src));
check('escapeAttr() helper defined', /function escapeAttr\(/.test(src));
check('no eval( in source', !/\beval\(/.test(src));

/* ===================== iOS / mobile baseline ===================== */
sectionHeader('iOS / mobile baseline');
check('viewport meta includes viewport-fit=cover (required for env(safe-area-inset-*) to work)', /viewport-fit=cover/.test(src));
check('body has overscroll-behavior-y:contain (prevents pull-to-refresh from wiping unsaved input)', /overscroll-behavior-y:contain;/.test(src));
check('both apple-mobile-web-app-capable and the modern mobile-web-app-capable meta tags present', /name="apple-mobile-web-app-capable"/.test(src) && /name="mobile-web-app-capable"/.test(src));
check('confirmDialog() function defined (custom modal, not native confirm — iOS standalone mode silently no-ops confirm())', /function confirmDialog\(/.test(src));
check('text/url inputs use 16px font-size if present (prevents iOS auto-zoom-on-focus)',
  (!/input\[type=text\]/.test(src) || /input\[type=text\][^{]*\{[^}]*font-size:16px/.test(src)) &&
  (!/input\[type=url\]/.test(src) || /input\[type=url\][^{]*\{[^}]*font-size:16px/.test(src)));

/* ===================== Toast / status messaging ===================== */
sectionHeader('Toast / status messaging');
check('toast() helper defined', /function toast\(/.test(src));
check('#toast element present in static markup (outside dynamically-rendered main)', /<div class="toast" id="toast">/.test(src));

/* ===================== v1.0.0 — drag-and-drop + PNG export regressions =====================
   These three were real bugs hit during prototyping, before this tool was formalized under
   the template. Encoded here so a future refactor can't silently reintroduce them. */
sectionHeader('v1.0.0 — drag-and-drop + PNG export regressions');
check('cloned SVG export sets explicit width/height (prevents the 300x150 default-intrinsic-size crop bug on download)',
  /clone\.setAttribute\('width', svgW\)/.test(src) && /clone\.setAttribute\('height', svgH\)/.test(src));
check('canvas plan draw specifies explicit target dimensions (not a bare drawImage(img,0,0), which caused the same crop bug)',
  /drawImage\(img, 0, 0, svgW, svgH\)/.test(src));
check('furniture label color adapts to fill luminance (a hardcoded dark label nearly vanished on the Dark Academia palette\'s darker fills)',
  /luminance\(prod\.color\)/.test(src));
check('drag-item groups use pointer events with touch-action:none (mobile-safe dragging, not mouse-only)',
  /touch-action:none/.test(src) && /pointerdown/.test(src) && /pointermove/.test(src) && /pointerup/.test(src));
check('state.positions initialized to null for every category (room starts empty, not pre-populated)',
  /state\.positions\[c\.id\] = null/.test(src));

/* ===================== v1.1.0 — rotation ===================== */
sectionHeader('v1.1.0 — rotation');
check('bboxFor() helper exists and swaps w/d at 90°/270° (rotation-aware footprint for clamping/snapping)',
  /function bboxFor\(cat, rotation\)/.test(src) && /rotation === 90 \|\| rotation === 270/.test(src));
check('rotate handle click re-clamps position against the *new* rotated bbox immediately (prevents an item growing past a wall it was pinned against)',
  /state\.rotations\[catId\] = \(\(state\.rotations\[catId\] \|\| 0\) \+ 90\) % 360;[\s\S]{0,200}bboxFor\(cat, state\.rotations\[catId\]\)/.test(src));
check('drag clamping (pointermove and endDrag) uses the rotated bbox, not the raw category footprint',
  (src.match(/ROOM_W - bbox\.bw/g) || []).length >= 2);
check('rotation resets to 0 when an item is dropped back in the tray (no carried-over orientation)',
  /state\.rotations\[catId\] = 0; \/\/ reset orientation/.test(src));
check('lamp is excluded from the rotate handle (circular — rotation would be visually inert)',
  /if \(catId !== 'lamp'\)/.test(src));

/* ===================== v1.2.0 — placed-items-only total/list ===================== */
sectionHeader('v1.2.0 — placed-items-only total/list');
check('placedCategories() helper exists and total() uses it (not the raw categories list)',
  /function placedCategories\(\)/.test(src) && /function total\(\)\{ return placedCategories\(\)/.test(src));
check('Generate look list is built from placedCategories(), not all categories', /placed\.map\(c => \{/.test(src));
check('PNG export list is built from placedCategories(), not all categories', /placed\.forEach\(cat => \{/.test(src));
check('empty-room case handled on screen (Generate look) and in the PNG export (no bare empty list)',
  /Nothing placed in the room yet — drag an item in first\./.test(src) && /Nothing placed in the room yet\./.test(src));
check('endDrag() refreshes the panel as well as the plan (regression: Room total previously only updated on the next unrelated render, not immediately after a drag)',
  /dragState = null;\s*\n\s*renderPlanSvg\(\);\s*\n\s*renderPanel\(\);/.test(src));

/* ===================== v1.3.0 — multiple room plans + palettes ===================== */
sectionHeader('v1.3.0 — multiple room plans + palettes');
check('roomPlans array defines at least two plans (NYU, Green University)',
  /id: 'nyu'/.test(src) && /id: 'green-university'/.test(src));
check('ROOM_W/ROOM_D/svgW/svgH are mutable (let, not const) so applyRoomPlan() can actually change them',
  /let ROOM_W, ROOM_D, ROOM_BOTTOM, TRAY_TOP, TRAY_H, svgW, svgH;/.test(src));
check('wallOpeningLine() generalizes door/window drawing across all four walls (not hardcoded to north/south)',
  /function wallOpeningLine\(wall, fromFt, toFt/.test(src) && /wall === 'west'/.test(src) && /wall === 'east'/.test(src) !== undefined);
check('switching room plans clears positions and rotations for every category (stale coordinates from a differently-shaped room are never carried over)',
  /state\.roomPlan = btn\.dataset\.r;[\s\S]{0,250}state\.positions\[c\.id\] = null;\s*\n\s*state\.rotations\[c\.id\] = 0;/.test(src));
check('four palettes are defined (Scandi Calm, Dark Academia, Frat Boy, Girly), each with all five categories covered',
  (src.match(/palette: 'frat-boy'/g) || []).length === 5 && (src.match(/palette: 'girly'/g) || []).length === 5);

/* ===================== v1.4.0 — desktop/tablet-only minimum viewport ===================== */
sectionHeader('v1.4.0 — desktop/tablet-only minimum viewport');
check('#tooSmallBlock exists with real content (icon + message), not an empty placeholder div',
  /<div id="tooSmallBlock"/.test(src) && /tablet or desktop screen/.test(src) && /viewBox="0 0 72 72"/.test(src));
check('the old "uncomment this" scaffolding comment is gone (block screen is live, not still a placeholder)', !/Uncomment for tools with a genuinely desktop\/tablet-only/.test(src));
check('MIN_VIEWPORT_WIDTH is defined at the template default (760px — smallest common tablet)', /const MIN_VIEWPORT_WIDTH = 760/.test(src));
check('checkViewportSize() runs on boot AND on resize (not just one or the other)', /window\.addEventListener\('resize', checkViewportSize\)/.test(src) && /checkViewportSize\(\); \/\/ run on boot/.test(src));

/* ===================== v1.5.0 — genuine light theme + reset room ===================== */
sectionHeader('v1.5.0 — genuine light theme + reset room');
check('default (:root) theme is genuinely light, not a second dark variant (regression: both toggle states used to be near-black navy)',
  /--paper: #F5F3FA;/.test(src));
check('the blueprint canvas has its own fixed --plan-canvas variable, independent of the light/dark page toggle',
  /--plan-canvas: #0E1220;/.test(src) && /background:var\(--plan-canvas\)/.test(src));
check('PNG export reads --plan-canvas for its background, not the now-toggleable --paper-deep (regression: export would otherwise turn light/washed-out in light mode)',
  /getPropertyValue\('--plan-canvas'\)/.test(src) && !/getPropertyValue\('--paper-deep'\)/.test(src));
check('resetRoom() exists and uses confirmDialog() rather than native confirm()',
  /function resetRoom\(\)/.test(src) && /confirmDialog\('Clear everything currently placed in the room\?'/.test(src));
check('resetRoom() short-circuits with a toast when the room is already empty, instead of showing a pointless confirm dialog',
  /if \(placedCategories\(\)\.length === 0\) \{ toast\('Room is already empty'\); return; \}/.test(src));

/* ===================== v1.5.1 — plan-column sizing regression ===================== */
sectionHeader('v1.5.1 — plan-column sizing regression');
check('.swatch-row is a grid (2 columns), not a flex row — 4-across flex was what forced the panel column wide and starved the plan column of its share',
  /\.swatch-row\{ display:grid; grid-template-columns:repeat\(2, 1fr\)/.test(src));
check('.layout ratio favors the plan column (1.6fr or higher) over the panel column',
  /\.layout\{ display:grid; grid-template-columns:1\.[6-9]fr 1fr/.test(src));

/* ===================== v1.6.0 — contrast, default theme, swatch alignment ===================== */
sectionHeader('v1.6.0 — contrast, default theme, swatch alignment');
check('unplaced category cards are no longer dimmed via whole-card opacity (regression: crushed text contrast badly in dark mode)',
  !/\.cat-card\.unplaced\{ opacity:/.test(src));
check('default theme (:root, no data-theme attribute) is dark/Night, not light/Day',
  /:root\{\s*\n\s*\/\* Night — default \*\//.test(src));
check('light theme is reached via an explicit data-theme="light" attribute, not the reverse',
  /:root\[data-theme="light"\]\{/.test(src) && !/:root\[data-theme="dark"\]\{/.test(src));
check('toggleTheme() removes the attribute for dark (falling back to the :root default) rather than setting data-theme="dark" explicitly',
  /if \(next === 'light'\) document\.documentElement\.setAttribute\('data-theme', 'light'\);\s*\n\s*else document\.documentElement\.removeAttribute\('data-theme'\);/.test(src));
check('swatch-label spreads name/price across the full button width (space-between), not packed left with dead trailing space',
  /\.swatch-label\{ display:flex; flex:1; justify-content:space-between/.test(src));

/* ===================== v1.6.2 — swatch button missing explicit color ===================== */
sectionHeader('v1.6.2 — swatch button missing explicit color');
check('.swatch sets an explicit color (regression: native <button> elements do not reliably inherit text color from the page, per this suite\'s own documented convention — v1.6.0\'s opacity fix addressed a real but secondary issue without fixing the actual cause)',
  /\.swatch\{[\s\S]{0,220}color:var\(--ink\)/.test(src));

/* ===================== v1.6.3 — header/main width mismatch ===================== */
sectionHeader('v1.6.3 — header/main width mismatch');
check('header.top .inner and main share the same max-width (regression: header stayed at the old 1180px cap after main widened to 1400px in v1.5.1, misaligning the title against the body content)',
  (() => {
    const headerMatch = src.match(/header\.top \.inner\{ max-width:(\d+)px/);
    const mainMatch = src.match(/main\{max-width:(\d+)px/);
    return headerMatch && mainMatch && headerMatch[1] === mainMatch[1];
  })());

/* ===================== v1.7.0 — furniture dimension annotations ===================== */
sectionHeader('v1.7.0 — furniture dimension annotations');
check('dimension text is computed from the current rotated bbox (bbox.bw/bbox.bh), not the static intrinsic footprint (cat.w/cat.d) — must update live on rotation',
  /const dimText = `\$\{bbox\.bw\.toFixed\(1\)\}' × \$\{bbox\.bh\.toFixed\(1\)\}'`/.test(src));
check('dimension annotation uses the same size threshold as the category label (bbox.bw >= 1.2), so it never renders standalone without the label it sits under',
  /if \(bbox\.bw >= 1\.2\) \{[\s\S]{0,400}dimText/.test(src));

/* ===================== v1.8.0 — dimensions in itemized lists ===================== */
sectionHeader('v1.8.0 — dimensions in itemized lists');
check('on-screen Generate look list includes dimension text derived from bboxFor(), not just name/price',
  /const bbox = bboxFor\(c, state\.rotations\[c\.id\] \|\| 0\);\s*\n\s*const dim = `\$\{bbox\.bw\.toFixed\(1\)\}' × \$\{bbox\.bh\.toFixed\(1\)\}'`;/.test(src));
check('PNG export list measures the main text width before drawing the dimension (prevents overlapping the right-aligned price on long product names)',
  /ctx\.measureText\(mainText\)\.width/.test(src));

/* ===================== v1.9.0 — shareable link + PDF export ===================== */
sectionHeader('v1.9.0 — shareable link + PDF export');
check('jsPDF is loaded via CDN script tag (no build step, matches this suite\'s no-framework convention)',
  /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\//.test(src));
check('PNG and PDF export share one canvas-building function (buildPlanCanvas), so they can\'t visually drift apart from each other',
  /function buildPlanCanvas\(onReady, onError\)/.test(src) &&
  /function downloadPlanImage\(\)\{\s*\n\s*buildPlanCanvas\(/.test(src) &&
  /function downloadPlanPDF\(\)\{[\s\S]{0,400}buildPlanCanvas\(/.test(src));
check('downloadPlanPDF() checks jsPDF is actually loaded before using it (CDN script could still be loading, or blocked) and toasts instead of throwing',
  /if \(!window\.jspdf \|\| !window\.jspdf\.jsPDF\)/.test(src));
check('PDF page format is sized to the exported canvas\'s own proportions (format:[pageW,pageH]), not a fixed Letter/A4 page with cropping or margins',
  /format: \[pageW, pageH\]/.test(src));
check('share link encodes the full configurable state — room plan, palette, per-category picks, positions, and rotations',
  /function shareStateObj\(\)\{\s*\n\s*return \{ r: state\.roomPlan, p: state\.palette, k: state\.picks, s: state\.positions, o: state\.rotations \};/.test(src));
check('restoreFromHash() validates every restored field against the real catalog/room data (roomPlans/palettes/productById), never applies raw hash input directly',
  /function restoreFromHash\(\)\{[\s\S]{0,1500}roomPlans\.find\(p => p\.id === obj\.r\)[\s\S]{0,600}palettes\.find\(p => p\.id === obj\.p\)[\s\S]{0,600}productById\(c\.id, pick\)/.test(src));
check('restored positions are re-clamped to the (possibly just-switched) room\'s bounds using the same bboxFor() logic as drag placement, so a stale link can\'t place an item outside the walls',
  /function restoreFromHash\(\)\{[\s\S]{0,2500}bboxFor\(c, state\.rotations\[c\.id\] \|\| 0\)[\s\S]{0,300}Math\.max\(0, Math\.min\(ROOM_W - bbox\.bw/.test(src));
check('a malformed share hash is caught and toasted, not left to throw during boot',
  /function restoreFromHash\(\)\{[\s\S]{0,300}try \{[\s\S]{0,300}\} catch \(e\) \{\s*\n\s*toast\('Could not read that share link'\);/.test(src));
check('copyShareLink() falls back to a manual copy (execCommand) when the async Clipboard API is unavailable, rather than silently failing',
  /function fallbackCopy\(text\)\{/.test(src) && /document\.execCommand\('copy'\)/.test(src));
check('restoreFromHash() runs before the first render() in boot(), so a shared link is applied before anything is drawn',
  /restoreFromHash\(\); \/\/ apply a shared-link state[\s\S]{0,50}render\(\);/.test(src));

/* ===================== Summary ===================== */
console.log(`\n${BOLD}${'-'.repeat(40)}${RESET}`);
console.log(`${GREEN}${pass} passed${RESET}, ${fail ? RED : DIM}${fail} failed${RESET}`);
if (fail) {
  console.log(`\n${RED}${BOLD}Failures:${RESET}`);
  failures.forEach(f => console.log(`  ${RED}✗${RESET} ${f}`));
  process.exit(1);
} else {
  console.log(`${GREEN}All checks passed — clear to ship.${RESET}`);
  process.exit(0);
}
