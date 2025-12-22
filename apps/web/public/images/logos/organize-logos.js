const fs = require('fs');
const path = require('path');

// Mapping de vos fichiers vers la nomenclature standard
const logoMapping = {
  // Logos principaux
  'ikasso-logo.svg': 'ikasso-logo.svg', // Déjà bon
  'ikasso-logo.png': 'ikasso-logo.png', // Déjà bon
  'vector file.svg': 'ikasso-logo-main.svg',
  'vector 200 with size.svg': 'ikasso-logo-200.svg',
  'vector 400 width size.svg': 'ikasso-logo-400.svg', 
  'vector 800 width size.svg': 'ikasso-logo-800.svg',
  
  // PNG de différentes tailles
  '200 with size png.png': 'ikasso-logo-200.png',
  '400 width size png.png': 'ikasso-logo-400.png',
  '800 width size png.png': 'ikasso-logo-800.png',
  'ikasso-icon.png': 'ikasso-logo-icon.png',
  
  // Créer les tailles manquantes à partir des existants
  // (nous ferons cela manuellement)
};

console.log('📁 Organisation des logos Ikasso...\n');

Object.entries(logoMapping).forEach(([oldName, newName]) => {
  const oldPath = path.join(__dirname, oldName);
  const newPath = path.join(__dirname, newName);
  
  if (fs.existsSync(oldPath) && oldName !== newName) {
    try {
      fs.copyFileSync(oldPath, newPath);
      console.log(`✅ ${oldName} → ${newName}`);
    } catch (error) {
      console.log(`❌ Erreur: ${oldName} → ${error.message}`);
    }
  }
});

console.log('\n🎯 Logos organisés ! Vérifiez le résultat.');
