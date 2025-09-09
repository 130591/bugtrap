'use client'
import * as React from 'react'
import { 
  Check, 
  UserCircle, 
  Settings, 
  UserPlus, 
  LogOut, 
  Briefcase, 
  Mail 
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui-old/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui-old/sidebar'
import { Geist_Mono } from 'next/font/google'

const geistSans = Geist_Mono({
  subsets: ['latin'],
  weight: ['700'],
})

export function VersionSwitcher({
  tenantName = 'FullAppLabs',
  tenantEmail = 'everton.paixao16@gmail.com',
  userRole = 'Admin',
  membersCount = 1,
}: {
  tenantName?: string
  tenantEmail?: string
  userRole?: string
  membersCount?: number
}) {
  return (
		<SidebarMenu>
		<SidebarMenuItem>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<SidebarMenuButton
						size="lg"
						 className="bg-transparent hover:bg-[#1E1F2C] text-white hover:text-white data-[state=open]:bg-[#1E1F2C] data-[state=open]:text-white px-3 py-2 transition-colors"
					>
						<div className="flex items-center gap-2 text-[13px]">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
								{tenantName.charAt(0).toUpperCase()}
							</div>
							<span className="text-sm font-semibold">{tenantName}</span>
						</div>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					className="w-72 p-2 space-y-2 bg-[#121320] text-white border border-[#2A2B2E]"
				>
					<div className="p-3 bg-[#121320] rounded-md flex items-center gap-2">
						<Mail className="size-4 text-gray-300" />
						<span className="text-sm text-gray-300">{tenantEmail}</span>
					</div>

					<div className="p-3 bg-[#1F2023] rounded-md space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
								{tenantName.charAt(0).toUpperCase()}
							</div>
							<span className="text-xs font-semibold">{tenantName}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-400 text-[13px]">
							<span>{userRole}</span>
							<span>
								{membersCount} member {membersCount > 1 ? 's' : ''}
							</span>
						</div>
					</div>

					<div className="flex justify-between gap-2">
						<button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F2023] hover:bg-[#2A2B2E] text-white rounded-md w-full text-[13px]">
							<Settings className="size-4 text-gray-300" />
							Settings
						</button>
						<button className="flex items-center gap-2 px-3 py-2 text-sm bg-[#1F2023] hover:bg-[#2A2B2E] text-white rounded-md w-full text-[13px]">
							<UserPlus className="size-4 text-blue-400" />
							Invite
						</button>
					</div>

					<div className="p-3 bg-[#1F2023] rounded-md space-y-1">
						<DropdownMenuItem className="group bg-transparent hover:bg-[#1E1F2C] text-white hover:text-white px-3 py-2 transition-colors text-[13px]">
							<Briefcase className="size-4 text-white mr-2 group-hover:text-white transition-colors" />
							Create workspace
						</DropdownMenuItem>
						<DropdownMenuItem className="group bg-transparent hover:bg-[#1E1F2C] text-white hover:text-white px-3 py-2 transition-colors text-[13px]">
							<UserCircle className="size-4 text-white mr-2 group-hover:text-white transition-colors" />
							Workspace invites
						</DropdownMenuItem>
						<DropdownMenuItem className="group bg-transparent hover:bg-[#1E1F2C] text-red-400 hover:text-red-400 px-3 py-2 transition-colors text-[13px]">
							<LogOut className="size-4 text-red-400 mr-2 group-hover:text-red-400 transition-colors" />
							Sign out
						</DropdownMenuItem>
					</div>

				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
  )
}
