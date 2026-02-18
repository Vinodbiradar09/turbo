import { getRedisClient } from "./client";

export interface CacheOptions {
  ttl?: number;
  lockTTL?: number;
}

export class RedisCache {
  constructor(private readonly redis = getRedisClient()) {}

  private cacheKey(type: string, args: string[]) {
    return `cache:${type}:${args.join(":")}`;
  }

  private lockKey(type: string, args: string[]) {
    return `lock:${type}:${args.join(":")}`;
  }

  private roomKey( type : string , args : string[]){
    return `room:${type}:${args.join(":")}`;
  }

  async set(type: string, args: string[], value: any, options?: CacheOptions) {
    const key = this.cacheKey(type, args);
    const data: any = JSON.stringify(value);
    if (options?.ttl) {
      await this.redis.set(key, data, "EX", options.ttl);
    } else {
      await this.redis.set(key, data);
    }
  }

  async get(type: string, args: string[]) {
    const value = await this.redis.get(this.cacheKey(type, args));
    return value ? JSON.parse(value) : null;
  }

  async del(type: string, args: string[]) {
    await this.redis.del(this.cacheKey(type, args));
  }

  async getOrSet<T>(
    type: string,
    args: string[],
    fetcher: () => Promise<T>,
    options: CacheOptions = { ttl: 60, lockTTL: 10 },
  ): Promise<T> {
    // cache stampede problem
    // first check if cache present or not 
    const cached = await this.get(type, args);
    if (cached) return cached;
    // if not present create lock key
    const lockKey = this.lockKey(type, args);
    // now lock 
    const lock = await this.redis.set(
      lockKey,
      "1",
      "PX",
      options.lockTTL ?? 5000,
      "NX",
    );
    if (!lock) {
      // if you have not locked your are not owner 
      await this.sleep(100);
      // retry the cache
      const retry = await this.get(type, args);
      if (retry) return retry;
      // if found send cache not means set   
      return this.getOrSet(type, args, fetcher, options);
    }

    try {
      const data = await fetcher();
      await this.set(type, args, data, { ttl: options.ttl });
      return data;
    } catch (error) {
      console.log("error cache stampede", error);
      throw error;
    } finally {
      await this.redis.del(lockKey);
    }
  }

  async join(type : string , args : string[] , socketId : string){
    const roomKey = this.roomKey(type , args);
    await this.redis.sadd(roomKey , socketId);
  }

  async end( type : string , args : string[] , socketId : string){
    const roomKey = this.roomKey(type , args);
    await this.redis.srem(roomKey , socketId);
  }

  sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
