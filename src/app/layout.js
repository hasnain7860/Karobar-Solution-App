import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
});

// FIX: themeColor is now defined in the viewport export
export const viewport = {
  themeColor: '#EA5A5A',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: 'Karobar Solution',
  description: 'Manage your business inventory, sales, and accounts.',
  manifest: '/manifest.json',
  // FIX: restructured Apple properties to match current Next.js Metadata API
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Karobar',
  },
  icons: {
    icon: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans bg-bg-light`}>
        {children}
      </body>
    </html>
  );
}
