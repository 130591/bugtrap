"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link,
  ImageIcon,
  List,
  ListOrdered,
  Quote,
  Eye,
  Edit,
  Smile,
  AtSign,
  Hash,
  CheckSquare,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  ChevronUp,
} from "lucide-react"

interface RichMDXEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  isFullscreen?: boolean
  onToggleFullscreen?: () => void
  variant?: "default" | "comment"
  maxHeight?: number
}

export default function RichMDXEditor({
  value,
  onChange,
  placeholder = "Write your content...",
  className = "",
  isFullscreen = false,
  onToggleFullscreen,
  variant = "default",
  maxHeight = 300,
}: RichMDXEditorProps) {
  const [mode, setMode] = useState<"edit" | "preview">("edit")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [showIssueSuggestions, setShowIssueSuggestions] = useState(false)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [showToolbar, setShowToolbar] = useState(variant === "default")
  const [showFooter, setShowFooter] = useState(variant === "default")
  const [isFocused, setIsFocused] = useState(false)
  const [textareaHeight, setTextareaHeight] = useState(variant === "comment" ? 80 : 120)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const isCompactMode = variant === "comment"
  const minHeight = isCompactMode ? 80 : 120
  const maxHeightLimit = isCompactMode ? 200 : maxHeight

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "👍",
    "👎",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "🔥",
    "💯",
    "✨",
    "⭐",
    "🎉",
    "🎊",
    "💡",
    "❤️",
    "💚",
    "💙",
  ]

  const mentionSuggestions = [
    { name: "everton.paixao16@gmail.com", avatar: "/placeholder.svg?height=24&width=24" },
    { name: "john.doe@example.com", avatar: "/placeholder.svg?height=24&width=24" },
    { name: "sarah.wilson@example.com", avatar: "/placeholder.svg?height=24&width=24" },
  ]

  const issueSuggestions = [
    { id: "FAL-1", title: "Setup project infrastructure", status: "Done" },
    { id: "FAL-2", title: "Design system components", status: "In Progress" },
    { id: "FAL-3", title: "Connect to Slack", status: "Todo" },
    { id: "FAL-4", title: "User authentication", status: "Backlog" },
  ]

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      textarea.style.height = "auto"
      const scrollHeight = textarea.scrollHeight
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeightLimit)
      setTextareaHeight(newHeight)
      textarea.style.height = `${newHeight}px`
    }
  }, [value, minHeight, maxHeightLimit])

  const insertText = (text: string, wrapSelection = false) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let newText = ""
    let newCursorPos = start

    if (wrapSelection && selectedText) {
      newText = value.substring(0, start) + text + selectedText + text + value.substring(end)
      newCursorPos = start + text.length + selectedText.length + text.length
    } else {
      newText = value.substring(0, start) + text + value.substring(end)
      newCursorPos = start + text.length
    }

    onChange(newText)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatText = (format: string) => {
    const formats: Record<string, string> = {
      bold: "**",
      italic: "*",
      underline: "<u>",
      strikethrough: "~~",
      code: "`",
      h1: "# ",
      h2: "## ",
      h3: "### ",
      quote: "> ",
      ul: "- ",
      ol: "1. ",
      link: "[text](url)",
      image: "![alt](url)",
      table: "| Column 1 | Column 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
      checkbox: "- [ ] ",
      checkedbox: "- [x] ",
    }

    if (format === "link" || format === "image" || format === "table") {
      insertText(formats[format])
    } else if (format === "underline") {
      insertText("<u>", true)
      insertText("</u>")
    } else if (["bold", "italic", "strikethrough", "code"].includes(format)) {
      insertText(formats[format], true)
    } else {
      insertText(formats[format])
    }
  }

  const insertEmoji = (emoji: string) => {
    insertText(emoji)
    setShowEmojiPicker(false)
  }

  const insertMention = (user: string) => {
    insertText(`@${user} `)
    setShowMentionSuggestions(false)
  }

  const insertIssueReference = (issueId: string) => {
    insertText(`#${issueId} `)
    setShowIssueSuggestions(false)
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart

    onChange(newValue)
    setCursorPosition(cursorPos)

    // Check for @ mentions
    const beforeCursor = newValue.substring(0, cursorPos)
    const atMatch = beforeCursor.match(/@(\w*)$/)
    setShowMentionSuggestions(!!atMatch)

    // Check for # issue references
    const hashMatch = beforeCursor.match(/#(\w*)$/)
    setShowIssueSuggestions(!!hashMatch)
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (isCompactMode) {
      setShowToolbar(true)
      setShowFooter(true)
    }
  }

  const handleBlur = () => {
    // Delay to allow clicking on toolbar buttons
    setTimeout(() => {
      if (!textareaRef.current?.matches(":focus") && !showEmojiPicker) {
        setIsFocused(false)
        if (isCompactMode && !value.trim()) {
          setShowToolbar(false)
          setShowFooter(false)
        }
      }
    }, 150)
  }

  const toggleToolbar = () => {
    setShowToolbar(!showToolbar)
    if (!showToolbar) {
      setShowFooter(true)
    }
  }

  const renderPreview = () => {
    // Simple markdown to HTML conversion for preview
    const html = value
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-gray-100 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-100 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-100 mb-4">$1</h1>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-100">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-200">$1</em>')
      .replace(/~~(.*?)~~/g, '<del class="line-through text-gray-400">$1</del>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 text-blue-300 px-1 rounded text-sm">$1</code>')
      .replace(
        /^> (.*$)/gim,
        '<blockquote class="border-l-4 border-blue-500 pl-4 text-gray-300 italic">$1</blockquote>',
      )
      .replace(
        /^- \[ \] (.*$)/gim,
        '<div class="flex items-center gap-2"><input type="checkbox" disabled class="w-4 h-4"> <span class="text-gray-300">$1</span></div>',
      )
      .replace(
        /^- \[x\] (.*$)/gim,
        '<div class="flex items-center gap-2"><input type="checkbox" checked disabled class="w-4 h-4"> <span class="text-gray-300 line-through">$1</span></div>',
      )
      .replace(/^- (.*$)/gim, '<li class="text-gray-300 ml-4">• $1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="text-gray-300 ml-4 list-decimal">$1</li>')
      .replace(/#(FAL-\d+)/g, '<span class="text-blue-400 hover:text-blue-300 cursor-pointer">#$1</span>')
      .replace(
        /@(\w+(?:\.\w+)*@\w+(?:\.\w+)*)/g,
        '<span class="text-purple-400 hover:text-purple-300 cursor-pointer">@$1</span>',
      )
      .replace(/\n/g, "<br>")

    return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Done":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "In Progress":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Todo":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "Backlog":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-lg transition-all duration-200 ${
        isFocused ? "border-gray-700" : ""
      } ${isFullscreen ? "fixed inset-4 z-50" : ""} ${className}`}
    >
      {/* Toolbar */}
      {showToolbar && (
        <div className="border-b border-gray-800 p-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 flex-wrap">
              {/* Text Formatting */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("bold")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Bold className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("italic")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Italic className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("strikethrough")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Strikethrough className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("code")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Code className="w-3 h-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4 bg-gray-700" />

              {/* Lists and Blocks */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("ul")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <List className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("ol")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <ListOrdered className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("checkbox")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <CheckSquare className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("quote")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Quote className="w-3 h-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4 bg-gray-700" />

              {/* Media and Links */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("link")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Link className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => formatText("image")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <ImageIcon className="w-3 h-3" />
                </Button>
              </div>

              <Separator orientation="vertical" className="h-4 bg-gray-700" />

              {/* Special Features */}
              <div className="flex items-center gap-1 relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Smile className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("@")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <AtSign className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText("#")}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-7 w-7 p-0"
                >
                  <Hash className="w-3 h-3" />
                </Button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg z-10 w-64">
                    <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => insertEmoji(emoji)}
                          className="p-1 hover:bg-gray-700 rounded text-lg"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Mode Toggle */}
              {!isCompactMode && (
                <div className="flex items-center bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={mode === "edit" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("edit")}
                    className={`h-6 text-xs ${mode === "edit" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"}`}
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant={mode === "preview" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMode("preview")}
                    className={`h-6 text-xs ${mode === "preview" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"}`}
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              )}

              {/* Collapse/Expand Button for compact mode */}
              {isCompactMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToolbar(false)}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-6 w-6 p-0"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
              )}

              {/* Fullscreen Toggle */}
              {onToggleFullscreen && !isCompactMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleFullscreen}
                  className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-6 w-6 p-0"
                >
                  {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expand Toolbar Button (only for compact mode when toolbar is hidden) */}
      {isCompactMode && !showToolbar && isFocused && (
        <div className="absolute top-2 right-2 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleToolbar}
            className="text-gray-400 hover:text-gray-100 hover:bg-gray-800 h-6 w-6 p-0"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Editor Content */}
      <div className="relative">
        {mode === "edit" ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextareaChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              className="w-full bg-transparent text-gray-100 placeholder-gray-500 border-none outline-none resize-none p-4 font-mono text-sm leading-relaxed transition-all duration-200"
              style={{
                height: `${textareaHeight}px`,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              }}
            />

            {/* Mention Suggestions */}
            {showMentionSuggestions && (
              <div
                className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-64 max-h-48 overflow-y-auto"
                style={{
                  top: `${Math.min(cursorPosition * 1.5, 200)}px`,
                  left: "20px",
                }}
              >
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2">Mention someone</div>
                  {mentionSuggestions.map((user) => (
                    <button
                      key={user.name}
                      onClick={() => insertMention(user.name)}
                      className="w-full flex items-center gap-2 p-2 hover:bg-gray-700 rounded text-left"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-pink-600">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-300">{user.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Issue Suggestions */}
            {showIssueSuggestions && (
              <div
                className="absolute bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-10 w-80 max-h-48 overflow-y-auto"
                style={{
                  top: `${Math.min(cursorPosition * 1.5, 200)}px`,
                  left: "20px",
                }}
              >
                <div className="p-2">
                  <div className="text-xs text-gray-500 mb-2">Reference an issue</div>
                  {issueSuggestions.map((issue) => (
                    <button
                      key={issue.id}
                      onClick={() => insertIssueReference(issue.id)}
                      className="w-full flex items-center justify-between p-2 hover:bg-gray-700 rounded text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-blue-400">{issue.id}</span>
                        <span className="text-sm text-gray-300">{issue.title}</span>
                      </div>
                      <Badge variant="outline" className={`text-xs ${getStatusColor(issue.status)}`}>
                        {issue.status}
                      </Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`p-4 ${isFullscreen ? "min-h-[calc(100vh-200px)]" : "min-h-[120px]"} overflow-y-auto`}>
            {value ? renderPreview() : <div className="text-gray-500 italic">Nothing to preview</div>}
          </div>
        )}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="border-t border-gray-800 p-3 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>Supports Markdown, @mentions, #issues</span>
              <span>•</span>
              <span>{value.length} characters</span>
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-gray-800 px-1 rounded">Ctrl</kbd>
              <span>+</span>
              <kbd className="bg-gray-800 px-1 rounded">Enter</kbd>
              <span>to submit</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
