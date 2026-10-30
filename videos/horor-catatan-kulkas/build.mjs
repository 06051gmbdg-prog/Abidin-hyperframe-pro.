// build.mjs — horror mini-story in flat vector style (9:16). Everything is drawn in code (SVG), no AI images.
// storyboard.json lists scenes {at, type, time, overlays[]}; every cue is "the next time this word is spoken after the previous cue".
// Scene types: kitchen | note | tap | tv | fridge | end.   Overlays: rule | shadow | red.
import fs from "node:fs";
import path from "node:path";

export const PLAN = [
  { beat: "S1 dapur + catatan",  from: "start", to: "next", hero: "slam", zones: "hud top-left | art 500-1250 | caption 1560" },
  { beat: "S2 catatan 3 aturan", from: "next",  to: "next", hero: "slam", zones: "hud | paper 420-1300 | caption 1560" },
  { beat: "S3 keran menyala",    from: "next",  to: "next", hero: "slam", zones: "hud | rule card 300 | kitchen 560-1150 | caption 1560" },
  { beat: "S4 televisi",         from: "next",  to: "next", hero: "slam", zones: "hud | rule card 300 | tv 560-1060 | caption 1560" },
  { beat: "S5 ketukan kulkas",   from: "next",  to: "next", hero: "slam", zones: "hud | rule card 300 | fridge 420-1180 | caption 1560" },
  { beat: "S6 suara perempuan",  from: "next",  to: "next", hero: "slam", zones: "hud | fridge + waves | caption 1560" },
  { beat: "S7 baris basah",      from: "next",  to: "next", hero: "slam", zones: "hud | paper 420-1400 | caption 1560" },
  { beat: "END malam 2",         from: "next",  to: "end",  hero: "slam", zones: "title 700 | button 1100" },
];

const proj = process.argv[2] || ".";
const SB = JSON.parse(fs.readFileSync(path.join(proj, "storyboard.json"), "utf8"));
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];
const W = 1080, H = 1920;
const BG = "#070A16", INK = "#EEF1FA", GREEN = "#9BFF4A", RED = "#E5484D";
const fx = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const VO_START = 0.35;
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

function TA(word, after) {
  for (const w of VO.words) {
    const t = fx(VO_START + w.start);
    if (t > after + 0.01 && norm(w.text).startsWith(norm(word))) return t;
  }
  throw new Error(`cue "${word}" after ${after}s not found — the script changed; fix storyboard.json`);
}
const VO_END = fx(VO_START + VO.duration);
const TOTAL = fx(VO_END + 1.5);
if (TOTAL > 179) throw new Error(`total ${TOTAL}s exceeds the 2:59 ceiling — cut words, never speed up the voice`);

// ------------------------------------------------------------ cues
let cur = -1;
const S = SB.scenes.map((sc) => {
  const start = sc.at == null ? 0 : (cur = TA(sc.at, cur));
  if (sc.at == null) cur = 0;
  const ov = (sc.overlays || []).map((o) => ({ ...o, t: (cur = TA(o.at, cur)) }));
  return { ...sc, start, ov };
});
S.forEach((sc, i) => { sc.end = i + 1 < S.length ? S[i + 1].start : TOTAL; });

// ------------------------------------------------------------ art (flat vectors, 1080x1920)
const fig = (x, y, s = 1.6) => `<g stroke="${INK}" stroke-width="${7}" stroke-linecap="round" fill="none"><circle cx="${x}" cy="${y - 150 * s}" r="${24 * s}" fill="${INK}"/><path d="M${x} ${y - 126 * s}V${y - 60 * s}M${x} ${y - 112 * s}L${x - 30 * s} ${y - 78 * s}M${x} ${y - 112 * s}L${x + 30 * s} ${y - 78 * s}M${x} ${y - 60 * s}L${x - 22 * s} ${y}M${x} ${y - 60 * s}L${x + 22 * s} ${y}"/></g>`;
const room = (floorY = 1160) => `<rect width="1080" height="1920" fill="url(#bg)"/><rect y="${floorY}" width="1080" height="${1920 - floorY}" fill="#0d1230"/><rect y="${floorY}" width="1080" height="6" fill="#1a2250"/>`;
const windowMoon = `<rect x="80" y="520" width="300" height="300" rx="10" fill="#0e1736" stroke="#243069" stroke-width="8"/><path d="M230 520V820M80 670H380" stroke="#243069" stroke-width="6"/><circle cx="300" cy="590" r="34" fill="#dfe6ff"/>`;
const fridgeBody = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#7d89ab"/><rect x="${x}" y="${y + h * 0.3}" width="${w}" height="8" fill="#5a6585"/><rect x="${x + 28}" y="${y + 50}" width="12" height="${h * 0.16}" rx="6" fill="#d7ddf0"/><rect x="${x + 28}" y="${y + h * 0.4}" width="12" height="${h * 0.22}" rx="6" fill="#d7ddf0"/>`;
const noteMini = (x, y) => `<g transform="rotate(-4 ${x + 55} ${y + 70})"><rect x="${x}" y="${y}" width="110" height="140" fill="#f3efe0"/><path d="M${x + 14} ${y + 28}H${x + 96}M${x + 14} ${y + 56}H${x + 90}M${x + 14} ${y + 84}H${x + 96}M${x + 14} ${y + 112}H${x + 70}" stroke="#8c8672" stroke-width="5"/></g>`;
const counter = `<rect x="40" y="930" width="520" height="230" fill="#1b2347"/><rect x="40" y="920" width="520" height="16" fill="#2a3566"/><path d="M200 920V840q0-60 60-60h50" fill="none" stroke="#c9d1ea" stroke-width="16" stroke-linecap="round"/>`;

