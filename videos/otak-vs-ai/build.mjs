// build.mjs — TEMPLATE "ilustrasi + overlay" (9:16). Data-driven: edit storyboard.json and script.json, not this file.
// Layers: full-bleed illustration per scene (slow zoom/pan) -> label + badge + brand -> callouts / stat -> highlighted captions.
// Every cue is "the next time this word is spoken after the previous cue" (chained in storyboard order).
// A missing image (assets/img/<name>) renders a labelled placeholder, so the template renders before any image exists.
import fs from "node:fs";
import path from "node:path";

// PLAN is only a note for the linter/reviewer (the real timing comes from storyboard.json). Keep one row per scene.
export const PLAN = [
  { beat: "H1 otak",        from: "start", to: "next", hero: "slam", zones: "full-bleed art | label top | caption 1500" },
  { beat: "H2 jaringan",    from: "next",  to: "next", hero: "slam", zones: "full-bleed art | caption 1500" },
  { beat: "H3 robot",       from: "next",  to: "next", hero: "slam", zones: "full-bleed art | caption 1500" },
  { beat: "S4 neuron",      from: "next",  to: "next", hero: "slam", zones: "art 420-1200 | callouts 1210-1480 | caption 1500" },
  { beat: "S5 chip",        from: "next",  to: "next", hero: "slam", zones: "art | callout | caption 1500" },
  { beat: "S6 kekuatan AI", from: "next",  to: "next", hero: "slam", zones: "art | callouts | caption 1500" },
  { beat: "S7 manusia",     from: "next",  to: "next", hero: "slam", zones: "art | callouts | caption 1500" },
  { beat: "S8 salah",       from: "next",  to: "next", hero: "slam", zones: "art | callout | caption 1500" },
  { beat: "S9 timbangan",   from: "next",  to: "next", hero: "slam", zones: "art | callouts | caption 1500" },
  { beat: "END pesan",      from: "next",  to: "end",  hero: "slam", zones: "art | big text 300-700 | caption 1500" },
];

const proj = process.argv[2] || ".";
const SB = JSON.parse(fs.readFileSync(path.join(proj, "storyboard.json"), "utf8"));
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];
const W = 1080, H = 1920;
const BG = "#E9E1C8", INK = "#F4F5F7", DARK = "#16181D", ACCENT = "#F5C242", RED = "#E5484D";
const fx = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const VO_START = 0.35;
const FAST = !!SB.fast;                 // storyboard "fast": true -> quick cuts, stronger zoom, a small punch at every scene start
const FADE = FAST ? 0.1 : 0.3;

function TA(word, after) {
  for (const w of VO.words) {
    const t = fx(VO_START + w.start);
    if (t > after + 0.01 && norm(w.text).startsWith(norm(word))) return t;
  }
  throw new Error(`cue "${word}" after ${after}s not found — the script changed; fix storyboard.json`);
}
const VO_END = fx(VO_START + VO.duration);
const TOTAL = fx(VO_END + 1.0);
if (TOTAL > 179) throw new Error(`total ${TOTAL}s exceeds the 2:59 ceiling — cut words, never speed up the voice`);

// ------------------------------------------------------------ cues (chained across scenes and their callouts, in order)
let cur = -1;
const S = SB.scenes.map((sc) => {
  const start = sc.at == null ? 0 : (cur = TA(sc.at, cur));
  if (sc.at == null) cur = 0;
  const callouts = (sc.callouts || []).map((c) => ({ ...c, t: (cur = TA(c.at, cur)) }));
  const bigs = (sc.bigs || []).map((g) => ({ ...g, t: g.at === "@start" ? start : (cur = TA(g.at, cur)) }));
  const stat = sc.stat ? { ...sc.stat, t: (cur = TA(sc.stat.at, cur)) } : null;
  return { ...sc, start, callouts, bigs, stat };
});
S.forEach((sc, i) => { sc.end = i + 1 < S.length ? S[i + 1].start : TOTAL; });

