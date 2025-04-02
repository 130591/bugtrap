import { AppSidebar } from '@/components/ui/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Plus, Search, Bell } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'


export default function Dashboard() {
  return (
    <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
        {/* Lado esquerdo */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>soma web</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Lado direito com os ícones (agora mais próximos ao conteúdo) */}
        <div className="flex items-center gap-3 pr-4">
          {/* Botão de Adicionar */}
          <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-300 cursor-pointer">
            <Plus size={18} />
          </button>

          {/* Ícone de Pesquisa */}
          <button className="p-2 rounded-lg transition duration-300 hover:bg-blue-500/30 cursor-pointer">
            <Search size={18} />
          </button>

          {/* Ícone de Notificação */}
          <button className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition duration-300 cursor-pointer">
            <Bell size={18} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
          <div className="aspect-video rounded-xl bg-muted/50" />
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </SidebarInset>
  </SidebarProvider>
  )
}