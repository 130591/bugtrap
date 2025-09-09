"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import RichMDXEditor from "../components/rich-editor"
import {
  Star,
  Plus,
  MoreHorizontal,
  Circle,
  BarChart3,
  AlertCircle,
  Github,
  Copy,
  Bug,
  Lightbulb,
  CheckCircle2,
  User,
  Diamond,
  Building,
  LinkIcon,
  ChevronDown,
  ChevronRight,
  Settings,
  X,
  Check,
  Edit,
  Save,
  GitBranch,
  GitPullRequest,
  GitMerge,
  ExternalLink,
  Send as Sync,
  Play,
  Square,
  GitCommit,
  Eye,
  Shield,
  Lock,
  RefreshCw,
  Workflow,
  MessageSquare,
  Send,
  Smile,
} from "lucide-react"

interface IssueDetailViewProps {
  issueId: string
}

interface Toast {
  id: string
  message: string
  type: "success" | "info" | "error"
}

export interface ExternalIntegration {
  connected: boolean
  provider: "github" | "gitlab" | null
  repository: string
  issueNumber: number
  status: "open" | "closed"
  state: "open" | "closed"
  assignees: any[]
  labels: any[]
  milestone: any
  pullRequests: any[]
  branches: any[]
  commits: any[]
  workflows: any[]
  lastSync: string
  isImported: boolean // true if imported from external source, false if created in BugTrap
}

