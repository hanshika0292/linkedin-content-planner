"use client"

import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
  onClick?: () => void
}

export function StatsCard({ title, value, icon: Icon, color, trend, onClick }: StatsCardProps) {
  return (
    <div
      className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 transition-all hover:shadow-md ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
          </div>
        </div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </div>
        )}
      </div>
    </div>
  )
}
