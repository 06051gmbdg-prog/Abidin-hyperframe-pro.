// build.mjs — "Otak manusia vs AI" (9:16), code-drawn motion graphics (SVG + HTML), cream "explainer" look.
// storyboard.json: scenes {at,type,label,badge,overlays[]}; every cue is "the next time this word is spoken after the previous cue".
// Types: brain | brainstats | network | versus | compare | equation | cta.   Overlays: stat | win | final.
import fs from "node:fs";
import path from "node:path";

export const PLAN = [
  { beat: "S1 hook otak",         from: "start", to: "next", hero: "slam", zones: "label top | brain 560-1100 | caption 1560" },
  { beat: "S2 otak + angka",      from: "next",  to: "next", hero: "slam", zones: "brain 380-830 | stats 1130-1400 | caption 1560" },
  { beat: "S3 jaringan digital",  from: "next",  to: "next", hero: "slam", zones: "brain to network 560-1100 | caption 1560" },
  { beat: "S4 manusia vs AI",     from: "next",  to: "next", hero: "slam", zones: "brain + robot 600-1200 | caption 1560" },
  { beat: "S5 kecepatan",         from: "next",  to: "next", hero: "slam", zones: "title 330 | panels 620-1220 | caption 1560" },
  { beat: "S6 stamina",           from: "next",  to: "next", hero: "slam", zones: "title 330 | panels 620-1220 | caption 1560" },
  { beat: "S7 belajar",           from: "next",  to: "next", hero: "slam", zones: "title 330 | panels 620-1220 | caption 1560" },
  { beat: "S8 empati",            from: "next",  to: "next", hero: "slam", zones: "title 330 | panels 620-1220 | caption 1560" },
  { beat: "S9 kesimpulan",        from: "next",  to: "next", hero: "slam", zones: "text 340 | icons 760-1160 | final 1230" },
  { beat: "END aksi",             from: "next",  to: "end",  hero: "slam", zones: "type 640-1100" },
];

const proj = process.argv[2] || ".";
const SB = JSON.parse(fs.readFileSync(path.join(proj, "storyboard.json"), "utf8"));
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];
const W = 1080, H = 1920;
const CREAM = "#EBE3CB", DARK = "#1B1D24", YEL = "#F5C242", BLUE = "#2F6BFF", GRN = "#1FA35B";
const fx = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const VO_START = 0.35;

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

let cur = -1;
const S = SB.scenes.map((sc) => {
  const start = sc.at == null ? 0 : (cur = TA(sc.at, cur));
  if (sc.at == null) cur = 0;
  const ov = (sc.overlays || []).map((o) => ({ ...o, t: (cur = TA(o.at, cur)) }));
  return { ...sc, start, ov };
});
S.forEach((sc, i) => { sc.end = i + 1 < S.length ? S[i + 1].start : TOTAL; });

// ------------------------------------------------------------ art (viewBox 400x320 brain/network, 400x420 robot)
const brainG = (id) => `<g id="${id}"><path d="M200 30C120 10 40 50 40 130C10 160 20 230 70 250C80 300 150 320 200 290C250 320 320 300 330 250C380 230 390 160 360 130C360 50 280 10 200 30Z" fill="#F2A9BC" stroke="#C4607E" stroke-width="8" stroke-linejoin="round"/><path d="M200 34V288M110 90C140 110 150 140 120 170M290 90C260 110 250 140 280 170M90 200C130 190 150 210 140 245M310 200C270 190 250 210 260 245" fill="none" stroke="#C4607E" stroke-width="7" stroke-linecap="round"/></g>`;
const L = [[60, [90, 160, 230]], [150, [50, 120, 190, 260]], [250, [50, 120, 190, 260]], [340, [110, 200]]];
const netG = (id) => {
  let lines = "", dots = "";
  for (let l = 0; l < L.length - 1; l++) for (const y1 of L[l][1]) for (const y2 of L[l + 1][1]) lines += `<line x1="${L[l][0]}" y1="${y1}" x2="${L[l + 1][0]}" y2="${y2}"/>`;
  for (const [x, ys] of L) for (const y of ys) dots += `<circle cx="${x}" cy="${y}" r="17"/>`;
  return `<g id="${id}"><g stroke="#7FA6FF" stroke-width="3" opacity="0.8">${lines}</g><g fill="${BLUE}" stroke="#fff" stroke-width="4">${dots}</g></g>`;
};
const robotG = (id) => `<g id="${id}"><path d="M200 12V52" stroke="#6D7BA3" stroke-width="8"/><circle cx="200" cy="12" r="13" fill="#E5484D"/><rect x="80" y="50" width="240" height="170" rx="38" fill="#B8C4DF" stroke="#6D7BA3" stroke-width="8"/><circle cx="150" cy="128" r="28" fill="#fff"/><circle cx="250" cy="128" r="28" fill="#fff"/><circle cx="154" cy="130" r="13" fill="${BLUE}"/><circle cx="254" cy="130" r="13" fill="${BLUE}"/><rect x="160" y="176" width="80" height="14" rx="7" fill="#6D7BA3"/><rect x="100" y="240" width="200" height="150" rx="30" fill="#B8C4DF" stroke="#6D7BA3" stroke-width="8"/><circle cx="200" cy="315" r="26" fill="${BLUE}"/><rect x="40" y="255" width="44" height="115" rx="22" fill="#B8C4DF" stroke="#6D7BA3" stroke-width="6"/><rect x="316" y="255" width="44" height="115" rx="22" fill="#B8C4DF" stroke="#6D7BA3" stroke-width="6"/></g>`;
const svg = (inner, vb = "0 0 1080 1920") => `<svg viewBox="${vb}" width="${vb.split(" ")[2]}" height="${vb.split(" ")[3]}">${inner}</svg>`;
const at = (x, y, s, g) => `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
const bgGrid = `<rect width="1080" height="1920" fill="${CREAM}"/><g stroke="#DAD1B3" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<line x1="${i * 80}" y1="0" x2="${i * 80}" y2="1920"/>`).join("")}${Array.from({ length: 25 }, (_, i) => `<line x1="0" y1="${i * 80}" x2="1080" y2="${i * 80}"/>`).join("")}</g>`;

