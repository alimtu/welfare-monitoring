import ReactQueryProvider from '../lib/providers/ReactQueryProvider';
import LayoutShell from '../components/LayoutShell';
import './globals.css';

export const metadata = {
  title: 'University Welfare Monitoring',
  description: 'University Welfare Monitoring - سامانه پایش رفاه دانشگاهی',
  manifest: '/manifest.json',
  applicationName: 'University Welfare Monitoring',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'University Welfare Monitoring',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#244a9a',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#244a9a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="University Welfare Monitoring" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-touch-icon.png" />
      </head>
      <body>
        <ReactQueryProvider>
          <LayoutShell>{children}</LayoutShell>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
