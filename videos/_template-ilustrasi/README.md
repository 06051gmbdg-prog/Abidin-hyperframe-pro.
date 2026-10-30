# Template: ilustrasi + overlay (9:16)

Gaya video penjelasan: satu ilustrasi gaya sama per adegan (zoom/geser pelan), label kecil kiri atas, lencana
"ILUSTRASI", watermark channel, balon label, angka besar, dan caption dengan kata kunci berwarna.
Semua teks dibuat dengan kode, jadi gambar AI harus **tanpa teks**.

## Alur dari HP (semua lewat GitHub)
1. Actions → **new-video** → `name` = judul-pendek → Run. Folder `videos/<name>` terbentuk.
2. Edit `videos/<name>/script.json` (naskah suara) dan `storyboard.json` (adegan). Lihat kolom di bawah.
3. Buat gambar: Actions → **fal-footage** (action `image`, `name` = `g1`, prompt = `styleLine` + isi `prompt` adegan) atau **gemini-footage**.
   Satu gambar per run (satu pembuatan berbayar per run, sengaja).
4. Actions → **import-footage**: `video` = `<name>`, `mapping` = `g1:01.jpg, g2:02.jpg, ...` (nama target = `img` di storyboard).
5. Actions → **render-video** → `video` = `<name>` → Run workflow (bukan Re-run). Hasil di branch `renders-<name>`.

Tanpa gambar pun video tetap bisa dirender: adegan memakai kotak pengganti berisi nama file dan prompt.

## storyboard.json
- `brand`: teks watermark; `badgeDefault`; `styleLine`: kalimat gaya yang ditempel di SEMUA prompt gambar (kunci konsistensi).
- `keys`: kata yang disorot kuning di caption.
- Tiap adegan: `at` (kata yang diucapkan saat adegan mulai; `null` untuk adegan pertama), `label`, `badge`, `img`, `prompt`, `zoom` [awal, akhir], `pan` [x, y] piksel,
  `callouts` [{`at` kata, `text`, `x`, `y`}], opsional `stat` {`at`, `value`, `text`}.
- Urutan `at` (adegan dan callout) harus sesuai urutan kata dalam naskah. Kata yang tidak ditemukan membuat build gagal dengan pesan jelas, tanpa memakai kuota suara.

## Aturan
- Maksimal 2:59. Jangan mempercepat suara; kurangi kata.
- Tulis angka dan sumber yang bisa diverifikasi. Jangan meniru logo, artikel, atau akun instansi nyata. Beri label "ILUSTRASI" untuk gambar AI.
- Link afiliasi hanya di caption/bio, dengan keterangan "mengandung link afiliasi".

## Tempo cepat
Tambahkan `"fast": true` di storyboard.json: pergantian adegan 0,1 detik (bukan 0,3), zoom lebih kuat dengan geser bergantian kiri/kanan, hentakan kecil setiap adegan baru, dan caption 2 kata per baris.
Untuk tempo yang benar-benar cepat, tulis lebih banyak adegan pendek (satu adegan per kalimat, sekitar 3–4 detik) dengan gambar masing-masing.
