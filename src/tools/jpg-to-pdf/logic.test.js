import { describe, expect, it } from 'vitest';
import { getFacts, layoutImage } from './logic.js';

const A4 = [595.28, 841.89];

describe('layoutImage', () => {
  it('matches the image at 96 pixels per inch', () => expect(layoutImage(400, 300, 'fit', 'none')).toEqual({ page: [300, 225], image: { x: 0, y: 0, width: 300, height: 225 } }));
  it('adds a margin to an image-sized page', () => {
    const layout = layoutImage(400, 300, 'fit', 'small');
    expect(layout.page[0]).toBeCloseTo(300 + 2 * 28.3465, 3);
    expect(layout.image.x).toBeCloseTo(28.3465, 3);
  });
  it('fits a tall image on portrait A4', () => {
    const layout = layoutImage(1000, 2000, 'a4', 'none');
    expect(layout.page).toEqual(A4);
    expect(layout.image.height).toBeCloseTo(A4[1]);
    expect(layout.image.x).toBeCloseTo((A4[0] - A4[1] / 2) / 2);
  });
  it('turns A4 for a wide image', () => {
    const layout = layoutImage(400, 300, 'a4', 'none');
    expect(layout.page).toEqual([A4[1], A4[0]]);
    expect(layout.image.height).toBeCloseTo(A4[0]);
  });
  it('keeps the margin on Letter', () => {
    const layout = layoutImage(100, 100, 'letter', 'small');
    expect(layout.page).toEqual([612, 792]);
    expect(layout.image.width).toBeCloseTo(612 - 2 * 28.3465, 3);
    expect(layout.image.y).toBeCloseTo((792 - layout.image.height) / 2);
  });
  it('keeps the image proportions', () => {
    const { image } = layoutImage(1234, 567, 'letter', 'small');
    expect(image.width / image.height).toBeCloseTo(1234 / 567);
  });
});

it('lists the facts', () =>
  expect(getFacts(3, { size: 2048 })).toEqual([
    { label: 'Images', value: '3' },
    { label: 'Pages', value: '3' },
    { label: 'File size', value: '2 KB' },
  ]));
