"use client"

import { useCallback } from "react"
import { FileText, Clock, CheckCircle2, TrendingUp } from "lucide-react"
import { useApp } from "../context/use-app"
import { useDashboardStats } from "../hooks/use-dashboard-stats"
import { StatsCard } from "./stats-card"
import { ActivityChart } from "./activity-chart"
import { UpcomingPostsCard } from "./upcoming-posts-card"
import { QuickActions } from "./quick-actions"
import { RecentPostsCard } from "./recent-posts-card"
import { TrendingTopics } from "./TrendingTopics"
import { TrendingTopic } from "../lib/gemini"
import type { Post } from "../types"

export function Dashboard() {
  const { posts, categories, dispatch } = useApp()
  const { stats, recentPosts, upcomingPosts, weeklyActivity } = useDashboardStats(posts.posts)

  const handleNavigateToSection = useCallback(
    (section: string) => {
      // Use the correct action type that exists in your AppContext
      if (section === "posts") {
        dispatch({ type: "SET_VIEW", payload: "posts" })
      } else if (section === "calendar") {
        dispatch({ type: "SET_VIEW", payload: "calendar" })
      }
      // For other sections, you might need to add navigation logic
      // or use a router if available
    },
    [dispatch],
  )

  const handleCreatePost = useCallback(() => {
    // This would open the post editor
    console.log("Create new post")
  }, [])

  const handleEditPost = useCallback((post: Post) => {
    // This would open the post editor with the selected post
    console.log("Edit post:", post.id)
  }, [])

  const handleTopicSelect = useCallback((topic: TrendingTopic) => {
    // Navigate to posts view and potentially open post editor with the topic
    dispatch({ type: "SET_VIEW", payload: "posts" })
    console.log("Selected trending topic:", topic)
    // TODO: Pass the topic to the post editor when implemented
  }, [dispatch])

  const statsCards = [
    {
      title: "Total Posts",
      value: stats.total,
      icon: FileText,
      color: "bg-blue-600",
      onClick: () => handleNavigateToSection("posts"),
    },
    {
      title: "Drafts",
      value: stats.drafts,
      icon: FileText,
      color: "bg-yellow-600",
      onClick: () => handleNavigateToSection("posts"),
    },
    {
      title: "Scheduled",
      value: stats.scheduled,
      icon: Clock,
      color: "bg-orange-600",
      onClick: () => handleNavigateToSection("calendar"),
    },
    {
      title: "Published",
      value: stats.published,
      icon: CheckCircle2,
      color: "bg-green-600",
      onClick: () => handleNavigateToSection("posts"),
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Manage your LinkedIn content strategy and track your progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card, index) => (
          <StatsCard key={index} {...card} />
        ))}
      </div>

      {/* Activity Chart */}
      <div className="mb-8">
        <ActivityChart data={weeklyActivity} />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <UpcomingPostsCard posts={upcomingPosts} categories={categories.categories} onEditPost={handleEditPost} />
          <RecentPostsCard posts={recentPosts} categories={categories.categories} onEditPost={handleEditPost} />
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <QuickActions
            onCreatePost={handleCreatePost}
            onViewCalendar={() => handleNavigateToSection("calendar")}
            onViewPosts={() => handleNavigateToSection("posts")}
            onViewAnalytics={() => console.log("Navigate to analytics")} // Placeholder since analytics view doesn't exist yet
          />

          {/* Trending Topics */}
          <TrendingTopics onTopicSelect={handleTopicSelect} />

          {/* Additional Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                This Month
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Posts Created</span>
                <span className="text-lg font-semibold text-gray-900">{stats.thisMonth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="text-lg font-semibold text-gray-900">{stats.thisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Categories Used</span>
                <span className="text-lg font-semibold text-gray-900">{categories.categories.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
