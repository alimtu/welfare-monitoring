import { NextResponse } from 'next/server';

const BASE_URL = 'https://crane.feham.ir';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mob = searchParams.get('mob');

  if (!mob) {
    return NextResponse.json({ success: false, message: 'mob is required' }, { status: 400 });
  }

  const url = new URL(BASE_URL);
  url.searchParams.set('name', 'Icms');
  url.searchParams.set('file', 'json');
  url.searchParams.set('op', 'm_login');
  url.searchParams.set('mob', mob);

  const res = await fetch(url.toString(), {
    method: 'GET',
    // avoid caching auth-related requests
    cache: 'no-store',
  });

  const data = await res.json();

  // We do NOT set the auth cookie here (only after verify)
  // We return finger to the client temporarily for step-2.
  return NextResponse.json(data, { status: res.status });
}

