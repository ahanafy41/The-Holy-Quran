// src/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock scrollTo as it is not implemented in jsdom
window.HTMLElement.prototype.scrollTo = vi.fn();

// Mock WaveSurfer
vi.mock('wavesurfer.js', () => ({
  default: {
    create: vi.fn(() => ({
      on: vi.fn(),
      load: vi.fn(),
      play: vi.fn(),
      pause: vi.fn(),
      destroy: vi.fn(),
    })),
  },
}));
