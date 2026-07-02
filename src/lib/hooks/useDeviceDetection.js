'use client';

import { useState, useEffect } from 'react';

const breakpoints = {
  mobile: 640,
  desktop: 1024,
};

export const useDeviceDetection = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isDesktop: false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setDevice({
        isMobile: width < breakpoints.mobile,
        isDesktop: width >= breakpoints.desktop,
      });
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return device;
};
