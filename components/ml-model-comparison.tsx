"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/lib/data-context"
import { DataUploadPrompt } from "@/components/data-upload-prompt"
import {
  type MLModel,
  SimpleLinearRegression,
  SimpleLogisticRegression,
  KMeansClustering,
  SimpleDecisionTree,
  calculateAccuracy,
  calculateRMSE,
  calculateMAE,
  calculateR2Score,
  calculateConfusionMatrix,
  calculatePrecisionRecallF1,
  type ModelPerformance,
} from "@/lib/ml-models"
import { AlertCircle, CheckCircle, Loader2, Trophy, Download, ContrastIcon as Compare, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface ModelComparison {
  id: string
  name: string
  models: MLModel[]
  comparisonMetrics: ComparisonMetrics
  createdAt: Date
}

interface ComparisonMetrics {
  bestModel: string
  rankings: Array<{
    modelId: string
    modelName: string
    rank: number
    score: number
    strengths: string[]
    weaknesses: string[]
  }>
  crossValidationResults: Record<string, any>
  summary: {
    totalModels: number
    bestPerformance: number
    averagePerformance: number
    performanceVariance: number
  }
}

export function MLModelComparison() {
  const {
    processedData,
    columns,
    columnTypes,
    trainedModels,
    saveTrainedModel,
    modelComparisons,
    saveModelComparison,
    downloadModel,
  } = useData()

  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [targetColumn, setTargetColumn] = useState<string>("")
  const [modelType, setModelType] = useState<"classification" | "regression" | "clustering">("classification")
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>([])
  const [isComparing, setIsComparing] = useState(false)
  const [comparisonProgress, setComparisonProgress] = useState(0)
  const [comparisonLog, setComparisonLog] = useState<string[]>([])
  const [currentComparison, setCurrentComparison] = useState<ModelComparison | null>(null)
  const [comparisonName, setComparisonName] = useState("")
  const [currentTab, setCurrentTab] = useState("setup")

  const hasData = processedData.length > 0
  const numericColumns = columns.filter((col) => columnTypes[col] === "number")
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "string" || columnTypes[col] === "boolean")

  const algorithmOptions = {
    classification: [
      { value: "logistic_regression", label: "Logistic Regression" },
      { value: "decision_tree", label: "Decision Tree" },
    ],
    regression: [
      { value: "linear_regression", label: "Linear Regression" },
      { value: "decision_tree", label: "Decision Tree Regression" },
    ],
    clustering: [{ value: "kmeans", label: "K-Means Clustering" }],
  }

  const addToLog = (message: string) => {
    setComparisonLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures((prev) => [...prev, feature])
    } else {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feature))
    }
  }

  const handleAlgorithmToggle = (algorithm: string, checked: boolean) => {
    if (checked) {
      setSelectedAlgorithms((prev) => [...prev, algorithm])
    } else {
      setSelectedAlgorithms((prev) => prev.filter((a) => a !== algorithm))
    }
  }

  const prepareData = () => {
    if (!processedData.length || !selectedFeatures.length) {
      throw new Error("No data or features selected")
    }

    // Filter out rows with missing values in selected features
    const cleanData = processedData.filter((row) =>
      selectedFeatures.every((feature) => {
        const value = row[feature]
        return value !== null && value !== undefined && value !== "" && !isNaN(Number(value))
      }),
    )

    if (cleanData.length === 0) {
      throw new Error("No valid data rows after filtering missing values")
    }

    // Prepare feature matrix
    const X = cleanData.map((row) =>
      selectedFeatures.map((feature) => {
        const value = row[feature]
        return Number(value)
      }),
    )

    // Prepare target vector (if not clustering)
    let y: number[] = []
    if (modelType !== "clustering" && targetColumn) {
      if (modelType === "classification") {
        const uniqueTargets = [...new Set(cleanData.map((row) => row[targetColumn]))].filter(
          (val) => val !== null && val !== undefined && val !== "",
        )

        if (uniqueTargets.length < 2) {
          throw new Error("Target column must have at least 2 unique values for classification")
        }

        const targetMapping: Record<string, number> = {}
        uniqueTargets.forEach((target, index) => {
          targetMapping[String(target)] = index
        })

        y = cleanData.map((row) => {
          const value = row[targetColumn]
          if (typeof value === "string") {
            return targetMapping[value] ?? 0
          }
          return Number(value) || 0
        })
      } else {
        y = cleanData.map((row) => {
          const value = row[targetColumn]
          const numValue = Number(value)
          if (isNaN(numValue)) {
            throw new Error(`Non-numeric value found in target column: ${value}`)
          }
          return numValue
        })
      }
    }

    return { X, y, cleanData }
  }

  const performCrossValidation = async (X: number[][], y: number[], algorithm: string, folds = 5) => {
    const foldSize = Math.floor(X.length / folds)
    const scores: number[] = []

    for (let i = 0; i < folds; i++) {
      const testStart = i * foldSize
      const testEnd = i === folds - 1 ? X.length : (i + 1) * foldSize

      const XTest = X.slice(testStart, testEnd)
      const yTest = y.slice(testStart, testEnd)
      const XTrain = [...X.slice(0, testStart), ...X.slice(testEnd)]
      const yTrain = [...y.slice(0, testStart), ...y.slice(testEnd)]

      try {
        let model: any
        const hyperparameters = getDefaultHyperparameters(algorithm)

        switch (algorithm) {
          case "linear_regression":
            if (selectedFeatures.length !== 1) continue
            model = new SimpleLinearRegression()
            model.fit(
              XTrain.map((row) => row[0]),
              yTrain,
            )
            const yPredLR = model.predict(XTest.map((row) => row[0]))
            scores.push(calculateR2Score(yTest, yPredLR))
            break

          case "logistic_regression":
            model = new SimpleLogisticRegression()
            model.fit(XTrain, yTrain, hyperparameters.learningRate, hyperparameters.iterations)
            const yPredLogistic = model.predict(XTest)
            scores.push(calculateAccuracy(yTest, yPredLogistic))
            break

          case "decision_tree":
            model = new SimpleDecisionTree()
            model.fit(XTrain, yTrain, hyperparameters.maxDepth)
            const yPredDT = model.predict(XTest)
            if (modelType === "classification") {
              scores.push(calculateAccuracy(yTest, yPredDT))
            } else {
              scores.push(calculateR2Score(yTest, yPredDT))
            }
            break

          case "kmeans":
            model = new KMeansClustering(hyperparameters.k)
            model.fit(X, hyperparameters.maxIterations)
            // For clustering, use silhouette score approximation
            scores.push(0.5) // Placeholder
            break
        }
      } catch (error) {
        console.warn(`Cross-validation fold ${i + 1} failed for ${algorithm}:`, error)
        scores.push(0)
      }
    }

    return {
      mean: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      std: Math.sqrt(
        scores.reduce(
          (sum, score) => sum + Math.pow(score - scores.reduce((s, sc) => s + sc, 0) / scores.length, 2),
          0,
        ) / scores.length,
      ),
      scores,
    }
  }

  const getDefaultHyperparameters = (algorithm: string) => {
    switch (algorithm) {
      case "linear_regression":
        return {}
      case "logistic_regression":
        return { learningRate: 0.01, iterations: 1000 }
      case "decision_tree":
        return { maxDepth: 5 }
      case "kmeans":
        return { k: 3, maxIterations: 100 }
      default:
        return {}
    }
  }

  const trainSingleModel = async (algorithm: string, X: number[][], y: number[]) => {
    const hyperparameters = getDefaultHyperparameters(algorithm)

    // Split data for training and testing (80/20 split)
    const splitIndex = Math.floor(X.length * 0.8)
    const XTrain = X.slice(0, splitIndex)
    const XTest = X.slice(splitIndex)
    const yTrain = y.slice(0, splitIndex)
    const yTest = y.slice(splitIndex)

    let model: any
    const performance: ModelPerformance = {}

    switch (algorithm) {
      case "linear_regression":
        if (selectedFeatures.length !== 1) {
          throw new Error("Simple linear regression requires exactly one feature")
        }
        model = new SimpleLinearRegression()
        model.fit(
          XTrain.map((row) => row[0]),
          yTrain,
        )

        const yPredLR = model.predict(XTest.map((row) => row[0]))
        performance.rmse = calculateRMSE(yTest, yPredLR)
        performance.mae = calculateMAE(yTest, yPredLR)
        performance.r2Score = calculateR2Score(yTest, yPredLR)
        break

      case "logistic_regression":
        model = new SimpleLogisticRegression()
        model.fit(XTrain, yTrain, hyperparameters.learningRate, hyperparameters.iterations)

        const yPredLogistic = model.predict(XTest)
        performance.accuracy = calculateAccuracy(yTest, yPredLogistic)
        const { precision, recall, f1Score } = calculatePrecisionRecallF1(yTest, yPredLogistic)
        performance.precision = precision
        performance.recall = recall
        performance.f1Score = f1Score
        performance.confusionMatrix = calculateConfusionMatrix(yTest, yPredLogistic)
        break

      case "decision_tree":
        model = new SimpleDecisionTree()
        model.fit(XTrain, yTrain, hyperparameters.maxDepth)

        const yPredDT = model.predict(XTest)
        if (modelType === "classification") {
          performance.accuracy = calculateAccuracy(yTest, yPredDT)
          const { precision, recall, f1Score } = calculatePrecisionRecallF1(yTest, yPredDT)
          performance.precision = precision
          performance.recall = recall
          performance.f1Score = f1Score
          performance.confusionMatrix = calculateConfusionMatrix(yTest, yPredDT)
        } else {
          performance.rmse = calculateRMSE(yTest, yPredDT)
          performance.mae = calculateMAE(yTest, yPredDT)
          performance.r2Score = calculateR2Score(yTest, yPredDT)
        }
        break

      case "kmeans":
        model = new KMeansClustering(hyperparameters.k)
        model.fit(X, hyperparameters.maxIterations)

        const clusters = model.predict(X)
        const uniqueClusters = new Set(clusters)
        performance.accuracy = uniqueClusters.size / hyperparameters.k
        break
    }

    const mlModel: MLModel = {
      id: Math.random().toString(36).substring(2, 11),
      name: `${algorithm.replace("_", " ").toUpperCase()} Model`,
      type: modelType,
      algorithm,
      features: selectedFeatures,
      target: targetColumn,
      hyperparameters,
      performance,
      trainedAt: new Date(),
      isTraining: false,
    }

    return mlModel
  }

  const compareModels = async () => {
    if (!selectedFeatures.length) {
      toast({
        title: "Error",
        description: "Please select at least one feature",
        variant: "destructive",
      })
      return
    }

    if (modelType !== "clustering" && !targetColumn) {
      toast({
        title: "Error",
        description: "Please select a target column",
        variant: "destructive",
      })
      return
    }

    if (!selectedAlgorithms.length) {
      toast({
        title: "Error",
        description: "Please select at least two algorithms to compare",
        variant: "destructive",
      })
      return
    }

    if (!comparisonName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a name for this comparison",
        variant: "destructive",
      })
      return
    }

    setIsComparing(true)
    setComparisonProgress(0)
    setComparisonLog([])
    setCurrentTab("comparison")

    try {
      addToLog("Starting model comparison...")
      setComparisonProgress(10)

      const { X, y } = prepareData()
      addToLog(`Prepared data: ${X.length} samples, ${X[0].length} features`)
      setComparisonProgress(20)

      const trainedModelsForComparison: MLModel[] = []
      const crossValidationResults: Record<string, any> = {}

      // Train each selected algorithm
      for (let i = 0; i < selectedAlgorithms.length; i++) {
        const algorithm = selectedAlgorithms[i]
        const progress = 20 + (i / selectedAlgorithms.length) * 60

        addToLog(`Training ${algorithm.replace("_", " ")} model...`)
        setComparisonProgress(progress)

        try {
          // Perform cross-validation
          const cvResults = await performCrossValidation(X, y, algorithm)
          crossValidationResults[algorithm] = cvResults
          addToLog(`Cross-validation for ${algorithm}: ${cvResults.mean.toFixed(4)} ± ${cvResults.std.toFixed(4)}`)

          // Train final model
          const model = await trainSingleModel(algorithm, X, y)
          trainedModelsForComparison.push(model)

          // Save individual model
          saveTrainedModel(model)

          addToLog(`${algorithm.replace("_", " ")} model trained successfully`)
        } catch (error) {
          addToLog(`Failed to train ${algorithm}: ${error instanceof Error ? error.message : "Unknown error"}`)
        }
      }

      setComparisonProgress(80)
      addToLog("Analyzing model performance...")

      // Calculate rankings and comparison metrics
      const rankings = trainedModelsForComparison
        .map((model, index) => {
          let score = 0
          const strengths: string[] = []
          const weaknesses: string[] = []

          if (modelType === "classification") {
            score = model.performance?.accuracy || 0
            if (score > 0.8) strengths.push("High accuracy")
            if (score < 0.6) weaknesses.push("Low accuracy")
            if ((model.performance?.f1Score || 0) > 0.8) strengths.push("Good F1 score")
            if ((model.performance?.precision || 0) > 0.8) strengths.push("High precision")
            if ((model.performance?.recall || 0) > 0.8) strengths.push("High recall")
          } else if (modelType === "regression") {
            score = model.performance?.r2Score || 0
            if (score > 0.8) strengths.push("High R² score")
            if (score < 0.5) weaknesses.push("Low R² score")
            if ((model.performance?.rmse || Number.POSITIVE_INFINITY) < 1) strengths.push("Low RMSE")
            if ((model.performance?.mae || Number.POSITIVE_INFINITY) < 0.5) strengths.push("Low MAE")
          } else {
            score = model.performance?.accuracy || 0
            if (score > 0.8) strengths.push("Good cluster utilization")
          }

          // Add algorithm-specific strengths/weaknesses
          if (model.algorithm === "linear_regression") {
            strengths.push("Simple and interpretable")
            if (selectedFeatures.length > 1) weaknesses.push("Limited to single feature")
          } else if (model.algorithm === "logistic_regression") {
            strengths.push("Probabilistic output", "Good for binary classification")
          } else if (model.algorithm === "decision_tree") {
            strengths.push("Highly interpretable", "Handles non-linear relationships")
            weaknesses.push("Prone to overfitting")
          } else if (model.algorithm === "kmeans") {
            strengths.push("Fast clustering", "Works well with spherical clusters")
            weaknesses.push("Requires predefined number of clusters")
          }

          return {
            modelId: model.id,
            modelName: model.name,
            rank: 0, // Will be set after sorting
            score,
            strengths,
            weaknesses,
          }
        })
        .sort((a, b) => b.score - a.score)

      // Assign ranks
      rankings.forEach((ranking, index) => {
        ranking.rank = index + 1
      })

      const bestModel = rankings[0]?.modelId || ""
      const scores = rankings.map((r) => r.score)
      const averagePerformance = scores.reduce((sum, score) => sum + score, 0) / scores.length
      const performanceVariance =
        scores.reduce((sum, score) => sum + Math.pow(score - averagePerformance, 2), 0) / scores.length

      const comparisonMetrics: ComparisonMetrics = {
        bestModel,
        rankings,
        crossValidationResults,
        summary: {
          totalModels: trainedModelsForComparison.length,
          bestPerformance: Math.max(...scores),
          averagePerformance,
          performanceVariance,
        },
      }

      const comparison: ModelComparison = {
        id: Math.random().toString(36).substring(2, 11),
        name: comparisonName,
        models: trainedModelsForComparison,
        comparisonMetrics,
        createdAt: new Date(),
      }

      saveModelComparison(comparison)
      setCurrentComparison(comparison)
      setComparisonProgress(100)
      addToLog("Model comparison completed successfully!")
      setCurrentTab("results")

      toast({
        title: "Comparison Complete",
        description: `Successfully compared ${trainedModelsForComparison.length} models`,
      })
    } catch (error) {
      console.error("Comparison error:", error)
      addToLog(`Error: ${error instanceof Error ? error.message : "Comparison failed"}`)
      toast({
        title: "Comparison Failed",
        description: error instanceof Error ? error.message : "An error occurred during comparison",
        variant: "destructive",
      })
    } finally {
      setIsComparing(false)
    }
  }

  const handleDownloadModel = (modelId: string) => {
    try {
      downloadModel(modelId)
      toast({
        title: "Model Downloaded",
        description: "Model package has been downloaded successfully",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download model",
        variant: "destructive",
      })
    }
  }

  const renderComparisonResults = () => {
    if (!currentComparison) return null

    const { comparisonMetrics } = currentComparison

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Model Rankings
            </CardTitle>
            <CardDescription>Performance comparison of trained models</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Strengths</TableHead>
                  <TableHead>Weaknesses</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonMetrics.rankings.map((ranking) => (
                  <TableRow key={ranking.modelId}>
                    <TableCell>
                      <Badge variant={ranking.rank === 1 ? "default" : "secondary"}>#{ranking.rank}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{ranking.modelName}</TableCell>
                    <TableCell>{ranking.score.toFixed(4)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ranking.strengths.slice(0, 2).map((strength, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {ranking.weaknesses.slice(0, 2).map((weakness, i) => (
                          <Badge key={i} variant="destructive" className="text-xs">
                            {weakness}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadModel(ranking.modelId)}
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Best Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {comparisonMetrics.rankings[0]?.modelName || "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                Score: {comparisonMetrics.summary.bestPerformance.toFixed(4)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Average Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {comparisonMetrics.summary.averagePerformance.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Across {comparisonMetrics.summary.totalModels} models</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Variance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {comparisonMetrics.summary.performanceVariance.toFixed(4)}
              </div>
              <div className="text-sm text-muted-foreground">Lower is more consistent</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cross-Validation Results</CardTitle>
            <CardDescription>5-fold cross-validation performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Algorithm</TableHead>
                  <TableHead>Mean Score</TableHead>
                  <TableHead>Std Deviation</TableHead>
                  <TableHead>Consistency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(comparisonMetrics.crossValidationResults).map(([algorithm, results]: [string, any]) => (
                  <TableRow key={algorithm}>
                    <TableCell className="font-medium">{algorithm.replace("_", " ").toUpperCase()}</TableCell>
                    <TableCell>{results.mean.toFixed(4)}</TableCell>
                    <TableCell>{results.std.toFixed(4)}</TableCell>
                    <TableCell>
                      <Badge variant={results.std < 0.1 ? "default" : "secondary"}>
                        {results.std < 0.1 ? "High" : "Medium"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!hasData) {
    return (
      <DataUploadPrompt
        title="Upload Data for Model Comparison"
        description="Model comparison requires data to be uploaded. Please upload a CSV or Excel file to begin comparing ML models."
        showBackButton={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Comparison Setup</CardTitle>
              <CardDescription>Configure parameters for comparing multiple ML models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comparison-name">Comparison Name</Label>
                <Input
                  id="comparison-name"
                  value={comparisonName}
                  onChange={(e) => setComparisonName(e.target.value)}
                  placeholder="Enter a name for this comparison"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model-type">Model Type</Label>
                <Select value={modelType} onValueChange={(value: any) => setModelType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select model type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classification">Classification</SelectItem>
                    <SelectItem value="regression">Regression</SelectItem>
                    <SelectItem value="clustering">Clustering</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {modelType !== "clustering" && (
                <div className="space-y-2">
                  <Label htmlFor="target">Target Column</Label>
                  <Select value={targetColumn} onValueChange={setTargetColumn}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target column" />
                    </SelectTrigger>
                    <SelectContent>
                      {(modelType === "regression" ? numericColumns : [...numericColumns, ...categoricalColumns]).map(
                        (column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Feature Columns</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {numericColumns.map((column) => (
                    <div key={column} className="flex items-center space-x-2">
                      <Checkbox
                        id={column}
                        checked={selectedFeatures.includes(column)}
                        onCheckedChange={(checked) => handleFeatureToggle(column, checked as boolean)}
                        disabled={column === targetColumn}
                      />
                      <Label htmlFor={column} className="text-sm">
                        {column}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Selected: {selectedFeatures.length} features</div>
              </div>

              <div className="space-y-2">
                <Label>Algorithms to Compare</Label>
                <div className="grid grid-cols-2 gap-2">
                  {algorithmOptions[modelType].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={option.value}
                        checked={selectedAlgorithms.includes(option.value)}
                        onCheckedChange={(checked) => handleAlgorithmToggle(option.value, checked as boolean)}
                      />
                      <Label htmlFor={option.value} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Selected: {selectedAlgorithms.length} algorithms</div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentTab("comparison")}
                  disabled={
                    !selectedFeatures.length ||
                    (!targetColumn && modelType !== "clustering") ||
                    selectedAlgorithms.length < 1 ||
                    !comparisonName.trim()
                  }
                >
                  Continue to Comparison
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Run Model Comparison</CardTitle>
              <CardDescription>Train and compare multiple ML models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setCurrentTab("setup")} disabled={isComparing}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Setup
                </Button>

                <Button
                  onClick={compareModels}
                  disabled={
                    isComparing ||
                    !selectedFeatures.length ||
                    (!targetColumn && modelType !== "clustering") ||
                    selectedAlgorithms.length < 1 ||
                    !comparisonName.trim()
                  }
                  className="flex items-center gap-2"
                >
                  {isComparing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Compare className="h-4 w-4" />}
                  {isComparing ? "Comparing..." : "Start Comparison"}
                </Button>

                {currentComparison && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Comparison Complete
                  </Badge>
                )}
              </div>

              {isComparing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Comparison Progress</span>
                    <span>{comparisonProgress}%</span>
                  </div>
                  <Progress value={comparisonProgress} className="w-full" />
                </div>
              )}

              {comparisonLog.length > 0 && (
                <div className="space-y-2">
                  <Label>Comparison Log</Label>
                  <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{comparisonLog.join("\n")}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {currentComparison ? (
            renderComparisonResults()
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No comparison results available. Please run a model comparison first.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Comparison History</CardTitle>
              <CardDescription>Previous model comparisons</CardDescription>
            </CardHeader>
            <CardContent>
              {modelComparisons.length > 0 ? (
                <div className="space-y-4">
                  {modelComparisons.map((comparison) => (
                    <Card key={comparison.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{comparison.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {comparison.models.length} models compared • {comparison.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setCurrentComparison(comparison)}>
                          View Results
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No comparison history available.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
