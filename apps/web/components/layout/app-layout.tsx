'use client'

import { useState, ReactNode } from 'react'
import { AppSidebar } from '@/components/ui/app-sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { Plus, Search, Bell } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { NotificationCard } from '../ui/card-notification'
import { SearchModal } from './search-modal'
import { BugDrawer } from './bug-drawer'

export default function AppLayout({ children }: { children: ReactNode }) {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationFilter, setNotificationFilter] = useState('default')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showBugDrawer, setShowBugDrawer] = useState(false)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink className='text-[12px]' href="/projects">Projects</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className='text-[12px]'>soma web</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3 pr-4">
            <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-300 cursor-pointer"  onClick={() => setShowBugDrawer(true)}>
              <Plus size={15} />
            </button>
            <button className="p-2 rounded-lg transition duration-300 hover:bg-blue-500/30 cursor-pointer" onClick={() => setShowSearchModal(true)}>
              <Search size={15} onClick={() => setShowSearchModal(true)} />
            </button>
            <button
              className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-300 cursor-pointer"
              onClick={() => setShowNotifications(true)}
            >
              <Bell size={15} />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 overflow-auto">
          {children}
        </main>

        <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${showNotifications ? 'translate-x-0' : 'translate-x-full'} border-l`}>
          <div className="flex flex-col h-full">
          <div className="p-4 border-b flex justify-between items-center">
            <Select value={notificationFilter} onValueChange={setNotificationFilter}>
              <SelectTrigger
                className="p-0 h-auto border-none shadow-none text-lg text-[13px] font-semibold focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              >
                <SelectValue placeholder="Notificações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Notifications</SelectItem>
                <SelectItem value="all">All notifications</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="mention">@Menções</SelectItem>
              </SelectContent>
            </Select>

            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              ✕
            </button>
          </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <NotificationCard
                user="João Dias"
                avatarUrl="/user-avatar.jpg"
                fallback="JD"
                message="comentou no seu post"
                comment='"Ótimo trabalho!"'
                timeAgo="há 2 horas"
                expiresIn="24h"
                onClose={() => console.log("Fechou a notificação")}
              />

              <div className="p-3 bg-gray-100 rounded-lg text-sm">Novo comentário no projeto X.</div>
              <div className="p-3 bg-gray-100 rounded-lg text-sm">Tarefa Y foi concluída.</div>
              <div className="p-3 bg-gray-100 rounded-lg text-sm">Erro identificado no módulo Z.</div>
            </div>
          </div>
        </div>
      
        <SearchModal
          show={showSearchModal}
          onClose={() => setShowSearchModal(false)}
        />

        <BugDrawer show={showBugDrawer} onClose={() => setShowBugDrawer(false)} />

      </SidebarInset>
    </SidebarProvider>
  )
}
