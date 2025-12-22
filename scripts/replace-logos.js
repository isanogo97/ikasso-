#!/usr/bin/env node

/**
 * Script pour remplacer automatiquement les anciens logos par les nouveaux
 * Usage: node scripts/replace-logos.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const APP_DIR = path.join(__dirname, '../apps/web/app');
const EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js'];

// Patterns de remplacement
const REPLACEMENTS = [
  {
    from: /import Logo from ['"]([^'"]*\/)?components\/Logo['"]/g,
    to: "import LogoFinal from '$1components/LogoFinal'"
  },
  {
    from: /import { Logo } from ['"]([^'"]*\/)?components\/Logo['"]/g,
    to: "import { LogoFinal } from '$1components/LogoFinal'"
  },
  {
    from: /<Logo(\s+[^>]*)?>/g,
    to: '<LogoFinal$1>'
  },
  {
    from: /<\/Logo>/g,
    to: '</LogoFinal>'
  }
];

/**
 * Parcourir récursivement les fichiers
 */
function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath, callback);
    } else if (EXTENSIONS.some(ext => file.endsWith(ext))) {
      callback(filePath);
    }
  });
}

/**
 * Remplacer les logos dans un fichier
 */
function replaceLogo(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  REPLACEMENTS.forEach(({ from, to }) => {
    const newContent = content.replace(from, to);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mis à jour: ${path.relative(APP_DIR, filePath)}`);
    return true;
  }
  
  return false;
}

/**
 * Fonction principale
 */
function main() {
  console.log('🔄 Remplacement des anciens logos par LogoFinal...\n');
  
  let filesModified = 0;
  let filesScanned = 0;
  
  walkDir(APP_DIR, (filePath) => {
    filesScanned++;
    if (replaceLogo(filePath)) {
      filesModified++;
    }
  });
  
  console.log(`\n📊 Résumé:`);
  console.log(`   Fichiers scannés: ${filesScanned}`);
  console.log(`   Fichiers modifiés: ${filesModified}`);
  
  if (filesModified > 0) {
    console.log(`\n✅ Remplacement terminé avec succès !`);
    console.log(`\n📋 Prochaines étapes:`);
    console.log(`   1. Placez vos logos dans apps/web/public/images/logos/`);
    console.log(`   2. Respectez la nomenclature du guide INTEGRATION_LOGOS.md`);
    console.log(`   3. Testez l'application`);
  } else {
    console.log(`\n ℹ️  Aucun remplacement nécessaire.`);
  }
}

// Exécuter le script
if (require.main === module) {
  main();
}

module.exports = { replaceLogo, walkDir };
