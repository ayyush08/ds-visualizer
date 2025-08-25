"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart3, RotateCcw, Search, Edit } from "lucide-react"


export function FenwickTreeVisualizer() {
    const [array, setArray] = useState<number[]>([1, 3, 5, 7, 9, 11, 13, 15])
    const [fenwick, setFenwick] = useState<number[]>([])
    const [queryIndex, setQueryIndex] = useState("")
    const [updateIndex, setUpdateIndex] = useState("")
    const [updateValue, setUpdateValue] = useState("")
    const [highlightedIndices, setHighlightedIndices] = useState<Set<number>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    // Build Fenwick Tree
    const buildFenwick = (arr: number[]): number[] => {
        const n = arr.length
        const tree = new Array(n + 1).fill(0)

        for (let i = 0; i < n; i++) {
            updateFenwick(tree, i + 1, arr[i])
        }

        return tree
    }

    // Update Fenwick Tree
    const updateFenwick = (tree: number[], index: number, delta: number) => {
        while (index < tree.length) {
            tree[index] += delta
            index += index & -index // Add LSB
        }
    }

    // Query prefix sum
    const queryFenwick = (tree: number[], index: number): { sum: number; path: number[] } => {
        let sum = 0
        const path: number[] = []

        while (index > 0) {
            path.push(index)
            sum += tree[index]
            index -= index & -index // Remove LSB
        }

        return { sum, path }
    }

    const animateOperation = (indices: number[], op: string) => {
        setOperation(op)
        setHighlightedIndices(new Set(indices))
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightedIndices(new Set())
            setIsAnimating(false)
            setOperation(null)
        }, 2000)
    }

    const handleQuery = () => {
        const index = Number.parseInt(queryIndex)

        if (!isNaN(index) && index >= 0 && index < array.length && fenwick.length > 0) {
            const result = queryFenwick(fenwick, index + 1)
            animateOperation(result.path, `Prefix sum [0..${index}] = ${result.sum}`)
            setQueryIndex("")
        }
    }

    const handleUpdate = () => {
        const index = Number.parseInt(updateIndex)
        const value = Number.parseInt(updateValue)

        if (!isNaN(index) && !isNaN(value) && index >= 0 && index < array.length && fenwick.length > 0) {
            const oldValue = array[index]
            const delta = value - oldValue

            const newArray = [...array]
            newArray[index] = value
            setArray(newArray)

            const newFenwick = [...fenwick]
            updateFenwick(newFenwick, index + 1, delta)
            setFenwick(newFenwick)

            // Show update path
            const path: number[] = []
            let idx = index + 1
            while (idx < newFenwick.length) {
                path.push(idx)
                idx += idx & -idx
            }

            animateOperation(path, `Updated index ${index}: ${oldValue} → ${value} (Δ${delta > 0 ? "+" : ""}${delta})`)
            setUpdateIndex("")
            setUpdateValue("")
        }
    }

    const handleReset = () => {
        const initialArray = [1, 3, 5, 7, 9, 11, 13, 15]
        setArray(initialArray)
        setFenwick(buildFenwick(initialArray))
        setHighlightedIndices(new Set())
        setOperation(null)
    }

    // Initialize Fenwick tree on first render
    useState(() => {
        setFenwick(buildFenwick(array))
    })

    // Get binary representation
    const getBinary = (num: number): string => {
        return num.toString(2).padStart(4, "0")
    }

    // Get LSB (Least Significant Bit)
    const getLSB = (num: number): number => {
        return num & -num
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Fenwick Tree (Binary Indexed Tree)
                        </div>
                        <Badge variant="outline">O(log n) all operations</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Array Display */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Original Array</h4>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {array.map((value, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">{index}</div>
                                    <div className="w-12 h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold border-border bg-card">
                                        {value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Fenwick Tree Display */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Fenwick Tree (1-indexed)</h4>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2 mb-4">
                            {fenwick.slice(1).map((value, index) => {
                                const actualIndex = index + 1
                                const isHighlighted = highlightedIndices.has(actualIndex)
                                return (
                                    <div key={actualIndex} className="text-center">
                                        <div className="text-xs text-muted-foreground mb-1">
                                            {actualIndex} ({getBinary(actualIndex)})
                                        </div>
                                        <div
                                            className={`w-16 h-16 border-2 rounded-lg flex flex-col items-center justify-center font-mono text-sm transition-all duration-300 ${isHighlighted
                                                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                                                    : "border-border bg-card"
                                                }`}
                                        >
                                            <div className="font-bold">{value}</div>
                                            <div className="text-xs opacity-70">LSB:{getLSB(actualIndex)}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {operation && (
                            <div className="text-center mt-4">
                                <Badge variant="secondary" className="animate-pulse">
                                    {operation}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Prefix Sum Query</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Index (0-based)"
                                    value={queryIndex}
                                    onChange={(e) => setQueryIndex(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleQuery()}
                                />
                                <Button onClick={handleQuery} disabled={isAnimating} size="sm">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Get sum from index 0 to specified index</p>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Update Element</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Index"
                                    value={updateIndex}
                                    onChange={(e) => setUpdateIndex(e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    placeholder="New Value"
                                    value={updateValue}
                                    onChange={(e) => setUpdateValue(e.target.value)}
                                    className="w-24"
                                />
                                <Button onClick={handleUpdate} disabled={isAnimating} size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-4">
                        <Button onClick={handleReset} variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Tree
                        </Button>
                    </div>

                    {/* Fenwick Tree Explanation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">How It Works</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Each index stores sum of a range</li>
                                <li>• Range size = LSB (Least Significant Bit)</li>
                                <li>• Index i covers range [i-LSB(i)+1, i]</li>
                                <li>• Query: Remove LSB to get parent</li>
                                <li>• Update: Add LSB to get next affected index</li>
                            </ul>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Key Properties</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Space efficient: O(n) vs Segment Tree&apos;s O(4n)</li>
                                <li>• Prefix sum queries in O(log n)</li>
                                <li>• Point updates in O(log n)</li>
                                <li>• Perfect for cumulative frequency tables</li>
                                <li>• Used in competitive programming for inversions</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
