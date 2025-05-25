"use client"

import type React from "react"
import { useMemo } from "react"
import { useData } from "@/lib/data-context"
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb"
import { DataUploadPrompt } from "@/components/data-upload-prompt"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileSpreadsheet, Users, CheckCircle, AlertTriangle } from "lucide-react"

interface SmartLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  requiresData?: boolean
  breadcrumbItems?: Array<{ label: string; href?: string; current?: boolean }>
  showDataInfo?: boolean
  className?: string
}

export function SmartLayout({
  children,
  title,
  description,
  requiresData = true,
  breadcrumbItems,
  showDataInfo = true,
  className = "",
}: SmartLayoutProps) {
  const { processedData, fileName, isLoading, error, columns } = useData()

  const hasData = processedData.length > 0
  const shouldShowPrompt = useMemo(() => {
    return requiresData && !hasData && !isLoading
  }, [requiresData, hasData, isLoading])

  const renderDataInfo = () => {
    if (!showDataInfo || !hasData) return null

    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="font-medium">{fileName}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{processedData.length.toLocaleString()} rows</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{columns.length} columns</span>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Data Loaded
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderError = () => {
    if (!error) return null

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  const renderLoading = () => {
    if (!isLoading) return null

    return (
      <Alert className="mb-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <AlertDescription>Processing your data...</AlertDescription>
      </Alert>
    )
  }

  const renderContent = () => {
    if (shouldShowPrompt) {
      return (
        <DataUploadPrompt
          title="Upload Data to Continue"
          description={`${title} requires data to be uploaded. Please upload a CSV or Excel file to proceed.`}
          showBackButton={true}
        />
      )
    }

    return children
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <NavigationBreadcrumb items={breadcrumbItems} />

        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>

        {renderError()}
        {renderLoading()}
        {renderDataInfo()}
      </div>

      <div className="min-h-[400px]">{renderContent()}</div>
    </div>
  )
}
