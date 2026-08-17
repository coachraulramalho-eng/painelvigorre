import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/shared/StatsCard';
import { DollarSign } from 'lucide-react';

describe('StatsCard', () => {
  const defaultProps = {
    title: 'Total de Vendas',
    value: 'R$ 50.000,00',
    icon: <DollarSign className="h-6 w-6" />,
  };

  it('should render title and value correctly', () => {
    render(<StatsCard {...defaultProps} />);
    expect(screen.getByText('Total de Vendas')).toBeInTheDocument();
    expect(screen.getByText('R$ 50.000,00')).toBeInTheDocument();
  });

  it('should render description when provided', () => {
    render(<StatsCard {...defaultProps} description="Últimos 30 dias" />);
    expect(screen.getByText('Últimos 30 dias')).toBeInTheDocument();
  });

  it('should render trend when provided', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 15, label: 'vs mês anterior', positive: true }}
      />
    );
    expect(screen.getByText('↑ 15%')).toBeInTheDocument();
    expect(screen.getByText('vs mês anterior')).toBeInTheDocument();
  });

  it('should render negative trend correctly', () => {
    render(
      <StatsCard
        {...defaultProps}
        trend={{ value: 10, label: 'vs mês anterior', positive: false }}
      />
    );
    expect(screen.getByText('↓ 10%')).toBeInTheDocument();
  });
});
