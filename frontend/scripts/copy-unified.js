// removeMatchingFiles: remove old hashed JS/CSS in a directory (non-recursive)
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

// Improved copyBuildToBackend: remove old assets, copy new, prefer dist/assets or dist/static
function copyBuildToBackend() {
  if (!fs.existsSync(viteDist)) {
    console.warn('Vite build directory not found at', viteDist, '- skipping build copy');
    return;
  }

  // clear only specific js files and css files (but keep cs.css)
  ensureDir(backendStatic);
  // remove old hashed index-*.js and asset js files; keep cs.css which is our canonical stylesheet
  removeMatchingFiles(backendStatic, name => /\.js$/.test(name) || (/\.css$/.test(name) && name !== 'cs.css'));
  ensureDir(backendAssets);
  removeMatchingFiles(backendAssets, name => /\.js$/.test(name) || (/\.css$/.test(name) && name !== 'cs.css'));

  // copy new build
  // prefer dist/assets (Vite default produces 'assets' inside dist)
  const viteAssets = path.join(viteDist, 'assets');
  const viteStatic = path.join(viteDist, 'static'); // sometimes used
  let copied = false;
  if (fs.existsSync(viteAssets)) {
    copyDirSync(viteAssets, backendAssets);
    copied = true;
  }
  // fallback: copy dist static children into backendStatic (for older builds)
  if (!copied && fs.existsSync(viteStatic)) {
    copyDirSync(viteStatic, backendStatic);
    copied = true;
  }
  // fallback: copy whole dist contents into backendStatic
  if (!copied) {
    copyDirSync(viteDist, backendStatic);
    copied = true;
  }

  // After copying, remove any generated CSS files that Vite created so we only serve `cs.css`.
  // This ensures the build's hashed CSS doesn't override our unified `cs.css`.
  try {
    removeMatchingFiles(backendAssets, name => (/\.css$/.test(name) && name !== 'cs.css'));
    removeMatchingFiles(backendStatic, name => (/\.css$/.test(name) && name !== 'cs.css'));
  } catch (err) {
    console.warn('Failed to clean generated CSS files:', err && err.message);
  }

  // copy dist/index.html to backend/static/index.html so Django can serve it if needed
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

  console.log('Copied build ->', backendStatic);
}

// Robust patchIndexFile: rewrite index.html to use cs.css and point to proper assets path
function patchIndexFile(indexPath) {
  try {
    if (!fs.existsSync(indexPath)) return;
    let html = fs.readFileSync(indexPath, 'utf8');

    // remove existing stylesheet links (we will reference single cs.css)
    html = html.replace(/<link[^>]+rel=["']stylesheet["'][^>]*>\s*/gi, '');

    // Insert cs.css before closing head
    const csLink = '  <link rel="stylesheet" crossorigin href="/static/assets/cs.css">\n';
    const headClose = /<\/head>/i;
    if (headClose.test(html)) {
      html = html.replace(headClose, csLink + '</head>');
    } else {
      html = csLink + html;
    }

    // find the new JS file inside backend/assets (look for any .js there)
    let scriptSrc = null;
    if (fs.existsSync(backendAssets)) {
      const assetFiles = fs.readdirSync(backendAssets);
      const jsAsset = assetFiles.find(f => f.endsWith('.js'));
      if (jsAsset) scriptSrc = `/static/assets/${jsAsset}`;
    }
    // fallback: find index-*.js in backendStatic root
    if (!scriptSrc && fs.existsSync(backendStatic)) {
      const staticFiles = fs.readdirSync(backendStatic);
      const rootJs = staticFiles.find(f => f.endsWith('.js') && f.startsWith('index-'));
      if (rootJs) scriptSrc = `/static/${rootJs}`;
    }

    if (scriptSrc) {
      const scriptTag = `<script type="module" crossorigin src="${scriptSrc}"></script>`;
      // replace existing script tag if any
      if (/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/i.test(html)) {
        html = html.replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/i, scriptTag);
      } else {
        html = html.replace(/<\/body>/i, `${scriptTag}\n</body>`);
      }
      console.log('Patched index file to use', scriptSrc);
    } else {
      console.warn('Could not find JS asset to patch into', indexPath);
    }

    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('Patched index file:', indexPath);
  } catch (err) {
    console.error('Failed to patch index file:', indexPath, err);
  }
}
