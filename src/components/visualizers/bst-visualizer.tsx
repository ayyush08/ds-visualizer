"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, RotateCcw, Search, TreePine, ArrowUp, ArrowDown, Play } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface BSTNode {
    value: number
    left: BSTNode | null
    right: BSTNode | null
    id: string
}


export function BSTVisualizer() {
    const [root, setRoot] = useState<BSTNode | null>({
        value: 50,
        id: "1",
        left: {
            value: 30,
            id: "2",
            left: { value: 20, id: "4", left: null, right: null },
            right: { value: 40, id: "5", left: null, right: null },
        },
        right: {
            value: 70,
            id: "3",
            left: { value: 60, id: "6", left: null, right: null },
            right: { value: 80, id: "7", left: null, right: null },
        },
    })
    const [newValue, setNewValue] = useState("")
    const [deleteValue, setDeleteValue] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [traversalResult, setTraversalResult] = useState<number[]>([])
    const [isTraversing, setIsTraversing] = useState(false)
    const [traversalSteps, setTraversalSteps] = useState<{ nodeId: string; value: number }[]>([])
    const [currentTraversalStep, setCurrentTraversalStep] = useState(0)
    const [traversalType, setTraversalType] = useState<string>("")

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

    const insertNode = (root: BSTNode | null, value: number): BSTNode => {
        if (!root) {
            return { value, id: Date.now().toString(), left: null, right: null }
        }

        if (value < root.value) {
            root.left = insertNode(root.left, value)
        } else if (value > root.value) {
            root.right = insertNode(root.right, value)
        }
        return root
    }

    const findNode = (root: BSTNode | null, value: number, path: string[] = []): string[] => {
        if (!root) return []
        path.push(root.id)
        if (root.value === value) return path
        if (value < root.value) return findNode(root.left, value, path)
        return findNode(root.right, value, path)
    }

    const deleteNode = (root: BSTNode | null, value: number): BSTNode | null => {
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

    const findMin = (node: BSTNode): BSTNode => {
        while (node.left) node = node.left
        return node
    }

    const findMax = (node: BSTNode): BSTNode => {
        while (node.right) node = node.right
        return node
    }

    const inorderTraversalWithSteps = (
        node: BSTNode | null,
        result: number[] = [],
        steps: { nodeId: string; value: number }[] = [],
    ): { result: number[]; steps: { nodeId: string; value: number }[] } => {
        if (node) {
            inorderTraversalWithSteps(node.left, result, steps)
            result.push(node.value)
            steps.push({ nodeId: node.id, value: node.value })
            inorderTraversalWithSteps(node.right, result, steps)
        }
        return { result, steps }
    }

    const preorderTraversal = (
        node: BSTNode | null,
        result: number[] = [],
        steps: { nodeId: string; value: number }[] = [],
    ): { result: number[]; steps: { nodeId: string; value: number }[] } => {
        if (node) {
            result.push(node.value)
            steps.push({ nodeId: node.id, value: node.value })
            preorderTraversal(node.left, result, steps)
            preorderTraversal(node.right, result, steps)
        }
        return { result, steps }
    }

    const postorderTraversal = (
        node: BSTNode | null,
        result: number[] = [],
        steps: { nodeId: string; value: number }[] = [],
    ): { result: number[]; steps: { nodeId: string; value: number }[] } => {
        if (node) {
            postorderTraversal(node.left, result, steps)
            postorderTraversal(node.right, result, steps)
            result.push(node.value)
            steps.push({ nodeId: node.id, value: node.value })
        }
        return { result, steps }
    }

    const startVisualTraversal = (steps: { nodeId: string; value: number }[], type: string, result: number[]) => {
        setTraversalSteps(steps)
        setTraversalType(type)
        setTraversalResult(result)
        setCurrentTraversalStep(0)
        setIsTraversing(true)
        setHighlightedNodes(new Set())

        // Apply first step immediately
        if (steps.length > 0) {
            setHighlightedNodes(new Set([steps[0].nodeId]))
            setCurrentTraversalStep(1)
        }

        // Start step execution
        let stepIndex = 1
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                setHighlightedNodes(new Set([steps[stepIndex].nodeId]))
                setCurrentTraversalStep(stepIndex + 1)
                stepIndex++
            } else {
                clearInterval(interval)
                setTimeout(() => {
                    setIsTraversing(false)
                    setHighlightedNodes(new Set())
                    setCurrentTraversalStep(0)
                }, 1000)
            }
        }, 800)
    }

    const handleInsert = () => {
        const value = Number.parseInt(newValue)
        if (!isNaN(value)) {
            const newRoot = root ? insertNode(JSON.parse(JSON.stringify(root)), value) : insertNode(null, value)
            setRoot(newRoot)
            const path = findNode(newRoot, value)
            animateOperation(path, `Insert ${value}`)
            setNewValue("")
        }
    }

    const handleDelete = () => {
        const value = Number.parseInt(deleteValue)
        if (!isNaN(value) && root) {
            const path = findNode(root, value)
            if (path.length > 0) {
                const newRoot = deleteNode(JSON.parse(JSON.stringify(root)), value)
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
                animateOperation(path, `Found ${value} (${path.length} steps)`)
            } else {
                animateOperation([], `${value} not found`)
            }
            setSearchValue("")
        }
    }

    const handleInorderTraversal = () => {
        if (root && !isTraversing) {
            const { result, steps } = inorderTraversalWithSteps(root)
            startVisualTraversal(steps, "Inorder", result)
        }
    }

    const handlePreorderTraversal = () => {
        if (root && !isTraversing) {
            const { result, steps } = preorderTraversal(root)
            startVisualTraversal(steps, "Preorder", result)
        }
    }

    const handlePostorderTraversal = () => {
        if (root && !isTraversing) {
            const { result, steps } = postorderTraversal(root)
            startVisualTraversal(steps, "Postorder", result)
        }
    }

    const handleFindMin = () => {
        if (root) {
            const min = findMin(root)
            const path = findNode(root, min.value)
            animateOperation(path, `Minimum: ${min.value}`)
        }
    }

    const handleFindMax = () => {
        if (root) {
            const max = findMax(root)
            const path = findNode(root, max.value)
            animateOperation(path, `Maximum: ${max.value}`)
        }
    }

    const handleReset = () => {
        setRoot({
            value: 50,
            id: "1",
            left: {
                value: 30,
                id: "2",
                left: { value: 20, id: "4", left: null, right: null },
                right: { value: 40, id: "5", left: null, right: null },
            },
            right: {
                value: 70,
                id: "3",
                left: { value: 60, id: "6", left: null, right: null },
                right: { value: 80, id: "7", left: null, right: null },
            },
        })
        setHighlightedNodes(new Set())
        setOperation(null)
        setTraversalResult([])
        setIsTraversing(false)
        setTraversalSteps([])
        setCurrentTraversalStep(0)
        setTraversalType("")
    }

    const renderTree = (node: BSTNode | null, x: number, y: number, level: number): JSX.Element[] => {
        if (!node) return []

        const elements: JSX.Element[] = []
        const spacing = Math.max(140 / (level + 1), 50)

        // Render connections to children
        if (node.left) {
            const isHighlighted = highlightedNodes.has(node.id) || highlightedNodes.has(node.left.id)
            elements.push(
                <line
                    key={`line-${node.id}-left`}
                    x1={x}
                    y1={y}
                    x2={x - spacing}
                    y2={y + 80}
                    stroke={isHighlighted ? "#10b981" : "#6b7280"}
                    strokeWidth={isHighlighted ? "4" : "3"}
                    className="transition-all duration-300"
                    opacity="0.8"
                />,
            )
        }

        if (node.right) {
            const isHighlighted = highlightedNodes.has(node.id) || highlightedNodes.has(node.right.id)
            elements.push(
                <line
                    key={`line-${node.id}-right`}
                    x1={x}
                    y1={y}
                    x2={x + spacing}
                    y2={y + 80}
                    stroke={isHighlighted ? "#10b981" : "#6b7280"}
                    strokeWidth={isHighlighted ? "4" : "3"}
                    className="transition-all duration-300"
                    opacity="0.8"
                />,
            )
        }

        // Render current node
        elements.push(
            <g key={`node-${node.id}`}>
                <circle
                    cx={x}
                    cy={y}
                    r="22"
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
                            Binary Search Tree (BST)
                        </div>
                        <Badge variant="outline">O(log n) average, O(n) worst</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tree Visualization */}
                    <div className="mb-6">
                        <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                            <svg width="100%" height="100%" viewBox="0 0 900 400" className="min-w-[900px]">
                                {root && renderTree(root, 450, 50, 0)}
                            </svg>
                        </div>

                        {(operation || isTraversing) && (
                            <div className="text-center mt-4 space-y-2">
                                <Badge variant="secondary" className="animate-pulse">
                                    {isTraversing
                                        ? `${traversalType} Traversal (Step ${currentTraversalStep}/${traversalSteps.length})`
                                        : operation}
                                </Badge>
                                {isTraversing && (
                                    <div className="text-sm text-muted-foreground">
                                        Current: {traversalSteps[currentTraversalStep - 1]?.value || "Starting..."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Insert Node</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value to insert"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleInsert()}
                                />
                                <Button onClick={handleInsert} disabled={isAnimating || isTraversing} size="sm">
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
                                <Button onClick={handleDelete} disabled={isAnimating || isTraversing} size="sm" variant="outline">
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
                                <Button onClick={handleSearch} disabled={isAnimating || isTraversing} size="sm" variant="outline">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* BST Operations */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                        <Button onClick={handleFindMin} disabled={isAnimating || isTraversing} size="sm" variant="outline">
                            <ArrowDown className="w-4 h-4 mr-2" />
                            Find Min
                        </Button>
                        <Button onClick={handleFindMax} disabled={isAnimating || isTraversing} size="sm" variant="outline">
                            <ArrowUp className="w-4 h-4 mr-2" />
                            Find Max
                        </Button>
                        <Button
                            onClick={handlePreorderTraversal}
                            disabled={isAnimating || isTraversing}
                            size="sm"
                            variant="outline"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Preorder
                        </Button>
                        <Button onClick={handleInorderTraversal} disabled={isAnimating || isTraversing} size="sm" variant="outline">
                            <Play className="w-4 h-4 mr-2" />
                            Inorder
                        </Button>
                        <Button
                            onClick={handlePostorderTraversal}
                            disabled={isAnimating || isTraversing}
                            size="sm"
                            variant="outline"
                        >
                            <Play className="w-4 h-4 mr-2" />
                            Postorder
                        </Button>
                    </div>

                    <div className="flex justify-center mb-4">
                        <Button onClick={handleReset} variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                        </Button>
                    </div>

                    {/* BST Properties */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">BST Properties</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Left subtree values &lt; root value</li>
                            <li>• Right subtree values &gt; root value</li>
                            <li>• Inorder traversal gives sorted sequence</li>
                            <li>• Search, insert, delete: O(log n) average case</li>
                        </ul>
                    </div>

                    {/* Traversal Result Display */}
                    {traversalResult.length > 0 && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                            <h4 className="font-semibold mb-2">{traversalType} Traversal Result</h4>
                            <div className="text-sm font-mono">[{traversalResult.join(", ")}]</div>
                            {traversalType === "Inorder" && (
                                <div className="text-xs text-muted-foreground mt-1">✓ Sorted order (BST property)</div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
