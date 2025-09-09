import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui-old/select"
import { Input } from "@/components/ui-old/input"
import { Search } from "lucide-react"
import { useState } from "react"

export const SearchableSelect = ({ label, options, placeholder }: { label?: string; options: string[]; placeholder?: string; }) => {
  const [search, setSearch] = useState("")

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-700 mb-1">{label}</label>
      <Select>
        <SelectTrigger className="w-full text-[13px]">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center gap-2 px-2 py-1 border-b">
            <Search size={14} className="text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="border-none h-8 focus-visible:ring-0 text-[13px] p-0"
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filteredOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