function art(sc, id) {
  switch (sc.type) {
    case "brain": return svg(bgGrid + at(140, 640, 2, brainG(id + "b")));
    case "brainstats": return svg(bgGrid + at(220, 360, 1.55, brainG(id + "b")));
    case "network": return svg(bgGrid + at(140, 540, 2, brainG(id + "b") + netG(id + "n")));
    case "versus": return svg(bgGrid + at(20, 640, 1.05, brainG(id + "b")) + at(580, 590, 1.2, robotG(id + "r")) +
      `<circle cx="540" cy="900" r="62" fill="${DARK}"/><text x="540" y="923" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="60" fill="#fff">VS</text>` +
      `<text x="220" y="1040" text-anchor="middle" font-family="ui-monospace,monospace" font-weight="700" font-size="40" fill="${DARK}">MANUSIA</text><text x="780" y="1150" text-anchor="middle" font-family="ui-monospace,monospace" font-weight="700" font-size="40" fill="${DARK}">AI</text>`);
    case "compare": return svg(bgGrid);
    case "equation": return svg(bgGrid + at(70, 800, 0.8, brainG(id + "b")) + at(680, 770, 0.8, robotG(id + "r")) +
      `<text x="540" y="990" text-anchor="middle" font-family="Inter,sans-serif" font-weight="900" font-size="150" fill="${DARK}">+</text>`);
    case "cta": return svg(bgGrid + at(150, 860, 1.9, netG(id + "n")));
  }
  return svg(bgGrid);
}

