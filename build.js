const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('--- Starting Fullstack Vercel Build Process ---');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

if (fs.existsSync(path.join(__dirname, 'client'))) {
  console.log('1. Detected repository root. Setting up client subfolder...');
  const clientDir = path.join(__dirname, 'client');
  
  console.log('2. Installing client dependencies (Vite, React, Icons)...');
  execSync(`${npmCmd} install`, { cwd: clientDir, stdio: 'inherit' });
  
  console.log('3. Running Vite production bundle build...');
  execSync(`${npmCmd} run build`, { cwd: clientDir, stdio: 'inherit' });
  
  const clientDist = path.join(__dirname, 'client', 'dist');
  const rootDist = path.join(__dirname, 'dist');
  
  if (fs.existsSync(clientDist)) {
    console.log('4. Copying compiled distribution files to root dist folder...');
    fs.cpSync(clientDist, rootDist, { recursive: true });
    console.log('--- ✅ Build Completed Successfully! ---');
  }
} else {
  console.log('1. Building directly in current directory...');
  execSync(`${npmCmd} install`, { stdio: 'inherit' });
  execSync(`${npmCmd} run build`, { stdio: 'inherit' });
  console.log('--- ✅ Build Completed Successfully! ---');
}
