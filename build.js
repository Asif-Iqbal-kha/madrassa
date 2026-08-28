const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Starting fullstack build process...');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

if (fs.existsSync(path.join(__dirname, 'client'))) {
  console.log('Detected repository root. Building client subfolder...');
  const clientDir = path.join(__dirname, 'client');
  execSync(`${npmCmd} run build`, { cwd: clientDir, stdio: 'inherit' });
  
  const clientDist = path.join(__dirname, 'client', 'dist');
  const rootDist = path.join(__dirname, 'dist');
  
  if (fs.existsSync(clientDist)) {
    console.log('Copying build artifacts to root dist folder...');
    fs.cpSync(clientDist, rootDist, { recursive: true });
    console.log('Build completed successfully.');
  }
} else {
  console.log('Building directly in current directory...');
  execSync(`${npmCmd} run build`, { stdio: 'inherit' });
}