// ------------------------------------------------------------ elements + tweens
const tl = [], els = [];
S.forEach((sc, i) => {
  const FD = sc.fade ?? FADE;
  const id = `sc${i}`, dur = fx(sc.end - sc.start + 0.3);
  const imgFile = sc.img ? path.join(proj, "assets/img", sc.img) : null;
  const has = imgFile && fs.existsSync(imgFile);
  const bgInner = has
    ? `<div id="${id}i" class="img" style="background-image:url('assets/img/${esc(sc.img)}')"></div>`
    : `<div id="${id}i" class="img ph"><span>${esc(sc.img || "gambar")}<br><small>${esc(sc.prompt || "")}</small></span></div>`;
  els.push(`<div id="${id}" class="scn footage">${bgInner}
    <div class="lab">${esc(sc.label || "")}</div>
    <div class="badge">${esc(sc.badge || SB.badgeDefault || "")}</div>
    <div class="brand">${esc(SB.brand || "")}</div>
  </div>`);
  const first = i === 0, at = first ? 0 : fx(Math.max(0, sc.start - 0.15));
  tl.push(`tl.fromTo("#${id}",{autoAlpha:0},{autoAlpha:1,duration:${first ? 0.01 : FD},ease:"none"},${at});`);
  const z = sc.zoom || (FAST ? [1.0, 1.22] : [1, 1.1]), p = sc.pan || (FAST ? [(i % 2 ? -40 : 40), -30] : [0, 0]);
  tl.push(`tl.fromTo("#${id}i",{scale:${z[0]},x:0,y:0},{scale:${z[1]},x:${p[0]},y:${p[1]},duration:${dur},ease:"none"},${at});`);
  if (FAST && !first) tl.push(`tl.fromTo("#${id}",{scale:1.07},{scale:1,duration:0.25,ease:"power3.out"},${at});`);
  if (i + 1 < S.length) {
    const out = fx(Math.max(sc.end - 0.1, at + 0.9));
    const NF = S[i + 1].fade ?? FADE;   // fade out as long as the next scene fades in, so a slow dissolve is a real dissolve
    tl.push(`tl.to("#${id}",{autoAlpha:0,duration:${NF},ease:"none"},${fx(out)});`);
    tl.push(`tl.set("#${id}",{autoAlpha:0},${fx(out + NF)});`);
  }
  sc.callouts.forEach((c, k) => {
    const cid = `${id}c${k}`;
    els.push(`<div id="${cid}" class="ct callout" style="left:${c.x}px;top:${c.y}px">${esc(c.text)}</div>`);
    tl.push(`tl.fromTo("#${cid}",{autoAlpha:0,scale:0.8,y:14},{autoAlpha:1,scale:1,y:0,duration:0.28,ease:"back.out(1.6)"},${fx(c.t)});`);
    const o = fx(Math.max(sc.end - 0.2, c.t + 0.9));
    tl.push(`tl.to("#${cid}",{autoAlpha:0,duration:0.2},${o});`, `tl.set("#${cid}",{autoAlpha:0},${fx(o + 0.2)});`);
  });
  sc.bigs.forEach((g, k) => {
    const gid = `${id}g${k}`, nxt = sc.bigs[k + 1];
    els.push(`<div id="${gid}" class="ct big">${g.html}</div>`);
    tl.push(`tl.fromTo("#${gid}",{autoAlpha:0,scale:1.15},{autoAlpha:1,scale:1,duration:0.3,ease:"power4.out"},${fx(g.t)});`);
    const o = nxt ? fx(nxt.t - 0.05) : fx(sc.end + 0.5);
    if (nxt) tl.push(`tl.to("#${gid}",{autoAlpha:0,duration:0.15},${o});`, `tl.set("#${gid}",{autoAlpha:0},${fx(o + 0.15)});`);
  });
  if (sc.stat) {
    const sid = `${id}s`;
    els.push(`<div id="${sid}" class="ct stat" style="top:640px"><b>${esc(sc.stat.value)}</b><span>${esc(sc.stat.text)}</span></div>`);
    tl.push(`tl.fromTo("#${sid}",{autoAlpha:0,scale:1.25},{autoAlpha:1,scale:1,duration:0.3,ease:"power4.out"},${fx(sc.stat.t)});`);
  }
});

