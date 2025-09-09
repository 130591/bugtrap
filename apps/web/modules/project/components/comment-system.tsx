"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Paperclip, Send, MoreHorizontal } from "lucide-react"

interface Comment {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
  content: string
  timestamp: string
}

interface CommentSystemProps {
  comments: Comment[]
  onAddComment: (content: string) => void
}

export default function CommentSystem({ comments, onAddComment }: CommentSystemProps) {
  const [newComment, setNewComment] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment)
      setNewComment("")
      setIsExpanded(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <MessageSquare className="w-4 h-4" />
        <span>
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </span>
        <Button variant="ghost" size="icon" className="w-4 h-4 text-gray-500 hover:text-gray-300">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <Avatar className="w-6 h-6 mt-1">
              <AvatarImage src={comment.user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-pink-600">
                {comment.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium text-gray-100">{comment.user.email}</span>
                <span className="text-gray-500">{comment.timestamp}</span>
              </div>
              <div className="bg-gray-900 rounded-lg p-3">
                <p className="text-gray-100 text-sm">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Comment */}
      <div className="flex gap-3">
        <Avatar className="w-6 h-6 mt-1">
          <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Leave a reply..."
                className="bg-gray-900 border-gray-800 text-gray-100 placeholder-gray-500 resize-none min-h-[40px] pr-20"
                rows={isExpanded ? 3 : 1}
              />

              {isExpanded && (
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-gray-500 hover:text-gray-300"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 text-blue-400 hover:text-blue-300"
                    disabled={!newComment.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
