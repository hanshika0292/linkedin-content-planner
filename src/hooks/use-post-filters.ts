"use client"

import { useMemo } from "react"
import type { Post, PostFilter } from "../types"

interface UsePostsFilterProps {
  posts: Post[]
  searchTerm: string
  statusFilter: PostFilter
  categoryFilter: string
}

export function usePostsFilter({ posts, searchTerm, statusFilter, categoryFilter }: UsePostsFilterProps) {
  return useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch = post.content.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === "all" || post.status === statusFilter
        const matchesCategory = categoryFilter === "all" || post.category === categoryFilter
        return matchesSearch && matchesStatus && matchesCategory
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [posts, searchTerm, statusFilter, categoryFilter])
}
