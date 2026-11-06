import { describe, expect, it } from "vitest"
import { escapeHtml, formatLinkedInContent } from "./format-linkedin-content"

const HASHTAG = (tag: string) => `<span class="text-blue-600 font-medium">#${tag}</span>`
const MENTION = (name: string) => `<span class="text-blue-600 font-medium">@${name}</span>`
const LINK = (url: string) =>
  `<a href="${url}" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">${url}</a>`

// The tags the formatter is allowed to produce, with their exact attributes.
const ALLOWED_TAG =
  /<(?:strong|em|br|\/strong|\/em|\/span|\/a)>|<span class="text-blue-600 font-medium">|<a href="[^"<>]*" class="text-blue-600 underline" target="_blank" rel="noopener noreferrer">/g

/** Fails if the output contains any markup other than the formatter's own tags. */
function expectOnlyFormatterMarkup(html: string) {
  const rest = html.replace(ALLOWED_TAG, "")
  expect(rest).not.toMatch(/[<>]/)
}

describe("escapeHtml", () => {
  it("escapes the five HTML-significant characters", () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      "&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;",
    )
  })
})

describe("formatLinkedInContent", () => {
  it("returns an empty string for empty content", () => {
    expect(formatLinkedInContent("")).toBe("")
  })

  it("shows an HTML payload as text instead of running it", () => {
    const html = formatLinkedInContent("<img src=x onerror=alert(1)>")
    expect(html).toBe("&lt;img src=x onerror=alert(1)&gt;")
    expectOnlyFormatterMarkup(html)
  })

  it.each([
    "<script>alert(1)</script>",
    '<a href="javascript:alert(1)">click</a>',
    "<svg/onload=alert(1)>",
    "<iframe srcdoc='<script>alert(1)</script>'></iframe>",
    "**<img src=x onerror=alert(1)>** #tag<b>x</b> @me<i>",
    "*<style>body{display:none}</style>*",
    'https://example.com/"onmouseover="alert(1)',
    "https://example.com/<img src=x onerror=alert(1)>",
    "https://example.com/'onfocus='alert(1)",
  ])("never emits markup from the post text: %s", (input) => {
    expectOnlyFormatterMarkup(formatLinkedInContent(input))
  })

  it("keeps a link's href inside its quotes", () => {
    const html = formatLinkedInContent('see https://example.com/"onmouseover="alert(1) now')
    expect(html).toContain(LINK("https://example.com/"))
    expect(html).toContain("&quot;onmouseover=&quot;alert(1) now")
  })

  it("formats bold and italic", () => {
    expect(formatLinkedInContent("It got **3 likes** and *one* comment")).toBe(
      "It got <strong>3 likes</strong> and <em>one</em> comment",
    )
  })

  it("escapes text inside bold and italic", () => {
    expect(formatLinkedInContent("**a < b & c**")).toBe("<strong>a &lt; b &amp; c</strong>")
    expect(formatLinkedInContent("*<b>*")).toBe("<em>&lt;b&gt;</em>")
  })

  it("highlights hashtags and mentions, including inside bold", () => {
    expect(formatLinkedInContent("Thanks @alex! #writing #contentstrategy")).toBe(
      `Thanks ${MENTION("alex")}! ${HASHTAG("writing")} ${HASHTAG("contentstrategy")}`,
    )
    expect(formatLinkedInContent("**big #news**")).toBe(`<strong>big ${HASHTAG("news")}</strong>`)
    expect(formatLinkedInContent("#café")).toBe(HASHTAG("café"))
  })

  it("links http and https URLs and leaves trailing punctuation outside", () => {
    expect(formatLinkedInContent("Docs: https://example.com/docs?a=1&b=2.")).toBe(
      `Docs: ${LINK("https://example.com/docs?a=1&amp;b=2")}.`,
    )
    expect(formatLinkedInContent("ftp://example.com")).toBe("ftp://example.com")
  })

  it("does not turn # or @ inside a URL into a hashtag or mention", () => {
    expect(formatLinkedInContent("https://example.com/@team/page#section")).toBe(
      LINK("https://example.com/@team/page#section"),
    )
  })

  it("turns line breaks into <br> and keeps bullet lines as text", () => {
    expect(formatLinkedInContent("Line one\n\n• first\n• second\r\nend")).toBe(
      "Line one<br><br>• first<br>• second<br>end",
    )
  })

  it("leaves plain text alone apart from escaping", () => {
    expect(formatLinkedInContent("Tom & Jerry's \"show\" 5 > 3")).toBe(
      "Tom &amp; Jerry&#39;s &quot;show&quot; 5 &gt; 3",
    )
  })
})
