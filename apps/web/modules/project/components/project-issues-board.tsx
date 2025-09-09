"use client"

import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, MoreHorizontal, BarChart3, Circle, AlertCircle } from "lucide-react"

const boardData = {
  backlog: [
    {
      id: "FAL-10",
      title: "How to solve this › Connect to Slack",
      priority: "medium",
      type: "Improvement",
      assignee: {
        name: "User",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    },
  ],
  todo: [
    {
      id: "FAL-6",
      title: "Use Cycles to focus work over n-weeks",
      priority: "high",
      type: "Bug",
      assignee: {
        name: "User",
        avatar: "/placeholder.svg?height=24&width=24",
      },
    },
    {
      id: "FAL-7",
      title: "Use Projects to organize work for features or releases",
      priority: "medium",
      type: "Feature",
      assignee: null,
    },
  ],
}

export default function ProjectIssuesBoard() {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <BarChart3 className="w-3 h-3 text-red-500" />
      case "medium":
        return <BarChart3 className="w-3 h-3 text-yellow-500" />
      case "low":
        return <BarChart3 className="w-3 h-3 text-green-500" />
      default:
        return <Circle className="w-3 h-3 text-gray-500" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Bug":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "Feature":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Improvement":
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const renderColumn = (title: string, issues: any[], icon: React.ReactNode, count: number) => (
    <div className="flex-1 min-w-80">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-medium text-gray-300">{title}</h3>
          <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
            {count}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => (
          <div
            key={issue.id}
            className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:bg-gray-800/70 hover:border-gray-700/70 cursor-pointer transition-colors"
          >
            <div className="space-y-3">
              {/* Issue Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 font-mono">{issue.id}</span>
                  {getPriorityIcon(issue.priority)}
                </div>
                {issue.assignee && (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-pink-600">{issue.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                )}
              </div>

              {/* Issue Title */}
              <div className="flex items-start gap-2">
                <Circle className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-100 leading-relaxed">{issue.title}</p>
              </div>

              {/* Issue Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getPriorityIcon(issue.priority)}
                  <Badge variant="outline" className={getTypeColor(issue.type)}>
                    {issue.type}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        ))}

        <Button
          variant="ghost"
          className="w-full justify-start text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border-2 border-dashed border-gray-800 hover:border-gray-700/70 h-12"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add issue
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex gap-6 overflow-x-auto pb-4">
      {renderColumn("Backlog", boardData.backlog, <AlertCircle className="w-4 h-4 text-gray-400" />, 1)}
      {renderColumn("Todo", boardData.todo, <Circle className="w-4 h-4 text-gray-400" />, 2)}
    </div>
  )
}
