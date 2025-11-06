const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'src', 'styles', 'unified.css');
const destDir = path.resolve(__dirname, '..', '..', 'backend', 'static', 'assets');
const dest = path.join(destDir, 'cs.css');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copyUnified() {
  if (!fs.existsSync(src)) {
    console.error('Source unified.css not found at', src);
    process.exit(1);
  }
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
  console.log('Copied', src, '->', dest);
}

function patchIndexFile(indexPath) {
  try {
    if (!fs.existsSync(indexPath)) {
      console.warn('Index file not found, skipping patch:', indexPath);
      return;
    }
    let html = fs.readFileSync(indexPath, 'utf8');

    // Replace any stylesheet link that points to an assets/*.css file with cs.css
    const linkRegex = /<link\s+rel=["']stylesheet["'][^>]*href=["']([^"']*assets\/[^"]*\.css)["'][^>]*>\s*/i;
    const csLink = '  <link rel="stylesheet" crossorigin href="/static/assets/cs.css">\n';

    if (linkRegex.test(html)) {
      html = html.replace(linkRegex, csLink);
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Patched', indexPath, 'to reference cs.css');
      return;
    }

    // If no match, insert the cs.css link before </head> to be safe
    const headClose = /<\/head>/i;
    if (headClose.test(html)) {
      html = html.replace(headClose, csLink + '</head>');
      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('Inserted cs.css link into', indexPath);
      return;
    }

    console.warn('Could not find a place to insert cs.css in', indexPath);
  } catch (err) {
    console.error('Failed to patch index file:', indexPath, err);
  }
}

function main() {
  copyUnified();

  // Patch both possible backend-served index files. Vite outputs into backend/static
  // which may overwrite the file each build; ensure cs.css is enforced afterwards.
  const backendIndex = path.resolve(__dirname, '..', '..', 'backend', 'static', 'index.html');
  const backendStaticFilesIndex = path.resolve(__dirname, '..', '..', 'backend', 'staticfiles', 'index.html');

  patchIndexFile(backendIndex);
  patchIndexFile(backendStaticFilesIndex);

  // Optional: quick verification that cs.css exists and contains something
  try {
    const s = fs.readFileSync(dest, 'utf8');
    if (!s || s.length < 10) {
      console.warn('cs.css written but seems very small (<10 bytes)');
    }
  } catch (err) {
    console.error('Warning: unable to read written cs.css at', dest, err);
  }
}

main();