// ------------------------------------------------------------ captions: key words highlighted
const KEY = new Set((SB.keys || []).map(norm));
const caps = [];
{
  const lines = []; let line = [];
  for (const w of VO.words) { line.push(w); if (line.length === (FAST ? 2 : 3) || /[.?!:,]$/.test(w.text)) { lines.push(line); line = []; } }
  if (line.length) lines.push(line);
  lines.forEach((ln, i) => {
    const st = fx(VO_START + ln[0].start - 0.06), nx = lines[i + 1];
    const en = fx(nx ? VO_START + nx[0].start - 0.06 : VO_START + ln.at(-1).end + 0.3);
    const txt = ln.map((w) => KEY.has(norm(w.text)) ? `<mark>${esc(w.text)}</mark>` : esc(w.text)).join(" ");
    caps.push(`<div class="cap clip" id="cap-${i}" data-start="${st}" data-duration="${fx(en - st)}" data-track-index="7">${txt}</div>`);
    tl.push(`tl.fromTo("#cap-${i}",{y:14,opacity:0},{y:0,opacity:1,duration:0.16,ease:"power2.out"},${st});`);
  });
}

const page = `<!doctype html>
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${W}, height=${H}" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
body{font-family:Inter,system-ui,sans-serif;color:${DARK};-webkit-font-smoothing:antialiased}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
#scene{position:absolute;inset:0}
.scn{position:absolute;inset:0;overflow:hidden;opacity:0;visibility:hidden}
.img{position:absolute;inset:0;background-size:cover;background-position:center;transform-origin:50% 50%;will-change:transform}
.img.ph{display:flex;align-items:center;justify-content:center;text-align:center;background:linear-gradient(160deg,#EFE7CF,#D9CFAE);font-size:64px;font-weight:800;color:#6b6244;padding:120px}
.img.ph small{display:block;margin-top:24px;font-size:34px;font-weight:600;line-height:1.3}
.scn::after{content:"";position:absolute;left:0;right:0;bottom:0;height:620px;background:linear-gradient(to top,rgba(10,12,16,0.72),rgba(10,12,16,0));pointer-events:none}
.lab{position:absolute;left:48px;top:92px;font-family:ui-monospace,Menlo,monospace;font-size:26px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#2a2a2a;z-index:3}
.badge{position:absolute;right:48px;top:80px;font-family:ui-monospace,Menlo,monospace;font-size:24px;font-weight:700;letter-spacing:0.12em;padding:12px 22px;border-radius:999px;background:rgba(40,40,40,0.78);color:#f4f4f4;z-index:3}
.brand{position:absolute;right:48px;top:158px;font-size:26px;font-weight:800;padding:8px 18px;border-radius:999px;background:${ACCENT};color:${DARK};z-index:3}
.brand:empty{display:none}
.ct{position:absolute;opacity:0;visibility:hidden;z-index:4;will-change:transform}
.callout{transform:translateX(-50%);white-space:nowrap;background:#fff;color:${DARK};font-size:40px;font-weight:800;padding:16px 30px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,0.22)}
.big{left:60px;right:60px;top:230px;text-align:center;font-size:96px;line-height:1.08;font-weight:900;letter-spacing:-0.03em;color:#1c2038}
.big b{color:#14808c}
.stat{left:60px;right:60px;text-align:center}
.stat b{display:block;font-size:300px;line-height:1;font-weight:900;letter-spacing:-0.05em;color:${ACCENT};text-shadow:0 6px 30px rgba(0,0,0,0.35)}
.stat span{display:block;margin-top:8px;font-size:64px;font-weight:800;color:#fff;text-shadow:0 4px 18px rgba(0,0,0,0.5)}
.cap{position:absolute;left:50px;right:50px;top:1500px;text-align:center;font-size:62px;font-weight:800;line-height:1.18;color:#fff;text-shadow:0 3px 14px rgba(0,0,0,0.6);opacity:0;z-index:6}
.cap mark{background:${ACCENT};color:${DARK};padding:0 10px;border-radius:12px;text-shadow:none}
</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="${TOTAL}" data-width="${W}" data-height="${H}">
  <div id="scene" class="clip" data-start="0" data-duration="${TOTAL}" data-track-index="3">
    ${els.join("\n    ")}
  </div>
  ${caps.join("\n  ")}
  <audio id="vo" src="assets/vo/${VO.wav}" data-start="${VO_START}" data-duration="${fx(VO.duration)}" data-track-index="30" data-volume="1"></audio>
</div>
<script>
  window.__timelines = window.__timelines || {};
  gsap.set(".scn,.ct",{autoAlpha:0});
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  ${tl.join("\n  ")}
  window.__timelines["main"] = tl;
</script>
</body></html>
`;
fs.writeFileSync(path.join(proj, "index.html"), page);
console.log(`wrote index.html  total=${TOTAL}s  scenes=${S.length}  tweens=${tl.length}  captions=${caps.length}`);
