"use client"

import { useState, useCallback, useEffect } from "react"
import { Save, X, Calendar, Tag, Eye, EyeOff, Sparkles, TrendingUp, Image as ImageIcon, Wand2 } from "lucide-react"
import { useApp } from "../context/use-app"
import type { Post } from "../types"
import { TrendingTopic, GeneratedImage } from "../lib/gemini"
import { useTrendingTopics } from "../hooks/useTrendingTopics"
import { useTextFormatting } from "../hooks/use-text-formatting"
import { FormattingToolbar } from "./formatting-toolbar"
import { CharacterCounter } from "./character-counter"
import { LinkedInPostPreview } from "./linkedin-post-preview"
import { TrendingTopics } from "./TrendingTopics"
import { ContentRefinement } from "./ContentRefinement"
import { ImageGenerator } from "./ImageGenerator"
import { scheduledDateToInputValue, getMinScheduleTime } from "../utils/date-utils"

interface PostEditorProps {
  post?: Post
  selectedTopic?: TrendingTopic
  selectedDateForScheduling?: string
  onClose: () => void
  onSave: (post: Omit<Post, "id">) => void
}

const MAX_CHARACTERS = 3000

export function PostEditor({ post, selectedTopic, selectedDateForScheduling, onClose, onSave }: PostEditorProps) {
  const { categories } = useApp()
  const { textareaRef, insertAtCursor, formatSelectedText } = useTextFormatting()
  const { generatePostContent, isGeneratingContent } = useTrendingTopics()

  const [content, setContent] = useState(post?.content || "")
  const [category, setCategory] = useState(post?.category || categories.categories[0]?.id || "")
  const [scheduledDate, setScheduledDate] = useState(
    post?.scheduledDate ? scheduledDateToInputValue(post.scheduledDate) :
    selectedDateForScheduling ? `${selectedDateForScheduling}T09:00` : ""
  )
  const [status, setStatus] = useState<"draft" | "scheduled">(
    post?.status === "published" ? "scheduled" : 
    selectedDateForScheduling ? "scheduled" :
    post?.status || "draft",
  )
  const [showPreview, setShowPreview] = useState(true)
  const [showTrendingTopics, setShowTrendingTopics] = useState(!!selectedTopic)
  const [showContentRefinement, setShowContentRefinement] = useState(false)
  const [showImageGenerator, setShowImageGenerator] = useState(false)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)

  const handleSave = useCallback(() => {
    if (!content.trim()) return

    const postData = {
      content: content.trim(),
      category,
      scheduledDate: status === "scheduled" && scheduledDate ? scheduledDate : undefined,
      status,
      createdAt: post?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      media: selectedImage ? {
        type: 'image' as const,
        url: selectedImage.url,
        alt: selectedImage.alt,
        isAiGenerated: true,
        aiPrompt: selectedImage.prompt,
        aiStyle: selectedImage.style
      } : post?.media,
    }

    onSave(postData)
  }, [content, category, scheduledDate, status, post?.createdAt, post?.media, selectedImage, onSave])

  const handleFormat = useCallback(
    (type: string) => {
      let newContent = content

      switch (type) {
        case "bold":
          newContent = formatSelectedText("**")
          break
        case "italic":
          newContent = formatSelectedText("*")
          break
        case "list":
          newContent = insertAtCursor("• ")
          break
        case "hashtag":
          newContent = insertAtCursor("#")
          break
        case "mention":
          newContent = insertAtCursor("@")
          break
        case "link":
          newContent = formatSelectedText("[", "](url)")
          break
      }

      setContent(newContent)
    },
    [content, formatSelectedText, insertAtCursor],
  )

  const generateContentFromTopic = useCallback(async (topic: TrendingTopic) => {
    try {
      const generatedContent = await generatePostContent(topic)
      setContent(generatedContent)
    } catch (error) {
      console.error('Failed to generate content:', error)
      // Optionally show an error message to the user
    }
  }, [generatePostContent])

  const handleRefinedContent = useCallback((refinedContent: string) => {
    setContent(refinedContent)
    setShowContentRefinement(false)
  }, [])

  const handleImageSelect = useCallback((image: GeneratedImage) => {
    setSelectedImage(image)
    setShowImageGenerator(false)
  }, [])

  const handleRemoveImage = useCallback(() => {
    setSelectedImage(null)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "b":
            e.preventDefault()
            handleFormat("bold")
            break
          case "i":
            e.preventDefault()
            handleFormat("italic")
            break
          case "s":
            e.preventDefault()
            handleSave()
            break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleFormat, handleSave])

  // Generate content from selected topic on mount
  useEffect(() => {
    if (selectedTopic && !post && !content) {
      generateContentFromTopic(selectedTopic)
    }
  }, [selectedTopic, post, content, generateContentFromTopic])

  const isOverLimit = content.length > MAX_CHARACTERS
  const canSave = content.trim() && !isOverLimit

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[95vh] flex flex-col shadow-2xl">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{post ? "Edit Post" : "Create New Post"}</h2>
            <p className="text-sm text-gray-500 mt-1">Share your thoughts with your LinkedIn network</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Editor Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Formatting Toolbar */}
            <div className="mb-4">
              <FormattingToolbar onFormat={handleFormat} disabled={!textareaRef.current} />
            </div>

            {/* AI Actions Toolbar */}
            <div className="mb-4 flex items-center gap-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
              <div className="flex items-center text-sm text-gray-700 mr-3">
                <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
                <span className="font-medium">AI Tools:</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {content.trim() && (
                  <button
                    onClick={() => setShowContentRefinement(true)}
                    className="flex items-center px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                  >
                    <Wand2 className="w-3 h-3 mr-1" />
                    Refine Content
                  </button>
                )}
                
                <button
                  onClick={() => setShowImageGenerator(true)}
                  className="flex items-center px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  <ImageIcon className="w-3 h-3 mr-1" />
                  Generate Image
                </button>
                
                {!selectedTopic && (
                  <button
                    onClick={() => setShowTrendingTopics(!showTrendingTopics)}
                    className="flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Trending Topics
                  </button>
                )}
              </div>
            </div>

            {/* Trending Topic Section */}
            {selectedTopic && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-blue-900 mb-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Selected Trending Topic
                    </h4>
                    <p className="text-blue-800 font-medium mb-1">{selectedTopic.topic}</p>
                    <p className="text-blue-700 text-sm mb-2">{selectedTopic.description}</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => generateContentFromTopic(selectedTopic)}
                        disabled={isGeneratingContent}
                        className="flex items-center px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Sparkles className={`w-3 h-3 mr-1 ${isGeneratingContent ? 'animate-pulse' : ''}`} />
                        {isGeneratingContent ? 'Generating...' : 'Generate Content'}
                      </button>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {selectedTopic.category}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!selectedTopic && (
              <div className="mb-4">
                <button
                  onClick={() => setShowTrendingTopics(!showTrendingTopics)}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {showTrendingTopics ? 'Hide' : 'Show'} Trending Topics
                </button>
              </div>
            )}

            {/* Trending Topics List */}
            {showTrendingTopics && !selectedTopic && (
              <div className="mb-4">
                <TrendingTopics 
                  onTopicSelect={(topic) => {
                    generateContentFromTopic(topic)
                    setShowTrendingTopics(false)
                  }} 
                  showGenerateButton={false}
                />
              </div>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-green-800 flex items-center">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    AI Generated Image
                  </h4>
                  <button
                    onClick={handleRemoveImage}
                    className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-start gap-3">
                  <img
                    src={selectedImage.url}
                    alt={selectedImage.alt}
                    className="w-20 h-20 object-cover rounded-lg border border-green-300"
                  />
                  <div className="flex-1 text-xs text-green-700">
                    <div className="mb-1">
                      <strong>Style:</strong> {selectedImage.style}
                    </div>
                    <div className="text-green-600 line-clamp-2">
                      <strong>Prompt:</strong> {selectedImage.prompt}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Content Editor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">What do you want to talk about?</label>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, insights, or updates with your network...\n\nTips:\n• Use emojis to add personality 😊\n• Include relevant hashtags #linkedin\n• Tag people or companies @company\n• Share your authentic voice and insights"
                className="w-full h-72 p-6 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400 resize-none text-lg leading-relaxed shadow-sm transition-all duration-200 hover:shadow-md hover:border-gray-300"
                style={{ 
                  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
                  lineHeight: "1.7"
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <CharacterCounter current={content.length} max={MAX_CHARACTERS} />
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors lg:hidden"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? "Hide Preview" : "Show Preview"}
                </button>
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Publishing Options</label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="draft"
                    checked={status === "draft"}
                    onChange={(e) => setStatus(e.target.value as "draft")}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Save as Draft</div>
                    <div className="text-sm text-gray-500">Save for later editing</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    value="scheduled"
                    checked={status === "scheduled"}
                    onChange={(e) => setStatus(e.target.value as "scheduled")}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium">Schedule Post</div>
                    <div className="text-sm text-gray-500">Choose when to publish</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Schedule Date */}
            {status === "scheduled" && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Schedule Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={getMinScheduleTime()}
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-400 shadow-sm transition-all"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Uses your device's time zone
                </p>
              </div>
            )}
          </div>

          {/* Preview Section */}
          {showPreview && (
            <div className="lg:w-[420px] xl:w-[480px] border-l border-gray-200 p-6 bg-gradient-to-b from-gray-50 to-gray-100 overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-b from-gray-50 to-gray-100 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  LinkedIn Preview
                </h3>
                <p className="text-sm text-gray-600 mt-1">See how your post will look on LinkedIn</p>
              </div>
              <LinkedInPostPreview content={content} />
            </div>
          )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="text-sm text-gray-500">
            {isOverLimit && <span className="text-red-600 font-medium">Content exceeds character limit</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {post ? "Update Post" : "Save Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Content Refinement Modal */}
      {showContentRefinement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ContentRefinement
              content={content}
              onRefinedContent={handleRefinedContent}
              onClose={() => setShowContentRefinement(false)}
            />
          </div>
        </div>
      )}

      {/* Image Generator Modal */}
      {showImageGenerator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <ImageGenerator
              content={content}
              onImageSelect={handleImageSelect}
              onClose={() => setShowImageGenerator(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
