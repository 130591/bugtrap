"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Search,
  ChevronRight,
  ChevronDown,
  X,
  Filter,
  Calendar,
  User,
  Tag,
  BarChart3,
  FileText,
  Target,
  Users,
  Sparkles,
  AlertCircle,
  CheckCircle,
  Circle,
  Minus,
} from "lucide-react"

interface FilterState {
  status: string[]
  assignee: string[]
  creator: string[]
  priority: string[]
  labels: string[]
  projectMilestone: string[]
  dates: {
    dueDate?: string
    createdDate?: string
    updatedDate?: string
    startedDate?: string
    completedDate?: string
  }
  template: string[]
  relations: string[]
}

interface AdvancedFilterPanelProps {
  isOpen: boolean
  onClose: () => void
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
}

const statusOptions = [
  { id: "todo", label: "Todo", icon: Circle, color: "text-gray-400" },
  { id: "in-progress", label: "In Progress", icon: Minus, color: "text-yellow-400" },
  { id: "done", label: "Done", icon: CheckCircle, color: "text-green-400" },
  { id: "canceled", label: "Canceled", icon: X, color: "text-red-400" },
]

const priorityOptions = [
  { id: "urgent", label: "Urgent", icon: AlertCircle, color: "text-red-500", count: 1 },
  { id: "high", label: "High", icon: BarChart3, color: "text-orange-500", count: 3 },
  { id: "medium", label: "Medium", icon: BarChart3, color: "text-yellow-500", count: 2 },
  { id: "low", label: "Low", icon: BarChart3, color: "text-green-500", count: 1 },
  { id: "no-priority", label: "No priority", icon: Minus, color: "text-gray-400", count: 1 },
]

const labelOptions = [
  { id: "bug", label: "Bug", color: "bg-red-500", count: 1 },
  { id: "feature", label: "Feature", color: "bg-purple-500", count: 0 },
  { id: "improvement", label: "Improvement", color: "bg-blue-500", count: 1 },
]

const milestoneOptions = [
  { id: "no-milestone", label: "No milestone", count: 3 },
  { id: "teste", label: "teste", count: 1 },
  { id: "my-milestone", label: "My milestone", count: 1 },
]

const templateOptions = [{ id: "no-template", label: "No template", count: 5 }]

const dateOptions = [
  { id: "1-day", label: "1 day ago" },
  { id: "3-days", label: "3 days ago" },
  { id: "1-week", label: "1 week ago" },
  { id: "1-month", label: "1 month ago" },
  { id: "3-months", label: "3 months ago" },
  { id: "6-months", label: "6 months ago" },
  { id: "1-year", label: "1 year ago" },
  { id: "custom", label: "Custom date or timeframe..." },
]

const users = [
  {
    id: "current-user",
    name: "Current user",
    email: "everton.paixao16@gmail.com",
    avatar: "/placeholder.svg?height=24&width=24",
    count: 3,
  },
  {
    id: "everton",
    name: "everton.paixao16@gmail.com",
    email: "everton.paixao16@gmail.com",
    avatar: "/placeholder.svg?height=24&width=24",
    count: 3,
  },
]

