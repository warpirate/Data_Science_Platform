"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  FileSpreadsheet,
  Download,
  Menu,
  BookOpen,
  Plus,
  ChevronDown,
  Edit2,
  Trash2,
  MoveVertical,
  BarChart3,
  LineChart,
  Table,
  Filter,
  FileText,
  Code,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { FileUpload } from "@/components/file-upload"
import { useData, type CellType } from "@/lib/data-context"
import { DataTable } from "@/components/data-table"
import { DataVisualizer } from "@/components/data-visualizer"
import { DataPreprocessor } from "@/components/data-preprocessor"
import { DataExplorer } from "@/components/data-explorer"
import { TextEditor } from "@/components/text-editor"
import { CodeEditor } from "@/components/code-editor"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ModeToggle } from "@/components/mode-toggle"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function NotebookPage() {
  const {
    processedData,
    isLoading,
    exportData,
    fileName,
    notebookCells,
    addCell,
    updateCellTitle,
    removeCell,
    reorderCells,
  } = useData()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingCellId, setEditingCellId] = useState<string | null>(null)
  const [newCellTitle, setNewCellTitle] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [cellToDelete, setCellToDelete] = useState<string | null>(null)
  const hasData = processedData.length > 0
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const handleDragStart = (position: number) => {
    dragItem.current = position
  }

  const handleDragEnter = (position: number) => {
    dragOverItem.current = position
  }

  const handleDrop = () => {
    if (dragItem.current === null || dragOverItem.current === null) return

    // Call the reorderCells function from the data context
    reorderCells(dragItem.current, dragOverItem.current)

    // Reset the drag references
    dragItem.current = null
    dragOverItem.current = null

    // Show a toast notification
    toast({
      title: "Cell reordered",
      description: "The notebook cell has been moved to a new position.",
    })
  }

  const renderCellContent = (type: CellType) => {
    switch (type) {
      case "data":
        return <DataTable />
      case "visualization":
        return <DataVisualizer />
      case "preprocessing":
        return <DataPreprocessor />
      case "exploration":
        return <DataExplorer />
      case "text":
        return <TextEditor />
      case "code":
        return <CodeEditor />
      default:
        return <div>Unknown cell type</div>
    }
  }

  const getCellIcon = (type: CellType) => {
    switch (type) {
      case "data":
        return <Table className="h-4 w-4" />
      case "visualization":
        return <BarChart3 className="h-4 w-4" />
      case "preprocessing":
        return <Filter className="h-4 w-4" />
      case "exploration":
        return <LineChart className="h-4 w-4" />
      case "text":
        return <FileText className="h-4 w-4" />
      case "code":
        return <Code className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const handleEditTitle = (id: string, currentTitle: string) => {
    setEditingCellId(id)
    setNewCellTitle(currentTitle)
  }

  const handleSaveTitle = () => {
    if (editingCellId && newCellTitle.trim()) {
      updateCellTitle(editingCellId, newCellTitle)
      setEditingCellId(null)
      setNewCellTitle("")

      toast({
        title: "Title updated",
        description: "The cell title has been updated successfully.",
      })
    }
  }

  const handleDeleteCell = (id: string) => {
    setCellToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCell = () => {
    if (cellToDelete) {
      removeCell(cellToDelete)
      setCellToDelete(null)
      setDeleteDialogOpen(false)

      toast({
        title: "Cell deleted",
        description: "The notebook cell has been removed.",
      })
    }
  }

  const handleAddCell = (type: CellType) => {
    addCell(type)

    toast({
      title: "Cell added",
      description: `A new ${type} cell has been added to your notebook.`,
    })
  }

  const handleExport = (format: "csv" | "xlsx") => {
    exportData(format)

    toast({
      title: "Export successful",
      description: `Your data has been exported as ${format.toUpperCase()}.`,
    })
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
              <Link href="/" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                <FileSpreadsheet className="h-5 w-5" />
                <span>New Project</span>
              </Link>
            </li>
            <li>
              <Link href="/notebook" className="flex items-center space-x-2 p-2 rounded-md bg-muted">
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
              <Link href="/notebook" className="text-foreground">
                Notebook
              </Link>
              <Link href="/docs" className="transition-colors hover:text-foreground/80">
                Documentation
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <ModeToggle />
            {hasData && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Download className="h-3.5 w-3.5" />
                    <span>Export</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport("xlsx")}>Export as Excel</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Cell</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleAddCell("data")}>
                  <Table className="mr-2 h-4 w-4" />
                  <span>Data Table</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddCell("visualization")}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Visualization</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddCell("preprocessing")}>
                  <Filter className="mr-2 h-4 w-4" />
                  <span>Preprocessing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddCell("exploration")}>
                  <LineChart className="mr-2 h-4 w-4" />
                  <span>Exploration</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAddCell("text")}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Text Note</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddCell("code")}>
                  <Code className="mr-2 h-4 w-4" />
                  <span>Code</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main id="main-content" className={`flex-1 ${sidebarOpen ? "app-main sidebar-open" : "app-main"}`}>
        <div className="container py-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">My Notebook</h1>
                {fileName && <p className="text-sm text-muted-foreground">Current file: {fileName}</p>}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24">
                <div className="flex flex-col items-center gap-2">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                  <p className="text-sm text-muted-foreground">Processing your data...</p>
                </div>
              </div>
            ) : hasData ? (
              <div className="space-y-6">
                {notebookCells.length === 0 && (
                  <Alert className="bg-muted">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Your notebook is empty. Add cells using the "Add Cell" button above.
                    </AlertDescription>
                  </Alert>
                )}

                {notebookCells.map((cell, index) => (
                  <div
                    key={cell.id}
                    className="app-cell fade-in"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <div className="app-cell-header">
                      <div className="flex items-center gap-2">
                        <MoveVertical
                          className="h-4 w-4 cursor-move text-muted-foreground"
                          aria-label="Drag to reorder"
                        />
                        {getCellIcon(cell.type)}
                        {editingCellId === cell.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={newCellTitle}
                              onChange={(e) => setNewCellTitle(e.target.value)}
                              className="h-7 w-64"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveTitle()
                                }
                              }}
                              aria-label="Edit cell title"
                            />
                            <Button size="sm" onClick={handleSaveTitle} className="h-7">
                              Save
                            </Button>
                          </div>
                        ) : (
                          <h3 className="text-sm font-medium">{cell.title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleEditTitle(cell.id, cell.title)}
                          aria-label="Edit title"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDeleteCell(cell.id)}
                          aria-label="Delete cell"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="app-cell-content">{renderCellContent(cell.type)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-md app-card">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Upload Data to Get Started</h2>
                    <p className="text-muted-foreground mb-6">
                      Upload a CSV or Excel file to begin analyzing your data.
                    </p>
                    <FileUpload className="w-full" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Cell</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this cell? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteCell}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
