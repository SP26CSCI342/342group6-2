import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import GlobalLeaderboard from '../pages/GlobalLeaderboard';

describe('GlobalLeaderboard Component', () => {
  it('should render the leaderboard heading', () => {
    render(<GlobalLeaderboard />);
    
    expect(screen.getByText('Leader Board')).toBeInTheDocument();
  });

  it('should render a list of players', () => {
    render(<GlobalLeaderboard />);
    
    const list = screen.getByRole('list');
    expect(list).toBeInTheDocument();
  });

  it('should display player names', () => {
    render(<GlobalLeaderboard />);
    
    // Check for at least one player (Player 1)
    const players = screen.getAllByText(/Player/i);
    expect(players.length).toBeGreaterThan(0);
  });

  it('should display scores', () => {
    render(<GlobalLeaderboard />);
    
    // The component should render scores
    const list = screen.getByRole('list');
    const items = list.querySelectorAll('li');
    expect(items.length).toBeGreaterThan(0);
  });

  it('should have proper list items', () => {
    render(<GlobalLeaderboard />);
    
    const listItems = screen.getAllByRole('listitem');
    expect(listItems.length).toBeGreaterThan(0);
    
    // First item should have the First class (gold styling)
    expect(listItems[0].querySelector('.First')).toBeInTheDocument();
  });
});
