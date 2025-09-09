"use client"

import ProjectsView from "./components/projects-view"
import ProjectDetailPage from "./partials/project-detail-partial"

export default function ProjectContainerView() {
  return (
    <div className="flex-1 flex flex-col">
      <ProjectsView />
    </div>
  )
}

export function ProjectDetailContainer() {
  return (
    <div className="flex-1 flex flex-col">
      <ProjectDetailPage />
    </div>
  )
}