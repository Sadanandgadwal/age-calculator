import { useEffect } from 'react';

export function useSubmitFocus(submitCount, formRef, resultsHeadingRef) {
  useEffect(() => {
    if (submitCount === 0) return;
    const invalidField = formRef.current?.querySelector('[aria-invalid="true"]');
    (invalidField ?? resultsHeadingRef.current)?.focus();
  }, [submitCount, formRef, resultsHeadingRef]);
}
