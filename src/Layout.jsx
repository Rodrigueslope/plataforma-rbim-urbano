import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { 
  Menu, 
  X, 
  BarChart3, 
  Map, 
  FileText, 
  Settings,
  TrendingUp,
  Bell,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Mapa de Calor', href: '/heatmap', icon: Map },
    { name: 'Analytics', href: '/analytics', icon: TrendingUp },
    { name: 'Relatórios', href: '/reports', icon: FileText },
    { name: 'Configurações', href: '/settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e título */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-blue-800 lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="flex items-center ml-4 lg:ml-0">
                <BarChart3 className="h-8 w-8 text-blue-300" />
                <div className="ml-3">
                  <h1 className="text-xl font-bold">Plataforma de Análise Urbana</h1>
                  <p className="text-blue-200 text-sm">Praça da Independência - João Pessoa/PB</p>
                </div>
              </div>
            </div>

            {/* Ações do header */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-blue-800">
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex items-center justify-between h-16 px-6 border-b lg:hidden">
            <span className="text-lg font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          
          <nav className="mt-8 lg:mt-0">
            <div className="px-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.href
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Overlay para mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Conteúdo principal */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout

