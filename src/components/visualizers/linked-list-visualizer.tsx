"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Plus, Minus, RotateCcw, Search } from "lucide-react"

interface ListNode {
    value: number
    id: string
}


export function LinkedListVisualizer() {
    const [nodes, setNodes] = useState<ListNode[]>([
        { value: 3, id: "1" },
        { value: 7, id: "2" },
        { value: 1, id: "3" },
        { value: 5, id: "4" },
    ])
    const [newValue, setNewValue] = useState("")
    const [insertIndex, setInsertIndex] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    const animateOperation = (index: number | null, op: string) => {
        setOperation(op)
        setHighlightIndex(index)
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightIndex(null)
            setIsAnimating(false)
            setOperation(null)
        }, 1000)
    }

    const handleInsert = () => {
        const value = Number.parseInt(newValue)
        const index = Number.parseInt(insertIndex)
        if (!isNaN(value) && index >= 0 && index <= nodes.length) {
            const newNodes = [...nodes]
            newNodes.splice(index, 0, { value, id: Date.now().toString() })
            setNodes(newNodes)
            animateOperation(index, `Insert ${value} at position ${index}`)
            setNewValue("")
            setInsertIndex("")
        }
    }

    const handleDelete = (index: number) => {
        const newNodes = [...nodes]
        const deletedNode = newNodes.splice(index, 1)[0]
        setNodes(newNodes)
        animateOperation(index, `Delete ${deletedNode.value} from position ${index}`)
    }

    const handleSearch = () => {
        const value = Number.parseInt(searchValue)
        if (!isNaN(value)) {
            const index = nodes.findIndex((node) => node.value === value)
            if (index !== -1) {
                animateOperation(index, `Found ${value} at position ${index}`)
            } else {
                animateOperation(null, `${value} not found in list`)
            }
            setSearchValue("")
        }
    }

    const handleReset = () => {
        setNodes([
            { value: 3, id: "1" },
            { value: 7, id: "2" },
            { value: 1, id: "3" },
            { value: 5, id: "4" },
        ])
        setHighlightIndex(null)
        setOperation(null)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Linked List Visualizer
                        <Badge variant="outline">O(n) Search, O(1) Insert/Delete</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Linked List Visualization */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 mb-4 overflow-x-auto pb-4">
                            {nodes.length === 0 ? (
                                <div className="text-center text-muted-foreground">
                                    <div className="w-20 h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-sm">
                                        Empty
                                    </div>
                                </div>
                            ) : (
                                nodes.map((node, index) => (
                                    <div key={node.id} className="flex items-center">
                                        <div
                                            className={`
                        relative bg-card border-2 rounded-lg p-3 transition-all duration-300
                        ${highlightIndex === index
                                                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110"
                                                    : "border-border hover:border-primary/50"
                                                }
                      `}
                                        >
                                            <div className="text-center">
                                                <div className="font-mono font-bold text-lg">{node.value}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Node {index}</div>
                                            </div>

                                            {/* Pointer visualization */}
                                            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-secondary rounded-full border-2 border-background flex items-center justify-center">
                                                <div className="w-1 h-1 bg-secondary-foreground rounded-full"></div>
                                            </div>

                                            {/* Delete button */}
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute -top-2 -right-2 w-6 h-6 p-0"
                                                onClick={() => handleDelete(index)}
                                                disabled={isAnimating}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                        </div>

                                        {/* Arrow to next node */}
                                        {index < nodes.length - 1 && <ArrowRight className="w-6 h-6 text-muted-foreground mx-2" />}

                                        {/* NULL pointer for last node */}
                                        {index === nodes.length - 1 && <div className="ml-2 text-muted-foreground text-sm">NULL</div>}
                                    </div>
                                ))
                            )}
                        </div>

                        {operation && (
                            <div className="text-center">
                                <Badge variant="secondary" className="animate-pulse">
                                    {operation}
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Insert Node</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    placeholder="Position"
                                    value={insertIndex}
                                    onChange={(e) => setInsertIndex(e.target.value)}
                                    className="w-20"
                                />
                                <Button onClick={handleInsert} disabled={isAnimating} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Search Node</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value to find"
                                    value={searchValue}
                                    onChange={(e) => setSearchValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                                />
                                <Button onClick={handleSearch} disabled={isAnimating} size="sm">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Operations</h4>
                            <Button onClick={handleReset} variant="outline" size="sm">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    </div>

                    {/* List Info */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Length:</span> {nodes.length}
                            </div>
                            <div>
                                <span className="font-semibold">Head:</span> {nodes.length > 0 ? nodes[0].value : "None"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
