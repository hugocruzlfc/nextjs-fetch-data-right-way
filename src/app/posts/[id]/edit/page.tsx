import { auth } from "@/auth";
import { PostForm } from "@/components/post";
import { getPostByIdEdit } from "@/data-access/post";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export default async function EditPost({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostByIdEdit(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24">
      <div className="max-w-2xl mx-auto px-4">
        <PostForm post={post} />
      </div>
    </div>
  );
}
