"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Filter, LayoutGrid, Plus, BarChart3, Circle, AlertCircle } from "lucide-react"
import { useState } from "react"
import FilterDropdown from "./filter-dropdown"
import DisplayDropdown from "./display-dropdown"
import ProjectIssuesBoard from "./project-issues-board"

const issuesData = {
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
      date: "Apr 26",
    },
    {
      id: "FAL-7",
      title: "Use Projects to organize work for features or releases",
      priority: "medium",
      type: "Feature",
      assignee: null,
      date: "Apr 26",
    },
  ],
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
      date: "Apr 28",
    },
  ],
}

export default function ProjectIssuesView() {
  const [viewMode, setViewMode] = useState<"list" | "board">("list")
  const [filters, setFilters] = useState({})
  
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

  return (
    <div className="p-6 space-y-6">

    <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FilterDropdown onFilterChange={setFilters} />
        </div>
         <DisplayDropdown viewMode={viewMode} onViewModeChange={setViewMode} onDisplayChange={() => {}} />
      </div>
    { viewMode === 'list' ? (
      <>
         <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-300">Todo</h3>
            <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
              {issuesData.todo.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {issuesData.todo.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/70 cursor-pointer border border-gray-800/50 hover:border-gray-700/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getPriorityIcon(issue.priority)}
                <span className="text-xs text-gray-500 font-mono">{issue.id}</span>
              </div>

              <Circle className="w-4 h-4 text-gray-600" />

              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-100">{issue.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTypeColor(issue.type)}>
                  {issue.type}
                </Badge>

                {issue.assignee ? (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-pink-600">{issue.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-gray-600" />
                  </div>
                )}

                <span className="text-xs text-gray-500">{issue.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backlog Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-300">Backlog</h3>
            <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
              {issuesData.backlog.length}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          {issuesData.backlog.map((issue) => (
            <div
              key={issue.id}
              className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-800/70 cursor-pointer border border-gray-800/50 hover:border-gray-700/70 transition-colors"
            >
              <div className="flex items-center gap-2">
                {getPriorityIcon(issue.priority)}
                <span className="text-xs text-gray-500 font-mono">{issue.id}</span>
              </div>

              <AlertCircle className="w-4 h-4 text-gray-600" />

              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-100">{issue.title}</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getTypeColor(issue.type)}>
                  {issue.type}
                </Badge>

                {issue.assignee ? (
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={issue.assignee.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs bg-pink-600">{issue.assignee.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-600 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-gray-600" />
                  </div>
                )}

                <span className="text-xs text-gray-500">{issue.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
    ) : (
      <ProjectIssuesBoard  />
    )}
    </div>
  )
}
