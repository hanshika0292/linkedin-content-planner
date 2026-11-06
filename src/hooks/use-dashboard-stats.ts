"use client"

import { useMemo } from "react"
import type { Post } from "../types"
import { parseScheduledDate } from "../utils/date-utils"

export function useDashboardStats(posts: Post[]) {
  return useMemo(() => {
    const now = new Date()
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const stats = {
      total: posts.length,
      drafts: posts.filter((p) => p.status === "draft").length,
      scheduled: posts.filter((p) => p.status === "scheduled").length,
      published: posts.filter((p) => p.status === "published").length,
      thisWeek: posts.filter((p) => new Date(p.createdAt) >= thisWeek).length,
      thisMonth: posts.filter((p) => new Date(p.createdAt) >= thisMonth).length,
    }

    const recentPosts = posts
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)

    const upcomingPosts = posts
      .filter((p) => p.status === "scheduled" && p.scheduledDate)
      .sort((a, b) => parseScheduledDate(a.scheduledDate!).getTime() - parseScheduledDate(b.scheduledDate!).getTime())
      .slice(0, 5)

    const categoryStats = posts.reduce(
      (acc, post) => {
        acc[post.category] = (acc[post.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayPosts = posts.filter((p) => {
        const postDate = new Date(p.createdAt)
        return postDate.toDateString() === date.toDateString()
      })
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        count: dayPosts.length,
      }
    }).reverse()

    return {
      stats,
      recentPosts,
      upcomingPosts,
      categoryStats,
      weeklyActivity,
    }
  }, [posts])
}
