import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp
 * Animates a numeric value counting up from 0 once triggered. Used
 * only against real, sourced figures (e.g. the donation amounts
 * quoted in the charity's own materials) — never against invented
 * impact statistics, since Community Rise has just been founded and
 * has no track-record figures to report yet.
 */
export function useCountUp(target, { duration = 900, trigger = true } = {}) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!trigger || startedRef.current) return;
    startedRef.current = true;

    let startTime = null;
    let frame;

    const step = (timestamp) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [trigger, target, duration]);

  return value;
}
