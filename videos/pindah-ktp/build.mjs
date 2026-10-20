// build.mjs — "Cara pindah domisili KTP" (9:16). Same shape as example/build.mjs:
// PLAN -> cue table chained to voice-over WORDS -> beats -> one HTML page with a paused GSAP timeline.
// No timing below is a stopwatch number: every cue is "the next time this word is spoken after the previous cue".
import fs from "node:fs";
import path from "node:path";

export const PLAN = [
  { beat: "H1 situasi",    from: "start",   to: "kabar",   hero: "slam", zones: "type full 480-1100" },
  { beat: "B2 gratis",     from: "kabar",   to: "langkah", hero: "slam", zones: "type full 520-1100" },
  { beat: "S1 dokumen",    from: "langkah", to: "langkah", hero: "slam", zones: "title 430 | list 640-1180" },
  { beat: "S2 surat pindah", from: "langkah", to: "langkah", hero: "slam", zones: "title 430 | list 640-1180" },
  { beat: "S3 kota baru",  from: "langkah", to: "langkah", hero: "slam", zones: "title 430 | list 640-1180" },
  { beat: "S4 KK + KTP baru", from: "langkah", to: "sebelum", hero: "slam", zones: "title 430 | list 640-1180" },
  { beat: "B6 periksa",    from: "sebelum", to: "sudah",   hero: "slam", zones: "type full 500-1100" },
  { beat: "B7 belum sempat", from: "sudah", to: "kalau",   hero: "slam", zones: "type full 500-1100" },
  { beat: "B8 anak",       from: "kalau",   to: "satu",    hero: "slam", zones: "type full 500-1100" },
  { beat: "B9 daerah",     from: "satu",    to: "malam",   hero: "slam", zones: "type full 500-1100" },
  { beat: "END aksi",      from: "malam",   to: "end",     hero: "line", zones: "type full 600-1150" },
];

const proj = process.argv[2] || ".";
const meta = JSON.parse(fs.readFileSync(path.join(proj, "assets/vo/audio_meta.json"), "utf8"));
const VO = meta.scenes[0];
const W = 1080, H = 1920;
const BG = "#0B0D12", INK = "#F4F5F7", MUTED = "#8A8F99", ACCENT = "#F5C242";
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
c.ktp = TA("ktp", -1); c.lama = TA("lama", c.ktp); c.baru = TA("baru", c.lama);
c.rekening = TA("rekening", c.baru); c.bpjs = TA("bpjs", c.rekening); c.sekolah = TA("sekolah", c.bpjs); c.tertahan = TA("tertahan", c.sekolah);
c.kabar = TA("kabar", c.tertahan); c.gratis = TA("gratis", c.kabar); c.pengantar = TA("pengantar", c.gratis); c.empat = TA("empat", c.pengantar);
c.l1 = TA("langkah", c.empat); c.siapkan = TA("siapkan", c.l1); c.elektronik = TA("elektronik", c.siapkan); c.fotokopi = TA("fotokopi", c.elektronik); c.formulir = TA("formulir", c.fotokopi);
c.l2 = TA("langkah", c.formulir); c.dukcapil2 = TA("dukcapil", c.l2); c.keterangan = TA("keterangan", c.dukcapil2); c.atau = TA("atau", c.keterangan); c.tiket = TA("tiket", c.atau);
c.l3 = TA("langkah", c.tiket); c.dukcapil3 = TA("dukcapil", c.l3); c.menumpang = TA("menumpang", c.dukcapil3); c.pernyataan = TA("pernyataan", c.menumpang);
c.l4 = TA("langkah", c.pernyataan); c.terima = TA("terima", c.l4); c.ktp4 = TA("ktp", c.terima); c.dibatalkan = TA("dibatalkan", c.ktp4);
c.sebelum = TA("sebelum", c.dibatalkan); c.periksa = TA("periksa", c.sebelum); c.nama = TA("nama", c.periksa); c.nomor = TA("nomor", c.nama); c.alamat = TA("alamat", c.nomor); c.huruf = TA("huruf", c.alamat);
c.sudah = TA("sudah", c.huruf); c.belum = TA("belum", c.sudah); c.tenang = TA("tenang", c.belum); c.menghubungi = TA("menghubungi", c.tenang);
c.kalau = TA("kalau", c.menghubungi); c.anak = TA("anak", c.kalau); c.tujuh = TA("tujuh", c.anak); c.kepala = TA("kepala", c.tujuh);
c.satu = TA("satu", c.kepala); c.aturan = TA("aturan", c.satu); c.online = TA("online", c.aturan); c.cek = TA("cek", c.online);
c.malam = TA("malam", c.cek); c.cari = TA("cari", c.malam); c.online2 = TA("online", c.cari);

