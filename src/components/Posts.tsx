"use client"

import { useState, useCallback } from "react"
import { useApp } from "../context/AppContext"
import { PostEditor } from "./PostEditor"
import type { Post, PostFilter } from "../types"
import { usePostsFilter } from "../hooks/use-post-filters"
import { usePostActions } from "../hooks/use-post-actions"
import { PostsHeader } from "./posts-header"
import { PostsFilters } from "./posts-filters"
import { PostsGrid } from "./posts-grid"
import { EmptyState } from "./empty-state"

export function Posts() {
  const { state, dispatch, posts, categories } = useApp()
  const [showEditor, setShowEditor] = useState(false)
  const [editingPost, setEditingPost] = useState<Post | undefined>()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")

  const { handleSavePost, handleDeletePost, handleDuplicatePost, handlePublishPost } = usePostActions({ posts })

  const filteredPosts = usePostsFilter({
    posts: posts.posts,
    searchTerm,
    statusFilter: state.postFilter,
    categoryFilter: filterCategory,
  })

  const handleCreatePost = useCallback(() => {
    setEditingPost(undefined)
    setShowEditor(true)
  }, [])

  const handleEditPost = useCallback((post: Post) => {
    setEditingPost(post)
    setShowEditor(true)
  }, [])

  const handleCloseEditor = useCallback(() => {
    setShowEditor(false)
    setEditingPost(undefined)
  }, [])

  const handleSave = useCallback(
    (postData: Omit<Post, "id">) => {
      handleSavePost(postData, editingPost)
      handleCloseEditor()
    },
    [handleSavePost, editingPost, handleCloseEditor],
  )

  const handleStatusFilterChange = useCallback(
    (value: PostFilter) => {
      dispatch({ type: "SET_POST_FILTER", payload: value })
    },
    [dispatch],
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PostsHeader onCreatePost={handleCreatePost} />

      <PostsFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={state.postFilter}
        onStatusFilterChange={handleStatusFilterChange}
        categoryFilter={filterCategory}
        onCategoryFilterChange={setFilterCategory}
        categories={categories.categories}
      />

      {filteredPosts.length > 0 ? (
        <PostsGrid
          posts={filteredPosts}
          onEdit={handleEditPost}
          onDelete={handleDeletePost}
          onDuplicate={handleDuplicatePost}
          onPublish={handlePublishPost}
        />
      ) : (
        <EmptyState hasAnyPosts={posts.posts.length > 0} onCreatePost={handleCreatePost} />
      )}

      {showEditor && <PostEditor post={editingPost} onClose={handleCloseEditor} onSave={handleSave} />}
    </div>
  )
}
