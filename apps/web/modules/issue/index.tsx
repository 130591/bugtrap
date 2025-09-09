import IssueDetailView from "./partials/issue-detail-view"

interface IssuePageProps {
  params: {
    id: string
  }
}

export default function IssuePage({ params }: IssuePageProps) {
  return <IssueDetailView issueId={params.id} />
}