import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/auth';

export async function GET(req: NextRequest) {
  const session = await getServerSession({ req, ...authOptions });
  return NextResponse.json({ loggedIn: !!session });
}
