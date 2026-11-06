// Offline tests for the Gemini client: fetch is stubbed, so no request leaves the
// machine and no API key is needed. They check the request the SDK builds and how
// the reply is read, not the live API.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DEFAULT_GEMINI_MODEL, GeminiService, parseTrendingTopics, resolveGeminiModel } from "./gemini"

const FAKE_KEY = "test-key-not-real"
const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models"

function geminiReply(parts: Array<{ text: string; thought?: boolean }>, finishReason = "STOP") {
  return { candidates: [{ content: { role: "model", parts }, finishReason, index: 0 }] }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })
}

let fetchMock: ReturnType<typeof vi.fn>

beforeEach(() => {
  fetchMock = vi.fn()
  vi.stubGlobal("fetch", fetchMock)
  vi.spyOn(console, "error").mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

/** The URL, headers and JSON body of the nth fetch call. */
async function request(n = 0) {
  const [input, init] = fetchMock.mock.calls[n] as [RequestInfo | URL, RequestInit | undefined]
  const req = new Request(input, init)
  return { url: req.url, method: req.method, headers: req.headers, body: JSON.parse(await req.text()) }
}

describe("resolveGeminiModel", () => {
  it("uses the default when the setting is missing or blank", () => {
    expect(resolveGeminiModel(undefined)).toBe(DEFAULT_GEMINI_MODEL)
    expect(resolveGeminiModel("")).toBe(DEFAULT_GEMINI_MODEL)
    expect(resolveGeminiModel("   ")).toBe(DEFAULT_GEMINI_MODEL)
  })

  it("uses the configured model, trimmed", () => {
    expect(resolveGeminiModel(" gemini-3.6-flash ")).toBe("gemini-3.6-flash")
  })

  it("does not default to a retired 1.x model", () => {
    expect(DEFAULT_GEMINI_MODEL).not.toMatch(/^gemini-1\./)
  })
})

describe("GeminiService", () => {
  it("sends a generateContent request for the default model with the API key header", async () => {
    fetchMock.mockResolvedValue(jsonResponse(geminiReply([{ text: "  A clearer post.  " }])))
    const service = new GeminiService({ apiKey: FAKE_KEY })

    await expect(service.refineContent("My draft post", "improve_clarity")).resolves.toBe("A clearer post.")

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const { url, method, headers, body } = await request()
    expect(url).toBe(`${ENDPOINT}/${DEFAULT_GEMINI_MODEL}:generateContent`)
    expect(method).toBe("POST")
    expect(headers.get("x-goog-api-key")).toBe(FAKE_KEY)
    expect(headers.get("content-type")).toContain("application/json")
    expect(body.contents).toHaveLength(1)
    expect(body.contents[0].role).toBe("user")
    expect(body.contents[0].parts).toHaveLength(1)
    expect(body.contents[0].parts[0].text).toContain("My draft post")
    expect(body.contents[0].parts[0].text).toContain("Make the content clearer")
  })

  it("calls the model named in the settings", async () => {
    fetchMock.mockResolvedValue(jsonResponse(geminiReply([{ text: "ok" }])))
    const service = new GeminiService({ apiKey: FAKE_KEY, model: "gemini-3.6-flash" })

    await service.generatePostContent({
      id: "t1",
      topic: "Mentoring across time zones",
      description: "Distributed teams are rethinking mentoring.",
      category: "Leadership",
      hashtags: ["Mentoring"],
      contentSuggestion: "Describe a routine that works asynchronously.",
    })

    const { url, body } = await request()
    expect(url).toBe(`${ENDPOINT}/gemini-3.6-flash:generateContent`)
    expect(body.contents[0].parts[0].text).toContain('"Mentoring across time zones"')
  })

  it("leaves thinking parts out of the reply text", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(geminiReply([{ text: "Let me think about this...", thought: true }, { text: "Final answer" }])),
    )
    const service = new GeminiService({ apiKey: FAKE_KEY })
    await expect(service.refineContent("x", "shorten_content")).resolves.toBe("Final answer")
  })

  it("parses trending topics from a fenced JSON reply", async () => {
    const topics = [
      {
        id: "a",
        topic: "Skills-based hiring",
        description: "More job posts list skills.",
        category: "Career",
        hashtags: ["Hiring"],
        contentSuggestion: "Explain how you assess skills.",
      },
    ]
    fetchMock.mockResolvedValue(jsonResponse(geminiReply([{ text: "```json\n" + JSON.stringify(topics) + "\n```" }])))
    const service = new GeminiService({ apiKey: FAKE_KEY })

    await expect(service.getTrendingTopics()).resolves.toEqual(topics)
    const { body } = await request()
    expect(body.contents[0].parts[0].text).toContain("Generate 10 trending professional topics")
  })

  it("reports a friendly error when the API call fails", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 404, message: "models/x is not found", status: "NOT_FOUND" } }, 404),
    )
    const service = new GeminiService({ apiKey: FAKE_KEY, model: "x" })
    await expect(service.refineContent("x", "improve_clarity")).rejects.toThrow(
      "Failed to refine content. Please try again later.",
    )
  })

  it("reports a friendly error when the reply has no text", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ candidates: [{ finishReason: "SAFETY", index: 0 }] }))
    const service = new GeminiService({ apiKey: FAKE_KEY })
    await expect(service.generateImageFromContent("x")).rejects.toThrow("Failed to generate image.")
  })

  it("explains the missing key without calling the API", async () => {
    const service = new GeminiService({})
    await expect(service.getTrendingTopics()).rejects.toThrow("Gemini API not configured")
    await expect(service.refineContent("x", "improve_clarity")).rejects.toThrow("Gemini API not configured")
    expect(fetchMock).not.toHaveBeenCalled()
  })
})

describe("parseTrendingTopics", () => {
  it("fills in missing fields and replaces an unknown category", () => {
    const [topic] = parseTrendingTopics('[{"topic":"Remote work","category":"Sports","hashtags":"nope"}]', 42)
    expect(topic).toEqual({
      id: "topic-42-0",
      topic: "Remote work",
      description: "A trending professional topic",
      category: "Business",
      hashtags: ["professional", "linkedin"],
      contentSuggestion: "Share your thoughts on this trending topic",
    })
  })

  it("rejects a reply that is not a JSON array", () => {
    expect(() => parseTrendingTopics('{"topic":"x"}')).toThrow("Expected a JSON array")
    expect(() => parseTrendingTopics("Sorry, I can't help with that.")).toThrow()
  })
})
