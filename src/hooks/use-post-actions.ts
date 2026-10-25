"use client"

import { useCallback } from "react"
import type { Post } from "../types"

interface UsePostActionsProps {
  posts: {
    addPost: (post: Omit<Post, "id">) => void
    updatePost: (post: Post) => void
    deletePost: (id: string) => void
  }
}

export function usePostActions({ posts }: UsePostActionsProps) {
  const handleSavePost = useCallback(
    (postData: Omit<Post, "id">, editingPost?: Post) => {
      if (editingPost) {
        posts.updatePost({ ...postData, id: editingPost.id })
      } else {
        posts.addPost(postData)
      }
    },
    [posts],
  )

  const handleDeletePost = useCallback(
    (postId: string) => {
      if (confirm("Are you sure you want to delete this post?")) {
        posts.deletePost(postId)
      }
    },
    [posts],
  )

  const handleDuplicatePost = useCallback(
    (post: Post) => {
      const duplicatedPost = {
        content: post.content + " (Copy)",
        category: post.category,
        status: "draft" as const,
        scheduledDate: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        media: post.media,
      }
      posts.addPost(duplicatedPost)
    },
    [posts],
  )

  const handlePublishPost = useCallback(
    (post: Post) => {
      if (confirm("Are you sure you want to publish this post? This will mark it as published.")) {
        const updatedPost = {
          ...post,
          status: "published" as const,
          updatedAt: new Date().toISOString(),
        }
        posts.updatePost(updatedPost)
      }
    },
    [posts],
  )

  return {
    handleSavePost,
    handleDeletePost,
    handleDuplicatePost,
    handlePublishPost,
  }
}
