import { headers } from 'next/headers';

/**
 * @returns {string} 'ar' for Arabic, 'fa' for Farsi
 */
export function getCurrentLocale() {
  const headersList = headers();
  const pathname = headersList.get('x-pathname') || '';

  // Detect language from URL path
  const isArabic = pathname.startsWith('/ar');
  return isArabic ? 'ar' : 'fa';
}

/**
 * Get the current language from headers
 * @returns {string} 'ar' for Arabic, 'fa' for Farsi
 */
export function getCurrentLanguage() {
  const headersList = headers();
  return headersList.get('x-language') || 'fa';
}
