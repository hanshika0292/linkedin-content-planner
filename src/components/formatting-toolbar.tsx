"use client"

import { Bold, Italic, List, Hash, AtSign, Link } from "lucide-react"

interface FormattingToolbarProps {
  onFormat: (type: string) => void
  disabled?: boolean
}

export function FormattingToolbar({ onFormat, disabled }: FormattingToolbarProps) {
  const tools = [
    { id: "bold", icon: Bold, label: "Bold (Ctrl+B)", shortcut: "**text**" },
    { id: "italic", icon: Italic, label: "Italic (Ctrl+I)", shortcut: "*text*" },
    { id: "list", icon: List, label: "Bullet List", shortcut: "• " },
    { id: "hashtag", icon: Hash, label: "Add Hashtag", shortcut: "#" },
    { id: "mention", icon: AtSign, label: "Mention Someone", shortcut: "@" },
    { id: "link", icon: Link, label: "Add Link", shortcut: "[text](url)" },
  ]

  return (
    <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg border">
      {tools.map((tool) => {
        const Icon = tool.icon
        return (
          <button
            key={tool.id}
            onClick={() => onFormat(tool.id)}
            disabled={disabled}
            title={tool.label}
            className="p-2 rounded hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
          </button>
        )
      })}
      <div className="ml-2 text-xs text-gray-500 hidden sm:block">Select text to format, or use keyboard shortcuts</div>
    </div>
  )
}
