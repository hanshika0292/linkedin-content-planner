export function formatLinkedInContent(content: string): string {
  if (!content) return ""

  const formatted = content
    // Convert **bold** to HTML
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Convert *italic* to HTML
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Convert hashtags to blue links
    .replace(/#(\w+)/g, '<span class="text-blue-600 font-medium">#$1</span>')
    // Convert mentions to blue links
    .replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>')
    // Convert URLs to links
    .replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">$1</a>',
    )
    // Convert line breaks to HTML
    .replace(/\n/g, "<br>")
    // Convert bullet points
    .replace(
      /^• (.+)$/gm,
      '<div class="flex items-start gap-2 my-1"><span class="text-gray-600 mt-1">•</span><span>$1</span></div>',
    )

  return formatted
}
