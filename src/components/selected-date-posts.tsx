"use client"

import type { Post } from "../types"

interface SelectedDatePostsProps {
  selectedDate: string
  posts: Post[]
  categories: Array<{ id: string; name: string; color: string }>
  onEditPost: (post: Post) => void
  onCreatePost: () => void
}

export function SelectedDatePosts({
  selectedDate,
  posts,
  categories,
  onEditPost,
  onCreatePost,
}: SelectedDatePostsProps) {
  const selectedDateObj = new Date(selectedDate)
  const formattedDate = selectedDateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Posts for {formattedDate}</h3>
        <p className="text-sm text-gray-600 mt-1">{posts.length} scheduled posts</p>
      </div>

      <div className="p-6">
        {posts.length > 0 ? (
          <div className="space-y-4">
            {posts.map((post) => {
              const category = categories.find((c) => c.id === post.category)
              return (
                <div key={post.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 text-xs font-medium rounded-full text-white"
                        style={{ backgroundColor: category?.color || "#6B7280" }}
                      >
                        {category?.name || "Uncategorized"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {post.scheduledDate &&
                          new Date(post.scheduledDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </span>
                    </div>
                    <button
                      onClick={() => onEditPost(post)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No posts scheduled</h4>
            <p className="text-gray-500 mb-6">Create your first post for this date</p>
            <button
              onClick={onCreatePost}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Schedule a Post
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