function art(sc, id) {
  const d = `<defs><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#101a3d"/><stop offset="1" stop-color="#070a16"/></linearGradient><radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#cfe6ff" stop-opacity="0.55"/><stop offset="1" stop-color="#cfe6ff" stop-opacity="0"/></radialGradient></defs>`;
  switch (sc.type) {
    case "kitchen": case "tap":
      return d + room() + windowMoon + counter + fridgeBody(640, 560, 260, 600) + noteMini(705, 880) + fig(440, 1160, 1.6) +
        (sc.type === "tap" ? `<rect id="${id}w" x="302" y="796" width="14" height="0" fill="#9fc6ff"/><ellipse id="${id}p" cx="309" cy="925" rx="30" ry="8" fill="#9fc6ff" opacity="0"/>` : "");
    case "tv":
      return d + room(1180) + `<ellipse cx="540" cy="1230" rx="520" ry="150" id="${id}g" fill="url(#glow)" opacity="0.8"/>` +
        `<rect x="200" y="560" width="680" height="500" rx="24" fill="#10152e" stroke="#2b3566" stroke-width="10"/><rect id="${id}s" x="232" y="592" width="616" height="436" rx="10" fill="#bcd9ff"/>` +
        `<g id="${id}h" opacity="0"><ellipse cx="540" cy="770" rx="44" ry="50" fill="#070a16"/><path d="M470 1028 L486 820 Q540 790 594 820 L610 1028Z" fill="#070a16"/></g>` +
        `<rect x="470" y="1060" width="140" height="50" fill="#1a2250"/><rect x="150" y="1290" width="780" height="320" rx="90" fill="#141a38"/><circle cx="540" cy="1250" r="54" fill="#0a0d1f" stroke="${INK}" stroke-width="7"/><path d="M450 1330Q540 1280 630 1330" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round"/>`;
    case "fridge": {
      let waves = "";
      for (let k = 0; k < 3; k++) waves += `<circle id="${id}r${k}" cx="540" cy="860" r="120" fill="none" stroke="${sc.waves ? RED : INK}" stroke-width="6" opacity="0"/>`;
      return d + room(1200) + `<g id="${id}f">${fridgeBody(340, 540, 400, 660)}<rect id="${id}l" x="344" y="1190" width="392" height="10" fill="#ffcf5a" opacity="0.9"/></g>` + waves;
    }
    case "note": {
      const full = sc.mode === "full";
      const L = (y, t, extra = "") => `<text x="190" y="${y}" font-family="Georgia,serif" font-style="italic" font-size="50" fill="#2c2a22" ${extra}>${t}</text>`;
      const bar = (y, w) => `<rect x="190" y="${y - 24}" width="${w}" height="14" rx="7" fill="#b9b39b"/>`;
      return d + room() + `<g transform="rotate(-2 540 900)"><rect x="140" y="420" width="800" height="1000" fill="#efe8d2"/><rect x="140" y="420" width="800" height="14" fill="#d9d1b6"/>` +
        `<text x="190" y="540" font-family="Georgia,serif" font-weight="700" font-size="64" fill="#2c2a22">ATURAN</text>` +
        (full ? L(680, "1. Keran menyala sendiri?") + L(740, "&#160;&#160;&#160;Jangan dimatikan.") + L(880, "2. TV menyala?") + L(940, "&#160;&#160;&#160;Jangan tatap layarnya.") + L(1080, "3. Jangan buka kulkas") + L(1140, "&#160;&#160;&#160;sebelum matahari terbit.") +
          `<text id="${id}x" x="190" y="1290" font-family="Georgia,serif" font-style="italic" font-weight="700" font-size="54" fill="#b3172b" opacity="0">Ia tahu kamu sudah membaca.</text>`
          : bar(680, 560) + bar(740, 440) + bar(880, 520) + bar(940, 400) + bar(1080, 580) + bar(1140, 360)) + `</g>`;
    }
    case "end":
      return d + room(1200) + fridgeBody(340, 540, 400, 660).replace(/fill="#7d89ab"/, 'fill="#1a2040"') + `<rect width="1080" height="1920" fill="#070a16" opacity="0.72"/>`;
  }
  return d + room();
}

