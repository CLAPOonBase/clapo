import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from './components/Navbar'
import Providers from './components/Providers'
import Footer from './components/Footer'
import { ToastContainer } from './components/ToastContainer'
import { NetworkChecker } from './components/NetworkChecker'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clapo',
  description: 'Social platform for sharing and connecting',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{background:"black"}} className={inter.className}>
        <Providers>
          <NetworkChecker />
          {/* <Navbar /> */}
          {children}
          {/* <Footer/> */}
          <ToastContainer />
        </Providers>
      </body>
    </html>
  )
}