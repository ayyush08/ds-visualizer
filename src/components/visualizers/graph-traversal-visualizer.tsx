"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Network, RotateCcw, Play, Pause, SkipForward, Plus } from "lucide-react"
import type { JSX } from "react/jsx-runtime"
import { toast } from "sonner"

interface Edge {
    from: number
    to: number
}

export function GraphTraversalVisualizer() {
    const [nodes] = useState<number[]>([0, 1, 2, 3, 4, 5])
    const [edges, setEdges] = useState<Edge[]>([
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 1, to: 3 },
        { from: 1, to: 4 },
        { from: 2, to: 5 },
        { from: 3, to: 4 },
        { from: 4, to: 5 },
    ])
    const [startNode, setStartNode] = useState("")
    const [addEdgeFrom, setAddEdgeFrom] = useState("")
    const [addEdgeTo, setAddEdgeTo] = useState("")
    const [algorithm, setAlgorithm] = useState<"dfs" | "bfs">("dfs")
    const [visitedNodes, setVisitedNodes] = useState<Set<number>>(new Set())
    const [currentNode, setCurrentNode] = useState<number | null>(null)
    const [traversalOrder, setTraversalOrder] = useState<number[]>([])
    const [activeEdges, setActiveEdges] = useState<Set<string>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)

    const [isRunning, setIsRunning] = useState(false)
    const [isPaused, setIsPaused] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [traversalSteps, setTraversalSteps] = useState<
        Array<{
            node: number
            parent: number | null
            visited: Set<number>
            order: number[]
            activeEdges: Set<string>
            message: string
        }>
    >([])

    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    const buildAdjList = (): Map<number, number[]> => {
        const adjList = new Map<number, number[]>()
        nodes.forEach((node) => adjList.set(node, []))

        edges.forEach((edge) => {
            adjList.get(edge.from)?.push(edge.to)
            adjList.get(edge.to)?.push(edge.from) // Undirected graph
        })

        console.log("[v0] Built adjacency list:", Object.fromEntries(adjList))
        return adjList
    }

    const getEdgeKey = (from: number, to: number): string => {
        return `${Math.min(from, to)}-${Math.max(from, to)}`
    }

    const computeDFSSteps = (start: number, adjList: Map<number, number[]>) => {
        const steps: Array<{
            node: number
            parent: number | null
            visited: Set<number>
            order: number[]
            activeEdges: Set<string>
            message: string
        }> = []

        const visited = new Set<number>()
        const order: number[] = []
        const activeEdgeSet = new Set<string>()
        const stack: { node: number, parent: number | null }[] = [{ node: start, parent: null }]

        while (stack.length > 0) {
            const { node, parent } = stack.pop()!

            if (!visited.has(node)) {
                visited.add(node)
                order.push(node)

                // Add edge to active set if coming from parent
                if (parent !== null) {
                    const edgeKey = getEdgeKey(parent, node)
                    activeEdgeSet.add(edgeKey)
                }

                steps.push({
                    node,
                    parent,
                    visited: new Set(visited),
                    order: [...order],
                    activeEdges: new Set(activeEdgeSet),
                    message: `DFS visiting node ${node}${parent !== null ? ` from ${parent}` : " (start)"}`,
                })

                // Add neighbors to stack (in reverse order for correct DFS order)
                const neighbors = adjList.get(node) || []
                for (let i = neighbors.length - 1; i >= 0; i--) {
                    const neighbor = neighbors[i]
                    if (!visited.has(neighbor)) {
                        stack.push({ node: neighbor, parent: node })
                    }
                }
            }
        }

        steps.push({
            node: -1,
            parent: null,
            visited: new Set(visited),
            order: [...order],
            activeEdges: new Set(activeEdgeSet),
            message: `DFS completed! Path: ${order.join(" → ")}`,
        })

        return steps
    }

    const computeBFSSteps = (start: number, adjList: Map<number, number[]>) => {
        const steps: Array<{
            node: number
            parent: number | null
            visited: Set<number>
            order: number[]
            activeEdges: Set<string>
            message: string
        }> = []

        const visited = new Set<number>([start])
        const order: number[] = []
        const activeEdgeSet = new Set<string>()
        const queue: { node: number, parent: number | null }[] = [{ node: start, parent: null }]

        while (queue.length > 0) {
            const { node, parent } = queue.shift()!
            order.push(node)

            // Add edge to active set if coming from parent
            if (parent !== null) {
                const edgeKey = getEdgeKey(parent, node)
                activeEdgeSet.add(edgeKey)
            }

            steps.push({
                node,
                parent,
                visited: new Set(visited),
                order: [...order],
                activeEdges: new Set(activeEdgeSet),
                message: `BFS visiting node ${node}${parent !== null ? ` from ${parent}` : " (start)"}`,
            })

            // Add unvisited neighbors to queue
            const neighbors = adjList.get(node) || []
            neighbors.forEach((neighbor) => {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor)
                    queue.push({ node: neighbor, parent: node })
                }
            })
        }

        steps.push({
            node: -1,
            parent: null,
            visited: new Set(visited),
            order: [...order],
            activeEdges: new Set(activeEdgeSet),
            message: `BFS completed! Path: ${order.join(" → ")}`,
        })

        return steps
    }

    const handleStartTraversal = () => {
        const start = Number.parseInt(startNode)

        if (isNaN(start) || !nodes.includes(start)) {
            setOperation(`Invalid start node! Please enter a number between 0 and ${nodes.length - 1}`)
            return
        }

        console.log("[v0] Starting traversal with algorithm:", algorithm, "from node:", start)

        const adjList = buildAdjList()
        const steps = algorithm === "dfs" ? computeDFSSteps(start, adjList) : computeBFSSteps(start, adjList)

        console.log("[v0] Computed", steps.length, "steps for traversal")

        setTraversalSteps(steps)
        setCurrentStep(0)
        setIsRunning(true)
        setIsPaused(false)

        // Reset state
        setVisitedNodes(new Set())
        setTraversalOrder([])
        setCurrentNode(null)
        setActiveEdges(new Set())
        setOperation(`Starting ${algorithm.toUpperCase()} from node ${start}...`)

        if (steps.length > 0) {
            const firstStep = steps[0]
            setCurrentNode(firstStep.node)
            setVisitedNodes(firstStep.visited)
            setTraversalOrder(firstStep.order)
            setActiveEdges(firstStep.activeEdges)
            setOperation(firstStep.message)
        }

        startStepExecution(steps)
    }

    const startStepExecution = (steps: typeof traversalSteps) => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        intervalRef.current = setInterval(() => {
            setCurrentStep((prevStep) => {
                const nextStep = prevStep + 1

                if (nextStep >= steps.length) {
                    setIsRunning(false)
                    setCurrentNode(null)
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current)
                    }
                    return prevStep
                }

                const step = steps[nextStep]
                setCurrentNode(step.node === -1 ? null : step.node)
                setVisitedNodes(step.visited)
                setTraversalOrder(step.order)
                setActiveEdges(step.activeEdges)
                setOperation(step.message)

                return nextStep
            })
        }, 1500)
    }

    const handlePauseResume = () => {
        if (isPaused) {
            setIsPaused(false)
            startStepExecution(traversalSteps)
            setOperation("Resuming traversal...")
        } else {
            setIsPaused(true)
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
            setOperation("Paused traversal")
        }
    }

    const handleStop = () => {
        setIsRunning(false)
        setIsPaused(false)
        setCurrentStep(0)
        setTraversalSteps([])

        if (intervalRef.current) {
            clearInterval(intervalRef.current)
        }

        setVisitedNodes(new Set())
        setTraversalOrder([])
        setCurrentNode(null)
        setActiveEdges(new Set())
        setOperation("Traversal stopped")
    }

    const handleAddEdge = () => {
        const from = Number.parseInt(addEdgeFrom)
        const to = Number.parseInt(addEdgeTo)

        if (!nodes.includes(from) || !nodes.includes(to)) {
            toast.error("Invalid Edge", {
                description: "Both nodes must be valid",
            })
            return
        }

        if (!isNaN(from) && !isNaN(to) && nodes.includes(from) && nodes.includes(to) && from !== to) {
            const edgeExists = edges.some(
                (edge) => (edge.from === from && edge.to === to) || (edge.from === to && edge.to === from),
            )

            if (!edgeExists) {
                setEdges([...edges, { from, to }])
            }

            setAddEdgeFrom("")
            setAddEdgeTo("")
        }
    }

    const handleRemoveEdge = (edgeToRemove: Edge) => {
        setEdges(
            edges.filter(
                (edge) =>
                    !(edge.from === edgeToRemove.from && edge.to === edgeToRemove.to) &&
                    !(edge.from === edgeToRemove.to && edge.to === edgeToRemove.from),
            ),
        )
    }

    const handleReset = () => {
        setEdges([
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 1, to: 3 },
            { from: 1, to: 4 },
            { from: 2, to: 5 },
            { from: 3, to: 4 },
            { from: 4, to: 5 },
        ])
        handleStop()
    }

    const renderGraph = (): JSX.Element[] => {
        const elements: JSX.Element[] = []

        // Node positions (arranged in a circle)
        const positions = nodes.map((node) => {
            const angle = (node / nodes.length) * 2 * Math.PI
            const radius = 120
            const centerX = 400
            const centerY = 200
            return {
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle),
            }
        })

        edges.forEach((edge, index) => {
            const fromPos = positions[edge.from]
            const toPos = positions[edge.to]
            const edgeKey = getEdgeKey(edge.from, edge.to)
            const isActive = activeEdges.has(edgeKey)

            elements.push(
                <g key={`edge-${index}`}>
                    {/* Glow effect for active edges */}
                    {isActive && (
                        <line
                            x1={fromPos.x}
                            y1={fromPos.y}
                            x2={toPos.x}
                            y2={toPos.y}
                            stroke="rgb(16, 185, 129)"
                            strokeWidth="8"
                            className="opacity-60 animate-pulse"
                            style={{ filter: "blur(2px)" }}
                        />
                    )}
                    <line
                        x1={fromPos.x}
                        y1={fromPos.y}
                        x2={toPos.x}
                        y2={toPos.y}
                        stroke={isActive ? "rgb(16, 185, 129)" : "currentColor"}
                        strokeWidth={isActive ? "4" : "2"}
                        className={`transition-all duration-300 cursor-pointer hover:text-destructive ${isActive ? "text-emerald-500" : "text-border"
                            }`}
                        onClick={() => handleRemoveEdge(edge)}
                    />
                </g>,
            )
        })

        // Draw nodes
        nodes.forEach((node) => {
            const pos = positions[node]
            const isVisited = visitedNodes.has(node)
            const isCurrent = currentNode === node
            const visitOrder = traversalOrder.indexOf(node) + 1

            elements.push(
                <g key={`node-${node}`}>
                    <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="25"
                        className={`transition-all duration-300 stroke-2 ${isCurrent
                                ? "fill-primary stroke-primary-foreground animate-pulse"
                                : isVisited
                                    ? "fill-secondary stroke-secondary-foreground"
                                    : "fill-card stroke-border"
                            }`}
                    />
                    <text
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        className={`text-sm font-mono font-bold ${isCurrent ? "fill-primary-foreground" : isVisited ? "fill-secondary-foreground" : "fill-foreground"
                            }`}
                    >
                        {node}
                    </text>
                    {visitOrder > 0 && (
                        <text x={pos.x} y={pos.y - 35} textAnchor="middle" className="text-xs fill-muted-foreground">
                            #{visitOrder}
                        </text>
                    )}
                </g>,
            )
        })

        return elements
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Network className="w-5 h-5" />
                            Graph Traversal Visualizer
                        </div>
                        <Badge variant="outline">DFS: O(V+E), BFS: O(V+E)</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Graph Visualization */}
                    <div className="mb-6">
                        <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                            <svg width="100%" height="100%" viewBox="0 0 800 400" className="min-w-[800px]">
                                {renderGraph()}
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

                    {/* Algorithm Selection */}
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Algorithm</h4>
                        <div className="flex gap-2">
                            <Button
                                variant={algorithm === "dfs" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAlgorithm("dfs")}
                                disabled={isRunning}
                            >
                                Depth-First Search (DFS)
                            </Button>
                            <Button
                                variant={algorithm === "bfs" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setAlgorithm("bfs")}
                                disabled={isRunning}
                            >
                                Breadth-First Search (BFS)
                            </Button>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Start Traversal</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Start node"
                                    value={startNode}
                                    onChange={(e) => setStartNode(e.target.value)}
                                    disabled={isRunning}
                                />
                                <Button onClick={handleStartTraversal} disabled={isRunning} size="sm">
                                    <Play className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Playback Control</h4>
                            <div className="flex gap-2">
                                <Button onClick={handlePauseResume} disabled={!isRunning} size="sm" variant="outline">
                                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                                </Button>
                                <Button onClick={handleStop} disabled={!isRunning} size="sm" variant="outline">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Add Edge</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="From"
                                    value={addEdgeFrom}
                                    onChange={(e) => setAddEdgeFrom(e.target.value)}
                                    className="w-16"
                                    disabled={isRunning}
                                />
                                <Input
                                    placeholder="To"
                                    value={addEdgeTo}
                                    onChange={(e) => setAddEdgeTo(e.target.value)}
                                    className="w-16"
                                    disabled={isRunning}
                                />
                                <Button onClick={handleAddEdge} disabled={isRunning} size="sm" variant="outline">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-4">
                        <Button onClick={handleReset} variant="outline" size="sm" disabled={isRunning}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset Graph
                        </Button>
                    </div>

                    {/* Traversal Info */}
                    {traversalOrder.length > 0 && (
                        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Traversal Order</h4>
                            <div className="flex flex-wrap gap-2">
                                {traversalOrder.map((node, index) => (
                                    <Badge key={index} variant="outline">
                                        {index + 1}. Node {node}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Algorithm Comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Depth-First Search (DFS)</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Uses stack (or recursion)</li>
                                <li>• Goes as deep as possible first</li>
                                <li>• Good for detecting cycles</li>
                                <li>• Used in topological sorting</li>
                                <li>• Memory: O(h) where h is max depth</li>
                            </ul>
                        </div>

                        <div className="p-3 bg-muted/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Breadth-First Search (BFS)</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Uses queue</li>
                                <li>• Explores level by level</li>
                                <li>• Finds shortest path in unweighted graphs</li>
                                <li>• Good for finding connected components</li>
                                <li>• Memory: O(w) where w is max width</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
