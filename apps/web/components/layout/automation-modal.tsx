'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { RuleCreation } from './rule-creation'

interface AutomationModalProps {
  open: boolean
  onClose: () => void
}

export function AutomationModal({ open, onClose }: AutomationModalProps) {
  const [trigger, setTrigger] = useState('')
  const [description, setDescription] = useState('')
  const [conditions, setConditions] = useState<string[]>([])
  const [actions, setActions] = useState<string[]>([])

  const addCondition = () => setConditions([...conditions, 'Nova condição'])
  const addAction = () => setActions([...actions, 'Nova ação'])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[50vw] h-[80vh] min-w-[50vw] min-h-[80vh] p-0 overflow-hidden flex flex-col rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 bg-[#FBFBFB] border-b border-border">
          <div className="flex items-center gap-4">
            <div className="w-10 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
              UR
            </div>

            <Input
              defaultValue="Untitled Rule"
              className="border-0 border-b border-muted-foreground rounded-none bg-transparent 
                focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-muted-foreground 
                shadow-none focus:shadow-none text-lg font-medium placeholder:text-muted-foreground"
            />
          </div>

          <Select>
            <SelectTrigger className="w-[160px] border-0 bg-transparent text-right font-medium text-black shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-transparent focus:bg-transparent">
              <SelectValue placeholder="All Layouts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard</SelectItem>
              <SelectItem value="all">All Layouts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700">Description</label>
          </div>

          <RuleCreation />
        </div>

        <DialogFooter className="mt-auto flex justify-center gap-4 px-6 py-4 bg-[#FBFBFB] border-t">
          <Button variant="ghost" className="cursor-pointer" onClick={onClose}>
            Cancel
          </Button>
          <Button className="cursor-pointer">
            Save Rule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
