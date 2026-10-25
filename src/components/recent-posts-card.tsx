"use client"

import { FileText, Edit, Eye } from "lucide-react"
import type { Post } from "../types"

interface RecentPostsCardProps {
  posts: Post[]
  categories: Array<{ id: string; name: string; color: string }>
  onEditPost?: (post: Post) => void
  onViewPost?: (post: Post) => void
}

export function RecentPostsCard({ posts, categories, onEditPost, onViewPost }: RecentPostsCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRelativeTime = (date: string) => {
    const now = new Date()
    const postDate = new Date(date)
    const diffMs = now.getTime() - postDate.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Recent Posts
          </h3>
          <span className="text-sm text-gray-500">{posts.length} total</span>
        </div>
      </div>
      <div className="p-6">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.slice(0, 5).map((post) => {
              const category = categories.find((c) => c.id === post.category)
              return (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: category?.color || "#6B7280" }}
                      >
                        {category?.name || "Uncategorized"}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(post.status)}`}>
                        {post.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {onViewPost && (
                        <button
                          onClick={() => onViewPost(post)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View post"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEditPost && (
                        <button
                          onClick={() => onEditPost(post)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Edit post"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed mb-2">{post.content}</p>
                  <p className="text-xs text-gray-500">{getRelativeTime(post.updatedAt)}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No posts created yet</p>
            <p className="text-sm text-gray-400">Create your first post to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}
