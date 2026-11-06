"use client"

import type { Post } from "../types"
import { isPastDateKey } from "../utils/date-utils"

interface CalendarGridProps {
  daysInMonth: number
  firstDay: number
  currentDate: Date
  todayKey: string
  selectedDate?: string
  getPostsForDate: (dateKey: string) => Post[]
  categories: Array<{ id: string; name: string; color: string }>
  onDateClick: (day: number) => void
  onDateDoubleClick?: (day: number) => void
  onEditPost: (post: Post) => void
  formatDateKey: (date: Date) => string
  createDateFromDay: (day: number) => Date
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CalendarGrid({
  daysInMonth,
  firstDay,
  todayKey,
  selectedDate,
  getPostsForDate,
  categories,
  onDateClick,
  onDateDoubleClick,
  onEditPost,
  formatDateKey,
  createDateFromDay,
}: CalendarGridProps) {
  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2 min-h-[100px] border border-gray-200 bg-gray-50"></div>)
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = createDateFromDay(day)
      const dateKey = formatDateKey(date)
      const posts = getPostsForDate(dateKey)
      const isToday = dateKey === todayKey
      const isSelected = dateKey === selectedDate
      const isPastDate = isPastDateKey(dateKey, todayKey)

      days.push(
        <div
          key={day}
          onClick={() => onDateClick(day)}
          onDoubleClick={() => onDateDoubleClick && onDateDoubleClick(day)}
          className={`p-3 min-h-[100px] border border-gray-200 cursor-pointer transition-all hover:shadow-sm ${
            isToday ? "bg-blue-50 border-blue-300 ring-1 ring-blue-200" : "hover:bg-gray-50"
          } ${isSelected ? "ring-2 ring-blue-500 bg-blue-50" : ""} ${isPastDate ? "bg-gray-50 text-gray-400" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={`${date.toLocaleDateString()} - ${posts.length} posts scheduled. Double-click to create a new post.`}
          title="Click to select, double-click to create a new post"
        >
          <div
            className={`text-sm font-semibold mb-2 ${isToday ? "text-blue-600" : isPastDate ? "text-gray-400" : "text-gray-900"}`}
          >
            {day}
          </div>

          <div className="space-y-1">
            {posts.slice(0, 3).map((post) => {
              const category = categories.find((c) => c.id === post.category)
              return (
                <div
                  key={post.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditPost(post)
                  }}
                  className="text-xs p-1.5 rounded-md truncate cursor-pointer hover:opacity-80 transition-opacity shadow-sm"
                  style={{
                    backgroundColor: category?.color || "#6B7280",
                    color: "white",
                  }}
                  title={post.content}
                >
                  {post.content.substring(0, 25)}...
                </div>
              )
            })}
            {posts.length > 3 && (
              <div className="text-xs text-gray-500 font-medium bg-gray-100 rounded-md p-1 text-center">
                +{posts.length - 3} more
              </div>
            )}
          </div>
        </div>,
      )
    }

    return days
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Day Names Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-4 text-center text-sm font-semibold text-gray-700 border-r border-gray-200 last:border-r-0"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">{renderCalendarDays()}</div>
    </div>
  )
}
