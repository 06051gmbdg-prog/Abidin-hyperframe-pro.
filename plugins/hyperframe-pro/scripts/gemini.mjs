#!/usr/bin/env node
// gemini.mjs — generated footage through the Gemini API (alternative to fal.mjs).
//
//   node gemini.mjs probe                                                  # checks the key, costs nothing
//   node gemini.mjs image --prompt "..." --out frame.jpg [--size 1K|2K] [--aspect 9:16]
//   node gemini.mjs video --image first.jpg --prompt "..." --out clip.mp4 [--resolution 720p] [--aspect 9:16] [--trim 4]
//
// Models (Interactions API, https://ai.google.dev/gemini-api/docs/image-generation and /omni):
//   gemini-nano-banana-2.1   text -> image
//   gemini-omni-1.1-flash    image + text -> video (the API has no duration field; --trim cuts the result with ffmpeg)
//
// Credentials: GEMINI_API_KEY from the environment. Never put the key in a file. COST: every image and every
// video is a paid call, and the video model bills per second of output. Generate few, review, then commit.
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import https from "node:https";
import { execFileSync } from "node:child_process";

const BASE = (process.env.GEMINI_BASE || "https://generativelanguage.googleapis.com").replace(/\/$/, "");
const key = () => {
  const k = (process.env.GEMINI_API_KEY || "").trim();
  if (!k) throw new Error("GEMINI_API_KEY missing (environment)");
  return k;
};

/** Plain https/http request with a long timeout (Node's fetch gives up on slow video calls after ~5 min). */
function call(method, url, { body, timeoutMs = 15 * 60 * 1000, binary = false } = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === "http:" ? http : https;
    const data = body === undefined ? null : JSON.stringify(body);
    const req = lib.request(u, {
      method,
      headers: { "x-goog-api-key": key(), ...(data ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) } : {}) },
      timeout: timeoutMs,
    }, (res) => {
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const buf = Buffer.concat(chunks);
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return resolve(call(method, new URL(res.headers.location, u).href, { timeoutMs, binary }));
        resolve({ status: res.statusCode, buf, text: binary ? "" : buf.toString("utf8") });
      });
    });
    req.on("timeout", () => req.destroy(new Error(`timed out after ${Math.round(timeoutMs / 1000)}s`)));
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const brief = (t) => String(t).replace(/\s+/g, " ").slice(0, 700);

async function interact(body, label) {
  const r = await call("POST", `${BASE}/v1beta/interactions`, { body });
  if (r.status !== 200) throw new Error(`${label}: HTTP ${r.status} ${brief(r.text)}`);
  const j = JSON.parse(r.text);
  if (j.status && j.status !== "completed") throw new Error(`${label}: status ${j.status} ${brief(r.text)}`);
  return j;
}
/** pull the first content block of a given type out of the model_output steps */
function pick(j, type) {
  for (const s of j.steps || []) {
    if (s.type !== "model_output") continue;
    for (const c of s.content || []) if (c.type === type) return c;
  }
  return null;
}
function args(argv) {
  const o = {};
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith("--")) { const k = argv[i].slice(2); const v = argv[i + 1]?.startsWith("--") ? true : argv[++i]; o[k] = v ?? true; }
  return o;
}

const cmd = process.argv[2];
const a = args(process.argv.slice(3));

if (cmd === "probe") {
  const r = await call("GET", `${BASE}/v1beta/models?pageSize=1`);
  if (r.status === 200) console.log("gemini reachable, key accepted (status 200)");
  else console.log(`gemini key REJECTED or blocked (status ${r.status}): ${brief(r.text)}`);
  if (r.status !== 200) process.exit(1);
} else if (cmd === "image") {
  if (!a.prompt || !a.out) throw new Error("image needs --prompt and --out");
  const j = await interact({
    model: "gemini-nano-banana-2.1", input: a.prompt,
    response_format: { type: "image", mime_type: "image/jpeg", aspect_ratio: a.aspect || "9:16", image_size: a.size || "1K" },
  }, "nano-banana-2.1");
  const im = pick(j, "image");
  if (!im?.data) throw new Error(`no image in response: ${brief(JSON.stringify(j))}`);
  fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
  fs.writeFileSync(a.out, Buffer.from(im.data, "base64"));
  console.log(`${a.out}  ${(fs.statSync(a.out).size / 1024).toFixed(0)} KiB`);
} else if (cmd === "video") {
  if (!a.prompt || !a.out || !a.image) throw new Error("video needs --image, --prompt and --out");
  const ext = path.extname(a.image).slice(1).toLowerCase();
  const mime = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : "image/png";
  const j = await interact({
    model: "gemini-omni-1.1-flash",
    input: [{ type: "image", data: fs.readFileSync(a.image).toString("base64"), mime_type: mime }, { type: "text", text: a.prompt }],
    generation_config: { video_config: { task: "image_to_video" } },
    response_format: { type: "video", aspect_ratio: a.aspect || "9:16", resolution: a.resolution || "720p", delivery: "uri" },
  }, "omni-flash");
  const v = pick(j, "video");
  if (!v) throw new Error(`no video in response: ${brief(JSON.stringify(j))}`);
  fs.mkdirSync(path.dirname(path.resolve(a.out)), { recursive: true });
  const raw = a.trim ? a.out.replace(/\.mp4$/, "") + ".full.mp4" : a.out;
  if (v.data) fs.writeFileSync(raw, Buffer.from(v.data, "base64"));
  else if (v.uri) {
    const id = String(v.uri).match(/files\/([^:?/]+)/)?.[1];
    if (!id) throw new Error(`cannot read file id from uri`);
    for (let i = 0; i < 120; i++) {
      const st = JSON.parse((await call("GET", `${BASE}/v1beta/files/${id}`)).text || "{}");
      if (st.state === "ACTIVE") break;
      if (st.state === "FAILED") throw new Error("video file FAILED");
      await sleep(5000);
    }
    const d = await call("GET", `${BASE}/v1beta/files/${id}:download?alt=media`, { binary: true });
    if (d.status !== 200) throw new Error(`download HTTP ${d.status}`);
    fs.writeFileSync(raw, d.buf);
  } else throw new Error(`video block has neither data nor uri: ${brief(JSON.stringify(v))}`);
  if (a.trim) {
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-t", String(a.trim), "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", a.out]);
  }
  const dur = execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", a.out]).toString().trim();
  console.log(`${a.out}  ${(fs.statSync(a.out).size / 1048576).toFixed(1)} MiB  ${(+dur).toFixed(1)}s  (billed for the FULL generated clip${a.trim ? `, trimmed to ${a.trim}s` : ""})`);
} else {
  console.log(fs.readFileSync(new URL(import.meta.url), "utf8").split("\n").filter((l) => l.startsWith("//")).join("\n"));
  process.exit(1);
}
