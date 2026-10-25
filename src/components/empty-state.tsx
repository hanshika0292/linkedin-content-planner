"use client"
import { Plus } from "lucide-react"

interface EmptyStateProps {
  hasAnyPosts: boolean
  onCreatePost: () => void
}

export function EmptyState({ hasAnyPosts, onCreatePost }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {!hasAnyPosts ? "No posts yet" : "No posts match your filters"}
        </h3>
        <p className="text-gray-500 mb-6">
          {!hasAnyPosts
            ? "Create your first LinkedIn post to get started"
            : "Try adjusting your search or filter criteria"}
        </p>
        {!hasAnyPosts && (
          <button
            onClick={onCreatePost}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Your First Post
          </button>
        )}
      </div>
    </div>
  )
}
