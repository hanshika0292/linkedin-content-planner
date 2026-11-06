import type { GoogleGenAI } from '@google/genai';

/**
 * Gemini model used when VITE_GEMINI_MODEL is not set.
 * Current models: https://ai.google.dev/gemini-api/docs/models
 * Retirement dates: https://ai.google.dev/gemini-api/docs/deprecations
 */
export const DEFAULT_GEMINI_MODEL = 'gemini-3.8-flash';

/** Returns the configured model name, or the default when it is unset or blank. */
export function resolveGeminiModel(configured: string | undefined): string {
  const model = configured?.trim();
  return model ? model : DEFAULT_GEMINI_MODEL;
}

const NOT_CONFIGURED_MESSAGE = 'Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment.';

export const TOPIC_CATEGORIES = ['Technology', 'Business', 'Leadership', 'Industry', 'Career', 'Innovation'] as const;

export interface TrendingTopic {
  id: string;
  topic: string;
  description: string;
  category: (typeof TOPIC_CATEGORIES)[number];
  hashtags: string[];
  contentSuggestion: string;
}

type RawTopic = Partial<Record<keyof TrendingTopic, unknown>>;

const asText = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() ? value : fallback;

/**
 * Parses the model's reply to the trending-topics prompt: a JSON array,
 * optionally wrapped in a ```json code fence. Missing fields get defaults.
 */
export function parseTrendingTopics(text: string, now: number = Date.now()): TrendingTopic[] {
  const json = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '');
  const parsed: unknown = JSON.parse(json);
  if (!Array.isArray(parsed)) {
    throw new Error('Expected a JSON array of topics');
  }

  return parsed.map((item: unknown, index: number): TrendingTopic => {
    const topic: RawTopic = item && typeof item === 'object' ? (item as RawTopic) : {};
    const category = TOPIC_CATEGORIES.find((c) => c === topic.category) ?? 'Business';
    const hashtags = Array.isArray(topic.hashtags)
      ? topic.hashtags.filter((tag): tag is string => typeof tag === 'string')
      : ['professional', 'linkedin'];
    return {
      id: asText(topic.id, `topic-${now}-${index}`),
      topic: asText(topic.topic, 'Trending Topic'),
      description: asText(topic.description, 'A trending professional topic'),
      category,
      hashtags,
      contentSuggestion: asText(topic.contentSuggestion, 'Share your thoughts on this trending topic'),
    };
  });
}

export interface GeneratedImage {
  id: string;
  url: string;
  alt: string;
  prompt: string;
  style?: string;
}

export type RefinementType = 
  | 'improve_clarity'
  | 'make_engaging'
  | 'professional_tone'
  | 'add_storytelling'
  | 'include_call_to_action'
  | 'optimize_hashtags'
  | 'shorten_content'
  | 'expand_content';

export interface RefinementOption {
  type: RefinementType;
  label: string;
  description: string;
  icon: string;
}

export const REFINEMENT_OPTIONS: RefinementOption[] = [
  {
    type: 'improve_clarity',
    label: 'Improve Clarity',
    description: 'Make the content clearer and easier to understand',
    icon: '🔍'
  },
  {
    type: 'make_engaging',
    label: 'Make More Engaging',
    description: 'Add hooks and engaging elements to capture attention',
    icon: '✨'
  },
  {
    type: 'professional_tone',
    label: 'Professional Tone',
    description: 'Adjust tone to be more professional and business-appropriate',
    icon: '💼'
  },
  {
    type: 'add_storytelling',
    label: 'Add Storytelling',
    description: 'Incorporate narrative elements and personal experiences',
    icon: '📖'
  },
  {
    type: 'include_call_to_action',
    label: 'Add Call-to-Action',
    description: 'Include compelling calls-to-action for engagement',
    icon: '📢'
  },
  {
    type: 'optimize_hashtags',
    label: 'Optimize Hashtags',
    description: 'Improve and optimize hashtag selection and placement',
    icon: '#️⃣'
  },
  {
    type: 'shorten_content',
    label: 'Make Concise',
    description: 'Condense content while maintaining key messages',
    icon: '✂️'
  },
  {
    type: 'expand_content',
    label: 'Add More Detail',
    description: 'Expand with more examples, insights, and details',
    icon: '📝'
  }
];

export interface GeminiServiceOptions {
  apiKey?: string;
  /** Model name; blank or missing falls back to DEFAULT_GEMINI_MODEL. */
  model?: string;
}

export class GeminiService {
  private readonly apiKey: string | undefined;
  private client: Promise<GoogleGenAI> | null = null;
  readonly model: string;

  constructor({ apiKey, model }: GeminiServiceOptions = {}) {
    this.apiKey = apiKey || undefined;
    this.model = resolveGeminiModel(model);
  }

  /** Throws the "not configured" error (shown as-is in the UI) when there is no API key. */
  private requireClient(): string {
    if (!this.apiKey) {
      throw new Error(NOT_CONFIGURED_MESSAGE);
    }
    return this.apiKey;
  }

  /**
   * The SDK is loaded on first use, in its own chunk, so the main bundle stays small
   * for anyone who never opens an AI feature.
   */
  private getClient(): Promise<GoogleGenAI> {
    const apiKey = this.requireClient();
    if (!this.client) {
      this.client = import('@google/genai').then(
        ({ GoogleGenAI }) => new GoogleGenAI({ apiKey }),
        (error: unknown) => {
          this.client = null; // allow a retry after a failed chunk load
          throw error;
        },
      );
    }
    return this.client;
  }

