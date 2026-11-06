export const howItWorks = [
  { title: 'Choose an image', text: 'Use a logo or icon, ideally square and at least 512 pixels wide. SVG works well.' },
  { title: 'Set the options', text: 'Crop to a square or fit the whole image, and keep transparency or add a background color.' },
  { title: 'Download and add', text: 'Save the ZIP, put the files in the root folder of your site, and add the HTML tags to every page.' },
];

export const formulas = [
  { title: 'favicon.ico', text: 'One file holding 16, 32 and 48 pixel icons, for browsers and tabs.' },
  { title: 'Apple touch icon', text: '180 × 180 pixels for iPhone and iPad home screens. It always has a solid background, as Apple fills transparent areas with black.' },
  { title: 'Android and manifest', text: '192 and 512 pixel icons, listed in site.webmanifest, for Android home screens and installed web apps.' },
];

export const examples = [
  { title: 'A square logo', text: 'Choose Crop to square, keep the background transparent, and download the ZIP.' },
  { title: 'A wide logo', text: 'Choose Fit inside so nothing is cut off, and add a background color if it looks too small.' },
  { title: 'Only the classic icon', text: 'Use Download favicon.ico if you only need the file for browser tabs.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. The icons are made in your browser and stay on your device.',
  },
  {
    question: 'Where do I put the files?',
    answer: 'In the root folder of your website, so that /favicon.ico opens. Then add the HTML tags inside the head section of your pages.',
  },
  {
    question: 'Why does my icon look blurry at 16 pixels?',
    answer: 'Fine detail cannot fit in so few pixels. A simple, bold shape or a single letter works best for small icons.',
  },
  {
    question: 'Why has my new favicon not appeared?',
    answer: 'Browsers keep favicons for a long time. Try a private window, or clear your browser cache.',
  },
];
