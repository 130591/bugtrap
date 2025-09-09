"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Link, Upload } from "lucide-react"

interface DocumentModalProps {
  isOpen: boolean
  onClose: () => void
  onAddDocument: (document: { name: string; type: string; url?: string; content?: string }) => void
}

export default function DocumentModal({ isOpen, onClose, onAddDocument }: DocumentModalProps) {
  const [documentType, setDocumentType] = useState<"upload" | "link">("link")
  const [name, setName] = useState("")
  const [url, setUrl] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (documentType === "link" && name && url) {
      onAddDocument({
        name,
        type: "link",
        url,
      })
    } else if (documentType === "upload" && name && content) {
      onAddDocument({
        name,
        type: "document",
        content,
      })
    }

    // Reset form
    setName("")
    setUrl("")
    setContent("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle>Add Document or Link</DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a document or external link to your project resources.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Document Type Selection */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={documentType === "link" ? "default" : "outline"}
              size="sm"
              onClick={() => setDocumentType("link")}
              className={documentType === "link" ? "bg-blue-600" : "border-gray-700"}
            >
              <Link className="w-4 h-4 mr-1" />
              Link
            </Button>
            <Button
              type="button"
              variant={documentType === "upload" ? "default" : "outline"}
              size="sm"
              onClick={() => setDocumentType("upload")}
              className={documentType === "upload" ? "bg-blue-600" : "border-gray-700"}
            >
              <Upload className="w-4 h-4 mr-1" />
              Document
            </Button>
          </div>

          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-200">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter document name"
              className="bg-gray-800 border-gray-700 text-gray-100"
              required
            />
          </div>

          {/* Conditional Fields */}
          {documentType === "link" ? (
            <div className="space-y-2">
              <Label htmlFor="url" className="text-gray-200">
                URL
              </Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-gray-800 border-gray-700 text-gray-100"
                required
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="content" className="text-gray-200">
                Content
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter document content..."
                className="bg-gray-800 border-gray-700 text-gray-100 min-h-[100px]"
                required
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="border-gray-700 bg-transparent">
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Add {documentType === "link" ? "Link" : "Document"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
