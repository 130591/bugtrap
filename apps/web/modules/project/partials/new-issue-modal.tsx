"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3, User, Tag, X } from "lucide-react"

interface NewIssueModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateIssue: (issueData: {
    title: string
    description: string
    priority: string
    assignee?: string
    labels: string[]
  }) => void
  projectName: string
}

const priorityOptions = [
  { value: "low", label: "Low", icon: BarChart3, color: "text-green-500" },
  { value: "medium", label: "Medium", icon: BarChart3, color: "text-yellow-500" },
  { value: "high", label: "High", icon: BarChart3, color: "text-red-500" },
]

const availableLabels = [
  "bug",
  "feature",
  "enhancement",
  "documentation",
  "help wanted",
  "good first issue",
  "priority",
  "backend",
  "frontend",
  "ui/ux",
]

const teamMembers = [
  { id: "1", name: "Everton", email: "everton.paixao16@gmail.com", avatar: "/placeholder.svg?height=24&width=24" },
  { id: "2", name: "Sarah Chen", email: "sarah@bugtrap.com", avatar: "/placeholder.svg?height=24&width=24" },
  { id: "3", name: "John Doe", email: "john@bugtrap.com", avatar: "/placeholder.svg?height=24&width=24" },
]

export default function NewIssueModal({ isOpen, onClose, onCreateIssue, projectName }: NewIssueModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [assignee, setAssignee] = useState("")
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)

    try {
      await onCreateIssue({
        title: title.trim(),
        description: description.trim(),
        priority,
        assignee: assignee || undefined,
        labels: selectedLabels,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setPriority("medium")
      setAssignee("")
      setSelectedLabels([])
      onClose()
    } catch (error) {
      console.error("Error creating issue:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLabel = (label: string) => {
    setSelectedLabels((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))
  }

  const removeLabel = (label: string) => {
    setSelectedLabels((prev) => prev.filter((l) => l !== label))
  }

  const getPriorityIcon = (priorityValue: string) => {
    const option = priorityOptions.find((p) => p.value === priorityValue)
    if (!option) return null
    const Icon = option.icon
    return <Icon className={`w-4 h-4 ${option.color}`} />
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">Create New Issue</DialogTitle>
          <p className="text-sm text-gray-400">Create a new issue for {projectName}</p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-300">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the issue. You can use Markdown formatting."
              rows={6}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 resize-none"
            />
            <p className="text-xs text-gray-500">Supports Markdown formatting</p>
          </div>

          {/* Priority and Assignee Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(priority)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {priorityOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <SelectItem key={option.value} value={option.value} className="text-gray-100">
                        <div className="flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${option.color}`} />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-300">Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="" className="text-gray-100">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>Unassigned</span>
                    </div>
                  </SelectItem>
                  {teamMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id} className="text-gray-100">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{member.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-300">Labels</Label>

            {/* Selected Labels */}
            {selectedLabels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedLabels.map((label) => (
                  <Badge key={label} variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 pr-1">
                    <span>{label}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1 hover:bg-transparent"
                      onClick={() => removeLabel(label)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Available Labels */}
            <div className="flex flex-wrap gap-2">
              {availableLabels
                .filter((label) => !selectedLabels.includes(label))
                .map((label) => (
                  <Button
                    key={label}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleLabel(label)}
                    className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent h-7 px-2 text-xs"
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {label}
                  </Button>
                ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <Button type="button" variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-100">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Creating..." : "Create Issue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
