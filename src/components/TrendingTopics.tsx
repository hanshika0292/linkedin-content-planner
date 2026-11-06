import { useEffect } from 'react';
import { TrendingUp, RefreshCw, Sparkles, Hash, ArrowRight, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useTrendingTopics } from '../hooks/useTrendingTopics';
import { TrendingTopic } from '../lib/gemini';

interface TrendingTopicsProps {
  onTopicSelect?: (topic: TrendingTopic) => void;
  showGenerateButton?: boolean;
  onImageGenerate?: (topic: TrendingTopic) => void;
}

const categoryColors = {
  Technology: 'bg-blue-100 text-blue-800 border-blue-200',
  Business: 'bg-green-100 text-green-800 border-green-200',
  Leadership: 'bg-purple-100 text-purple-800 border-purple-200',
  Industry: 'bg-orange-100 text-orange-800 border-orange-200',
  Career: 'bg-pink-100 text-pink-800 border-pink-200',
  Innovation: 'bg-indigo-100 text-indigo-800 border-indigo-200',
};

export function TrendingTopics({ onTopicSelect, showGenerateButton = false, onImageGenerate }: TrendingTopicsProps) {
  const { topics, loading, error, fetchTrendingTopics, generatePostContent, isGeneratingContent, generateImage, isGeneratingImage } = useTrendingTopics();

  useEffect(() => {
    // Auto-fetch topics on mount if not already loaded
    if (topics.length === 0 && !loading && !error) {
      fetchTrendingTopics();
    }
  }, [topics.length, loading, error, fetchTrendingTopics]);

  const handleTopicSelect = async (topic: TrendingTopic) => {
    if (onTopicSelect) {
      onTopicSelect(topic);
    }
  };

  const handleGenerateContent = async (topic: TrendingTopic) => {
    try {
      const content = await generatePostContent(topic);
      // You can handle the generated content here, maybe show it in a modal
      // or pass it to a callback
      console.log('Generated content:', content);
    } catch (error) {
      console.error('Failed to generate content:', error);
    }
  };

  const handleGenerateImage = async (topic: TrendingTopic) => {
    try {
      const imagePrompt = `Professional LinkedIn image for: ${topic.topic}. ${topic.description}`;
      const image = await generateImage(imagePrompt, 'professional');
      if (onImageGenerate) {
        onImageGenerate(topic);
      }
      console.log('Generated image:', image);
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  };

  if (error && topics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Trending Topics
          </h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-3">{error}</p>
            <button
              onClick={fetchTrendingTopics}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
          Trending Topics
          <span className="ml-2 text-sm font-normal text-gray-500">
            • Powered by Gemini AI
          </span>
        </h3>
        <button
          onClick={fetchTrendingTopics}
          disabled={loading}
          className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Refresh trending topics"
        >
          <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="p-6">
        {loading && topics.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600">Fetching trending topics...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div
                key={topic.id}
                className="group border border-gray-200 rounded-lg p-4 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => handleTopicSelect(topic)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 mr-2">#{index + 1}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryColors[topic.category]}`}>
                        {topic.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {topic.topic}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
                    
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <Hash className="w-3 h-3 text-gray-400" />
                      {topic.hashtags.slice(0, 3).map((hashtag, idx) => (
                        <span key={idx} className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {hashtag}
                        </span>
                      ))}
                      {topic.hashtags.length > 3 && (
                        <span className="text-xs text-gray-400">+{topic.hashtags.length - 3} more</span>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      <Sparkles className="w-3 h-3 inline mr-1" />
                      {topic.contentSuggestion}
                    </div>
                  </div>
                  
                  <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>

                {showGenerateButton && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateContent(topic);
                        }}
                        disabled={isGeneratingContent || isGeneratingImage}
                        className="flex items-center px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className={`w-4 h-4 mr-1 ${isGeneratingContent ? 'animate-pulse' : ''}`} />
                        {isGeneratingContent ? 'Generating...' : 'Generate Post'}
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGenerateImage(topic);
                        }}
                        disabled={isGeneratingContent || isGeneratingImage}
                        className="flex items-center px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ImageIcon className={`w-4 h-4 mr-1 ${isGeneratingImage ? 'animate-pulse' : ''}`} />
                        {isGeneratingImage ? 'Generating...' : 'Generate Image'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {error && topics.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && topics.length === 0 && !error && (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-3">No trending topics available</p>
            <button
              onClick={fetchTrendingTopics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Load Topics
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
