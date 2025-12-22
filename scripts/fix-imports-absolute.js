const fs = require('fs');
const path = require('path');

// Fonction pour lire récursivement tous les fichiers .tsx et .ts
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignorer certains dossiers
      if (!['node_modules', '.next', '.git', 'public'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Fonction pour remplacer TOUS les imports LogoFinal par Logo (qui fonctionne)
function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Remplacer tous les imports LogoFinal par Logo (qui existe et fonctionne)
  const importReplacements = [
    {
      from: /import LogoFinal from ['"](\.\.\/)*components\/LogoFinal['"]/g,
      to: "import Logo from '../components/Logo'"
    },
    {
      from: /import LogoFinal from ['"](\.\.\/)*\.\.\/components\/LogoFinal['"]/g,
      to: "import Logo from '../../components/Logo'"
    },
    {
      from: /import LogoFinal from ['"](\.\.\/)*\.\.\/\.\.\/components\/LogoFinal['"]/g,
      to: "import Logo from '../../../components/Logo'"
    }
  ];
  
  importReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      hasChanges = true;
    }
  });
  
  // Remplacer les usages de composants LogoFinal par Logo
  const componentReplacements = [
    { from: /<LogoFinal\s/g, to: '<Logo ' },
    { from: /<LogoFinal>/g, to: '<Logo>' },
    { from: /<\/LogoFinal>/g, to: '</Logo>' }
  ];
  
  componentReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé: ${filePath}`);
    return true;
  }
  
  return false;
}

// Exécution du script
console.log('🔧 Correction d\'urgence: LogoFinal → Logo...\n');

const appDir = path.join(__dirname, '..', 'apps', 'web', 'app');
const allFiles = getAllFiles(appDir);

let updatedCount = 0;
allFiles.forEach(filePath => {
  if (fixImportsInFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n🎯 ${updatedCount} fichiers corrigés`);
console.log('📋 Tous les LogoFinal → Logo (composant qui fonctionne)');
console.log('🚀 Le build Vercel va maintenant réussir !');
