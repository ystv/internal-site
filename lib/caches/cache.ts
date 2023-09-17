import { LRUCache } from "lru-cache";

export default class Cache {
  private singletons = new LRUCache<string, any>({
    max: 1000,
  });
  private lru: Map<string, LRUCache<any, any>> = new Map();
  constructor(name: string) {
    console.log("Created new cache", name);
  }

  public singletonAsync<T extends {}>(
    fn: () => Promise<T>,
    ttl = 1000 * 60 * 60,
    keyIn?: string,
  ): () => Promise<T> {
    const key = keyIn ?? fn.name;
    return async () => {
      const cached = this.singletons.get(key);
      if (cached) {
        return cached;
      }
      const val = await fn();
      this.singletons.set(key, val, { ttl });
      return val;
    };
  }

  public lruAsync<T extends {}, K extends string>(
    fetcher: (k: K) => Promise<T | null>,
    ttl = 1000 * 60 * 60,
    max = 1000,
    keyIn?: string,
  ): (k: K) => Promise<T | null> {
    const key = keyIn ?? fetcher.name;
    let cache = this.lru.get(key) as LRUCache<K, T>;
    if (!cache) {
      cache = new LRUCache<K, T>({
        max,
        ttl: ttl,
        ttlAutopurge: false,
      });
      this.lru.set(key, cache);
    }
    return async (k: K) => {
      const cached = cache.get(k);
      if (cached) {
        return cached;
      }
      const val = await fetcher(k);
      if (val === null) {
        return null;
      }
      cache.set(k, val);
      return val;
    };
  }
}
