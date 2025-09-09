'use client'

import { ReactNode, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ChevronDown,
  ChevronRight,
  Inbox,
  Search,
  Settings,
  User,
  Bug,
  GitBranch,
  Folder,
} from "lucide-react"

const projects = [
  { name: "Core", items: ["Issues", "Board"], expanded: true },
  { name: "Mobile", items: [], expanded: false },
  { name: "Backend", items: [], expanded: false },
  { name: "Platform", items: [], expanded: false },
]

export default function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  const [currentView, setCurrentView] = useState("issues")

  return (
    <div className="flex flex-1">
      <div className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
            <Avatar className="w-6 h-6">
              <AvatarImage src="/placeholder.svg?height=24&width=24" />
              <AvatarFallback>KS</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">Karri Saarinen</span>
          </div>
        </div>

        <div className="flex-1 p-4 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800"
          >
            <Inbox className="w-4 h-4" />
            Inbox
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800"
          >
            <User className="w-4 h-4" />
            Assigned to me
          </Button>

          <Button
            variant="ghost"
            className={`w-full justify-start gap-2 ${
              currentView === "search"
                ? "bg-gray-800 text-gray-100"
                : "text-gray-300 hover:text-gray-100 hover:bg-gray-800"
            }`}
            onClick={() => setCurrentView("search")}
          >
            <Search className="w-4 h-4" />
            Search
          </Button>

          <Separator className="my-4 bg-gray-800" />

          {projects.map((project) => (
            <div key={project.name} className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 p-2"
              >
                {project.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                <Folder className="w-4 h-4" />
                {project.name}
              </Button>

              {project.expanded &&
                project.items.map((item) => (
                  <Button
                    key={item}
                    variant="ghost"
                    className={`w-full justify-start gap-2 ml-4 text-sm ${
                      currentView === "projects"
                        ? "bg-gray-800 text-gray-100"
                        : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    }`}
                    onClick={() => setCurrentView("projects")}
                  >
                    {item === "Issues" ? <Bug className="w-4 h-4" /> : <GitBranch className="w-4 h-4" />}
                    {item}
                  </Button>
                ))}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  )
}
