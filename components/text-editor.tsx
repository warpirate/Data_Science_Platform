"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Italic, List, ListOrdered, Save } from "lucide-react"

export function TextEditor() {
  const [text, setText] = useState("")
  const [isSaved, setIsSaved] = useState(false)

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    setIsSaved(false)
  }

  const insertFormatting = (format: string) => {
    const textarea = document.querySelector("textarea")
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = text.substring(start, end)
    let formattedText = ""

    switch (format) {
      case "bold":
        formattedText = `**${selectedText}**`
        break
      case "italic":
        formattedText = `*${selectedText}*`
        break
      case "list":
        formattedText = `\n- ${selectedText}`
        break
      case "ordered-list":
        formattedText = `\n1. ${selectedText}`
        break
      default:
        formattedText = selectedText
    }

    const newText = text.substring(0, start) + formattedText + text.substring(end)
    setText(newText)
    setIsSaved(false)
  }

  const handleSave = () => {
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="sketch-button"
          onClick={() => insertFormatting("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="sketch-button"
          onClick={() => insertFormatting("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="sketch-button"
          onClick={() => insertFormatting("list")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="sketch-button"
          onClick={() => insertFormatting("ordered-list")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex-1"></div>
        <Button variant="outline" size="sm" className="sketch-button" onClick={handleSave} title="Save">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>

      <Textarea
        placeholder="Write your notes here... Supports Markdown formatting."
        className="min-h-[200px] sketch-input font-mono"
        value={text}
        onChange={handleTextChange}
      />

      {isSaved && (
        <div className="text-sm text-green-600 flex items-center justify-end">
          <span>✓ Notes saved</span>
        </div>
      )}

      {text && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Preview:</h3>
          <div className="p-4 border rounded-md bg-muted/50 prose prose-sm max-w-none">
            {text.split("\n").map((line, i) => {
              // Simple markdown rendering for preview
              const formattedLine = line
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>")
                .replace(/^- (.*)/g, "• $1")
                .replace(/^(\d+)\. (.*)/g, "$1. $2")

              return <p key={i} dangerouslySetInnerHTML={{ __html: formattedLine || "&nbsp;" }} />
            })}
          </div>
        </div>
      )}
    </div>
  )
}
