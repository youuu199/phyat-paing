import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const MOBILE_MAX = 639;    // < 640px
const TABLET_MAX = 1024;   // 640px – 1024px

function getBreakpoint(width: number): Breakpoint {
  if (width <= MOBILE_MAX) return 'mobile';
  if (width <= TABLET_MAX) return 'tablet';
  return 'desktop';
}

export default function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    getBreakpoint(window.innerWidth)
  );

  useEffect(() => {
    const mqMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`);
    const mqTablet = window.matchMedia(`(max-width: ${TABLET_MAX}px)`);

    function update() {
      setBreakpoint(getBreakpoint(window.innerWidth));
    }

    mqMobile.addEventListener('change', update);
    mqTablet.addEventListener('change', update);
    window.addEventListener('resize', update);

    return () => {
      mqMobile.removeEventListener('change', update);
      mqTablet.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return breakpoint;
}
