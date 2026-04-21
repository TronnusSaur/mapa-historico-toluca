import { useState, useEffect, useRef } from 'react';

/**
 * Throttles a value — the returned value only updates at most once per `delay` ms.
 * Useful for preventing expensive downstream recalculations (e.g. re-clustering 46k points)
 * during rapid user interactions like timeline slider dragging.
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttled, setThrottled] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const remaining = delay - (now - lastRan.current);

    if (remaining <= 0) {
      // Enough time has passed — update immediately
      setThrottled(value);
      lastRan.current = now;
    } else {
      // Schedule an update after the remaining time
      const timer = setTimeout(() => {
        setThrottled(value);
        lastRan.current = Date.now();
      }, remaining);

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttled;
}
