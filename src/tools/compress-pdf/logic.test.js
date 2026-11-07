import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as lib from '@cantoo/pdf-lib';
import { LEVELS, compressPdf, describeNoSaving, findImages, getFacts, getLevel, getOutcome, targetSize } from './logic.js';

const photo = new Uint8Array(readFileSync('scripts/fixtures/pdf-photo.pdf'));
const text = new Uint8Array(readFileSync('scripts/fixtures/pdf-sample.pdf'));
const fakeRecode = (image, size) => ({ bytes: image.bytes.slice(0, 1000), width: size.width, height: size.height, components: 3 });

describe('levels', () => {
  it('has three levels and defaults to Recommended', () => {
    expect(LEVELS.map(({ id }) => id)).toEqual(['light', 'recommended', 'strong']);
    expect(getLevel('nope').id).toBe('recommended');
  });
});

describe('targetSize', () => {
  it('scales the long side down and keeps the shape', () => {
    expect(targetSize(4000, 3000, 1600)).toEqual({ width: 1600, height: 1200 });
    expect(targetSize(900, 3000, 1000)).toEqual({ width: 300, height: 1000 });
  });

  it('never makes an image larger', () => {
    expect(targetSize(800, 600, 1600)).toEqual({ width: 800, height: 600 });
  });
});

describe('findImages', () => {
  it('finds the shared JPEG photo once', async () => {
    const document = await lib.PDFDocument.load(photo);
    const images = findImages(document, lib);
    expect(images).toHaveLength(1);
    expect(images[0]).toMatchObject({ width: 1200, height: 900, components: 3 });
  });

  it('finds nothing in a text-only PDF', async () => {
    expect(findImages(await lib.PDFDocument.load(text), lib)).toHaveLength(0);
  });
});

describe('compressPdf', () => {
  it('replaces photos that get smaller and keeps every page', async () => {
    const progress = [];
    const { output, imageCount, replaced } = await compressPdf(photo, 'strong', fakeRecode, (done, total) => progress.push([done, total]));
    expect([imageCount, replaced]).toEqual([1, 1]);
    expect(progress).toEqual([[1, 1]]);
    expect(output.length).toBeLessThan(photo.length / 2);
    const saved = await lib.PDFDocument.load(output);
    expect(saved.getPageCount()).toBe(3);
    const [image] = findImages(saved, lib);
    expect(image).toMatchObject({ width: 1000, height: 750 });
  });

  it('keeps a photo when the new version is not smaller', async () => {
    const { replaced, output } = await compressPdf(photo, 'light', (image, size) => ({ ...size, bytes: image.bytes, components: 3 }));
    expect(replaced).toBe(0);
    expect(findImages(await lib.PDFDocument.load(output), lib)[0]).toMatchObject({ width: 1200 });
  });

  it('keeps a photo when recoding fails', async () => {
    const { replaced } = await compressPdf(photo, 'light', () => {
      throw new Error('decode failed');
    });
    expect(replaced).toBe(0);
  });

  it('changes the colour space when a grey photo comes back in colour', async () => {
    const { output } = await compressPdf(photo, 'strong', (image, size) => ({ ...fakeRecode(image, size), components: 1 }));
    const [image] = findImages(await lib.PDFDocument.load(output), lib);
    expect(image.components).toBe(1);
  });
});

describe('outcome', () => {
  it('only counts a real saving', () => {
    expect(getOutcome(1000, 500)).toMatchObject({ saved: 500, percent: 50, smaller: true });
    expect(getOutcome(1000, 995).smaller).toBe(false);
    expect(getOutcome(1000, 1200).smaller).toBe(false);
  });

  it('describes the facts and the no-saving cases', () => {
    expect(getFacts(getOutcome(2048, 1024), 2, 1).map(({ value }) => value)).toEqual(['2 KB', '1 KB', '1 KB (50%)', '1 of 2']);
    expect(describeNoSaving(0)).toMatch(/no photos/);
    expect(describeNoSaving(3)).toMatch(/already well compressed/);
  });
});