// ------------------------------------------------------------ scenes: each element enters on a spoken word
// kind: slam (big) | note (medium). The first element of a scene enters just BEFORE its cue and the previous
// scene leaves just before that, so there is never an empty frame.
const S = (id, y, size, color = INK) => ({ id, y, size, color });
const scenes = [
  { end: c.kabar, items: [
    { id: "h1a", t: 0.12, y: 470, size: 112, html: "KTP ANDA<br>MASIH ALAMAT<br>LAMA." },
    { id: "h1b", t: c.baru, y: 900, size: 72, color: MUTED, html: "Padahal Anda sudah<br>tinggal di kota baru." },
    { id: "h1c", t: c.rekening, y: 1090, size: 64, html: "Rekening." },
    { id: "h1d", t: c.bpjs, y: 1180, size: 64, html: "BPJS." },
    { id: "h1e", t: c.sekolah, y: 1270, size: 64, html: "Sekolah anak." },
    { id: "h1f", t: c.tertahan, y: 1390, size: 110, color: ACCENT, html: "TERTAHAN." },
  ]},
  { end: c.l1, items: [
    { id: "b2a", t: c.kabar, y: 540, size: 150, color: ACCENT, html: "GRATIS." },
    { id: "b2b", t: c.pengantar, y: 800, size: 74, html: "Tanpa surat pengantar<br>RT / RW." },
    { id: "b2c", t: c.empat, y: 1130, size: 120, html: "EMPAT<br>LANGKAH." },
  ]},
  { end: c.l2, items: [
    { id: "s1a", t: c.l1, y: 430, size: 130, color: ACCENT, html: "LANGKAH<br>SATU" },
    { id: "s1b", t: c.siapkan, y: 760, size: 84, html: "Siapkan dokumen." },
    { id: "s1c", t: c.elektronik, y: 930, size: 66, color: MUTED, html: "KTP elektronik asli" },
    { id: "s1d", t: c.fotokopi, y: 1040, size: 66, color: MUTED, html: "Fotokopi Kartu Keluarga" },
    { id: "s1e", t: c.formulir, y: 1150, size: 66, color: MUTED, html: "Formulir F-1.03" },
  ]},
  { end: c.l3, items: [
    { id: "s2a", t: c.l2, y: 430, size: 130, color: ACCENT, html: "LANGKAH<br>DUA" },
    { id: "s2b", t: c.dukcapil2, y: 760, size: 84, html: "Dukcapil kota <b>LAMA</b>." },
    { id: "s2c", t: c.keterangan, y: 930, size: 66, color: MUTED, html: "Surat Keterangan Pindah" },
    { id: "s2d", t: c.atau, y: 1040, size: 66, color: MUTED, html: "SKPWNI" },
    { id: "s2e", t: c.tiket, y: 1170, size: 84, color: ACCENT, html: "Tiket pindah Anda." },
  ]},
  { end: c.l4, items: [
    { id: "s3a", t: c.l3, y: 430, size: 130, color: ACCENT, html: "LANGKAH<br>TIGA" },
    { id: "s3b", t: c.dukcapil3, y: 760, size: 84, html: "Dukcapil kota <b>BARU</b>." },
    { id: "s3c", t: c.menumpang, y: 930, size: 66, color: MUTED, html: "Menumpang / mengontrak?" },
    { id: "s3d", t: c.pernyataan, y: 1050, size: 66, color: MUTED, html: "Surat pernyataan<br>dari pemilik rumah" },
  ]},
  { end: c.sebelum, items: [
    { id: "s4a", t: c.l4, y: 430, size: 130, color: ACCENT, html: "LANGKAH<br>EMPAT" },
    { id: "s4b", t: c.terima, y: 760, size: 84, html: "Terima yang baru." },
    { id: "s4c", t: c.ktp4, y: 930, size: 66, color: MUTED, html: "Kartu Keluarga baru<br>KTP elektronik baru" },
    { id: "s4d", t: c.dibatalkan, y: 1160, size: 84, color: ACCENT, html: "KTP lama dibatalkan." },
  ]},
  { end: c.sudah, items: [
    { id: "b6a", t: c.sebelum, y: 480, size: 130, color: ACCENT, html: "PERIKSA<br>KARTU BARU." },
    { id: "b6b", t: c.nama, y: 860, size: 72, html: "Nama." },
    { id: "b6c", t: c.nomor, y: 970, size: 72, html: "Nomor induk." },
    { id: "b6d", t: c.alamat, y: 1080, size: 72, html: "Alamat." },
    { id: "b6e", t: c.huruf, y: 1230, size: 80, color: ACCENT, html: "Satu huruf salah<br>bisa merepotkan." },
  ]},
  { end: c.kalau, items: [
    { id: "b7a", t: c.sudah, y: 480, size: 96, html: "Belum sempat<br>urus surat pindah?" },
    { id: "b7b", t: c.tenang, y: 840, size: 130, color: ACCENT, html: "TENANG." },
    { id: "b7c", t: c.menghubungi, y: 1060, size: 70, color: MUTED, html: "Dukcapil kota baru<br>menghubungi<br>Dukcapil kota lama." },
  ]},
  { end: c.satu, items: [
    { id: "b8a", t: c.kalau, y: 480, size: 110, html: "ANAK DI BAWAH<br>17 TAHUN" },
    { id: "b8b", t: c.kepala, y: 940, size: 66, color: ACCENT, html: "Siapkan keluarga dewasa<br>sebagai kepala keluarga." },
  ]},
  { end: c.malam, items: [
    { id: "b9a", t: c.satu, y: 480, size: 96, html: "Aturan tiap<br>daerah beda." },
    { id: "b9b", t: c.online, y: 860, size: 120, color: ACCENT, html: "CEK SITUS<br>RESMI DULU." },
    { id: "b9c", t: c.cek, y: 1180, size: 58, color: MUTED, html: "Supaya tidak antre sia-sia." },
  ]},
  { end: null, items: [
    { id: "e1", t: c.malam, y: 560, size: 130, color: ACCENT, html: "MALAM INI." },
    { id: "e2", t: c.cari, y: 840, size: 84, html: "Cari situs Dukcapil<br>kota Anda." },
    { id: "e3", t: c.online2, y: 1130, size: 84, color: ACCENT, html: "Bisa online?" },
  ]},
];

