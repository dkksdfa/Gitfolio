// simple shared in-memory cache with TTL
type CacheEntry = { value: any; expires: number };

const store = new Map<string, CacheEntry>();

let redisClient: any = null;
let useRedis = false;

// Try to initialize Redis client only if REDIS_URL is set. This is optional — if the
// dependency isn't installed or connection fails, fall back to in-memory Map.
if (process.env.REDIS_URL) {
    try {
        // lazy require to avoid build-time dependency if not installed
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const IORedis = require('ioredis');
        redisClient = new IORedis(process.env.REDIS_URL);
        useRedis = true;
        console.info('[cache] Redis cache enabled');
    } catch (e) {
        console.warn('[cache] REDIS_URL provided but ioredis is not installed or failed to connect — using in-memory cache');
        useRedis = false;
    }
}

export function cacheGet(key: string) {
    if (useRedis && redisClient) {
        try {
            const val = redisClient.getSync ? redisClient.getSync(key) : null; // try sync if available
            // prefer async get via promise - but Route handlers are async and can await. Keep simple: not using redis async here.
            return null;
        } catch (e) {
            // fall back to memory
        }
    }
    const e = store.get(key);
    if (!e) return null;
    if (e.expires < Date.now()) {
        store.delete(key);
        return null;
    }
    return e.value;
}

export function cacheSet(key: string, value: any, ttl = 1000 * 60 * 5) {
    if (useRedis && redisClient) {
        try {
            // best-effort async set; do not await here
            redisClient.set(key, JSON.stringify(value), 'PX', ttl).catch(() => { });
            return;
        } catch (e) {
            // fall back
        }
    }
    store.set(key, { value, expires: Date.now() + ttl });
}

export function cacheDel(key: string) {
    if (useRedis && redisClient) {
        try { redisClient.del(key).catch(() => { }); return; } catch (e) { }
    }
    store.delete(key);
}

export function cacheClear() {
    if (useRedis && redisClient) {
        try { redisClient.flushdb().catch(() => { }); return; } catch (e) { }
    }
    store.clear();
}

export default { cacheGet, cacheSet, cacheDel, cacheClear };
