export const howItWorks = [
  { title: 'Choose an image', text: 'Pick a photo, screenshot or logo. The color at its center is shown first.' },
  { title: 'Select a point', text: 'Click or tap anywhere, or move with the arrow keys. Hold Shift to move one pixel at a time.' },
  { title: 'Use the values', text: 'Copy the HEX, RGB and HSL values, or select one of the main colors.' },
];

export const formulas = [
  { title: 'HEX', text: 'The red, green and blue values, from 00 to FF, written one after another.' },
  { title: 'HSL', text: 'Hue from 0 to 360 degrees, with saturation and lightness as percentages. Values are rounded to whole numbers.' },
  { title: 'Main colors', text: 'Similar colors are grouped, then the five largest groups are shown as averages with their approximate share.' },
];

export const examples = [
  { title: 'Match a brand color', text: 'Pick the color from a logo to get the HEX code for your design.' },
  { title: 'Build a palette', text: 'Use the main colors of a photo as a starting point for a theme.' },
  { title: 'Check a screenshot', text: 'Find the exact color of a button or background shown on a page.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. It is read in your browser and stays on your device.',
  },
  {
    question: 'Why is a color slightly different from what I expected?',
    answer: 'JPG compression and photo noise change colors a little from pixel to pixel. Your browser may also convert images with a wide color profile to standard RGB.',
  },
  {
    question: 'What about transparent areas?',
    answer: 'Opacity is shown when a pixel is not fully solid. Mostly transparent pixels are left out of the main colors.',
  },
  {
    question: 'Are very large images supported?',
    answer: 'Yes, up to 40 megapixels. Images with a side over 4,096 pixels are scaled down first, so a pick may average neighboring pixels.',
  },
];
