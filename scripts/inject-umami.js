#!/usr/bin/env node
/*
 * ----------------------------------------------
 * inject-umami.js
 * ----------------------------------------------
 * Injeta o script de rastreamento do Umami em todos
 * os arquivos index.html dentro da pasta informada.
 *
 * USO
 *   node inject-umami.js ./public
 *   node inject-umami.js ./public/subdir
 *
 * PRÉ‑REQUISITOS
 *   Variáveis de ambiente:
 *   - NEXT_PUBLIC_UMAMI_SCRIPT_URL
 *   - NEXT_PUBLIC_UMAMI_WEBSITE_ID
 *
 * REGRAS
 *   • Só altera arquivos que contenham </head>.
 *   • Ignora arquivos que já possuam data-website-id.
 *   • Gera resumo de execução ao final.
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');

const inputDir = process.argv[2];
if (!inputDir) {
  console.error(
    '❌ Caminho da pasta não informado.\n   USO: node inject-umami.js ./public'
  );
  process.exit(1);
}

const root = path.resolve(inputDir);
if (!fs.existsSync(root)) {
  console.error(`❌ Pasta não encontrada: ${root}`);
  process.exit(1);
}

if (
  !process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
  !process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
) {
  console.error(
    'ℹ️ Variáveis de ambiente do Umami ausentes: NEXT_PUBLIC_UMAMI_SCRIPT_URL e NEXT_PUBLIC_UMAMI_WEBSITE_ID.'
  );
  process.exit(0);
}

console.log(`📂 Pasta alvo           : ${root}`);
console.log(
  `🔗 Script Umami         : ${process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}`
);
console.log(
  `🆔 Website ID           : ${process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}`
);

const umamiScript = `<script defer src="${process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}" data-website-id="${process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}"></script>`;

let added = 0;
let skipped = 0;
let present = 0;

function injectScriptInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('data-website-id')) {
    console.log(`↪️  Já contém Umami     : ${filePath}`);
    present += 1;
    return;
  }

  if (content.includes('</head>')) {
    content = content.replace('</head>', `${umamiScript}\n</head>`);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Script injetado      : ${filePath}`);
    added += 1;
  } else {
    console.log(`⏭️  Ignorado (sem </head>): ${filePath}`);
    skipped += 1;
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else if (entry === 'index.html') {
      injectScriptInFile(fullPath);
    }
  }
}

walk(root);

console.log('\n📊 Resumo:');
console.log(`   • Injetados : ${added}`);
console.log(`   • Já tinha  : ${present}`);
console.log(`   • Ignorados : ${skipped}\n`);
