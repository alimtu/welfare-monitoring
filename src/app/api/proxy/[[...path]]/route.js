import axios from 'axios';
import https from 'node:https';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Server-side upstream — never exposed to the browser, so we can disable
// TLS verification here without leaking through the bundle.
const UPSTREAM = (process.env.API_BASE_URL || 'https://bsrq.itcuir.ir/').replace(/\/$/, '');

const client = axios.create({
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
  validateStatus: () => true,
  responseType: 'arraybuffer',
  maxRedirects: 0,
  timeout: 0,
  decompress: true,
});

const SKIP_REQ_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'accept-encoding',
  'transfer-encoding',
]);

const SKIP_RES_HEADERS = new Set([
  'transfer-encoding',
  'content-encoding',
  'content-length',
  'connection',
  'keep-alive',
]);

async function handle(request, ctx) {
  const params = await ctx.params;
  const segments = params?.path ?? [];
  const url = new URL(request.url);
  const pathPart = segments.length ? '/' + segments.join('/') : '/';
  const targetUrl = `${UPSTREAM}${pathPart}${url.search}`;

  const headers = {};
  for (const [key, value] of request.headers.entries()) {
    if (SKIP_REQ_HEADERS.has(key.toLowerCase())) continue;
    headers[key] = value;
  }

  let data;
  if (!['GET', 'HEAD'].includes(request.method)) {
    const buf = await request.arrayBuffer();
    if (buf.byteLength > 0) data = Buffer.from(buf);
  }

  try {
    const response = await client.request({
      method: request.method,
      url: targetUrl,
      headers,
      data,
      signal: request.signal,
    });

    const resHeaders = new Headers();
    for (const [key, value] of Object.entries(response.headers || {})) {
      if (SKIP_RES_HEADERS.has(key.toLowerCase())) continue;
      if (Array.isArray(value)) resHeaders.set(key, value.join(', '));
      else if (value != null) resHeaders.set(key, String(value));
    }

    return new NextResponse(response.data, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (err) {
    if (axios.isCancel?.(err)) {
      return new NextResponse(null, { status: 499 });
    }
    return NextResponse.json(
      { status: 'error', message: 'Proxy upstream failed', error: err?.message },
      { status: 502 }
    );
  }
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
  handle as HEAD,
  handle as OPTIONS,
};
