// unusedDocenteFunctions.js
const fs = require('fs');
const path = require('path');

const serviceFile = path.join(__dirname, 'src', 'components', 'services', 'docentesService.js');
const frontendDir = path.join(__dirname, 'src');

const fileContent = fs.readFileSync(serviceFile, 'utf-8');

// 1. Extraer funciones exportadas
const exportRegex = /export (const|async function|function) (\w+)/g;
const exportedFunctions = [];

let match;
while ((match = exportRegex.exec(fileContent)) !== null) {
  exportedFunctions.push(match[2]);
}

console.log(`🟡 Funciones exportadas encontradas: ${exportedFunctions.length}`);

// 2. Buscar en todos los archivos del frontend si se usan
const getAllFrontendFiles = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFrontendFiles(fullPath));
    } else if (/\.(js|jsx|ts|tsx)$/.test(file) && !fullPath.includes('docentesService.js')) {
      results.push(fullPath);
    }
  });
  return results;
};

const allFiles = getAllFrontendFiles(frontendDir);

const usedFunctions = new Set();
for (const filePath of allFiles) {
  const content = fs.readFileSync(filePath, 'utf-8');
  for (const fn of exportedFunctions) {
    if (content.includes(fn)) {
      usedFunctions.add(fn);
    }
  }
}

const unused = exportedFunctions.filter(fn => !usedFunctions.has(fn));

// 3. Reporte final
console.log(`✅ Funciones **usadas**: ${usedFunctions.size}`);
console.log(`❌ Funciones **NO USADAS** (${unused.length}):`);
unused.forEach(fn => console.log(` - ${fn}`));
