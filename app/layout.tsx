import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { DataProvider } from "@/lib/data-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Data Analysis Platform",
  description: "A comprehensive platform for data analysis and visualization",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="space-unit">
      <body className={`${inter.className} min-h-screen`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <DataProvider>
            <div className="flex min-h-screen flex-col">
              {children}
            </div>
            <Toaster />
          </DataProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}