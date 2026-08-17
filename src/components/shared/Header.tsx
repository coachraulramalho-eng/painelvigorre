'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, User, LogOut } from 'lucide-react';

export function Header() {
  const { data: session } = useSession();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { message: 'Proposta #001 aguardando aprovação', time: '5 min' },
    { message: 'Pagamento recebido: R$ 5.000,00', time: '1 h' },
    { message: 'Lead novo: Empresa ABC', time: '2 h' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b shadow-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex flex-1 items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes, propostas, contratos..."
              className="pl-10 bg-secondary border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full flex items-center justify-center p-0 text-[10px] bg-destructive">
              3
            </Badge>
          </button>

          <div className="flex items-center gap-3 border-l pl-4">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {session?.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">{session?.user?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground">{session?.user?.role || 'ADM Master'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notificações dropdown */}
      {showNotifications && (
        <div className="absolute right-4 mt-2 w-80 bg-white rounded-lg shadow-lg border py-2 z-50">
          <div className="px-4 py-2 border-b">
            <h4 className="font-semibold">Notificações</h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notif, index) => (
              <div key={index} className="px-4 py-2 hover:bg-secondary cursor-pointer">
                <p className="text-sm">{notif.message}</p>
                <p className="text-xs text-muted-foreground">{notif.time}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t">
            <button className="text-sm text-primary hover:underline">Ver todas</button>
          </div>
        </div>
      )}
    </header>
  );
}
