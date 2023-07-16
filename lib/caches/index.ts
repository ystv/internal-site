import "server-only";
import Cache from "@/lib/caches/cache";

let S_G;
if ((global as any).__CACHE_SERVER_GLOBAL) {
  S_G = (global as any).__CACHE_SERVER_GLOBAL;
} else {
  S_G = new Cache("SERVER_GLOBAL");
  (global as any).__CACHE_SERVER_GLOBAL = S_G;
}

export const SERVER_GLOBAL = S_G;
