"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useData } from "@/lib/data-context"
import { DataUploadPrompt } from "@/components/data-upload-prompt"
import { Target, AlertCircle, Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function MLPredictor() {
  const { processedData, columns, columnTypes, trainedModels, downloadModel } = useData()
  const [selectedModel, setSelectedModel] = useState<string>("")
  const [inputValues, setInputValues] = useState<Record<string, string>>({})
  const [predictions, setPredictions] = useState<
    Array<{ input: Record<string, any>; prediction: any; confidence?: number }>
  >([])
  const [currentTab, setCurrentTab] = useState("predict")

  const hasData = processedData.length > 0
  const availableModels = useMemo(() => {
    return trainedModels.filter((model) => model.performance)
  }, [trainedModels])

  // Reset input values when model changes
  useEffect(() => {
    if (selectedModel && availableModels.length > 0) {
      const model = availableModels.find((m) => m.id === selectedModel)
      if (model) {
        const newInputValues: Record<string, string> = {}
        model.features.forEach((feature) => {
          newInputValues[feature] = ""
        })
        setInputValues(newInputValues)
      }
    }
  }, [selectedModel]) // Remove availableModels from dependencies

  const handleInputChange = (feature: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [feature]: value,
    }))
  }

  const makePrediction = () => {
    const model = availableModels.find((m) => m.id === selectedModel)
    if (!model) {
      toast({
        title: "Error",
        description: "Please select a model first",
        variant: "destructive",
      })
      return
    }

    // Validate inputs
    const missingInputs = model.features.filter(
      (feature) => !inputValues[feature] || inputValues[feature].trim() === "",
    )
    if (missingInputs.length > 0) {
      toast({
        title: "Error",
        description: `Please provide values for: ${missingInputs.join(", ")}`,
        variant: "destructive",
      })
      return
    }

    try {
      // Convert inputs to numbers
      const numericInputs = model.features.map((feature) => {
        const value = Number(inputValues[feature])
        if (isNaN(value)) {
          throw new Error(`Invalid numeric value for ${feature}: ${inputValues[feature]}`)
        }
        return value
      })

      // Simple prediction using k-nearest neighbors on the training data
      const prediction = predictUsingKNN(numericInputs, model)

      const newPrediction = {
        input: { ...inputValues },
        prediction: prediction.value,
        confidence: prediction.confidence,
      }

      setPredictions((prev) => [newPrediction, ...prev.slice(0, 9)]) // Keep last 10 predictions

      toast({
        title: "Prediction Complete",
        description: `Predicted value: ${prediction.value}`,
      })
    } catch (error) {
      toast({
        title: "Prediction Failed",
        description: error instanceof Error ? error.message : "An error occurred during prediction",
        variant: "destructive",
      })
    }
  }

  const predictUsingKNN = (input: number[], model: any, k = 5) => {
    if (!hasData) {
      throw new Error("No training data available")
    }

    // Calculate distances to all training points
    const distances = processedData
      .map((row, index) => {
        const features = model.features.map((feature: string) => Number(row[feature]) || 0)
        const distance = Math.sqrt(
          features.reduce((sum: number, val: number, i: number) => sum + Math.pow(val - input[i], 2), 0),
        )
        return { distance, row, index }
      })
      .sort((a, b) => a.distance - b.distance)

    // Get k nearest neighbors
    const neighbors = distances.slice(0, Math.min(k, distances.length))

    if (model.type === "classification") {
      // For classification, use majority vote
      const votes: Record<string, number> = {}
      neighbors.forEach((neighbor) => {
        const target = String(neighbor.row[model.target] || "unknown")
        votes[target] = (votes[target] || 0) + 1
      })

      const prediction = Object.entries(votes).reduce((a, b) => (votes[a[0]] > votes[b[0]] ? a : b))[0]
      const confidence = votes[prediction] / neighbors.length

      return { value: prediction, confidence }
    } else if (model.type === "regression") {
      // For regression, use weighted average
      const totalWeight = neighbors.reduce((sum, neighbor) => sum + 1 / (neighbor.distance + 0.001), 0)
      const weightedSum = neighbors.reduce((sum, neighbor) => {
        const weight = 1 / (neighbor.distance + 0.001)
        const target = Number(neighbor.row[model.target]) || 0
        return sum + target * weight
      }, 0)

      const prediction = weightedSum / totalWeight

      // Calculate confidence based on variance of neighbors
      const neighborValues = neighbors.map((n) => Number(n.row[model.target]) || 0)
      const variance = neighborValues.reduce((sum, val) => sum + Math.pow(val - prediction, 2), 0) / neighbors.length
      const confidence = Math.max(0, 1 - variance / (Math.abs(prediction) + 1))

      return { value: Number(prediction.toFixed(4)), confidence }
    } else {
      // For clustering, find the most common cluster
      const prediction = neighbors[0]?.row[model.target] || 0
      return { value: prediction, confidence: 0.8 }
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

  const renderModelDetails = () => {
    const model = availableModels.find((m) => m.id === selectedModel)
    if (!model) return null

    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Model Name</Label>
              <p className="text-sm text-muted-foreground">{model.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Algorithm</Label>
              <p className="text-sm text-muted-foreground">{model.algorithm.replace("_", " ").toUpperCase()}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Type</Label>
              <p className="text-sm text-muted-foreground capitalize">{model.type}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Features</Label>
              <p className="text-sm text-muted-foreground">{model.features.join(", ")}</p>
            </div>
            {model.target && (
              <div>
                <Label className="text-sm font-medium">Target</Label>
                <p className="text-sm text-muted-foreground">{model.target}</p>
              </div>
            )}
            <div>
              <Label className="text-sm font-medium">Trained At</Label>
              <p className="text-sm text-muted-foreground">{model.trainedAt?.toLocaleString()}</p>
            </div>
          </div>

          {model.performance && (
            <div>
              <Label className="text-sm font-medium">Performance</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {model.performance.accuracy && (
                  <Badge variant="outline">Accuracy: {(model.performance.accuracy * 100).toFixed(1)}%</Badge>
                )}
                {model.performance.r2Score && (
                  <Badge variant="outline">R²: {model.performance.r2Score.toFixed(3)}</Badge>
                )}
                {model.performance.rmse && <Badge variant="outline">RMSE: {model.performance.rmse.toFixed(3)}</Badge>}
              </div>
            </div>
          )}

          <Button variant="outline" onClick={() => handleDownloadModel(model.id)} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Model
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!hasData) {
    return (
      <DataUploadPrompt
        title="Upload Data for ML Predictions"
        description="Making predictions requires data to be uploaded. Please upload a CSV or Excel file to begin making predictions."
        showBackButton={false}
      />
    )
  }

  if (availableModels.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No trained models available. Please train a model first using the ML Model Trainer.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predict">Make Predictions</TabsTrigger>
          <TabsTrigger value="history">Prediction History</TabsTrigger>
          <TabsTrigger value="models">Available Models</TabsTrigger>
        </TabsList>

        <TabsContent value="predict" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Make Predictions</CardTitle>
              <CardDescription>Use your trained models to make predictions on new data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="model-select">Select Model</Label>
                <Select value={selectedModel} onValueChange={setSelectedModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a trained model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name} ({model.algorithm.replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedModel && (
                <>
                  <div className="space-y-4">
                    <Label>Input Features</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {availableModels
                        .find((m) => m.id === selectedModel)
                        ?.features.map((feature) => (
                          <div key={feature} className="space-y-2">
                            <Label htmlFor={feature}>{feature}</Label>
                            <Input
                              id={feature}
                              type="number"
                              value={inputValues[feature] || ""}
                              onChange={(e) => handleInputChange(feature, e.target.value)}
                              placeholder={`Enter ${feature} value`}
                            />
                          </div>
                        ))}
                    </div>
                  </div>

                  <Button onClick={makePrediction} className="w-full">
                    <Target className="h-4 w-4 mr-2" />
                    Make Prediction
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {selectedModel && renderModelDetails()}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>Recent predictions made with your models</CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Input Features</TableHead>
                      <TableHead>Prediction</TableHead>
                      <TableHead>Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {predictions.map((pred, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="space-y-1">
                            {Object.entries(pred.input).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{pred.prediction}</TableCell>
                        <TableCell>
                          {pred.confidence && <Badge variant="outline">{(pred.confidence * 100).toFixed(1)}%</Badge>}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No predictions made yet. Use the prediction tab to make your first prediction.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Models</CardTitle>
              <CardDescription>Trained models ready for making predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableModels.map((model) => (
                  <Card key={model.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{model.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {model.algorithm.replace("_", " ").toUpperCase()} • {model.type} • {model.features.length}{" "}
                          features
                        </p>
                        <div className="flex gap-2">
                          {model.performance?.accuracy && (
                            <Badge variant="outline" className="text-xs">
                              Accuracy: {(model.performance.accuracy * 100).toFixed(1)}%
                            </Badge>
                          )}
                          {model.performance?.r2Score && (
                            <Badge variant="outline" className="text-xs">
                              R²: {model.performance.r2Score.toFixed(3)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedModel(model.id)
                            setCurrentTab("predict")
                          }}
                        >
                          Use Model
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDownloadModel(model.id)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
