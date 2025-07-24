// Exemplo de uso:
// const localStorage2 = createCookieStorage(env.NEXT_PUBLIC_COOKIES_DOMAIN);
// localStorage2.setItem('theme', 'dark', 365);
// console.log(localStorage2.getItem('theme'));

/**
 * Cria um storage compatível com localStorage usando cookies.
 *
 * @param {string} domain Domínio a ser usado (ex: ".raciocinios.com.br")
 * @param {object} [defaults]
 * @param {string} [defaults.path="/"] Path padrão do cookie
 * @param {boolean} [defaults.secure=true] Se true, adiciona flag Secure
 * @param {"Lax"|"Strict"|"None"} [defaults.sameSite="Lax"] SameSite do cookie
 * @returns {{getItem(key:string):string|null,setItem(key:string,value:string,days?:number):void,removeItem(key:string):void,clear():void,key(i:number):string|null,length:number}}
 */
export function createCookieStorage(
  domain,
  { path = '/', secure = true, sameSite = 'Lax' } = {}
) {
  const isNotBrowser =
    typeof window === 'undefined' || typeof document === 'undefined';
  if (isNotBrowser) return null;

  const encode = window.encodeURIComponent;
  const decode = window.decodeURIComponent;

  const set = (k, v, days) => {
    let cookie = `${encode(k)}=${encode(v)};path=${path};domain=${domain}`;
    if (days) {
      const d = new Date();
      d.setTime(d.getTime() + days * 864e5);
      cookie += `;expires=${d.toUTCString()}`;
    }
    if (sameSite) cookie += `;SameSite=${sameSite}`;
    if (secure) cookie += ';Secure';
    document.cookie = cookie;
  };

  const get = (k) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${encode(k)}=([^;]*)`)
    );
    return match ? decode(match[1]) : null;
  };

  const remove = (k) => set(k, '', -1);

  const keys = () =>
    document.cookie
      .split('; ')
      .filter(Boolean)
      .map((c) => decode(c.split('=')[0]));

  const storage = {
    get length() {
      return keys().length;
    },
    getItem: get,
    setItem: (k, v, days) => set(k, v, days),
    removeItem: remove,
    clear: () => keys().forEach(remove),
    key: (i) => keys()[i] || null,
  };

  return storage;
}
