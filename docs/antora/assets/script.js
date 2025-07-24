import { createCookieStorage } from '/cookieStorage.js';

const localStorage2 = createCookieStorage(
  process.env.NEXT_PUBLIC_COOKIES_DOMAIN
);

function getConfig() {
  return {
    is: {
      bible: !!document.querySelector('a[href*="001-genesis-001.html"]'),
    },
  };
}

/**
 * Marca combinações únicas de argumentos como já processadas.
 * Usa o nome da função, classe ou tipo do valor para gerar a chave.
 * Retorna `true` se a combinação já foi registrada anteriormente.
 *
 * @param  {...any} args - Argumentos identificadores
 * @returns {boolean} - true se já foi executado antes, false caso contrário
 */
function ignore(...args) {
  const store = (globalThis._ignore = globalThis._ignore ?? {});
  const key = args
    .map((arg) => {
      if (typeof arg === 'function' && arg.name) {
        return arg.name;
      }
      if (typeof arg === 'object' && arg !== null && arg.constructor?.name) {
        return arg.constructor.name;
      }
      return String(arg);
    })
    .join('_');
  if (store[key]) return true;
  store[key] = true;
  return false;
}

/**
 * Adiciona classes ao `<body>` com base em pares chave-valor.
 * Para cada chave no objeto, se o valor for truthy, a chave é usada como classe.
 *
 * @param {Object<string, any>} data - Objeto com nomes de classe como chaves e valores booleanos.
 *
 * @example
 * addClassNameIfTrue({ dark: true, loggedIn: false });
 * // Resultado: adiciona apenas a classe 'dark' ao <body>
 */
function addClassNameIfTrue(data) {
  for (const [key, value] of Object.entries(data)) {
    if (value) {
      document.body.classList.add(key);
    }
  }
}

/**
 * Define um comportamento de abrir/fechar seções clicáveis em um documento HTML.
 *
 * @param {Object} config - Objeto de configuração.
 * @param {string} config.selectorClick - Seletor dos elementos que, ao serem clicados, alternam a visibilidade.
 * @param {string} config.selectorClose - Seletor do conteúdo que será mostrado/ocultado.
 * @param {string} [config.selectorOpenAll] - Seletor dos elementos que, ao serem clicados, abrem todas as seções.
 * @param {string} [config.selectorParent] - Seletor para encontrar o contêiner pai do item clicado.
 * @param {boolean|Function} [config.startOpen=false] - Define se as seções devem começar abertas.
 * @param {boolean|Function} [config.ignoreIf=false] - Se for verdadeiro, não aplica o comportamento.
 */
function setOpenAndClose({
  selectorClick,
  selectorClose,
  selectorOpenAll,
  selectorParent,
  startOpen,
  ignoreIf,
}) {
  if (
    ignore(
      setOpenAndClose,
      selectorClick,
      selectorClose,
      selectorOpenAll,
      selectorParent,
      startOpen,
      ignoreIf
    )
  )
    return;

  const getValue = (value) =>
    !!(value?.constructor.name === 'Function' ? value() : value);

  startOpen = getValue(startOpen);
  ignoreIf = getValue(ignoreIf);

  if (ignoreIf) {
    return;
  }

  const nodeClickList = [];

  Array.from(document.querySelectorAll(selectorClick)).forEach((nodeClick) => {
    const nodeParent = selectorParent
      ? nodeClick.closest(selectorParent)
      : nodeClick.parentNode;
    const nodeClose = nodeParent.querySelector(selectorClose);
    const nodeCloseStyleDisplayInitial = nodeClose.style.display;

    nodeClick.style.cursor = 'pointer';

    const toggleDisplay = ({ forceOpen, forceClose } = {}) => {
      const toggleToVisible =
        forceClose === true
          ? false
          : forceOpen === true || nodeClose.style.display === 'none';
      nodeClose.style.display = toggleToVisible
        ? nodeCloseStyleDisplayInitial
        : 'none';
      if (toggleToVisible) {
        nodeParent.classList.remove('closed');
        delete nodeClick.closed;
      } else {
        nodeParent.classList.add('closed');
        nodeClick.closed = true;
      }
    };

    if (!startOpen) {
      toggleDisplay();
    }

    nodeClick.open = () => toggleDisplay({ forceOpen: true });
    nodeClick.close = () => toggleDisplay({ forceClose: true });

    nodeClickList.push(nodeClick);

    nodeClick.addEventListener('click', toggleDisplay);
    nodeClick.addEventListener('contextmenu', (evt) => {
      evt.preventDefault();
      if (nodeClick.closed) {
        nodeClickList.forEach((nodeClickTarget) => nodeClickTarget.open());
      } else {
        nodeClickList.forEach((nodeClickTarget) => nodeClickTarget.close());
      }
    });
  });

  if (selectorOpenAll) {
    Array.from(document.querySelectorAll(selectorOpenAll)).forEach(
      (nodeOpenAll) => {
        nodeOpenAll.style.cursor = 'pointer';
        nodeOpenAll.addEventListener('click', () =>
          nodeClickList.forEach((nodeClick) => nodeClick.open())
        );
      }
    );
  }
}

/**
 * Define o atributo `target="_blank"` em todos os links externos que não o possuem,
 * exceto se forem para o mesmo domínio base.
 *
 * @param {string} [target='_blank'] - Valor do atributo `target` a ser aplicado.
 */
