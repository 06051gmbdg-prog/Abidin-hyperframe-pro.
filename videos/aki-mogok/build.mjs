// build.mjs — "Mobil tidak mau menyala (aki tekor) + produk afiliasi" (9:16). Same shape as example/build.mjs:
// PLAN -> cue table chained to voice-over WORDS -> beats -> one HTML page with a paused GSAP timeline.
// New in this one: menu-path cards (ANDROID / IPHONE), a storage bar that fills and empties, and captions
// whose KEY words are highlighted. Every cue is "the next time this word is spoken after the previous cue".
import fs from "node:fs";
import path from "node:path";

export const PLAN = [
  { beat: "H1 mobil mogok",  from: "start",   to: "langkah", hero: "slam", zones: "type 430-640 | notes 800-1200" },
  { beat: "S1 tanda",        from: "langkah", to: "langkah", hero: "slam", zones: "title 400 | head 720 | paths 880-1260 | note 1330" },
  { beat: "S2 starter",      from: "langkah", to: "langkah", hero: "slam", zones: "title 400 | head 720 | path 930 | note 1190" },
  { beat: "S3 beban",        from: "langkah", to: "kalau",   hero: "slam", zones: "title 400 | head 720 | path 930" },
  { beat: "S4 tenaga",       from: "kalau",   to: "usemo",   hero: "slam", zones: "type 440 | head 740 | paths 930-1150" },
  { beat: "P5 produk",       from: "usemo",   to: "baca",    hero: "slam", zones: "type 440 | note 640 | cards 800-1280" },
  { beat: "S6 panduan",      from: "baca",    to: "hari",    hero: "slam", zones: "type 440 | notes 800-1330" },
  { beat: "END aksi",        from: "hari",    to: "end",     hero: "bar",  zones: "type 440 | head 700 | bar 1030" },
];

const proj = process.argv[2] || ".";
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];
const W = 1080, H = 1920;
const BG = "#0B0D12", INK = "#F4F5F7", MUTED = "#8A8F99", ACCENT = "#F5C242", RED = "#E5484D", GREEN = "#3DDC84", PANEL = "#171B24";
const fx = (n) => +n.toFixed(3);
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const VO_START = 0.35;

function TA(word, after) {
  for (const w of VO.words) {
    const t = fx(VO_START + w.start);
    if (t > after + 0.01 && norm(w.text).startsWith(norm(word))) return t;
  }
  throw new Error(`cue "${word}" after ${after}s not found — the script changed; re-cue this beat`);
}
const VO_END = fx(VO_START + VO.duration);
const TOTAL = fx(VO_END + 1.2);
if (TOTAL > 179) throw new Error(`total ${TOTAL}s exceeds the 2:59 ceiling — cut words, never speed up the voice`);

// ------------------------------------------------------------ cue table (chained, in spoken order)
const c = {};
c.buru = TA("buru", -1); c.tenang = TA("tenang", c.buru); c.tiga = TA("tiga", c.tenang);
c.l1 = TA("langkah", c.tiga); c.tanda = TA("tandanya", c.l1); c.lambat = TA("lambat", c.tanda); c.redup = TA("redup", c.lambat); c.klakson = TA("klakson", c.redup); c.aki = TA("aki", c.klakson);
c.l2 = TA("langkah", c.aki); c.paksa = TA("paksa", c.l2); c.jeda = TA("jeda", c.paksa); c.panas = TA("panas", c.jeda);
c.l3 = TA("langkah", c.panas); c.beban = TA("beban", c.l3); c.matikan = TA("matikan", c.beban);
c.gagal = TA("gagal", c.matikan); c.tenaga = TA("tenaga", c.gagal); c.kabel = TA("kabel", c.tenaga); c.portabel = TA("portabel", c.kabel);
c.usemo = TA("usemo", c.portabel); c.empat = TA("empat", c.usemo); c.jump = TA("jump", c.empat); c.pompa = TA("pompa", c.jump); c.power = TA("power", c.pompa); c.led = TA("led", c.power);
c.buku = TA("buku", c.led); c.pastikan = TA("pastikan", c.buku); c.link = TA("link", c.pastikan);
c.hari = TA("hari", c.link); c.cek = TA("cek", c.hari);

