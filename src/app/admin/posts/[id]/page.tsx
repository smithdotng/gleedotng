import { notFound, redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getPostById } from "@/lib/blog";
import PostEditor from "@/components/PostEditor";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit story", ...PRIVATE };

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const post = await getPostById((await params).id);
  if (!post) notFound();
  return (
    <div className="bg-sand/60 py-12">
      <div className="container-luxe">
        <p className="eyebrow">Editing · {post.status}</p>
        <h1 className="font-display mt-2 mb-8 text-5xl text-espresso-900">{post.title}</h1>
        <PostEditor post={post} />
      </div>
    </div>
  );
}
