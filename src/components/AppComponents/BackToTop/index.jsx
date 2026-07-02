'use client';

import { useEffect, useState } from 'react';
import { ChevronUp } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export default function BackToTopButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const isInHomePage = pathname === '/';

  return (
    visible && (
      <div className="flex gap-2 fixed bottom-7 lg:left-12 left-6 z-50">
        <button
          onClick={scrollToTop}
          className="bg-[#0CC0BA] text-white p-3 rounded-full transition-all cursor-pointer "
          aria-label="Back to top"
        >
          <ChevronUp />
        </button>

        {isInHomePage && (
          <button
            onClick={() => {
              router.push('/contact/admin');
            }}
            className="bg-[#0CC0BA] text-white p-3 rounded-full transition-all cursor-pointer "
            aria-label="Back to top"
          >
            ارتباط با رئیس دانشگاه
          </button>
        )}
      </div>
    )
  );
}
