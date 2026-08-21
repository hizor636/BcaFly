const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Starting BcaFly Deployment Build ===');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'academic-management-system', 'frontend');
const distDir = path.join(rootDir, 'dist');

// 1. Build academic-management-system/frontend if present
if (fs.existsSync(frontendDir) && fs.existsSync(path.join(frontendDir, 'package.json'))) {
  console.log('Building academic-management-system/frontend...');
  try {
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
    execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
  } catch (err) {
    console.warn('Frontend build warning (proceeding with standalone bundle):', err.message);
  }
}

// 2. Prepare root dist/ output directory for universal static hosting
fs.mkdirSync(distDir, { recursive: true });

const filesToCopy = [
  'index.html',
  'register-bca-dashboard.html'
];

for (const file of filesToCopy) {
  const src = path.join(rootDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(distDir, file));
    console.log(`Copied ${file} -> dist/${file}`);
  }
}

console.log('=== BcaFly Deployment Build Completed Successfully ===');
