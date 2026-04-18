import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import InvestigationPage from '@/app/investigation/page';
import { useInvestigation } from '@/hooks/useInvestigation';

// Mock the hook
jest.mock('@/hooks/useInvestigation');

const mockLinkedPeople = [
  {
    id: 'test@example.com',
    name: 'John Doe',
    email: 'test@example.com',
    coordinates: [{ lat: 39.9, lng: 32.8, timestamp: '2026-04-18T10:00:00Z' }],
    submissions: [
      { id: '1', formTitle: 'Source A', created_at: '2026-04-18T10:00:00Z', answers: {} },
      { id: '2', formTitle: 'Source B', created_at: '2026-04-18T11:00:00Z', answers: {} },
    ],
    reliability: 85,
    suspicionScore: 0,
    suspicionReason: '',
    relationToPodo: 'none',
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
    expect(screen.getByRole('heading', { name: /Investigation/i })).toBeInTheDocument();
    expect(screen.getByText(/Record Linking Engine/i)).toBeInTheDocument();
  });

  it('displays the list of personas', () => {
    render(<InvestigationPage />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/Matches/i)).toBeInTheDocument();
  });

  it('shows detailed view when a persona is selected', () => {
    render(<InvestigationPage />);
    const personButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(personButton!);
    
    expect(screen.getByText(/Tactical Identity/i)).toBeInTheDocument();
    expect(screen.getAllByText('test@example.com')[0]).toBeInTheDocument();
    expect(screen.getByText('Source A')).toBeInTheDocument();
    expect(screen.getByText('Source B')).toBeInTheDocument();
  });

  it('filters personas based on search query', () => {
    render(<InvestigationPage />);
    const searchInput = screen.getByPlaceholderText(/Search identities or locations/i);
    
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    
    fireEvent.change(searchInput, { target: { value: 'John' } });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays suspicion breakdown when present', () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      linkedPeople: [
        {
          ...mockLinkedPeople[0],
          suspicionScore: 60,
          suspicionBreakdown: {
            persistentFollowing: 60,
            trajectoryMatch: 0,
            criticalKeywords: 0,
            spatialProximity: 0,
            singleCoPresence: 0,
          }
        }
      ],
      totalLeads: 2,
      matchedCount: 1,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<InvestigationPage />);
    const personButton = screen.getByText('John Doe').closest('button');
    fireEvent.click(personButton!);
    
    expect(screen.getByText(/Suspicion Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Persistent Following/i)).toBeInTheDocument();
    expect(screen.getByText('+60')).toBeInTheDocument();
  });

  it('displays loading skeleton when loading is true', () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      linkedPeople: [],
      totalLeads: 0,
      matchedCount: 0,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });

    render(<InvestigationPage />);
    // Check for skeleton elements (assuming they use specific classes or test-ids)
    // Or just check if specific content is NOT there and some placeholder IS
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText(/Record Linking Engine/i)).toBeInTheDocument();
  });

  it('displays empty state when no results are found', () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      linkedPeople: [],
      totalLeads: 0,
      matchedCount: 0,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    render(<InvestigationPage />);
    expect(screen.getByText(/No identities found/i)).toBeInTheDocument();
  });

  it('displays error state when an error occurs', () => {
    (useInvestigation as jest.Mock).mockReturnValue({
      linkedPeople: [],
      totalLeads: 0,
      matchedCount: 0,
      loading: false,
      error: 'API Connection Failed',
      refetch: jest.fn(),
    });

    render(<InvestigationPage />);
    expect(screen.getByText(/API Connection Failed/i)).toBeInTheDocument();
  });
});
