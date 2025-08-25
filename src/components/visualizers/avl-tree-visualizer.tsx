"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, RotateCcw, Search, TreePine, RotateCw } from "lucide-react"
import type { JSX } from "react/jsx-runtime"

interface AVLNode {
    value: number
    left: AVLNode | null
    right: AVLNode | null
    height: number
    id: string
}

export function AVLTreeVisualizer() {
    const [root, setRoot] = useState<AVLNode | null>({
        value: 30,
        height: 3,
        id: "1",
        left: {
            value: 20,
            height: 2,
            id: "2",
            left: { value: 10, height: 1, id: "4", left: null, right: null },
            right: { value: 25, height: 1, id: "5", left: null, right: null },
        },
        right: {
            value: 40,
            height: 2,
            id: "3",
            left: { value: 35, height: 1, id: "6", left: null, right: null },
            right: { value: 50, height: 1, id: "7", left: null, right: null },
        },
    })
    const [newValue, setNewValue] = useState("")
    const [deleteValue, setDeleteValue] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [rotationInfo, setRotationInfo] = useState<string | null>(null)

    const animateOperation = (nodeIds: string[], op: string, rotation?: string) => {
        setOperation(op)
        setRotationInfo(rotation || null)
        setHighlightedNodes(new Set(nodeIds))
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightedNodes(new Set())
            setIsAnimating(false)
            setOperation(null)
            setRotationInfo(null)
        }, 2000)
    }

    const getHeight = (node: AVLNode | null): number => {
        return node ? node.height : 0
    }

    const getBalance = (node: AVLNode | null): number => {
        return node ? getHeight(node.left) - getHeight(node.right) : 0
    }

    const updateHeight = (node: AVLNode): void => {
        node.height = Math.max(getHeight(node.left), getHeight(node.right)) + 1
    }

    const rotateRight = (y: AVLNode): AVLNode => {
        const x = y.left!
        const T2 = x.right

        x.right = y
        y.left = T2

        updateHeight(y)
        updateHeight(x)

        return x
    }

    const rotateLeft = (x: AVLNode): AVLNode => {
        const y = x.right!
        const T2 = y.left

        y.left = x
        x.right = T2

        updateHeight(x)
        updateHeight(y)

        return y
    }

    const insertNode = (node: AVLNode | null, value: number): AVLNode => {
        // Standard BST insertion
        if (!node) {
            return { value, height: 1, id: Date.now().toString(), left: null, right: null }
        }

        if (value < node.value) {
            node.left = insertNode(node.left, value)
        } else if (value > node.value) {
            node.right = insertNode(node.right, value)
        } else {
            return node // Duplicate values not allowed
        }

        // Update height
        updateHeight(node)

        // Get balance factor
        const balance = getBalance(node)

        // Left Left Case
        if (balance > 1 && value < node.left!.value) {
            return rotateRight(node)
        }

        // Right Right Case
        if (balance < -1 && value > node.right!.value) {
            return rotateLeft(node)
        }

        // Left Right Case
        if (balance > 1 && value > node.left!.value) {
            node.left = rotateLeft(node.left!)
            return rotateRight(node)
        }

        // Right Left Case
        if (balance < -1 && value < node.right!.value) {
            node.right = rotateRight(node.right!)
            return rotateLeft(node)
        }

        return node
    }

    const findNode = (root: AVLNode | null, value: number, path: string[] = []): string[] => {
        if (!root) return []
        path.push(root.id)
        if (root.value === value) return path
        if (value < root.value) return findNode(root.left, value, path)
        return findNode(root.right, value, path)
    }

    const deleteNode = (root: AVLNode | null, value: number): AVLNode | null => {
        if (!root) return null

        if (value < root.value) {
            root.left = deleteNode(root.left, value)
        } else if (value > root.value) {
            root.right = deleteNode(root.right, value)
        } else {
            if (!root.left || !root.right) {
                const temp = root.left || root.right
                if (!temp) {
                    return null
                } else {
                    return temp
                }
            } else {
                const temp = findMin(root.right)
                root.value = temp.value
                root.right = deleteNode(root.right, temp.value)
            }
        }

        updateHeight(root)
        const balance = getBalance(root)

        // Left Left Case
        if (balance > 1 && getBalance(root.left) >= 0) {
            return rotateRight(root)
        }

        // Left Right Case
        if (balance > 1 && getBalance(root.left) < 0) {
            root.left = rotateLeft(root.left!)
            return rotateRight(root)
        }

        // Right Right Case
        if (balance < -1 && getBalance(root.right) <= 0) {
            return rotateLeft(root)
        }

        // Right Left Case
        if (balance < -1 && getBalance(root.right) > 0) {
            root.right = rotateRight(root.right!)
            return rotateLeft(root)
        }

        return root
    }

    const findMin = (node: AVLNode): AVLNode => {
        while (node.left) node = node.left
        return node
    }

    const handleInsert = () => {
        const value = Number.parseInt(newValue)
        if (!isNaN(value)) {
            const newRoot = insertNode(root ? JSON.parse(JSON.stringify(root)) : null, value)
            setRoot(newRoot)
            const path = findNode(newRoot, value)
            const balance = getBalance(newRoot)
            const rotationType = Math.abs(balance) > 1 ? "Rotation performed" : "No rotation needed"
            animateOperation(path, `Insert ${value}`, rotationType)
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
                animateOperation(path, `Delete ${value}`, "Tree rebalanced")
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

    const handleReset = () => {
        setRoot({
            value: 30,
            height: 3,
            id: "1",
            left: {
                value: 20,
                height: 2,
                id: "2",
                left: { value: 10, height: 1, id: "4", left: null, right: null },
                right: { value: 25, height: 1, id: "5", left: null, right: null },
            },
            right: {
                value: 40,
                height: 2,
                id: "3",
                left: { value: 35, height: 1, id: "6", left: null, right: null },
                right: { value: 50, height: 1, id: "7", left: null, right: null },
            },
        })
        setHighlightedNodes(new Set())
        setOperation(null)
        setRotationInfo(null)
    }

    const renderTree = (node: AVLNode | null, x: number, y: number, level: number): JSX.Element[] => {
        if (!node) return []

        const elements: JSX.Element[] = []
        const spacing = Math.max(140 / (level + 1), 50)
        const balance = getBalance(node)

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
                    stroke={isHighlighted ? "rgb(16, 185, 129)" : "hsl(var(--muted-foreground))"}
                    strokeWidth={isHighlighted ? "3" : "2"}
                    className="transition-all duration-300"
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
                    stroke={isHighlighted ? "rgb(16, 185, 129)" : "hsl(var(--muted-foreground))"}
                    strokeWidth={isHighlighted ? "3" : "2"}
                    className="transition-all duration-300"
                />,
            )
        }

        // Render current node
        elements.push(
            <g key={`node-${node.id}`}>
                <circle
                    cx={x}
                    cy={y}
                    r="25"
                    className={`transition-all duration-300 ${highlightedNodes.has(node.id)
                            ? "fill-primary stroke-primary-foreground stroke-2"
                            : Math.abs(balance) > 1
                                ? "fill-destructive stroke-destructive-foreground stroke-2"
                                : "fill-card stroke-border stroke-2"
                        }`}
                />
                <text
                    x={x}
                    y={y + 2}
                    textAnchor="middle"
                    className={`text-sm font-mono font-bold ${highlightedNodes.has(node.id)
                            ? "fill-primary-foreground"
                            : Math.abs(balance) > 1
                                ? "fill-destructive-foreground"
                                : "fill-foreground"
                        }`}
                >
                    {node.value}
                </text>
                <text x={x} y={y - 35} textAnchor="middle" className="text-xs fill-muted-foreground">
                    h:{node.height} b:{balance}
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
                            AVL Tree (Self-Balancing)
                        </div>
                        <Badge variant="outline">O(log n) guaranteed</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Tree Visualization */}
                    <div className="mb-6">
                        <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                            <svg width="100%" height="100%" viewBox="0 0 900 400" className="min-w-[900px]">
                                {root && renderTree(root, 450, 70, 0)}
                            </svg>
                        </div>

                        <div className="text-center mt-4 space-y-2">
                            {operation && (
                                <Badge variant="secondary" className="animate-pulse">
                                    {operation}
                                </Badge>
                            )}
                            {rotationInfo && (
                                <Badge variant="outline" className="animate-pulse">
                                    <RotateCw className="w-3 h-3 mr-1" />
                                    {rotationInfo}
                                </Badge>
                            )}
                        </div>
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

                    <div className="flex justify-center mb-4">
                        <Button onClick={handleReset} variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Tree
                        </Button>
                    </div>

                    {/* AVL Properties */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">AVL Tree Properties</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Height difference between left and right subtrees ≤ 1</li>
                            <li>• Automatically rebalances after insertions/deletions</li>
                            <li>• Guarantees O(log n) time complexity for all operations</li>
                            <li>• h: height, b: balance factor (left height - right height)</li>
                            <li>• Red nodes indicate imbalance (|balance| &gt; 1)</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
