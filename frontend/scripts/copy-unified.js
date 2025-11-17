const fs = require('fs');
const path = require('path');

// Paths
const unifiedSrc = path.resolve(__dirname, '..', 'src', 'styles', 'unified.css');
const backendStatic = path.resolve(__dirname, '..', '..', 'backend', 'static');
const backendAssets = path.join(backendStatic, 'assets');
const csDest = path.join(backendAssets, 'cs.css');
const viteDist = path.resolve(__dirname, '..', 'dist'); // Vite default output

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

function copyUnified() {
  if (!fs.existsSync(unifiedSrc)) {
    console.warn('Source unified.css not found at', unifiedSrc, '- skipping unified copy');
    return;
  }
  ensureDir(backendAssets);
  copyFileSync(unifiedSrc, csDest);
  console.log('Copied', unifiedSrc, '->', csDest);

  // Append small admin-login styles so the server-side admin_login.html uses shared styles
  try {
    const adminCss = `
/* Admin login page overrides (appended by postbuild) */
.card{width:900px;max-width:96%;margin:24px auto;border-radius:10px}
.admin-left{background:linear-gradient(135deg,#f7f8fb,#fff);padding:40px}
.admin-right{padding:40px}
.admin-input{width:100%;padding:12px 14px;margin:10px 0;border:1px solid #e6e9ef;border-radius:28px}
.admin-btn{display:inline-block;background:var(--brand);color:#fff;padding:12px 30px;border-radius:28px;border:0;cursor:pointer}
`;
    fs.appendFileSync(csDest, adminCss, 'utf8');
    console.log('Appended admin CSS to', csDest);
  } catch (err) {
    console.warn('Could not append admin css to', csDest, err.message);
  }
}

function patchIndexFile(indexPath) {
  try {
    if (!fs.existsSync(indexPath)) {
      // not an error — build may not create this path
      return;
    }
    let html = fs.readFileSync(indexPath, 'utf8');
    const linkRegex = /<link\s+rel=["']stylesheet["'][^>]*href=["']([^"']*assets\/[^"']*\.css)["'][^>]*>\s*/i;
    const csLink = '  <link rel="stylesheet" crossorigin href="/static/assets/cs.css">\n';
    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, csLink);
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Patched', indexPath, 'to reference cs.css');
      return;
    }
    const headClose = /<\/head>/i;
    if (headClose.test(html)) {
      html = html.replace(headClose, csLink + '</head>');
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Inserted cs.css link into', indexPath);
      return;
    }
  } catch (err) {
    console.error('Failed to patch index file:', indexPath, err);
  }
}

function main() {
  // 1) Copy the build output (dist) into backend/static
  copyBuildToBackend();

  // If index.html references /static/assets/..., but we flattened assets into backend/static,
  // update index.html to point to the flattened paths (/static/<file>) so files resolve.
  try {
    const indexPath = path.join(backendStatic, 'index.html');
    if (fs.existsSync(indexPath)) {
      let html = fs.readFileSync(indexPath, 'utf8');
      // If references like /static/assets/<name> exist, rewrite to /static/<name>
      html = html.replace(/href=\"\/static\/assets\/(.*?)\"/g, 'href="/static/$1"');
      html = html.replace(/src=\"\/static\/assets\/(.*?)\"/g, 'src="/static/$1"');
      // Fallback simple replace for any remaining occurrences (covers single quotes or other patterns)
      html = html.replace(/\/static\/assets\//g, '/static/');

      // Robust fix: if the HTML still references asset filenames that don't exist, detect first built JS/CSS
      // in backendStatic root and point the index to those files. This handles various Vite output modes.
      const files = fs.readdirSync(backendStatic);
      const jsFile = files.find(f => /\.js$/.test(f) && !f.includes('service-worker'));
      const cssFile = files.find(f => /\.css$/.test(f) && f !== 'assets' && f !== 'cs.css');
      if (jsFile) {
        html = html.replace(/<script[^>]*src=["'].*?["'][^>]*><\/script>/i, `<script type="module" crossorigin src="/static/${jsFile}"></script>`);
      }
      if (cssFile) {
        // keep cs.css reference if present; but update main stylesheet link
        html = html.replace(/<link[^>]*rel=["']stylesheet["'][^>]*href=["'].*?\.css["'][^>]*>/i, `<link rel="stylesheet" crossorigin href="/static/${cssFile}">`);
      }
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Patched', indexPath, 'asset paths to flattened /static/');
    }
  } catch (err) {
    console.warn('Failed to patch index.html paths:', err.message);
  }

  // 2) Copy the unified.css into backend/static/assets/cs.css
  copyUnified();

  // 3) Patch potential index files to ensure cs.css is referenced
  const backendIndex = path.resolve(backendStatic, 'index.html');
  const backendStaticFilesIndex = path.resolve(path.dirname(backendStatic), 'staticfiles', 'index.html');
  patchIndexFile(backendIndex);
  patchIndexFile(backendStaticFilesIndex);

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
