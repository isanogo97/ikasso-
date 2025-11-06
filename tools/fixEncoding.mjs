import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(process.cwd(), 'apps/web/app')

/** Collect all .tsx files under a directory recursively */
function collectTsx(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) collectTsx(p, acc)
    else if (e.isFile() && p.endsWith('.tsx')) acc.push(p)
  }
  return acc
}

/** Apply a set of string replacements to content */
function fixContent(s) {
  const map = [
    ['Ã©','é'], ['Ã¨','è'], ['Ãª','ê'], ['Ã«','ë'],
    ['Ã ','à'], ['Ã¢','â'], ['Ã®','î'], ['Ã¯','ï'],
    ['Ã´','ô'], ['Ã¹','ù'], ['Ã»','û'], ['Ã§','ç'],
    ['Ã‰','É'], ['Ãˆ','È'], ['ÃŠ','Ê'], ['Ã‹','Ë'],
    ['Ã€','À'], ['Ã‚','Â'], ['Ã”','Ô'], ['Ã–','Ö'], ['Ãœ','Ü'],
    ['Ã™','Ù'], ['Ã›','Û'],
    ['SÃ©gou','Ségou'], ['HÃ´tel','Hôtel'], ['HÃ´tes','Hôtes'], ['hÃ´te','hôte'],
    ['rÃ©serv','réserv'], ['rÃ©gion','région'], ['rÃ©gions','régions'],
    ['QualitÃ©','Qualité'], ['ConfidentialitÃ©','Confidentialité'], ['communautÃ©','communauté'],
    ['ArrivÃ©e','Arrivée'], ['DÃ©part','Départ'], ['SÃ©curitÃ©','Sécurité'],
    ['VÃ©rifi','Vérifi'],
    ['Choisir une ville','Choisir une ville'], // idempotent
    // Rare artifacts
    ['Ǹ','é'], ['ǟ','é'],
    // Remove stray replacement markers
    ['�',''],
    // Backslash-u sequences that leaked
    ['\\u00e9','é'], ['\\u00e8','è'], ['\\u00ea','ê'], ['\\u00eb','ë'],
    ['\\u00e0','à'], ['\\u00e2','â'], ['\\u00ee','î'], ['\\u00ef','ï'],
    ['\\u00f4','ô'], ['\\u00f9','ù'], ['\\u00fb','û'], ['\\u00e7','ç'],
    ['\\u00c9','É'],
  ]
  let out = s
  for (const [from, to] of map) out = out.split(from).join(to)
  return out
}

const files = collectTsx(root)
let changed = 0
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8')
  const after = fixContent(before)
  if (after !== before) {
    fs.writeFileSync(f, after, 'utf8')
    changed++
    console.log('fixed:', path.relative(process.cwd(), f))
  }
}

console.log('Done. Files changed:', changed)
