'use client'

import { useMemo } from 'react'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui-old/select'
import { Input } from '@/components/ui-old/input'
import { DatePicker } from '@/components/ui-old/date-picker'

const filterOptionsMap = {
  owner: ['is', 'is not'],
  'project name': ['contains', 'is', 'is not', "doesn't contain", 'start with', 'end with'],
  'created time': ['today', 'till yesterday', 'yesterday', 'this week', 'this month', 'last week', 'last month', 'is', 'between', 'less than', 'greater than', 'less than or equal', 'greater than or equal', 'not between'],
  'created by': ['is', 'is not'],
  'start date': ['today', 'till yesterday', 'unscheduled', 'yesterday', 'tomorrow', 'next 7 days', 'this week', 'this month', 'last week', 'last month', 'is', 'between', 'less than', 'greater than', 'less than or equal', 'greater than or equal', 'not between'],
  'end date': ['today', 'till yesterday', 'unscheduled', 'yesterday', 'tomorrow', 'next 7 days', 'this week', 'this month', 'last week', 'last month', 'is', 'between', 'less than', 'greater than', 'less than or equal', 'greater than or equal', 'not between']
} as const

type FilterField = keyof typeof filterOptionsMap

export type DynamicFilterType = 'text' | 'select' | 'date' | 'range' | 'multiselect' | 'number'

interface DynamicFilterProps {
  field: string
  type: DynamicFilterType
  value: any
  onChange: (value: any) => void
  options?: string[]
}


export function DynamicFilter({ field, type, value, onChange, options }: DynamicFilterProps) {
  const renderInput = useMemo(() => {
    switch (type) {
      case 'text':
        return (
          <Input
            placeholder={`Filter ${field}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'date':
        return (
          <DatePicker date={value}  onDateChange={onChange}  />
        )
      default:
        return null
    }
  }, [type, value, onChange, field, options])

  return <div className="space-y-2">{renderInput}</div>
}