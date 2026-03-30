/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');

function createIconSVG(size) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="7" fill="#7c3aed"/>
  <g fill="#fff">
    <rect x="6" y="6" width="4" height="4" rx="1"/>
    <rect x="6" y="12" width="4" height="4" rx="1"/>
    <rect x="12" y="6" width="4" height="4" rx="1"/>
    <rect x="12" y="12" width="4" height="4" rx="1"/>
    <rect x="22" y="6" width="4" height="4" rx="1"/>
    <rect x="22" y="12" width="4" height="4" rx="1"/>
    <rect x="6" y="22" width="4" height="4" rx="1"/>
    <rect x="12" y="22" width="4" height="4" rx="1"/>
    <rect x="18" y="18" width="4" height="4" rx="1"/>
    <rect x="22" y="22" width="4" height="4" rx="1"/>
  </g>
</svg>`;
}

// Create SVG icons (for production, convert to PNG using a tool like sharp or an online converter)
fs.writeFileSync('public/icons/icon-192.png', createIconSVG(192));
fs.writeFileSync('public/icons/icon-512.png', createIconSVG(512));
fs.writeFileSync('public/icons/icon-maskable-512.png', createIconSVG(512));
console.log('Icon placeholders created');
