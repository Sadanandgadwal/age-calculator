export const howItWorks = [
  { title: 'Choose an audio file', text: 'MP3, M4A, OGG, Opus, FLAC and WAV files work in most browsers. The file is read on your device.' },
  { title: 'Set the options', text: 'Keep the sample rate or lower it, make it mono, and trim the start and end if you like.' },
  { title: 'Download the WAV', text: 'Listen to the result, then download it as a standard 16-bit WAV file.' },
];

export const formulas = [
  { title: 'File size', text: 'WAV size ≈ seconds × sample rate × channels × 2 bytes. One minute of stereo at 44.1 kHz is about 10 MB.' },
  { title: 'Sample rate', text: '44.1 kHz suits music. 16 kHz is enough for speech and makes much smaller files.' },
  { title: 'Mono', text: 'Mono mixes the channels together and halves the file size.' },
];

export const examples = [
  { title: 'Voice note for transcription', text: 'Turn a WhatsApp or phone recording into a 16 kHz mono WAV, which speech software often needs.' },
  { title: 'Music for an editor', text: 'Convert an M4A track to WAV for audio or video editing software.' },
  { title: 'A short clip', text: 'Set a start and end time to cut out just the part you need.' },
];

export const faqs = [
  {
    question: 'Why does it only make WAV files?',
    answer: 'Browsers can save WAV without any extra software. MP3 and other compressed formats would need a large add-on download.',
  },
  {
    question: 'Why is the WAV file so much bigger?',
    answer: 'WAV stores sound without compression, so it is often 5 to 10 times the size of an MP3. Lower the sample rate or choose mono to make it smaller.',
  },
  {
    question: 'Will converting improve the sound?',
    answer: 'No. A WAV made from an MP3 keeps the MP3’s quality. It just stores it in a format more programs accept.',
  },
  {
    question: 'Is my audio uploaded?',
    answer: 'No. Everything happens in your browser, and the file never leaves your device.',
  },
];
