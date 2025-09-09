"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  X,
  Search,
  Upload,
  File,
  ImageIcon,
  Video,
  Music,
  Archive,
  Star,
  Clock,
  Folder,
  Users,
  Grid3X3,
  List,
  SortAsc,
  FolderOpen,
  Monitor,
  Cloud,
} from "lucide-react"

export interface MediaFile {
  id: string
  name: string
  type: "image" | "document" | "video" | "audio" | "archive" | "other"
  size: string
  uploadedBy: string
  uploadedAt: string
  thumbnail?: string
  url: string
  isFavorite?: boolean
}

interface MediaManagerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectFiles: (files: MediaFile[]) => void
  allowMultiple?: boolean
  acceptedTypes?: string[]
}

const mockFiles: MediaFile[] = [
  {
    id: "1",
    name: "book.pdf",
    type: "document",
    size: "2.4 MB",
    uploadedBy: "Everton",
    uploadedAt: "Jan 3 by you",
    url: "/files/book.pdf",
    isFavorite: true,
  },
  {
    id: "2",
    name: "edc5f525-a627-4b41-9d91-f5298d4ebc8b.png",
    type: "image",
    size: "1.2 MB",
    uploadedBy: "Everton",
    uploadedAt: "Jan 1 by you",
    thumbnail: "/placeholder.svg?height=60&width=60",
    url: "/files/screenshot.png",
  },
  {
    id: "3",
    name: "Captura de Tela (500).png",
    type: "image",
    size: "856 KB",
    uploadedBy: "Everton",
    uploadedAt: "2 days ago",
    thumbnail: "/placeholder.svg?height=60&width=60",
    url: "/files/capture.png",
    isFavorite: true,
  },
  {
    id: "4",
    name: "project-demo.mp4",
    type: "video",
    size: "15.7 MB",
    uploadedBy: "John Doe",
    uploadedAt: "1 week ago",
    thumbnail: "/placeholder.svg?height=60&width=60",
    url: "/files/demo.mp4",
  },
  {
    id: "5",
    name: "requirements.docx",
    type: "document",
    size: "445 KB",
    uploadedBy: "Jane Smith",
    uploadedAt: "2 weeks ago",
    url: "/files/requirements.docx",
  },
]

