'use client';

import { useEffect } from 'react';

export default function ClientWrapper({ children }) {
  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-scroll-locked' &&
          document.body.getAttribute('data-scroll-locked') === '1'
        ) {
          document.body.removeAttribute('data-scroll-locked');
        }
      });
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    });

    return () => observer.disconnect();
  }, []);

  return <>{children}</>;
}
