'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Phone, Mail, Users, FileText, MessageSquare } from 'lucide-react';

interface Activity {
  type: string;
  description: string;
  date: string;
  responsible: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      'Ligação': Phone,
      'E-mail': Mail,
      'Reunião': Users,
      'Apresentação': FileText,
      'Follow-up': MessageSquare,
    };
    const Icon = icons[type] || Calendar;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors: Record<string, string> = {
      'Ligação': 'bg-blue-50 text-blue-600',
      'E-mail': 'bg-green-50 text-green-600',
      'Reunião': 'bg-purple-50 text-purple-600',
      'Apresentação': 'bg-orange-50 text-orange-600',
      'Follow-up': 'bg-yellow-50 text-yellow-600',
    };
    return colors[type] || 'bg-gray-50 text-gray-600';
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Nenhuma atividade registrada</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-4">
      {/* Linha vertical */}
      <div className="absolute left-1.5 top-2 bottom-0 w-0.5 bg-border" />

      {activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);

        return (
          <div key={index} className="relative">
            {/* Círculo na linha */}
            <div className={`absolute -left-6 p-1 rounded-full ${colorClass}`}>
              {Icon}
            </div>

            <Card className="p-4 ml-2">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={colorClass}>
                      {activity.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {activity.responsible}
                    </span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground whitespace-nowrap">
                  <Calendar className="h-3 w-3" />
                  {new Date(activity.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
