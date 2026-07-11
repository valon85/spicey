import { useEffect } from 'react';

/**
 * Locks body scroll while `active` is true.
 * Only touches body.style.overflow — does NOT touch html or #root
 * to avoid breaking fixed-position children on iOS Safari.
 */
export default function useScrollLock(active) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [active]);
}