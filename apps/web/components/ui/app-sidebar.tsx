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
        key="yesww"
        tenantEmail="everton.paixao16@gmail.com"
        membersCount={10}
        tenantName="fullapplabs"
        userRole="admin"
      />
      {/* <SearchForm /> */}
    </SidebarHeader>

    <SidebarContent className="!bg-[#121320]">
      {data.navMain.map((item) => (
        <SidebarGroup key={item.title}>
          <SidebarGroupContent className="p-0 m-0">
            <SidebarMenu className="p-0 m-0">
              <SidebarMenuButton
                asChild
                isActive={item.isActive}
                className="w-full p-0 m-0"
              >
                <a
                  href={item.url}
                  className={`
                    w-full block 
                    flex items-center gap-2 
                    px-3 py-2 rounded-md text-[12px] transition-colors 
                    ${item.isActive
                      ? '!bg-[#1E1F2C] !text-white font-semibold'
                      : 'hover:!bg-[#1E1F2C] !text-white'}
                  `}
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