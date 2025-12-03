import { NextRequest } from "next/server";

/**
 * Helper to create a mock NextRequest for testing API routes
 */
export function createMockNextRequest(options: {
  method: string;
  body?: any;
  url?: string;
}): NextRequest {
  const { method, body, url = "http://localhost:3000/api/test" } = options;

  const request = new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return request as NextRequest;
}

/**
 * Helper to create mock context for dynamic route params
 * Next.js 15+ expects params to be a Promise
 */
export function createMockContext<T extends Record<string, string>>(params: T) {
  return { params: Promise.resolve(params) } as { params: Promise<T> };
}
