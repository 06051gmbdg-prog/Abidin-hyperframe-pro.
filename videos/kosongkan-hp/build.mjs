// build.mjs — "Cara mengosongkan ruang di HP" (9:16). Same shape as example/build.mjs:
// PLAN -> cue table chained to voice-over WORDS -> beats -> one HTML page with a paused GSAP timeline.
// New in this one: menu-path cards (ANDROID / IPHONE), a storage bar that fills and empties, and captions
// whose KEY words are highlighted. Every cue is "the next time this word is spoken after the previous cue".
import fs from "node:fs";
import path from "node:path";

export const PLAN = [
  { beat: "H1 penuh",        from: "start",   to: "langkah", hero: "slam", zones: "type 440-700 | bar 780 | notes 960-1360" },
  { beat: "S1 cek",          from: "langkah", to: "langkah", hero: "slam", zones: "title 400 | head 720 | paths 880-1300" },
  { beat: "S2 whatsapp",     from: "langkah", to: "langkah", hero: "slam", zones: "title 400 | head 720 | path 880 | notes 1130-1420" },
  { beat: "S3 cache",        from: "langkah", to: "langkah", hero: "slam", zones: "title 400 | head 720 | paths 880-1330 | note 1400" },
  { beat: "S4 cadangkan",    from: "langkah", to: "langkah", hero: "slam", zones: "title 400 | head 720 | note 900 | path 1060" },
  { beat: "S5 jarang dipakai", from: "langkah", to: "bonus", hero: "slam", zones: "title 400 | head 720 | path 880 | note 1130" },
  { beat: "B6 bonus Files",  from: "bonus",   to: "penting", hero: "slam", zones: "type 440 | notes 760-1250" },
  { beat: "B7 beda merek",   from: "penting", to: "malam",   hero: "slam", zones: "type 440 | note 800-1200" },
  { beat: "P8 produk",      from: "kalau",   to: "malam",   hero: "slam", zones: "type 440 | head 700 | card 900 | notes 1150-1350 | link 1450" },
  { beat: "END aksi",        from: "malam",   to: "end",     hero: "bar",  zones: "type 440 | bar 900 | note 1100-1300" },
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
c.notif = TA("notifikasi", -1); c.penuh = TA("penuh", c.notif); c.memotret = TA("memotret", c.penuh);
c.tenang = TA("tenang", c.memotret); c.kenangan = TA("kenangan", c.tenang); c.lima = TA("lima", c.kenangan); c.menit = TA("menit", c.lima);
c.l1 = TA("langkah", c.menit); c.pelaku = TA("pelakunya", c.l1); c.and1 = TA("android", c.pelaku); c.iph1 = TA("iphone", c.and1); c.daftar = TA("daftar", c.iph1);
c.l2 = TA("langkah", c.daftar); c.wa = TA("whatsapp", c.l2); c.kelola = TA("kelola", c.wa); c.diteruskan = TA("diteruskan", c.kelola); c.lima2 = TA("lima", c.diteruskan); c.sampah = TA("sampah", c.lima2);
c.l3 = TA("langkah", c.sampah); c.cache = TA("cache", c.l3); c.and3 = TA("android", c.cache); c.iph3 = TA("iphone", c.and3); c.offload = TA("offload", c.iph3); c.menyimpan = TA("menyimpan", c.offload);
c.l4 = TA("langkah", c.menyimpan); c.cadang = TA("cadangkan", c.l4); c.pastikan = TA("pastikan", c.cadang); c.google = TA("google", c.pastikan);
c.l5 = TA("langkah", c.google); c.jarang = TA("jarang", c.l5); c.play = TA("play", c.jarang); c.urutkan = TA("urutkan", c.play);
c.bonus = TA("bonus", c.urutkan); c.files = TA("files", c.bonus); c.bersihkan = TA("bersihkan", c.files); c.sampah2 = TA("sampah", c.bersihkan); c.duplikat = TA("duplikat", c.sampah2);
c.penting = TA("penting", c.duplikat); c.beda = TA("berbeda", c.penting); c.cari = TA("cari", c.beda); c.cari2 = TA("pencarian", c.cari);
c.kalau = TA("kalau", c.cari2); c.flash = TA("flashdisk", c.kalau); c.lexar = TA("lexar", c.flash); c.colok = TA("colokan", c.lexar);
c.kapasitas = TA("kapasitasnya", c.colok); c.baca = TA("baca", c.kapasitas); c.ringkas = TA("ringkas", c.baca); c.ket = TA("keterangan", c.ringkas);
c.malam = TA("malam", c.ket); c.buka = TA("buka", c.malam); c.besar = TA("paling", c.buka);

// ------------------------------------------------------------ scenes
// kind: slam (big type) | note (medium) | path (menu card with OS badge) | bar (storage bar)
const P = (id, t, y, os, text) => ({ id, t, y, kind: "path", os, html: text });
const scenes = [
  { end: c.l1, items: [
    { id: "h1a", t: 0.12, y: 430, size: 118, html: "PENYIMPANAN<br>PENUH." },
    { id: "h1bar", t: c.penuh, y: 800, kind: "bar", fill: RED, to: 1 },
    { id: "h1b", t: c.memotret, y: 960, size: 64, color: MUTED, html: "Tepat saat mau memotret." },
    { id: "h1c", t: c.tenang, y: 1120, size: 120, color: ACCENT, html: "TENANG." },
    { id: "h1d", t: c.kenangan, y: 1290, size: 68, html: "Foto kenangan aman." },
    { id: "h1e", t: c.lima, y: 1395, size: 68, color: MUTED, html: "Lima langkah singkat." },
  ]},
  { end: c.l2, items: [
    { id: "s1a", t: c.l1, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>SATU" },
    { id: "s1b", t: c.pelaku, y: 720, size: 84, html: "Cari tahu pelakunya." },
    P("s1c", c.and1, 880, "ANDROID", "Pengaturan › Penyimpanan"),
    P("s1d", c.iph1, 1080, "IPHONE", "Pengaturan › Umum › Penyimpanan iPhone"),
    { id: "s1e", t: c.daftar, y: 1330, size: 60, color: MUTED, html: "Daftar aplikasi + ukurannya" },
  ]},
  { end: c.l3, items: [
    { id: "s2a", t: c.l2, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>DUA" },
    { id: "s2b", t: c.wa, y: 720, size: 84, html: "Bersihkan <b>WhatsApp</b>." },
    P("s2c", c.kelola, 880, "WHATSAPP", "Pengaturan › Penyimpanan dan data › Kelola penyimpanan"),
    { id: "s2d", t: c.diteruskan, y: 1180, size: 60, color: MUTED, html: "Media sering diteruskan" },
    { id: "s2e", t: c.lima2, y: 1280, size: 60, color: MUTED, html: "File lebih dari 5 MB" },
    { id: "s2f", t: c.sampah, y: 1400, size: 70, color: ACCENT, html: "Pilih, lalu ketuk tempat sampah." },
  ]},
  { end: c.l4, items: [
    { id: "s3a", t: c.l3, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>TIGA" },
    { id: "s3b", t: c.cache, y: 720, size: 84, html: "Kosongkan <b>cache</b>." },
    P("s3c", c.and3, 880, "ANDROID", "Pengaturan › Aplikasi › (pilih aplikasi) › Penyimpanan › Hapus cache"),
    P("s3d", c.iph3, 1130, "IPHONE", "Tidak ada tombol cache"),
    { id: "s3e", t: c.offload, y: 1320, size: 84, color: ACCENT, html: "Offload App" },
    { id: "s3f", t: c.menyimpan, y: 1440, size: 58, color: MUTED, html: "Aplikasi dibuang, data tetap ada." },
  ]},
  { end: c.l5, items: [
    { id: "s4a", t: c.l4, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>EMPAT" },
    { id: "s4b", t: c.cadang, y: 720, size: 84, html: "<b>Cadangkan</b> dulu." },
    { id: "s4c", t: c.pastikan, y: 900, size: 66, color: MUTED, html: "Pastikan sudah tercadang,<br>baru hapus dari ponsel." },
    P("s4d", c.google, 1130, "GOOGLE FOTO", "Foto profil › Kosongkan ruang di perangkat"),
  ]},
  { end: c.bonus, items: [
    { id: "s5a", t: c.l5, y: 400, size: 130, color: ACCENT, html: "LANGKAH<br>LIMA" },
    { id: "s5b", t: c.jarang, y: 720, size: 72, html: "Hapus yang <b>jarang</b> dipakai." },
    P("s5c", c.play, 930, "PLAY STORE", "Foto profil › Kelola aplikasi dan perangkat"),
    { id: "s5d", t: c.urutkan, y: 1190, size: 62, color: MUTED, html: "Urutkan: paling jarang digunakan" },
  ]},
  { end: c.penting, items: [
    { id: "b6a", t: c.bonus, y: 440, size: 120, color: ACCENT, html: "BONUS<br>ANDROID" },
    { id: "b6b", t: c.files, y: 800, size: 76, html: "Aplikasi <b>Files</b> dari Google" },
    P("b6c", c.bersihkan, 960, "FILES", "Tab Bersihkan"),
    { id: "b6d", t: c.sampah2, y: 1190, size: 62, color: MUTED, html: "File sampah" },
    { id: "b6e", t: c.duplikat, y: 1290, size: 62, color: MUTED, html: "File duplikat" },
  ]},
  { end: c.kalau, items: [
    { id: "b7a", t: c.penting, y: 440, size: 100, html: "Nama menu<br>bisa <b>berbeda</b>." },
    { id: "b7b", t: c.beda, y: 860, size: 66, color: MUTED, html: "Tiap merek ponsel." },
    P("b7c", c.cari, 1040, "CARA CEPAT", "Cari “Penyimpanan” atau “Storage” di kolom pencarian Pengaturan"),
  ]},
  { end: c.malam, items: [
    { id: "p8a", t: c.kalau, y: 440, size: 100, color: ACCENT, html: "KALAU MASIH<br>PENUH" },
    { id: "p8b", t: c.flash, y: 730, size: 66, html: "Pindahkan file besar<br>ke <b>flashdisk</b>." },
    P("p8c", c.lexar, 930, "PRODUK", "Lexar JumpDrive Dual Drive D400"),
    { id: "p8d", t: c.colok, y: 1180, size: 58, color: INK, html: "USB-C (Android) + USB-A (laptop)" },
    { id: "p8e", t: c.kapasitas, y: 1270, size: 58, color: MUTED, html: "32 GB sampai 256 GB" },
    { id: "p8f", t: c.baca, y: 1360, size: 58, color: MUTED, html: "Baca hingga 130 MB/detik" },
    { id: "p8g", t: c.ket, y: 1470, size: 58, color: ACCENT, html: "Link di keterangan video" },
  ]},
  { end: null, items: [
    { id: "e1", t: c.malam, y: 440, size: 130, color: ACCENT, html: "MALAM INI." },
    { id: "e2", t: c.buka, y: 700, size: 76, html: "Buka pengaturan<br>penyimpanan." },
    { id: "e3bar", t: c.buka, y: 1030, kind: "bar", fill: RED, to: 1, shrink: { at: c.besar, to: 0.3 } },
    { id: "e4", t: c.besar, y: 1230, size: 84, color: ACCENT, html: "Hapus satu yang terbesar." },
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
const KEY = new Set(["penyimpanan", "penuh", "whatsapp", "cache", "offload", "android", "iphone", "cadangkan", "tercadang", "jarang", "bersihkan", "sampah", "duplikat", "tenang", "flashdisk", "lexar", "malam", "paling", "satu", "dua", "tiga", "empat", "lima", "langkah"]);
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
