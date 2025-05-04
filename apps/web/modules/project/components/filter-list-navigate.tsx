import { FC } from "react"
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FilterCollapseList } from "./filter-collapse"
import { DynamicFilter } from "./dynamic-filter"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const FilterListNavegate: FC<any> = ({ filterValues, fnFilter }) => {
	return (
		<FilterCollapseList
			filters={[
				{
					title: 'Project Name',
					controls: (
						<Select>
							<SelectTrigger style={{ height: '25px' }} className="w-[100px] text-[12px] h-7 px-2 py-1 border border-gray-300 rounded shadow-sm">
								<SelectValue placeholder="is" />
							</SelectTrigger>
							<SelectContent >
								<SelectItem value="is">is</SelectItem>
								<SelectItem value="isNot">is not</SelectItem>
							</SelectContent>
						</Select>
					),
					content: (
						<div className="space-y-2 border-t border-b px-0 pt-2 pb-2">
							{['Projeto A', 'Projeto B', 'Projeto C'].map((project) => (
								<label
									key={project}
									className="flex items-center gap-2 text-[12px] rounded hover:bg-blue-100 cursor-pointer transition-colors px-2 py-1"
								>
									<input
										type="checkbox"
										value={project}
										onChange={(e) => {
											const { checked, value } = e.target
											fnFilter((prev: any) => {
												const newTags = new Set(prev.projectName ? prev.projectName.split(',') : [])
												if (checked) newTags.add(value)
												else newTags.delete(value)
												return { ...prev, projectName: Array.from(newTags).join(',') }
											})
										}}
									/>
									<span className="text-sm text-[12px]">{project}</span>
								</label>
							))}
						</div>
					),
				},
				{
					title: 'Owner',
					controls: (
						<Select>
							<SelectTrigger style={{ height: '25px' }} className="w-[100px] text-[12px] h-7 px-2 py-1 border border-gray-300 rounded shadow-sm">
								<SelectValue placeholder="is" />
							</SelectTrigger>
							<SelectContent >
								<SelectItem value="is">is</SelectItem>
								<SelectItem value="isNot">is not</SelectItem>
							</SelectContent>
						</Select>
					),
					content: (
						<div className="space-y-2 border-t border-b px-0 pt-2 pb-2">
							{['Everton', 'Hebert', 'Bruno'].map((owner) => (
								<label
									key={owner}
									className="flex items-center gap-2 text-[12px] rounded hover:bg-blue-100 cursor-pointer transition-colors px-2 py-1"
								>
									<input
										type="checkbox"
										value={owner}
										onChange={(e) => {
											const { checked, value } = e.target
											fnFilter((prev: any) => {
												const newTags = new Set(prev.owner ? prev.owner.split(',') : [])
												if (checked) newTags.add(value)
												else newTags.delete(value)
												return { ...prev, owner: Array.from(newTags).join(',') }
											})
										}}
									/>
									<span className="text-sm text-[12px]">{owner}</span>
								</label>
							))}
						</div>
					),
				},
				{
					title: 'Start Date',
					controls: (
						<Select>
							<SelectTrigger
								style={{ height: '25px' }}
								className="w-[150px] text-[12px] h-7 px-2 py-1 border border-gray-300 rounded shadow-sm"
							>
								<SelectValue placeholder="Select" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="todayOverdue">Today + Overdue</SelectItem>
								<SelectItem value="overdue">Overdue</SelectItem>
								<SelectItem value="today">Today</SelectItem>
								<SelectItem value="unscheduled">Unscheduled</SelectItem>
								<SelectItem value="yesterday">Yesterday</SelectItem>
								<SelectItem value="tomorrow">Tomorrow</SelectItem>
								<SelectItem value="next7Days">Next 7 Days</SelectItem>
								<SelectItem value="thisWeek">This Week</SelectItem>
								<SelectItem value="thisMonth">This Month</SelectItem>
								<SelectItem value="lastWeek">Last Week</SelectItem>
								<SelectItem value="lastMonth">Last Month</SelectItem>
								<SelectItem value="is">Is</SelectItem>
								<SelectItem value="between">Between</SelectItem>
								<SelectItem value="lessThan">Less Than</SelectItem>
								<SelectItem value="greaterThan">Greater Than</SelectItem>
								<SelectItem value="lessThanOrEqual">Less Than Or Equal</SelectItem>
								<SelectItem value="greaterThanOrEqual">Greater Than Or Equal</SelectItem>
								<SelectItem value="notBetween">Not Between</SelectItem>
								<SelectItem value="isEmpty">Is Empty</SelectItem>
								<SelectItem value="isNotEmpty">Is Not Empty</SelectItem>
							</SelectContent>
						</Select>
					),	content: (
						<div className="space-y-2 border-t border-b px-0 pt-2 pb-2">
							<StartDateFilter />
						</div>
					),
				},
				{
					title: 'End Date',
					content: (
						<DynamicFilter
							field="endDate"
							type="date"
							value={filterValues.endDate}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, endDate: value }))}
						/>
					),
				},
				{
					title: 'Status',
					content: (
						<DynamicFilter
							field="status"
							type="select"
							value={filterValues.status}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, status: value }))}
							options={['In Progress', 'Completed', 'On Hold']}
						/>
					),
				},
				{
					title: 'Phases',
					content: (
						<DynamicFilter
							field="phases"
							type="select"
							value={filterValues.phases}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, phases: value }))}
							options={['No Phases', 'Design', 'Development', 'Testing']}
						/>
					),
				},
				{
					title: 'Bugs',
					content: (
						<DynamicFilter
							field="bugs"
							type="number"
							value={filterValues.bugs}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, bugs: value }))}
						/>
					),
				},
				{
					title: 'Tags',
					content: (
						<DynamicFilter
							field="tags"
							type="multiselect"
							value={filterValues.tags || []}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, tags: value }))}
							options={['web', 'plm', 'backend']}
						/>
					),
				},
				{
					title: 'Completion',
					content: (
						<DynamicFilter
							field="completion"
							type="range"
							value={filterValues.completion}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, completion: value }))}
						/>
					),
				},
				{
					title: 'Tags',
					content: (
						<DynamicFilter
							field="tags"
							type="multiselect"
							value={filterValues.tags || []}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, tags: value }))}
							options={['web', 'plm', 'backend']}
						/>
					),
				},
				{
					title: 'Completion',
					content: (
						<DynamicFilter
							field="completion"
							type="range"
							value={filterValues.completion}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, completion: value }))}
						/>
					),
				},
				{
					title: 'Tags',
					content: (
						<DynamicFilter
							field="tags"
							type="multiselect"
							value={filterValues.tags || []}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, tags: value }))}
							options={['web', 'plm', 'backend']}
						/>
					),
				},
				{
					title: 'Completion',
					content: (
						<DynamicFilter
							field="completion"
							type="range"
							value={filterValues.completion}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, completion: value }))}
						/>
					),
				},
				{
					title: 'Tags',
					content: (
						<DynamicFilter
							field="tags"
							type="multiselect"
							value={filterValues.tags || []}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, tags: value }))}
							options={['web', 'plm', 'backend']}
						/>
					),
				},
				{
					title: 'Completion',
					content: (
						<DynamicFilter
							field="completion"
							type="range"
							value={filterValues.completion}
							onChange={(value) => fnFilter((prev: any) => ({ ...prev, completion: value }))}
						/>
					),
				},
			]}
		/>					
	)
}



