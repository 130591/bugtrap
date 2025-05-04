"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Task } from "./scheme"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { AvatarInitials } from "@/components/ui/avatar-internals"
import { LabelBadge } from "@/components/ui/badge-label"
import { CalendarDays } from "lucide-react"
import React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs } from "@radix-ui/react-tabs"
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"


const randomColorClasses = [
  "bg-blue-500",
  "bg-slate-500",
  "bg-amber-400",
  "bg-teal-500", 
]


export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false, 
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
		cell: ({ row }) => {
			const id = row.getValue("id") as string
			const lastFive = id.slice(-5)
			return <div className="w-[80px] font-mono">{lastFive}</div>
		},
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "projectName",
    header: ({ column }) => (
			<div className="text-[12px]">
				<DataTableColumnHeader column={column} title="Project Name" />
			</div>
    ),
    cell: ({ row }) => <div className="truncate text-[11px]">{row.getValue("projectName")}</div>,
  },
  {
    accessorKey: "owner",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Owner" />
    ),
    cell: ({ row }) => {
      const owner = row.getValue<string>('owner')
      return <AvatarInitials name={owner} />
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <div className="text-[11px]">{row.getValue("status")}</div>,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "phases",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phases" />
    ),
    cell: ({ row }) => <div className="text-[11px]">{row.getValue("phases")}</div>,
  },
  {
    accessorKey: "bugs",
    header: ({ column }) => (
      <DataTableColumnHeader  column={column} title="Bugs" />
    ),
    cell: ({ row }) => <div className="text-[11px]">{row.getValue("bugs")}</div>,
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Start Date" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("startDate") as string
      return (
        <>
        <StartDateCell value={value} />
        </>
      )
		},
  },
  {
    accessorKey: "endDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="End Date" />
    ),
		cell: ({ row }) => {
			const value = row.getValue("endDate") as string;
      return (
        <>
        <StartDateCell value={value} />
        </>
      )
		},
  },
  {
    accessorKey: "tags",
    header: ({ column }) => (
      <DataTableColumnHeader  column={column} title="Tags" />
    ),
    cell: ({ row }) => {
      const labels = row.getValue<string>('tags')
      const mainLabel = labels
      const otherCount = labels.length > 1 ? labels.length - 1 : 0
      const randomColor = randomColorClasses[Math.floor(Math.random() * randomColorClasses.length)]
  
      return (
        <LabelBadge
          mainLabel={mainLabel}
          otherCount={otherCount}
          colorClass={randomColor}
        />
      )
    } ,
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]


export function StartDateCell({ value }: { value: string }) {
  const [open, setOpen] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState(new Date(value))
  const [view, setView] = React.useState<"day" | "month" | "quarter" | "year">("day")

  const today = new Date()
  const showYear = selectedDate.getFullYear() !== today.getFullYear()
  const formatted = selectedDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(showYear && { year: "numeric" }),
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className="flex items-center gap-1 text-xs w-[140px] text-xs text-muted-foreground cursor-pointer"
          onClick={() => setOpen(true)}
        >
          <CalendarDays size={14} className="text-muted-foreground" />
          <span>{formatted}</span>
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[280px] text-xs">
       <Input
          type="date"
          value={selectedDate.toISOString().split("T")[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="mb-2 text-xs"
        />
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList className="grid grid-cols-4 mb-2 text-xs">
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="quarter">Quarter</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>

          <TabsContent value="day">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="text-xs"
              initialFocus
            />
          </TabsContent>

          <TabsContent value="month">
            <div className="p-2 text-sm text-muted-foreground">Selecionar mês (WIP)</div>
            {/* Aqui você pode criar um grid com botões de meses */}
          </TabsContent>

          <TabsContent value="quarter">
            <div className="p-2 text-sm text-muted-foreground">Selecionar trimestre (WIP)</div>
            {/* Botões Q1, Q2, Q3, Q4 */}
          </TabsContent>

          <TabsContent value="year">
            <div className="p-2 text-sm text-muted-foreground">Selecionar ano (WIP)</div>
            {/* Campo de input numérico ou um mini calendário só com anos */}
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
