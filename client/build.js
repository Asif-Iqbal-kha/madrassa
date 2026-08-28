import { execSync } from 'child_process';

console.log('Building Vite client directly in ES Module mode...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
} catch (e) {
  console.log('Installing @rollup/rollup-linux-x64-gnu for Linux compatibility...');
  try {
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu', { stdio: 'inherit' });
  } catch (err) {}
  execSync('npx vite build', { stdio: 'inherit' });
}
