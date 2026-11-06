export const howItWorks = [
  { title: 'Choose an image', text: 'Pick a file from your device, or drop it on the page.' },
  { title: 'Enter the new size', text: 'Type a width or height in pixels, or a percent. Proportions stay the same unless you turn that off.' },
  { title: 'Download it', text: 'Check the preview and save the resized image.' },
];

export const formulas = [
  { title: 'Keeping proportions', text: 'New height = New width ÷ Original width × Original height, rounded to a whole pixel.' },
  { title: 'Resizing by percent', text: 'New width = Original width × Percent ÷ 100, and the same for the height.' },
  { title: 'File format', text: 'JPG, PNG and WebP keep their format. Other formats, such as GIF and SVG, are saved as PNG.' },
];

export const examples = [
  { title: 'A profile picture', text: 'Set a 3000 × 2000 px photo to a width of 600 px, and the height becomes 400 px.' },
  { title: 'A website image', text: 'Resize a large photo to 50% to reduce both its dimensions and its file size.' },
  { title: 'An exact requirement', text: 'Turn off Keep proportions if a form needs exact dimensions, though this can stretch the picture.' },
];

export const faqs = [
  {
    question: 'Is my image uploaded?',
    answer: 'No. It is resized in your browser and stays on your device.',
  },
  {
    question: 'Will my image lose quality?',
    answer: 'Making it smaller usually looks sharp. Making it larger cannot add detail, so it may look soft. JPG and WebP are saved at high quality.',
  },
  {
    question: 'Is transparency kept?',
    answer: 'Yes, for PNG and WebP. JPG does not support transparency.',
  },
  {
    question: 'What is the largest size I can make?',
    answer: 'Up to 12,000 pixels on a side and 40 megapixels in total. Some phones may run out of memory sooner.',
  },
  {
    question: 'Are photo details such as location kept?',
    answer: 'No. The new file leaves out metadata such as camera details and GPS location. Your original file is not changed.',
  },
];
