'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

type FilterItem = {
  title: string
  controls?: React.ReactNode
  content: React.ReactNode
}

export function FilterCollapseList({ filters }: { filters: FilterItem[] }) {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({})

  const toggleItem = (title: string) => {
    setOpenItems((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  return (
    <>
      {filters.map(({ title, content, controls }) => {
        const isOpen = openItems[title]
        const count = 0

        return (
          <Collapsible key={title} open={isOpen} onOpenChange={() => toggleItem(title)}>
            <CollapsibleTrigger
            className={`group w-full flex justify-between items-center px-3 py-2 rounded cursor-pointer transition-colors ${
              isOpen ? 'bg-[#F0F6FE]' : ''
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[12px] transition-colors group-hover:text-[#121320]">
                {title}
              </span>
            </div>
            {isOpen && controls}
            <div className="flex items-center gap-2">
              {count > 0 && (
                <span className="text-xs bg-[#121320] text-white px-2 py-0.5 rounded-full">
                  {count}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 text-[#121320] transition-transform duration-300 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </CollapsibleTrigger>

            <CollapsibleContent className="mt-2 px-3 pb-3 text-[11px]">
              {content}
            </CollapsibleContent>
          </Collapsible>
        )
      })}
       <div className="p-4 text-[12px] font-normal leading-[19px] text-[rgb(32,33,35)] space-y-2">
          <div className="flex justify-end gap-2 pt-4 border-t mt-6">
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 cursor-pointer">
              Cancel
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer">
              Find
            </button>
          </div>
        </div>
    </>
  )
}
