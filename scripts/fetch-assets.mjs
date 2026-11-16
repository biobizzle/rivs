import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

// Source: Poly Haven, CC0 1.0. An explicit User-Agent and credits are required
// while using their live API. Files are resolved and self-hosted at build time.
const REQUIRED = ['sofa_03', 'modern_arm_chair_01', 'modern_coffee_table_01'];
const OPTIONAL = ['potted_plant_02'];
const ALL = [...REQUIRED, ...OPTIONAL];
const root = path.resolve('public/models');
const agent = 'RIVS-Interior-Experience/1.0 (source-credit: polyhaven.com)';
const retries = async (url, options = {}, count = 3) => {
  for (let trial = 1; trial <= count; trial++) {
    try {
      const result = await fetch(url, { ...options, headers: { 'User-Agent': agent, ...(options.headers || {}) }, signal: AbortSignal.timeout(35000) });
      if (!result.ok) throw new Error(`${result.status} ${result.statusText}: ${url}`);
      return result;
    } catch (error) {
      if (trial === count) throw error;
      await new Promise(resolve => setTimeout(resolve, 700 * trial));
    }
  }
};
const cleanName = (name) => {
  const normal = path.posix.normalize(name.replaceAll('\\', '/').replace(/^\/+/, ''));
  if (normal.startsWith('../') || path.posix.isAbsolute(normal)) throw new Error('Unsafe asset path');
  return normal;
};
async function downloadAsset(slug) {
  const folder = path.join(root, slug);
  const dest = path.join(folder, `${slug}_1k.gltf`);
  try { if ((await fs.stat(dest)).size > 200) { console.log(`[asset] cached ${slug}`); return true; } } catch {}
  const json = await (await retries(`https://api.polyhaven.com/files/${slug}`)).json();
  const base = json?.gltf?.['1k']?.gltf ?? json?.gltf?.['2k']?.gltf;
  if (!base?.url) throw new Error(`No usable glTF for ${slug}`);
  const includes = base.include ?? {};
  const manifest = [[`${slug}_1k.gltf`, base], ...Object.entries(includes)];
  await fs.mkdir(folder, { recursive: true });
  let total = 0;
  for (const [relative, meta] of manifest) {
    if (!meta?.url) throw new Error(`${slug}: missing URL for ${relative}`);
    const safe = cleanName(relative);
    const file = path.join(folder, safe);
    await fs.mkdir(path.dirname(file), { recursive: true });
    let bytes;
    try { bytes = await fs.readFile(file); } catch {}
    if (!bytes || (meta.size && bytes.length !== meta.size)) {
      bytes = Buffer.from(await (await retries(meta.url)).arrayBuffer());
      if (meta.size && bytes.length !== meta.size) throw new Error(`${slug}/${safe}: size mismatch`);
      if (meta.md5 && crypto.createHash('md5').update(bytes).digest('hex') !== meta.md5) throw new Error(`${slug}/${safe}: checksum mismatch`);
      await fs.writeFile(file, bytes);
    }
    total += bytes.length;
  }
  // Some archives use a differently named root glTF; the API's basename is the
  // canonical reference filename. Make a copy only if it differs.
  const sourceBase = new URL(base.url).pathname.split('/').pop();
  if (sourceBase && sourceBase !== `${slug}_1k.gltf`) {
    const urlName = decodeURIComponent(sourceBase);
    // The downloaded manifest's glTF may refer to dependencies relative to itself.
    // Both names live at the same directory level.
    await fs.copyFile(dest, path.join(folder, urlName));
  }
  console.log(`[asset] ${slug}: ${manifest.length} files, ${(total / 1024 / 1024).toFixed(1)} MiB`);
  return true;
}
await fs.mkdir(root, { recursive: true });
const results = {};
for (const slug of ALL) {
  try { results[slug] = await downloadAsset(slug); }
  catch (e) {
    results[slug] = false;
    console.error(`[asset] ${slug} failed: ${e.message}`);
    if (REQUIRED.includes(slug)) process.exitCode = 1;
  }
}
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify(results, null, 2));
if (process.exitCode) throw new Error('Essential 3D model assets could not be verified. Release blocked.');
console.log('Asset verification complete. Source: Poly Haven (CC0).');
