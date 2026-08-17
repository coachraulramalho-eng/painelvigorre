import { render, screen } from '@testing-library/react';
import { StatusBadge } from '@/components/shared/StatusBadge';

describe('StatusBadge', () => {
  it('should render with correct status', () => {
    render(<StatusBadge status="Ativo" />);
    expect(screen.getByText('🟢 Ativo')).toBeInTheDocument();
  });

  it('should render with different status', () => {
    render(<StatusBadge status="Pendente" />);
    expect(screen.getByText('⏳ Pendente')).toBeInTheDocument();
  });

  it('should render default for unknown status', () => {
    render(<StatusBadge status="Desconhecido" />);
    expect(screen.getByText('📌 Desconhecido')).toBeInTheDocument();
  });
});
