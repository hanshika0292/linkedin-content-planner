interface PostPreviewProps {
  content: string;
}

export function PostPreview({ content }: PostPreviewProps) {
  const limit = 210;
  const seeMore = content.length > limit;
  const truncated = seeMore ? content.slice(0, limit).trimEnd() + '…' : content;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">Full Post</h3>
        <div className="whitespace-pre-wrap border border-gray-200 rounded p-3 bg-gray-50">
          {content || <span className="text-gray-400">(empty)</span>}
        </div>
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-1">See More Preview</h3>
        <div className="whitespace-pre-wrap border border-gray-200 rounded p-3 bg-gray-50">
          {truncated}
          {seeMore && <span className="text-blue-600"> See more</span>}
        </div>
      </div>
    </div>
  );
}
