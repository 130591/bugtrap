"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X, Circle, User, BarChart3, Tag, Target, FileText, Calendar } from "lucide-react"

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

interface FilterChipsProps {
  filters: FilterState
  onRemoveFilter: (category: keyof FilterState, value: string) => void
  onClearAll: () => void
}

const getFilterIcon = (category: string) => {
  switch (category) {
    case "status":
      return Circle
    case "assignee":
    case "creator":
      return User
    case "priority":
      return BarChart3
    case "labels":
      return Tag
    case "projectMilestone":
      return Target
    case "template":
      return FileText
    case "dates":
      return Calendar
    default:
      return Circle
  }
}

const getFilterLabel = (category: string, value: string) => {
  const labels: Record<string, Record<string, string>> = {
    status: {
      todo: "Todo",
      "in-progress": "In Progress",
      done: "Done",
      canceled: "Canceled",
    },
    priority: {
      urgent: "Urgent",
      high: "High",
      medium: "Medium",
      low: "Low",
      "no-priority": "No priority",
    },
    labels: {
      bug: "Bug",
      feature: "Feature",
      improvement: "Improvement",
    },
    assignee: {
      "current-user": "Current user",
      everton: "everton.paixao16@gmail.com",
    },
    creator: {
      "current-user": "Current user",
      everton: "everton.paixao16@gmail.com",
    },
    projectMilestone: {
      "no-milestone": "No milestone",
      teste: "teste",
      "my-milestone": "My milestone",
    },
    template: {
      "no-template": "No template",
    },
  }

  return labels[category]?.[value] || value
}

const getFilterColor = (category: string, value: string) => {
  if (category === "priority") {
    switch (value) {
      case "urgent":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "high":
        return "bg-orange-500/20 text-orange-300 border-orange-500/30"
      case "medium":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "low":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  if (category === "status") {
    switch (value) {
      case "todo":
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
      case "in-progress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "done":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      case "canceled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  return "bg-blue-500/20 text-blue-300 border-blue-500/30"
}

export default function FilterChips({ filters, onRemoveFilter, onClearAll }: FilterChipsProps) {
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "dates") {
      return Object.values(value as any).some(Boolean)
    }
    return Array.isArray(value) && value.length > 0
  })

  if (!hasActiveFilters) return null

  return (
    <div className="flex items-center gap-2 p-4 border-b border-gray-800 flex-wrap">
      {Object.entries(filters).map(([category, values]) => {
        if (category === "dates") {
          return Object.entries(values as Record<string, string | undefined>).map(([dateType, dateValue]) => {
            if (!dateValue) return null
            const Icon = getFilterIcon(category)
            return (
              <Badge key={`${category}-${dateType}`} variant="outline" className={getFilterColor(category, dateType)}>
                <Icon className="w-3 h-3 mr-1" />
                {dateType}: {dateValue}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 hover:bg-transparent"
                  onClick={() => onRemoveFilter("dates" as keyof FilterState, dateType)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            )
          })
        }

        if (!Array.isArray(values) || values.length === 0) return null

        const Icon = getFilterIcon(category)
        return values.map((value) => (
          <Badge key={`${category}-${value}`} variant="outline" className={getFilterColor(category, value)}>
            <Icon className="w-3 h-3 mr-1" />
            {category}: {getFilterLabel(category, value)}
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 h-auto p-0 hover:bg-transparent"
              onClick={() => onRemoveFilter(category as keyof FilterState, value)}
            >
              <X className="w-3 h-3" />
            </Button>
          </Badge>
        ))
      })}

      <Button variant="ghost" size="sm" onClick={onClearAll} className="text-gray-400 hover:text-gray-100 ml-2">
        Clear Filters
      </Button>
    </div>
  )
}
