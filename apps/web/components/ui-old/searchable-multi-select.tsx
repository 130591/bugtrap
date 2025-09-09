'use client'

import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui-old/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui-old/command"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type Option = {
  label: string
  value: string | number
}

type SearchableMultiSelectProps = {
  label?: string
  options: Option[]
  style?: React.CSSProperties
  placeholder?: string
  className?: string
  inputClassName?: string
}


export const SearchableMultiSelect = ({
  label,
  style,
  options,
  className,
  inputClassName,
  placeholder = "Type to search...",
}: SearchableMultiSelectProps) => {
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Option[]>([])
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const toggleOption = (option: Option) => {
    setSelected((prev) =>
      prev.some((item) => item.value === option.value)
        ? prev.filter((item) => item.value !== option.value)
        : [...prev, option]
    )
    setSearch("")
    inputRef.current?.focus()
  }

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(search.toLowerCase()) &&
      !selected.some((item) => item.value === option.value)
  )

  useEffect(() => {
    setOpen(search.length > 0)
  }, [search])

  return (
    <div>
      {label && (
        <label className="block text-[13px] font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <div
          className={cn(
            "w-full mt-0 px-3 py-2 border rounded-md text-[13px] min-h-[38px] flex items-center gap-2 flex-wrap",
            className
          )}
          style={{
            height: 38,
            overflowY: 'auto',
            overflowX: 'hidden',
            whiteSpace: 'nowrap',
            ...style,
          }}
          onClick={() => inputRef.current?.focus()}
        >
          <div className="flex gap-2 flex-nowrap overflow-hidden items-center">
            {selected.map((item) => (
              <Badge
                key={item.value}
                variant="secondary"
                className="flex items-center gap-1 text-xs cursor-pointer"
                onClick={() => toggleOption(item)}
              >
                {item.label}
                <X size={12} className="ml-1" />
              </Badge>
            ))}
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={selected.length === 0 ? placeholder : ""}
              className={cn("flex-grow outline-none text-[13px] bg-transparent min-w-[80px]", inputClassName)}
              style={{ minHeight: 20 }}
            />
          </div>
        </div>

        {open && (
          <div className="absolute z-10 mt-1 w-full border bg-white rounded-md shadow-md">
            <Command>
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search..."
                className="text-sm"
              />
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggleOption(option)}
                    className="cursor-pointer text-sm"
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </div>
        )}
      </div>
    </div>
  )
}
