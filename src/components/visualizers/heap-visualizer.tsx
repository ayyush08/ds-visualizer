"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Trash2, RotateCcw, ArrowUp, ArrowDown } from "lucide-react"

interface HeapNode {
    value: number
    isHighlighted?: boolean
    isComparing?: boolean
}


export function HeapVisualizer() {
    const [heap, setHeap] = useState<HeapNode[]>([])
    const [inputValue, setInputValue] = useState("")
    const [heapType, setHeapType] = useState<"min" | "max">("min")
    const [operation, setOperation] = useState<string>("")
    const [animatingIndices, setAnimatingIndices] = useState<number[]>([])

    const clearHighlights = () => {
        setHeap((prev) => prev.map((node) => ({ ...node, isHighlighted: false, isComparing: false })))
        setAnimatingIndices([])
    }

    const getParentIndex = (index: number) => Math.floor((index - 1) / 2)
    const getLeftChildIndex = (index: number) => 2 * index + 1
    const getRightChildIndex = (index: number) => 2 * index + 2

    const shouldSwap = (parentValue: number, childValue: number) => {
        return heapType === "min" ? parentValue > childValue : parentValue < childValue
    }

    const heapifyUp = useCallback(
        (startIndex: number, newHeap: HeapNode[]) => {
            let currentIndex = startIndex

            while (currentIndex > 0) {
                const parentIndex = getParentIndex(currentIndex)

                if (!shouldSwap(newHeap[parentIndex].value, newHeap[currentIndex].value)) {
                    break
                }
                // Swap
                ;[newHeap[parentIndex], newHeap[currentIndex]] = [newHeap[currentIndex], newHeap[parentIndex]]
                currentIndex = parentIndex
            }

            return newHeap
        },
        [heapType],
    )

    const heapifyDown = useCallback(
        (startIndex: number, newHeap: HeapNode[]) => {
            let currentIndex = startIndex

            while (true) {
                let targetIndex = currentIndex
                const leftChild = getLeftChildIndex(currentIndex)
                const rightChild = getRightChildIndex(currentIndex)

                if (leftChild < newHeap.length && shouldSwap(newHeap[targetIndex].value, newHeap[leftChild].value)) {
                    targetIndex = leftChild
                }

                if (rightChild < newHeap.length && shouldSwap(newHeap[targetIndex].value, newHeap[rightChild].value)) {
                    targetIndex = rightChild
                }

                if (targetIndex === currentIndex) break

                    // Swap
                    ;[newHeap[currentIndex], newHeap[targetIndex]] = [newHeap[targetIndex], newHeap[currentIndex]]
                currentIndex = targetIndex
            }

            return newHeap
        },
        [heapType],
    )

    const insert = () => {
        const value = Number.parseInt(inputValue)
        if (isNaN(value)) return

        clearHighlights()
        const newNode: HeapNode = { value, isHighlighted: true }
        const newHeap = [...heap, newNode]

        const finalHeap = heapifyUp(newHeap.length - 1, newHeap)
        setHeap(finalHeap)
        setOperation(`Inserted ${value} into ${heapType}-heap`)
        setInputValue("")
    }

    const extractRoot = () => {
        if (heap.length === 0) return

        clearHighlights()
        const root = heap[0].value

        if (heap.length === 1) {
            setHeap([])
            setOperation(`Extracted root ${root} - heap is now empty`)
            return
        }

        // Move last element to root and remove last
        const newHeap = [...heap]
        newHeap[0] = { ...newHeap[newHeap.length - 1], isHighlighted: true }
        newHeap.pop()

        const finalHeap = heapifyDown(0, newHeap)
        setHeap(finalHeap)
        setOperation(`Extracted root ${root} from ${heapType}-heap`)
    }

    const buildHeap = () => {
        if (heap.length <= 1) return

        clearHighlights()
        const newHeap = [...heap]

        // Start from last non-leaf node and heapify down
        for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
            heapifyDown(i, newHeap)
        }

        setHeap(newHeap)
        setOperation(`Rebuilt ${heapType}-heap structure`)
    }

    const reset = () => {
        setHeap([])
        setInputValue("")
        setOperation("")
        setAnimatingIndices([])
    }

    const switchHeapType = (newType: "min" | "max") => {
        setHeapType(newType)
        if (heap.length > 0) {
            // Rebuild heap with new type
            setTimeout(() => buildHeap(), 100)
        }
    }

    const renderHeapTree = () => {
        if (heap.length === 0) {
            return <div className="flex items-center justify-center h-64 text-muted-foreground">Heap is empty</div>
        }

        const levels: HeapNode[][] = []
        let currentLevel = 0
        let nodesInLevel = 1
        let nodeIndex = 0

        while (nodeIndex < heap.length) {
            const level: HeapNode[] = []
            for (let i = 0; i < nodesInLevel && nodeIndex < heap.length; i++) {
                level.push(heap[nodeIndex])
                nodeIndex++
            }
            levels.push(level)
            nodesInLevel *= 2
            currentLevel++
        }

        return (
            <div className="relative">
                <svg width="100%" height="400" className="absolute inset-0" style={{ zIndex: 1 }}>
                    {heap.map((_, index) => {
                        if (index === 0) return null // Root has no parent

                        const parentIndex = getParentIndex(index)
                        const level = Math.floor(Math.log2(index + 1))
                        const parentLevel = Math.floor(Math.log2(parentIndex + 1))

                        // Calculate positions
                        const levelWidth = Math.pow(2, level)
                        const parentLevelWidth = Math.pow(2, parentLevel)
                        const positionInLevel = index - (Math.pow(2, level) - 1)
                        const parentPositionInLevel = parentIndex - (Math.pow(2, parentLevel) - 1)

                        const containerWidth = 600 // Approximate container width
                        const nodeSpacing = containerWidth / (levelWidth + 1)
                        const parentNodeSpacing = containerWidth / (parentLevelWidth + 1)

                        const x = (positionInLevel + 1) * nodeSpacing
                        const y = level * 80 + 50
                        const parentX = (parentPositionInLevel + 1) * parentNodeSpacing
                        const parentY = parentLevel * 80 + 50

                        const isHighlighted = heap[index].isHighlighted || heap[parentIndex].isHighlighted

                        return (
                            <line
                                key={`edge-${index}`}
                                x1={parentX}
                                y1={parentY}
                                x2={x}
                                y2={y}
                                stroke={isHighlighted ? "rgb(16, 185, 129)" : "hsl(var(--muted-foreground))"}
                                strokeWidth={isHighlighted ? "3" : "2"}
                                className="transition-all duration-300"
                            />
                        )
                    })}
                </svg>

                <div className="space-y-8 py-4 relative" style={{ zIndex: 2 }}>
                    {levels.map((level, levelIndex) => (
                        <div key={levelIndex} className="flex justify-center items-center gap-4">
                            {level.map((node, nodeIndex) => {
                                const globalIndex = Math.pow(2, levelIndex) - 1 + nodeIndex
                                return (
                                    <div
                                        key={globalIndex}
                                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold text-sm transition-all bg-background ${node.isHighlighted
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : node.isComparing
                                                    ? "border-yellow-500 bg-yellow-100 text-yellow-800"
                                                    : "border-border"
                                            }`}
                                    >
                                        {node.value}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const renderArrayRepresentation = () => {
        return (
            <div className="space-y-4">
                <div className="text-sm font-semibold">Array Representation:</div>
                <div className="flex flex-wrap gap-2">
                    {heap.map((node, index) => (
                        <div key={index} className="text-center">
                            <div className="text-xs text-muted-foreground mb-1">[{index}]</div>
                            <div
                                className={`w-12 h-12 rounded border-2 flex items-center justify-center font-semibold text-sm transition-all ${node.isHighlighted
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background"
                                    }`}
                            >
                                {node.value}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-serif">Heap Visualizer</h2>
                    <p className="text-muted-foreground">Binary heap with array representation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {heapType === "min" ? <ArrowDown className="w-5 h-5" /> : <ArrowUp className="w-5 h-5" />}
                                        {heapType.charAt(0).toUpperCase() + heapType.slice(1)}-Heap
                                    </CardTitle>
                                    <CardDescription>Size: {heap.length} nodes</CardDescription>
                                </div>
                                <Tabs value={heapType} onValueChange={(value: string) => switchHeapType(value as "min" | "max")}>
                                    <TabsList>
                                        <TabsTrigger value="min">Min-Heap</TabsTrigger>
                                        <TabsTrigger value="max">Max-Heap</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="tree">
                                <TabsList className="mb-4">
                                    <TabsTrigger value="tree">Tree View</TabsTrigger>
                                    <TabsTrigger value="array">Array View</TabsTrigger>
                                </TabsList>
                                <TabsContent value="tree" className="min-h-64">
                                    {renderHeapTree()}
                                </TabsContent>
                                <TabsContent value="array" className="min-h-64">
                                    {renderArrayRepresentation()}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Insert Element</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                type="number"
                                placeholder="Enter number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && insert()}
                            />
                            <Button onClick={insert} className="w-full" disabled={!inputValue.trim()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Insert
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Operations</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button
                                onClick={extractRoot}
                                variant="outline"
                                className="w-full bg-transparent"
                                disabled={heap.length === 0}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Extract {heapType === "min" ? "Min" : "Max"}
                            </Button>
                            <Button
                                onClick={buildHeap}
                                variant="outline"
                                className="w-full bg-transparent"
                                disabled={heap.length <= 1}
                            >
                                Build Heap
                            </Button>
                            <Button onClick={reset} variant="outline" className="w-full bg-transparent">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Heap Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div>
                                <span className="font-semibold">Type: </span>
                                <span>{heapType === "min" ? "Min-Heap (parent ≤ children)" : "Max-Heap (parent ≥ children)"}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Height: </span>
                                <span>{heap.length > 0 ? Math.floor(Math.log2(heap.length)) + 1 : 0}</span>
                            </div>
                            <div>
                                <span className="font-semibold">Root: </span>
                                <span>{heap.length > 0 ? heap[0].value : "None"}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {operation && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Last Operation</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant="outline" className="text-sm">
                                    {operation}
                                </Badge>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
