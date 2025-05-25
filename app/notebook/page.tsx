"use client"

import { useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { useData } from "@/lib/data-context"
import { DataTable } from "@/components/data-table"
import { DataPreprocessor } from "@/components/data-preprocessor"
import { DataProfiler } from "@/components/data-profiler"
import { TextEditor } from "@/components/text-editor"
import { CodeEditor } from "@/components/code-editor"
import { MLModelTrainer } from "@/components/ml-model-trainer"
import { MLPredictor } from "@/components/ml-predictor"
import { MLModelComparison } from "@/components/ml-model-comparison"
import { SmartLayout } from "@/components/smart-layout"
import { DataUploadPrompt } from "@/components/data-upload-prompt"
import { Button } from "@/components/ui/button"
import { Download, Plus, ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

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
  const hasData = processedData.length > 0

  const handleExport = (format: "csv" | "xlsx") => {
    exportData(format)
    toast({
      title: "Export successful",
      description: `Your data has been exported as ${format.toUpperCase()}.`,
    })
  }

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Notebook", current: true },
  ]

  const renderCellContent = (type: string) => {
    switch (type) {
      case "data":
        return <DataTable />
      case "profile":
        return <DataProfiler />
      case "preprocessing":
        return <DataPreprocessor />
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} />

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
              <div className="flex items-center justify-end space-x-2">
                {hasData && (
                  <>
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 gap-1">
                          <Plus className="h-3.5 w-3.5" />
                          <span>Add Cell</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => addCell("data")}>Data Table</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("profile")}>Data Profile</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("preprocessing")}>Preprocessing</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("text")}>Text Note</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("code")}>Code</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("ml-trainer")}>ML Model Trainer</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("ml-predictor")}>ML Predictor</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => addCell("ml-insights")}>ML Comparison</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>

              <div className="space-y-6">
                {notebookCells.map((cell, index) => (
                  <div key={cell.id} className="notebook-cell fade-in">
                    <div className="notebook-cell-header">
                      <h3 className="text-sm font-medium">{cell.title}</h3>
                    </div>
                    <div className="notebook-cell-content">{renderCellContent(cell.type)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <DataUploadPrompt
              title="Upload Data to Get Started"
              description="Upload a CSV or Excel file to begin analyzing your data in the notebook."
            />
          )}
        </SmartLayout>
      </main>

      <Toaster />
    </div>
  )
}