#!/usr/bin/env node
/*
 * ----------------------------------------------
 * antora-factory-menu.js
 * ----------------------------------------------
 * Substitui o conteúdo do menu em header-content.hbs com base nas pastas de componentes
 * e nas variáveis definidas em WEBSITE_MENU_LINKS do .env.
 * Usa o campo `title:` de cada antora.yml como texto visível.
 *
 * USO:
 *   node antora-factory-menu.js ./path/header-content.hbs ./docs/components
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const hbsFilePath = process.argv[2];
const componentsDir = process.argv[3];

if (!hbsFilePath || !componentsDir) {
  console.error(
    '❌ Uso: node antora-factory-menu.js <arquivo.hbs> <pasta_components>'
  );
  process.exit(1);
}

const resolvedHbsPath = path.resolve(hbsFilePath);
const resolvedComponentsPath = path.resolve(componentsDir);

if (!fs.existsSync(resolvedHbsPath)) {
  console.error(`❌ Arquivo .hbs não encontrado: ${resolvedHbsPath}`);
  process.exit(1);
}
if (!fs.existsSync(resolvedComponentsPath)) {
  console.error(
    `❌ Pasta de componentes não encontrada: ${resolvedComponentsPath}`
  );
  process.exit(1);
}

const folders = fs
  .readdirSync(resolvedComponentsPath)
  .filter((name) =>
    fs.statSync(path.join(resolvedComponentsPath, name)).isDirectory()
  )
  .sort();

const dropdownModules =
  folders.length > 1
    ? folders
        .map((folder) => {
          const antoraPath = path.join(
            resolvedComponentsPath,
            folder,
            'antora.yml'
          );
          if (!fs.existsSync(antoraPath)) {
            console.warn(`⚠️  Ignorado (sem antora.yml): ${folder}`);
            return null;
          }

          const antoraContent = fs.readFileSync(antoraPath, 'utf8');
          let title = null;

          try {
            const parsed = yaml.load(antoraContent);
            title = parsed?.title?.trim();
          } catch (e) {
            console.warn(`⚠️  Erro ao ler antora.yml de ${folder}`);
            return null;
          }

          if (!title) {
            console.warn(`⚠️  Ignorado (sem title): ${folder}`);
            return null;
          }

          return `            <a class='navbar-item' href='{{{or site.url siteRootPath}}}/${folder}/content/index.html'>${title}</a>`;
        })
        .filter(Boolean)
        .join('\n')
    : '';

const dropdownModulesBlock = dropdownModules
  ? `
        <div class='navbar-item has-dropdown is-hoverable'>
          <a class='navbar-link' href='#'>
            <i class='fas fa-cubes'></i>
          </a>
          <div class='navbar-dropdown'>
${dropdownModules}
          </div>
        </div>`
  : '';

const dropdownRaw = process.env.WEBSITE_MENU_LINKS || '';
const dropdownLinks = dropdownRaw
  .split(',')
  .map((entry) => {
    entry = entry.trim();
    if (entry === '-' || entry === '---') {
      return `            <hr class='navbar-divider'>`;
    }
    const match = entry.match(/(.*?)\[(.*?)\]/);
    if (!match) return null;
    const [_, href, label] = match;
    return `            <a class='navbar-item' href='${href}'>${label}</a>`;
  })
  .filter(Boolean)
  .join('\n');

const dropdownLinksBlock = dropdownLinks
  ? `
        <div class='navbar-item has-dropdown is-hoverable'>
          <a class='navbar-link' href='#'>
            <i class='fas fa-up-right-from-square'></i>
          </a>
          <div class='navbar-dropdown'>
${dropdownLinks}
          </div>
        </div>`
  : '';

const newMenu =
  dropdownModulesBlock || dropdownLinksBlock
    ? `
    <div id='topbar-nav' class='navbar-menu'>
      <div class='navbar-end'>${dropdownModulesBlock}${dropdownLinksBlock}
      </div>
    </div>
`.trim()
    : `<div id='topbar-nav' class='navbar-menu'></div>`;

let hbsContent = fs.readFileSync(resolvedHbsPath, 'utf8');

const regex = /<div id='topbar-nav' class='navbar-menu'>[\s\S]*<\/div>/m;
if (!regex.test(hbsContent)) {
  console.error(`❌ Bloco <div id='topbar-nav'...> não encontrado no arquivo.`);
  process.exit(1);
}

hbsContent = hbsContent.replace(regex, newMenu);
fs.writeFileSync(resolvedHbsPath, hbsContent);

console.log(`✅ Menu atualizado com sucesso: ${resolvedHbsPath}`);
