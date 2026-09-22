import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { deletePost, getPostById, updatePost, validatePost } from "@/lib/blog";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const { id } = await params;
  const input = await req.json().catch(() => ({}));
  // a status-only change (publish / unpublish) doesn't need the whole post re-validated
  const contentChange = input.title !== undefined || input.body !== undefined;
  if (contentChange) {
    const current = await getPostById(id);
    if (!current) return NextResponse.json({ error: "Post not found." }, { status: 404 });
    const problem = validatePost({ ...current, ...input });
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
  }
  const post = await updatePost(id, input);
  if (!post) return NextResponse.json({ error: "Post not found." }, { status: 404 });
  return NextResponse.json({ post });
}

export async function DELETE(_req: Request, { params }: Params) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const { id } = await params;
  return (await deletePost(id))
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: "Post not found." }, { status: 404 });
}
