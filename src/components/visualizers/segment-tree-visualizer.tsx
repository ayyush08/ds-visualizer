"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Layers, RotateCcw, Search, Calculator, Edit } from "lucide-react"
import type { JSX } from "react/jsx-runtime"


export function SegmentTreeVisualizer( ) {
    const [array, setArray] = useState<number[]>([1, 3, 5, 7, 9, 11])
    const [tree, setTree] = useState<number[]>([])
    const [queryLeft, setQueryLeft] = useState("")
    const [queryRight, setQueryRight] = useState("")
    const [updateIndex, setUpdateIndex] = useState("")
    const [updateValue, setUpdateValue] = useState("")
    const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    // Build segment tree
    const buildTree = (arr: number[]): number[] => {
        const n = arr.length
        const tree = new Array(4 * n).fill(0)

        const build = (node: number, start: number, end: number) => {
            if (start === end) {
                tree[node] = arr[start]
            } else {
                const mid = Math.floor((start + end) / 2)
                build(2 * node, start, mid)
                build(2 * node + 1, mid + 1, end)
                tree[node] = tree[2 * node] + tree[2 * node + 1]
            }
        }

        build(1, 0, n - 1)
        return tree
    }

    // Query range sum
    const queryRange = (
        tree: number[],
        node: number,
        start: number,
        end: number,
        l: number,
        r: number,
        path: number[] = [],
    ): { sum: number; path: number[] } => {
        path.push(node)

        if (r < start || end < l) {
            return { sum: 0, path }
        }

        if (l <= start && end <= r) {
            return { sum: tree[node], path }
        }

        const mid = Math.floor((start + end) / 2)
        const leftResult = queryRange(tree, 2 * node, start, mid, l, r, [...path])
        const rightResult = queryRange(tree, 2 * node + 1, mid + 1, end, l, r, [...path])

        return {
            sum: leftResult.sum + rightResult.sum,
            path: [...new Set([...leftResult.path, ...rightResult.path])],
        }
    }

    // Update single element
    const updateTree = (
        tree: number[],
        node: number,
        start: number,
        end: number,
        idx: number,
        val: number,
        path: number[] = [],
    ): number[] => {
        path.push(node)
        const newTree = [...tree]

        if (start === end) {
            newTree[node] = val
        } else {
            const mid = Math.floor((start + end) / 2)
            if (idx <= mid) {
                updateTree(newTree, 2 * node, start, mid, idx, val, path)
            } else {
                updateTree(newTree, 2 * node + 1, mid + 1, end, idx, val, path)
            }
            newTree[node] = newTree[2 * node] + newTree[2 * node + 1]
        }

        return newTree
    }

    const animateOperation = (nodeIds: number[], op: string) => {
        setOperation(op)
        setHighlightedNodes(new Set(nodeIds))
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightedNodes(new Set())
            setIsAnimating(false)
            setOperation(null)
        }, 2000)
    }

    const handleBuild = () => {
        const newTree = buildTree(array)
        setTree(newTree)
        animateOperation([1], `Built segment tree for array [${array.join(", ")}]`)
    }

    const handleQuery = () => {
        const left = Number.parseInt(queryLeft)
        const right = Number.parseInt(queryRight)

        if (!isNaN(left) && !isNaN(right) && left >= 0 && right < array.length && left <= right && tree.length > 0) {
            const result = queryRange(tree, 1, 0, array.length - 1, left, right)
            animateOperation(result.path, `Range sum [${left}, ${right}] = ${result.sum}`)
            setQueryLeft("")
            setQueryRight("")
        }
    }

    const handleUpdate = () => {
        const index = Number.parseInt(updateIndex)
        const value = Number.parseInt(updateValue)

        if (!isNaN(index) && !isNaN(value) && index >= 0 && index < array.length && tree.length > 0) {
            const newArray = [...array]
            newArray[index] = value
            setArray(newArray)

            const newTree = updateTree(tree, 1, 0, array.length - 1, index, value)
            setTree(newTree)

            animateOperation([1], `Updated index ${index} to ${value}`)
            setUpdateIndex("")
            setUpdateValue("")
        }
    }

    const handleReset = () => {
        const initialArray = [1, 3, 5, 7, 9, 11]
        setArray(initialArray)
        setTree(buildTree(initialArray))
        setHighlightedNodes(new Set())
        setOperation(null)
    }

    // Initialize tree on first render
    useState(() => {
        setTree(buildTree(array))
    })

    const renderTree = (): JSX.Element[] => {
        if (tree.length === 0) return []

        const elements: JSX.Element[] = []
        const levels = Math.ceil(Math.log2(tree.length))

        // Render tree nodes level by level
        for (let level = 0; level < levels; level++) {
            const nodesInLevel = Math.pow(2, level)
            const startIndex = Math.pow(2, level)
            const y = 60 + level * 80

            for (let i = 0; i < nodesInLevel && startIndex + i < tree.length; i++) {
                const nodeIndex = startIndex + i
                if (tree[nodeIndex] === 0 && nodeIndex > 1) continue

                const x = 50 + (i + 0.5) * (800 / nodesInLevel)

                // Draw connections to parent
                if (nodeIndex > 1) {
                    const parentIndex = Math.floor(nodeIndex / 2)
                    const parentLevel = Math.floor(Math.log2(parentIndex))
                    const parentPosition = parentIndex - Math.pow(2, parentLevel)
                    const parentX = 50 + (parentPosition + 0.5) * (800 / Math.pow(2, parentLevel))
                    const parentY = 60 + parentLevel * 80

                    const isHighlighted = highlightedNodes.has(nodeIndex) || highlightedNodes.has(parentIndex)
                    elements.push(
                        <line
                            key={`line-${nodeIndex}`}
                            x1={parentX}
                            y1={parentY}
                            x2={x}
                            y2={y}
                            stroke={isHighlighted ? "rgb(16, 185, 129)" : "hsl(var(--muted-foreground))"}
                            strokeWidth={isHighlighted ? "3" : "2"}
                            className="transition-all duration-300"
                        />,
                    )
                }

                // Draw node
                elements.push(
                    <g key={`node-${nodeIndex}`}>
                        <circle
                            cx={x}
                            cy={y}
                            r="25"
                            className={`transition-all duration-300 ${highlightedNodes.has(nodeIndex)
                                    ? "fill-primary stroke-primary-foreground stroke-2"
                                    : "fill-card stroke-border stroke-2"
                                }`}
                        />
                        <text
                            x={x}
                            y={y + 5}
                            textAnchor="middle"
                            className={`text-sm font-mono font-bold ${highlightedNodes.has(nodeIndex) ? "fill-primary-foreground" : "fill-foreground"
                                }`}
                        >
                            {tree[nodeIndex]}
                        </text>
                        <text x={x} y={y - 35} textAnchor="middle" className="text-xs fill-muted-foreground">
                            [{nodeIndex}]
                        </text>
                    </g>,
                )
            }
        }

        return elements
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            Segment Tree Visualizer
                        </div>
                        <Badge variant="outline">O(log n) query/update</Badge>
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

                    {/* Tree Visualization */}
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Segment Tree (Range Sum)</h4>
                        <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                            <svg width="100%" height="100%" viewBox="0 0 900 400" className="min-w-[900px]">
                                {renderTree()}
                            </svg>
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Range Query</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Left"
                                    value={queryLeft}
                                    onChange={(e) => setQueryLeft(e.target.value)}
                                    className="w-16"
                                />
                                <Input
                                    placeholder="Right"
                                    value={queryRight}
                                    onChange={(e) => setQueryRight(e.target.value)}
                                    className="w-16"
                                />
                                <Button onClick={handleQuery} disabled={isAnimating} size="sm">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Update Element</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Index"
                                    value={updateIndex}
                                    onChange={(e) => setUpdateIndex(e.target.value)}
                                    className="w-16"
                                />
                                <Input
                                    placeholder="Value"
                                    value={updateValue}
                                    onChange={(e) => setUpdateValue(e.target.value)}
                                    className="w-16"
                                />
                                <Button onClick={handleUpdate} disabled={isAnimating} size="sm" variant="outline">
                                    <Edit className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Operations</h4>
                            <div className="flex gap-2">
                                <Button onClick={handleBuild} disabled={isAnimating} size="sm" variant="outline">
                                    <Calculator className="w-4 h-4 mr-2" />
                                    Rebuild
                                </Button>
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Segment Tree Properties */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Segment Tree Properties</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Supports range queries (sum, min, max) in O(log n)</li>
                            <li>• Point updates in O(log n) time</li>
                            <li>• Tree size is 4n for array of size n</li>
                            <li>• Node [i] represents sum of range for its subtree</li>
                            <li>• Perfect for competitive programming range problems</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
