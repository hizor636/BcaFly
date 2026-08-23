const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Starting BcaFly Universal Production Build ===');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'academic-management-system', 'frontend');
const distDir = path.join(rootDir, 'dist');
const publicDir = path.join(rootDir, 'public');

// 1. Build academic-management-system/frontend if package.json is present
if (fs.existsSync(frontendDir) && fs.existsSync(path.join(frontendDir, 'package.json'))) {
  console.log('Building academic-management-system/frontend...');
  try {
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
  } catch (err) {
    console.warn('Frontend build warning (proceeding with standalone bundle):', err.message);
  }
}

// 2. Prepare root dist/ directory
fs.mkdirSync(distDir, { recursive: true });

// 3. Copy root HTML files to dist
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

// 4. Copy all public assets to dist
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

console.log('=== BcaFly Deployment Build Completed Successfully ===');
