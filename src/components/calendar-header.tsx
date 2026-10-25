"use client"

import { ChevronLeft, ChevronRight, Plus, CalendarIcon } from "lucide-react"

interface CalendarHeaderProps {
  currentDate: Date
  onNavigateMonth: (direction: "prev" | "next") => void
  onGoToToday: () => void
  onCreatePost: () => void
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function CalendarHeader({ currentDate, onNavigateMonth, onGoToToday, onCreatePost }: CalendarHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Calendar</h2>
          <p className="text-gray-600 mb-1">Schedule and manage your LinkedIn posts</p>
          <p className="text-sm text-gray-500">💡 Double-click any date to create a new post</p>
        </div>
        <button
          onClick={onCreatePost}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateMonth("prev")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => onNavigateMonth("next")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>

          <button
            onClick={onGoToToday}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <CalendarIcon className="w-4 h-4" />
            Today
          </button>
        </div>
      </div>
    </div>
  )
}
