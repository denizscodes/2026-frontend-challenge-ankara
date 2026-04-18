import { render, screen, fireEvent } from '@testing-library/react';
import InvestigationPage from '@/app/investigation/page';
import { useInvestigation } from '@/hooks/useInvestigation';

// Mock the hook
jest.mock('@/hooks/useInvestigation');

const mockLinkedPeople = [
  {
    id: 'test@example.com',
    name: 'John Doe',
    email: 'test@example.com',
    submissions: [
      { id: '1', formTitle: 'Source A', created_at: '2026-04-18T10:00:00Z', answers: {} },
      { id: '2', formTitle: 'Source B', created_at: '2026-04-18T11:00:00Z', answers: {} },
    ],
    reliability: 85,
  },
];

describe('InvestigationPage', () => {
  beforeEach(() => {
    (useInvestigation as jest.Mock).mockReturnValue({
      linkedPeople: mockLinkedPeople,
      totalLeads: 2,
      matchedCount: 1,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  it('renders the investigation panel header', () => {
    render(<InvestigationPage />);
    expect(screen.getByText(/Investigation/i)).toBeInTheDocument();
    expect(screen.getByText(/Record Linking Engine/i)).toBeInTheDocument();
  });

  it('displays the list of personas', () => {
    render(<InvestigationPage />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('2 Matches')).toBeInTheDocument();
  });

  it('shows detailed view when a persona is selected', () => {
    render(<InvestigationPage />);
    const personButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(personButton!);
    
    expect(screen.getByText('VERIFIED IDENTITY')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Source B')).toBeInTheDocument();
  });

  it('filters personas based on search query', () => {
    render(<InvestigationPage />);
    const searchInput = screen.getByPlaceholderText(/Filter by name/i);
    
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
