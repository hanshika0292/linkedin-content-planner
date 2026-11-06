"use client"

import { Calendar, Clock } from "lucide-react"
import type { Post } from "../types"
import { formatScheduledDate, getTimeUntil } from "../utils/date-utils"

interface UpcomingPostsCardProps {
  posts: Post[]
  categories: Array<{ id: string; name: string; color: string }>
  onEditPost?: (post: Post) => void
}

export function UpcomingPostsCard({ posts, categories, onEditPost }: UpcomingPostsCardProps) {
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
              const timeUntil = getTimeUntil(post.scheduledDate!)
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
                      {formatScheduledDate(post.scheduledDate!)}
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
