const fs = require('fs');
const content = fs.readFileSync('src/core/services/flat.service.ts', 'utf8');
if (content.includes('setSelection')) console.log('Found setSelection');
