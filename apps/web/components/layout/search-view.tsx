"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Clock } from "lucide-react"

const searchResults = [
  {
    id: 1,
    type: "Project",
    title: "plm atelier, melhor processo produtivo do mundo !",
    timestamp: "2mo",
    icon: "⚡",
  },
  {
    id: 2,
    type: "Project",
    title: "Soma",
    timestamp: "3mo",
    icon: "🏢",
  },
]

export default function SearchView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")
  const [hasSearched, setHasSearched] = useState(false)

  const tabs = ["All", "Issues", "Projects", "Documents"]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setHasSearched(true)
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                placeholder="Search by describing your issue..."
                className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder-gray-500 h-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
              <Filter className="w-4 h-4 mr-1" />
              Filter
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
              Display
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-4">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              className={`text-sm ${
                activeTab === tab ? "text-gray-100 bg-gray-800" : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {!hasSearched || !searchQuery ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Search across your workspace</h3>
              <p className="text-sm text-gray-500">
                Find issues, projects, and documents by describing what you're looking for
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            {searchResults
              .filter((result) => activeTab === "All" || result.type.toLowerCase() === activeTab.toLowerCase())
              .map((result) => (
                <div
                  key={result.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-900/50 cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-6 h-6 rounded flex items-center justify-center text-sm bg-gray-800">
                      {result.icon}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5 bg-gray-800/50 text-gray-400 border-gray-700"
                        >
                          {result.type}
                        </Badge>
                        <span className="text-gray-100 text-sm font-medium">{result.title}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {result.timestamp}
                  </div>
                </div>
              ))}

            {searchResults.filter(
              (result) => activeTab === "All" || result.type.toLowerCase() === activeTab.toLowerCase(),
            ).length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
