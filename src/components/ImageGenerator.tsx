import React, { useState } from 'react';
import { Image, Sparkles, RefreshCw, Download, Eye, X, Palette } from 'lucide-react';
import { GeneratedImage } from '../lib/gemini';
import { useTrendingTopics } from '../hooks/useTrendingTopics';

interface ImageGeneratorProps {
  content?: string;
  onImageSelect: (image: GeneratedImage) => void;
  onClose?: () => void;
  className?: string;
}

const imageStyles = [
  { value: 'professional', label: 'Professional', description: 'Clean, modern business style' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and clean design' },
  { value: 'corporate', label: 'Corporate', description: 'Formal business aesthetic' },
  { value: 'creative', label: 'Creative', description: 'Artistic and innovative' },
  { value: 'tech', label: 'Tech', description: 'Modern technology focused' },
  { value: 'abstract', label: 'Abstract', description: 'Conceptual and artistic' }
];

export function ImageGenerator({ content, onImageSelect, onClose, className = '' }: ImageGeneratorProps) {
  const { generateImage, generateImageFromContent, isGeneratingImage, error } = useTrendingTopics();
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('professional');
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [mode, setMode] = useState<'auto' | 'custom'>(content ? 'auto' : 'custom');

  const handleGenerateFromContent = async () => {
    if (!content) return;
    
    try {
      const image = await generateImageFromContent(content);
      setGeneratedImages([image, ...generatedImages]);
      setSelectedImageId(image.id);
    } catch (error) {
      console.error('Failed to generate image from content:', error);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!customPrompt.trim()) return;
    
    try {
      const image = await generateImage(customPrompt, selectedStyle);
      setGeneratedImages([image, ...generatedImages]);
      setSelectedImageId(image.id);
    } catch (error) {
      console.error('Failed to generate image from prompt:', error);
    }
  };

  const handleSelectImage = () => {
    const selectedImage = generatedImages.find(img => img.id === selectedImageId);
    if (selectedImage) {
      onImageSelect(selectedImage);
      onClose?.();
    }
  };

  const selectedImage = generatedImages.find(img => img.id === selectedImageId);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Image className="w-5 h-5 mr-2 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Image Generator</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-4">
        {/* Mode Selection */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          {content && (
            <button
              onClick={() => setMode('auto')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                mode === 'auto' 
                  ? 'bg-white text-green-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Sparkles className="w-4 h-4 inline mr-1" />
              From Content
            </button>
          )}
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              mode === 'custom' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Palette className="w-4 h-4 inline mr-1" />
            Custom Prompt
          </button>
        </div>

        {/* Auto Generation from Content */}
        {mode === 'auto' && content && (
          <div className="mb-4">
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Post Content</h4>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 max-h-20 overflow-y-auto">
                {content}
              </div>
            </div>
            <button
              onClick={handleGenerateFromContent}
              disabled={isGeneratingImage}
              className="w-full flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Image from Content
                </>
              )}
            </button>
          </div>
        )}

        {/* Custom Prompt Generation */}
        {mode === 'custom' && (
          <div className="mb-4">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe the image you want
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="e.g., A modern office workspace with diverse professionals collaborating..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Style</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {imageStyles.map((style) => (
                  <button
                    key={style.value}
                    onClick={() => setSelectedStyle(style.value)}
                    className={`p-3 border rounded-lg text-left transition-all ${
                      selectedStyle === style.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-200 hover:bg-green-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{style.label}</div>
                    <div className="text-xs text-gray-600">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerateFromPrompt}
              disabled={isGeneratingImage || !customPrompt.trim()}
              className="w-full flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGeneratingImage ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <Image className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </button>
          </div>
        )}

        {/* Generated Images */}
        {generatedImages.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Generated Images</h4>
            <div className="grid grid-cols-2 gap-3">
              {generatedImages.map((image) => (
                <div
                  key={image.id}
                  className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedImageId === image.id
                      ? 'border-green-500 ring-2 ring-green-200'
                      : 'border-gray-200 hover:border-green-300'
                  }`}
                  onClick={() => setSelectedImageId(image.id)}
                >
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                    {selectedImageId === image.id && (
                      <div className="bg-green-500 text-white rounded-full p-1">
                        <Eye className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Image Preview */}
        {selectedImage && (
          <div className="mb-4 p-3 border border-green-200 rounded-lg bg-green-50">
            <h4 className="text-sm font-medium text-green-800 mb-2">Selected Image</h4>
            <div className="text-xs text-green-700 mb-2">
              <strong>Prompt:</strong> {selectedImage.prompt}
            </div>
            <div className="text-xs text-green-700">
              <strong>Style:</strong> {selectedImage.style}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {selectedImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectImage}
              className="flex-1 flex items-center justify-center py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Use This Image
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isGeneratingImage && (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">
                AI is creating your image...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
