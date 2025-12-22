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

// Fonction pour remplacer les imports et usages de Logo
function updateLogosInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  // Remplacer les imports de Logo par LogoFinal
  const oldImports = [
    /import Logo from ['"](\.\.\/)*components\/Logo['"]/g,
    /import Logo from ['"](\.\.\/)*components\/LogoIkasso['"]/g,
    /import LogoIkasso from ['"](\.\.\/)*components\/LogoIkasso['"]/g
  ];
  
  oldImports.forEach(regex => {
    if (regex.test(content)) {
      content = content.replace(regex, "import LogoFinal from '../components/LogoFinal'");
      hasChanges = true;
    }
  });
  
  // Remplacer les usages de composants
  const componentReplacements = [
    { from: /<Logo\s/g, to: '<LogoFinal ' },
    { from: /<LogoIkasso\s/g, to: '<LogoFinal ' },
    { from: /<Logo>/g, to: '<LogoFinal>' },
    { from: /<LogoIkasso>/g, to: '<LogoFinal>' },
    { from: /<\/Logo>/g, to: '</LogoFinal>' },
    { from: /<\/LogoIkasso>/g, to: '</LogoFinal>' }
  ];
  
  componentReplacements.forEach(({ from, to }) => {
    if (from.test(content)) {
      content = content.replace(from, to);
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Mis à jour: ${filePath}`);
    return true;
  }
  
  return false;
}

// Fonction pour mettre à jour les emails avec le logo Ikasso
function updateEmailLogos() {
  const emailFiles = [
    'apps/web/app/api/send-welcome-email/route.ts',
    'apps/web/app/api/send-email-verification/route.ts',
    'apps/web/app/api/send-admin-invite/route.ts',
    'apps/web/app/api/send-password-reset/route.ts',
    'apps/web/app/api/send-booking-confirmation/route.ts'
  ];
  
  const logoUrl = 'https://ikasso-pwxa-pak2i44w3-ibrahima-ousmane-sanogos-projects.vercel.app/images/logos/ikasso-logo.png';
  
  emailFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let hasChanges = false;
      
      // Remplacer les emojis par le vrai logo
      const emojiReplacements = [
        {
          from: 'https://em-content.zobj.net/source/apple/391/party-popper_1f389.png',
          to: logoUrl
        },
        {
          from: 'https://em-content.zobj.net/source/apple/391/house_1f3e0.png',
          to: logoUrl
        },
        {
          from: 'https://em-content.zobj.net/source/apple/391/shield_1f6e1-fe0f.png',
          to: logoUrl
        },
        {
          from: 'https://em-content.zobj.net/source/apple/391/locked-with-key_1f510.png',
          to: logoUrl
        }
      ];
      
      emojiReplacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
          content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
          hasChanges = true;
        }
      });
      
      // Mettre à jour les couleurs pour correspondre à Ikasso
      const colorReplacements = [
        {
          from: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          to: 'linear-gradient(135deg, #E85D04 0%, #F77F00 100%)'
        },
        {
          from: '#667eea',
          to: '#E85D04'
        }
      ];
      
      colorReplacements.forEach(({ from, to }) => {
        if (content.includes(from)) {
          content = content.replace(new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), to);
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`📧 Email mis à jour: ${filePath}`);
      }
    }
  });
}

// Exécution du script
console.log('🚀 Mise à jour des logos Ikasso...\n');

// Mettre à jour tous les fichiers de composants
const appDir = path.join(__dirname, '..', 'apps', 'web', 'app');
const allFiles = getAllFiles(appDir);

let updatedCount = 0;
allFiles.forEach(filePath => {
  if (updateLogosInFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n📱 ${updatedCount} fichiers de composants mis à jour`);

// Mettre à jour les emails
console.log('\n📧 Mise à jour des logos dans les emails...');
updateEmailLogos();

console.log('\n🎉 Mise à jour terminée !');
console.log('📋 Résumé:');
console.log(`   • ${updatedCount} fichiers de composants mis à jour`);
console.log('   • Logos des emails remplacés par vos logos professionnels');
console.log('   • Couleurs mises à jour pour correspondre à Ikasso');
