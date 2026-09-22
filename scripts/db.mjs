// Usage:
//   npm run db:check   → test the connection and show collection counts
//   npm run db:reset   → drop glee.ng collections (demo data reloads on next app start)
import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "fs";

for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "glamng";
if (!uri) {
  console.error("✗ MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const db = client.db(dbName);
  await db.command({ ping: 1 });
  console.log(`✓ Connected to MongoDB — database "${dbName}"`);
  if (process.argv.includes("--reset")) {
    for (const c of ["operators", "bookings"]) await db.collection(c).drop().catch(() => {});
    console.log("✓ Dropped operators & bookings. Start the app to reseed demo data.");
  } else {
    for (const c of ["operators", "bookings"]) console.log(`  ${c}: ${await db.collection(c).countDocuments()}`);
  }
} catch (e) {
  console.error("✗ Could not connect:", e.message);
  console.error("  Check the URI, your password, and Atlas → Network Access (allow your IP).");
  process.exitCode = 1;
} finally {
  await client.close();
}
