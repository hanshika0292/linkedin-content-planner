"use client"

import { useMemo } from "react"
import type { Post } from "../types"
import { normalizeDate } from "../utils/date-utils"

export function useCalendarPosts(posts: Post[]) {
  const getPostsForDate = useMemo(() => {
    const postsByDate = new Map<string, Post[]>()

    posts
      .filter((post) => post.scheduledDate && post.status === "scheduled")
      .forEach((post) => {
        // Normalize the scheduled date to ensure consistent comparison
        const dateKey = normalizeDate(post.scheduledDate!)
        if (!postsByDate.has(dateKey)) {
          postsByDate.set(dateKey, [])
        }
        postsByDate.get(dateKey)!.push(post)
      })

    return (dateKey: string) => postsByDate.get(dateKey) || []
  }, [posts])

  return { getPostsForDate }
}