const operatorOptions = [
  'greater than',
  'less than or equal',
  'not between',
  'is empty',
  'is not empty',
  'between',
  'less than',
  'last month',
  'last week',
  'this month',
  'this week',
  'next 7 days',
  'tomorrow',
  'yesterday',
  'unscheduled',
  'today',
  'overdue',
  'today + overdue',
]

function StartDateFilter() {
	const [amount, setAmount] = useState<number>(0)
	const [tab, setTab] = useState<'range' | 'date'>('range')
  const [unit, setUnit] = useState<'days' | 'hours'>('days')
	const [dateValue, setDateValue] = useState<Date | undefined>()
  const [reference, setReference] = useState<'current' | 'created' | 'end'>('current')


	return (
		<Tabs value={tab} onValueChange={(value) => setTab(value as 'range' | 'date')} className="w-full">
		<TabsList className="mb-2">
			<TabsTrigger className="text-[11px]" value="range">Range</TabsTrigger>
			<TabsTrigger className="text-[11px]" value="date">Date</TabsTrigger>
		</TabsList>

		<TabsContent value="range">
			<div className="flex items-center gap-0">
				<input
					type="number"
					value={amount}
					onChange={(e) => setAmount(Number(e.target.value))}
					className="h-7 px-2 text-[12px] border rounded-md rounded-r-none w-16"
				/>

				<Select value={unit} onValueChange={(value) => setUnit(value as 'days' | 'hours')}>
					<SelectTrigger className="text-[12px] w-24 rounded-l-none" style={{ height: '28px' }}>
						<SelectValue placeholder="Unit" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="days">days</SelectItem>
						<SelectItem value="hours">hours</SelectItem>
					</SelectContent>
				</Select>

				<span className="text-sm px-1">after</span>

				<Select value={reference} onValueChange={(value) => setReference(value as 'current' | 'created' | 'end')}>
					<SelectTrigger className="h-7 text-[12px] w-32" style={{ height: '28px' }}>
						<SelectValue placeholder="Reference" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="current">current date</SelectItem>
						<SelectItem value="created">created time</SelectItem>
						<SelectItem value="end">end date</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</TabsContent>

		<TabsContent value="date">
		<DateRangeFilter />
		</TabsContent>
	</Tabs>

	)
}


import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format } from 'date-fns'

function DateRangeFilter() {
  const [fromDate, setFromDate] = useState<Date | undefined>()
  const [toDate, setToDate] = useState<Date | undefined>()

  return (
    <div className="flex flex-col items-center gap-4 mt-2">
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-[90%] h-[30px] text-[12px] rounded-md border border-input bg-background px-3 py-1 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {fromDate ? format(fromDate, 'yyyy-MM-dd') : (
              <span className="text-muted-foreground">From</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={fromDate}
            onSelect={setFromDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* TO Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="w-[90%] h-[30px] text-[12px] rounded-md border border-input bg-background px-3 py-1 text-left text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            {toDate ? format(toDate, 'yyyy-MM-dd') : (
              <span className="text-muted-foreground">To</span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={toDate}
            onSelect={setToDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
