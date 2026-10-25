"use client"
import { Search, Filter } from "lucide-react"
import type { PostFilter } from "../types"

interface PostsFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  statusFilter: PostFilter
  onStatusFilterChange: (value: PostFilter) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  categories: Array<{ id: string; name: string }>
}

export function PostsFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
}: PostsFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as PostFilter)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[140px]"
          >
            <option value="all">All Status</option>
            <option value="draft">Drafts</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryFilterChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all min-w-[160px]"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
