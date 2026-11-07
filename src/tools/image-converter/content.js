export const howItWorks = [
  { title: 'Choose your images', text: 'Add up to 20 images at once. JPG, PNG, WebP, GIF, BMP and other formats your browser can open are accepted.' },
  { title: 'Pick a format', text: 'Convert to PNG, JPEG or WebP, and AVIF where your browser supports it. Set the quality for JPEG, WebP and AVIF.' },
  { title: 'Download', text: 'Download each image, or all of them in one ZIP file. Nothing is uploaded.' },
];

export const formulas = [
  { title: 'PNG', text: 'Lossless and keeps transparency. Best for screenshots, logos and graphics.' },
  { title: 'JPEG', text: 'Small files for photos, but no transparency. Transparent areas are filled with white.' },
  { title: 'WebP and AVIF', text: 'Modern formats that are usually smaller than JPEG at the same quality, and keep transparency.' },
];

export const examples = [
  { title: 'Screenshots for a website', text: 'Convert large PNG screenshots to WebP to make pages load faster.' },
  { title: 'Photos for an old program', text: 'Turn WebP photos into JPEG for software that cannot open WebP.' },
  { title: 'A logo with transparency', text: 'Convert a JPEG logo to PNG, then remove the background in an editor.' },
];

export const faqs = [
  {
    question: 'Are my images uploaded?',
    answer: 'No. Each image is converted in your browser and never leaves your device.',
  },
  {
    question: 'Will converting improve the quality?',
    answer: 'No. Converting cannot add detail that is not in the original. Converting a JPEG to PNG keeps its current quality but usually makes the file larger.',
  },
  {
    question: 'Why is AVIF missing?',
    answer: 'Only some browsers can create AVIF images. The option appears when your browser supports it.',
  },
  {
    question: 'Can I convert HEIC photos from an iPhone?',
    answer: 'Only in browsers that can open HEIC, such as Safari. Otherwise, set your iPhone camera to Most Compatible to save photos as JPEG.',
  },
];
