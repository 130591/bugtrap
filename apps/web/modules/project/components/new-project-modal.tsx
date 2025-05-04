"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { NewProjectForm } from "./new-project-form"

export default function NewProjectModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1 px-2.5 py-1 text-xs h-7" onClick={() => setOpen(true)}>
          <Plus size={12} />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-[11px] font-normal">New Project</DialogTitle>
        </DialogHeader>
        <NewProjectForm setShow={setOpen} />

        <div className="flex justify-end gap-2 pt-4 border-t mt-4">
				<Button variant="outline" onClick={() => setOpen(false)} className="cursor-pointer">
					Cancel
				</Button>
				<Button onClick={() => setOpen(false)} className="cursor-pointer">
					Create Project
				</Button>
			</div>
      </DialogContent>
    </Dialog>
  )
}
