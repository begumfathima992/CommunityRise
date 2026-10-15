import { useCallback, useRef } from 'react';

/**
 * Wraps an async submit handler so it cannot run twice at once,
 * even if the form is submitted again before React re-renders.
 */
export function useSubmitLock(handler) {
  const running = useRef(false);
  return useCallback(
    async (...args) => {
      if (running.current) return;
      running.current = true;
      try {
        await handler(...args);
      } finally {
        running.current = false;
      }
    },
    [handler],
  );
}
