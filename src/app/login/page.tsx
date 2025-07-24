'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { signIn, signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/libs/useTheme';

export default function LoginPage() {
  useTheme();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  useEffect(() => {
    signOut({ redirect: false });
    setCallbackUrl(
      new URLSearchParams(window.location.search).get('callbackUrl')
    );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    } else {
      window.location.href = callbackUrl ?? '/';
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-[var(--bg-color)]">
      <div className="p-6 max-w-sm w-full rounded-lg login-box bg-[var(--code-bg)] text-[var(--code-text)] shadow-xl shadow-black/10">
        <div className="flex justify-center items-center w-full py-4">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Logo"
              width={150}
              height={150}
              priority
            />
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <i className="fas fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Usuário"
              autoComplete="username"
              aria-label="Usuário"
            />
          </div>
          <div className="mb-6 relative">
            <i className="fas fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Senha"
              autoComplete="current-password"
              aria-label="Senha"
            />
          </div>
          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-[var(--navbar-bg)] hover:opacity-80 text-[var(--navbar-text)] font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center gap-2"
              aria-label="Login"
            >
              <i className="fas fa-sign-in-alt"></i>
            </button>
            {error && (
              <div className="flex items-center gap-2 text-sm text-[var(--code-text)]">
                <i
                  className="fas fa-exclamation-circle text-xl"
                  title="Usuário ou senha incorretos"
                ></i>
                <span>Usuário ou senha incorretos.</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
