const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Preparing GitHub Pages deployment ---');

const distDir = path.resolve(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory not found. Please run expo export first.');
  process.exit(1);
}

// 1. Copy 404.html for SPA routing fallback
fs.copyFileSync(path.join(distDir, 'index.html'), path.join(distDir, '404.html'));
console.log('✓ Created dist/404.html');

// 2. Create .nojekyll so GitHub Pages does not ignore _expo or @ vendor dirs
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');
console.log('✓ Created dist/.nojekyll');

// 3. Get remote git URL from parent repo
const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
console.log(`✓ Using remote: ${remoteUrl}`);

// 4. Initialize git repo inside dist and push directly to gh-pages branch
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
gitCmd('commit -m "Deploy to GitHub Pages with all font assets and .nojekyll"');
gitCmd(`remote add origin ${remoteUrl}`);
gitCmd('push -f origin gh-pages');

// Clean up .git in dist
fs.rmSync(distGit, { recursive: true, force: true });

console.log('✓ Successfully deployed to GitHub Pages (gh-pages branch)!');
