import { TextEncoder, TextDecoder } from "util";

// Polyfill for Next.js edge runtime
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Next.js Request/Response if needed
if (typeof Request === "undefined") {
  global.Request = class Request {
    constructor(public url: string, public init?: RequestInit) {}
    async json() {
      return JSON.parse((this.init?.body as string) || "{}");
    }
  } as any;
}

if (typeof Response === "undefined") {
  global.Response = class Response {
    constructor(public body: any, public init?: ResponseInit) {}
    async json() {
      return JSON.parse(this.body);
    }
  } as any;
}

// Mock fetch if needed
if (typeof fetch === "undefined") {
  global.fetch = jest.fn();
}
