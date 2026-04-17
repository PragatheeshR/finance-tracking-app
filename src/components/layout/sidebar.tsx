'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  Target,
  TrendingUp,
  Shield,
  Calculator,
  Settings,
  DollarSign,
  Moon,
  Sun,
  Flag,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Portfolio', href: '/portfolio', icon: Wallet },
  { name: 'Income', href: '/income', icon: DollarSign },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Budget', href: '/budget', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Insurance', href: '/insurance', icon: Shield },
  { name: 'Goals', href: '/goals', icon: Flag },
  { name: 'Calculators', href: '/calculators', icon: Calculator },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="flex flex-col w-64 bg-card border-r">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b">
        <Wallet className="h-8 w-8 text-primary" />
        <span className="ml-3 text-xl font-bold">Finance Tracker</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t space-y-3">
        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="w-full"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light Mode
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark Mode
              </>
            )}
          </Button>
        )}

        {/* User Info */}
        <div className="flex items-center px-4 py-2">
          <div className="flex-1">
            <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground">{session?.user?.email || 'Loading...'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
