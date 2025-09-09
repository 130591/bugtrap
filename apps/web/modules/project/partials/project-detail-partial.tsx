"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import DocumentModal from "../components/document-modal"
import CommentSystem from "../components/comment-system"
import {
  Star,
  Plus,
  Calendar,
  Tag,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Building,
  User,
  FileText,
  ExternalLink,
  Github,
  Copy,
  GitBranch,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  GitPullRequest,
  Users,
  Settings,
  Lock,
  StarIcon,
  MessageSquare,
} from "lucide-react"
import ProjectIssuesView from "../components/project-issues-view"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ExternalIntegration } from "@/modules/issue/partials/issue-detail-view"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import GitHubDetailsModal from "../components/github-details-modal"
import AdvancedFilterPanel from "../components/advanced-filter-panel"
import FilterChips from "../components/filter-chips"
import NewIssueModal from "./new-issue-modal"

interface Toast {
  id: string
  message: string
  type: "success" | "info" | "error"
}

const projectData = {
  id: "soma",
  name: "Soma",
  description: "A New plm project",
  status: "In Progress",
  priority: "Medium",
  lead: null,
  members: ["everton.paixao16@gmail.com"],
  startDate: "Apr 29",
  targetDate: "Q2 2020",
  team: "Fallaplabs",
  labels: [],
  scope: 3,
  started: 0,
  completed: 0,
  github: {
    connected: true,
    repository: "fallaplabs/soma",
    url: "https://github.com/fallaplabs/soma",
    lastSync: "2 minutes ago",
    defaultBranch: "main",
    visibility: "private",
    stats: {
      stars: 12,
      forks: 3,
      watchers: 8,
      openIssues: 7,
      closedIssues: 23,
      openPRs: 2,
      mergedPRs: 45,
      totalCommits: 234,
      contributors: 4,
      releases: 3,
      languages: [
        { name: "TypeScript", percentage: 65, color: "#3178c6" },
        { name: "JavaScript", percentage: 25, color: "#f7df1e" },
        { name: "CSS", percentage: 8, color: "#1572b6" },
        { name: "HTML", percentage: 2, color: "#e34f26" },
      ],
    },
    branches: [
      {
        name: "main",
        isDefault: true,
        isProtected: true,
        lastCommit: {
          sha: "a1b2c3d",
          message: "Update project documentation",
          author: "Everton",
          timestamp: "2 hours ago",
        },
      },
      {
        name: "feature/user-auth",
        isDefault: false,
        isProtected: false,
        lastCommit: {
          sha: "e4f5g6h",
          message: "Add OAuth integration",
          author: "Sarah",
          timestamp: "1 day ago",
        },
      },
      {
        name: "fix/login-validation",
        isDefault: false,
        isProtected: false,
        lastCommit: {
          sha: "i7j8k9l",
          message: "Fix validation logic",
          author: "John",
          timestamp: "3 days ago",
        },
      },
    ],
    pullRequests: [
      {
        number: 15,
        title: "Add user authentication system",
        author: "sarah-chen",
        status: "open",
        reviewStatus: "approved",
        checks: "passing",
        mergeable: true,
        createdAt: "2 days ago",
        branch: "feature/user-auth",
      },
      {
        number: 14,
        title: "Fix login form validation",
        author: "john-doe",
        status: "open",
        reviewStatus: "changes_requested",
        checks: "failing",
        mergeable: false,
        createdAt: "1 week ago",
        branch: "fix/login-validation",
      },
    ],
    recentCommits: [
      {
        sha: "a1b2c3d",
        message: "Update project documentation",
        author: "Everton",
        timestamp: "2 hours ago",
        branch: "main",
      },
      {
        sha: "e4f5g6h",
        message: "Add OAuth integration",
        author: "Sarah",
        timestamp: "1 day ago",
        branch: "feature/user-auth",
      },
      {
        sha: "i7j8k9l",
        message: "Fix validation logic",
        author: "John",
        timestamp: "3 days ago",
        branch: "fix/login-validation",
      },
    ],
    workflows: [
      {
        name: "CI/CD Pipeline",
        status: "success",
        lastRun: "1 hour ago",
        branch: "main",
      },
      {
        name: "Code Quality Check",
        status: "success",
        lastRun: "2 hours ago",
        branch: "main",
      },
      {
        name: "Security Scan",
        status: "warning",
        lastRun: "1 day ago",
        branch: "main",
      },
    ],
    milestones: [
      {
        title: "v1.0 Release",
        description: "Initial release with core features",
        dueDate: "2024-02-15",
        progress: 75,
        openIssues: 3,
        closedIssues: 12,
      },
      {
        title: "v1.1 Feature Update",
        description: "Enhanced user experience and new features",
        dueDate: "2024-03-30",
        progress: 25,
        openIssues: 8,
        closedIssues: 2,
      },
    ],
  },
}

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

