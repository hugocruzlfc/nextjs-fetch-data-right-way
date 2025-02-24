"use server";

import { auth } from "@/auth";
import { upsertPost } from "@/data-access/post";
import prisma from "@/lib/prisma";
import { containsProfanity } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function publishPost(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

  if (containsProfanity(content)) {
    throw new Error("Content contains profanity");
  }

  const published = true;

  await upsertPost(postId, title, content, published);
}

export async function saveDraft(formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;

  if (!title?.trim()) {
    throw new Error("Title is required");
  }

  if (containsProfanity(content)) {
    throw new Error("Content contains profanity");
  }
  await upsertPost(postId, title, content);
}
