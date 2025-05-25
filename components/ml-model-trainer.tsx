"use client"

import { useState, useEffect } from "react"
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
import { Play, BarChart3, AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function MLModelTrainer() {
  const { processedData, columns, columnTypes, saveTrainedModel } = useData()
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [targetColumn, setTargetColumn] = useState<string>("")
  const [modelType, setModelType] = useState<"classification" | "regression" | "clustering">("classification")
  const [algorithm, setAlgorithm] = useState<string>("")
  const [hyperparameters, setHyperparameters] = useState<Record<string, any>>({})
  const [isTraining, setIsTraining] = useState(false)
  const [trainedModel, setTrainedModel] = useState<MLModel | null>(null)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [trainingLog, setTrainingLog] = useState<string[]>([])
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

  useEffect(() => {
    // Reset algorithm when model type changes
    setAlgorithm("")
    setHyperparameters({})
    setSelectedFeatures([])
    setTargetColumn("")
  }, [modelType])

  useEffect(() => {
    // Set default hyperparameters based on algorithm
    const defaults: Record<string, any> = {}

    switch (algorithm) {
      case "linear_regression":
        // No hyperparameters for simple linear regression
        break
      case "logistic_regression":
        defaults.learningRate = 0.01
        defaults.iterations = 1000
        break
      case "decision_tree":
        defaults.maxDepth = 5
        break
      case "kmeans":
        defaults.k = 3
        defaults.maxIterations = 100
        break
    }

    setHyperparameters(defaults)
  }, [algorithm])

  const handleFeatureToggle = (feature: string, checked: boolean) => {
    if (checked) {
      setSelectedFeatures((prev) => [...prev, feature])
    } else {
      setSelectedFeatures((prev) => prev.filter((f) => f !== feature))
    }
  }

  const addToLog = (message: string) => {
    setTrainingLog((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
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
        // Get unique target values and create mapping
        const uniqueTargets = [...new Set(cleanData.map((row) => row[targetColumn]))].filter(
          (val) => val !== null && val !== undefined && val !== "",
        )

        if (uniqueTargets.length < 2) {
          throw new Error("Target column must have at least 2 unique values for classification")
        }

        // Create numeric mapping for categorical targets
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
        // Regression - ensure numeric targets
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

  const trainModel = async () => {
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

    if (!algorithm) {
      toast({
        title: "Error",
        description: "Please select an algorithm",
        variant: "destructive",
      })
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)
    setTrainingLog([])
    setCurrentTab("training")

    try {
      addToLog("Starting model training...")
      setTrainingProgress(10)

      const { X, y, cleanData } = prepareData()
      addToLog(`Prepared data: ${X.length} samples, ${X[0].length} features`)
      setTrainingProgress(20)

      // Split data for training and testing (80/20 split)
      const splitIndex = Math.floor(X.length * 0.8)
      const XTrain = X.slice(0, splitIndex)
      const XTest = X.slice(splitIndex)
      const yTrain = y.slice(0, splitIndex)
      const yTest = y.slice(splitIndex)

      addToLog(`Split data: ${XTrain.length} training, ${XTest.length} testing samples`)
      setTrainingProgress(30)

      let model: any
      const performance: ModelPerformance = {}

      // Train model based on algorithm
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
          addToLog(`Linear regression model trained with ${XTrain.length} samples`)

          // Evaluate
          const yPredLR = model.predict(XTest.map((row) => row[0]))
          performance.rmse = calculateRMSE(yTest, yPredLR)
          performance.mae = calculateMAE(yTest, yPredLR)
          performance.r2Score = calculateR2Score(yTest, yPredLR)
          addToLog(`Model performance - RMSE: ${performance.rmse?.toFixed(4)}, R²: ${performance.r2Score?.toFixed(4)}`)
          break

        case "logistic_regression":
          model = new SimpleLogisticRegression()
          model.fit(XTrain, yTrain, hyperparameters.learningRate, hyperparameters.iterations)
          addToLog(`Logistic regression model trained with ${XTrain.length} samples`)

          // Evaluate
          const yPredLogistic = model.predict(XTest)
          performance.accuracy = calculateAccuracy(yTest, yPredLogistic)
          const { precision, recall, f1Score } = calculatePrecisionRecallF1(yTest, yPredLogistic)
          performance.precision = precision
          performance.recall = recall
          performance.f1Score = f1Score
          performance.confusionMatrix = calculateConfusionMatrix(yTest, yPredLogistic)
          addToLog(
            `Model performance - Accuracy: ${(performance.accuracy * 100).toFixed(2)}%, F1: ${(f1Score * 100).toFixed(2)}%`,
          )
          break

        case "decision_tree":
          model = new SimpleDecisionTree()
          model.fit(XTrain, yTrain, hyperparameters.maxDepth)
          addToLog(`Decision tree model trained with ${XTrain.length} samples, max depth: ${hyperparameters.maxDepth}`)

          // Evaluate
          const yPredDT = model.predict(XTest)
          if (modelType === "classification") {
            performance.accuracy = calculateAccuracy(yTest, yPredDT)
            const { precision, recall, f1Score } = calculatePrecisionRecallF1(yTest, yPredDT)
            performance.precision = precision
            performance.recall = recall
            performance.f1Score = f1Score
            performance.confusionMatrix = calculateConfusionMatrix(yTest, yPredDT)
            addToLog(`Model performance - Accuracy: ${(performance.accuracy * 100).toFixed(2)}%`)
          } else {
            performance.rmse = calculateRMSE(yTest, yPredDT)
            performance.mae = calculateMAE(yTest, yPredDT)
            performance.r2Score = calculateR2Score(yTest, yPredDT)
            addToLog(`Model performance - RMSE: ${performance.rmse?.toFixed(4)}`)
          }
          break

        case "kmeans":
          model = new KMeansClustering(hyperparameters.k)
          model.fit(X, hyperparameters.maxIterations)
          addToLog(`K-Means clustering model trained with ${X.length} samples, k=${hyperparameters.k}`)

          // For clustering, calculate silhouette score approximation
          const clusters = model.predict(X)
          const uniqueClusters = new Set(clusters)
          const clusterUtilization = uniqueClusters.size / hyperparameters.k
          performance.accuracy = clusterUtilization
          addToLog(`Clustering complete - ${uniqueClusters.size} clusters formed`)
          break

        default:
          throw new Error(`Unknown algorithm: ${algorithm}`)
      }

      setTrainingProgress(80)
      addToLog("Model evaluation completed")

      // Create ML model object
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

      // Save the trained model
      saveTrainedModel(mlModel)
      setTrainedModel(mlModel)
      setTrainingProgress(100)
      addToLog("Model training completed successfully and saved!")
      setCurrentTab("results")

      toast({
        title: "Success",
        description: "Model trained successfully!",
      })
    } catch (error) {
      console.error("Training error:", error)
      addToLog(`Error: ${error instanceof Error ? error.message : "Training failed"}`)
      toast({
        title: "Training Failed",
        description: error instanceof Error ? error.message : "An error occurred during training",
        variant: "destructive",
      })
    } finally {
      setIsTraining(false)
    }
  }

  const renderPerformanceMetrics = () => {
    if (!trainedModel?.performance) return null

    const { performance } = trainedModel

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {performance.accuracy !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{(performance.accuracy * 100).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Accuracy</div>
          </div>
        )}
        {performance.precision !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{(performance.precision * 100).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Precision</div>
          </div>
        )}
        {performance.recall !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(performance.recall * 100).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Recall</div>
          </div>
        )}
        {performance.f1Score !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{(performance.f1Score * 100).toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">F1 Score</div>
          </div>
        )}
        {performance.rmse !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{performance.rmse.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">RMSE</div>
          </div>
        )}
        {performance.mae !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{performance.mae.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">MAE</div>
          </div>
        )}
        {performance.r2Score !== undefined && (
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{performance.r2Score.toFixed(3)}</div>
            <div className="text-sm text-muted-foreground">R² Score</div>
          </div>
        )}
      </div>
    )
  }

  if (!hasData) {
    return (
      <DataUploadPrompt
        title="Upload Data for ML Training"
        description="Machine learning model training requires data to be uploaded. Please upload a CSV or Excel file to begin training models."
        showBackButton={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Model Setup</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Configuration</CardTitle>
              <CardDescription>Configure your machine learning model parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-2">
                  <Label htmlFor="algorithm">Algorithm</Label>
                  <Select value={algorithm} onValueChange={setAlgorithm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      {algorithmOptions[modelType].map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

              {algorithm && Object.keys(hyperparameters).length > 0 && (
                <div className="space-y-2">
                  <Label>Hyperparameters</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(hyperparameters).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label htmlFor={key} className="text-sm">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </Label>
                        <Input
                          id={key}
                          type="number"
                          value={value}
                          onChange={(e) =>
                            setHyperparameters((prev) => ({
                              ...prev,
                              [key]: Number.parseFloat(e.target.value) || 0,
                            }))
                          }
                          step={key === "learningRate" ? 0.001 : 1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentTab("training")}
                  disabled={!selectedFeatures.length || (!targetColumn && modelType !== "clustering") || !algorithm}
                >
                  Continue to Training
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Training</CardTitle>
              <CardDescription>Train your machine learning model with the configured parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => setCurrentTab("setup")} disabled={isTraining}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Setup
                </Button>

                <Button
                  onClick={trainModel}
                  disabled={
                    isTraining ||
                    !selectedFeatures.length ||
                    (!targetColumn && modelType !== "clustering") ||
                    !algorithm
                  }
                  className="flex items-center gap-2"
                >
                  {isTraining ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {isTraining ? "Training..." : "Start Training"}
                </Button>

                {trainedModel && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Model Trained
                  </Badge>
                )}
              </div>

              {isTraining && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Training Progress</span>
                    <span>{trainingProgress}%</span>
                  </div>
                  <Progress value={trainingProgress} className="w-full" />
                </div>
              )}

              {trainingLog.length > 0 && (
                <div className="space-y-2">
                  <Label>Training Log</Label>
                  <div className="bg-muted p-3 rounded-md max-h-40 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap">{trainingLog.join("\n")}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {trainedModel ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Model Performance
                  </CardTitle>
                  <CardDescription>Performance metrics for your trained model</CardDescription>
                </CardHeader>
                <CardContent>{renderPerformanceMetrics()}</CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Model Type</Label>
                      <p className="text-sm text-muted-foreground capitalize">{trainedModel.type}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Algorithm</Label>
                      <p className="text-sm text-muted-foreground">
                        {trainedModel.algorithm.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Features</Label>
                      <p className="text-sm text-muted-foreground">{trainedModel.features.join(", ")}</p>
                    </div>
                    {trainedModel.target && (
                      <div>
                        <Label className="text-sm font-medium">Target</Label>
                        <p className="text-sm text-muted-foreground">{trainedModel.target}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium">Trained At</Label>
                      <p className="text-sm text-muted-foreground">{trainedModel.trainedAt?.toLocaleString()}</p>
                    </div>
                  </div>

                  {Object.keys(trainedModel.hyperparameters).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Hyperparameters</Label>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {Object.entries(trainedModel.hyperparameters).map(([key, value]) => (
                          <div key={key}>
                            {key}: {value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={() => setCurrentTab("setup")} variant="outline">
                      Train Another Model
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>No trained model available. Please train a model first.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
