"use client"

import { useState, useCallback } from "react"
import { useApp } from "../context/AppContext"
import { PostEditor } from "./PostEditor"
import type { Post } from "../types"
import { useCalendar } from "../hooks/use-calendar"
import { useCalendarPosts } from "../hooks/use-calendar-posts"
import { CalendarHeader } from "./calendar-header"
import { CalendarGrid } from "./calendar-grid"
import { SelectedDatePosts } from "./selected-date-posts"

export function Calendar() {
  const { state, dispatch, posts, categories } = useApp()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | undefined>()
  const [selectedDateForNewPost, setSelectedDateForNewPost] = useState<string | undefined>()

  const { daysInMonth, firstDay, todayKey, formatDateKey, createDateFromDay, navigateMonth, goToToday } =
    useCalendar(currentDate)

  const { getPostsForDate } = useCalendarPosts(posts.posts)

  const handleDateClick = useCallback(
    (day: number) => {
      const clickedDate = createDateFromDay(day)
      const dateKey = formatDateKey(clickedDate)
      dispatch({ type: "SET_SELECTED_DATE", payload: dateKey })
    },
    [createDateFromDay, formatDateKey, dispatch],
  )
  
  const handleDateDoubleClick = useCallback(
    (day: number) => {
      const clickedDate = createDateFromDay(day)
      const dateKey = formatDateKey(clickedDate)
      setSelectedDateForNewPost(dateKey)
      setEditingPost(undefined)
      setShowEditor(true)
    },
    [createDateFromDay, formatDateKey],
  )

  const handleNavigateMonth = useCallback(
    (direction: "prev" | "next") => {
      setCurrentDate(navigateMonth(direction))
    },
    [navigateMonth],
  )

  const handleGoToToday = useCallback(() => {
    setCurrentDate(goToToday())
    const todayKey = formatDateKey(new Date())
    dispatch({ type: "SET_SELECTED_DATE", payload: todayKey })
  }, [goToToday, formatDateKey, dispatch])

  const handleCreatePost = useCallback((dateKey?: string) => {
    setEditingPost(undefined)
    setSelectedDateForNewPost(dateKey)
    setShowEditor(true)
  }, [])

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post)
    setShowEditor(true)
  }, [])

  const handleSavePost = useCallback(
    (postData: Omit<Post, "id">) => {
      if (editingPost) {
        posts.updatePost({ ...postData, id: editingPost.id })
      } else {
        posts.addPost(postData)
      }
      setShowEditor(false)
      setEditingPost(undefined)
    },
    [editingPost, posts],
  )

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false)
    setEditingPost(undefined)
    setSelectedDateForNewPost(undefined)
  }, [])

  const selectedDatePosts = state.selectedDate ? getPostsForDate(state.selectedDate) : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CalendarHeader
        currentDate={currentDate}
        onNavigateMonth={handleNavigateMonth}
        onGoToToday={handleGoToToday}
        onCreatePost={handleCreatePost}
      />

      <CalendarGrid
        daysInMonth={daysInMonth}
        firstDay={firstDay}
        currentDate={currentDate}
        todayKey={todayKey}
        selectedDate={state.selectedDate}
        getPostsForDate={getPostsForDate}
        categories={categories.categories}
        onDateClick={handleDateClick}
        onDateDoubleClick={handleDateDoubleClick}
        onEditPost={handleEditPost}
        formatDateKey={formatDateKey}
        createDateFromDay={createDateFromDay}
      />

      {state.selectedDate && (
        <SelectedDatePosts
          selectedDate={state.selectedDate}
          posts={selectedDatePosts}
          categories={categories.categories}
          onEditPost={handleEditPost}
          onCreatePost={() => handleCreatePost(state.selectedDate)}
        />
      )}

      {showEditor && (
        <PostEditor 
          post={editingPost} 
          selectedDateForScheduling={selectedDateForNewPost}
          onClose={handleCloseEditor} 
          onSave={handleSavePost} 
        />
      )}
    </div>
  )
}
