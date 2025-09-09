"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LayoutGrid, List, Grid3X3, ArrowUpDown } from "lucide-react"

interface DisplayDropdownProps {
  viewMode: "list" | "board"
  onViewModeChange: (mode: "list" | "board") => void
  onDisplayChange: (settings: any) => void
}

export default function DisplayDropdown({ viewMode, onViewModeChange, onDisplayChange }: DisplayDropdownProps) {
  const [grouping, setGrouping] = useState("Status")
  const [subGrouping, setSubGrouping] = useState("No grouping")
  const [ordering, setOrdering] = useState("Priority")
  const [orderCompleted, setOrderCompleted] = useState(true)
  const [completedIssues, setCompletedIssues] = useState("All")
  const [showSubIssues, setShowSubIssues] = useState(true)
  const [showEmptyGroups, setShowEmptyGroups] = useState(true)
  const [showEmptyColumns, setShowEmptyColumns] = useState(true)
  const [showEmptyRows, setShowEmptyRows] = useState(true)

  const [displayProperties, setDisplayProperties] = useState({
    priority: true,
    id: true,
    status: true,
    labels: true,
    milestone: false,
    dueDate: false,
    links: false,
    assignee: true,
    created: false,
    updated: false,
  })

  const toggleProperty = (property: string) => {
    setDisplayProperties((prev) => ({
      ...prev,
      [property]: !prev[property as keyof typeof prev],
    }))
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
          <LayoutGrid className="w-4 h-4 mr-1" />
          Display
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 bg-gray-900 border-gray-800" align="end">
        <div className="p-4 space-y-6">
          {/* View Mode Toggle */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-1 bg-gray-800 rounded-lg p-1">
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className={`flex-1 ${
                  viewMode === "list" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"
                }`}
                onClick={() => onViewModeChange("list")}
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === "board" ? "default" : "ghost"}
                size="sm"
                className={`flex-1 ${
                  viewMode === "board" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"
                }`}
                onClick={() => onViewModeChange("board")}
              >
                <Grid3X3 className="w-4 h-4 mr-1" />
                Board
              </Button>
            </div>

            {viewMode === "list" && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">List view</span>
                <kbd className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Ctrl B</kbd>
              </div>
            )}
          </div>

          <DropdownMenuSeparator className="bg-gray-800" />

          {/* Grouping */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Grouping</span>
            </div>
            <Select value={grouping} onValueChange={setGrouping}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="Status">Status</SelectItem>
                <SelectItem value="Priority">Priority</SelectItem>
                <SelectItem value="Assignee">Assignee</SelectItem>
                <SelectItem value="Labels">Labels</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sub-grouping */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Sub-grouping</span>
            </div>
            <Select value={subGrouping} onValueChange={setSubGrouping}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="No grouping">No grouping</SelectItem>
                <SelectItem value="Priority">Priority</SelectItem>
                <SelectItem value="Assignee">Assignee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ordering */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-300">Ordering</span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={ordering} onValueChange={setOrdering}>
                <SelectTrigger className="flex-1 bg-gray-800 border-gray-700 text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-800">
                  <SelectItem value="Priority">Priority</SelectItem>
                  <SelectItem value="Created">Created</SelectItem>
                  <SelectItem value="Updated">Updated</SelectItem>
                  <SelectItem value="Status">Status</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-100">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="order-completed" className="text-sm text-gray-400">
                Order completed by recency
              </Label>
              <Switch
                id="order-completed"
                checked={orderCompleted}
                onCheckedChange={setOrderCompleted}
                className="data-[state=checked]:bg-blue-600"
              />
            </div>
          </div>

          <DropdownMenuSeparator className="bg-gray-800" />

          {/* Completed Issues */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-300">Completed issues</span>
            <Select value={completedIssues} onValueChange={setCompletedIssues}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-800">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Hide">Hide</SelectItem>
                <SelectItem value="Show only">Show only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Show sub-issues */}
          <div className="flex items-center justify-between">
            <Label htmlFor="show-sub-issues" className="text-sm text-gray-400">
              Show sub-issues
            </Label>
            <Switch
              id="show-sub-issues"
              checked={showSubIssues}
              onCheckedChange={setShowSubIssues}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          <DropdownMenuSeparator className="bg-gray-800" />

          {/* List/Board Options */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-300">
              {viewMode === "list" ? "List options" : "Board options"}
            </span>
            {viewMode === "list" ? (
              <div className="flex items-center justify-between">
                <Label htmlFor="show-empty-groups" className="text-sm text-gray-400">
                  Show empty groups
                </Label>
                <Switch
                  id="show-empty-groups"
                  checked={showEmptyGroups}
                  onCheckedChange={setShowEmptyGroups}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-empty-columns" className="text-sm text-gray-400">
                    Show empty columns
                  </Label>
                  <Switch
                    id="show-empty-columns"
                    checked={showEmptyColumns}
                    onCheckedChange={setShowEmptyColumns}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-empty-rows" className="text-sm text-gray-400">
                    Show empty rows
                  </Label>
                  <Switch
                    id="show-empty-rows"
                    checked={showEmptyRows}
                    onCheckedChange={setShowEmptyRows}
                    className="data-[state=checked]:bg-blue-600"
                  />
                </div>
              </div>
            )}
          </div>

          <DropdownMenuSeparator className="bg-gray-800" />

          {/* Display Properties */}
          <div className="space-y-3">
            <span className="text-sm font-medium text-gray-300">Display properties</span>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(displayProperties).map(([key, value]) => (
                <Button
                  key={key}
                  variant={value ? "default" : "outline"}
                  size="sm"
                  className={`text-xs ${
                    value
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  }`}
                  onClick={() => toggleProperty(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator className="bg-gray-800" />

          {/* Reset Options */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
              Reset
            </Button>
            <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
              Set default for everyone
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
