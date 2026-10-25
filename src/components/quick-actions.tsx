"use client"

import { Plus, Calendar, FileText, BarChart3 } from "lucide-react"

interface QuickActionsProps {
  onCreatePost: () => void
  onViewCalendar: () => void
  onViewPosts: () => void
  onViewAnalytics: () => void
}

export function QuickActions({ onCreatePost, onViewCalendar, onViewPosts, onViewAnalytics }: QuickActionsProps) {
  const actions = [
    {
      id: "create",
      label: "Create Post",
      icon: Plus,
      color: "bg-blue-600 hover:bg-blue-700",
      onClick: onCreatePost,
    },
    {
      id: "calendar",
      label: "View Calendar",
      icon: Calendar,
      color: "bg-green-600 hover:bg-green-700",
      onClick: onViewCalendar,
    },
    {
      id: "posts",
      label: "All Posts",
      icon: FileText,
      color: "bg-purple-600 hover:bg-purple-700",
      onClick: onViewPosts,
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      color: "bg-orange-600 hover:bg-orange-700",
      onClick: onViewAnalytics,
    },
  ]

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <p className="text-sm text-gray-600 mt-1">Common tasks and shortcuts</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`${action.color} text-white p-4 rounded-lg transition-colors flex flex-col items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
