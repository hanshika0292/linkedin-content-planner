"use client"

interface CharacterCounterProps {
  current: number
  max: number
}

export function CharacterCounter({ current, max }: CharacterCounterProps) {
  const percentage = (current / max) * 100
  const isNearLimit = percentage > 80
  const isOverLimit = current > max

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-500">
        <span className={isOverLimit ? "text-red-600 font-medium" : isNearLimit ? "text-amber-600" : ""}>
          {current.toLocaleString()}
        </span>
        <span className="text-gray-400">/{max.toLocaleString()}</span>
      </div>
      <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isOverLimit ? "bg-red-500" : isNearLimit ? "bg-amber-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  )
}
