const { writeFileSync } = require('node:fs');
const { join } = require('node:path');
const origin = new URL(process.env.API_ORIGIN || '');
if (origin.protocol !== 'https:' || origin.username || origin.password || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('API_ORIGIN must be the HTTPS origin of your Render API, without credentials or a path.');
}
const root = join(__dirname, '..');
writeFileSync(join(root, 'vercel.json'), JSON.stringify({
  framework: null,
  buildCommand: 'npm run build:hosting',
  outputDirectory: 'dist/pharmacy-bouzoubaa/browser',
  rewrites: [
    { source: '/api/:path*', destination: `${origin.origin}/api/:path*` },
    { source: '/(.*)', destination: '/index.html' }
  ]
}, null, 2) + '\n');
console.log('Created vercel.json for API origin ' + origin.origin);