export default function MediaManagerModal({
  isOpen,
  onClose,
  onSelectFiles,
  allowMultiple = false,
  acceptedTypes = [],
}: MediaManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"desktop" | "workdrive">("workdrive")
  const [activeSection, setActiveSection] = useState<"recent" | "favorites" | "folders" | "shared">("recent")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([])
  const [files, setFiles] = useState<MediaFile[]>(mockFiles)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4 text-green-400" />
      case "document":
        return <File className="w-4 h-4 text-red-400" />
      case "video":
        return <Video className="w-4 h-4 text-purple-400" />
      case "audio":
        return <Music className="w-4 h-4 text-blue-400" />
      case "archive":
        return <Archive className="w-4 h-4 text-yellow-400" />
      default:
        return <File className="w-4 h-4 text-gray-400" />
    }
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSection = activeSection === "recent" || (activeSection === "favorites" && file.isFavorite)
    return matchesSearch && matchesSection
  })

  const handleFileSelect = (file: MediaFile) => {
    if (allowMultiple) {
      setSelectedFiles((prev) => {
        const isSelected = prev.find((f) => f.id === file.id)
        if (isSelected) {
          return prev.filter((f) => f.id !== file.id)
        } else {
          return [...prev, file]
        }
      })
    } else {
      setSelectedFiles([file])
    }
  }

  const handleUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files
    if (uploadedFiles) {
      // Handle file upload logic here
      console.log("Files uploaded:", uploadedFiles)
    }
  }

  const handleConfirm = () => {
    onSelectFiles(selectedFiles)
    onClose()
  }

  const toggleFavorite = (fileId: string) => {
    setFiles((prev) => prev.map((file) => (file.id === fileId ? { ...file, isFavorite: !file.isFavorite } : file)))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[80vh] bg-gray-900 border-gray-700 text-gray-100 p-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Media Manager</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-100">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 mt-4">
            <Button
              variant={activeTab === "desktop" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("desktop")}
              className={`${
                activeTab === "desktop" ? "bg-gray-700 text-gray-100" : "text-gray-400 hover:text-gray-100"
              }`}
            >
              <Monitor className="w-4 h-4 mr-2" />
              Desktop
            </Button>
            <Button
              variant={activeTab === "workdrive" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("workdrive")}
              className={`${
                activeTab === "workdrive" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-gray-100"
              }`}
            >
              <Cloud className="w-4 h-4 mr-2" />
              WorkDrive
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* User Info */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-purple-600 text-white text-sm">E</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">everton.paixao16@gmail.com</p>
                  <p className="text-xs text-gray-400">Personal Account</p>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-gray-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 p-4 space-y-2">
              <Button
                variant={activeSection === "recent" ? "secondary" : "ghost"}
                onClick={() => setActiveSection("recent")}
                className={`w-full justify-start ${
                  activeSection === "recent"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                }`}
              >
                <Clock className="w-4 h-4 mr-3" />
                Recent Files
              </Button>

              <Button
                variant={activeSection === "favorites" ? "secondary" : "ghost"}
                onClick={() => setActiveSection("favorites")}
                className={`w-full justify-start ${
                  activeSection === "favorites"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                }`}
              >
                <Star className="w-4 h-4 mr-3" />
                Favorites
              </Button>

              <Button
                variant={activeSection === "folders" ? "secondary" : "ghost"}
                onClick={() => setActiveSection("folders")}
                className={`w-full justify-start ${
                  activeSection === "folders"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                }`}
              >
                <Folder className="w-4 h-4 mr-3" />
                My Folders
              </Button>

              <Button
                variant={activeSection === "shared" ? "secondary" : "ghost"}
                onClick={() => setActiveSection("shared")}
                className={`w-full justify-start ${
                  activeSection === "shared"
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-gray-100 hover:bg-gray-700"
                }`}
              >
                <Users className="w-4 h-4 mr-3" />
                Shared with Me
              </Button>

              <Separator className="bg-gray-700 my-4" />

              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Team Folders</p>
                <p className="text-sm text-gray-500">There are no Team Folders.</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-sm font-medium text-gray-300 capitalize">
                  {activeSection === "recent"
                    ? "Recent Files"
                    : activeSection === "favorites"
                      ? "Favorites"
                      : activeSection === "folders"
                        ? "My Folders"
                        : "Shared with Me"}
                </h3>
                {filteredFiles.length > 0 && (
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {filteredFiles.length} items
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                  className="text-gray-400 hover:text-gray-100"
                >
                  {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>

                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-100">
                  <SortAsc className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-auto p-4">
              {filteredFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-24 h-24 mb-4 opacity-50">
                    <FolderOpen className="w-full h-full text-gray-500" />
                  </div>
                  <p className="text-gray-400 mb-2">No items available.</p>
                  <p className="text-sm text-gray-500">
                    {activeSection === "favorites"
                      ? "Star files to add them to your favorites"
                      : "Upload files or create folders to get started"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Header */}
                  {viewMode === "list" && (
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider border-b border-gray-700">
                      <div className="col-span-6">Name</div>
                      <div className="col-span-2">Size</div>
                      <div className="col-span-3">Time</div>
                      <div className="col-span-1"></div>
                    </div>
                  )}

                  {/* Files */}
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className={`grid grid-cols-12 gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedFiles.find((f) => f.id === file.id)
                          ? "bg-blue-600/20 border-blue-500/50"
                          : "bg-gray-800/50 border-gray-700 hover:bg-gray-800"
                      }`}
                      onClick={() => handleFileSelect(file)}
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        {file.thumbnail ? (
                          <img
                            src={file.thumbnail || "/placeholder.svg"}
                            alt={file.name}
                            className="w-10 h-10 rounded object-cover bg-gray-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded bg-gray-700 flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-100 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400">Uploaded by {file.uploadedBy}</p>
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-gray-300">{file.size}</span>
                      </div>

                      <div className="col-span-3 flex items-center">
                        <span className="text-sm text-gray-400">{file.uploadedAt}</span>
                      </div>

                      <div className="col-span-1 flex items-center justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleFavorite(file.id)
                          }}
                          className="w-8 h-8 text-gray-400 hover:text-yellow-400"
                        >
                          <Star className={`w-4 h-4 ${file.isFavorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Area */}
            <div className="p-4 border-t border-gray-700">
              <Button onClick={handleUpload} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Attach Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple={allowMultiple}
                accept={acceptedTypes.join(",")}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {selectedFiles.length > 0 && (
              <span>
                {selectedFiles.length} file{selectedFiles.length > 1 ? "s" : ""} selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-100">
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={selectedFiles.length === 0}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              Pick ({selectedFiles.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
