"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Filter,
  Search,
  User,
  BarChart3,
  Tag,
  Calendar,
  Diamond,
  Users,
  Clock,
  FileText,
  Link,
  Layout,
  ChevronRight,
} from "lucide-react"

interface FilterDropdownProps {
  onFilterChange: (filters: any) => void
}

export default function FilterDropdown({ onFilterChange }: FilterDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filterOptions = [
    { icon: Search, label: "AI Filter", type: "ai" },
    { icon: BarChart3, label: "Status", type: "status", hasSubmenu: true },
    { icon: User, label: "Assignee", type: "assignee", hasSubmenu: true },
    { icon: User, label: "Creator", type: "creator", hasSubmenu: true },
    { icon: BarChart3, label: "Priority", type: "priority", hasSubmenu: true },
    { icon: Tag, label: "Labels", type: "labels", hasSubmenu: true },
    { icon: Link, label: "Relations", type: "relations", hasSubmenu: true },
    { icon: Tag, label: "Suggested label", type: "suggested", hasSubmenu: true },
    { icon: Calendar, label: "Dates", type: "dates", hasSubmenu: true },
    { icon: Diamond, label: "Project milestone", type: "milestone", hasSubmenu: true },
    { icon: Users, label: "Subscribers", type: "subscribers", hasSubmenu: true },
    { icon: Clock, label: "Auto-closed", type: "auto-closed", hasSubmenu: true },
    { icon: FileText, label: "Content", type: "content", hasSubmenu: true },
    { icon: Link, label: "Links", type: "links", hasSubmenu: true },
    { icon: Layout, label: "Template", type: "template", hasSubmenu: true },
  ]

  const labelOptions = [
    { name: "Bug", color: "bg-red-500" },
    { name: "Feature", color: "bg-purple-500" },
    { name: "Improvement", color: "bg-cyan-500" },
  ]

  const milestoneOptions = [
    { name: "No milestone", count: 3 },
    { name: "My milestone", count: 0 },
  ]

  const assigneeOptions = [
    { name: "Current user", count: 3, isCurrentUser: true },
    { name: "everton.paixao16@gmail.com", count: 3, avatar: "/placeholder.svg?height=24&width=24" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
          <Filter className="w-4 h-4 mr-1" />
          Filter
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gray-900 border-gray-800" align="start">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Filter..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500"
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 bg-gray-800 px-1 rounded">
              F
            </kbd>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-800" />

        {filterOptions.map((option) => (
          <div key={option.type}>
            {option.hasSubmenu ? (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
                  <option.icon className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-gray-900 border-gray-800">
                  {option.type === "labels" && (
                    <div className="p-2 space-y-2">
                      {labelOptions.map((label) => (
                        <div
                          key={label.name}
                          className="flex items-center gap-2 p-2 rounded hover:bg-gray-800 cursor-pointer"
                        >
                          <div className={`w-3 h-3 rounded-full ${label.color}`}></div>
                          <span className="text-gray-100 text-sm">{label.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {option.type === "milestone" && (
                    <div className="p-2 space-y-2">
                      {milestoneOptions.map((milestone) => (
                        <div
                          key={milestone.name}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <Diamond className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-100 text-sm">{milestone.name}</span>
                          </div>
                          <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
                            {milestone.count} issues
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  {option.type === "assignee" && (
                    <div className="p-2 space-y-2">
                      {assigneeOptions.map((assignee) => (
                        <div
                          key={assignee.name}
                          className="flex items-center justify-between p-2 rounded hover:bg-gray-800 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            {assignee.isCurrentUser ? (
                              <User className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                              </Avatar>
                            )}
                            <span className="text-gray-100 text-sm">{assignee.name}</span>
                          </div>
                          <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
                            {assignee.count} issues
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            ) : (
              <DropdownMenuItem className="text-gray-300 hover:text-gray-100 hover:bg-gray-800">
                <option.icon className="w-4 h-4 mr-2" />
                {option.label}
              </DropdownMenuItem>
            )}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
