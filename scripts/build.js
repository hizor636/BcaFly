const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('=== Starting BcaFly Universal Production Build ===');

const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'academic-management-system', 'frontend');
const distDir = path.join(rootDir, 'dist');
const frontendDist = path.join(frontendDir, 'dist');

// 1. Build the modern React frontend application
if (fs.existsSync(frontendDir) && fs.existsSync(path.join(frontendDir, 'package.json'))) {
  // Ensure frontend dependencies are installed (required in CI/Vercel environments)
  if (!fs.existsSync(path.join(frontendDir, 'node_modules'))) {
    console.log('Installing frontend dependencies...');
    execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
  }
  console.log('Compiling modern React application in academic-management-system/frontend...');
  execSync('npm run build', { cwd: frontendDir, stdio: 'inherit' });
}

// 2. Prepare root dist/ directory
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// 3. Copy compiled React production dist directly to root dist/
if (fs.existsSync(frontendDist)) {
  fs.cpSync(frontendDist, distDir, { recursive: true });
  console.log('Successfully copied production React bundle to root dist/');
}

console.log('=== BcaFly Deployment Build Completed Successfully ===');
process.exit(0);
