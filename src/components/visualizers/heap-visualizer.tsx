"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {  Plus, Trash2, RotateCcw, ArrowUp, ArrowDown } from "lucide-react"
import type { JSX } from "react/jsx-runtime" // Import JSX to fix the undeclared variable error
import { toast } from "sonner"

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

    const shouldSwap = useCallback((parentValue: number, childValue: number) => {
        return heapType === "min" ? parentValue > childValue : parentValue < childValue
    }, [heapType])

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
        [ shouldSwap],
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
        [shouldSwap],
    )

    const insert = () => {
        const value = Number.parseInt(inputValue)
        if (isNaN(value)) {
            toast.error("Invalid Input",{
                description: "Please enter a valid number",
            })
            return
        }

        clearHighlights()
        const newNode: HeapNode = { value, isHighlighted: true }
        const newHeap = [...heap, newNode]

        const finalHeap = heapifyUp(newHeap.length - 1, newHeap)
        setHeap(finalHeap)
        setOperation(`Inserted ${value} into ${heapType}-heap`)
        setInputValue("")

        toast.success("Inserted Successfully",{
            description: `Added ${value} to the ${heapType}-heap`,
        })
    }

    const extractRoot = () => {
        if (heap.length === 0) {
            toast.error("Empty Heap",{
                description: "Cannot extract from an empty heap",
            })
            return
        }

        clearHighlights()
        const root = heap[0].value

        if (heap.length === 1) {
            setHeap([])
            setOperation(`Extracted root ${root} - heap is now empty`)
            toast.success("Root Extracted",{
                description: `Removed ${root} - heap is now empty`,
            })
            return
        }

        const newHeap = [...heap]
        newHeap[0] = { ...newHeap[newHeap.length - 1], isHighlighted: true }
        newHeap.pop()

        const finalHeap = heapifyDown(0, newHeap)
        setHeap(finalHeap)
        setOperation(`Extracted root ${root} from ${heapType}-heap`)

        toast.success("Root Extracted",{
            description: `Removed ${root} from the ${heapType}-heap`,
        })
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
            setTimeout(() => {
                const newHeap = [...heap]
                for (let i = Math.floor(newHeap.length / 2) - 1; i >= 0; i--) {
                    heapifyDown(i, newHeap)
                }
                setHeap(newHeap)
                setOperation(`Converted to ${newType}-heap`)
            }, 100)
        }
    }

    const renderHeapTree = () => {
        if (heap.length === 0) {
            return <div className="flex items-center justify-center h-64 text-muted-foreground">Heap is empty</div>
        }

        const renderHeapNode = (index: number, x: number, y: number, level: number): JSX.Element[] => {
            if (index >= heap.length) return []

            const elements: JSX.Element[] = []
            const spacing = Math.max(120 / (level + 1), 40)
            const leftChildIndex = getLeftChildIndex(index)
            const rightChildIndex = getRightChildIndex(index)

            // Render connections to children (like BST)
            if (leftChildIndex < heap.length) {
                const isHighlighted = heap[index].isHighlighted || heap[leftChildIndex].isHighlighted
                elements.push(
                    <line
                        key={`line-${index}-left`}
                        x1={x}
                        y1={y}
                        x2={x - spacing}
                        y2={y + 70}
                        stroke={isHighlighted ? "#10b981" : "#6b7280"}
                        strokeWidth={isHighlighted ? "4" : "3"}
                        className="transition-all duration-300"
                        opacity="0.8"
                    />,
                )
            }

            if (rightChildIndex < heap.length) {
                const isHighlighted = heap[index].isHighlighted || heap[rightChildIndex].isHighlighted
                elements.push(
                    <line
                        key={`line-${index}-right`}
                        x1={x}
                        y1={y}
                        x2={x + spacing}
                        y2={y + 70}
                        stroke={isHighlighted ? "#10b981" : "#6b7280"}
                        strokeWidth={isHighlighted ? "4" : "3"}
                        className="transition-all duration-300"
                        opacity="0.8"
                    />,
                )
            }

            // Render current node
            const node = heap[index]
            elements.push(
                <g key={`node-${index}`}>
                    <circle
                        cx={x}
                        cy={y}
                        r="24"
                        className={`transition-all duration-300 ${node.isHighlighted
                                ? "fill-primary stroke-primary-foreground stroke-2"
                                : node.isComparing
                                    ? "fill-yellow-100 stroke-yellow-500 stroke-2"
                                    : "fill-card stroke-border stroke-2"
                            }`}
                    />
                    <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        className={`text-sm font-mono font-bold ${node.isHighlighted ? "fill-primary-foreground" : node.isComparing ? "fill-yellow-800" : "fill-foreground"
                            }`}
                    >
                        {node.value}
                    </text>
                </g>,
            )

            // Render children recursively
            if (leftChildIndex < heap.length) {
                elements.push(...renderHeapNode(leftChildIndex, x - spacing, y + 70, level + 1))
            }
            if (rightChildIndex < heap.length) {
                elements.push(...renderHeapNode(rightChildIndex, x + spacing, y + 70, level + 1))
            }

            return elements
        }

        return (
            <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                <svg width="100%" height="100%" viewBox="0 0 800 400" className="min-w-[800px]">
                    {heap.length > 0 && renderHeapNode(0, 400, 50, 0)}
                </svg>
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
                                <Tabs value={heapType} onValueChange={(value) => switchHeapType(value as "min" | "max")}>
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
