import React, { useState } from 'react';
import { Sparkles, RefreshCw, Eye, EyeOff, ArrowRight, X } from 'lucide-react';
import { REFINEMENT_OPTIONS, RefinementType } from '../lib/gemini';
import { useTrendingTopics } from '../hooks/useTrendingTopics';

interface ContentRefinementProps {
  content: string;
  onRefinedContent: (refinedContent: string, refinementType: RefinementType) => void;
  onClose?: () => void;
  className?: string;
}

export function ContentRefinement({ content, onRefinedContent, onClose, className = '' }: ContentRefinementProps) {
  const { refineContent, isRefiningContent, error } = useTrendingTopics();
  const [selectedRefinement, setSelectedRefinement] = useState<RefinementType | null>(null);
  const [refinedContent, setRefinedContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  const handleRefine = async (refinementType: RefinementType) => {
    try {
      setSelectedRefinement(refinementType);
      setShowPreview(false);
      const refined = await refineContent(content, refinementType);
      setRefinedContent(refined);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to refine content:', error);
    }
  };

  const handleAcceptRefinement = () => {
    if (refinedContent && selectedRefinement) {
      onRefinedContent(refinedContent, selectedRefinement);
      onClose?.();
    }
  };

  const handleReject = () => {
    setRefinedContent('');
    setSelectedRefinement(null);
    setShowPreview(false);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Content Refinement</h3>
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
        {/* Original Content Preview */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Original Content</h4>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 max-h-32 overflow-y-auto">
            {content}
          </div>
        </div>

        {/* Refinement Options */}
        {!showPreview && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Refinement Type</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {REFINEMENT_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => handleRefine(option.type)}
                  disabled={isRefiningContent}
                  className="flex items-start p-3 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <span className="text-lg mr-3 group-hover:scale-110 transition-transform">
                    {option.icon}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 mb-1">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                  {isRefiningContent && selectedRefinement === option.type && (
                    <RefreshCw className="w-4 h-4 text-purple-600 animate-spin ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Refined Content Preview */}
        {showPreview && refinedContent && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                Refined Content
              </h4>
              <div className="flex items-center text-xs text-gray-500">
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {REFINEMENT_OPTIONS.find(opt => opt.type === selectedRefinement)?.icon}
                  <span className="ml-1">{REFINEMENT_OPTIONS.find(opt => opt.type === selectedRefinement)?.label}</span>
                </span>
              </div>
            </div>
            
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-sm text-gray-700 mb-4 max-h-48 overflow-y-auto">
              {refinedContent}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReject}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 mr-1" />
                Try Different
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="flex items-center px-3 py-2 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Back to Options
                </button>
                <button
                  onClick={handleAcceptRefinement}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Use This Version
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {isRefiningContent && (
          <div className="mt-4 flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-gray-600 text-sm">
                AI is refining your content with{' '}
                <span className="font-medium text-purple-600">
                  {REFINEMENT_OPTIONS.find(opt => opt.type === selectedRefinement)?.label}
                </span>
                ...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
