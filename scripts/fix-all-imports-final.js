const fs = require('fs');
const path = require('path');

// Fonction pour corriger les imports selon la profondeur du dossier
function getCorrectImportPath(filePath) {
  // Compter le nombre de niveaux depuis /app/
  const relativePath = path.relative(path.join(__dirname, '..', 'apps', 'web', 'app'), filePath);
  const depth = relativePath.split(path.sep).length - 1; // -1 car le fichier lui-même ne compte pas
  
  // Générer le bon chemin relatif
  let correctPath = '';
  for (let i = 0; i < depth; i++) {
    correctPath += '../';
  }
  correctPath += 'components/Logo';
  
  return correctPath;
}

// Fonction pour corriger un fichier
function fixFileImports(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  const correctPath = getCorrectImportPath(filePath);
  
  // Remplacer tous les imports Logo incorrects
  const patterns = [
    /import Logo from ['"](\.\.\/)*components\/Logo['"]/g,
    /import Logo from ['"](\.\.\/)*\.\.\/components\/Logo['"]/g,
    /import Logo from ['"](\.\.\/)*\.\.\/\.\.\/components\/Logo['"]/g,
    /import Logo from ['"](\.\.\/)*\.\.\/\.\.\/\.\.\/components\/Logo['"]/g
  ];
  
  patterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, `import Logo from '${correctPath}'`);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} → import Logo from '${correctPath}'`);
    return true;
  }
  
  return false;
}

// Liste des fichiers à corriger avec leurs chemins corrects
const filesToFix = [
  // Fichiers admin/ (2 niveaux)
  { file: 'apps/web/app/admin/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/admin/admins/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/admin/hosts/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/admin/set-password/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/admin/test-email/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/admin/users/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/admin/users/[id]/page.tsx', correctPath: '../../../components/Logo' },
  
  // Fichiers auth/ (2 niveaux)
  { file: 'apps/web/app/auth/login/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/auth/register/page.tsx', correctPath: '../../components/Logo' },
  { file: 'apps/web/app/auth/register-new/page.tsx', correctPath: '../../components/Logo' },
  
  // Fichiers dashboard/ (2 niveaux)
  { file: 'apps/web/app/dashboard/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/dashboard/host/page.tsx', correctPath: '../../components/Logo' },
  
  // Fichiers host/ (2 niveaux)
  { file: 'apps/web/app/host/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/host/add-property/page.tsx', correctPath: '../../components/Logo' },
  
  // Fichiers racine app/ (1 niveau)
  { file: 'apps/web/app/page.tsx', correctPath: './components/Logo' },
  { file: 'apps/web/app/contact/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/experiences/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/help/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/messages/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/payment/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/privacy/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/search/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/settings/page.tsx', correctPath: '../components/Logo' },
  { file: 'apps/web/app/terms/page.tsx', correctPath: '../components/Logo' }
];

console.log('🔧 CORRECTION FINALE DE TOUS LES IMPORTS...\n');

let fixedCount = 0;

filesToFix.forEach(({ file, correctPath }) => {
  const fullPath = path.join(__dirname, '..', file);
  
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Remplacer tous les imports Logo incorrects
    const patterns = [
      /import Logo from ['"](\.\.\/)*components\/Logo['"]/g,
      /import Logo from ['"](\.\.\/)*\.\.\/components\/Logo['"]/g,
      /import Logo from ['"](\.\.\/)*\.\.\/\.\.\/components\/Logo['"]/g,
      /import Logo from ['"](\.\.\/)*\.\.\/\.\.\/\.\.\/components\/Logo['"]/g
    ];
    
    let hasChanges = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `import Logo from '${correctPath}'`);
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${file} → import Logo from '${correctPath}'`);
      fixedCount++;
    }
  }
});

console.log(`\n🎯 ${fixedCount} fichiers corrigés avec les bons chemins`);
console.log('🚀 Vercel va maintenant compiler sans erreurs !');
