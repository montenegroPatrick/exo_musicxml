const fs = require('fs');

// Cherchons un fichier JSON contenant les sync points
const files = fs.readdirSync('./src/assets/mocks', {withFileTypes: true});
// (Assuming mocks are there or somewhere else)
