"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, RotateCcw, Search, TreePine, Play } from "lucide-react"
import { toast } from "sonner"
import type { JSX } from "react/jsx-runtime"

interface TreeNode {
    value: number
    left: TreeNode | null
    right: TreeNode | null
    id: string
}



export function BinaryTreeVisualizer() {
    const [root, setRoot] = useState<TreeNode | null>({
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
    const [selectedParent, setSelectedParent] = useState<string>("")
    const [insertPosition, setInsertPosition] = useState<"left" | "right">("left")
    const [deleteValue, setDeleteValue] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    const [traversalSteps, setTraversalSteps] = useState<string[]>([])
    const [currentTraversalStep, setCurrentTraversalStep] = useState(0)
    const [isTraversing, setIsTraversing] = useState(false)
    const [traversalType, setTraversalType] = useState<"preorder" | "inorder" | "postorder">("inorder")
    const [traversalResult, setTraversalResult] = useState<number[]>([])

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

    const findNodeById = (root: TreeNode | null, targetValue: number): TreeNode | null => {
        if (!root) return null
        if (root.value === targetValue) return root
        const leftResult = findNodeById(root.left, targetValue)
        if (leftResult) return leftResult
        return findNodeById(root.right, targetValue)
    }

    const insertNodeAtPosition = (
        root: TreeNode | null,
        parentValue: number,
        newValue: number,
        position: "left" | "right",
    ): TreeNode | null => {
        if (!root) return null

        if (root.value === parentValue) {
            const newNode = { value: newValue, id: Date.now().toString(), left: null, right: null }
            if (position === "left") {
                if (root.left) return null // Position occupied
                root.left = newNode
            } else {
                if (root.right) return null // Position occupied
                root.right = newNode
            }
            return root
        }

        insertNodeAtPosition(root.left, parentValue, newValue, position)
        insertNodeAtPosition(root.right, parentValue, newValue, position)
        return root
    }

    const findNodePath = (root: TreeNode | null, value: number, path: string[] = []): string[] => {
        if (!root) return []
        path.push(root.id)
        if (root.value === value) return [...path]

        const leftPath = findNodePath(root.left, value, [...path])
        if (leftPath.length > path.length) return leftPath

        const rightPath = findNodePath(root.right, value, [...path])
        if (rightPath.length > path.length) return rightPath

        return []
    }

    const deleteNodeByValue = (root: TreeNode | null, value: number): TreeNode | null => {
        if (!root) return null

        // If this is the node to delete
        if (root.value === value) {
            // If no children, return null
            if (!root.left && !root.right) return null
            // If only right child, return right child
            if (!root.left) return root.right
            // If only left child, return left child
            if (!root.right) return root.left

            // If both children exist, replace with leftmost node of right subtree
            let successor = root.right
            while (successor.left) {
                successor = successor.left
            }
            root.value = successor.value
            root.right = deleteNodeByValue(root.right, successor.value)
            return root
        }

        root.left = deleteNodeByValue(root.left, value)
        root.right = deleteNodeByValue(root.right, value)
        return root
    }

    const preorderTraversalWithSteps = (
        node: TreeNode | null,
        result: number[] = [],
        steps: { nodeId: string; value: number }[] = [],
    ): { result: number[]; steps: { nodeId: string; value: number }[] } => {
        if (node) {
            result.push(node.value)
            steps.push({ nodeId: node.id, value: node.value })
            preorderTraversalWithSteps(node.left, result, steps)
            preorderTraversalWithSteps(node.right, result, steps)
        }
        return { result, steps }
    }

    const inorderTraversalWithSteps = (
        node: TreeNode | null,
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

    const postorderTraversalWithSteps = (
        node: TreeNode | null,
        result: number[] = [],
        steps: { nodeId: string; value: number }[] = [],
    ): { result: number[]; steps: { nodeId: string; value: number }[] } => {
        if (node) {
            postorderTraversalWithSteps(node.left, result, steps)
            postorderTraversalWithSteps(node.right, result, steps)
            result.push(node.value)
            steps.push({ nodeId: node.id, value: node.value })
        }
        return { result, steps }
    }

    const startVisualTraversal = (steps: { nodeId: string; value: number }[], type: string, result: number[]) => {
        setTraversalSteps(steps.map((s) => s.nodeId))
        setTraversalType(type as "preorder" | "inorder" | "postorder")
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

        if (isNaN(value)) {
            // toast({ title: "Invalid input", description: "Please enter a valid number", variant: "destructive" })
            toast.error('Invalid input', { description: 'Please enter a valid number'})
            return
        }

        if (!selectedParent || selectedParent === "root") {
            if (!root) {
                // Create root node
                const newRoot = { value, id: Date.now().toString(), left: null, right: null }
                setRoot(newRoot)
                toast.success('Success', { description: `Created root node with value ${value}`})
                setNewValue("")
                setSelectedParent("")
                return
            } else {
                toast.error('Root exists', { description: 'Root already exists. Select a parent node to insert.'})
                return
            }
        }

        const parent = Number.parseInt(selectedParent)
        if (isNaN(parent)) {
            // toast({ title: "Invalid parent", description: "Please select a valid parent node", variant: "destructive" })
            toast.error('Invalid parent', { description: 'Please select a valid parent node'})
            return
        }

        const parentNode = findNodeById(root, parent)
        if (!parentNode) {
            // toast({
            //     title: "Parent not found",
            //     description: `Node with value ${parent} does not exist`,
            //     variant: "destructive",
            // })
            toast.error('Parent not found', { description: `Node with value ${parent} does not exist`})
            return
        }

        const deepClone = (node: TreeNode | null): TreeNode | null => {
            if (!node) return null
            return {
                value: node.value,
                id: node.id,
                left: deepClone(node.left),
                right: deepClone(node.right),
            }
        }
        const newRoot = deepClone(root)
        const result = insertNodeAtPosition(newRoot, parent, value, insertPosition)

        if (result) {
            setRoot(newRoot)
            animateOperation([parentNode.id], `Insert ${value} as ${insertPosition} child of ${parent}`)
            toast.success('Success', { description: `Inserted ${value} as ${insertPosition} child of ${parent}` })
            setNewValue("")
            setSelectedParent("")
        } else {
            toast.error('Position occupied', { description: `The ${insertPosition} child of node ${parent} is already occupied`})
        }
    }

    const handleDelete = () => {
        const value = Number.parseInt(deleteValue)
        if (isNaN(value)) {
            toast.error('Invalid input', { description: 'Please enter a valid number' })
            return
        }

        if (!root) {
            toast.error('Empty tree', { description: 'Cannot delete from empty tree' })
            return
        }

        const path = findNodePath(root, value)
        if (path.length === 0) {
            toast.error('Node not found', { description: `Value ${value} does not exist in tree` })
            return
        }

        const newRoot = deleteNodeByValue({ ...root }, value)
        setRoot(newRoot)
        animateOperation(path, `Delete ${value}`)
        toast.success('Success', { description: `Deleted node with value ${value}` })
        setDeleteValue("")
    }

    const handleSearch = () => {
        const value = Number.parseInt(searchValue)
        if (isNaN(value)) {
            toast.error('Invalid input', { description: 'Please enter a valid number' })
            return
        }

        if (!root) {
            toast.error('Empty tree', { description: 'Cannot search in empty tree' })
            return
        }

        const path = findNodePath(root, value)
        if (path.length > 0) {
            animateOperation(path, `Found ${value}`)
            toast.success('Found', { description: `Value ${value} found in tree` })
        } else {
            animateOperation([], `${value} not found`)
            toast.error('Not found', { description: `Value ${value} not found in tree` })
        }
        setSearchValue("")
    }

    const handlePreorderTraversal = () => {
        if (root && !isTraversing) {
            const { result, steps } = preorderTraversalWithSteps(root)
            startVisualTraversal(steps, "Preorder", result)
        }
    }

    const handleInorderTraversal = () => {
        if (root && !isTraversing) {
            const { result, steps } = inorderTraversalWithSteps(root)
            startVisualTraversal(steps, "Inorder", result)
        }
    }

    const handlePostorderTraversal = () => {
        if (root && !isTraversing) {
            const { result, steps } = postorderTraversalWithSteps(root)
            startVisualTraversal(steps, "Postorder", result)
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
        setTraversalSteps([])
        setCurrentTraversalStep(0)
        setIsTraversing(false)
        setTraversalResult([])
        setSelectedParent("")
        toast.message('Reset', { description: 'Tree reset to default state' })
    }

    const renderTree = (node: TreeNode | null, x: number, y: number, level: number): JSX.Element[] => {
        if (!node) return []

        const elements: JSX.Element[] = []
        const spacing = Math.max(140 / (level + 1), 50)

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

    const getTreeHeight = (node: TreeNode | null): number => {
        if (!node) return 0
        return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right))
    }

    const getNodeCount = (node: TreeNode | null): number => {
        if (!node) return 0
        return 1 + getNodeCount(node.left) + getNodeCount(node.right)
    }

    const getLeafCount = (node: TreeNode | null): number => {
        if (!node) return 0
        if (!node.left && !node.right) return 1
        return getLeafCount(node.left) + getLeafCount(node.right)
    }

    const getAllNodeValues = (node: TreeNode | null, values: number[] = []): number[] => {
        if (!node) return values
        values.push(node.value)
        getAllNodeValues(node.left, values)
        getAllNodeValues(node.right, values)
        return values
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TreePine className="w-5 h-5" />
                            Binary Tree
                        </div>
                        <Badge variant="outline">Manual Structure</Badge>
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
                                        Current: {traversalResult[currentTraversalStep - 1] || "Starting..."}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Insert Node</h4>
                            <div className="space-y-2">
                                <Input placeholder="Node value" value={newValue} onChange={(e) => setNewValue(e.target.value)} />
                                <Select value={selectedParent} onValueChange={setSelectedParent}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select parent (or root)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="root">Root {!root ? "(Create new)" : "(Replace existing)"}</SelectItem>
                                        {root &&
                                            getAllNodeValues(root).map((nodeValue) => (
                                                <SelectItem key={nodeValue} value={nodeValue.toString()}>
                                                    Node {nodeValue}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                                <Select value={insertPosition} onValueChange={(value: "left" | "right") => setInsertPosition(value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="left">Left Child</SelectItem>
                                        <SelectItem value="right">Right Child</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={handleInsert} disabled={isAnimating || isTraversing} size="sm" className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Insert
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

                    {/* Tree Traversals */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
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

                    {/* Binary Tree Properties */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">Binary Tree Properties</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Each node has at most 2 children</li>
                            <li>• No ordering constraint (unlike BST)</li>
                            <li>• Manual structure control</li>
                            <li>• Search: O(n), Insert: O(1)*, Delete: O(n)</li>
                        </ul>
                    </div>

                    {/* Traversal Result Display */}
                    {traversalResult.length > 0 && (
                        <div className="mb-4 p-3 bg-muted/30 rounded-lg">
                            <h4 className="font-semibold mb-2">{traversalType} Traversal Result</h4>
                            <div className="text-sm font-mono">[{traversalResult.join(", ")}]</div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