// ------------------------------------------------------------ scenes
// kind: slam (big type) | path (card with badge) | bar
const P = (id, t, y, os, text) => ({ id, t, y, kind: "path", os, html: text });
const scenes = [
  { end: c.l1, items: [
    { id: "h1a", t: 0.12, y: 430, size: 118, html: "MOBIL TIDAK<br>MAU NYALA?" },
    { id: "h1b", t: c.buru, y: 800, size: 64, color: MUTED, html: "Padahal lagi buru-buru." },
    { id: "h1c", t: c.tenang, y: 960, size: 120, color: ACCENT, html: "TENANG." },
    { id: "h1d", t: c.tiga, y: 1130, size: 68, html: "Tiga hal dulu." },
  ]},
  { end: c.l2, items: [
    { id: "s1a", t: c.l1, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>SATU" },
    { id: "s1b", t: c.tanda, y: 720, size: 84, html: "Kenali <b>tandanya</b>." },
    P("s1c", c.lambat, 880, "TANDA", "Mesin berputar lambat"),
    P("s1d", c.redup, 1040, "TANDA", "Lampu dashboard redup"),
    P("s1e", c.klakson, 1200, "TANDA", "Klakson terdengar lemah"),
    { id: "s1f", t: c.aki, y: 1380, size: 64, color: ACCENT, html: "Aki kemungkinan tekor." },
  ]},
  { end: c.l3, items: [
    { id: "s2a", t: c.l2, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>DUA" },
    { id: "s2b", t: c.paksa, y: 720, size: 84, html: "Jangan <b>paksa</b> starter." },
    P("s2c", c.jeda, 930, "CARA", "Putar sebentar, lalu beri jeda beberapa detik"),
    { id: "s2d", t: c.panas, y: 1200, size: 62, color: MUTED, html: "Starter yang dipaksa cepat panas." },
  ]},
  { end: c.gagal, items: [
    { id: "s3a", t: c.l3, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>TIGA" },
    { id: "s3b", t: c.beban, y: 720, size: 84, html: "Kurangi <b>beban</b> listrik." },
    P("s3c", c.matikan, 930, "MATIKAN", "AC, audio, dan lampu tambahan"),
  ]},
  { end: c.usemo, items: [
    { id: "s4a", t: c.gagal, y: 440, size: 100, color: ACCENT, html: "KALAU MASIH<br>GAGAL" },
    { id: "s4b", t: c.tenaga, y: 740, size: 76, html: "Butuh <b>tenaga</b> tambahan." },
    P("s4c", c.kabel, 930, "KABEL JUMPER", "Butuh mobil lain dan orang yang mau menolong"),
    P("s4d", c.portabel, 1150, "JUMP STARTER PORTABEL", "Lebih praktis, bisa dipakai sendiri"),
  ]},
  { end: c.buku, items: [
    { id: "p5a", t: c.usemo, y: 440, size: 110, color: ACCENT, html: "USEMO CI30" },
    { id: "p5b", t: c.empat, y: 650, size: 58, color: MUTED, html: "Menurut deskripsi produk, 4 fungsi:" },
    P("p5c", c.jump, 800, "FUNGSI 1", "Jump starter aki mobil"),
    P("p5d", c.pompa, 960, "FUNGSI 2", "Pompa ban elektrik, motor dan mobil"),
    P("p5e", c.power, 1120, "FUNGSI 3", "Power bank 12.000 mAh"),
    P("p5f", c.led, 1280, "FUNGSI 4", "Lampu LED"),
  ]},
  { end: c.hari, items: [
    { id: "s6a", t: c.buku, y: 440, size: 96, html: "BACA<br><b>PANDUAN</b> DULU." },
    { id: "s6b", t: c.buku, y: 820, size: 60, color: MUTED, html: "Buku panduan mobil<br>dan petunjuk alat." },
    { id: "s6c", t: c.pastikan, y: 1040, size: 64, html: "Pastikan <b>cocok</b><br>dengan mobil Anda." },
    { id: "s6d", t: c.link, y: 1290, size: 64, color: ACCENT, html: "Link di keterangan video" },
    { id: "s6e", t: c.link, y: 1400, size: 44, color: MUTED, html: "Mengandung link afiliasi" },
  ]},
  { end: null, items: [
    { id: "e1", t: c.hari, y: 440, size: 130, color: ACCENT, html: "HARI INI." },
    { id: "e2", t: c.cek, y: 700, size: 76, html: "Cek aki dan<br>tekanan ban." },
    { id: "e3bar", t: c.cek, y: 1030, kind: "bar", fill: GREEN, to: 1 },
  ]},
];

// ------------------------------------------------------------ elements + tweens
const tl = [], els = [];
scenes.forEach((sc, si) => {
  const prevEnd = si === 0 ? null : scenes[si - 1].end;
  sc.items.forEach((it, ii) => {
    const at = ii === 0 && si > 0 ? fx(Math.max(0, prevEnd - 0.12)) : fx(it.t);
    const big = (it.size || 0) >= 110;
    if (big) tl.push(`tl.fromTo("#${it.id}",{autoAlpha:0,scale:1.25},{autoAlpha:1,scale:1,duration:0.3,ease:"power4.out"},${at});`);
    else tl.push(`tl.fromTo("#${it.id}",{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:0.3,ease:"power3.out"},${at});`);
    if (it.kind === "path") {
      els.push(`<div id="${it.id}" class="ct path" style="top:${it.y}px"><i class="os">${esc(it.os)}</i><span>${esc(it.html)}</span></div>`);
    } else if (it.kind === "bar") {
      els.push(`<div id="${it.id}" class="ct bar" style="top:${it.y}px"><div class="track"><div id="${it.id}f" class="fill" style="background:${it.fill}"></div></div></div>`);
      tl.push(`tl.fromTo("#${it.id}f",{scaleX:0},{scaleX:${it.to},duration:0.7,ease:"power2.out"},${fx(at + 0.1)});`);
      if (it.shrink) {
        tl.push(`tl.to("#${it.id}f",{scaleX:${it.shrink.to},backgroundColor:"${GREEN}",duration:0.9,ease:"power3.inOut"},${fx(it.shrink.at)});`);
      }
    } else {
      els.push(`<div id="${it.id}" class="ct" style="top:${it.y}px;font-size:${it.size}px;color:${it.color || INK}">${it.html}</div>`);
    }
    if (sc.end != null) {
      // never schedule the exit before the element has finished entering
      const out = fx(Math.max(sc.end - 0.42, at + 0.9));
      tl.push(`tl.to("#${it.id}",{autoAlpha:0,y:-30,duration:0.22,ease:"power2.in"},${out});`);
      tl.push(`tl.set("#${it.id}",{autoAlpha:0},${fx(out + 0.22)});`);
    }
  });
});

// ------------------------------------------------------------ captions: key words highlighted
const KEY = new Set(["mobil", "aki", "tekor", "starter", "jeda", "panas", "beban", "tenaga", "jump", "usemo", "pompa", "power", "led", "portabel", "link", "hari", "tenang", "langkah", "satu", "dua", "tiga", "empat"]);
const caps = [];
{
  const lines = []; let line = [];
  for (const w of VO.words) { line.push(w); if (line.length === 4 || /[.?!:]$/.test(w.text)) { lines.push(line); line = []; } }
  if (line.length) lines.push(line);
  lines.forEach((ln, i) => {
    const st = fx(VO_START + ln[0].start - 0.06), nx = lines[i + 1];
    const en = fx(nx ? VO_START + nx[0].start - 0.06 : VO_START + ln.at(-1).end + 0.3);
    const txt = ln.map((w) => KEY.has(norm(w.text)) ? `<b>${esc(w.text)}</b>` : esc(w.text)).join(" ");
    caps.push(`<div class="cap clip" id="cap-${i}" data-start="${st}" data-duration="${fx(en - st)}" data-track-index="7">${txt}</div>`);
    tl.push(`tl.fromTo("#cap-${i}",{y:16,opacity:0},{y:0,opacity:1,duration:0.18,ease:"power2.out"},${st});`);
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
.ct{position:absolute;left:70px;right:70px;text-align:center;font-weight:800;letter-spacing:-0.03em;line-height:1.05;opacity:0;visibility:hidden;will-change:transform;z-index:4}
.ct b{color:${ACCENT}}
.path{background:${PANEL};border:2px solid #272D3B;border-radius:28px;padding:22px 30px 26px;text-align:left;letter-spacing:-0.01em;font-size:44px;font-weight:700;line-height:1.2}
.path .os{display:block;font-style:normal;font-size:26px;font-weight:800;letter-spacing:0.14em;color:${ACCENT};margin-bottom:8px}
.bar .track{height:64px;border-radius:32px;background:#222836;overflow:hidden}
.bar .fill{height:100%;width:100%;transform-origin:0 50%;transform:scaleX(0);border-radius:32px}
.cap{position:absolute;left:60px;right:60px;top:1620px;text-align:center;font-size:52px;font-weight:700;line-height:1.2;color:rgba(244,245,247,0.82);opacity:0}
.cap b{color:${ACCENT};font-weight:800}
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
  gsap.set(".ct",{autoAlpha:0});
  const tl = gsap.timeline({ paused: true, defaults: { ease: "power3.out" } });
  ${tl.join("\n  ")}
  window.__timelines["main"] = tl;
</script>
</body></html>
`;
fs.writeFileSync(path.join(proj, "index.html"), page);
console.log(`wrote index.html  total=${TOTAL}s  tweens=${tl.length}  captions=${caps.length}`);
