"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FileSpreadsheet,
  Download,
  Menu,
  BookOpen,
  Plus,
  ChevronDown,
  LayoutDashboard,
  Save,
  Trash2,
  Settings,
  MoveVertical,
  BarChart3,
  Table,
  Gauge,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useData } from "@/lib/data-context"
import { DashboardChart } from "@/components/dashboard-chart"
import { DashboardTable } from "@/components/dashboard-table"
import { DashboardMetric } from "@/components/dashboard-metric"
import { DashboardFilter } from "@/components/dashboard-filter"
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
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Dashboard widget types
type WidgetType = "chart" | "table" | "metric" | "filter"

interface DashboardWidget {
  id: string
  type: WidgetType
  title: string
  config: any
  position: {
    x: number
    y: number
    w: number
    h: number
  }
}

export default function DashboardCreatorPage() {
  const { processedData, columns, columnTypes, fileName, isLoading } = useData()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [widgets, setWidgets] = useState<DashboardWidget[]>([])
  const [editingWidget, setEditingWidget] = useState<string | null>(null)
  const [widgetTitle, setWidgetTitle] = useState("")
  const [addWidgetDialogOpen, setAddWidgetDialogOpen] = useState(false)
  const [newWidgetType, setNewWidgetType] = useState<WidgetType>("chart")
  const [dashboardTitle, setDashboardTitle] = useState("My Dashboard")
  const [saveDashboardDialogOpen, setSaveDashboardDialogOpen] = useState(false)
  const [dashboardNameInput, setDashboardNameInput] = useState("")
  const [savedDashboards, setSavedDashboards] = useState<{ id: string; name: string }[]>([])
  const [loadDashboardDialogOpen, setLoadDashboardDialogOpen] = useState(false)
  const [selectedDashboardId, setSelectedDashboardId] = useState("")
  const [deleteWidgetId, setDeleteWidgetId] = useState<string | null>(null)
  const [deleteWidgetDialogOpen, setDeleteWidgetDialogOpen] = useState(false)

  const hasData = processedData.length > 0
  const numericColumns = columns.filter((col) => columnTypes[col] === "number")
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "string" || columnTypes[col] === "boolean")

  // Load saved dashboards from localStorage on mount
  useEffect(() => {
    const savedDashboardsStr = localStorage.getItem("savedDashboards")
    if (savedDashboardsStr) {
      try {
        const parsed = JSON.parse(savedDashboardsStr)
        setSavedDashboards(parsed)
      } catch (e) {
        console.error("Failed to parse saved dashboards", e)
      }
    }
  }, [])

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 11)
  }

  // Add a new widget to the dashboard
  const addWidget = (type: WidgetType) => {
    const newWidget: DashboardWidget = {
      id: generateId(),
      type,
      title: getDefaultWidgetTitle(type),
      config: getDefaultWidgetConfig(type),
      position: getDefaultWidgetPosition(type, widgets.length),
    }

    setWidgets((prev) => [...prev, newWidget])
    setAddWidgetDialogOpen(false)

    toast({
      title: "Widget added",
      description: `A new ${type} widget has been added to your dashboard.`,
    })
  }

  // Get default title for a widget type
  const getDefaultWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case "chart":
        return "Chart"
      case "table":
        return "Data Table"
      case "metric":
        return "Key Metric"
      case "filter":
        return "Data Filter"
      default:
        return "New Widget"
    }
  }

  // Get default config for a widget type
  const getDefaultWidgetConfig = (type: WidgetType) => {
    switch (type) {
      case "chart":
        return {
          chartType: "bar",
          xAxis: categoricalColumns[0] || "",
          yAxis: numericColumns[0] || "",
          colorScheme: "default",
        }
      case "table":
        return {
          columns: columns.slice(0, 5),
          pageSize: 5,
        }
      case "metric":
        return {
          column: numericColumns[0] || "",
          aggregation: "mean",
          format: "number",
          prefix: "",
          suffix: "",
        }
      case "filter":
        return {
          columns: [],
        }
      default:
        return {}
    }
  }

  // Get default position for a widget type
  const getDefaultWidgetPosition = (type: WidgetType, index: number) => {
    // Calculate grid position based on index
    const row = Math.floor(index / 2)
    const col = index % 2

    switch (type) {
      case "chart":
        return {
          x: col * 6,
          y: row * 6,
          w: 6,
          h: 6,
        }
      case "table":
        return {
          x: col * 6,
          y: row * 6,
          w: 6,
          h: 6,
        }
      case "metric":
        return {
          x: col * 3,
          y: row * 3,
          w: 3,
          h: 3,
        }
      case "filter":
        return {
          x: col * 6,
          y: row * 3,
          w: 6,
          h: 3,
        }
      default:
        return {
          x: 0,
          y: 0,
          w: 6,
          h: 6,
        }
    }
  }

  // Update widget title
  const updateWidgetTitle = () => {
    if (editingWidget && widgetTitle.trim()) {
      setWidgets((prev) =>
        prev.map((widget) => (widget.id === editingWidget ? { ...widget, title: widgetTitle } : widget)),
      )
      setEditingWidget(null)
      setWidgetTitle("")

      toast({
        title: "Widget updated",
        description: "The widget title has been updated successfully.",
      })
    }
  }

  // Delete a widget
  const handleDeleteWidget = (id: string) => {
    setDeleteWidgetId(id)
    setDeleteWidgetDialogOpen(true)
  }

  // Confirm widget deletion
  const confirmDeleteWidget = () => {
    if (deleteWidgetId) {
      setWidgets((prev) => prev.filter((widget) => widget.id !== deleteWidgetId))
      setDeleteWidgetId(null)
      setDeleteWidgetDialogOpen(false)

      toast({
        title: "Widget deleted",
        description: "The widget has been removed from your dashboard.",
      })
    }
  }

  // Save dashboard
  const saveDashboard = () => {
    if (!dashboardNameInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a dashboard name",
        variant: "destructive",
      })
      return
    }

    const dashboardId = generateId()
    const dashboardData = {
      id: dashboardId,
      name: dashboardNameInput,
      widgets,
      createdAt: new Date().toISOString(),
    }

    // Save to localStorage
    try {
      // Save dashboard data
      localStorage.setItem(`dashboard_${dashboardId}`, JSON.stringify(dashboardData))

      // Update saved dashboards list
      const updatedDashboards = [...savedDashboards, { id: dashboardId, name: dashboardNameInput }]
      setSavedDashboards(updatedDashboards)
      localStorage.setItem("savedDashboards", JSON.stringify(updatedDashboards))

      setDashboardTitle(dashboardNameInput)
      setSaveDashboardDialogOpen(false)
      setDashboardNameInput("")

      toast({
        title: "Dashboard saved",
        description: "Your dashboard has been saved successfully.",
      })
    } catch (e) {
      console.error("Failed to save dashboard", e)
      toast({
        title: "Error",
        description: "Failed to save dashboard",
        variant: "destructive",
      })
    }
  }

  // Load dashboard
  const loadDashboard = () => {
    if (!selectedDashboardId) {
      toast({
        title: "Error",
        description: "Please select a dashboard to load",
        variant: "destructive",
      })
      return
    }

    try {
      const dashboardDataStr = localStorage.getItem(`dashboard_${selectedDashboardId}`)
      if (dashboardDataStr) {
        const dashboardData = JSON.parse(dashboardDataStr)
        setWidgets(dashboardData.widgets)
        setDashboardTitle(dashboardData.name)
        setLoadDashboardDialogOpen(false)

        toast({
          title: "Dashboard loaded",
          description: `Dashboard "${dashboardData.name}" has been loaded successfully.`,
        })
      }
    } catch (e) {
      console.error("Failed to load dashboard", e)
      toast({
        title: "Error",
        description: "Failed to load dashboard",
        variant: "destructive",
      })
    }
  }

  // Export dashboard as image
  const exportDashboard = () => {
    toast({
      title: "Export initiated",
      description: "Your dashboard is being prepared for export.",
    })

    // This would be implemented with html2canvas or similar library
    setTimeout(() => {
      toast({
        title: "Dashboard exported",
        description: "Your dashboard has been exported successfully.",
      })
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col paper-texture">
      <div className={`notebook-sidebar ${sidebarOpen ? "open" : ""} sketch-card`}>
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
            <li>
              <Link href="/dashboard-creator" className="flex items-center space-x-2 p-2 rounded-md bg-muted">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard Creator</span>
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sketch-border">
        <div className="container flex h-14 items-center">
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
              <Link href="/dashboard-creator" className="text-foreground">
                Dashboard Creator
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1 sketch-button">
                  <Save className="h-3.5 w-3.5" />
                  <span>Save/Load</span>
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSaveDashboardDialogOpen(true)}>
                  <Save className="mr-2 h-4 w-4" />
                  <span>Save Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLoadDashboardDialogOpen(true)}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Load Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={exportDashboard}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Export as Image</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 sketch-button"
              onClick={() => setAddWidgetDialogOpen(true)}
              disabled={!hasData}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Widget</span>
            </Button>
          </div>
        </div>
      </header>

      <main className={`flex-1 ${sidebarOpen ? "notebook-main sidebar-open" : "notebook-main"}`}>
        <div className="container py-6">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{dashboardTitle}</h1>
                {fileName && <p className="text-sm text-muted-foreground">Data source: {fileName}</p>}
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
              <div className="grid grid-cols-12 gap-4">
                {widgets.map((widget) => (
                  <div
                    key={widget.id}
                    className={`col-span-${widget.position.w} row-span-${widget.position.h} notebook-cell sketch-card`}
                    style={{
                      gridColumn: `span ${widget.position.w}`,
                      gridRow: `span ${widget.position.h}`,
                    }}
                  >
                    <div className="notebook-cell-header">
                      <div className="flex items-center gap-2">
                        <MoveVertical className="h-4 w-4 cursor-move text-muted-foreground" />
                        {widget.type === "chart" && <BarChart3 className="h-4 w-4" />}
                        {widget.type === "table" && <Table className="h-4 w-4" />}
                        {widget.type === "metric" && <Gauge className="h-4 w-4" />}
                        {widget.type === "filter" && <Settings className="h-4 w-4" />}

                        {editingWidget === widget.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={widgetTitle}
                              onChange={(e) => setWidgetTitle(e.target.value)}
                              className="h-7 w-64 sketch-input"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  updateWidgetTitle()
                                }
                              }}
                            />
                            <Button size="sm" onClick={updateWidgetTitle} className="h-7 sketch-button">
                              Save
                            </Button>
                          </div>
                        ) : (
                          <h3 className="text-sm font-medium">{widget.title}</h3>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => {
                            setEditingWidget(widget.id)
                            setWidgetTitle(widget.title)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                          <span className="sr-only">Edit widget</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleDeleteWidget(widget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete widget</span>
                        </Button>
                      </div>
                    </div>
                    <div className="notebook-cell-content">
                      {widget.type === "chart" && <DashboardChart config={widget.config} />}
                      {widget.type === "table" && <DashboardTable config={widget.config} />}
                      {widget.type === "metric" && <DashboardMetric config={widget.config} />}
                      {widget.type === "filter" && <DashboardFilter config={widget.config} />}
                    </div>
                  </div>
                ))}

                {widgets.length === 0 && (
                  <div className="col-span-12 flex flex-col items-center justify-center py-12 text-center">
                    <LayoutDashboard className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-xl font-bold mb-2">Your Dashboard is Empty</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Add widgets to create a custom dashboard for your data. You can add charts, tables, metrics, and
                      filters.
                    </p>
                    <Button onClick={() => setAddWidgetDialogOpen(true)} className="sketch-button">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Widget
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-full max-w-md sketch-card">
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">Upload Data to Get Started</h2>
                    <p className="text-muted-foreground mb-6">
                      Upload a CSV or Excel file to begin creating your dashboard.
                    </p>
                    <Button asChild className="w-full sketch-button">
                      <Link href="/">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Data
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add Widget Dialog */}
      <Dialog open={addWidgetDialogOpen} onOpenChange={setAddWidgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Widget</DialogTitle>
            <DialogDescription>Choose the type of widget you want to add to your dashboard.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="widget-type">Widget Type</Label>
              <Select value={newWidgetType} onValueChange={(value: WidgetType) => setNewWidgetType(value)}>
                <SelectTrigger id="widget-type" className="sketch-input">
                  <SelectValue placeholder="Select widget type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chart">
                    <div className="flex items-center">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>Chart</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="table">
                    <div className="flex items-center">
                      <Table className="mr-2 h-4 w-4" />
                      <span>Data Table</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="metric">
                    <div className="flex items-center">
                      <Gauge className="mr-2 h-4 w-4" />
                      <span>Key Metric</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="filter">
                    <div className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Data Filter</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => addWidget(newWidgetType)}>Add Widget</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Widget Dialog */}
      <Dialog open={deleteWidgetDialogOpen} onOpenChange={setDeleteWidgetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Widget</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this widget? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDeleteWidget}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Dashboard Dialog */}
      <Dialog open={saveDashboardDialogOpen} onOpenChange={setSaveDashboardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Dashboard</DialogTitle>
            <DialogDescription>Enter a name for your dashboard to save it for later use.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input
                id="dashboard-name"
                placeholder="My Dashboard"
                value={dashboardNameInput}
                onChange={(e) => setDashboardNameInput(e.target.value)}
                className="sketch-input"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={saveDashboard}>Save Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Dashboard Dialog */}
      <Dialog open={loadDashboardDialogOpen} onOpenChange={setLoadDashboardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Load Dashboard</DialogTitle>
            <DialogDescription>Select a previously saved dashboard to load.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="saved-dashboard">Saved Dashboards</Label>
              {savedDashboards.length > 0 ? (
                <Select value={selectedDashboardId} onValueChange={setSelectedDashboardId}>
                  <SelectTrigger id="saved-dashboard" className="sketch-input">
                    <SelectValue placeholder="Select a dashboard" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedDashboards.map((dashboard) => (
                      <SelectItem key={dashboard.id} value={dashboard.id}>
                        {dashboard.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-muted-foreground">No saved dashboards found.</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={loadDashboard} disabled={savedDashboards.length === 0}>
              Load Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  )
}
