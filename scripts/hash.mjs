#!/usr/bin/env node
// Print a scrypt password hash in the format the app stores.
//   npm run hash -- "your password"
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";

const password = process.argv.slice(2).join(" ");
if (!password) {
  console.error('Usage: npm run hash -- "your password"');
  process.exit(1);
}
const salt = randomBytes(16);
const hash = await promisify(scrypt)(password, salt, 64);
console.log(`scrypt$${salt.toString("base64url")}$${hash.toString("base64url")}`);
