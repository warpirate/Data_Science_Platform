"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { useData } from "@/lib/data-context"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"

export function DataTable() {
  const { processedData, columns, columnTypes } = useData()
  const [searchTerm, setSearchTerm] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const rowsPerPage = 10

  // Update visible columns when columns change
  if (columns.length > 0 && visibleColumns.length === 0) {
    setVisibleColumns(columns)
  }

  // Filter data based on search term
  const filteredData = processedData.filter((row) =>
    Object.entries(row).some(
      ([key, value]) => visibleColumns.includes(key) && String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  // Sort data if sort column is set
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn]
        const bValue = b[sortColumn]

        // Handle different data types
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue
        }

        // Default string comparison
        const aString = String(aValue || "").toLowerCase()
        const bString = String(bValue || "").toLowerCase()
        return sortDirection === "asc" ? aString.localeCompare(bString) : bString.localeCompare(aString)
      })
    : filteredData

  const totalPages = Math.ceil(sortedData.length / rowsPerPage)
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)

  const toggleColumn = (column: string) => {
    setVisibleColumns((prev) => (prev.includes(column) ? prev.filter((col) => col !== column) : [...prev, column]))
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // New column, default to ascending
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search data..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search data"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column}
                  checked={visibleColumns.includes(column)}
                  onCheckedChange={() => toggleColumn(column)}
                >
                  <div className="flex items-center">
                    <span>{column}</span>
                    {columnTypes[column] && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        {columnTypes[column]}
                      </Badge>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto data-grid">
        <Table>
          <TableHeader className="data-grid-header">
            <TableRow>
              {columns.map(
                (column) =>
                  visibleColumns.includes(column) && (
                    <TableHead key={column} className="font-medium whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 -ml-3 h-8 font-medium"
                        onClick={() => handleSort(column)}
                      >
                        {column}
                        {sortColumn === column && (
                          <ArrowUpDown
                            className={`h-4 w-4 ${sortDirection === "asc" ? "rotate-0" : "rotate-180"} transition-transform`}
                          />
                        )}
                      </Button>
                    </TableHead>
                  ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map(
                    (column) =>
                      visibleColumns.includes(column) && (
                        <TableCell key={column} className="max-w-[200px] truncate">
                          {row[column] !== null && row[column] !== undefined ? String(row[column]) : ""}
                        </TableCell>
                      ),
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={visibleColumns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={currentPage === 1}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum = i + 1

              // Adjust page numbers for large datasets
              if (totalPages > 5) {
                if (currentPage > 3 && currentPage < totalPages - 1) {
                  pageNum = currentPage - 2 + i
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 4 + i
                }
              }

              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={currentPage === pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              )
            })}

            <PaginationItem>
              <PaginationNext
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                aria-disabled={currentPage === totalPages}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <div className="text-xs text-muted-foreground">
        Showing {paginatedData.length} of {sortedData.length} rows
        {sortedData.length !== processedData.length && ` (filtered from ${processedData.length} total rows)`}
      </div>
    </div>
  )
}
