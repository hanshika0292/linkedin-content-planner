"use client"

import { formatLinkedInContent } from "../utils/format-linkedin-content"

interface LinkedInPostPreviewProps {
  content: string
  authorName?: string
  authorTitle?: string
}

export function LinkedInPostPreview({
  content,
  authorName = "Your Name",
  authorTitle = "Your Title",
}: LinkedInPostPreviewProps) {
  const formattedContent = formatLinkedInContent(content)

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
          {authorName.charAt(0)}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{authorName}</h4>
          <p className="text-sm text-gray-600">{authorTitle}</p>
          <p className="text-xs text-gray-500">Now</p>
        </div>
      </div>

      <div className="text-gray-900 leading-relaxed">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
        ) : (
          <p className="text-gray-400 italic">Your post preview will appear here...</p>
        )}
      </div>

      {content && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <button className="hover:text-blue-600 transition-colors">👍 Like</button>
            <button className="hover:text-blue-600 transition-colors">💬 Comment</button>
            <button className="hover:text-blue-600 transition-colors">🔄 Repost</button>
            <button className="hover:text-blue-600 transition-colors">📤 Send</button>
          </div>
        </div>
      )}
    </div>
  )
}
