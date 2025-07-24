import CredentialsProvider from 'next-auth/providers/credentials';
import { AuthOptions } from 'next-auth';
import { env } from 'process';

const parseUsers = (raw: string | undefined) => {
  if (!raw) return {};
  return Object.fromEntries(
    raw.split(',').map((entry) => {
      const [user, pass] = entry.split(':');
      return [user.trim(), pass.trim()];
    })
  );
};

const users = parseUsers(env.USERS);

export const authOptions: AuthOptions = {
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const expectedPassword = users[credentials.username];
        if (expectedPassword && expectedPassword === credentials.password) {
          return {
            id: credentials.username,
            email: credentials.username,
          };
        }

        return null;
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name: '__Secure-next-auth.session-token',
      options: {
        domain: process.env.NEXT_PUBLIC_COOKIES_DOMAIN,
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
        secure: true,
      },
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
