export const howItWorks = [
  { title: 'Choose an image', text: 'Pick a file from your device, or drop it on the page.' },
  { title: 'Pick a shape and crop', text: 'Choose Free or a ratio, then drag the box or its corners. The arrow keys work too.' },
  { title: 'Download it', text: 'Check the preview, which updates as you crop, and save the result.' },
];

export const formulas = [
  { title: 'Aspect ratio', text: 'Width ÷ Height. A 16:9 crop is 1.78 times as wide as it is tall, and 1:1 is a square.' },
  { title: 'Exact pixels', text: 'The crop uses whole pixels of your original, so nothing is scaled and no detail is lost.' },
  { title: 'File format', text: 'JPG, PNG and WebP keep their format. Other formats, such as GIF and SVG, are saved as PNG.' },
];

export const examples = [
  { title: 'A profile picture', text: 'Choose 1:1 and center the box on a face for a square avatar.' },
  { title: 'A video thumbnail', text: 'Choose 16:9 to match the shape of most video players.' },
  { title: 'A phone story', text: 'Choose 9:16 for a full-screen vertical picture.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. It is cropped in your browser and stays on your device.',
  },
  {
    question: 'Does cropping lower the quality?',
    answer: 'No pixels are scaled. PNG stays exact, and JPG and WebP are saved again at high quality.',
  },
  {
    question: 'Can I crop with the keyboard?',
    answer: 'Yes. Select the crop box, use the arrow keys to move it, and hold Shift with the arrow keys to resize it.',
  },
  {
    question: 'Are photo details such as location kept?',
    answer: 'No. The new file leaves out metadata such as camera details and GPS location. Your original file is not changed.',
  },
];
