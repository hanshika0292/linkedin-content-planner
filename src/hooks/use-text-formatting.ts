"use client"

import { useCallback, useRef } from "react"

export function useTextFormatting() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertAtCursor = useCallback((textToInsert: string, selectInserted = false) => {
    const textarea = textareaRef.current
    if (!textarea) return ""

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value

    const newValue = currentValue.substring(0, start) + textToInsert + currentValue.substring(end)

    // Update cursor position
    setTimeout(() => {
      if (selectInserted) {
        textarea.setSelectionRange(start, start + textToInsert.length)
      } else {
        textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length)
      }
      textarea.focus()
    }, 0)

    return newValue
  }, [])

  const formatSelectedText = useCallback((prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current
    if (!textarea) return ""

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentValue = textarea.value
    const selectedText = currentValue.substring(start, end)

    if (selectedText) {
      const formattedText = `${prefix}${selectedText}${suffix}`
      const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end)

      setTimeout(() => {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length)
        textarea.focus()
      }, 0)

      return newValue
    } else {
      // If no text selected, insert formatting markers and place cursor between them
      const placeholder = `${prefix}text${suffix}`
      const newValue = currentValue.substring(0, start) + placeholder + currentValue.substring(end)

      setTimeout(() => {
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + 4) // Select "text"
        textarea.focus()
      }, 0)

      return newValue
    }
  }, [])

  return {
    textareaRef,
    insertAtCursor,
    formatSelectedText,
  }
}