// ------------------------------------------------------------ elements + tweens
const tl = [], els = [];
S.forEach((sc, i) => {
  const id = `sc${i}`, dur = fx(sc.end - sc.start + 0.3), first = i === 0;
  const at = first ? 0 : fx(Math.max(0, sc.start - 0.1));
  const hud = `<div class="hud"><div class="ser"><i></i>${esc(SB.series || "")}</div><div class="clock">${esc(sc.time || "")}</div><div class="place">${esc(SB.place || "")}</div></div>`;
  let endUi = "";
  if (sc.type === "end") endUi = `<div class="endt"><div class="from">DARI: CATATAN DI KULKAS</div><div class="n2" id="${id}n">MALAM 2</div><div class="tm">03:33</div><div class="btn" id="${id}b">IKUTI UNTUK LANJUTANNYA</div></div>`;
  els.push(`<div id="${id}" class="scn footage"><svg id="${id}v" viewBox="0 0 1080 1920" width="1080" height="1920">${art(sc, id)}</svg>${hud}${endUi}</div>`);
  tl.push(`tl.fromTo("#${id}",{autoAlpha:0},{autoAlpha:1,duration:${first ? 0.01 : 0.12},ease:"none"},${at});`);
  tl.push(`tl.fromTo("#${id}v",{scale:1.0,transformOrigin:"50% 50%"},{scale:${i % 2 ? 1.14 : 1.2},duration:${dur},ease:"none"},${at});`);
  if (!first) tl.push(`tl.fromTo("#${id}",{scale:1.05},{scale:1,duration:0.2,ease:"power3.out"},${at});`);
  if (i + 1 < S.length) {
    const out = fx(Math.max(sc.end, at + 0.9));
    tl.push(`tl.to("#${id}",{autoAlpha:0,duration:0.12,ease:"none"},${out});`, `tl.set("#${id}",{autoAlpha:0},${fx(out + 0.12)});`);
  }
  const t0 = fx(Math.max(sc.start, at)), t1 = fx(Math.max(sc.end, t0 + 1));
  if (sc.type === "tap") {   // water runs, then stops near the end of the scene
    tl.push(`tl.fromTo("#${id}w",{attr:{height:0}},{attr:{height:130},duration:0.4,ease:"none"},${fx(t0 + 0.3)});`);
    for (let t = t0 + 0.8; t < t1 - 0.4; t += 0.5) tl.push(`tl.set("#${id}p",{opacity:${(0.35 + rnd() * 0.5).toFixed(2)}},${fx(t)});`);
    tl.push(`tl.to("#${id}w",{attr:{height:0},duration:0.3},${fx(Math.max(t1 - 0.6, t0 + 1))});`, `tl.set("#${id}p",{opacity:0},${fx(Math.max(t1 - 0.5, t0 + 1.1))});`);
  }
  if (sc.type === "tv") {    // flicker with a fixed seed
    for (let t = t0 + 0.1; t < t1; t += 0.11) tl.push(`tl.set("#${id}s",{opacity:${(0.55 + rnd() * 0.45).toFixed(2)}},${fx(t)});`);
  }
  if (sc.type === "fridge") {
    const shake = sc.waves ? 0.3 : 1;
    for (let t = t0 + 0.2; t < t1 - 0.2; t += 0.07) tl.push(`tl.set("#${id}f",{x:${((rnd() - 0.5) * 14 * shake).toFixed(1)}},${fx(t)});`);
    tl.push(`tl.set("#${id}f",{x:0},${fx(t1 - 0.15)});`);
    for (let k = 0; k < 3; k++) for (let t = t0 + k * 0.5; t < t1 - 0.6; t += 1.5) tl.push(`tl.fromTo("#${id}r${k}",{attr:{r:110},opacity:0.9},{attr:{r:${sc.waves ? 420 : 300}},opacity:0,duration:1.2,ease:"power1.out"},${fx(t)});`);
  }
  if (sc.type === "end") {
    tl.push(`tl.fromTo("#${id}n",{autoAlpha:0,scale:1.3},{autoAlpha:1,scale:1,duration:0.3,ease:"power4.out"},${fx(t0 + 0.2)});`);
    tl.push(`tl.fromTo("#${id}b",{autoAlpha:0,y:20},{autoAlpha:1,y:0,duration:0.3},${fx(TA("ikuti", sc.start - 0.01))});`);
  }
  sc.ov.forEach((o, k) => {
    const oid = `${id}o${k}`;
    if (o.kind === "rule") {
      els.push(`<div id="${oid}" class="ct rule"><span>ATURAN ${o.n}</span><b>${o.text}</b></div>`);
      tl.push(`tl.fromTo("#${oid}",{autoAlpha:0,y:-20},{autoAlpha:1,y:0,duration:0.25},${fx(o.t)});`);
      const out = fx(Math.max(sc.end - 0.15, o.t + 1.2));
      tl.push(`tl.to("#${oid}",{autoAlpha:0,duration:0.15},${out});`, `tl.set("#${oid}",{autoAlpha:0},${fx(out + 0.15)});`);
    } else if (o.kind === "shadow") {
      tl.push(`tl.fromTo("#${id}h",{opacity:0},{opacity:1,duration:0.4},${fx(o.t)});`);
    } else if (o.kind === "red") {
      tl.push(`tl.fromTo("#${id}x",{opacity:0},{opacity:1,duration:0.5},${fx(o.t)});`);
    }
  });
});

