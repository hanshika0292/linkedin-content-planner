"use client"

import { useState } from "react"
import { Calendar, Edit, Copy, Trash2, Tag, Clock, Send } from "lucide-react"
import type { Post } from "../types"
import { useApp } from "../context/AppContext"
import { formatRelativeDate, getContrastTextColor } from "../utils/date-utils"

interface PostCardProps {
  post: Post
  compact?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onDuplicate?: () => void
  onPublish?: () => void
}

export function PostCard({ post, compact = false, onEdit, onDelete, onDuplicate, onPublish }: PostCardProps) {
  const { categories } = useApp()
  const category = categories.categories.find((c) => c.id === post.category)
  const [showFullContent, setShowFullContent] = useState(false)

  const statusColors = {
    draft: "bg-yellow-100 text-yellow-800 border-yellow-200",
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    published: "bg-green-100 text-green-800 border-green-200",
  }

  const categoryTextColorClass = getContrastTextColor(category?.color || "")

  const toggleContent = () => {
    setShowFullContent(!showFullContent)
  }

  const isContentTruncated = post.content.length > 150 // Arbitrary length for truncation

  if (compact) {
    return (
      <div
        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
        onClick={onEdit}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[post.status]}`}>
            {post.status}
          </span>
          {category && (
            <span
              className={`px-2.5 py-1 text-xs font-medium rounded-full ${categoryTextColorClass}`}
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-700 line-clamp-2 mb-2 font-medium">{post.content}</p>
        <div className="text-xs text-gray-500 flex items-center gap-1">
          {post.scheduledDate && (
            <span className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              {formatRelativeDate(post.scheduledDate)}
            </span>
          )}
          {!post.scheduledDate && (
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatRelativeDate(post.updatedAt)}
            </span>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${statusColors[post.status]}`}>
              {post.status}
            </span>
            {category && (
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full flex items-center ${categoryTextColorClass}`}
                style={{ backgroundColor: category.color }}
              >
                <Tag className="w-3 h-3 mr-1" />
                {category.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit post"
                aria-label="Edit post"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            {onPublish && (post.status === 'draft' || post.status === 'scheduled') && (
              <button
                onClick={onPublish}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Mark as published"
                aria-label="Mark as published"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Duplicate post"
                aria-label="Duplicate post"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete post"
                aria-label="Delete post"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p
            className={`text-gray-800 whitespace-pre-wrap leading-relaxed ${!showFullContent && isContentTruncated ? "line-clamp-4" : ""}`}
          >
            {post.content}
          </p>
          {isContentTruncated && (
            <button
              onClick={toggleContent}
              className="text-blue-600 hover:underline text-sm mt-2 block"
              aria-expanded={showFullContent}
            >
              {showFullContent ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {post.scheduledDate && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Scheduled {formatRelativeDate(post.scheduledDate)}
              </span>
            )}
          </div>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Updated {formatRelativeDate(post.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
