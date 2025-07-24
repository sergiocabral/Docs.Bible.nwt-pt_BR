import { useEffect, useState } from 'react';
import { createCookieStorage } from '@/../public/cookieStorage.js';

const localStorage2 = createCookieStorage(
  process.env.NEXT_PUBLIC_COOKIES_DOMAIN || '.localhost'
);

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage2.getItem('theme') as 'light' | 'dark' | null;
    const preferred = saved || 'light';
    setTheme(preferred);
    document.documentElement.classList.toggle('dark', preferred === 'dark');
  }, []);

  function toggleTheme() {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage2.setItem('theme', newTheme);
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  }

  return { theme, toggleTheme };
}
