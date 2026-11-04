import { useRef, useState } from 'react';
import { useSubmitFocus } from './useSubmitFocus.js';

export function useCalculatorForm() {
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  return {
    submitted: submitCount > 0,
    formRef,
    headingRef,
    submit: (event) => {
      event.preventDefault();
      setSubmitCount((count) => count + 1);
    },
    clear: () => setSubmitCount(0),
  };
}
