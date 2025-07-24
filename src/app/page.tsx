import { redirect } from 'next/navigation';
import { existsSync } from 'fs';
import { join } from 'path';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const publicPath = join(process.cwd(), 'public', 'index.html');

  if (existsSync(publicPath)) {
    redirect('/index.html');
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="p-6 max-w-sm w-full bg-white shadow-md rounded">
        <div className="flex justify-center items-center w-full py-4 bg-white">
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
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-4">
            Documentação não encontrada
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Parece que a documentação ainda não foi gerada. O arquivo{' '}
            <code>public/index.html</code> não existe.
          </p>
        </div>
      </div>
    </div>
  );
}
