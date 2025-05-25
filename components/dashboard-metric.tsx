"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useData } from "@/lib/data-context"
import { Button } from "@/components/ui/button"
import { Settings, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DashboardMetricProps {
  config: {
    column: string
    aggregation: string
    format: string
    prefix: string
    suffix: string
  }
}

export function DashboardMetric({ config }: DashboardMetricProps) {
  const { processedData, columns, columnTypes } = useData()
  const [column, setColumn] = useState(config.column || "")
  const [aggregation, setAggregation] = useState(config.aggregation || "mean")
  const [format, setFormat] = useState(config.format || "number")
  const [prefix, setPrefix] = useState(config.prefix || "")
  const [suffix, setSuffix] = useState(config.suffix || "")
  const [showSettings, setShowSettings] = useState(false)

  // Get numeric columns
  const numericColumns = columns.filter((col) => columnTypes[col] === "number")

  // Set default column when columns change
  useEffect(() => {
    if (numericColumns.length > 0 && !column) {
      setColumn(numericColumns[0])
    }
  }, [numericColumns, column])

  // Calculate metric value
  const calculateMetric = () => {
    try {
      if (!column || processedData.length === 0) return "N/A"

      const values = processedData.map((row) => Number(row[column])).filter((val) => !isNaN(val) && isFinite(val))

      if (values.length === 0) return "N/A"

      let result: number

      switch (aggregation) {
        case "mean":
          result = values.reduce((sum, val) => sum + val, 0) / values.length
          break
        case "sum":
          result = values.reduce((sum, val) => sum + val, 0)
          break
        case "min":
          result = Math.min(...values)
          break
        case "max":
          result = Math.max(...values)
          break
        case "count":
          result = values.length
          break
        default:
          result = values.reduce((sum, val) => sum + val, 0) / values.length
      }

      if (!isFinite(result)) return "N/A"

      // Format the result
      if (format === "currency") {
        return formatCurrency(result)
      } else if (format === "percent") {
        return formatPercent(result)
      } else {
        return formatNumber(result)
      }
    } catch (error) {
      console.error("Error calculating metric:", error)
      return "Error"
    }
  }

  // Format as currency
  const formatCurrency = (value: number) => {
    if (!isFinite(value)) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format as percent
  const formatPercent = (value: number) => {
    if (!isFinite(value)) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value / 100)
  }

  // Format as number
  const formatNumber = (value: number) => {
    if (!isFinite(value)) return "N/A"
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Calculate trend (for demo purposes)
  const calculateTrend = () => {
    // This would normally compare to previous period
    // For demo, we'll just use a random value
    const random = Math.random()
    if (random > 0.6) return "up"
    if (random < 0.4) return "down"
    return "neutral"
  }

  const trend = calculateTrend()
  const metricValue = calculateMetric()

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="sketch-button">
              <Settings className="h-4 w-4 mr-2" />
              Metric Settings
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Data Column</Label>
                <Select value={column} onValueChange={setColumn}>
                  <SelectTrigger className="sketch-input">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aggregation</Label>
                <Select value={aggregation} onValueChange={setAggregation}>
                  <SelectTrigger className="sketch-input">
                    <SelectValue placeholder="Select aggregation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mean">Average</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger className="sketch-input">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                    <SelectItem value="percent">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prefix</Label>
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    placeholder="$"
                    className="sketch-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Suffix</Label>
                  <Input
                    value={suffix}
                    onChange={(e) => setSuffix(e.target.value)}
                    placeholder="%"
                    className="sketch-input"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="sketch-card">
        <CardContent className="p-6 flex flex-col items-center justify-center">
          <div className="text-sm font-medium text-muted-foreground mb-2">{column}</div>
          <div className="text-4xl font-bold mb-2">
            {prefix}
            {metricValue}
            {suffix}
          </div>
          <div className="flex items-center text-sm">
            {trend === "up" && (
              <>
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500">Trending Up</span>
              </>
            )}
            {trend === "down" && (
              <>
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500">Trending Down</span>
              </>
            )}
            {trend === "neutral" && (
              <>
                <Minus className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="text-yellow-500">No Change</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
