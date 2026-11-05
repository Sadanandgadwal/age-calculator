import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '../config/site.js';
import { buildResultText } from '../utils/formatResult.js';

const STATUS_TIMEOUT_MS = 3000;
const TOOL_NAME = 'Age Calculator';
const TOOL_URL = `${siteConfig.url}/age-calculator`;

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // The clipboard API is missing on insecure origins and can be blocked by permissions.
    return false;
  }
}

/** Copy, share and print actions, plus a short status message for the user. */
export function useResultActions(result) {
  const [status, setStatus] = useState('');
  const timer = useRef(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showStatus = (message) => {
    setStatus(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus(''), STATUS_TIMEOUT_MS);
  };

  const copy = async () => {
    const copied = await copyText(buildResultText(result));
    showStatus(copied ? 'Age copied to clipboard.' : "Couldn't copy. Please select and copy the text manually.");
  };

  const share = async () => {
    const text = buildResultText(result);

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: TOOL_NAME, text, url: TOOL_URL });
      } catch (error) {
        // AbortError means the user closed the share sheet, which needs no message.
        if (error.name !== 'AbortError') {
          showStatus("Couldn't share. Please try copying instead.");
        }
      }
      return;
    }

    const copied = await copyText(`${text}\n${TOOL_URL}`);
    showStatus(
      copied
        ? "Sharing isn't available in this browser, so the result was copied instead."
        : "Sharing isn't available in this browser.",
    );
  };

  const print = () => window.print();

  return { status, copy, share, print };
}
