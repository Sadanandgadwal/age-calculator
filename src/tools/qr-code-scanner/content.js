export const howItWorks = [
  { title: 'Choose how to scan', text: 'Use a picture or a screenshot, or start your camera and point it at the code.' },
  { title: 'Read the content', text: 'The text in the code appears as soon as it is found. The camera stops by itself.' },
  { title: 'Check before opening', text: 'A link is shown as text first, and opens only if you select it.' },
];

export const formulas = [
  { title: 'What a QR code holds', text: 'Plain text, which is often a web address, and may be contact details, Wi-Fi details or a message.' },
  { title: 'Reading an image', text: 'Large pictures are scaled so the longest side is at most 2,000 pixels, then searched for a code, including light codes on dark backgrounds.' },
  { title: 'Good scans', text: 'Keep the whole code in view, with a clear border around it, and avoid glare and blur.' },
];

export const examples = [
  { title: 'A screenshot', text: 'Take a screenshot of a code on your screen, and drop it here to read it on the same device.' },
  { title: 'A poster or menu', text: 'Start your camera and hold the code steady in the frame.' },
  { title: 'A suspicious code', text: 'Read a code here first to see the address before you decide to visit it.' },
];

export const faqs = [
  {
    question: 'Are my images or camera video uploaded?',
    answer: 'No. They are processed in your browser and stay on your device. The camera starts only when you select it, and stops when a code is found or you leave.',
  },
  {
    question: 'Why doesn’t the camera work?',
    answer: 'Your browser needs your permission, and the page must be on a secure (https) connection. If it still fails, take a photo and scan it from an image.',
  },
  {
    question: 'Is it safe to open a scanned link?',
    answer: 'Not always, as a code can lead to a harmful site. Check that the address looks right before selecting it, and do not enter passwords on an unexpected page.',
  },
  {
    question: 'Can it read normal barcodes?',
    answer: 'No. It reads QR codes only.',
  },
];
