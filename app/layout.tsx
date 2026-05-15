import type { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'
import BottomNav from '@/components/layout/BottomNav'
import SplashScreen from '@/components/SplashScreen'
import { LangProvider } from '@/lib/lang-context'
import './globals.css'

export const metadata: Metadata = {
  title: 'חגי & סלומה — Wedding Planner',
  description: 'תכנון החתונה של חגי וסלומה',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#F8F5F0" />
      </head>
      <body>
        <LangProvider>
          <SplashScreen />
          <Sidebar />
          <div className="main-content" style={{ minHeight: '100dvh', padding: '1.5rem 1.25rem' }}>
            {children}
          </div>
          <BottomNav />
        </LangProvider>
      </body>
    </html>
  )
}
