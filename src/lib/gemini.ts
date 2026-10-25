import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn('Gemini API key not found. Trending topics feature will be disabled.');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface TrendingTopic {
  id: string;
  topic: string;
  description: string;
  category: 'Technology' | 'Business' | 'Leadership' | 'Industry' | 'Career' | 'Innovation';
  hashtags: string[];
  contentSuggestion: string;
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

export class GeminiService {
  private model = genAI?.getGenerativeModel({ model: 'gemini-1.5-flash' });

  async getTrendingTopics(): Promise<TrendingTopic[]> {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment.');
    }

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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response to ensure it's valid JSON
      const cleanedText = text.trim().replace(/```json\n?/, '').replace(/```\n?/, '');
      const topics = JSON.parse(cleanedText);

      // Validate the structure and add unique IDs if missing
      return topics.map((topic: any, index: number) => ({
        id: topic.id || `topic-${Date.now()}-${index}`,
        topic: topic.topic || 'Trending Topic',
        description: topic.description || 'A trending professional topic',
        category: topic.category || 'Business',
        hashtags: Array.isArray(topic.hashtags) ? topic.hashtags : ['professional', 'linkedin'],
        contentSuggestion: topic.contentSuggestion || 'Share your thoughts on this trending topic'
      }));
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      throw new Error('Failed to fetch trending topics. Please try again later.');
    }
  }

  async generatePostContent(topic: TrendingTopic): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment.');
    }

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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating post content:', error);
      throw new Error('Failed to generate post content. Please try again later.');
    }
  }

  async refineContent(content: string, refinementType: RefinementType): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment.');
    }

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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
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
    if (!this.model) {
      throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment.');
    }

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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const imageDescription = response.text().trim();
      
      return this.generateImage(imageDescription, 'professional');
    } catch (error) {
      console.error('Error generating image from content:', error);
      throw new Error('Failed to generate image. Please try again later.');
    }
  }
}

export const geminiService = new GeminiService();
