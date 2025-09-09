"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Filter, Plus, BarChart3, Folder, Settings } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Soma",
    icon: "🏢",
    priority: "high",
    lead: { name: "John Doe", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q2 2020",
    status: 0,
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "plm atelier, melhor processo produtivo do mundo !",
    icon: "⚡",
    priority: "medium",
    lead: { name: "Sarah Wilson", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q3 2024",
    status: 0,
    color: "bg-purple-500",
  },
  {
    id: 3,
    name: "new project here",
    icon: "🚀",
    priority: "high",
    lead: { name: "Mike Johnson", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q1 2025",
    status: 0,
    color: "bg-green-500",
  },
  {
    id: 4,
    name: "teste 1",
    icon: "🔧",
    priority: "high",
    lead: { name: "Emma Davis", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q4 2024",
    status: 0,
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "teste 2",
    icon: "📊",
    priority: "medium",
    lead: { name: "Alex Brown", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q2 2025",
    status: 0,
    color: "bg-cyan-500",
  },
  {
    id: 6,
    name: "teste 3",
    icon: "🎯",
    priority: "medium",
    lead: { name: "Lisa Chen", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q3 2025",
    status: 0,
    color: "bg-pink-500",
  },
  {
    id: 7,
    name: "test 4",
    icon: "💡",
    priority: "low",
    lead: { name: "David Kim", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q1 2026",
    status: 0,
    color: "bg-indigo-500",
  },
  {
    id: 8,
    name: "test 6",
    icon: "🔥",
    priority: "high",
    lead: { name: "Kate Miller", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q4 2025",
    status: 0,
    color: "bg-red-500",
  },
  {
    id: 9,
    name: "test 7",
    icon: "⭐",
    priority: "medium",
    lead: { name: "Ryan Taylor", avatar: "/placeholder.svg?height=24&width=24" },
    targetDate: "Q2 2026",
    status: 0,
    color: "bg-yellow-500",
  },
]

export default function ProjectsView() {
  const [selectedView, setSelectedView] = useState("All projects")

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <BarChart3 className="w-3 h-3 text-red-500" />
      case "medium":
        return <BarChart3 className="w-3 h-3 text-yellow-500" />
      case "low":
        return <BarChart3 className="w-3 h-3 text-green-500" />
      default:
        return <BarChart3 className="w-3 h-3 text-gray-500" />
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Projects</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-100 ${selectedView === "All projects" ? "bg-gray-800" : "hover:bg-gray-800"}`}
                onClick={() => setSelectedView("All projects")}
              >
                <Folder className="w-4 h-4 mr-1" />
                All projects
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-400 hover:text-gray-100 hover:bg-gray-800 ${
                  selectedView === "New view" ? "bg-gray-800 text-gray-100" : ""
                }`}
                onClick={() => setSelectedView("New view")}
              >
                <Settings className="w-4 h-4 mr-1" />
                New view
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
              Display
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-1" />
              Add project
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="flex-1 overflow-auto">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800/50 text-xs text-gray-500 font-medium">
          <div className="col-span-4">Name</div>
          <div className="col-span-2">Priority</div>
          <div className="col-span-2">Lead</div>
          <div className="col-span-2">Target date</div>
          <div className="col-span-2">Status</div>
        </div>

        {/* Projects List */}
        <div className="space-y-px">
          {projects.map((project) => (
            <div
              key={project.id}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-gray-900/50 cursor-pointer border-b border-gray-800/30"
            >
              {/* Name */}
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-6 h-6 rounded flex items-center justify-center text-sm bg-gray-800">
                  {project.icon}
                </div>
                <span className="text-gray-100 text-sm font-medium truncate">{project.name}</span>
              </div>

              {/* Priority */}
              <div className="col-span-2 flex items-center">{getPriorityIcon(project.priority)}</div>

              {/* Lead */}
              <div className="col-span-2 flex items-center">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={project.lead.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs bg-gray-700">
                    {project.lead.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Target Date */}
              <div className="col-span-2 flex items-center">
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-1 ${
                    project.targetDate.includes("2020")
                      ? "bg-red-500/20 text-red-300 border-red-500/30"
                      : "bg-gray-500/20 text-gray-300 border-gray-500/30"
                  }`}
                >
                  {project.targetDate}
                </Badge>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-xs text-gray-400">{project.status}%</span>
                </div>
                <div className="flex-1 max-w-16">
                  <Progress value={project.status} className="h-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
