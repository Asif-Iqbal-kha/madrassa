const { execSync } = require('child_process');

console.log('Building Vite client directly...');
execSync('npx vite build', { stdio: 'inherit' });
