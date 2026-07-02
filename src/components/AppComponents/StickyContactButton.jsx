'use client';

import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

export default function StickyContactButton() {
  const pathname = usePathname();
  
  // Check if current path is in admin routes
  const isAdminRoute = pathname?.includes('/admin-root') || 
                      pathname?.includes('/create-page') || 
                      pathname?.includes('/create-post') || 
                      pathname?.includes('/delete-page') || 
                      pathname?.includes('/edit-components') || 
                      pathname?.includes('/edit-post');

  if (!isAdminRoute) return null;

  const handleContactClick = () => {
    // You can customize this action - open modal, navigate to contact page, etc.
    window.open('/contact', '_blank');
  };

  return (
    <div className="fixed bottom-6 left-6 z-50">
      <button
        onClick={handleContactClick}
        className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
        title="ارتباط با رییس دانشگاه"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">ارتباط با رییس دانشگاه</span>
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </button>
    </div>
  );
}
