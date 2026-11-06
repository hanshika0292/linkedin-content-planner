"use client"

import { useMemo } from "react"
import type { Post } from "../types"
import { scheduledDateKey } from "../utils/date-utils"

export function useCalendarPosts(posts: Post[]) {
  const getPostsForDate = useMemo(() => {
    const postsByDate = new Map<string, Post[]>()

    posts
      .filter((post) => post.scheduledDate && post.status === "scheduled")
      .forEach((post) => {
        // The post's calendar day, with no time zone conversion for date-only values
        const dateKey = scheduledDateKey(post.scheduledDate!)
        if (!postsByDate.has(dateKey)) {
          postsByDate.set(dateKey, [])
        }
        postsByDate.get(dateKey)!.push(post)
      })

    return (dateKey: string) => postsByDate.get(dateKey) || []
  }, [posts])

  return { getPostsForDate }
}
