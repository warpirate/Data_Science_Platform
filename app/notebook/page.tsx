"use client"

import { useState, useRef, useMemo } from "react"
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
  GraduationCap,
  Calculator,
  ContrastIcon as Compare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData, type CellType } from "@/lib/data-context"
import { DataTable } from "@/components/data-table"
import { DataVisualizer } from "@/components/data-visualizer"
import { DataPreprocessor } from "@/components/data-preprocessor"
import { DataExplorer } from "@/components/data-explorer"
import { DataProfiler } from "@/components/data-profiler"
import { TextEditor } from "@/components/text-editor"
import { CodeEditor } from "@/components/code-editor"
import { MLModelTrainer } from "@/components/ml-model-trainer"
import { MLPredictor } from "@/components/ml-predictor"
import { MLModelComparison } from "@/components/ml-model-comparison"
import { SmartLayout } from "@/components/smart-layout"
import { DataUploadPrompt } from "@/components/data-upload-prompt"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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

  const hasData = useMemo(() => processedData.length > 0, [processedData.length])
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const cellTypeOptions = useMemo(
    () => [
      { value: "data" as CellType, label: "Data Overview", icon: Table, description: "View and explore your dataset" },
      {
        value: "profile" as CellType,
        label: "Data Profile",
        icon: Info,
        description: "Detailed data profiling and quality analysis",
      },
      {
        value: "exploration" as CellType,
        label: "Data Exploration",
        icon: LineChart,
        description: "Interactive data exploration tools",
      },
      {
        value: "visualization" as CellType,
        label: "Visualization",
        icon: BarChart3,
        description: "Create charts and graphs",
      },
      {
        value: "preprocessing" as CellType,
        label: "Preprocessing",
        icon: Filter,
        description: "Clean and transform your data",
      },
      {
        value: "ml-trainer" as CellType,
        label: "ML Trainer",
        icon: GraduationCap,
        description: "Train machine learning models",
      },
      {
        value: "ml-predictor" as CellType,
        label: "ML Predictor",
        icon: Calculator,
        description: "Make predictions with trained models",
      },
      {
        value: "ml-insights" as CellType,
        label: "ML Comparison",
        icon: Compare,
        description: "Compare multiple ML models",
      },
      { value: "text" as CellType, label: "Notes", icon: FileText, description: "Add text notes and documentation" },
      { value: "code" as CellType, label: "Code", icon: Code, description: "Execute custom code" },
    ],
    [],
  )

  const handleDragStart = (position: number) => {
    dragItem.current = position
  }

  const handleDragEnter = (position: number) => {
    dragOverItem.current = position
  }

  const handleDrop = () => {
    try {
      if (dragItem.current === null || dragOverItem.current === null) return
      if (dragItem.current === dragOverItem.current) return

      reorderCells(dragItem.current, dragOverItem.current)

      dragItem.current = null
      dragOverItem.current = null

      toast({
        title: "Cell reordered",
        description: "The notebook cell has been moved to a new position.",
      })
    } catch (error) {
      console.error("Error reordering cells:", error)
      toast({
        title: "Error",
        description: "Failed to reorder cell. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderCellContent = (type: CellType) => {
    switch (type) {
      case "data":
        return <DataTable />
      case "profile":
        return <DataProfiler />
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
      case "ml-trainer":
        return <MLModelTrainer />
      case "ml-predictor":
        return <MLPredictor />
      case "ml-insights":
        return <MLModelComparison />
      default:
        return <div>Unknown cell type</div>
    }
  }

  const getCellIcon = (type: CellType) => {
    const option = cellTypeOptions.find((opt) => opt.value === type)
    const IconComponent = option?.icon || FileText
    return <IconComponent className="h-4 w-4" />
  }

  const handleEditTitle = (id: string, currentTitle: string) => {
    try {
      setEditingCellId(id)
      setNewCellTitle(currentTitle)
    } catch (error) {
      console.error("Error editing title:", error)
    }
  }

  const handleSaveTitle = () => {
    try {
      if (editingCellId && newCellTitle.trim()) {
        updateCellTitle(editingCellId, newCellTitle)
        setEditingCellId(null)
        setNewCellTitle("")

        toast({
          title: "Title updated",
          description: "The cell title has been updated successfully.",
        })
      }
    } catch (error) {
      console.error("Error saving title:", error)
      toast({
        title: "Error",
        description: "Failed to update title. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCell = (id: string) => {
    setCellToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteCell = () => {
    try {
      if (cellToDelete) {
        removeCell(cellToDelete)
        setCellToDelete(null)
        setDeleteDialogOpen(false)

        toast({
          title: "Cell deleted",
          description: "The notebook cell has been removed.",
        })
      }
    } catch (error) {
      console.error("Error deleting cell:", error)
      toast({
        title: "Error",
        description: "Failed to delete cell. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddCell = (type: CellType) => {
    addCell(type)

    toast({
      title: "Cell added",
      description: `A new ${cellTypeOptions.find((opt) => opt.value === type)?.label} cell has been added to your notebook.`,
    })
  }

  const handleExport = (format: "csv" | "xlsx") => {
    exportData(format)

    toast({
      title: "Export successful",
      description: `Your data has been exported as ${format.toUpperCase()}.`,
    })
  }

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "Notebook", current: true },
    ],
    [],
  )

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
            <li>
              <Link href="/dashboard-creator" className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted">
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard Creator</span>
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
              <Link href="/dashboard-creator" className="transition-colors hover:text-foreground/80">
                Dashboard Creator
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
            {hasData && (
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
                  <DropdownMenuItem onClick={() => handleAddCell("profile")}>
                    <Info className="mr-2 h-4 w-4" />
                    <span>Data Profile</span>
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
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleAddCell("ml-trainer")}>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>ML Model Trainer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddCell("ml-predictor")}>
                    <Calculator className="mr-2 h-4 w-4" />
                    <span>ML Predictor</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAddCell("ml-insights")}>
                    <Compare className="mr-2 h-4 w-4" />
                    <span>ML Comparison</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className={`flex-1 ${sidebarOpen ? "app-main sidebar-open" : "app-main"}`}>
        <SmartLayout
          title="Data Analysis Notebook"
          description="Analyze, visualize, and build machine learning models with your data"
          breadcrumbItems={breadcrumbItems}
          requiresData={false}
          showDataInfo={hasData}
        >
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
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to Your Data Notebook</CardTitle>
                    <CardDescription>
                      Your data is loaded and ready! Add cells to start analyzing your data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {cellTypeOptions.slice(0, 6).map((option) => {
                        const IconComponent = option.icon
                        return (
                          <Card
                            key={option.value}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleAddCell(option.value)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-3">
                                <IconComponent className="h-6 w-6 text-primary" />
                                <div>
                                  <h3 className="font-medium">{option.label}</h3>
                                  <p className="text-sm text-muted-foreground">{option.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
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
                      <Badge variant="secondary" className="text-xs">
                        {cellTypeOptions.find((opt) => opt.value === cell.type)?.label}
                      </Badge>
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

              {notebookCells.length > 0 && (
                <Card className="border-dashed">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground mb-4">Add another cell to continue your analysis</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Cell
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {cellTypeOptions.map((option) => {
                            const IconComponent = option.icon
                            return (
                              <DropdownMenuItem key={option.value} onClick={() => handleAddCell(option.value)}>
                                <IconComponent className="mr-2 h-4 w-4" />
                                <span>{option.label}</span>
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <DataUploadPrompt
              title="Upload Data to Get Started"
              description="Upload a CSV or Excel file to begin analyzing your data in the notebook."
            />
          )}
        </SmartLayout>
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
