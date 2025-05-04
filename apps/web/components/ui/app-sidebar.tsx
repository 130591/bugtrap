import * as React from 'react';
import { SearchForm } from './search-form';
import { VersionSwitcher } from './version-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { FaProjectDiagram, FaBug, FaChartBar, FaCog } from 'react-icons/fa';

const data = {
  versions: ['1.0.1', '1.1.0-alpha', '2.0.0-beta1'],
  navMain: [
    {
      title: 'Projects',
      url: '/project',
      icon: <FaProjectDiagram className="w-4 h-4" />,
      isActive: false,
    },
    {
      title: 'Issues',
      url: '#',
      icon: <FaBug className="w-4 h-4" />,
      isActive: true,
    },
    {
      title: 'Report',
      url: '#',
      icon: <FaChartBar className="w-4 h-4" />,
      isActive: false,
    },
    {
      title: 'Settings',
      url: '#',
      icon: <FaCog className="w-4 h-4" />,
      isActive: false,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
		<Sidebar className="w-56 text-white ft-2" {...props}>
		<SidebarHeader className="!bg-[#121320]">
			<VersionSwitcher
				key={'yesww'}
				tenantEmail="everton.paixao16@gmail.com"
				membersCount={10}
				tenantName="fullapplabs"
				userRole="admin"
			/>
			{/* <SearchForm /> */}
		</SidebarHeader>
		<SidebarContent className="!bg-[#121320]">
			{data.navMain.map((item) => (
				<SidebarGroup key={item.title} >
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuButton asChild isActive={item.isActive}>
								<a
									href={item.url}
									className={`flex items-center gap-2 px-3 py-2 rounded-md text-[12px] ${
										item.isActive
											? 'bg-gray-200 text-black font-semibold'
											: 'text-white hover:bg-[#2A2B2E]'
									}`}
								>
									{item.icon}
									{item.title}
								</a>
							</SidebarMenuButton>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			))}
		</SidebarContent>
		<SidebarRail />
	</Sidebar>
  )
}