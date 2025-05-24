"use client"

import { useState } from "react"
import Link from "next/link"
import { FileUpload } from "@/components/file-upload"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, FileSpreadsheet, LineChart, PieChart, Upload, Menu, BookOpen, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useData } from "@/lib/data-context"
import { ModeToggle } from "@/components/mode-toggle"

export default function HomePage() {
  const router = useRouter()
  const { resetData } = useData()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleUploadSuccess = () => {
    router.push("/notebook")
  }

  const handleNewProject = () => {
    resetData()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className={`app-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-xl font-bold">DataNotebook</h2>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted"
                onClick={handleNewProject}
              >
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

      <header className="app-header">
        <div className="container flex h-16 items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <BookOpen className="h-6 w-6" />
              <span className="hidden font-bold sm:inline-block">DataNotebook</span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link href="/" className="transition-colors hover:text-foreground/80">
                Home
              </Link>
              <Link href="/notebook" className="transition-colors hover:text-foreground/80">
                Notebook
              </Link>
              <Link href="/docs" className="transition-colors hover:text-foreground/80">
                Documentation
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ModeToggle />
            <Button variant="outline" size="sm" className="h-8 gap-1" onClick={handleNewProject}>
              <FileSpreadsheet className="h-3.5 w-3.5" />
              <span>New Project</span>
            </Button>
          </div>
        </div>
      </header>

      <main id="main-content" className={`flex-1 ${sidebarOpen ? "app-main sidebar-open" : "app-main"}`}>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Data Analysis Notebook
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Upload, analyze, visualize, and export your data with our comprehensive notebook-style platform. Get
                    insights faster and make better decisions.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/notebook">Open Notebook</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="/docs">Learn More</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <FileUpload className="w-full max-w-[500px]" onSuccess={handleUploadSuccess} />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our notebook-style platform provides everything you need for comprehensive data analysis
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Upload className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Data Import</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Upload CSV and Excel files with our intuitive interface. Automatic data type detection and preview.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Exploratory Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get summary statistics, identify patterns, and explore your data with interactive tools.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <PieChart className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Data Visualization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Create beautiful charts and graphs to visualize your data and share insights.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <LineChart className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Data Preprocessing</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Clean, transform, and prepare your data for analysis with powerful preprocessing tools.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <FileSpreadsheet className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Data Export</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Download your processed data in CSV or Excel format for use in other applications.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                  <div className="grid gap-1">
                    <CardTitle>Notebook Interface</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Work in a familiar notebook-style interface with cells for different analysis tasks.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>

            <div className="mt-12 text-center">
              <Button asChild size="lg">
                <Link href="/notebook" className="group">
                  Get Started
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 DataNotebook. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
