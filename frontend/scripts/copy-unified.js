const fs = require('fs');
const path = require('path');

// Paths
const unifiedSrc = path.resolve(__dirname, '..', 'src', 'styles', 'unified.css');
const backendStatic = path.resolve(__dirname, '..', '..', 'backend', 'static');
const backendAssets = path.join(backendStatic, 'assets');
const backendStaticfiles = path.resolve(__dirname, '..', '..', 'backend', 'staticfiles');
const csDest = path.join(backendAssets, 'cs.css');
const viteDist = path.resolve(__dirname, '..', 'dist'); // Vite default output
const adminLandingCss = path.resolve(__dirname, '..', 'src', 'components', 'Login.css');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyFileSync(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDirSync(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return false;
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  entries.forEach(entry => {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  return true;
}

function clearDirSync(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      clearDirSync(full);
      fs.rmdirSync(full);
    } else {
      fs.unlinkSync(full);
    }
  }
}

function removeMatchingFiles(dir, matcher) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  entries.forEach(entry => {
    if (entry.isFile() && matcher(entry.name)) {
      try {
        fs.unlinkSync(path.join(dir, entry.name));
        console.log('Removed stale file', entry.name);
      } catch (err) {
        console.warn('Failed removing stale file', entry.name, err.message);
      }
    }
  });
}

function copyBuildToBackend() {
  if (!fs.existsSync(viteDist)) {
    console.warn('Vite build directory not found at', viteDist, '- skipping build copy');
    return;
  }
  // Clear backend/static and copy fresh
  if (fs.existsSync(backendStatic)) {
    try {
      clearDirSync(backendStatic);
    } catch (err) {
      console.warn('Failed to clear backend static dir, continuing:', err.message);
    }
  }
  ensureDir(backendStatic);
  // Special-case Vite: it places assets under `dist/static` and references them as `/static/<name>`
  // Copy files from `dist/static/*` into backendStatic root so that `/static/<file>` resolves correctly.
  const viteStatic = path.join(viteDist, 'static');
  let ok = false;
  if (fs.existsSync(viteStatic)) {
    // copy children of dist/static into backend/static
    ok = copyDirSync(viteStatic, backendStatic);
  }
  // fallback: if no dist/static, copy entire dist folder (will include index.html and possibly top-level assets)
  if (!ok) ok = copyDirSync(viteDist, backendStatic);
  if (ok) console.log('Copied build:', viteDist, '->', backendStatic);
  // Ensure top-level index.html (dist/index.html) is placed into backend/static/index.html
  try {
    const distIndex = path.join(viteDist, 'index.html');
    const targetIndex = path.join(backendStatic, 'index.html');
    if (fs.existsSync(distIndex)) {
      fs.copyFileSync(distIndex, targetIndex);
      console.log('Copied index.html ->', targetIndex);
    }
  } catch (err) {
    console.warn('Could not copy dist index.html to backend static:', err.message);
  }
}

function appendFileContents(srcPath, destPath, headerComment) {
  if (!fs.existsSync(srcPath)) {
    console.warn('CSS source not found at', srcPath, '- skipping append');
    return;
  }
  try {
    const snippet = fs.readFileSync(srcPath, 'utf8');
    let block = snippet;
    if (headerComment) {
      block = `\n/* ${headerComment} */\n${snippet}\n`;
    }
    fs.appendFileSync(destPath, block, 'utf8');
    console.log(`Appended styles from ${srcPath} -> ${destPath}`);
  } catch (err) {
    console.warn('Failed appending styles from', srcPath, 'to', destPath, err.message);
  }
}

function copyUnified() {
  if (!fs.existsSync(unifiedSrc)) {
    console.warn('Source unified.css not found at', unifiedSrc, '- skipping unified copy');
    return;
  }
  ensureDir(backendAssets);
  copyFileSync(unifiedSrc, csDest);
  console.log('Copied', unifiedSrc, '->', csDest);

  // Append SPA admin landing/login styles so Django template can share the same look
  appendFileContents(adminLandingCss, csDest, 'Admin landing & auth styles');

  // legacy overrides kept for compatibility with server-rendered template classes
  const adminCss = `
/* Legacy admin-login helpers */
.card{width:900px;max-width:96%;margin:24px auto;border-radius:10px}
.admin-left{background:linear-gradient(135deg,#f7f8fb,#fff);padding:40px}
.admin-right{padding:40px}
.admin-input{width:100%;padding:12px 14px;margin:10px 0;border:1px solid #e6e9ef;border-radius:28px}
.admin-btn{display:inline-block;background:var(--brand);color:#fff;padding:12px 30px;border-radius:28px;border:0;cursor:pointer}
`;
  fs.appendFileSync(csDest, adminCss, 'utf8');
  console.log('Appended legacy admin CSS helpers to', csDest);
}

