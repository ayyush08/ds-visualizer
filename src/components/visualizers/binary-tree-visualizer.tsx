"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, RotateCcw, Search, TreePine } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface TreeNode {
    value: number
    left: TreeNode | null
    right: TreeNode | null
    id: string
}



export function BinaryTreeVisualizer() {
    const [root, setRoot] = useState<TreeNode | null>({
        value: 10,
        id: "1",
        left: {
            value: 5,
            id: "2",
            left: { value: 3, id: "4", left: null, right: null },
            right: { value: 7, id: "5", left: null, right: null },
        },
        right: {
            value: 15,
            id: "3",
            left: { value: 12, id: "6", left: null, right: null },
            right: { value: 18, id: "7", left: null, right: null },
        },
    })
    const [newValue, setNewValue] = useState("")
    const [deleteValue, setDeleteValue] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    const animateOperation = (nodeIds: string[], op: string) => {
        setOperation(op)
        setHighlightedNodes(new Set(nodeIds))
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightedNodes(new Set())
            setIsAnimating(false)
            setOperation(null)
        }, 1500)
    }

    const insertNode = (root: TreeNode | null, value: number): TreeNode => {
        if (!root) {
            return { value, id: Date.now().toString(), left: null, right: null }
        }

        if (value < root.value) {
            root.left = insertNode(root.left, value)
        } else {
            root.right = insertNode(root.right, value)
        }
        return root
    }

    const findNode = (root: TreeNode | null, value: number, path: string[] = []): string[] => {
        if (!root) return []
        path.push(root.id)
        if (root.value === value) return path
        if (value < root.value) return findNode(root.left, value, path)
        return findNode(root.right, value, path)
    }

    const deleteNode = (root: TreeNode | null, value: number): TreeNode | null => {
        if (!root) return null

        if (value < root.value) {
            root.left = deleteNode(root.left, value)
        } else if (value > root.value) {
            root.right = deleteNode(root.right, value)
        } else {
            if (!root.left) return root.right
            if (!root.right) return root.left

            const minRight = findMin(root.right)
            root.value = minRight.value
            root.right = deleteNode(root.right, minRight.value)
        }
        return root
    }

    const findMin = (node: TreeNode): TreeNode => {
        while (node.left) node = node.left
        return node
    }

    const handleInsert = () => {
        const value = Number.parseInt(newValue)
        if (!isNaN(value)) {
            const newRoot = root ? insertNode({ ...root }, value) : insertNode(null, value)
            setRoot(newRoot)
            animateOperation([newRoot?.id || ""], `Insert ${value}`)
            setNewValue("")
        }
    }

    const handleDelete = () => {
        const value = Number.parseInt(deleteValue)
        if (!isNaN(value) && root) {
            const path = findNode(root, value)
            if (path.length > 0) {
                const newRoot = deleteNode({ ...root }, value)
                setRoot(newRoot)
                animateOperation(path, `Delete ${value}`)
            } else {
                animateOperation([], `${value} not found`)
            }
            setDeleteValue("")
        }
    }

    const handleSearch = () => {
        const value = Number.parseInt(searchValue)
        if (!isNaN(value) && root) {
            const path = findNode(root, value)
            if (path.length > 0) {
                animateOperation(path, `Found ${value}`)
            } else {
                animateOperation([], `${value} not found`)
            }
            setSearchValue("")
        }
    }

    const handleReset = () => {
        setRoot({
            value: 10,
            id: "1",
            left: {
                value: 5,
                id: "2",
                left: { value: 3, id: "4", left: null, right: null },
                right: { value: 7, id: "5", left: null, right: null },
            },
            right: {
                value: 15,
                id: "3",
                left: { value: 12, id: "6", left: null, right: null },
                right: { value: 18, id: "7", left: null, right: null },
            },
        })
        setHighlightedNodes(new Set())
        setOperation(null)
    }

    const renderTree = (node: TreeNode | null, x: number, y: number, level: number): JSX.Element[] => {
        if (!node) return []

        const elements: JSX.Element[] = []
        const spacing = Math.max(120 / (level + 1), 40)

        if (node.left) {
            const isHighlighted = highlightedNodes.has(node.id) || highlightedNodes.has(node.left.id)
            elements.push(
                <g key={`line-${node.id}-left`}>
                    {/* Glow effect for highlighted edges */}
                    {isHighlighted && (
                        <line
                            x1={x}
                            y1={y}
                            x2={x - spacing}
                            y2={y + 80}
                            stroke="rgb(16, 185, 129)"
                            strokeWidth="6"
                            className="opacity-60"
                            style={{ filter: "blur(2px)" }}
                        />
                    )}
                    <line
                        x1={x}
                        y1={y}
                        x2={x - spacing}
                        y2={y + 80}
                        stroke={isHighlighted ? "rgb(16, 185, 129)" : "currentColor"}
                        strokeWidth={isHighlighted ? "3" : "2"}
                        className={`transition-all duration-300 ${isHighlighted ? "text-emerald-500" : "text-muted-foreground"}`}
                    />
                </g>,
            )
        }

        if (node.right) {
            const isHighlighted = highlightedNodes.has(node.id) || highlightedNodes.has(node.right.id)
            elements.push(
                <g key={`line-${node.id}-right`}>
                    {/* Glow effect for highlighted edges */}
                    {isHighlighted && (
                        <line
                            x1={x}
                            y1={y}
                            x2={x + spacing}
                            y2={y + 80}
                            stroke="rgb(16, 185, 129)"
                            strokeWidth="6"
                            className="opacity-60"
                            style={{ filter: "blur(2px)" }}
                        />
                    )}
                    <line
                        x1={x}
                        y1={y}
                        x2={x + spacing}
                        y2={y + 80}
                        stroke={isHighlighted ? "rgb(16, 185, 129)" : "currentColor"}
                        strokeWidth={isHighlighted ? "3" : "2"}
                        className={`transition-all duration-300 ${isHighlighted ? "text-emerald-500" : "text-muted-foreground"}`}
                    />
                </g>,
            )
        }

        // Render current node
        elements.push(
            <g key={`node-${node.id}`}>
                <circle
                    cx={x}
                    cy={y}
                    r="20"
                    className={`transition-all duration-300 ${highlightedNodes.has(node.id)
                            ? "fill-primary stroke-primary-foreground stroke-2"
                            : "fill-card stroke-border stroke-2"
                        }`}
                />
                <text
                    x={x}
                    y={y + 5}
                    textAnchor="middle"
                    className={`text-sm font-mono font-bold ${highlightedNodes.has(node.id) ? "fill-primary-foreground" : "fill-foreground"
                        }`}
                >
                    {node.value}
                </text>
            </g>,
        )

        // Render children
        if (node.left) {
            elements.push(...renderTree(node.left, x - spacing, y + 80, level + 1))
        }
        if (node.right) {
            elements.push(...renderTree(node.right, x + spacing, y + 80, level + 1))
        }

        return elements
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TreePine className="w-5 h-5" />
                            Binary Tree Visualizer
                        </div>
                        <Badge variant="outline">O(log n) balanced, O(n) worst</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tree Visualization */}
                    <div className="mb-6">
                        <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                            <svg width="100%" height="100%" viewBox="0 0 800 400" className="min-w-[800px]">
                                {root && renderTree(root, 400, 50, 0)}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Insert Node</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value to insert"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleInsert()}
                                />
                                <Button onClick={handleInsert} disabled={isAnimating} size="sm">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Delete Node</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value to delete"
                                    value={deleteValue}
                                    onChange={(e) => setDeleteValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleDelete()}
                                />
                                <Button onClick={handleDelete} disabled={isAnimating} size="sm" variant="outline">
                                    <Minus className="w-4 h-4" />
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
                                <Button onClick={handleSearch} disabled={isAnimating} size="sm" variant="outline">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-4">
                        <Button onClick={handleReset} variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Tree
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
