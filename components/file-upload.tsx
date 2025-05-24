"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Upload, FileSpreadsheet, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useData } from "@/lib/data-context"

interface FileUploadProps {
  className?: string
  onSuccess?: () => void
}

export function FileUpload({ className, onSuccess }: FileUploadProps) {
  const router = useRouter()
  const { processFile, error: contextError, isLoading } = useData()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null)

    if (acceptedFiles.length === 0) {
      return
    }

    const selectedFile = acceptedFiles[0]
    const fileExtension = selectedFile.name.split(".").pop()?.toLowerCase()

    if (!fileExtension || !["csv", "xlsx", "xls"].includes(fileExtension)) {
      setError("Please upload a CSV or Excel file")
      return
    }

    setFile(selectedFile)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
    },
    maxFiles: 1,
  })

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simulate upload progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(interval)
          return 90
        }
        return prevProgress + 10
      })
    }, 200)

    try {
      await processFile(file)
      setProgress(100)
      setTimeout(() => {
        setUploading(false)
        if (onSuccess) {
          onSuccess()
        } else {
          router.push("/notebook")
        }
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file")
      setUploading(false)
      clearInterval(interval)
    }
  }

  const removeFile = () => {
    setFile(null)
    setProgress(0)
    setError(null)
  }

  return (
    <div className={className}>
      {(error || contextError) && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error || contextError}</AlertDescription>
        </Alert>
      )}

      <Card className="app-card">
        <CardContent className="p-6">
          {!file ? (
            <div
              {...getRootProps()}
              className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              role="button"
              tabIndex={0}
              aria-label="Upload file area. Click or drag and drop a file here."
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="rounded-full bg-primary/10 p-3">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Drag & drop your file</h3>
                <p className="text-sm text-muted-foreground">Supports CSV and Excel files</p>
                <Button variant="outline" className="mt-2">
                  Browse Files
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileSpreadsheet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={removeFile}
                  disabled={uploading}
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{progress}% processed</p>
                </div>
              )}

              <Button className="w-full" onClick={handleUpload} disabled={uploading || isLoading}>
                {uploading || isLoading ? "Processing..." : "Upload & Analyze"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
