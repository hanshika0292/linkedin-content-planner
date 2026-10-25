"use client"
import { Plus } from "lucide-react"

interface PostsHeaderProps {
  onCreatePost: () => void
}

export function PostsHeader({ onCreatePost }: PostsHeaderProps) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Posts</h2>
        <p className="text-gray-600">Manage your LinkedIn content library</p>
      </div>
      <button
        onClick={onCreatePost}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Plus className="w-4 h-4" />
        New Post
      </button>
    </div>
  )
}
