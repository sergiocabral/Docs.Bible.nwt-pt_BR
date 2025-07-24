'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

export default function LogoutPage() {
  useEffect(() => {
    const url = new URLSearchParams(window.location.search);
    const callbackUrl = url.get('callbackUrl') || '/';
    signOut({ callbackUrl });
  }, []);

  return null;
}
