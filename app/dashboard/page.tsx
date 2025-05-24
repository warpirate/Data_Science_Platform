"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/file-upload"
import { DataTable } from "@/components/data-table"
import { DataExplorer } from "@/components/data-explorer"
import { DataVisualizer } from "@/components/data-visualizer"
import { DataPreprocessor } from "@/components/data-preprocessor"
import { DataProfiler } from "@/components/data-profiler"
import { useData } from "@/lib/data-context"
import { Download, RefreshCw, Database, BarChart3, Settings, Search, FileText } from "lucide-react"

export default function DashboardPage() {
  const { processedData, fileName, isLoading, exportData, resetData } = useData()
  const [activeTab, setActiveTab] = useState("data")

  const handleExport = (format: "csv" | "xlsx") => {
    exportData(format)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            Upload, explore, and analyze your data with powerful tools and visualizations
          </p>
        </div>
        {processedData.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {processedData.length.toLocaleString()} rows
            </Badge>
            <Button variant="outline" onClick={() => handleExport("csv")} className="sketch-button">
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("xlsx")} className="sketch-button">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={resetData} className="sketch-button">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        )}
      </div>

      {processedData.length === 0 ? (
        <Card className="sketch-card">
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Upload a CSV or Excel file to begin your data analysis journey</CardDescription>
          </CardHeader>
          <CardContent>
            <FileUpload />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card className="sketch-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {fileName || "Dataset"}
              </CardTitle>
              <CardDescription>
                {processedData.length.toLocaleString()} rows loaded and ready for analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sketch-tabs">
            <TabsList className="grid w-full grid-cols-6 p-1 gap-1">
              <TabsTrigger value="data" className="sketch-tab">
                <Database className="h-4 w-4 mr-1" />
                Data
              </TabsTrigger>
              <TabsTrigger value="profile" className="sketch-tab">
                <FileText className="h-4 w-4 mr-1" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="explore" className="sketch-tab">
                <Search className="h-4 w-4 mr-1" />
                Explore
              </TabsTrigger>
              <TabsTrigger value="visualize" className="sketch-tab">
                <BarChart3 className="h-4 w-4 mr-1" />
                Visualize
              </TabsTrigger>
              <TabsTrigger value="preprocess" className="sketch-tab">
                <Settings className="h-4 w-4 mr-1" />
                Preprocess
              </TabsTrigger>
              <TabsTrigger value="upload" className="sketch-tab">
                <Download className="h-4 w-4 mr-1" />
                Upload New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="data" className="space-y-4">
              <DataTable />
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <DataProfiler />
            </TabsContent>

            <TabsContent value="explore" className="space-y-4">
              <DataExplorer />
            </TabsContent>

            <TabsContent value="visualize" className="space-y-4">
              <DataVisualizer />
            </TabsContent>

            <TabsContent value="preprocess" className="space-y-4">
              <DataPreprocessor />
            </TabsContent>

            <TabsContent value="upload" className="space-y-4">
              <Card className="sketch-card">
                <CardHeader>
                  <CardTitle>Upload New Dataset</CardTitle>
                  <CardDescription>Replace the current dataset with a new file</CardDescription>
                </CardHeader>
                <CardContent>
                  <FileUpload />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="sketch-card">
            <CardContent className="flex items-center gap-4 p-6">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <div>
                <p className="font-medium">Processing your data...</p>
                <p className="text-sm text-muted-foreground">This may take a moment for large files</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
