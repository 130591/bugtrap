'use client'

import { FC, useState } from 'react'
import { BugIcon, FolderIcon, UserIcon } from 'lucide-react'
import { ChevronDown, ChevronUp, MoreVertical  } from 'lucide-react'
import { NewProjectForm } from '@/modules/project/components/new-project-form'
import { SearchableSelect } from '../ui-old/searchable-select'
import { ReminderPopover } from './reminder-popover'
import { SearchableMultiSelect } from '../ui-old/searchable-multi-select'
import { Button } from '../ui-old/button'


interface DrawerModalProps {
  show: boolean;
  onClose: () => void;
}

export const BugDrawer: FC<DrawerModalProps> = ({ show, onClose }) => {
  const [showAdvanced, setShowAdvanced] = useState(false)
	const [isSubMenuVisible, setIsSubMenuVisible] = useState(false)
	const [activeScreen, setActiveScreen] = useState<'bug' | 'project' | 'user'>('bug');
	const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[640px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${show ? 'translate-x-0' : 'translate-x-full'} border-l flex flex-col text-[13px] font-normal`}
    >
			 {isSubMenuVisible && (
					<div
					className={`absolute top-0 left-0 h-full w-[320px] bg-white text-gray-900 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
						isSubMenuVisible ? 'translate-x-0' : '-translate-x-full pointer-events-none'
					}`}
					onMouseLeave={() => setIsSubMenuVisible(false)}
				>
					<div className="p-4 space-y-6">
						<h3 className="text-lg font-semibold">Menu Interno</h3>
				
						<div className="flex gap-4">
							<div onClick={() => setActiveScreen('bug')} className="w-[80px] h-[80px] border border-gray-200 rounded-md flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:shadow-sm transition">
								<BugIcon className="w-5 h-5 mb-1 text-gray-700" />
								<span className="text-[13px] text-gray-800">Bug</span>
							</div>
				
							<div onClick={() => setActiveScreen('project')} className="w-[80px] h-[80px] border border-gray-200 rounded-md flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:shadow-sm transition">
								<FolderIcon className="w-5 h-5 mb-1 text-gray-700" />
								<span className="text-[13px] text-gray-800">Project</span>
							</div>
			
							<div onClick={() => setActiveScreen('user')}  className="w-[80px] h-[80px] border border-gray-200 rounded-md flex flex-col items-center justify-center text-center p-2 cursor-pointer hover:shadow-sm transition">
								<UserIcon className="w-5 h-5 mb-1 text-gray-700" />
								<span className="text-[13px] text-gray-800">User</span>
							</div>
						</div>
					</div>
				</div>
			
				)}

				<div
					className="p-4 border-b flex justify-between items-center"
				>
					<div className="flex items-center gap-2">
						<MoreVertical size={24} color="#121320" className="cursor-pointer"	onMouseEnter={() => setIsSubMenuVisible(true)} />
						<h2 className="text-[14px] font-normal">
							{activeScreen === 'bug' && 'New Bug'}
							{activeScreen === 'project' && 'New Project'}
							{activeScreen === 'user' && 'Invite User'}
						</h2>

					</div>
					<span className="text-[13px] text-muted-foreground">soma</span>
       </div>


      <div className="flex-1 overflow-y-auto p-6 space-y-6">
				{activeScreen === 'bug' && (
					<>
						<div className="space-y-4">
						<div>
							<SearchableSelect label="Project" options={["Soma"]} />
						</div>

						<div>
							<label className="block text-[13px] font-medium text-gray-700">Bug Name</label>
							<input className="w-full mt-1 px-3 py-2 border rounded-md text-[13px]" placeholder="Enter bug name" />
						</div>

						<div>
							<label className="block text-[13px] font-medium text-gray-700">Description</label>
							<textarea className="w-full mt-1 px-3 py-2 border rounded-md text-[13px]" rows={4} placeholder="Describe the bug..." />
						</div>

						<div className="text-[13px] text-gray-600 border rounded-md border-dashed p-4 text-center cursor-pointer">
							Drop files or add attachments here...
							<br />
							<span className="text-[12px] text-gray-500">Maximum 10 files</span>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-[13px] font-medium text-gray-700">Reminder</label>
								<ReminderPopover />
							</div>
							<div>
								<label className="block text-[13px] font-medium text-gray-700">Add Followers</label>
								<SearchableMultiSelect options={[{ label: 'TEST 1', value: 'TEST 1' }, { label: 'TEST 2', value: 'TEST 2' }]} />
							</div>
						</div>
					</div>
				
					<div className="pt-4 border-t">
						<button
							className="w-full flex justify-between items-center text-left text-[13px] font-semibold text-gray-800 hover:bg-gray-50 px-2 py-2 rounded-md"
							onClick={() => setShowAdvanced(!showAdvanced)}
						>
							<span>Bug Information</span>
							{showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
						</button>

						{showAdvanced && (
							<div className="mt-4 space-y-4">
								<div className="grid grid-cols-2 gap-6">
									<Input label="Associated Team" placeholder="Select" />
									<Input label="Assignee" placeholder="Select" />
									<Input label="Tags" placeholder="Select" />
									<Input label="Due Date" placeholder="dd/mm/aaaa" type="date" />
									<Input label="Severity" placeholder="Select" />
								</div>

								<div className="grid grid-cols-2 gap-6">
									<SearchableSelect label="Release Phase" options={["Alpha", "Beta", "Stable", "Final"]} />
									<SearchableSelect label="Affected Phase" options={["Initial", "Progressing", "Completed"]} />
									<SearchableSelect label="Module"  options={["Authentication", "User Interface", "Database"]} />
									<SearchableSelect label="Classification" options={["Critical", "High", "Medium", "Low"]} />
									<SearchableSelect label="Reproducible"  options={["Yes", "No", "Intermittent"]} />
									<SearchableSelect label="Flag" options={["New", "Under Investigation", "Resolved"]} />
								</div>
							</div>
						)}
					</div>
					</> 
				)}

				{activeScreen === 'project' && (
					<div className="overflow-y-auto max-h-[calc(90vh-100px)] px-1 pr-2 space-y-4">
					<div className="space-y-4">
						<NewProjectForm setShow={() => {}} />
					</div>
				</div>
				)}

			{activeScreen === 'user' && (
			<div className="space-y-4">
					<div>
						<SearchableSelect label="Project" options={["Soma"]} />
					</div>
			
					<div>
						<label className="block text-[13px] font-normal text-gray-700 mb-1">Email ID</label>
						<input
							className="w-full px-3 py-2 border rounded-md text-[12px] font-normal"
							placeholder="Enter email address"
						/>
					</div>
			
					<div className="flex items-center gap-4 pt-1">
						<label className="flex items-center text-[12px] font-normal gap-1">
							<input type="checkbox" className="form-checkbox" />
							User
						</label>
						<label className="flex items-center text-[12px] font-normal gap-1">
							<input type="checkbox" className="form-checkbox" />
							Read-only user
						</label>
					</div>
			
					<div className="pt-2">
						<div className="flex justify-between items-end mb-1">
							<label className="text-[13px] font-normal text-gray-700">Invitation Template</label>
							<span className="text-[12px] text-blue-600 cursor-pointer hover:underline">
								Add Invitation Template
							</span>
						</div>
						<SearchableSelect options={["Default Invitation Template"]} />
					</div>

					<div className="flex gap-4">
						<div className="flex-1">
							<label className="block text-[13px] font-normal text-gray-700 mb-1">Role</label>
							<SearchableSelect options={["Employee"]} />
						</div>
						<div className="flex-1">
							<label className="block text-[13px] font-normal text-gray-700 mb-1">Profile</label>
							<SearchableSelect options={["Employee"]} />
						</div>
					</div>
			
					<div className="flex gap-3 pt-4">
						<Button className="bg-blue-600 text-white text-[13px] font-normal px-4 py-2 rounded-md">
							Invite
						</Button>
						<Button
							variant="outline"
							className="border-blue-600 text-blue-600 text-[13px] font-normal px-4 py-2 rounded-md"
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

      </div>
			{activeScreen !== 'user' && (
				<div className="p-4 border-t flex justify-end gap-2 bg-white">
					<button
						className="px-4 py-2 rounded-md text-[12px] border border-gray-300 hover:bg-gray-100 cursor-pointer"
						onClick={() => onClose()}
					>
						Cancel
					</button>
					<button className="px-4 py-2 rounded-md text-[12px] bg-blue-500 text-white hover:bg-blue-600 cursor-pointer">
						Add
					</button>
					<button className="px-4 py-2 rounded-md text-[12px] bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer">
						Add More
					</button>
				</div>
			) }
    </div>
  )
}

const Input = ({ label, placeholder, type = 'text' }: { label: string; placeholder: string; type?: string }) => (
  <div>
    <label className="block text-[13px] font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      className="w-full px-3 py-2 border rounded-md text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
)
