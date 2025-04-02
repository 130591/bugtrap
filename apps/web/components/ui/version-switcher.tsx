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
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
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
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground px-3 py-2"
					>
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-sm">
								{tenantName.charAt(0).toUpperCase()}
							</div>
							<span className="text-sm font-semibold">{tenantName}</span>
						</div>
					</SidebarMenuButton>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-72 p-2 space-y-2">
					
					<div className="p-3 bg-gray-100 rounded-md flex items-center gap-2">
						<Mail className="size-4 text-gray-500" />
						<span className="text-sm">{tenantEmail}</span>
					</div>

					<div className="p-3 bg-gray-50 rounded-md space-y-2">
						<div className="flex items-center gap-2">
							<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white font-bold text-xs">
								{tenantName.charAt(0).toUpperCase()}
							</div>
							<span className="text-xs font-semibold">{tenantName}</span>
						</div>
						<div className="flex justify-between text-sm text-gray-600">
							<span>{userRole}</span>
							<span>{membersCount} member{membersCount > 1 ? 's' : ''}</span>
						</div>
					</div>

					<div className="flex justify-between gap-2">
						<button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md w-full">
							<Settings className="size-4 text-gray-500" />
							Settings
						</button>
						<button className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md w-full">
							<UserPlus className="size-4 text-blue-500" />
							Invite
						</button>
					</div>

					<div className="p-3 bg-gray-50 rounded-md space-y-1">
						<DropdownMenuItem className="text-sm">
							<Briefcase className="size-4 text-gray-500 mr-2" />
							Create workspace
						</DropdownMenuItem>
						<DropdownMenuItem className="text-sm">
							<UserCircle className="size-4 text-gray-500 mr-2" />
							Workspace invites
						</DropdownMenuItem>
						<DropdownMenuItem className="text-sm text-red-500">
							<LogOut className="size-4 text-red-500 mr-2" />
							Sign out
						</DropdownMenuItem>
					</div>

				</DropdownMenuContent>
			</DropdownMenu>
		</SidebarMenuItem>
	</SidebarMenu>
  )
}
