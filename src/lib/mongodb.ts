import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * One shared MongoClient per server process.
 * In development Next.js hot-reloads modules, so the client is cached on
 * globalThis to avoid opening a new connection pool on every edit.
 */

// Database name kept as "glamng" from before the glee.ng rename so existing data stays connected.
const DB_NAME = process.env.MONGODB_DB || "glamng";

type Cache = { client?: MongoClient; promise?: Promise<MongoClient> };
const g = globalThis as unknown as { __gleeMongo?: Cache };
const cache: Cache = (g.__gleeMongo ??= {});

function uri(): string {
  const u = process.env.MONGODB_URI;
  if (!u) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env.local and add your MongoDB Atlas connection string.",
    );
  }
  return u;
}

export async function getClient(): Promise<MongoClient> {
  if (cache.client) return cache.client;
  if (!cache.promise) {
    const client = new MongoClient(uri(), {
      appName: "glee.ng",
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10_000,
    });
    cache.promise = client.connect().then((c) => {
      cache.client = c;
      return c;
    });
    cache.promise.catch(() => {
      cache.promise = undefined; // allow a retry on the next request
    });
  }
  return cache.promise;
}

export async function getDb(): Promise<Db> {
  return (await getClient()).db(DB_NAME);
}
