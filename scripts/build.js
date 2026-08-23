const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Starting BcaFly Universal Production Build ===');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'academic-management-system', 'frontend');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// 1. Prepare root dist/ directory first
fs.mkdirSync(distDir, { recursive: true });

// 2. Copy root HTML files to dist
const rootFiles = [
  'index.html',
  'register-bca-dashboard.html'
];

for (const file of rootFiles) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
    console.log(`Copied ${file} -> dist/${file}`);
  }
}

// 3. Copy all public assets to dist
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const pFile of publicFiles) {
    const src = path.join(publicDir, pFile);
    if (fs.statSync(src).isFile()) {
      fs.copyFileSync(src, path.join(distDir, pFile));
      console.log(`Copied public/${pFile} -> dist/${pFile}`);
    }
  }
}

// 4. Optionally build academic-management-system/frontend if present
if (fs.existsSync(frontendDir) && fs.existsSync(path.join(frontendDir, 'package.json'))) {
  try {
    console.log('Building academic-management-system/frontend...');
    execSync('npm install --prefer-offline --no-audit', { cwd: frontendDir, stdio: 'inherit' });
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
  } catch (err) {
    console.log('Note: Frontend sub-package build skipped, using root standalone production bundle:', err.message);
  }
}

console.log('=== BcaFly Deployment Build Completed Successfully ===');
process.exit(0);
