import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { createPost, getPosts, validatePost } from "@/lib/blog";

export const dynamic = "force-dynamic";

/** Published posts. Admins also see drafts with ?drafts=1. */
export async function GET(req: Request) {
  const drafts = new URL(req.url).searchParams.get("drafts") === "1";
  const includeDrafts = drafts && (await isAdmin());
  return NextResponse.json({ posts: await getPosts({ includeDrafts }) });
}

/** Publishing is admin-only. */
export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const input = await req.json().catch(() => ({}));
  const problem = validatePost(input);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  return NextResponse.json({ post: await createPost(input) }, { status: 201 });
}
