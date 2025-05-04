"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { TableCell } from "@/components/ui/table"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  on_hold: "bg-orange-100 text-orange-800",
  completed: "bg-blue-100 text-blue-800",
  canceled: "bg-red-100 text-red-800",
  archived: "bg-gray-200 text-gray-800",
}

export function StatusCell() {
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState("canceled")

  return (
    <TableCell onClick={() => setEditing(true)} className="cursor-pointer">
      {editing ? (
        <Select
          value={status}
          onValueChange={(val) => {
            setStatus(val)
            setEditing(false)
          }}
        >
          <SelectTrigger  className="h-6 px-2 text-xs border rounded-md w-fit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(statusColors).map(([key, color]) => (
              <SelectItem key={key} value={key}>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${color}`}>
                  {key.replace("_", " ").toUpperCase()}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Badge className={`${statusColors[status]} text-xs`} variant="outline">
          {status.replace("_", " ").toUpperCase()}
        </Badge>
      )}
    </TableCell>
  )
}
