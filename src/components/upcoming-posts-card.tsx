"use client"

import { Calendar, Clock } from "lucide-react"
import type { Post } from "../types"

interface UpcomingPostsCardProps {
  posts: Post[]
  categories: Array<{ id: string; name: string; color: string }>
  onEditPost?: (post: Post) => void
}

export function UpcomingPostsCard({ posts, categories, onEditPost }: UpcomingPostsCardProps) {
  const getTimeUntilPost = (scheduledDate: string) => {
    const now = new Date()
    const scheduled = new Date(scheduledDate)
    const diffMs = scheduled.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `in ${diffDays} day${diffDays > 1 ? "s" : ""}`
    } else if (diffHours > 0) {
      return `in ${diffHours} hour${diffHours > 1 ? "s" : ""}`
    } else if (diffMs > 0) {
      return "soon"
    } else {
      return "overdue"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Upcoming Posts
          </h3>
          <span className="text-sm text-gray-500">{posts.length} scheduled</span>
        </div>
      </div>
      <div className="p-6">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => {
              const category = categories.find((c) => c.id === post.category)
              const timeUntil = getTimeUntilPost(post.scheduledDate!)
              const isOverdue = timeUntil === "overdue"

              return (
                <div
                  key={post.id}
                  className={`border rounded-lg p-4 transition-all hover:shadow-sm ${
                    isOverdue ? "border-red-200 bg-red-50" : "border-gray-200"
                  } ${onEditPost ? "cursor-pointer" : ""}`}
                  onClick={() => onEditPost?.(post)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: category?.color || "#6B7280" }}
                      >
                        {category?.name || "Uncategorized"}
                      </span>
                      <span className={`text-xs font-medium ${isOverdue ? "text-red-600" : "text-gray-500"}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {timeUntil}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(post.scheduledDate!).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{post.content}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No upcoming posts scheduled</p>
            <p className="text-sm text-gray-400">Schedule your next post to see it here</p>
          </div>
        )}
      </div>
    </div>
  )
}
