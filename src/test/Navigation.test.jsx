import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navigation from '../components/Navigation/Navigation';

describe('Navigation Component', () => {
  it('should render navigation component', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    const navElement = screen.getByRole('navigation');
    expect(navElement).toBeInTheDocument();
  });

  it('should have brand link', () => {
    render(
      <BrowserRouter>
        <Navigation />
      </BrowserRouter>
    );
    
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
