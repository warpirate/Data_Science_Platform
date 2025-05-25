"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useData } from "@/lib/data-context"
import { TrendingUp, AlertCircle, BarChart3, Target, Brain, Lightbulb, Activity } from "lucide-react"

interface FeatureImportance {
  feature: string
  importance: number
  type: "high" | "medium" | "low"
}

interface DataInsight {
  type: "correlation" | "distribution" | "outlier" | "pattern" | "recommendation"
  title: string
  description: string
  severity: "high" | "medium" | "low"
  value?: number
  features?: string[]
}

interface MLRecommendation {
  modelType: "classification" | "regression" | "clustering"
  algorithm: string
  reason: string
  confidence: number
  features: string[]
}

export function MLInsights() {
  const { processedData, columns, columnTypes, dataProfile } = useData()
  const [featureImportances, setFeatureImportances] = useState<FeatureImportance[]>([])
  const [insights, setInsights] = useState<DataInsight[]>([])
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const numericColumns = columns.filter((col) => columnTypes[col] === "number")
  const categoricalColumns = columns.filter((col) => columnTypes[col] === "string" || columnTypes[col] === "boolean")

  useEffect(() => {
    if (processedData.length > 0) {
      analyzeData()
    }
  }, [processedData, dataProfile])

  const analyzeData = async () => {
    setIsAnalyzing(true)
    try {
      // Simulate analysis time
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate feature importance analysis
      const importances = generateFeatureImportance()
      setFeatureImportances(importances)

      // Generate data insights
      const dataInsights = generateDataInsights()
      setInsights(dataInsights)

      // Generate ML recommendations
      const mlRecommendations = generateMLRecommendations()
      setRecommendations(mlRecommendations)
    } catch (error) {
      console.error("Analysis error:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateFeatureImportance = (): FeatureImportance[] => {
    if (!numericColumns.length) return []

    return numericColumns
      .map((feature) => {
        // Calculate feature importance based on variance and correlation
        const values = processedData.map((row) => Number(row[feature]) || 0)
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length

        // Normalize variance to get importance score
        const maxVariance = Math.max(
          ...numericColumns.map((col) => {
            const colValues = processedData.map((row) => Number(row[col]) || 0)
            const colMean = colValues.reduce((sum, val) => sum + val, 0) / colValues.length
            return colValues.reduce((sum, val) => sum + Math.pow(val - colMean, 2), 0) / colValues.length
          }),
        )

        const importance = maxVariance > 0 ? (variance / maxVariance) * 100 : 0

        let type: "high" | "medium" | "low" = "low"
        if (importance > 70) type = "high"
        else if (importance > 40) type = "medium"

        return {
          feature,
          importance: Math.round(importance),
          type,
        }
      })
      .sort((a, b) => b.importance - a.importance)
  }

  const generateDataInsights = (): DataInsight[] => {
    const insights: DataInsight[] = []

    // Correlation insights
    if (dataProfile?.correlations && Object.keys(dataProfile.correlations).length > 0) {
      const correlations = dataProfile.correlations
      const strongCorrelations: Array<{ features: string[]; value: number }> = []

      Object.entries(correlations).forEach(([col1, correlationMap]) => {
        Object.entries(correlationMap).forEach(([col2, correlation]) => {
          if (col1 !== col2 && Math.abs(correlation) > 0.7) {
            strongCorrelations.push({
              features: [col1, col2],
              value: correlation,
            })
          }
        })
      })

      if (strongCorrelations.length > 0) {
        const strongest = strongCorrelations.reduce((max, curr) =>
          Math.abs(curr.value) > Math.abs(max.value) ? curr : max,
        )

        insights.push({
          type: "correlation",
          title: "Strong Feature Correlation Detected",
          description: `${strongest.features[0]} and ${strongest.features[1]} show strong correlation (${(strongest.value * 100).toFixed(1)}%). Consider feature selection to avoid multicollinearity.`,
          severity: Math.abs(strongest.value) > 0.9 ? "high" : "medium",
          value: strongest.value,
          features: strongest.features,
        })
      }
    }

    // Distribution insights
    numericColumns.forEach((column) => {
      const profile = dataProfile?.columns[column]
      if (profile && profile.skewness !== undefined) {
        if (Math.abs(profile.skewness) > 2) {
          insights.push({
            type: "distribution",
            title: `Skewed Distribution in ${column}`,
            description: `The ${column} feature shows ${profile.skewness > 0 ? "positive" : "negative"} skewness (${profile.skewness.toFixed(2)}). Consider log transformation or other normalization techniques.`,
            severity: Math.abs(profile.skewness) > 3 ? "high" : "medium",
            value: profile.skewness,
            features: [column],
          })
        }
      }
    })

    // Outlier insights
    if (dataProfile?.dataQuality) {
      const outlierIssues = dataProfile.dataQuality.filter((issue) => issue.type === "outliers")
      if (outlierIssues.length > 0) {
        outlierIssues.forEach((issue) => {
          insights.push({
            type: "outlier",
            title: "Outliers Detected",
            description: issue.description,
            severity: issue.severity,
            value: issue.count,
            features: issue.column ? [issue.column] : [],
          })
        })
      }
    }

    // Missing data insights
    if (dataProfile?.dataQuality) {
      const missingIssues = dataProfile.dataQuality.filter((issue) => issue.type === "missing_values")
      if (missingIssues.length > 0) {
        const highMissing = missingIssues.filter((issue) => issue.severity === "high")
        if (highMissing.length > 0) {
          insights.push({
            type: "pattern",
            title: "High Missing Data Rate",
            description: `${highMissing.length} columns have high missing data rates. Consider imputation strategies or feature removal.`,
            severity: "high",
            value: highMissing.length,
            features: highMissing.map((issue) => issue.column).filter(Boolean) as string[],
          })
        }
      }
    }

    // Data size recommendations
    const dataSize = processedData.length
    if (dataSize < 100) {
      insights.push({
        type: "recommendation",
        title: "Small Dataset Warning",
        description: `Your dataset has only ${dataSize} rows. Consider collecting more data for better model performance, especially for complex algorithms.`,
        severity: "medium",
        value: dataSize,
      })
    } else if (dataSize > 10000) {
      insights.push({
        type: "recommendation",
        title: "Large Dataset Opportunity",
        description: `Your dataset has ${dataSize} rows. This is excellent for training robust machine learning models. Consider using ensemble methods or deep learning approaches.`,
        severity: "low",
        value: dataSize,
      })
    }

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  const generateMLRecommendations = (): MLRecommendation[] => {
    const recommendations: MLRecommendation[] = []

    // Analyze data characteristics to suggest appropriate ML approaches
    const dataSize = processedData.length
    const numFeatures = numericColumns.length
    const numCategories = categoricalColumns.length

    // Classification recommendations
    if (categoricalColumns.length > 0) {
      // Check if any categorical column could be a good target
      categoricalColumns.forEach((column) => {
        const uniqueValues = new Set(processedData.map((row) => row[column])).size
        if (uniqueValues >= 2 && uniqueValues <= 10) {
          let algorithm = "logistic_regression"
          let confidence = 70

          if (dataSize > 1000 && numFeatures > 5) {
            algorithm = "decision_tree"
            confidence = 80
          }

          recommendations.push({
            modelType: "classification",
            algorithm,
            reason: `${column} has ${uniqueValues} unique values, making it suitable for classification. ${dataSize > 500 ? "Large dataset supports complex models." : "Small dataset favors simpler models."}`,
            confidence,
            features: numericColumns.slice(0, Math.min(5, numericColumns.length)),
          })
        }
      })
    }

    // Regression recommendations
    if (numericColumns.length >= 2) {
      const targetCandidates = numericColumns.slice(0, 3) // Consider first 3 numeric columns as potential targets

      targetCandidates.forEach((target) => {
        const remainingFeatures = numericColumns.filter((col) => col !== target)
        if (remainingFeatures.length > 0) {
          let algorithm = "linear_regression"
          let confidence = 65

          if (remainingFeatures.length === 1) {
            algorithm = "linear_regression"
            confidence = 75
          } else if (dataSize > 500) {
            algorithm = "decision_tree"
            confidence = 80
          }

          recommendations.push({
            modelType: "regression",
            algorithm,
            reason: `Predict ${target} using ${remainingFeatures.length} numeric features. ${remainingFeatures.length === 1 ? "Single feature regression is well-suited for linear models." : "Multiple features may benefit from tree-based models."}`,
            confidence,
            features: remainingFeatures.slice(0, Math.min(4, remainingFeatures.length)),
          })
        }
      })
    }

    // Clustering recommendations
    if (numericColumns.length >= 2) {
      let confidence = 60
      if (numericColumns.length >= 3 && dataSize > 100) {
        confidence = 75
      }

      recommendations.push({
        modelType: "clustering",
        algorithm: "kmeans",
        reason: `${numericColumns.length} numeric features available for clustering analysis. ${dataSize > 200 ? "Dataset size supports meaningful cluster discovery." : "Consider collecting more data for robust clustering."}`,
        confidence,
        features: numericColumns.slice(0, Math.min(5, numericColumns.length)),
      })
    }

    // Sort by confidence
    return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 3)
  }

  const getSeverityColor = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getSeverityBadgeVariant = (severity: "high" | "medium" | "low") => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "correlation":
        return <Activity className="h-4 w-4" />
      case "distribution":
        return <BarChart3 className="h-4 w-4" />
      case "outlier":
        return <AlertCircle className="h-4 w-4" />
      case "pattern":
        return <TrendingUp className="h-4 w-4" />
      case "recommendation":
        return <Lightbulb className="h-4 w-4" />
      default:
        return <Brain className="h-4 w-4" />
    }
  }

  if (!processedData.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No data available. Please upload and process your data first.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="importance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="importance">Feature Importance</TabsTrigger>
          <TabsTrigger value="insights">Data Insights</TabsTrigger>
          <TabsTrigger value="recommendations">ML Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="importance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Feature Importance Analysis
              </CardTitle>
              <CardDescription>Understanding which features are most valuable for machine learning</CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Analyzing features...</p>
                  </div>
                </div>
              ) : featureImportances.length > 0 ? (
                <div className="space-y-4">
                  {featureImportances.map((item, index) => (
                    <div key={item.feature} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.feature}</span>
                          <Badge variant={getSeverityBadgeVariant(item.type)}>{item.type}</Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.importance}%</span>
                      </div>
                      <Progress value={item.importance} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No numeric features available for importance analysis.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Data Insights
              </CardTitle>
              <CardDescription>Automated analysis of your data patterns and quality</CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Generating insights...</p>
                  </div>
                </div>
              ) : insights.length > 0 ? (
                <div className="space-y-4">
                  {insights.map((insight, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${getSeverityColor(insight.severity)}`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{insight.title}</h4>
                            <Badge variant={getSeverityBadgeVariant(insight.severity)}>{insight.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{insight.description}</p>
                          {insight.features && insight.features.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {insight.features.map((feature) => (
                                <Badge key={feature} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>No significant insights detected in your data.</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                ML Model Recommendations
              </CardTitle>
              <CardDescription>
                Suggested machine learning approaches based on your data characteristics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Generating recommendations...</p>
                  </div>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="capitalize">
                            {rec.modelType}
                          </Badge>
                          <span className="font-medium">{rec.algorithm.replace("_", " ").toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Confidence:</span>
                          <Badge variant="outline">{rec.confidence}%</Badge>
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground">{rec.reason}</p>

                      <div>
                        <span className="text-sm font-medium">Recommended Features:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rec.features.map((feature) => (
                            <Badge key={feature} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="pt-2">
                        <Progress value={rec.confidence} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Unable to generate ML recommendations. Ensure your data has sufficient numeric features.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