function setExternalLinkTarget(target = '_blank') {
  const regexTopDomain = /(^|\.)(?<domain>(?:\w+)(?:\.\w+)(?:\.\w{2})?$)/;
  const domain = location.hostname.match(regexTopDomain)?.groups?.domain;

  document.querySelectorAll("a[href^='http']:not([target])").forEach((a) => {
    const linkHostname = new URL(a.href).hostname;
    if (!linkHostname.endsWith(domain)) {
      a.setAttribute('target', target);
    }
  });
}

/**
 * Atualiza os elementos de edição conforme o status de autenticação do usuário.
 *
 * - Se estiver logado, adiciona um botão de logout à barra de navegação.
 * - Se não estiver logado, altera os links com a classe "edit-this-page" para apontar para a tela de login.
 */
async function updateEditControlsBasedOnAuth() {
  if (ignore(updateEditControlsBasedOnAuth)) return;

  let loggedIn;
  try {
    const res = await fetch('/api/auth/status');
    loggedIn = (await res.json()).loggedIn;
  } catch (err) {
    loggedIn = false;
    console.error('Erro ao verificar o status de autenticação:', err);
  }

  if (loggedIn) {
    const elLogout = document.createElement('a');
    elLogout.classList.add('navbar-item');
    elLogout.setAttribute(
      'href',
      '/logout?callbackUrl=' + encodeURIComponent(window.location.href)
    );
    elLogout.setAttribute('target', '_self');
    elLogout.innerHTML = '<i class="fas fa-sign-out-alt"></i>';

    const navbarBrand = document.querySelector('.navbar-brand');
    const burger = navbarBrand?.querySelector('.navbar-burger');
    if (navbarBrand && burger) {
      navbarBrand.insertBefore(elLogout, burger);
    }
  } else {
    document.querySelectorAll('.edit-this-page a').forEach((el) => {
      el.setAttribute(
        'href',
        '/login?callbackUrl=' + encodeURIComponent(window.location.href)
      );
      el.setAttribute('target', '_self');
    });
  }
}

/**
 * Implementa o tema claro/escuro no layout.
 */
function addThemeToggleButton() {
  if (ignore(addThemeToggleButton)) return;

  const elTheme = document.createElement('a');
  elTheme.classList.add('navbar-item');
  elTheme.setAttribute('href', '#');
  elTheme.innerHTML = '<i class="fas fa-adjust"></i>';

  const theme = localStorage2.getItem('theme');
  if (theme === 'dark') document.documentElement.classList.add('dark');

  elTheme.addEventListener('click', (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle('dark');
    const isDark = document.documentElement.classList.contains('dark');
    localStorage2.setItem('theme', isDark ? 'dark' : 'light');
  });

  const navbarBrand = document.querySelector('.navbar-brand');
  const burger = navbarBrand?.querySelector('.navbar-burger');
  if (navbarBrand && burger) {
    navbarBrand.insertBefore(elTheme, burger);
  }
}

/**
 * Clica no menu de navegação lateral para abrir/fechar as seções.
 */
function toggleNavMenu() {
  document.querySelector('.nav-panel-menu button.nav-menu-toggle').click();
}

/**
 * Inicializa comportamentos interativos da página de documentação
 */
function setupDocumentUI() {
  const config = getConfig();

  addClassNameIfTrue(config.is);

  updateEditControlsBasedOnAuth();

  setExternalLinkTarget();

  setOpenAndClose({
    // Quadro de aviso: Dica
    selectorClick: '.admonitionblock.tip .icon',
    selectorClose: '.content',
    selectorParent: '.admonitionblock',
  });

  setOpenAndClose({
    // Quadro de aviso: Nota
    selectorClick: '.admonitionblock.note .icon',
    selectorClose: '.content',
    selectorParent: '.admonitionblock',
  });

  setOpenAndClose({
    // Quadro de aviso: Importante
    selectorClick: '.admonitionblock.important .icon',
    selectorClose: '.content',
    selectorParent: '.admonitionblock',
  });

  setOpenAndClose({
    // Quadro de aviso: Alerta
    selectorClick: '.admonitionblock.warning .icon',
    selectorClose: '.content',
    selectorParent: '.admonitionblock',
  });

  setOpenAndClose({
    // Quadro de aviso: Cuidado
    selectorClick: '.admonitionblock.caution .icon',
    selectorClose: '.content',
    selectorParent: '.admonitionblock',
  });

  setOpenAndClose({
    // Bloco de texto com título
    selectorClick: '.sidebarblock .title',
    selectorClose: '.ulist',
  });

  setOpenAndClose({
    // Sup-títulos do artigo
    selectorClick: '.sect1 > h2',
    selectorClose: '.sectionbody',
    selectorOpenAll: '.doc h1,.toc-menu > h3',
    ignoreIf: config.is.bible,
  });

  addThemeToggleButton();

  if (config.is.bible) toggleNavMenu();
}

document.addEventListener('DOMContentLoaded', setupDocumentUI);

const cssUrl = process.env.NEXT_PUBLIC_IMPORT_STYLE;
const jsUrl = process.env.NEXT_PUBLIC_IMPORT_SCRIPT;

if (cssUrl) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssUrl;
  document.head.appendChild(link);
}

if (jsUrl) {
  const externalScript = document.createElement('script');
  externalScript.type = 'module';
  externalScript.src = jsUrl;
  externalScript.async = true;
  document.head.appendChild(externalScript);
}
