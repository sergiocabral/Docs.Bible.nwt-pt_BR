#!/usr/bin/env node
/*
 * ----------------------------------------------
 * antora-factory-nav.js
 * ----------------------------------------------
 * Gera automaticamente os arquivos nav.adoc para cada módulo Antora
 * a partir da estrutura de diretórios/arquivos .adoc.
 *
 * FUNCIONALIDADES
 * - Atualiza o antora.yml de cada componente para referenciar os nav gerados.
 * - Se existir o arquivo `!nav`, ignora a geração do nav.adoc.
 * - Permite ordenação normal ou invertida via prefixo '!' no nome do módulo/pasta.
 * - Componentes podem ser ignorados por CLI: node factory-nav.js <pasta> [ignore1,ignore2,...]
 *
 * USO
 *   node factory-nav.js antora/components                       # padrão
 *   node factory-nav.js antora/components bibles,legacy         # ignora 'bibles' e 'legacy'
 *
 * NOTAS / LIMITAÇÕES
 * - Se o antora.yml não contiver a chave 'nav:', as entradas serão anexadas
 *   sem ela, gerando YAML inválido. Ajuste manualmente ou adapte o script.
 */

const fs = require('fs');
const path = require('path');

if (!process.argv[2]) {
  console.error(
    '❌ Erro: informe a pasta base como argumento (ex: antora/components)'
  );
  process.exit(1);
}

const componentsDirectory = fs.realpathSync(process.argv[2]);
const componentsToIgnore = process.argv[3]
  ? process.argv[3].split(',').map((c) => c.trim())
  : [];

console.log(`📂 Pasta base            : ${componentsDirectory}`);
console.log(
  `🚫 Componentes ignorados : ${componentsToIgnore.length ? componentsToIgnore.join(', ') : 'nenhum'}`
);

const moduleRootName = 'ROOT';
const navFileName = 'nav.adoc';
const indexFileName = 'index.adoc';
const ignoreGeneration = '!nav';

const formatTitle = (title) => title.replace(/^(\d+|)[!.] /, '').trim();

const factorySort = (parentName) => {
  const inverseOrdering = /^(\d+|)! /.test(parentName);
  return inverseOrdering
    ? (a, b) => b.localeCompare(a)
    : (a, b) => a.localeCompare(b);
};

let hasWrittenNav = false;

for (const componentName of fs.readdirSync(componentsDirectory)) {
  const componentDirectory = path.join(componentsDirectory, componentName);
  if (!fs.statSync(componentDirectory).isDirectory()) continue;
  if (componentsToIgnore.includes(componentName)) continue;

  console.log(`\n🔧 Processando componente: ${componentName}`);

  const antoraFilePath = path.join(componentDirectory, 'antora.yml');
  console.log(`   • antora.yml : ${antoraFilePath}`);

  const antoraFileLines = fs
    .readFileSync(antoraFilePath)
    .toString()
    .split('\n')
    .map((line) =>
      line.startsWith('name:') ? `name: ${componentName}` : line
    );
  while (
    antoraFileLines.length > 0 &&
    antoraFileLines[antoraFileLines.length - 1].trim() !== 'nav:'
  ) {
    antoraFileLines.pop();
  }
  antoraFileLines.push(`  - modules/${moduleRootName}/${navFileName}`);

  if (fs.existsSync(path.join(componentDirectory, ignoreGeneration))) {
    console.log(`   • Ignorando geração de nav.adoc para ${componentName}`);
  } else {
    const modulesDirectory = path.join(componentDirectory, 'modules');
    for (const moduleName of fs.readdirSync(modulesDirectory).sort()) {
      const moduleDirectory = path.join(modulesDirectory, moduleName);
      if (!fs.statSync(moduleDirectory).isDirectory()) continue;
      if (moduleName === moduleRootName) continue;

      antoraFileLines.push(`  - modules/${moduleName}/${navFileName}`);

      const navFilePath = path.join(moduleDirectory, navFileName);
      console.log(`   • nav.adoc   : ${navFilePath}`);

      const navFileLines = [`.${formatTitle(moduleName)}`];

      const pagesDirectory = path.join(moduleDirectory, 'pages');
      for (const pageName of fs
        .readdirSync(pagesDirectory)
        .sort(factorySort(moduleName))) {
        const pageDirectory = path.join(pagesDirectory, pageName);
        if (!fs.statSync(pageDirectory).isDirectory()) continue;

        const indexFilePath = path.join(pageDirectory, indexFileName);
        if (fs.existsSync(indexFilePath)) {
          navFileLines.push(`* xref:${pageName}/${indexFileName}[]`);
          console.log(`      • arquivo : ${indexFilePath}`);
        } else {
          navFileLines.push(`* ${formatTitle(pageName)}`);
          for (const fileName of fs
            .readdirSync(pageDirectory)
            .sort(factorySort(pageName))) {
            const filePath = path.join(pageDirectory, fileName);
            if (
              !filePath.endsWith('.adoc') ||
              fs.statSync(filePath).isDirectory()
            )
              continue;

            navFileLines.push(`** xref:${pageName}/${fileName}[]`);
            console.log(`      • arquivo : ${filePath}`);
          }
        }
      }

      fs.writeFileSync(navFilePath, navFileLines.join('\n'));
      hasWrittenNav = true;
    }
  }

  fs.writeFileSync(antoraFilePath, antoraFileLines.join('\n') + '\n');
  hasWrittenNav = true;
}

if (hasWrittenNav) {
  console.log(`\n✅ Arquivos nav.adoc atualizados com sucesso.`);
} else {
  console.log(`\n⚠️  Nenhum arquivo nav.adoc foi atualizado.`);
}
