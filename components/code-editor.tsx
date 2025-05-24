"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Copy } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CodeEditor() {
  const [code, setCode] = useState("// Write your code here\n\n")
  const [language, setLanguage] = useState("javascript")
  const [output, setOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState("")

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const runCode = () => {
    setIsRunning(true)
    setError("")
    setOutput("")

    // Simple JavaScript code execution with console.log capture
    if (language === "javascript") {
      try {
        // Create a mock console.log that captures output
        const originalLog = console.log
        let outputCapture = ""

        console.log = (...args) => {
          outputCapture +=
            args.map((arg) => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg))).join(" ") + "\n"
        }

        // Execute the code
        // eslint-disable-next-line no-new-func
        const result = new Function(code)()

        // Restore original console.log
        console.log = originalLog

        if (result !== undefined) {
          outputCapture += String(result)
        }

        setOutput(outputCapture || "Code executed successfully with no output.")
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while executing the code.")
      }
    } else {
      setOutput(`Running ${language} code is not supported in this demo. Only JavaScript is supported.`)
    }

    setIsRunning(false)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Select value={language} onValueChange={setLanguage}>
          <SelectTrigger className="w-[180px] sketch-input">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python (Demo)</SelectItem>
            <SelectItem value="r">R (Demo)</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1"></div>
        <Button variant="outline" size="sm" className="sketch-button" onClick={copyCode} title="Copy Code">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button variant="outline" size="sm" className="sketch-button" onClick={runCode} disabled={isRunning}>
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
      </div>

      <Textarea className="min-h-[200px] font-mono sketch-input" value={code} onChange={handleCodeChange} />

      {error && (
        <Alert variant="destructive" className="sketch-card">
          <AlertDescription>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </AlertDescription>
        </Alert>
      )}

      {output && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Output:</h3>
          <div className="p-4 border rounded-md bg-black text-white font-mono text-sm overflow-auto max-h-[200px]">
            <pre>{output}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
