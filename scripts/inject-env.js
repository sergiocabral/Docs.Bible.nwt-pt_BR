#!/usr/bin/env node
/*
 * ----------------------------------------------
 * inject-env.js
 * ----------------------------------------------
 * Injeta variáveis de ambiente prefixadas com NEXT_PUBLIC_
 * substituindo todas as ocorrências de env.NEXT_PUBLIC_<VAR>
 * por `VALOR`.
 *
 * USO
 *   node inject-env.js ./public
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const inputDir = process.argv[2];
if (!inputDir) {
  console.error(
    '❌ Caminho da pasta não informado.\n   USO: node inject-env.js ./public'
  );
  process.exit(1);
}

const root = path.resolve(inputDir);
if (!fs.existsSync(root)) {
  console.error(`❌ Pasta não encontrada: ${root}`);
  process.exit(1);
}

const envVars = Object.fromEntries(
  Object.entries(process.env).filter(([k]) => k.startsWith('NEXT_PUBLIC_'))
);

function walk(dir, list = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
    const full = path.join(dir, entry.name);
    entry.isDirectory() ? walk(full, list) : list.push(full);
  });
  return list;
}
const isTextFile = (f) => /\.(html?|css|js|json|txt|md|svg)$/i.test(f);

const files = walk(root).filter(isTextFile);
const pattern = /process\.env\.(NEXT_PUBLIC_[A-Z0-9_]+)/g;

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(pattern, (_, varName) => {
    if (envVars[varName] !== undefined) {
      changed = true;
      return `\`${envVars[varName]}\``;
    }
    return _;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`✅ Variáveis injetadas: ${file}`);
  }
});

console.log('🚀 Injeção concluída.');