export default function IssueDetailView({ issueId }: IssueDetailViewProps) {
  const [isSubIssueModalOpen, setIsSubIssueModalOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [subIssueTitle, setSubIssueTitle] = useState("")
  const [subIssueDescription, setSubIssueDescription] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(true)
  const [subIssuesExpanded, setSubIssuesExpanded] = useState(true)
  const [comments, setComments] = useState<any[]>([])
  const [subIssues, setSubIssues] = useState([{ id: "teste", title: "teste", status: "open", assignee: null }])
  const [toasts, setToasts] = useState<Toast[]>([])
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [editedDescription, setEditedDescription] = useState("I need to solve this issue !!")
  const [isFullscreenEditor, setIsFullscreenEditor] = useState(false)
  const [activeIntegrationTab, setActiveIntegrationTab] = useState("overview")
  const [isCreatingBranch, setIsCreatingBranch] = useState(false)
  const [isCreatingPR, setIsCreatingPR] = useState(false)
  const [newBranchName, setNewBranchName] = useState("")
  const [prTitle, setPrTitle] = useState("")
  const [prDescription, setPrDescription] = useState("")
  const [isSyncing, setIsSyncing] = useState(false)
  const [commentReactions, setCommentReactions] = useState<Record<string, Record<string, { count: number; users: string[] }>>>({})
  const [reactionPickerOpen, setReactionPickerOpen] = useState<string | null>(null)
  const currentUser = "everton.paixao16@gmail.com" // In real app, get from auth context

  const [externalIntegration, setExternalIntegration] = useState<ExternalIntegration>({
    connected: true,
    provider: "github",
    repository: "fallaplabs/soma",
    issueNumber: 42,
    status: "open",
    state: "open",
    assignees: [
      {
        login: "everton-paixao",
        avatar_url: "/placeholder.svg?height=24&width=24",
        html_url: "https://github.com/everton-paixao",
      },
    ],
    labels: [
      { name: "bug", color: "d73a49", description: "Something isn't working" },
      { name: "enhancement", color: "a2eeef", description: "New feature or request" },
      { name: "good first issue", color: "7057ff", description: "Good for newcomers" },
    ],
    milestone: {
      title: "v1.0.0",
      description: "First stable release",
      due_on: "2024-12-31",
      state: "open",
      progress: 65,
    },
    pullRequests: [
      {
        number: 15,
        title: "Fix integration with Slack API",
        state: "open",
        draft: false,
        author: "contributor-dev",
        created_at: "2024-01-15",
        mergeable: true,
        checks_status: "success",
        reviews_status: "approved",
      },
      {
        number: 12,
        title: "Add error handling for API calls",
        state: "merged",
        draft: false,
        author: "everton-paixao",
        created_at: "2024-01-10",
        merged_at: "2024-01-12",
      },
    ],
    branches: [
      {
        name: "feature/slack-integration",
        protected: false,
        ahead: 3,
        behind: 0,
        last_commit: "2h ago",
      },
      {
        name: "hotfix/api-error-handling",
        protected: false,
        ahead: 0,
        behind: 2,
        last_commit: "1d ago",
      },
    ],
    commits: [
      {
        sha: "abc123",
        message: "Fix Slack API integration",
        author: "everton-paixao",
        date: "2h ago",
        verified: true,
      },
      {
        sha: "def456",
        message: "Add error handling",
        author: "contributor-dev",
        date: "1d ago",
        verified: false,
      },
    ],
    workflows: [
      {
        name: "CI/CD Pipeline",
        status: "success",
        conclusion: "success",
        run_number: 42,
        created_at: "2h ago",
      },
      {
        name: "Security Scan",
        status: "in_progress",
        conclusion: null,
        run_number: 41,
        created_at: "3h ago",
      },
    ],
    lastSync: "2 minutes ago",
    isImported: true, // Set to false for BugTrap-only issues
  })

  // Mock data - in real app would come from API
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

  const activityFeed = [
    {
      id: 1,
      user: "everton.paixao16@gmail.com",
      avatar: "/placeholder.svg?height=24&width=24",
      action: "created this issue",
      timestamp: "4mo ago",
      type: "created",
    },
    {
      id: 2,
      user: "everton.paixao16@gmail.com",
      avatar: "/placeholder.svg?height=24&width=24",
      action: "self-assigned the issue and added to project Soma",
      timestamp: "4mo ago",
      type: "assigned",
    },
    {
      id: 3,
      user: "everton.paixao16@gmail.com",
      avatar: "/placeholder.svg?height=24&width=24",
      action: "added label",
      label: "Improvement",
      timestamp: "4mo ago",
      type: "labeled",
    },
    ...comments,
  ]

  const priorityOptions = [
    { value: "none", label: "No priority", count: 0, icon: Circle },
    { value: "urgent", label: "Urgent", count: 1, icon: AlertCircle, color: "text-red-500" },
    { value: "high", label: "High", count: 2, icon: BarChart3, color: "text-red-500" },
    { value: "medium", label: "Medium", count: 3, icon: BarChart3, color: "text-yellow-500" },
    { value: "low", label: "Low", count: 4, icon: BarChart3, color: "text-green-500" },
  ]

  const milestoneOptions = [
    { value: "none", label: "No milestone", count: 0 },
    { value: "teste", label: "teste", date: "Aug 22" },
    { value: "my-milestone", label: "My milestone", date: "Aug 28" },
  ]

  const labelSuggestions = [
    { name: "Bug", color: "bg-red-500", description: "Something isn't working", selected: false },
    { name: "enhancement", color: "bg-blue-500", description: "New feature or request", selected: false },
    { name: "good first issue", color: "bg-green-500", description: "Good for newcomers", selected: false },
    { name: "help wanted", color: "bg-purple-500", description: "Extra attention is needed", selected: false },
    {
      name: "documentation",
      color: "bg-cyan-500",
      description: "Improvements or additions to documentation",
      selected: false,
    },
    {
      name: "duplicate",
      color: "bg-gray-500",
      description: "This issue or pull request already exists",
      selected: false,
    },
  ]

  const frequentlyUsedLabels = [{ name: "Improvement", color: "bg-cyan-500" }]

  const allLabels = [{ name: "Feature", color: "bg-purple-500" }]

  const displayProperties = [
    { key: "priority", label: "Priority", enabled: true },
    { key: "sla", label: "SLA", enabled: false },
    { key: "id", label: "ID", enabled: true },
    { key: "status", label: "Status", enabled: true },
    { key: "labels", label: "Labels", enabled: true },
    { key: "createDate", label: "Create date", enabled: false },
    { key: "milestone", label: "Milestone", enabled: false },
    { key: "dueDate", label: "Due date", enabled: false },
    { key: "links", label: "Links", enabled: false },
    { key: "assignee", label: "Assignee", enabled: true },
  ]

  // Toast management
  const addToast = (message: string, type: "success" | "info" | "error" = "info") => {
    const id = Date.now().toString()
    const newToast = { id, message, type }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // GitHub Integration Functions
  const handleSyncWithGitHub = async () => {
    setIsSyncing(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsSyncing(false)
    addToast("Successfully synced with GitHub", "success")
  }

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return
    setIsCreatingBranch(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newBranch = {
      name: newBranchName,
      protected: false,
      ahead: 0,
      behind: 0,
      last_commit: "just now",
    }

    setExternalIntegration((prev) => ({
      ...prev,
      branches: [newBranch, ...prev.branches],
    }))

    setIsCreatingBranch(false)
    setNewBranchName("")
    addToast(`Branch "${newBranchName}" created successfully`, "success")
  }

  const handleCreatePullRequest = async () => {
    if (!prTitle.trim()) return
    setIsCreatingPR(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const newPR = {
      number: externalIntegration.pullRequests.length + 16,
      title: prTitle,
      state: "open" as const,
      draft: false,
      author: "everton-paixao",
      created_at: new Date().toISOString(),
      mergeable: true,
      checks_status: "pending" as const,
      reviews_status: "pending" as const,
    }

    setExternalIntegration((prev) => ({
      ...prev,
      pullRequests: [newPR, ...prev.pullRequests],
    }))

    setIsCreatingPR(false)
    setPrTitle("")
    setPrDescription("")
    addToast(`Pull Request #${newPR.number} created successfully`, "success")
  }

  const handleCloseIssue = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setExternalIntegration((prev) => ({
      ...prev,
      status: "closed",
      state: "closed",
    }))

    addToast("Issue closed on GitHub", "success")
  }

  const handleReopenIssue = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setExternalIntegration((prev) => ({
      ...prev,
      status: "open",
      state: "open",
    }))

    addToast("Issue reopened on GitHub", "success")
  }

  const handleLockIssue = async () => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    addToast("Issue locked on GitHub", "success")
  }

  const handleAssignToGitHub = async (username: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    addToast(`Assigned to ${username} on GitHub`, "success")
  }

  const handleAddLabelToGitHub = async (labelName: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    addToast(`Label "${labelName}" added on GitHub`, "success")
  }

  const handleMergePR = async (prNumber: number) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setExternalIntegration((prev) => ({
      ...prev,
      pullRequests: prev.pullRequests.map((pr) =>
        pr.number === prNumber ? { ...pr, state: "merged" as const, merged_at: new Date().toISOString() } : pr,
      ),
    }))

    addToast(`Pull Request #${prNumber} merged successfully`, "success")
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      if (e.key === "p" || e.key === "P") {
        e.preventDefault()
        // Open project dropdown
      }
      if (e.key === "d" || e.key === "D") {
        e.preventDefault()
        // Open due date dropdown
      }
      if (e.key === "l" || e.key === "L") {
        e.preventDefault()
        // Open labels dropdown
      }
      if (e.key === "g" && e.ctrlKey) {
        e.preventDefault()
        setActiveIntegrationTab("overview")
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const getPriorityIcon = (priority: string) => {
    const option = priorityOptions.find((p) => p.label === priority)
    if (!option) return <Circle className="w-3 h-3 text-gray-500" />
    const Icon = option.icon
    return <Icon className={`w-3 h-3 ${option.color || "text-gray-500"}`} />
  }

  const getLabelColor = (label: string) => {
    const colors: Record<string, string> = {
      Improvement: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      "good first issue": "bg-green-500/20 text-green-300 border-green-500/30",
      "help wanted": "bg-purple-500/20 text-purple-300 border-purple-500/30",
      bug: "bg-red-500/20 text-red-300 border-red-500/30",
      Bug: "bg-red-500/20 text-red-300 border-red-500/30",
      enhancement: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      documentation: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      Feature: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    }
    return colors[label] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-400"
      case "failure":
      case "error":
        return "text-red-400"
      case "in_progress":
      case "pending":
        return "text-yellow-400"
      default:
        return "text-gray-400"
    }
  }

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        user: "everton.paixao16@gmail.com",
        avatar: "/placeholder.svg?height=24&width=24",
        action: newComment,
        timestamp: "just now",
        type: "comment",
        isComment: true,
      }
      setComments((prev) => [...prev, comment])
      setNewComment("")
    }
  }

  const handleCreateSubIssue = () => {
    if (subIssueTitle.trim()) {
      const newSubIssue = {
        id: subIssueTitle.toLowerCase(),
        title: subIssueTitle,
        status: "open",
        assignee: null,
      }
      setSubIssues((prev) => [...prev, newSubIssue])
      setIsSubIssueModalOpen(false)
      setSubIssueTitle("")
      setSubIssueDescription("")
    }
  }

  const handleSaveDescription = () => {
    setEditedDescription(editedDescription)
    setIsEditingDescription(false)
    addToast("Issue description updated", "success")
  }

  const handleCopyBranchName = () => {
    const branchName = `everton.paixao16/fal-10-how-to-solve-this`
    navigator.clipboard.writeText(branchName)
    addToast("Branch name copied to clipboard. Paste it into your favorite git client.", "success")
  }

  const handleCopyIssueId = () => {
    navigator.clipboard.writeText("FAL-10")
    addToast('"FAL-10" copied to clipboard', "success")
  }

  const handleCopyIssueUrl = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    addToast("Issue URL copied to clipboard", "success")
  }

  // Reaction handlers
  const availableReactions = [
    { emoji: "👍", name: "thumbs_up" },
    { emoji: "👎", name: "thumbs_down" },
    { emoji: "😄", name: "laugh" },
    { emoji: "🎉", name: "hooray" },
    { emoji: "❤️", name: "heart" },
    { emoji: "🚀", name: "rocket" },
    { emoji: "👀", name: "eyes" },
  ]

  const handleReaction = (commentId: string, reactionName: string) => {
    setCommentReactions(prev => {
      const commentReactions = prev[commentId] || {}
      const newCommentReactions = { ...commentReactions }
      
      // Remove user's previous reaction if exists
      Object.keys(newCommentReactions).forEach(existingReaction => {
        const reaction = newCommentReactions[existingReaction]
        if (reaction.users.includes(currentUser)) {
          reaction.users = reaction.users.filter(user => user !== currentUser)
          reaction.count = reaction.users.length
          if (reaction.count === 0) {
            delete newCommentReactions[existingReaction]
          }
        }
      })
      
      // Add or toggle current reaction
      const currentReaction = newCommentReactions[reactionName] || { count: 0, users: [] }
      if (!currentReaction.users.includes(currentUser)) {
        currentReaction.users = [...currentReaction.users, currentUser]
        currentReaction.count = currentReaction.users.length
        newCommentReactions[reactionName] = currentReaction
      }

      return {
        ...prev,
        [commentId]: newCommentReactions
      }
    })
    
    setReactionPickerOpen(null)
  }

  const getReactionCount = (commentId: string, reactionName: string) => {
    return commentReactions[commentId]?.[reactionName]?.count || 0
  }

  const hasUserReacted = (commentId: string, reactionName: string) => {
    return commentReactions[commentId]?.[reactionName]?.users.includes(currentUser) || false
  }

  const getCommentReactions = (commentId: string) => {
    const reactions = commentReactions[commentId] || {}
    return Object.entries(reactions).filter(([_, reaction]) => reaction.count > 0)
  }

  const getReactionUsers = (commentId: string, reactionName: string) => {
    return commentReactions[commentId]?.[reactionName]?.users || []
  }

  const getReactionBackgroundColor = (reactionName: string, hasUserReacted: boolean) => {
    if (!hasUserReacted) return "text-gray-500 hover:text-gray-300 hover:bg-gray-700/50"
    
    switch (reactionName) {
      case "thumbs_down":
        return "bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30"
      case "eyes":
        return "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30"
      default:
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30"
    }
  }

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">

      {/* Main Content */}
      <div className="flex-1 flex min-w-0">
        {/* Center Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="border-b border-gray-800 p-4">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <Building className="w-4 h-4" />
              <span>Fallaplabs</span>
              <span>›</span>
              <Building className="w-4 h-4" />
              <span>Soma</span>
              <span>›</span>
              <span className="text-gray-100">{issueData.id}</span>
              <Button variant="ghost" size="icon" className="ml-2 text-gray-500 hover:text-yellow-400 hover:bg-gray-800/50">
                <Star className="w-4 h-4" />
              </Button>

              {/* External Integration Status */}
              {externalIntegration.connected && externalIntegration.isImported && (
                <div className="ml-auto flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSyncWithGitHub}
                    disabled={isSyncing}
                    className="text-gray-400 hover:text-gray-100"
                  >
                    {isSyncing ? (
                      <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                    ) : externalIntegration.provider === "gitlab" ? (
                      <GitBranch className="w-4 h-4 mr-1" />
                    ) : (
                      <Github className="w-4 h-4 mr-1" />
                    )}
                    {isSyncing ? "Syncing..." : `#${externalIntegration.issueNumber}`}
                  </Button>
                  <Badge
                    variant="outline"
                    className={`${
                      externalIntegration.state === "open"
                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                        : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    }`}
                  >
                    {externalIntegration.state}
                  </Badge>
                  <span className="text-xs text-gray-500">1 / 2</span>
                  <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Issue Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            <div className="p-6 space-y-6 max-w-full">
              {/* Issue Header */}
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-gray-100">{issueData.title}</h1>

                {/* Parent Issue Link */}
                {issueData.parentIssue && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Sub-issue of</span>
                    <Circle className="w-3 h-3" />
                    <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto">
                      {issueData.parentIssue.id} {issueData.parentIssue.title}
                    </Button>
                    <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700">
                      0/1
                    </Badge>
                  </div>
                )}

                {/* Issue Description */}
                <div className="bg-gray-900 rounded-lg border border-gray-800">
                  {isEditingDescription ? (
                    <div className="p-4">
                      <RichMDXEditor
                        value={editedDescription}
                        onChange={setEditedDescription}
                        placeholder="Describe the issue in detail..."
                        isFullscreen={isFullscreenEditor}
                        onToggleFullscreen={() => setIsFullscreenEditor(!isFullscreenEditor)}
                      />
                      <div className="flex items-center justify-end gap-2 mt-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setIsEditingDescription(false)
                            setEditedDescription(issueData.description)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveDescription}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="prose prose-invert max-w-none">
                            <p className="text-gray-100">{issueData.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingDescription(true)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-100"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* GitHub Issue Integration - Only for imported issues */}
              {externalIntegration.connected && externalIntegration.isImported && (
                <>
                  <Separator className="bg-gray-800" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {externalIntegration.provider === "gitlab" ? (
                          <GitBranch className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Github className="w-5 h-5 text-gray-400" />
                        )}
                        <h3 className="text-sm font-medium text-gray-300">
                          {externalIntegration.provider === "gitlab" ? "GitLab" : "GitHub"} Integration
                        </h3>
                        <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Last sync: {externalIntegration.lastSync}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleSyncWithGitHub}
                          disabled={isSyncing}
                          className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                        >
                          {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sync className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <Tabs value={activeIntegrationTab} onValueChange={setActiveIntegrationTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-5 bg-gray-800">
                        <TabsTrigger value="overview" className="text-xs">
                          Overview
                        </TabsTrigger>
                        <TabsTrigger value="branches" className="text-xs">
                          Branches
                        </TabsTrigger>
                        <TabsTrigger value="prs" className="text-xs">
                          Pull Requests
                        </TabsTrigger>
                        <TabsTrigger value="commits" className="text-xs">
                          Commits
                        </TabsTrigger>
                        <TabsTrigger value="workflows" className="text-xs">
                          Workflows
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="overview" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Quick Actions */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-300">Quick Actions</h4>
                            <div className="space-y-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                onClick={() => setIsCreatingBranch(true)}
                              >
                                <GitBranch className="w-4 h-4 mr-2" />
                                Create Branch
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                onClick={() => setIsCreatingPR(true)}
                              >
                                <GitPullRequest className="w-4 h-4 mr-2" />
                                Create Pull Request
                              </Button>
                              {externalIntegration.state === "open" ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                  onClick={handleCloseIssue}
                                >
                                  <Square className="w-4 h-4 mr-2" />
                                  Close Issue
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                  onClick={handleReopenIssue}
                                >
                                  <Play className="w-4 h-4 mr-2" />
                                  Reopen Issue
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                                onClick={handleLockIssue}
                              >
                                <Lock className="w-4 h-4 mr-2" />
                                Lock Conversation
                              </Button>
                            </div>
                          </div>

                          {/* Issue Stats */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-300">Issue Stats</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Repository</span>
                                <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto text-sm">
                                  {externalIntegration.repository}
                                  <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Issue Number</span>
                                <span className="text-gray-300">#{externalIntegration.issueNumber}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Assignees</span>
                                <div className="flex items-center gap-1">
                                  {externalIntegration.assignees.map((assignee, index) => (
                                    <Avatar key={index} className="w-5 h-5">
                                      <AvatarImage src={assignee.avatar_url || "/placeholder.svg"} />
                                      <AvatarFallback className="text-xs bg-pink-600">
                                        {assignee.login.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-400">Labels</span>
                                <div className="flex items-center gap-1">
                                  {externalIntegration.labels.slice(0, 2).map((label, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                      style={{
                                        backgroundColor: `#${label.color}20`,
                                        borderColor: `#${label.color}50`,
                                        color: `#${label.color}`,
                                      }}
                                    >
                                      {label.name}
                                    </Badge>
                                  ))}
                                  {externalIntegration.labels.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                      +{externalIntegration.labels.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Milestone Progress */}
                        {externalIntegration.milestone && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-gray-300">Milestone Progress</h4>
                            <div className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-100">
                                  {externalIntegration.milestone.title}
                                </span>
                                <span className="text-xs text-gray-400">{externalIntegration.milestone.progress}%</span>
                              </div>
                              <Progress value={externalIntegration.milestone.progress} className="h-2 mb-2" />
                              <p className="text-xs text-gray-400">{externalIntegration.milestone.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">
                                  Due: {new Date(externalIntegration.milestone.due_on).toLocaleDateString()}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                                >
                                  {externalIntegration.milestone.state}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>

                      <TabsContent value="branches" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-300">Branches</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreatingBranch(true)}
                            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            New Branch
                          </Button>
                        </div>

                        <div className="space-y-2">
                          {externalIntegration.branches.map((branch, index) => (
                            <div key={index} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <GitBranch className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-100">{branch.name}</span>
                                  {branch.protected && (
                                    <Badge
                                      variant="outline"
                                      className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs"
                                    >
                                      <Shield className="w-3 h-3 mr-1" />
                                      Protected
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  {branch.ahead > 0 && <span className="text-green-400">+{branch.ahead}</span>}
                                  {branch.behind > 0 && <span className="text-red-400">-{branch.behind}</span>}
                                  <span>{branch.last_commit}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                      </TabsContent>

                      <TabsContent value="prs" className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-300">Pull Requests</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsCreatingPR(true)}
                            className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            New PR
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {externalIntegration.pullRequests.map((pr, index) => (
                            <div key={index} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <GitPullRequest
                                      className={`w-4 h-4 ${
                                        pr.state === "open"
                                          ? "text-green-400"
                                          : pr.state === "merged"
                                            ? "text-purple-400"
                                            : "text-red-400"
                                      }`}
                                    />
                                    <span className="text-sm font-medium text-gray-100">
                                      #{pr.number} {pr.title}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${
                                        pr.state === "open"
                                          ? "bg-green-500/20 text-green-300 border-green-500/30"
                                          : pr.state === "merged"
                                            ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                                            : "bg-red-500/20 text-red-300 border-red-500/30"
                                      }`}
                                    >
                                      {pr.state}
                                    </Badge>
                                    {pr.draft && (
                                      <Badge
                                        variant="outline"
                                        className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs"
                                      >
                                        Draft
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>by {pr.author}</span>
                                    <span>{new Date(pr.created_at).toLocaleDateString()}</span>
                                    {pr.mergeable !== undefined && (
                                      <span className={pr.mergeable ? "text-green-400" : "text-red-400"}>
                                        {pr.mergeable ? "Mergeable" : "Conflicts"}
                                      </span>
                                    )}
                                  </div>
                                  {pr.state === "open" && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <div
                                        className={`flex items-center gap-1 text-xs ${getStatusColor(pr.checks_status)}`}
                                      >
                                        <Circle className="w-2 h-2 fill-current" />
                                        Checks: {pr.checks_status}
                                      </div>
                                      <div
                                        className={`flex items-center gap-1 text-xs ${getStatusColor(pr.reviews_status)}`}
                                      >
                                        <Eye className="w-3 h-3" />
                                        Reviews: {pr.reviews_status}
                                      </div>
                                    </div>
                                  )}
                                </div>
                                {pr.state === "open" && pr.mergeable && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMergePR(pr.number)}
                                    className="bg-green-600 border-green-500 text-white hover:bg-green-700"
                                  >
                                    <GitMerge className="w-4 h-4 mr-1" />
                                    Merge
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                      </TabsContent>

                      <TabsContent value="commits" className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">Recent Commits</h4>
                        <div className="space-y-2">
                          {externalIntegration.commits.map((commit, index) => (
                            <div key={index} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <GitCommit className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-100">{commit.message}</span>
                                    {commit.verified && (
                                      <Badge
                                        variant="outline"
                                        className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                                      >
                                        <Shield className="w-3 h-3 mr-1" />
                                        Verified
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>by {commit.author}</span>
                                    <span>{commit.date}</span>
                                    <code className="bg-gray-700 px-1 rounded text-xs">
                                      {commit.sha.substring(0, 7)}
                                    </code>
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="workflows" className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-300">GitHub Actions</h4>
                        <div className="space-y-2">
                          {externalIntegration.workflows.map((workflow, index) => (
                            <div key={index} className="bg-gray-900/50 border border-gray-800/50 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Workflow className={`w-4 h-4 ${getStatusColor(workflow.status)}`} />
                                  <span className="text-sm text-gray-100">{workflow.name}</span>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ${
                                      workflow.conclusion === "success"
                                        ? "bg-green-500/20 text-green-300 border-green-500/30"
                                        : workflow.conclusion === "failure"
                                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                                          : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                                    }`}
                                  >
                                    {workflow.conclusion || workflow.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <span>#{workflow.run_number}</span>
                                  <span>{workflow.created_at}</span>
                                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* Create Branch Dialog - Outside tabs so it can be triggered from Overview */}
                    <Dialog open={isCreatingBranch} onOpenChange={setIsCreatingBranch}>
                      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100">
                        <DialogHeader>
                          <DialogTitle>Create New Branch</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="branch-name">Branch Name</Label>
                            <Input
                              id="branch-name"
                              value={newBranchName}
                              onChange={(e) => setNewBranchName(e.target.value)}
                              placeholder="feature/new-feature"
                              className="bg-gray-800 border-gray-700 text-gray-100"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsCreatingBranch(false)}>
                              Cancel
                            </Button>
                            <Button
                              onClick={handleCreateBranch}
                              disabled={!newBranchName.trim() || isCreatingBranch}
                            >
                              {isCreatingBranch ? "Creating..." : "Create Branch"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Create PR Dialog - Outside tabs so it can be triggered from Overview */}
                    <Dialog open={isCreatingPR} onOpenChange={setIsCreatingPR}>
                      <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Pull Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="pr-title">Title</Label>
                            <Input
                              id="pr-title"
                              value={prTitle}
                              onChange={(e) => setPrTitle(e.target.value)}
                              placeholder="Add a descriptive title"
                              className="bg-gray-800 border-gray-700 text-gray-100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="pr-description">Description</Label>
                            <RichMDXEditor
                              value={prDescription}
                              onChange={setPrDescription}
                              placeholder="Describe your changes..."
                              variant="comment"
                              maxHeight={150}
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsCreatingPR(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleCreatePullRequest} disabled={!prTitle.trim() || isCreatingPR}>
                              {isCreatingPR ? "Creating..." : "Create Pull Request"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}

              <Separator className="bg-gray-800" />

              {/* Sub-issues Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:text-gray-200 hover:bg-gray-800/50 p-0"
                      onClick={() => setSubIssuesExpanded(!subIssuesExpanded)}
                    >
                      {subIssuesExpanded ? (
                        <ChevronDown className="w-4 h-4 mr-1" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mr-1" />
                      )}
                      Sub-issues
                    </Button>
                    <Badge variant="outline" className="bg-gray-800 text-gray-400 border-gray-700 text-xs">
                      0/{subIssues.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-300">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-900 border-gray-800 w-80">
                        <div className="p-4 space-y-4">
                          <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Ordering</Label>
                            <Select defaultValue="manual">
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800">
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="priority">Priority</SelectItem>
                                <SelectItem value="created">Created</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm text-gray-300">Completed issues</Label>
                            <Select defaultValue="all">
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-900 border-gray-800">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="hide">Hide</SelectItem>
                                <SelectItem value="show-only">Show only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm text-gray-300">Display properties</Label>
                            <div className="grid grid-cols-2 gap-2">
                              {displayProperties.map((prop) => (
                                <div key={prop.key} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={prop.key}
                                    defaultChecked={prop.enabled}
                                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-blue-600"
                                  />
                                  <Label htmlFor={prop.key} className="text-xs text-gray-400">
                                    {prop.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                      onClick={() => setIsSubIssueModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add sub-issues
                    </Button>
                  </div>
                </div>

                {subIssuesExpanded && (
                  <div className="space-y-2">
                    {subIssues.map((subIssue) => (
                      <div
                        key={subIssue.id}
                        className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 cursor-pointer border border-gray-800/50"
                      >
                        <Circle className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-100 flex-1">{subIssue.title}</span>
                        <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-300">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="bg-gray-800" />

              {/* Activity Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-300">Activity</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${
                        isSubscribed ? "text-blue-400 hover:text-blue-300 hover:bg-gray-800/50" : "text-gray-400 hover:text-gray-200 hover:bg-gray-800/50"
                      }`}
                      onClick={() => setIsSubscribed(!isSubscribed)}
                    >
                      {isSubscribed ? "Unsubscribe" : "Subscribe"}
                    </Button>
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                  {activityFeed.map((activity) => (
                    <div key={activity.id} className="flex gap-3">
                      <Avatar className="w-6 h-6 mt-1">
                        <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-pink-600">
                          {activity.user.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium text-gray-100">{activity.user}</span>
                          {activity.isComment ? (
                            <div className="mt-1">
                              <span className="text-gray-500 text-xs">{activity.timestamp}</span>
                              <div className="mt-1 text-gray-100">{activity.action}</div>
                            </div>
                          ) : (
                            <>
                              <span className="text-gray-400 ml-1">{activity.action}</span>
                              {activity.label && (
                                <Badge variant="outline" className={`ml-2 text-xs ${getLabelColor(activity.label)}`}>
                                  {activity.label}
                                </Badge>
                              )}
                              <span className="text-gray-500 ml-2">• {activity.timestamp}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comments Section */}
                <Separator className="bg-gray-800" />
                <div id="comments-section" className="space-y-4">
                  {/* Show "No comments yet" when there are no comments */}
                  {comments.length === 0 && (
                    <div className="text-center py-8 bg-gray-900/30 rounded-lg border border-gray-800/50">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                        <MessageSquare className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm">No comments yet</p>
                      <p className="text-gray-500 text-xs mt-1">Be the first to share your thoughts</p>
                    </div>
                  )}

                  {/* Show comments list when there are comments */}
                  {comments.length > 0 && (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                          <div className="flex gap-3">
                            <Avatar className="w-7 h-7">
                              <AvatarImage src={comment.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs bg-pink-600">
                                {comment.user.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-100">{comment.user}</span>
                                <span className="text-gray-500 text-sm">commented {comment.timestamp}</span>
                              </div>
                              <div className="prose prose-invert prose-sm max-w-none">
                                <p className="text-gray-200 leading-relaxed">{comment.action}</p>
                              </div>
                              <div className="flex items-center gap-2 pt-2">
                                {/* Reaction picker */}
                                <DropdownMenu 
                                  open={reactionPickerOpen === comment.id} 
                                  onOpenChange={(open) => setReactionPickerOpen(open ? comment.id : null)}
                                >
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 px-2 text-gray-500 hover:text-gray-300 hover:bg-gray-700/50 transition-all duration-200"
                                    >
                                      <Smile className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent className="bg-gray-900 border-gray-800 p-2">
                                    <div className="flex items-center gap-1">
                                      {availableReactions.map((reaction) => (
                                        <Button
                                          key={reaction.name}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleReaction(comment.id, reaction.name)}
                                          className="h-8 w-8 p-0 hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                                        >
                                          <span className="text-lg">{reaction.emoji}</span>
                                        </Button>
                                      ))}
                                    </div>
                                  </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Show existing reactions */}
                                {getCommentReactions(comment.id).map(([reactionName, reaction]) => {
                                  const reactionEmoji = availableReactions.find(r => r.name === reactionName)?.emoji
                                  const users = getReactionUsers(comment.id, reactionName)
                                  const userReacted = hasUserReacted(comment.id, reactionName)
                                  
                                  return (
                                    <Button
                                      key={reactionName}
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleReaction(comment.id, reactionName)}
                                      title={`${users.join(', ')} reacted with ${reactionEmoji}`}
                                      className={`h-7 px-2 transition-all duration-200 ${getReactionBackgroundColor(reactionName, userReacted)}`}
                                    >
                                      <span className="mr-1 transition-transform duration-200 hover:scale-110">
                                        {reactionEmoji}
                                      </span>
                                      {reaction.count}
                                    </Button>
                                  )
                                })}
                                <div className="ml-auto">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-6 h-6 text-gray-500 hover:text-gray-300"
                                      >
                                        <MoreHorizontal className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="bg-gray-900 border-gray-800">
                                      <DropdownMenuItem className="text-gray-300">
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-gray-300">
                                        <Copy className="w-4 h-4 mr-2" />
                                        Copy link
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator className="bg-gray-800" />
                                      <DropdownMenuItem className="text-red-400">
                                        <X className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comment Editor - Always visible at the bottom */}
                  <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
                    <div className="flex gap-3">
                      <Avatar className="w-7 h-7 mt-1">
                        <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <RichMDXEditor
                          value={newComment}
                          onChange={setNewComment}
                          placeholder="Leave a comment..."
                          variant="comment"
                          maxHeight={200}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>Supports Markdown</span>
                            <span>•</span>
                            <span>@mentions</span>
                            <span>•</span>
                            <span>#issues</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleAddComment}
                              disabled={!newComment.trim()}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Send className="w-4 h-4 mr-1" />
                              Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 bg-gray-900 border-l border-gray-800 p-4 space-y-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-300">Properties</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-gray-500 hover:text-gray-200 hover:bg-gray-800/50"
                onClick={handleCopyIssueId}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-gray-500 hover:text-gray-200 hover:bg-gray-800/50"
                onClick={handleCopyIssueUrl}
              >
                <LinkIcon className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-6 h-6 text-gray-500 hover:text-gray-200 hover:bg-gray-800/50">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Status</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-gray-100">
                    <Circle className="w-3 h-3 mr-2 text-gray-400" />
                    {issueData.status}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800">
                  <DropdownMenuItem className="text-gray-300">
                    <Circle className="w-3 h-3 mr-2 text-gray-400 " />
                    Backlog
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300">
                    <Circle className="w-3 h-3 mr-2 text-yellow-400" />
                    Todo
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300">
                    <Circle className="w-3 h-3 mr-2 text-blue-400" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-gray-300">
                    <CheckCircle2 className="w-3 h-3 mr-2 text-green-400" />
                    Done
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Priority</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-gray-100">
                    {getPriorityIcon(issueData.priority)}
                    <span className="ml-2">{issueData.priority}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                      <span>Change priority to...</span>
                      <kbd className="bg-gray-800 px-1 rounded">P</kbd>
                    </div>
                    {priorityOptions.map((option) => {
                      const Icon = option.icon
                      return (
                        <DropdownMenuItem key={option.value} className="text-gray-300 justify-between">
                          <div className="flex items-center">
                            <Icon className={`w-3 h-3 mr-2 ${option.color || "text-gray-500"}`} />
                            {option.label}
                          </div>
                          <span className="text-xs text-gray-500">{option.count}</span>
                        </DropdownMenuItem>
                      )
                    })}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Assignee</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-gray-100">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={issueData.assignee.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{issueData.assignee.name}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2">Assign to...</div>
                    <DropdownMenuItem className="text-gray-300" onClick={() => handleAssignToGitHub("everton-paixao")}>
                      <Avatar className="w-4 h-4 mr-2">
                        <AvatarFallback className="text-xs bg-pink-600">E</AvatarFallback>
                      </Avatar>
                      everton.paixao16@gmail.com
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="text-gray-300">
                      <User className="w-4 h-4 mr-2" />
                      Unassign
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Labels */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Labels</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-4 h-4 text-gray-500 hover:text-gray-300">
                      <Plus className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-800 w-64">
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-300">Add labels...</span>
                        <kbd className="bg-gray-800 px-1 rounded text-xs">L</kbd>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-gray-500 mb-2">GitHub Labels</div>
                          {externalIntegration.labels.map((label) => (
                            <div
                              key={label.name}
                              className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded cursor-pointer"
                              onClick={() => handleAddLabelToGitHub(label.name)}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: `#${label.color}` }}
                              ></div>
                              <span className="text-sm text-gray-300">{label.name}</span>
                              <span className="text-xs text-gray-500 ml-auto">{label.description}</span>
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="text-xs text-gray-500 mb-2">Frequently used</div>
                          {frequentlyUsedLabels.map((label) => (
                            <div key={label.name} className="flex items-center gap-2 p-1 hover:bg-gray-800 rounded">
                              <div className={`w-2 h-2 rounded-full ${label.color}`}></div>
                              <span className="text-sm text-gray-300">{label.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex flex-wrap gap-1">
                {issueData.labels.map((label) => (
                  <Badge key={label} variant="outline" className={`text-xs ${getLabelColor(label)}`}>
                    {label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Project</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-gray-100">
                    <Building className="w-4 h-4 mr-1" />
                    {issueData.project}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800 ">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                      <span>Project</span>
                      <kbd className="bg-gray-800 px-1 rounded">P</kbd>
                    </div>
                    <DropdownMenuItem className="text-gray-300">
                      <Building className="w-4 h-4 mr-2" />
                      Soma
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Milestone */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Milestone</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-500 text-gray-400 hover:text-gray-200 hover:bg-gray-800/50">
                    <Diamond className="w-4 h-4 mr-1" />
                    Set milestone
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2">Set due date</div>
                    <kbd className="bg-gray-800 px-1 rounded text-xs mb-2">D</kbd>
                    {milestoneOptions.map((milestone) => (
                      <DropdownMenuItem key={milestone.value} className="text-gray-300 justify-between">
                        <div className="flex items-center">
                          <Diamond className="w-3 h-3 mr-2 text-gray-400" />
                          {milestone.label}
                        </div>
                        {milestone.date && <span className="text-xs text-gray-500">{milestone.date}</span>}
                        {milestone.value === "my-milestone" && <Check className="w-3 h-3 text-blue-400" />}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* GitHub Integration */}
            <div className="flex items-center justify-between">
              { externalIntegration.isImported && <span className="text-sm text-gray-400">GitHub</span>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                 {externalIntegration.isImported && <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                    <Github className="w-4 h-4 mr-1" />#{externalIntegration.issueNumber}
                  </Button>
                  }
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-800">
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2">GitHub Actions</div>
                    <DropdownMenuItem
                      className="text-gray-300"
                      onClick={() => window.open(issueData.githubIssue.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on GitHub
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-gray-300" onClick={handleCopyBranchName}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy branch name
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuItem className="text-gray-300" onClick={handleSyncWithGitHub}>
                      <Sync className="w-4 h-4 mr-2" />
                      Sync with GitHub
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Timestamps */}
            <Separator className="bg-gray-800" />
            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <span>Created</span>
                <span>{issueData.created}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Updated</span>
                <span>{issueData.updated}</span>
              </div>
              {externalIntegration.connected && externalIntegration.isImported && (
                <div className="flex items-center justify-between">
                  <span>Last GitHub sync</span>
                  <span>{externalIntegration.lastSync}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-issue Creation Modal */}
      <Dialog open={isSubIssueModalOpen} onOpenChange={setIsSubIssueModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-gray-100 max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Create Sub-issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-2">
              <Input
                placeholder="Issue title"
                value={subIssueTitle}
                onChange={(e) => setSubIssueTitle(e.target.value)}
                className="bg-gray-800 border-gray-700 text-gray-100"
              />
            </div>

            <div className="space-y-2">
              <RichMDXEditor
                value={subIssueDescription}
                onChange={setSubIssueDescription}
                placeholder="Add description..."
                className="min-h-[200px]"
              />
            </div>

            {/* Quick Suggestions */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Lightbulb className="w-4 h-4" />
                <span>Quick suggestions</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  Bug
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                  teste
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-gray-700 text-gray-400 hover:bg-gray-800"
                >
                  My milestone
                </Button>
              </div>
            </div>

            {/* Property Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
                <Building className="w-4 h-4 mr-1" />
                FAL
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
                <BarChart3 className="w-4 h-4 mr-1" />
                High
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
                <User className="w-4 h-4 mr-1" />
                Assignee
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
                <Building className="w-4 h-4 mr-1" />
                Soma
              </Button>
              <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300">
                <Diamond className="w-4 h-4 mr-1" />
                My milestone
              </Button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsSubIssueModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSubIssue} disabled={!subIssueTitle.trim()}>
                Create
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center gap-2 max-w-sm shadow-lg"
          >
            <div
              className={`w-4 h-4 rounded-full flex-shrink-0 ${
                toast.type === "success" ? "bg-green-500" : toast.type === "error" ? "bg-red-500" : "bg-blue-500"
              }`}
            ></div>
            <span className="text-sm text-gray-100 flex-1">{toast.message}</span>
            <Button
              variant="ghost"
              size="icon"
              className="w-4 h-4 text-gray-400 hover:text-gray-100"
              onClick={() => removeToast(toast.id)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
