const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Preparing GitHub Pages deployment ---');

const distDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Please run expo export first.');
  process.exit(1);
}

// 1. Inject base path preservation script into dist/index.html
const indexPath = path.join(distDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  const patchScript = `
    <!-- MediUnify Base Path Preservation & 404 SPA Redirect Handler -->
    <script data-mediunify-patch="true">
      (function() {
        var BASE = '/mediunify-pharmacy-app';
        try {
          var redirect = sessionStorage.getItem('mediunify_redirect');
          if (redirect) {
            sessionStorage.removeItem('mediunify_redirect');
            if (redirect !== location.href) {
              history.replaceState(null, null, redirect);
            }
          }
        } catch(e) {}

        function fixPath(url) {
          if (!url) return BASE + '/';
          var s = String(url);
          if (s.indexOf('http://') === 0 || s.indexOf('https://') === 0) {
            try {
              var u = new URL(s);
              if (u.pathname.indexOf(BASE) !== 0) {
                u.pathname = BASE + (u.pathname === '/' ? '' : u.pathname);
                return u.toString();
              }
              return s;
            } catch(e) { return s; }
          }
          if (s === '/' || s === '') return BASE + '/';
          if (s.charAt(0) === '/' && s.indexOf(BASE) !== 0) return BASE + s;
          if (s.charAt(0) !== '/' && s.indexOf(BASE) !== 0) return BASE + '/' + s;
          return s;
        }

        var _push = history.pushState.bind(history);
        var _replace = history.replaceState.bind(history);
        history.pushState = function(state, title, url) {
          return _push(state, title, fixPath(url));
        };
        history.replaceState = function(state, title, url) {
          return _replace(state, title, fixPath(url));
        };
      })();
    </script>
  `;
  if (!html.includes('data-mediunify-patch')) {
    html = html.replace('<head>', '<head>' + patchScript);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('✓ Injected base path protection into dist/index.html');
  }
}

// 2. Create dedicated SPA fallback 404.html
const fallback404 = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>MediUnify Pharmacy</title>
  <script>
    try {
      sessionStorage.setItem("mediunify_redirect", window.location.href);
    } catch(e) {}
    window.location.replace("/mediunify-pharmacy-app/");
  </script>
  <meta http-equiv="refresh" content="0; url=/mediunify-pharmacy-app/">
</head>
<body>
</body>
</html>`;
fs.writeFileSync(path.join(distDir, '404.html'), fallback404, 'utf8');
console.log('✓ Created dist/404.html SPA redirect fallback');

// 3. Create .nojekyll so GitHub Pages does not ignore _expo or @ vendor dirs
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('✓ Created dist/.nojekyll');

// 4. Get remote git URL from parent repo
const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
console.log(`✓ Using remote: ${remoteUrl}`);

// 5. Initialize git repo inside dist and push directly to gh-pages branch
// This completely avoids Windows MAX_PATH and .gitignore caching bugs
const gitCmd = (cmd) => execSync(`git -C "${distDir}" ${cmd}`, { stdio: 'inherit' });

// Remove existing .git in dist if present
const distGit = path.join(distDir, '.git');
if (fs.existsSync(distGit)) {
  fs.rmSync(distGit, { recursive: true, force: true });
}

gitCmd('init -b gh-pages');
gitCmd('config core.longpaths true');
gitCmd('add -A');
gitCmd('commit -m "Deploy to GitHub Pages with base path preservation, fonts and .nojekyll"');
gitCmd(`remote add origin ${remoteUrl}`);
gitCmd('push -f origin gh-pages');

// Clean up .git in dist
fs.rmSync(distGit, { recursive: true, force: true });

console.log('✓ Successfully deployed to GitHub Pages (gh-pages branch)!');
