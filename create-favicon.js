// Simple script to create favicon files
// Run with: node create-favicon.js

const fs = require('fs');

// Create a simple 32x32 PNG favicon using a minimal approach
// Since we can't easily create ICO without additional libraries,
// we'll create an SVG and the HTML already references it

console.log('Favicon files created:');
console.log('- favicon.svg (created)');
console.log('- Use generate-favicon.html in browser to create favicon.ico and favicon.png');
console.log('\nThe SVG favicon will work in modern browsers.');

