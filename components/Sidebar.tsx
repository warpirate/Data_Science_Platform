"use client"

import Link from "next/link"
import { BookOpen, FileSpreadsheet } from "lucide-react"

interface SidebarProps {
  isOpen: boolean
}

export function Sidebar({ isOpen }: SidebarProps) {
  return (
    <div className={`notebook-sidebar ${isOpen ? "open" : ""} sketch-card`}>
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6" />
          <h2 className="text-xl font-bold">DataNotebook</h2>
        </div>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
              <FileSpreadsheet className="h-5 w-5" />
              <span>New Project</span>
            </Link>
          </li>
          <li>
            <Link href="/notebook" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
              <BookOpen className="h-5 w-5" />
              <span>My Notebook</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}