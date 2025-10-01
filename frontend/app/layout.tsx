import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="relative min-h-screen">
          {/* Grid pattern background */}
          <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

          {/* Main layout */}
          <div className="relative z-10">
            <Navbar />
            <main className="pt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
