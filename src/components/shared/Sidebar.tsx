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
} from 'lucide-react';

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

  return (
    <aside 
      className="fixed left-0 top-0 z-40 h-screen w-64"
      style={{ backgroundColor: '#0B2B4A' }} // 🔥 COR EXPLÍCITA
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center px-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center">
              <span className="font-bold text-sm" style={{ color: '#0B2B4A' }}>V</span>
            </div>
            <span className="font-bold text-lg" style={{ color: '#FFFFFF' }}>Vigorre ADM</span>
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
                      isActive ? 'bg-white/20' : 'hover:bg-white/10'
                    )}
                    style={{
                      color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)',
                    }}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }} />
                    <span style={{ color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.7)' }}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuário */}
        <div className="border-t p-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-sm font-semibold" style={{ color: '#FFFFFF' }}>
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: '#FFFFFF' }}>
                {session?.user?.name || 'Usuário'}
              </p>
              <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {session?.user?.email || ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/10"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
