import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';
import React from 'react';

// Mock the IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

// Mock the matchMedia
window.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(), // deprecated
  removeListener: vi.fn(), // deprecated
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));


describe('App Navigation', () => {
  it('should navigate forward and backward using browser history', async () => {
    render(<App />);

    // 1. Initially, we are on the IndexPage
    // Use `findBy` to wait for any initial async operations
    const indexHeading = await screen.findByRole('heading', { name: /فهرس القرآن/i });
    expect(indexHeading).toBeInTheDocument();

    // 2. Simulate navigating to the "Listen" page
    const listenButton = screen.getByRole('button', { name: /الاستماع/i });
    fireEvent.click(listenButton);

    // 3. Verify we are on the ListenPage
    const listenHeading = await screen.findByRole('heading', { name: /اختر القارئ/i });
    expect(listenHeading).toBeInTheDocument();

    // 4. Simulate the user pressing the back button
    fireEvent.popState(window, {
        state: { view: 'index', params: {} }
    });

    // 5. Verify we are back on the IndexPage
    const indexHeadingAfterBack = await screen.findByRole('heading', { name: /فهرس القرآن/i });
    expect(indexHeadingAfterBack).toBeInTheDocument();
  });
});
