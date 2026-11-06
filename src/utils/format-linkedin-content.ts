// Turns post text into HTML for the LinkedIn-style preview, which renders it with
// dangerouslySetInnerHTML. The text is tokenized first and every piece of user text
// is HTML-escaped before it is placed in the output, so markup typed into a post
// (for example `<img src=x onerror=alert(1)>`) shows up as text. The only tags in
// the output are the ones built here: <strong>, <em>, <span>, <a> and <br>.

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
}

export function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char])
}

// One alternative per kind of token. The leftmost match wins, so a URL is consumed
// whole before any "#" or "@" inside it could be read as a hashtag or mention.
const TOKEN =
  /(https?:\/\/[^\s<>"']+)|\*\*(.+?)\*\*|\*([^*\n]+?)\*|#([\p{L}\p{N}_]+)|@([\p{L}\p{N}_]+)/gu

// Punctuation that usually ends a sentence rather than a URL.
const TRAILING_PUNCTUATION = /[.,!?;:]+$/

const HIGHLIGHT = 'class="text-blue-600 font-medium"'

function formatInline(text: string): string {
  let html = ""
  let last = 0
  const pattern = new RegExp(TOKEN.source, TOKEN.flags)
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    const [whole, url, bold, italic, hashtag, mention] = match
    let token = whole
    let rendered: string

    if (url !== undefined) {
      token = url.replace(TRAILING_PUNCTUATION, "")
      pattern.lastIndex = match.index + token.length
      const href = escapeHtml(token)
      rendered = `<a href="${href}" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">${href}</a>`
    } else if (bold !== undefined) {
      rendered = `<strong>${formatInline(bold)}</strong>`
    } else if (italic !== undefined) {
      rendered = `<em>${formatInline(italic)}</em>`
    } else if (hashtag !== undefined) {
      rendered = `<span ${HIGHLIGHT}>#${escapeHtml(hashtag)}</span>`
    } else {
      rendered = `<span ${HIGHLIGHT}>@${escapeHtml(mention)}</span>`
    }

    html += escapeHtml(text.slice(last, match.index)) + rendered
    last = match.index + token.length
  }

  return html + escapeHtml(text.slice(last))
}

/**
 * Formats post text for the preview: **bold**, *italic*, #hashtags, @mentions,
 * http(s) links and line breaks. All other text is escaped.
 */
export function formatLinkedInContent(content: string): string {
  if (!content) return ""
  return content.replace(/\r\n?/g, "\n").split("\n").map(formatInline).join("<br>")
}