export default function AdvancedFilterPanel({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  onClearFilters,
}: AdvancedFilterPanelProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    status: false,
    assignee: false,
    creator: false,
    priority: false,
    labels: false,
    relations: false,
    dates: false,
    projectMilestone: false,
    subscribers: false,
    autoClose: false,
    content: false,
    links: false,
    template: false,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const updateFilter = (category: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = Array.isArray(filters[category]) ? (filters[category] as string[]) : []

    let newValues: string[]
    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter((v) => v !== value)
    }

    onFiltersChange({
      ...filters,
      [category]: newValues,
    })
  }

  const updateDateFilter = (dateType: string, value: string) => {
    onFiltersChange({
      ...filters,
      dates: {
        ...filters.dates,
        [dateType]: value,
      },
    })
  }

  const getActiveFiltersCount = () => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "dates") {
        count += Object.values(value as any).filter(Boolean).length
      } else if (Array.isArray(value)) {
        count += value.length
      }
    })
    return count
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Filter Panel */}
      <div className="relative w-80 bg-gray-900 border-r border-gray-800 h-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-100">Filter</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-100">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
            />
          </div>

          {/* AI Filter Button */}
          <Button variant="ghost" className="w-full justify-start mt-3 text-gray-300 hover:text-gray-100">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Filter
          </Button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {/* Status */}
            <Collapsible open={expandedSections.status} onOpenChange={() => toggleSection("status")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Circle className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  {expandedSections.status ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                {statusOptions.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={status.id}
                      checked={filters.status.includes(status.id)}
                      onCheckedChange={(checked) => updateFilter("status", status.id, checked as boolean)}
                    />
                    <label htmlFor={status.id} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                      <status.icon className={`w-3 h-3 ${status.color}`} />
                      {status.label}
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Assignee */}
            <Collapsible open={expandedSections.assignee} onOpenChange={() => toggleSection("assignee")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Assignee</span>
                  </div>
                  {expandedSections.assignee ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                <Input
                  placeholder="Filter..."
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-sm h-8"
                />
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={user.id}
                      checked={filters.assignee.includes(user.id)}
                      onCheckedChange={(checked) => updateFilter("assignee", user.id, checked as boolean)}
                    />
                    <label
                      htmlFor={user.id}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.count} issues</span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Creator */}
            <Collapsible open={expandedSections.creator} onOpenChange={() => toggleSection("creator")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Creator</span>
                  </div>
                  {expandedSections.creator ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                <Input
                  placeholder="Filter..."
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-sm h-8"
                />
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`creator-${user.id}`}
                      checked={filters.creator.includes(user.id)}
                      onCheckedChange={(checked) => updateFilter("creator", user.id, checked as boolean)}
                    />
                    <label
                      htmlFor={`creator-${user.id}`}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      <Avatar className="w-4 h-4">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                      </Avatar>
                      <span className="flex-1">{user.name}</span>
                      <span className="text-xs text-gray-500">{user.count} issues</span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Priority */}
            <Collapsible open={expandedSections.priority} onOpenChange={() => toggleSection("priority")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    <span>Priority</span>
                  </div>
                  {expandedSections.priority ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                <Input
                  placeholder="Filter..."
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-sm h-8"
                />
                {priorityOptions.map((priority) => (
                  <div key={priority.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={priority.id}
                      checked={filters.priority.includes(priority.id)}
                      onCheckedChange={(checked) => updateFilter("priority", priority.id, checked as boolean)}
                    />
                    <label
                      htmlFor={priority.id}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      <priority.icon className={`w-3 h-3 ${priority.color}`} />
                      <span className="flex-1">{priority.label}</span>
                      <span className="text-xs text-gray-500">
                        {priority.count} issue{priority.count !== 1 ? "s" : ""}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Labels */}
            <Collapsible open={expandedSections.labels} onOpenChange={() => toggleSection("labels")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Labels</span>
                  </div>
                  {expandedSections.labels ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                <Input
                  placeholder="Filter..."
                  className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400 text-sm h-8"
                />
                {labelOptions.map((label) => (
                  <div key={label.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={label.id}
                      checked={filters.labels.includes(label.id)}
                      onCheckedChange={(checked) => updateFilter("labels", label.id, checked as boolean)}
                    />
                    <label
                      htmlFor={label.id}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      <div className={`w-3 h-3 rounded-full ${label.color}`} />
                      <span className="flex-1">{label.label}</span>
                      <span className="text-xs text-gray-500">
                        {label.count} issue{label.count !== 1 ? "s" : ""}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Relations */}
            <Collapsible open={expandedSections.relations} onOpenChange={() => toggleSection("relations")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Relations</span>
                  </div>
                  {expandedSections.relations ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                <div className="space-y-2 text-sm text-gray-400">
                  <div>Parent issues</div>
                  <div>Sub-issues</div>
                  <div>Blocked issues</div>
                  <div>Blocking issues</div>
                  <div>Recurring issues</div>
                  <div>Issues with relations</div>
                  <div>Duplicates</div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Dates */}
            <Collapsible open={expandedSections.dates} onOpenChange={() => toggleSection("dates")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Dates</span>
                  </div>
                  {expandedSections.dates ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                <div className="space-y-1">
                  <div className="text-sm text-gray-400 mb-2">Due date</div>
                  <div className="text-sm text-gray-400 mb-2">Created date</div>
                  <div className="text-sm text-gray-400 mb-2">Updated date</div>
                  <div className="text-sm text-gray-400 mb-2">Started date</div>
                  <div className="text-sm text-gray-400 mb-2">Completed date</div>
                  <div className="text-sm text-gray-400 mb-2">Triaged date</div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Project milestone */}
            <Collapsible
              open={expandedSections.projectMilestone}
              onOpenChange={() => toggleSection("projectMilestone")}
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span>Project milestone</span>
                  </div>
                  {expandedSections.projectMilestone ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                {milestoneOptions.map((milestone) => (
                  <div key={milestone.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={milestone.id}
                      checked={filters.projectMilestone.includes(milestone.id)}
                      onCheckedChange={(checked) => updateFilter("projectMilestone", milestone.id, checked as boolean)}
                    />
                    <label
                      htmlFor={milestone.id}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      <Target className="w-3 h-3 text-gray-400" />
                      <span className="flex-1">{milestone.label}</span>
                      <span className="text-xs text-gray-500">
                        {milestone.count} issue{milestone.count !== 1 ? "s" : ""}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>

            {/* Template */}
            <Collapsible open={expandedSections.template} onOpenChange={() => toggleSection("template")}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between text-gray-300 hover:text-gray-100 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>Template</span>
                  </div>
                  {expandedSections.template ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-2 mt-2">
                {templateOptions.map((template) => (
                  <div key={template.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={template.id}
                      checked={filters.template.includes(template.id)}
                      onCheckedChange={(checked) => updateFilter("template", template.id, checked as boolean)}
                    />
                    <label
                      htmlFor={template.id}
                      className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer flex-1"
                    >
                      <FileText className="w-3 h-3 text-gray-400" />
                      <span className="flex-1">{template.label}</span>
                      <span className="text-xs text-gray-500">
                        {template.count} issue{template.count !== 1 ? "s" : ""}
                      </span>
                    </label>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Footer */}
        {getActiveFiltersCount() > 0 && (
          <div className="p-4 border-t border-gray-800">
            <Button variant="ghost" onClick={onClearFilters} className="w-full text-gray-400 hover:text-gray-100">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
