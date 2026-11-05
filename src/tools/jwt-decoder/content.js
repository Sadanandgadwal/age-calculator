export const howItWorks = [
  { title: 'Paste your token', text: 'Add a JSON Web Token, with or without the word Bearer in front.' },
  { title: 'Read what is inside', text: 'See the header, the payload and the dates in readable form.' },
  { title: 'Remember what it does not do', text: 'This page only reads the token. It does not check that the token is genuine.' },
];

export const formulas = [
  { title: 'Structure', text: 'Three Base64URL parts separated by dots: header, payload and signature. The first two are JSON.' },
  { title: 'Dates', text: 'iat, nbf and exp are seconds since 1 January 1970 in UTC. They are shown here as readable UTC dates.' },
  { title: 'Time status', text: 'Compares exp and nbf with your device’s clock when you paste the token.' },
];

export const examples = [
  { title: 'Debugging a sign-in', text: 'Check whether a token has expired, or which user and permissions it holds.' },
  { title: 'A wrong audience', text: 'Read the aud claim to see which service the token was issued for.' },
  { title: 'A token with alg: none', text: 'It has no signature, so this tool shows a warning. A server should reject it.' },
];

export const faqs = [
  {
    question: 'Does this verify the token?',
    answer: 'No. Verifying needs the secret or public key, and must be done by the service that relies on the token. A token that decodes here may still be forged.',
  },
  {
    question: 'Is it safe to paste a real token?',
    answer: 'It is decoded in your browser and is never sent or stored. Even so, a live token can give access to an account, so prefer expired or test tokens where you can.',
  },
  {
    question: 'Why can’t I share or print the result?',
    answer: 'A token and its contents can be sensitive, so they should not pass through other apps or sit on paper. You can copy the decoded text if you need it.',
  },
  {
    question: 'Is the payload encrypted?',
    answer: 'No. A normal JWT is only encoded, so anyone holding it can read it. Never put secrets in a payload.',
  },
];