// ------------------------------------------------------------ elements + tweens
const tl = [], els = [];
S.forEach((sc, i) => {
  const id = `sc${i}`, dur = fx(sc.end - sc.start + 0.3), first = i === 0;
  const at0 = first ? 0 : fx(Math.max(0, sc.start - 0.1));
  const top = `<div class="lab">${esc(sc.label || "")}</div><div class="badge">${esc(sc.badge || "")}</div>`;
  let body = "";
  if (sc.type === "compare") {
    const panel = (side, name, txt, icon) => `<div id="${id}${side}" class="panel"><div class="pn">${name}</div><div class="ic">${icon}</div><div class="pt">${esc(txt)}</div><div id="${id}${side}w" class="win">UNGGUL</div></div>`;
    const miniBrain = svg(brainG(""), "0 0 400 320").replace('width="400" height="320"', 'width="260" height="208"');
    const miniRobot = svg(robotG(""), "0 0 400 420").replace('width="400" height="420"', 'width="200" height="210"');
    body = `<div class="ttl"><span>${esc(sc.num)}</span><b>${esc(sc.title)}</b></div><div class="panels">${panel("L", "MANUSIA", sc.L, miniBrain)}${panel("R", "AI", sc.R, miniRobot)}</div>`;
  } else if (sc.head) {
    body = `<div class="hd">${sc.head}</div>`;
  } else if (sc.type === "equation") {
    body = `<div class="eq">AI TIDAK<br>MENGGANTIKAN<br>SEMUA MANUSIA</div><div id="${id}f" class="fin">Manusia yang memakai AI<br><b>bisa unggul</b></div>`;
  } else if (sc.type === "cta") {
    body = `<div class="cta"><b>MULAI HARI INI</b><span>Coba satu alat AI<br>untuk pekerjaan Anda</span></div>`;
  }
  els.push(`<div id="${id}" class="scn footage">${art(sc, id)}${top}${body}</div>`);
  tl.push(`tl.fromTo("#${id}",{autoAlpha:0},{autoAlpha:1,duration:${first ? 0.01 : 0.12},ease:"none"},${at0});`);
  tl.push(`tl.fromTo("#${id}",{scale:${first ? 1 : 1.05}},{scale:1,duration:0.25,ease:"power3.out"},${at0});`);
  if (i + 1 < S.length) {
    const out = fx(Math.max(sc.end, at0 + 0.9));
    tl.push(`tl.to("#${id}",{autoAlpha:0,duration:0.12,ease:"none"},${out});`, `tl.set("#${id}",{autoAlpha:0},${fx(out + 0.12)});`);
  }
  const t0 = fx(Math.max(sc.start, at0));
  if (sc.type === "brain" || sc.type === "brainstats") tl.push(`tl.fromTo("#${id}b",{scale:1,svgOrigin:"200 160"},{scale:1.06,svgOrigin:"200 160",duration:${dur},ease:"sine.inOut"},${t0});`);
  if (sc.type === "network") {   // the brain turns into a digital network, then the net pulses
    tl.push(`tl.set("#${id}n",{opacity:0},0);`);
    tl.push(`tl.to("#${id}b",{opacity:0.12,duration:1.0,ease:"power1.inOut"},${fx(t0 + 0.5)});`);
    tl.push(`tl.to("#${id}n",{opacity:1,duration:1.0,ease:"power1.inOut"},${fx(t0 + 0.5)});`);
    for (let t = t0 + 2; t < sc.end - 0.5; t += 0.9) tl.push(`tl.fromTo("#${id}n",{scale:1,svgOrigin:"200 160"},{scale:1.04,svgOrigin:"200 160",duration:0.45,yoyo:true,repeat:1,ease:"sine.inOut"},${fx(t)});`);
  }
  if (sc.type === "versus") {
    tl.push(`tl.fromTo("#${id}b",{x:-80,opacity:0},{x:0,opacity:1,duration:0.4},${t0});`);
    tl.push(`tl.fromTo("#${id}r",{x:80,opacity:0},{x:0,opacity:1,duration:0.4},${fx(t0 + 0.2)});`);
  }
  if (sc.type === "equation") {
    tl.push(`tl.fromTo("#${id}b",{y:30,opacity:0},{y:0,opacity:1,duration:0.4},${fx(t0 + 0.2)});`, `tl.fromTo("#${id}r",{y:30,opacity:0},{y:0,opacity:1,duration:0.4},${fx(t0 + 0.4)});`);
    tl.push(`tl.set("#${id}f",{opacity:0},0);`);
  }
  if (sc.type === "cta") tl.push(`tl.fromTo("#${id}n",{scale:0.9,svgOrigin:"200 160"},{scale:1.08,svgOrigin:"200 160",duration:${dur},ease:"sine.inOut"},${t0});`);
  if (sc.type === "compare") {
    tl.push(`tl.fromTo("#${id}L",{x:-60,opacity:0},{x:0,opacity:1,duration:0.35},${fx(t0 + 0.4)});`, `tl.fromTo("#${id}R",{x:60,opacity:0},{x:0,opacity:1,duration:0.35},${fx(t0 + 0.6)});`);
    tl.push(`tl.set("#${id}Lw",{opacity:0},0);`, `tl.set("#${id}Rw",{opacity:0},0);`);
  }
  sc.ov.forEach((o, k) => {
    const oid = `${id}o${k}`;
    if (o.kind === "stat") {
      els.push(`<div id="${oid}" class="ct stat" style="top:${o.y}px"><b>${esc(o.big)}</b><span>${esc(o.small)}</span></div>`);
      tl.push(`tl.fromTo("#${oid}",{autoAlpha:0,scale:1.25},{autoAlpha:1,scale:1,duration:0.3,ease:"power4.out"},${fx(o.t)});`);
      const out = fx(Math.max(sc.end - 0.05, o.t + 1.2));
      tl.push(`tl.to("#${oid}",{autoAlpha:0,duration:0.12},${out});`, `tl.set("#${oid}",{autoAlpha:0},${fx(out + 0.12)});`);
    } else if (o.kind === "win") {
      tl.push(`tl.fromTo("#${id}${o.side}w",{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.3,ease:"back.out(2)"},${fx(o.t)});`);
      tl.push(`tl.to("#${id}${o.side}",{borderColor:"${GRN}",duration:0.2},${fx(o.t)});`);
    } else if (o.kind === "final") {
      tl.push(`tl.fromTo("#${id}f",{opacity:0,y:20},{opacity:1,y:0,duration:0.4},${fx(Math.max(o.t - 0.6, t0 + 0.5))});`);
    }
  });
});

