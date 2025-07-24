import { redirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ branch: string; path: string[] }>;
}) {
  const { branch, path } = await params;
  const template = process.env.NEXT_PUBLIC_GIT_REMOTE_URL;
  if (!template) {
    redirect('/');
  }
  redirect(
    template.replace('{branch}', branch).replace('{path}', path.join('/'))
  );
}
