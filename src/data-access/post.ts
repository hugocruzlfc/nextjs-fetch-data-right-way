import "server-only";

import prisma from "@/lib/prisma";
import { Post, User } from "@prisma/client";
import { authCheck } from "./auth-check";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface PostWithAuthor extends Post {
  author: User;
}

export interface PostWithAuthorDTO
  extends Pick<PostWithAuthor, "id" | "title" | "content" | "published"> {
  author: Pick<User, "name" | "email" | "image" | "id">;
}

const createPostDTO = (postData: PostWithAuthor): PostWithAuthorDTO => {
  return {
    id: postData.id,
    title: postData.title,
    content: postData.content,
    published: postData.published,
    author: {
      id: postData.author.id,
      name: postData.author.name,
      email: postData.author.email,
      image: postData.author.image,
    },
  };
};

export async function getPosts(): Promise<PostWithAuthorDTO[]> {
  const postsData = await prisma.post.findMany({
    include: {
      author: true,
    },
    where: {
      published: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    cacheStrategy: {
      ttl: 60,
      swr: 60,
    },
  });

  return postsData.map(createPostDTO);
}

export async function getPostById(
  id: string
): Promise<PostWithAuthorDTO | null> {
  const postData = await prisma.post.findUnique({
    where: { id: parseInt(id) },
    include: {
      author: true,
    },
  });
  return postData ? createPostDTO(postData) : null;
}

export async function getPostByIdEdit(
  id: string
): Promise<PostWithAuthorDTO | null> {
  const session = await authCheck();

  const postData = await getPostById(id);

  if (!postData) {
    return null;
  }

  // Verify the user is the author
  if (postData.author.email !== session?.user?.email) {
    return null;
  }

  return postData;
}

export async function upsertPost(
  postId: string | null,
  title: string,
  content: string | null,
  published = false
) {
  const session = await authCheck();

  const post = await prisma.post.upsert({
    where: {
      id: parseInt(postId ?? "-1"),
      author: {
        email: session?.user?.email!,
      },
    },
    update: {
      title: title.trim(),
      content: content?.trim(),
      published,
    },
    create: {
      title: title.trim(),
      content: content?.trim(),
      published,
      author: {
        connect: {
          email: session?.user?.email!,
        },
      },
    },
  });

  revalidatePath(`/posts/${post.id}`);
  revalidatePath("/posts");
  redirect(`/posts/${post.id}`);
}