// ------------------------------------------------------------ captions
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
html,body{width:${W}px;height:${H}px;overflow:hidden;background:${CREAM}}
body{font-family:Inter,system-ui,sans-serif;color:${DARK};-webkit-font-smoothing:antialiased}
#root{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:${CREAM}}
#scene{position:absolute;inset:0}
.scn{position:absolute;inset:0;overflow:hidden;opacity:0;visibility:hidden}
.scn svg{position:absolute;left:0;top:0}
.panel svg{position:static}
.scn::after{content:"";position:absolute;left:0;right:0;bottom:0;height:560px;background:linear-gradient(to top,rgba(10,12,16,0.78),rgba(10,12,16,0));pointer-events:none}
.lab{position:absolute;left:48px;top:92px;font-family:ui-monospace,Menlo,monospace;font-size:28px;font-weight:700;letter-spacing:0.08em;color:#2a2a2a;z-index:3}
.badge{position:absolute;right:48px;top:80px;font-family:ui-monospace,Menlo,monospace;font-size:24px;font-weight:700;letter-spacing:0.12em;padding:12px 22px;border-radius:999px;background:rgba(40,40,40,0.82);color:#f4f4f4;z-index:3}
.ct{position:absolute;opacity:0;visibility:hidden;z-index:4}
.stat{left:60px;right:60px;text-align:center}
.stat b{display:block;font-size:110px;line-height:1;font-weight:900;letter-spacing:-0.03em;color:${DARK}}
.stat span{display:inline-block;margin-top:6px;font-size:40px;font-weight:800;background:${YEL};padding:4px 22px;border-radius:12px}
.ttl{position:absolute;left:60px;right:60px;top:310px;z-index:3;text-align:center}
.ttl span{display:inline-block;background:${DARK};color:#fff;font-family:ui-monospace,Menlo,monospace;font-size:30px;font-weight:700;letter-spacing:0.14em;padding:6px 22px;border-radius:10px}
.ttl b{display:block;margin-top:14px;font-size:104px;line-height:1.02;font-weight:900;letter-spacing:-0.03em}
.panels{position:absolute;left:44px;right:44px;top:660px;display:flex;gap:28px;z-index:3}
.panel{position:relative;flex:1;background:#fff;border:8px solid #cfc7a8;border-radius:34px;padding:26px 20px 28px;text-align:center;min-height:570px;opacity:0}
.panel .pn{font-family:ui-monospace,Menlo,monospace;font-size:34px;font-weight:700;letter-spacing:0.1em}
.panel .ic{height:230px;display:flex;align-items:center;justify-content:center;margin:12px 0}
.panel .pt{font-size:42px;line-height:1.18;font-weight:800}
.win{position:absolute;left:50%;top:-34px;transform:translateX(-50%);background:${GRN};color:#fff;font-size:30px;font-weight:900;letter-spacing:0.1em;padding:8px 26px;border-radius:999px;opacity:0}
.eq{position:absolute;left:50px;right:50px;top:340px;text-align:center;font-size:86px;line-height:1.08;font-weight:900;letter-spacing:-0.03em;z-index:3}
.fin{position:absolute;left:60px;right:60px;top:1290px;text-align:center;font-size:54px;line-height:1.15;font-weight:800;color:#fff;z-index:5;background:rgba(27,29,36,0.92);border-radius:28px;padding:26px 20px}
.hd{position:absolute;left:50px;right:50px;top:330px;text-align:center;font-size:92px;line-height:1.05;font-weight:900;letter-spacing:-0.03em;z-index:3}
.fin b{color:${YEL};font-size:78px}
.cta{position:absolute;left:50px;right:50px;top:420px;text-align:center;z-index:3}
.cta b{display:block;font-size:120px;line-height:1;font-weight:900;letter-spacing:-0.03em}
.cta span{display:block;margin-top:26px;font-size:56px;line-height:1.15;font-weight:800;color:#3a3a3a}
.cap{position:absolute;left:40px;right:40px;top:1580px;text-align:center;font-size:66px;font-weight:900;line-height:1.1;letter-spacing:-0.01em;color:#fff;text-shadow:0 4px 16px rgba(0,0,0,0.7);opacity:0;z-index:6}
.cap mark{background:${YEL};color:${DARK};padding:0 10px;border-radius:12px;text-shadow:none}
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
