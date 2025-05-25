"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileUpload } from "@/components/file-upload"
import { Upload, AlertCircle, ArrowLeft, RefreshCw } from "lucide-react"
import { useData } from "@/lib/data-context"

interface DataUploadPromptProps {
  title?: string
  description?: string
  showBackButton?: boolean
  onBack?: () => void
  onUploadSuccess?: () => void
  className?: string
}

export function DataUploadPrompt({
  title = "No Data Available",
  description = "Please upload a CSV or Excel file to begin your analysis.",
  showBackButton = false,
  onBack,
  onUploadSuccess,
  className = "",
}: DataUploadPromptProps) {
  const { processedData, isLoading, error, resetData } = useData()
  const [showUploader, setShowUploader] = useState(false)

  const handleUploadSuccess = () => {
    setShowUploader(false)
    if (onUploadSuccess) {
      onUploadSuccess()
    }
  }

  const handleReset = () => {
    resetData()
    setShowUploader(true)
  }

  // Don't render if data is already loaded
  if (processedData.length > 0) {
    return null
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showBackButton && onBack && (
        <Button variant="outline" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <Card className="border-dashed border-2">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!showUploader ? (
            <div className="text-center space-y-4">
              <Button onClick={() => setShowUploader(true)} size="lg" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Upload Data File
              </Button>
              <p className="text-sm text-muted-foreground">Supported formats: CSV, Excel (.xlsx, .xls)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <FileUpload onSuccess={handleUploadSuccess} />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowUploader(false)} className="flex-1">
                  Cancel
                </Button>
                <Button variant="outline" onClick={handleReset} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Processing your data...
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
