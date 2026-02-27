import { NextRequest, NextResponse } from "next/server";

// BACKEND_URL is a server-only env var (no NEXT_PUBLIC_ prefix) so it is never
// embedded in the client bundle. Falls back to localhost for local dev.
const API_BASE_URL = (process.env.BACKEND_URL || "http://localhost:8000").replace(/\/$/, "");

async function handleProxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  try {
    const path = pathSegments ? pathSegments.join("/") : "";
    const url = new URL(request.url);
    const targetUrl = `${API_BASE_URL}/${path}${url.search}`;

    console.log(`[Proxy] ${request.method} ${targetUrl}`);

    // Forward most headers
    const headers = new Headers(request.headers);

    // Remove 'host' header so fetch uses the target URL's host
    headers.delete("host");
    // Strip referer for safety
    headers.delete("referer");

    const requestInit: RequestInit = {
      method: request.method,
      headers: headers,
      redirect: "manual",
      // @ts-ignore — required for Node's undici fetch with streaming bodies
      duplex: "half",
    };

    // Forward body if present
    if (request.method !== "GET" && request.method !== "HEAD") {
      const body = await request.arrayBuffer();
      if (body.byteLength > 0) {
        requestInit.body = body;
      }
    }

    const response = await fetch(targetUrl, requestInit);

    // Collect and rewrite Set-Cookie headers BEFORE building responseHeaders.
    //
    // IMPORTANT: new NextResponse(body, { headers }) serialises the Headers
    // object to a plain object internally, which collapses duplicate keys —
    // so the last Set-Cookie wins and every cookie before it is silently
    // dropped. Fix: strip set-cookie from the constructor headers entirely,
    // then append each cookie individually onto the already-constructed
    // NextResponse via .headers.append(), which bypasses that serialisation.
    const rawCookies = response.headers.getSetCookie();
    const modifiedCookies = rawCookies.map((cookie) => {
      // SameSite=None requires Secure; rewrite to Lax for HTTP localhost
      cookie = cookie.replace(/SameSite=None/gi, "SameSite=Lax");
      if (process.env.NODE_ENV === "development") {
        cookie = cookie.replace(/;\s*Secure/gi, "");
        cookie = cookie.replace(/;\s*Domain=[^;]+/gi, "");
      }
      return cookie;
    });

    // Build response headers without any set-cookie entries
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") {
        responseHeaders.set(key, value);
      }
    });

    // Pass back the backend's body
    const responseBody = await response.arrayBuffer();

    // Construct the response WITHOUT cookies first (avoids the dedup bug)
    const nextResponse = new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

    // Append each cookie individually AFTER construction so none are dropped
    for (const cookie of modifiedCookies) {
      nextResponse.headers.append("set-cookie", cookie);
    }

    return nextResponse;
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json(
      { detail: "Proxy Error: Unable to reach the backend." },
      { status: 502 }
    );
  }
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const DELETE = handleProxy;
export const PATCH = handleProxy;
export const OPTIONS = async () => new NextResponse(null, { status: 200 });
