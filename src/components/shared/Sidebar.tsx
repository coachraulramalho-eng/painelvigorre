'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { cn } from '@/lib/utils/format';
import {
  LayoutDashboard,
  Briefcase,
  DollarSign,
  Megaphone,
  Users,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Briefcase, label: 'Comercial', href: '/comercial/crm' },
  { icon: DollarSign, label: 'Financeiro', href: '/financeiro/contas-receber' },
  { icon: Megaphone, label: 'Marketing', href: '/marketing' },
  { icon: Users, label: 'Administrativo', href: '/administrativo' },
  { icon: Shield, label: 'Segurança', href: '/seguranca' },
  { icon: Settings, label: 'Configurações', href: '/configuracoes' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-primary transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-primary-foreground/10">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-sm">V</span>
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-lg">Vigorre ADM</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuário */}
        <div className="border-t border-primary-foreground/10 p-4">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1">
                <p className="text-sm text-white font-medium">
                  {session?.user?.name || 'Usuário'}
                </p>
                <p className="text-xs text-white/60 truncate">
                  {session?.user?.email || ''}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={() => signOut()}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </button>
          )}
        </div>

        {/* Botão colapsar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-white border shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-primary" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-primary" />
          )}
        </button>
      </div>
    </aside>
  );
}
