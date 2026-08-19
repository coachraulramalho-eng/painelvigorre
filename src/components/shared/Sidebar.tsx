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
  Building2,
  FileText,
  CalendarClock,
  Handshake,
  BadgeDollarSign,
  FileSignature,
  UserCog,
  ClipboardList,
  Database,
  Image,
  QrCode,
} from 'lucide-react';
import { useState, useEffect } from 'react';

// 🔥 ESTRUTURA DE MENU COM SUB-ITENS
const menuItems = [
  { 
    icon: LayoutDashboard, 
    label: 'Dashboard', 
    href: '/',
    subItems: []
  },
  { 
    icon: Briefcase, 
    label: 'Comercial', 
    href: '/comercial/crm',
    subItems: [
      { label: 'CRM', href: '/comercial/crm' },
      { label: 'Leads', href: '/comercial/leads' },
      { label: 'Empresas', href: '/comercial/empresas' },
      { label: 'Propostas', href: '/comercial/propostas' },
      { label: 'Contratos', href: '/comercial/contratos' },
      { label: 'Tarefas', href: '/comercial/tarefas' },
      { label: 'Follow-ups', href: '/comercial/followups' },
      { label: 'Representantes', href: '/comercial/representantes' },
      { label: 'Comissões', href: '/comercial/comissoes' },
      { label: 'Acordos', href: '/comercial/acordos' },
    ]
  },
  { 
    icon: DollarSign, 
    label: 'Financeiro', 
    href: '/financeiro/contas-receber',
    subItems: [
      { label: 'Contas a Receber', href: '/financeiro/contas-receber' },
      { label: 'Contas a Pagar', href: '/financeiro/contas-pagar' },
      { label: 'Fluxo de Caixa', href: '/financeiro/fluxo-caixa' },
    ]
  },
  { 
    icon: Megaphone, 
    label: 'Marketing', 
    href: '/marketing',
    subItems: [
      { label: 'Dashboard', href: '/marketing' },
      { label: 'Campanhas', href: '/marketing/campanhas' },
      { label: 'Conteúdos', href: '/marketing/conteudos' },
      { label: 'Biblioteca', href: '/media' },
    ]
  },
  { 
    icon: Users, 
    label: 'Administrativo', 
    href: '/administrativo',
    subItems: [
      { label: 'Dashboard', href: '/administrativo' },
      { label: 'Funcionários', href: '/administrativo/funcionarios' },
      { label: 'Fornecedores', href: '/administrativo/fornecedores' },
      { label: 'Documentos', href: '/documentos' },
    ]
  },
  { 
    icon: Shield, 
    label: 'Segurança', 
    href: '/seguranca',
    subItems: [
      { label: 'Usuários', href: '/seguranca/usuarios' },
      { label: 'Perfis', href: '/seguranca/perfis' },
      { label: 'Auditoria', href: '/seguranca/auditoria' },
    ]
  },
  { 
    icon: Settings, 
    label: 'Configurações', 
    href: '/configuracoes',
    subItems: []
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Expandir menus com base na rota atual
    const newExpanded: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.length > 0) {
        const isActive = item.subItems.some((sub) => pathname === sub.href || pathname?.startsWith(sub.href + '/'));
        if (isActive) {
          newExpanded[item.href] = true;
        }
      }
    });
    setExpandedMenus(newExpanded);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  const toggleMenu = (href: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  };

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen transition-all duration-300',
        'bg-[#0B2B4A]', // 🔥 COR ORIGINAL DO VIGORRE
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center w-full')}>
            <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-[#0B2B4A] font-bold text-sm">V</span>
            </div>
            {!collapsed && (
              <span className="text-white font-bold text-lg truncate">Vigorre ADM</span>
            )}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isExpanded = expandedMenus[item.href] || false;
              const isItemActive = isActive(item.href);

              return (
                <li key={item.href}>
                  {/* Item principal */}
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (hasSubItems && !collapsed) {
                        e.preventDefault();
                        toggleMenu(item.href);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isItemActive && !hasSubItems
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {hasSubItems && (
                          <ChevronLeft
                            className={cn(
                              'h-4 w-4 transition-transform text-white/50',
                              isExpanded ? '-rotate-90' : ''
                            )}
                          />
                        )}
                      </>
                    )}
                  </Link>

                  {/* Sub-itens */}
                  {hasSubItems && !collapsed && isExpanded && (
                    <ul className="mt-1 ml-4 space-y-1 border-l border-white/10 pl-2">
                      {item.subItems.map((subItem) => {
                        const isSubActive = pathname === subItem.href || pathname?.startsWith(subItem.href + '/');
                        return (
                          <li key={subItem.href}>
                            <Link
                              href={subItem.href}
                              className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors',
                                isSubActive
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              )}
                            >
                              <span className="w-2 h-2 rounded-full bg-current opacity-40" />
                              <span>{subItem.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Usuário */}
        <div className="border-t border-white/10 p-4">
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
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
          className="hidden lg:flex absolute -right-3 top-20 h-6 w-6 rounded-full bg-white border shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-[#0B2B4A]" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-[#0B2B4A]" />
          )}
        </button>
      </div>
    </aside>
  );
}
