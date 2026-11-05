import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom has no canvas. Returning null makes the confetti skip drawing without logging errors.
HTMLCanvasElement.prototype.getContext = () => null;

// jsdom has no layout, so scrolling is not implemented.
window.scrollTo = () => {};

afterEach(() => {
  cleanup();
});
