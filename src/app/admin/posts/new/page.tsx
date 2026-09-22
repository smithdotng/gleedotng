import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import PostEditor from "@/components/PostEditor";
import { PRIVATE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "New story", ...PRIVATE };

export default async function NewPost() {
  if (!(await isAdmin())) redirect("/admin/login");
  return (
    <div className="bg-sand/60 py-12">
      <div className="container-luxe">
        <p className="eyebrow">glee.ng team</p>
        <h1 className="font-display mt-2 mb-8 text-5xl text-espresso-900">New story</h1>
        <PostEditor />
      </div>
    </div>
  );
}
