import { FC, useState } from "react"
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

const TABS = [
	"Dashboard",
	"Bugs",
	"Reports",
	"Documents",
	"Phases",
	"Finance",
	"Users",
	"Forums",
	"Pages",
]

interface NewProjectFormProps {
	setShow: any
}

export const NewProjectForm: FC<NewProjectFormProps> = ({ setShow }) => {
	const [tabsOpen, setTabsOpen] = useState(false)
  const [accessOpen, setAccessOpen] = useState(false)
  const [selectedTabs, setSelectedTabs] = useState<string[]>([])

  const toggleTab = (tab: string) => {
    setSelectedTabs((prev) =>
      prev.includes(tab) ? prev.filter(t => t !== tab) : [...prev, tab]
    )
  }

	return (
		<>
		<div className="overflow-y-auto max-h-[calc(90vh-100px)] px-1 pr-2 space-y-4">
		<div className="space-y-4">
			<div className="grid grid-cols-1 gap-4">
				<div className="space-y-1.5">
					<Label className="text-[12px] font-normal">Project Title</Label>
					<Input placeholder="Enter title" />
				</div>
				<div className="space-y-1.5">
					<Label className="text-[12px] font-normal">Owner</Label>
					<Input value="Everton" disabled />
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1.5">
						<Label className="text-[12px] font-normal">Start Date</Label>
						<Input type="date" />
					</div>
					<div className="space-y-1.5">
						<Label className="text-[12px] font-normal">End Date</Label>
						<Input type="date" />
					</div>
				</div>
			</div>

			<div className="space-y-1.5">
				<Label className="text-[12px] font-normal">Description</Label>
				<Textarea placeholder="Project description" rows={3} />
			</div>

			<div className="space-y-1.5">
				<Label className="text-[12px] font-normal">Tags</Label>
				<Input placeholder="Enter a tag name" />
			</div>

			<Collapsible open={tabsOpen} onOpenChange={setTabsOpen}>
				<CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-normal">
					<span>Customize tabs for this project</span>
					{tabsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="grid grid-cols-3 gap-2 mt-2">
						{TABS.map(tab => (
							<button
								key={tab}
								onClick={() => toggleTab(tab)}
								type="button"
								className={cn(
									"text-[13px] px-3 py-1 border rounded-[12px] transition-colors cursor-pointer",
									selectedTabs.includes(tab)
										? "bg-muted text-primary border-muted-foreground"
										: "bg-transparent text-gray-500 border-gray-300 hover:bg-gray-100"
								)}
							>
								{tab}
							</button>
						))}
					</div>
				</CollapsibleContent>
			</Collapsible>

			<Collapsible open={accessOpen} onOpenChange={setAccessOpen}>
				<CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-normal">
					<span>Project Access</span>
					{accessOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
				</CollapsibleTrigger>
				<CollapsibleContent>
					<div className="space-y-2 mt-2">
						<div className="flex items-start gap-2">
							<Checkbox id="private" className="cursor-pointer" />
							<label htmlFor="private" className="text-sm font-normal text-[12px]">
								<span className="font-medium">Private</span><br />
								Only project users can view and access this project.
							</label>
						</div>
						<div className="flex items-start gap-2">
							<Checkbox id="public" className="cursor-pointer" />
							<label htmlFor="public" className="text-sm font-normal text-[12px]">
								<span className="font-medium">Public</span><br />
								Portal users can only view, follow, and comment whereas, project users will have complete access.
							</label>
						</div>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</div>
	</div>
	</>
	)
}