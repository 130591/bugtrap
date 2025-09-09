"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Plus,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  GitMerge,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  Shield,
  RefreshCw,
  Clock,
  Workflow,
  Copy,
} from "lucide-react"

interface GitHubDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  projectData: any
  onSyncRepository: () => void
  isSyncing: boolean
}

export default function GitHubDetailsModal({
  isOpen,
  onClose,
  projectData,
  onSyncRepository,
  isSyncing,
}: GitHubDetailsModalProps) {
  const getWorkflowStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "failure":
        return <XCircle className="w-4 h-4 text-red-400" />
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-400" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">GitHub Repository Details</DialogTitle>
          <p className="text-sm text-gray-400">Complete overview of {projectData.github.repository}</p>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Repository Essential Information */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-400">Sync Active</span>
                <span className="text-xs text-gray-500">• Last sync: {projectData.github.lastSync}</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-gray-700" />
              <div className="flex items-center gap-2">
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

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Languages */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Languages</h4>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 space-y-3">
                    {projectData.github.stats.languages.map((lang: any) => (
                      <div key={lang.name} className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                          <span className="text-sm text-gray-300">{lang.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: lang.color,
                                width: `${lang.percentage}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{lang.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Pull Requests */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Pull Requests</h4>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    New PR
                  </Button>
                </div>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 space-y-3">
                    {projectData.github.pullRequests.map((pr: any) => (
                      <div key={pr.number} className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <GitPullRequest className="w-4 h-4 text-green-400 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-100">#{pr.number}</span>
                                <span className="text-sm text-gray-300">{pr.title}</span>
                              </div>
                              <p className="text-xs text-gray-500">
                                by {pr.author} • {pr.createdAt}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 ml-6">
                          <Badge
                            variant="outline"
                            className="bg-green-500/20 text-green-300 border-green-500/30 text-xs"
                          >
                            {pr.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              pr.reviewStatus === "approved"
                                ? "bg-green-500/20 text-green-300 border-green-500/30"
                                : "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
                            }`}
                          >
                            {pr.reviewStatus.replace("_", " ")}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {pr.checks === "passing" ? (
                              <CheckCircle className="w-3 h-3 text-green-400" />
                            ) : (
                              <XCircle className="w-3 h-3 text-red-400" />
                            )}
                            <span className="text-xs text-gray-500">{pr.checks}</span>
                          </div>
                          {pr.mergeable && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-700 text-green-300 hover:bg-green-800/20 bg-transparent h-6 px-2 text-xs ml-auto"
                            >
                              <GitMerge className="w-3 h-3 mr-1" />
                              Merge
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* GitHub Actions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">GitHub Actions</h4>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 space-y-3">
                    {projectData.github.workflows.map((workflow: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Workflow className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-100">{workflow.name}</p>
                            <p className="text-xs text-gray-500">
                              Last run {workflow.lastRun} on {workflow.branch}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getWorkflowStatusIcon(workflow.status)}
                          <span
                            className={`text-xs capitalize ${
                              workflow.status === "success"
                                ? "text-green-400"
                                : workflow.status === "failure"
                                  ? "text-red-400"
                                  : workflow.status === "warning"
                                    ? "text-yellow-400"
                                    : "text-gray-400"
                            }`}
                          >
                            {workflow.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Branches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Branches</h4>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100 text-xs">
                    View all
                  </Button>
                </div>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 space-y-3">
                    {projectData.github.branches.map((branch: any) => (
                      <div key={branch.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <GitBranch className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-100">{branch.name}</span>
                              {branch.isDefault && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                                >
                                  default
                                </Badge>
                              )}
                              {branch.isProtected && <Shield className="w-3 h-3 text-yellow-400" />}
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-48">
                              {branch.lastCommit.message} • {branch.lastCommit.timestamp}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Commits */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">Recent Commits</h4>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100 text-xs">
                    View history
                  </Button>
                </div>
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardContent className="p-4 space-y-3">
                    {projectData.github.recentCommits.map((commit: any) => (
                      <div key={commit.sha} className="flex items-start gap-3">
                        <GitCommit className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-100 truncate">{commit.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-gray-400">{commit.sha}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{commit.author}</span>
                            <span className="text-xs text-gray-500">•</span>
                            <span className="text-xs text-gray-500">{commit.timestamp}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100">
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">GitHub Milestones</h4>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-100 text-xs">
                    <Plus className="w-3 h-3 mr-1" />
                    New milestone
                  </Button>
                </div>
                <div className="space-y-3">
                  {projectData.github.milestones.map((milestone: any, index: number) => (
                    <Card key={index} className="bg-gray-900/50 border-gray-800">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="text-sm font-medium text-gray-100">{milestone.title}</h5>
                            <p className="text-xs text-gray-400 mt-1">{milestone.description}</p>
                          </div>
                          <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {milestone.dueDate}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">Progress</span>
                            <span className="text-gray-300">{milestone.progress}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ width: `${milestone.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{milestone.closedIssues} closed</span>
                            <span>{milestone.openIssues} open</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
            <Button
              variant="outline"
              size="sm"
              onClick={onSyncRepository}
              disabled={isSyncing}
              className="border-blue-700 text-blue-300 hover:bg-blue-800/20 bg-transparent"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Repository"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-purple-700 text-purple-300 hover:bg-purple-800/20 bg-transparent"
            >
              <GitPullRequest className="w-3 h-3 mr-1" />
              New Pull Request
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Repository
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Settings className="w-3 h-3 mr-1" />
              Repository Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