// ------------------------------------------------------------ tweens
const tl = [], els = [];
scenes.forEach((sc, si) => {
  const prevEnd = si === 0 ? null : scenes[si - 1].end;
  sc.items.forEach((it, ii) => {
    const at = ii === 0 && si > 0 ? fx(Math.max(0, prevEnd - 0.12)) : fx(it.t);
    const big = it.size >= 110;
    if (big) tl.push(`tl.fromTo("#${it.id}",{autoAlpha:0,scale:1.25},{autoAlpha:1,scale:1,duration:0.3,ease:"power4.out"},${at});`);
    else tl.push(`tl.fromTo("#${it.id}",{autoAlpha:0,y:26},{autoAlpha:1,y:0,duration:0.3,ease:"power3.out"},${at});`);
    const left = it.x === "r" ? 560 : it.x === "r2" ? 560 : 70;
    els.push(`<div id="${it.id}" class="ct" style="top:${it.y}px;font-size:${it.size}px;color:${it.color || INK};${it.x ? `left:${left}px;right:70px;text-align:left;${it.x === "r2" ? "top:" + (it.y + 90) + "px;" : ""}` : ""}">${it.html}</div>`);
    if (sc.end != null) {
      const out = fx(sc.end - 0.42);
      tl.push(`tl.to("#${it.id}",{autoAlpha:0,y:-30,duration:0.22,ease:"power2.in"},${out});`);
      tl.push(`tl.set("#${it.id}",{autoAlpha:0},${fx(out + 0.22)});`);
    }
  });
});

// ------------------------------------------------------------ captions (from the spoken words)
const caps = [];
{
  const lines = []; let line = [];
  for (const w of VO.words) { line.push(w); if (line.length === 4 || /[.?!]$/.test(w.text)) { lines.push(line); line = []; } }
  if (line.length) lines.push(line);
  lines.forEach((ln, i) => {
    const st = fx(VO_START + ln[0].start - 0.06), nx = lines[i + 1];
    const en = fx(nx ? VO_START + nx[0].start - 0.06 : VO_START + ln.at(-1).end + 0.3);
    caps.push(`<div class="cap clip" id="cap-${i}" data-start="${st}" data-duration="${fx(en - st)}" data-track-index="7">${ln.map((w) => esc(w.text)).join(" ")}</div>`);
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
.cap{position:absolute;left:60px;right:60px;top:1620px;text-align:center;font-size:52px;font-weight:700;line-height:1.2;color:rgba(244,245,247,0.82);opacity:0}
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
