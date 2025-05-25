"use client"

import Link from "next/link"
import { BookOpen, FileSpreadsheet, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

interface NavbarProps {
  onToggleSidebar: () => void
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-width flex h-14 items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="touch-target"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">DataNotebook</span>
          </Link>
          
          <nav className="hidden md:flex nav-spacing">
            <Link href="/" className="nav-item transition-colors hover:text-foreground/80">
              Home
            </Link>
            <Link href="/notebook" className="nav-item transition-colors hover:text-foreground/80">
              Notebook
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}