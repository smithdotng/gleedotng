import "server-only";
import { randomBytes } from "crypto";
import type { Collection, Sort } from "mongodb";
import { getDb } from "./mongodb";
import { MANAGED_POSTS } from "./blog-seed";
import type { Post } from "./types";
import { slugify } from "./utils";
import { stripMarkdown } from "./markdown";

/** Journal data layer — the `posts` collection. Only admins write here (see admin-auth.ts). */

const NO_ID = { projection: { _id: 0 } } as const;

let setupPromise: Promise<void> | null = null;

function ensureSetup(): Promise<void> {
  if (!setupPromise) {
    setupPromise = runSetup().catch((e) => {
      setupPromise = null;
      throw e;
    });
  }
  return setupPromise;
}

async function runSetup() {
  const col = (await getDb()).collection<Post>("posts");
  await Promise.all([
    col.createIndex({ id: 1 }, { unique: true }),
    col.createIndex({ slug: 1 }, { unique: true }),
    col.createIndex({ status: 1, publishedAt: -1 }),
  ]);

  // Team-authored posts: inserted when missing, refreshed when their revision goes up.
  for (const { post, revision } of MANAGED_POSTS) {
    const existing = await col.findOne({ id: post.id }, { projection: { _id: 0, managedRevision: 1 } });
    if (!existing) {
      await col.insertOne({ ...post, managedRevision: revision }).catch((e: { code?: number }) => {
        if (e?.code !== 11000) throw e;
      });
    } else if ((existing.managedRevision ?? 0) < revision) {
      await col.updateOne({ id: post.id }, { $set: { ...post, managedRevision: revision } });
    }
  }
}

async function postsCol(): Promise<Collection<Post>> {
  await ensureSetup();
  return (await getDb()).collection<Post>("posts");
}

/* ---------------- Reads ---------------- */

export async function getPosts({ includeDrafts = false, limit = 100 } = {}): Promise<Post[]> {
  const col = await postsCol();
  const filter = includeDrafts ? {} : { status: "published" as const };
  const sort: Sort = includeDrafts ? { createdAt: -1 } : { publishedAt: -1 };
  return col.find(filter, NO_ID).sort(sort).limit(limit).toArray();
}

export async function getPostBySlug(slug: string, { includeDrafts = false } = {}): Promise<Post | null> {
  const col = await postsCol();
  const post = await col.findOne({ slug }, NO_ID);
  if (!post || (!includeDrafts && post.status !== "published")) return null;
  return post;
}

export async function getPostById(id: string): Promise<Post | null> {
  return (await postsCol()).findOne({ id }, NO_ID);
}

/* ---------------- Writes (admin only) ---------------- */

export interface PostInput {
  title: string;
  excerpt?: string;
  body: string;
  cover?: string;
  tags?: string[] | string;
  author?: string;
  slug?: string;
  status?: Post["status"];
}

const cleanTags = (t: PostInput["tags"]): string[] =>
  (Array.isArray(t) ? t : String(t ?? "").split(","))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

const autoExcerpt = (body: string) => {
  const text = stripMarkdown(body);
  return text.length > 180 ? `${text.slice(0, 180).replace(/\s+\S*$/, "")}…` : text;
};

async function uniqueSlug(col: Collection<Post>, wanted: string, ignoreId?: string): Promise<string> {
  const base = slugify(wanted).slice(0, 70) || `post-${Date.now()}`;
  let slug = base;
  for (let i = 2; i < 100; i++) {
    const clash = await col.findOne({ slug }, { projection: { _id: 0, id: 1 } });
    if (!clash || clash.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
  return `${base}-${randomBytes(3).toString("hex")}`;
}

export function validatePost(input: PostInput): string {
  if (!input.title?.trim()) return "Give the post a title.";
  if (input.title.trim().length > 140) return "That title is too long.";
  if (!input.body?.trim() || stripMarkdown(input.body).length < 50) return "The post needs a bit more body copy.";
  if (input.cover && !/^(https?:\/\/|\/)/.test(input.cover.trim())) return "The cover image must be a URL or a path starting with /.";
  return "";
}

export async function createPost(input: PostInput): Promise<Post> {
  const col = await postsCol();
  const now = new Date().toISOString();
  const status: Post["status"] = input.status === "published" ? "published" : "draft";
  const post: Post = {
    id: `post_${randomBytes(6).toString("hex")}`,
    slug: await uniqueSlug(col, input.slug || input.title),
    title: input.title.trim(),
    excerpt: (input.excerpt?.trim() || autoExcerpt(input.body)).slice(0, 320),
    body: input.body.trim(),
    cover: input.cover?.trim() || undefined,
    tags: cleanTags(input.tags),
    author: input.author?.trim() || "The glee.ng team",
    status,
    publishedAt: status === "published" ? now : undefined,
    createdAt: now,
  };
  await col.insertOne({ ...post });
  return post;
}

export async function updatePost(id: string, input: Partial<PostInput>): Promise<Post | null> {
  const col = await postsCol();
  const current = await col.findOne({ id }, NO_ID);
  if (!current) return null;

  const next: Partial<Post> = { updatedAt: new Date().toISOString() };
  if (input.title !== undefined) next.title = input.title.trim();
  if (input.body !== undefined) next.body = input.body.trim();
  if (input.excerpt !== undefined) next.excerpt = (input.excerpt.trim() || autoExcerpt(input.body ?? current.body)).slice(0, 320);
  if (input.cover !== undefined) next.cover = input.cover.trim() || undefined;
  if (input.tags !== undefined) next.tags = cleanTags(input.tags);
  if (input.author !== undefined) next.author = input.author.trim() || current.author;
  if (input.slug !== undefined && input.slug.trim()) next.slug = await uniqueSlug(col, input.slug, id);
  if (input.status !== undefined) {
    next.status = input.status === "published" ? "published" : "draft";
    // first publish stamps the date; unpublishing keeps it for when it goes back up
    if (next.status === "published" && !current.publishedAt) next.publishedAt = new Date().toISOString();
  }
  await col.updateOne({ id }, { $set: next });
  return col.findOne({ id }, NO_ID);
}

export async function deletePost(id: string): Promise<boolean> {
  const res = await (await postsCol()).deleteOne({ id });
  return res.deletedCount === 1;
}