function mergeBundledCssIntoCs() {
  if (!fs.existsSync(csDest)) {
    console.warn('cs.css not found while attempting to merge bundle CSS');
    return;
  }
  const pools = [
    { dir: backendStatic, relative: file => file },
    { dir: backendAssets, relative: file => path.join('assets', file) },
  ];
  pools.forEach(pool => {
    if (!fs.existsSync(pool.dir)) return;
    const entries = fs.readdirSync(pool.dir, { withFileTypes: true });
    entries
      .filter(entry => entry.isFile() && entry.name.endsWith('.css') && entry.name !== 'cs.css')
      .forEach(entry => {
        const filePath = path.join(pool.dir, entry.name);
        try {
          const css = fs.readFileSync(filePath, 'utf8');
          fs.appendFileSync(csDest, `\n/* Bundled from ${pool.relative(entry.name)} */\n${css}\n`, 'utf8');
          fs.unlinkSync(filePath);
          console.log('Merged bundled CSS', pool.relative(entry.name), 'into cs.css');
        } catch (err) {
          console.warn('Failed merging CSS file', pool.relative(entry.name), err.message);
        }
      });
  });
}

function syncStaticToStaticfiles() {
  if (!fs.existsSync(backendStatic)) {
    console.warn('backend/static not found, cannot sync to staticfiles');
    return;
  }
  clearDirSync(backendStaticfiles);
  copyDirSync(backendStatic, backendStaticfiles);
  console.log('Synced backend/static -> backend/staticfiles');
}

function patchIndexFile(indexPath) {
  try {
    if (!fs.existsSync(indexPath)) {
      // not an error — build may not create this path
      return;
    }
    let html = fs.readFileSync(indexPath, 'utf8');
    // Remove any existing stylesheet links (we only serve cs.css)
    html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>\s*/gi, '');
    const csLink = '  <link rel="stylesheet" crossorigin href="/static/assets/cs.css">\n';
    const headClose = /<\/head>/i;
    if (headClose.test(html)) {
      html = html.replace(headClose, csLink + '</head>');
    } else {
      html = csLink + html;
    }

    // Ensure script tag points to the actual hashed bundle under /static/assets/
    const assetFiles = fs.existsSync(backendAssets) ? fs.readdirSync(backendAssets) : [];
    const staticFiles = fs.existsSync(backendStatic) ? fs.readdirSync(backendStatic) : [];
    const jsAsset = assetFiles.find(f => f.endsWith('.js'));
    const jsRoot = staticFiles.find(f => f.endsWith('.js') && f.startsWith('index-'));
    const scriptSrc = jsAsset ? `/static/assets/${jsAsset}` : (jsRoot ? `/static/${jsRoot}` : null);
    if (scriptSrc) {
      const scriptTag = `<script type="module" crossorigin src="${scriptSrc}"></script>`;
      if (/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/i.test(html)) {
        html = html.replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/i, scriptTag);
      } else {
        html = html.replace(/<\/body>/i, `${scriptTag}\n</body>`);
      }
    }

    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Ensured cs.css + correct bundle JS in', indexPath);
  } catch (err) {
    console.error('Failed to patch index file:', indexPath, err);
  }
}

function main() {
  // 1) Copy the build output (dist) into backend/static
  removeMatchingFiles(backendStatic, name => /\.js$/.test(name) && name.startsWith('index-'));
  copyBuildToBackend();

  // 2) Copy the unified.css into backend/static/assets/cs.css
  copyUnified();
  // 2b) Merge compiled bundle CSS into cs.css so it's the single stylesheet
  mergeBundledCssIntoCs();

  // 3) Patch potential index files to ensure cs.css is referenced
  const backendIndex = path.resolve(backendStatic, 'index.html');
  const backendStaticFilesIndex = path.resolve(path.dirname(backendStatic), 'staticfiles', 'index.html');
  patchIndexFile(backendIndex);
  patchIndexFile(backendStaticFilesIndex);

  syncStaticToStaticfiles();

  // 4) Optional sanity checks
  try {
    if (fs.existsSync(csDest)) {
      const s = fs.readFileSync(csDest, 'utf8');
      if (!s || s.length < 10) {
        console.warn('cs.css written but seems very small (<10 bytes)');
      }
    }
  } catch (err) {
    console.error('Warning: unable to read written cs.css at', csDest, err);
  }
}

main();
