'use client'
import { FC, useState } from 'react'
import Layout from '@/components/layout/layout'
import { Button } from '@/components/ui/button'
import { Bug, CircleAlert, ClipboardList, FolderKanban, User, Puzzle, Filter } from 'lucide-react'
import { StatusCell } from '@/modules/project/components/status-cell'
import NewProjectModal from '@/modules/project/components/new-project-modal'

import { AutomationModal } from '@/components/layout/automation-modal'
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select'
import { FilterListNavegate } from '@/modules/project/components/filter-list-navigate'
import { DataTable } from '@/modules/project/components/table-container/data-table'
import data from '../../modules/project/task.json'
import { z } from 'zod'
import { taskSchema } from '@/modules/project/components/table-container/scheme'
import { columns } from '@/modules/project/components/table-container/columns'

async function getTasks() {
  const tasks = JSON.parse(data.toString())

  return z.array(taskSchema).parse(tasks)
}

export default function Project() {
	const [showFilterSidebar, setShowFilterSidebar] = useState(false)
	const [showAutomation, setAutomation] = useState(false)

	return (
		<Layout>
			<div className="flex items-center justify-between mt-2 mb-1">
				<h1 className="text-lg font-semibold text-[13px] mt-4">All Projects</h1>

				<div className="flex items-center gap-2 ml-auto">
					{/* <Button variant="outline" className="text-xs h-7 px-3 py-1 cursor-pointer" onClick={() => setAutomation(true)}>
						Automation
					</Button> */}

					<NewProjectModal />

					<Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => setShowFilterSidebar(true)}>
						<Filter size={14} />
					</Button>
				</div>
			</div>

			<AutomationModal onClose={() => setAutomation(false)} open={showAutomation}  />
				
			<div className="border border-gray-200 rounded-t-2xl shadow-md">
				<div className="overflow-x-auto">
					<DataTable columns={columns} data={data}  />
				</div>
			</div>

			<FilterSubMenu showFnFilterSideBar={setShowFilterSidebar} showFilterSideBar={showFilterSidebar} />
		</Layout>
	)
}

type FilterState = {
  projectName: string
  projectNameOperator: string
  owner: string
  startDate: string
  tags: string
  status: string
  phases: string
  bugs: string
  endDate: string
  completion: string
}

export const FilterSubMenu: FC<any> = ({ showFnFilterSideBar, showFilterSideBar }) => {
	const [filterValues, setFilterValues] = useState<FilterState>({
		projectName: '',
		projectNameOperator: 'is',
		owner: '',
		startDate: '',
		tags: '',
		status: '',
		phases: '',
		bugs: '',
		endDate: '',
		completion: ''
	})
	
	return (
		<div className={`fixed top-0 right-0 h-full w-100 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${showFilterSideBar ? 'translate-x-0' : 'translate-x-full'} border-l`}>
				<div className="flex flex-col h-full">
					<div className="p-4 border-b flex justify-between items-center">
						<h2 className="text-lg font-semibold">Filter</h2>
						<button onClick={() => showFnFilterSideBar(false)} className="text-gray-500 hover:text-gray-700 cursor-pointer">
							✕
						</button>
					</div>

					<SearchableMultiSelect
					  className="w-full bg-white border-b border-gray-300 rounded-none px-3 py-2 flex items-center gap-2 focus-within:border-blue-500"
            inputClassName="border-none outline-none w-full"
					  options={[{ label: 'TEST 1', value: 'TEST 1' }, { label: 'TEST 2', value: 'TEST 2' }]} 
					/>
					<FilterListNavegate filterValues={filterValues} fnFilter={setFilterValues}  />
				</div>
			</div>
	)
}