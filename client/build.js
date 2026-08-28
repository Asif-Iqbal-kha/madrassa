import { execSync } from 'child_process';

console.log('Building Vite client directly in ES Module mode...');
execSync('npx vite build', { stdio: 'inherit' });