const latestUpdate = {
  status: "On track",
  user: "everton.paixao16@gmail.com",
  avatar: "/placeholder.svg?height=24&width=24",
  timestamp: "4mo ago",
  message: "Something a little wrong happened just now",
}

export default function ProjectDetailPage() {
  const [isFavorited, setIsFavorited] = useState(true)
  const [milestonesExpanded, setMilestonesExpanded] = useState(true)
  const [progressExpanded, setProgressExpanded] = useState(true)
  const [updateMessage, setUpdateMessage] = useState(latestUpdate.message)
  const [editedDescription, setEditedDescription] = useState("I need to solve this issue !!")
  const [description, setDescription] = useState("")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [documents, setDocuments] = useState([
    { id: "1", name: "Notion PDF", type: "document", url: "/document/notion-pdf" },
  ])
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    assignee: [],
    creator: [],
    priority: [],
    labels: [],
    projectMilestone: [],
    dates: {},
    template: [],
    relations: [],
  })

  const [comments, setComments] = useState([
    {
      id: "1",
      user: {
        name: "Everton",
        email: "everton.paixao16@gmail.com",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      content: "My comenten baby",
      timestamp: "just now",
    },
  ])

  const [activeTab, setActiveTab] = useState<"overview" | "issues">("overview")
  const [showNewIssueModal, setShowNewIssueModal] = useState(false)
  const [showGitHubDetailsModal, setShowGitHubDetailsModal] = useState(false)
  const [syncNotification, setSyncNotification] = useState<string | null>(null)
  const [showComments, setShowComments] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      case "On track":
        return "bg-green-500/20 text-green-300 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "High":
        return <BarChart3 className="w-3 h-3 text-red-500" />
      case "Medium":
        return <BarChart3 className="w-3 h-3 text-yellow-500" />
      case "Low":
        return <BarChart3 className="w-3 h-3 text-green-500" />
      default:
        return <BarChart3 className="w-3 h-3 text-gray-500" />
    }
  }


  const addToast = (message: string, type: "success" | "info" | "error" = "info") => {
    const id = Date.now().toString()
    const newToast = { id, message, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const issueData = {
    id: "FAL-10",
    title: "How to solve this",
    description: editedDescription,
    status: "Backlog",
    priority: "High",
    assignee: {
      name: "everton.paixao16@gmail.com",
      avatar: "/placeholder.svg?height=24&width=24",
      githubUsername: "everton-paixao",
    },
    reporter: {
      name: "everton.paixao16@gmail.com",
      avatar: "/placeholder.svg?height=24&width=24",
    },
    labels: ["Improvement", "good first issue", "help wanted"],
    project: "Soma",
    milestone: null,
    parentIssue: {
      id: "FAL-3",
      title: "Connect to Slack",
    },
    githubIssue: {
      number: 42,
      url: "https://github.com/fallaplabs/soma/issues/42",
    },
    linkedPRs: [
      {
        number: 15,
        title: "Fix integration with Slack API",
        status: "open",
        author: "contributor-dev",
      },
    ],
    watchers: 5,
    upvotes: 12,
    created: "4mo ago",
    updated: "2h ago",
  }

  const handleAddDocument = (document: { name: string; type: string; url?: string; content?: string }) => {
    const newDoc = {
      id: Date.now().toString(),
      ...document,
      url: document.url || `/document/${document.name.toLowerCase().replace(/\s+/g, "-")}`,
    }
    setDocuments([...documents, newDoc])
  }


  const handleSyncWithGitHub = async () => {
    setIsSyncing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSyncing(false)
    addToast("Successfully synced with GitHub", "success")
  }

  const handleCopyBranchName = () => {
    const branchName = `everton.paixao16/fal-10-how-to-solve-this`
    navigator.clipboard.writeText(branchName)
    addToast("Branch name copied to clipboard. Paste it into your favorite git client.", "success")
  }

  const handleAddComment = (content: string) => {
    const newComment = {
      id: Date.now().toString(),
      user: {
        name: "Current User",
        email: "user@bugtrap.com",
        avatar: "/placeholder.svg?height=24&width=24",
      },
      content,
      timestamp: "just now",
    }
    setComments([...comments, newComment])
  }

  const handleSyncRepository = async () => {
    setIsSyncing(true)
    // Simulate sync process
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSyncing(false)
    setSyncNotification("Repository synchronized successfully!")
    setTimeout(() => setSyncNotification(null), 3000)
  }

  const handleCreateIssue = () => {
    setShowNewIssueModal(true)
  }

  const handleCreateNewIssue = (issueData: {
    title: string
    description: string
    priority: string
    assignee?: string
    labels: string[]
  }) => {
    console.log("Creating new issue:", issueData)
    // Here you would make the API call to create the issue
    // Then show a success notification
    setSyncNotification("Issue created successfully!")
    setTimeout(() => setSyncNotification(null), 3000)
  }

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  const handleRemoveFilter = (category: keyof FilterState, value: string) => {
    if (category === "dates") {
      setFilters((prev) => ({
        ...prev,
        dates: {
          ...prev.dates,
          [value]: undefined,
        },
      }))
    } else {
      const currentValues = filters[category] as string[]
      setFilters((prev) => ({
        ...prev,
        [category]: currentValues.filter((v) => v !== value),
      }))
    }
  }

  const handleClearAllFilters = () => {
    setFilters({
      status: [],
      assignee: [],
      creator: [],
      priority: [],
      labels: [],
      projectMilestone: [],
      dates: {},
      template: [],
      relations: [],
    })
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
  
      <div className="flex-1 flex">
        <div className="flex-1 flex flex-col">
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Building className="w-4 h-4 text-orange-500" />
              <span>Fallaplabs</span>
              <span>›</span>
              <Building className="w-4 h-4" />
              <span className="text-gray-100">Soma</span>
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-yellow-500 hover:text-yellow-400"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Star className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              </Button>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("overview")} className="text-gray-400 hover-custom">
                  Overview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("issues")} className="text-gray-400 hover-custom">
                  Issues
                </Button>
              </div>
            </div>
          </div>

   
          {activeTab === "overview" && (
            <>
              {/* Sticky Project Header */}
              <div className="border-b border-gray-800 p-6 bg-gray-950">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-100">{projectData.name}</h1>
                      <p className="text-gray-400">{projectData.description}</p>
                    </div>
                  </div>

                  {/* Properties Bar */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Properties</span>
                    </div>
                    <Badge variant="outline" className={getStatusColor(projectData.status)}>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      {projectData.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      {getPriorityIcon(projectData.priority)}
                      <span className="text-gray-300">{projectData.priority}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-400">Lead</span>
                      <Avatar className="w-5 h-5">
                        <AvatarFallback className="text-xs bg-gray-700">?</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{projectData.startDate}</span>
                      <span>→</span>
                      <span>{projectData.targetDate}</span>
                    </div>
                    <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      <Building className="w-3 h-3 mr-1" />
                      {projectData.team}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-6 space-y-6">

              {/* Resources */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Resources</h3>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-800 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-green-400" />
                      <Link href={doc.url} className="text-sm text-gray-100 hover:text-blue-400">
                        {doc.name}
                      </Link>
                      <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    className="text-gray-500 hover:text-gray-300 justify-start p-0 h-auto"
                    onClick={() => setShowDocumentModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add document or link...
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-800" />
                {/* GitHub Issue Integration - Only for imported issues */}
                {activeTab === "overview" && projectData.github.connected && (
                  <div className="border-b border-gray-800 p-6">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                            <GitBranch className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-100">GitHub Integration</h3>
                            <p className="text-sm text-gray-400">
                              Synced with {projectData.github.repository} • Last sync {projectData.github.lastSync}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Connected
                          </Badge>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-100 hover:bg-gray-800">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-100 hover:bg-gray-800">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Repository Essential Information */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-400">Sync Active</span>
                            <span className="text-xs text-gray-500">• Last sync: {projectData.github.lastSync}</span>
                          </div>
                          <Separator orientation="vertical" className="h-4 bg-gray-700" />
                          <div className="flex items-center gap-2">
                            <Lock className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-400 capitalize">{projectData.github.visibility}</span>
                          </div>
                          <Separator orientation="vertical" className="h-4 bg-gray-700" />
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-400">{projectData.github.defaultBranch}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          {projectData.github.repository}
                        </Button>
                      </div>

                      {/* High-Level Metrics - Only 4 Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4 text-red-400" />
                              <span className="text-sm font-medium text-gray-300">Issues</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-gray-100">{projectData.github.stats.openIssues}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">{projectData.github.stats.closedIssues} closed</span>
                                <span className="text-green-400">
                                  •{" "}
                                  {Math.round(
                                    (projectData.github.stats.closedIssues /
                                      (projectData.github.stats.openIssues + projectData.github.stats.closedIssues)) *
                                      100,
                                  )}
                                  % completion rate
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <GitPullRequest className="w-4 h-4 text-green-400" />
                              <span className="text-sm font-medium text-gray-300">Pull Requests</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-gray-100">{projectData.github.stats.openPRs}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">{projectData.github.stats.mergedPRs} merged</span>
                                <span className="text-blue-400">
                                  •{" "}
                                  {Math.round(
                                    (projectData.github.stats.mergedPRs /
                                      (projectData.github.stats.openPRs + projectData.github.stats.mergedPRs)) *
                                      100,
                                  )}
                                  % merge rate
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-medium text-gray-300">Active Contributors</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-gray-100">{projectData.github.stats.contributors}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Last 30 days</span>
                                <span className="text-purple-400">• {projectData.github.stats.totalCommits} commits</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gray-900/50 border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <StarIcon className="w-4 h-4 text-yellow-400" />
                              <span className="text-sm font-medium text-gray-300">Community</span>
                            </div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-gray-100">{projectData.github.stats.stars}</p>
                              <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">{projectData.github.stats.forks} forks</span>
                                <span className="text-yellow-400">• {projectData.github.stats.watchers} watchers</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Quick Actions - Enhanced */}
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSyncRepository}
                          disabled={isSyncing}
                          className="border-blue-700 text-blue-300 hover:bg-blue-800/20 hover:text-white bg-transparent"
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
                          {isSyncing ? "Syncing..." : "Sync Repository"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCreateIssue}
                          className="border-green-700 text-green-300 hover:bg-green-800/20 hover:text-white bg-transparent"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          New Issue
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-purple-700 text-purple-300 hover:bg-purple-800/20 hover:text-white bg-transparent"
                        >
                          <GitPullRequest className="w-3 h-3 mr-1" />
                          New Pull Request
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View Repository
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
                        >
                          <Settings className="w-3 h-3 mr-1" />
                          Project Settings
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Latest Update */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Latest update</h3>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-gray-400 hover-custom text-xs">
                      See all
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover-custom text-xs">
                      New update
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-400">{latestUpdate.status}</span>
                    <Avatar className="w-5 h-5">
                      <AvatarImage src={latestUpdate.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">E</AvatarFallback>
                    </Avatar>
                    <span className="text-gray-400">{latestUpdate.user}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{latestUpdate.timestamp}</span>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-gray-100">{latestUpdate.message}</p>
                    
                      <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-300 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span>all comments</span>
                      </button>
                    </div>
                    {showComments && (
                      <CommentSystem comments={comments} onAddComment={handleAddComment} />
                    )}
                  </div>
                </div>
              </div>

              {/* <Separator /> */}

              {/* <Separator className="bg-gray-800" /> */}

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300">Description</h3>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add description..."
                  className="bg-gray-900 border-gray-800 text-gray-100 placeholder-gray-500 min-h-[100px]"
                />
              </div>

              {/* Milestone */}
              <div className="pt-4">
                <Button variant="ghost" className="text-gray-500 hover:text-gray-300 justify-start p-0 h-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Milestone
                </Button>
              </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "issues" && (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <ProjectIssuesView />
            </div>
          )}
        </div>

        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-300">Properties</h2>
            <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-300">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <Badge variant="outline" className={getStatusColor(projectData.status)}>
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                {projectData.status}
              </Badge>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Priority</span>
              <div className="flex items-center gap-1">
                {getPriorityIcon(projectData.priority)}
                <span className="text-sm text-gray-300">{projectData.priority}</span>
              </div>
            </div>

            {/* Lead */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Lead</span>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-auto p-1">
                <User className="w-4 h-4 mr-1" />
                Add lead
              </Button>
            </div>

            {/* Members */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Members</span>
              <div className="flex items-center gap-2">
                <Avatar className="w-5 h-5">
                  <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                </Avatar>
                <span className="text-xs text-gray-300">{projectData.members[0]}</span>
              </div>
            </div>

            {/* Start date */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Start date</span>
              <div className="flex items-center gap-1 text-sm text-gray-300">
                <Calendar className="w-4 h-4" />
                {projectData.startDate}
              </div>
            </div>

            {/* Target date */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Target date</span>
              <Badge variant="outline" className="bg-red-500/20 text-red-300 border-red-500/30">
                {projectData.targetDate}
              </Badge>
            </div>

            {/* Teams */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Teams</span>
              <Badge variant="outline" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                <Building className="w-3 h-3 mr-1" />
                {projectData.team}
              </Badge>
            </div>

            {/* Labels */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Labels</span>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-auto p-1">
                <Tag className="w-4 h-4 mr-1" />
                Add label
              </Button>
            </div>
          </div>

          <Separator className="bg-gray-800" />

          {/* Milestones */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setMilestonesExpanded(!milestonesExpanded)}
              className="w-full justify-between p-0 h-auto text-sm text-gray-300 hover-custom"
            >
              <span>Milestones</span>
              <div className="flex items-center gap-2">
                {milestonesExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <Plus className="w-4 h-4" />
              </div>
            </Button>

            {milestonesExpanded && (
              <div className="pl-4 text-sm text-gray-500">
                <p>Add milestones to organize work within your project and break it into more granular stages.</p>
                <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm">
                  Learn more
                </Button>
              </div>
            )}
          </div>

          <Separator className="bg-gray-800" />

          {/* Progress */}
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => setProgressExpanded(!progressExpanded)}
              className="w-full justify-between p-0 h-auto text-sm text-gray-300 hover-custom"
            >
              <span>Progress</span>
              {progressExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button>

            {progressExpanded && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-sm"></div>
                    <span className="text-gray-400">Scope</span>
                  </div>
                  <span className="text-gray-300">{projectData.scope}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                    <span className="text-gray-400">Started</span>
                  </div>
                  <span className="text-gray-300">
                    {projectData.started} • {Math.round((projectData.started / projectData.scope) * 100)}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-gray-400">Completed</span>
                  </div>
                  <span className="text-gray-300">
                    {projectData.completed} • {Math.round((projectData.completed / projectData.scope) * 100)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DocumentModal
        isOpen={showDocumentModal}
        onClose={() => setShowDocumentModal(false)}
        onAddDocument={handleAddDocument}
      />

     <GitHubDetailsModal
        isOpen={showGitHubDetailsModal}
        onClose={() => setShowGitHubDetailsModal(false)}
        projectData={projectData}
        onSyncRepository={handleSyncRepository}
        isSyncing={isSyncing}
      />


    <FilterChips filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} />

    <AdvancedFilterPanel
        isOpen={showAdvancedFilters}
        onClose={() => setShowAdvancedFilters(false)}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearAllFilters}
      />


     <NewIssueModal
        isOpen={showNewIssueModal}
        onClose={() => setShowNewIssueModal(false)}
        onCreateIssue={handleCreateNewIssue}
        projectName="Soma"
      />
    </div>
  )
}