  /** Sends one text prompt and returns the reply text (the SDK leaves out thinking parts). */
  private async generateText(prompt: string): Promise<string> {
    const client = await this.getClient();
    const response = await client.models.generateContent({
      model: this.model,
      contents: prompt,
    });
    const text = response.text;
    if (!text) {
      const reason = response.candidates?.[0]?.finishReason ?? response.promptFeedback?.blockReason ?? 'unknown';
      throw new Error(`Gemini returned no text (reason: ${reason})`);
    }
    return text;
  }

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    this.requireClient();

    const today = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const prompt = `Generate 10 trending professional topics that would be great for LinkedIn posts today (${today}). 
    Focus on current events, industry trends, professional development, and business insights that professionals would engage with.

    For each topic, provide:
    1. A compelling topic title (max 80 characters)
    2. A brief description explaining why it's trending (max 150 characters)
    3. A category from: Technology, Business, Leadership, Industry, Career, Innovation
    4. 3-5 relevant hashtags (without # symbol)
    5. A content suggestion for the post (max 200 characters)

    Format your response as a JSON array with this exact structure:
    [
      {
        "id": "unique-id",
        "topic": "Topic Title",
        "description": "Why this is trending",
        "category": "Technology",
        "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
        "contentSuggestion": "Suggested content approach"
      }
    ]

    Ensure topics are:
    - Relevant to professionals across industries
    - Current and timely
    - Engaging and discussion-worthy
    - Appropriate for LinkedIn's professional audience
    - Diverse across different categories

    Return only the JSON array, no additional text.`;

    try {
      const text = await this.generateText(prompt);
      return parseTrendingTopics(text);
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw new Error('Failed to fetch trending topics. Please try again later.');
    }
  }

  async generatePostContent(topic: TrendingTopic): Promise<string> {
    this.requireClient();

    const prompt = `Create a professional LinkedIn post about "${topic.topic}". 
    
    Context: ${topic.description}
    Content suggestion: ${topic.contentSuggestion}
    Category: ${topic.category}
    
    Write a compelling LinkedIn post that:
    - Is 150-300 words long
    - Starts with a hook to grab attention
    - Provides valuable insights or perspective
    - Encourages engagement through questions or calls to action
    - Uses a professional yet conversational tone
    - Includes 3-5 relevant hashtags at the end
    - Has proper line breaks for readability
    
    Make it authentic and engaging, suitable for a professional audience.`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating post content:', error);
      throw new Error('Failed to generate post content. Please try again later.');
    }
  }

  async refineContent(content: string, refinementType: RefinementType): Promise<string> {
    this.requireClient();

    const refinementInstructions = {
      improve_clarity: 'Make the content clearer, more concise, and easier to understand. Remove jargon and complex sentences.',
      make_engaging: 'Add engaging hooks, compelling questions, and elements that will capture the reader\'s attention. Make it more conversational.',
      professional_tone: 'Adjust the tone to be more professional and business-appropriate while maintaining authenticity.',
      add_storytelling: 'Incorporate storytelling elements, personal anecdotes, or narrative structure to make it more compelling.',
      include_call_to_action: 'Add strong call-to-action elements that encourage comments, shares, and engagement.',
      optimize_hashtags: 'Improve the hashtag selection and placement. Use relevant, trending, and industry-specific hashtags.',
      shorten_content: 'Condense the content to be more concise while maintaining all key messages and impact.',
      expand_content: 'Expand the content with more details, examples, insights, and supporting information.'
    };

    const instruction = refinementInstructions[refinementType];
    const prompt = `Please refine the following LinkedIn post content based on this instruction: "${instruction}"

    Original Content:
    ${content}

    Requirements:
    - Maintain the core message and intent
    - Keep it suitable for LinkedIn's professional audience
    - Ensure proper formatting with line breaks
    - Include appropriate hashtags (3-5)
    - Make it engaging and authentic
    - Keep within 200-400 words

    Return only the refined content:`;

    try {
      return (await this.generateText(prompt)).trim();
    } catch (error) {
      console.error('Error refining content:', error);
      throw new Error('Failed to refine content. Please try again later.');
    }
  }

  async generateImage(prompt: string, style: string = 'professional'): Promise<GeneratedImage> {
    // Note: Gemini doesn't directly support image generation yet
    // This is a placeholder for when image generation becomes available
    // For now, we'll simulate with a placeholder service
    
    try {
      // Simulate image generation (replace with actual Gemini image API when available)
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const placeholderUrl = `https://picsum.photos/800/600?random=${imageId}`;
      
      return {
        id: imageId,
        url: placeholderUrl,
        alt: `AI-generated image: ${prompt}`,
        prompt,
        style
      };
    } catch (error) {
      console.error('Error generating image:', error);
      throw new Error('Failed to generate image. Please try again later.');
    }
  }

  async generateImageFromContent(content: string): Promise<GeneratedImage> {
    this.requireClient();

    // Generate an image description based on the post content
    const prompt = `Based on this LinkedIn post content, create a detailed description for a professional image that would complement the post:

    Content:
    ${content}

    Create a description for a professional, business-appropriate image that:
    - Relates to the main topic or theme
    - Would be suitable for LinkedIn
    - Is visually appealing and engaging
    - Represents the concepts discussed
    - Has a clean, modern aesthetic

    Return only a concise image description (max 100 words):`;

    try {
      const imageDescription = (await this.generateText(prompt)).trim();

      return this.generateImage(imageDescription, 'professional');
    } catch (error) {
      console.error('Error generating image from content:', error);
      throw new Error('Failed to generate image. Please try again later.');
    }
  }
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Gemini API key not found. Trending topics feature will be disabled.');
}

export const geminiService = new GeminiService({
  apiKey,
  model: import.meta.env.VITE_GEMINI_MODEL,
});
