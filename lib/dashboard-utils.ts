// Helper functions for dashboard operations

// Format a number with specified options
export function formatNumber(
  value: number,
  options: {
    format?: "number" | "currency" | "percent"
    decimals?: number
    currency?: string
    compact?: boolean
  } = {},
): string {
  const { format = "number", decimals = 2, currency = "USD", compact = false } = options

  const formatOptions: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }

  if (compact) {
    formatOptions.notation = "compact"
  }

  if (format === "currency") {
    formatOptions.style = "currency"
    formatOptions.currency = currency
  } else if (format === "percent") {
    formatOptions.style = "percent"
    // For percentages, divide by 100 if the value is greater than 1
    value = value > 1 ? value / 100 : value
  }

  return new Intl.NumberFormat("en-US", formatOptions).format(value)
}

// Calculate aggregation on an array of numbers
export function calculateAggregation(
  values: number[],
  aggregation: "sum" | "mean" | "median" | "min" | "max" | "count",
): number {
  if (!values.length) return 0

  switch (aggregation) {
    case "sum":
      return values.reduce((sum, val) => sum + val, 0)
    case "mean":
      return values.reduce((sum, val) => sum + val, 0) / values.length
    case "median": {
      const sorted = [...values].sort((a, b) => a - b)
      const mid = Math.floor(sorted.length / 2)
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
    }
    case "min":
      return Math.min(...values)
    case "max":
      return Math.max(...values)
    case "count":
      return values.length
    default:
      return values.reduce((sum, val) => sum + val, 0) / values.length
  }
}

// Generate a color based on a string (for consistent colors in charts)
export function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }

  let color = "#"
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    color += ("00" + value.toString(16)).substr(-2)
  }

  return color
}

// Get a readable text color (black or white) based on background color
export function getContrastColor(hexColor: string): string {
  // Convert hex to RGB
  const r = Number.parseInt(hexColor.slice(1, 3), 16)
  const g = Number.parseInt(hexColor.slice(3, 5), 16)
  const b = Number.parseInt(hexColor.slice(5, 7), 16)

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? "#000000" : "#FFFFFF"
}

// Filter data based on filter conditions
export function filterData(
  data: Record<string, any>[],
  filters: Array<{ column: string; operator: string; value: string }>,
): Record<string, any>[] {
  if (!filters.length) return data

  return data.filter((row) => {
    return filters.every((filter) => {
      const { column, operator, value } = filter
      if (!column || value === undefined || value === null) return true

      const cellValue = row[column]
      if (cellValue === undefined || cellValue === null) return false

      switch (operator) {
        case "equal":
          return String(cellValue) === value
        case "notEqual":
          return String(cellValue) !== value
        case "greater":
          return Number(cellValue) > Number(value)
        case "less":
          return Number(cellValue) < Number(value)
        case "contains":
          return String(cellValue).toLowerCase().includes(value.toLowerCase())
        default:
          return true
      }
    })
  })
}
