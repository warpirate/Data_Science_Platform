"use client"

import Link from "next/link"
import { BookOpen, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DocsPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentation</h1>
          <p className="text-muted-foreground">Learn how to use the Data Analysis Platform</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Learn the basics of using the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Link href="#upload" className="text-primary hover:underline">
                  Uploading Data
                </Link>
              </li>
              <li>
                <Link href="#notebook" className="text-primary hover:underline">
                  Using the Notebook
                </Link>
              </li>
              <li>
                <Link href="#dashboard" className="text-primary hover:underline">
                  Creating Dashboards
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Analysis</CardTitle>
            <CardDescription>Learn about data analysis features</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Link href="#preprocessing" className="text-primary hover:underline">
                  Data Preprocessing
                </Link>
              </li>
              <li>
                <Link href="#visualization" className="text-primary hover:underline">
                  Data Visualization
                </Link>
              </li>
              <li>
                <Link href="#exploration" className="text-primary hover:underline">
                  Data Exploration
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Features</CardTitle>
            <CardDescription>Explore advanced platform capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>
                <Link href="#code" className="text-primary hover:underline">
                  Custom Code Execution
                </Link>
              </li>
              <li>
                <Link href="#export" className="text-primary hover:underline">
                  Exporting Results
                </Link>
              </li>
              <li>
                <Link href="#api" className="text-primary hover:underline">
                  API Reference
                </Link>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-12">
        <section id="upload" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Uploading Data</h2>
          <p className="text-muted-foreground mb-4">
            The platform supports uploading CSV and Excel files. Simply drag and drop your file or click the upload area to
            select a file from your computer.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Supported File Formats</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>CSV (.csv)</li>
              <li>Excel (.xlsx, .xls)</li>
            </ul>
          </div>
        </section>

        <section id="notebook" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Using the Notebook</h2>
          <p className="text-muted-foreground mb-4">
            The notebook interface allows you to create a sequence of cells for different types of analysis. Each cell can
            contain data tables, visualizations, code, or text notes.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Cell Types</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Data Table - Display and filter your data</li>
              <li>Visualization - Create charts and graphs</li>
              <li>Code - Write and execute custom code</li>
              <li>Text - Add notes and documentation</li>
            </ul>
          </div>
        </section>

        <section id="dashboard" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Creating Dashboards</h2>
          <p className="text-muted-foreground mb-4">
            Build interactive dashboards by combining different widgets. Arrange and customize widgets to create the perfect
            view of your data.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Widget Types</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Charts - Various chart types for data visualization</li>
              <li>Tables - Interactive data tables with filtering</li>
              <li>Metrics - Key performance indicators</li>
              <li>Filters - Interactive data filters</li>
            </ul>
          </div>
        </section>

        <section id="preprocessing" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Data Preprocessing</h2>
          <p className="text-muted-foreground mb-4">
            Clean and prepare your data for analysis using our preprocessing tools. Handle missing values, outliers, and
            transform your data.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Preprocessing Features</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Missing Value Handling</li>
              <li>Outlier Detection and Treatment</li>
              <li>Data Normalization</li>
              <li>Feature Engineering</li>
            </ul>
          </div>
        </section>

        <section id="visualization" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Data Visualization</h2>
          <p className="text-muted-foreground mb-4">
            Create insightful visualizations using our chart library. Customize colors, layouts, and interactive features.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Chart Types</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Bar Charts and Line Charts</li>
              <li>Scatter Plots and Pie Charts</li>
              <li>Box Plots and Histograms</li>
              <li>Custom Visualizations</li>
            </ul>
          </div>
        </section>

        <section id="exploration" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Data Exploration</h2>
          <p className="text-muted-foreground mb-4">
            Explore your data using interactive tools. Generate statistics, find patterns, and understand relationships in
            your data.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Exploration Tools</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Summary Statistics</li>
              <li>Correlation Analysis</li>
              <li>Distribution Analysis</li>
              <li>Pattern Detection</li>
            </ul>
          </div>
        </section>

        <section id="code" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Custom Code Execution</h2>
          <p className="text-muted-foreground mb-4">
            Write and execute custom code for advanced analysis. Access your data through our API and use built-in
            functions.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Available Functions</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Data Filtering and Mapping</li>
              <li>Aggregation Functions</li>
              <li>Statistical Analysis</li>
              <li>Custom Transformations</li>
            </ul>
          </div>
        </section>

        <section id="export" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">Exporting Results</h2>
          <p className="text-muted-foreground mb-4">
            Export your analysis results in various formats. Save processed data, charts, and complete notebooks.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Export Options</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>CSV and Excel Export</li>
              <li>Chart Images</li>
              <li>PDF Reports</li>
              <li>Notebook Sharing</li>
            </ul>
          </div>
        </section>

        <section id="api" className="scroll-mt-16">
          <h2 className="text-2xl font-bold mb-4">API Reference</h2>
          <p className="text-muted-foreground mb-4">
            Reference documentation for the platform's API. Learn about available functions and data structures.
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">API Categories</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Data Manipulation</li>
              <li>Statistical Functions</li>
              <li>Visualization API</li>
              <li>Export Functions</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}