// ------------------------------------------------------------ captions (2-3 words, key words in green)
const KEY = new Set((SB.keys || []).map(norm));
const caps = [];
{
  const lines = []; let line = [];
  for (const w of VO.words) { line.push(w); if (line.length === 3 || /[.?!:,]$/.test(w.text)) { lines.push(line); line = []; } }
  if (line.length) lines.push(line);
  lines.forEach((ln, i) => {
    const st = fx(VO_START + ln[0].start - 0.06), nx = lines[i + 1];
    const en = fx(nx ? VO_START + nx[0].start - 0.06 : VO_START + ln.at(-1).end + 0.3);
    const txt = ln.map((w) => KEY.has(norm(w.text)) ? `<mark>${esc(w.text)}</mark>` : esc(w.text)).join(" ");
    caps.push(`<div class="cap clip" id="cap-${i}" data-start="${st}" data-duration="${fx(en - st)}" data-track-index="7">${txt}</div>`);
    tl.push(`tl.fromTo("#cap-${i}",{y:12,opacity:0},{y:0,opacity:1,duration:0.14,ease:"power2.out"},${st});`);
  });
}

const page = `<!doctype html>
<html lang="id"><head><meta charset="UTF-8" /><meta name="viewport" content="width=${W}, height=${H}" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
body{font-family:Inter,system-ui,sans-serif;color:${INK};-webkit-font-smoothing:antialiased}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${BG}}
#scene{position:absolute;inset:0}
.scn{position:absolute;inset:0;overflow:hidden;opacity:0;visibility:hidden}
.scn svg{position:absolute;left:0;top:0}
.hud{position:absolute;left:56px;top:64px;z-index:3;font-family:ui-monospace,Menlo,monospace}
.hud .ser{font-size:24px;font-weight:700;letter-spacing:0.12em;color:#ff5a5f;display:flex;align-items:center;gap:12px}
.hud .ser i{width:14px;height:14px;border-radius:50%;background:#ff3b3b;display:inline-block}
.hud .clock{font-size:92px;font-weight:700;line-height:1.05;color:#fff;letter-spacing:0.02em}
.hud .place{font-size:22px;letter-spacing:0.14em;color:#8e98bf}
.ct{position:absolute;opacity:0;visibility:hidden;z-index:4}
.rule{left:60px;right:60px;top:320px;text-align:center}
.rule span{display:inline-block;background:#d12a2f;color:#fff;font-size:26px;font-weight:800;letter-spacing:0.14em;padding:6px 18px;border-radius:8px;margin-bottom:16px}
.rule b{display:block;font-size:58px;line-height:1.1;font-weight:800;letter-spacing:-0.01em;text-shadow:0 4px 18px rgba(0,0,0,0.6)}
.endt{position:absolute;inset:0;z-index:5;text-align:center;padding-top:560px}
.endt .from{font-family:ui-monospace,Menlo,monospace;font-size:34px;letter-spacing:0.16em;color:#c9d0ea}
.endt .n2{margin-top:30px;font-size:190px;font-weight:900;line-height:1;color:${RED};letter-spacing:-0.03em;opacity:0}
.endt .tm{margin-top:10px;font-family:ui-monospace,Menlo,monospace;font-size:52px;color:#fff}
.endt .btn{display:inline-block;margin-top:90px;font-size:38px;font-weight:800;padding:20px 40px;border:3px solid #fff;border-radius:999px;opacity:0}
.cap{position:absolute;left:40px;right:40px;top:1560px;text-align:center;font-size:72px;font-weight:900;line-height:1.1;letter-spacing:-0.01em;text-transform:uppercase;color:#fff;text-shadow:0 4px 16px rgba(0,0,0,0.8);opacity:0;z-index:6}
.cap mark{background:none;color:${GREEN}}
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
