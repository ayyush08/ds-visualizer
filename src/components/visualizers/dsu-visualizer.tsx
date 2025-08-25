"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Network, RotateCcw, Link, Search, Users } from "lucide-react"
import type { JSX } from "react/jsx-runtime"


export function DSUVisualizer() {
    const [size, setSize] = useState(8)
    const [parent, setParent] = useState<number[]>([])
    const [rank, setRank] = useState<number[]>([])
    const [unionX, setUnionX] = useState("")
    const [unionY, setUnionY] = useState("")
    const [findX, setFindX] = useState("")
    const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set())
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    // Initialize DSU
    const initializeDSU = (n: number) => {
        const newParent = Array.from({ length: n }, (_, i) => i)
        const newRank = new Array(n).fill(0)
        setParent(newParent)
        setRank(newRank)
    }

    // Find with path compression
    const find = (x: number, currentParent: number[]): { root: number; path: number[] } => {
        const path: number[] = []
        let current = x

        while (current !== currentParent[current]) {
            path.push(current)
            current = currentParent[current]
        }
        path.push(current) // Add root

        return { root: current, path }
    }

    // Union by rank
    const union = (x: number, y: number) => {
        const newParent = [...parent]
        const newRank = [...rank]

        const rootX = find(x, newParent)
        const rootY = find(y, newParent)

        if (rootX.root === rootY.root) {
            return {
                newParent,
                newRank,
                message: `${x} and ${y} are already connected`,
                path: [...rootX.path, ...rootY.path],
            }
        }

        // Union by rank
        if (newRank[rootX.root] < newRank[rootY.root]) {
            newParent[rootX.root] = rootY.root
        } else if (newRank[rootX.root] > newRank[rootY.root]) {
            newParent[rootY.root] = rootX.root
        } else {
            newParent[rootY.root] = rootX.root
            newRank[rootX.root]++
        }

        return {
            newParent,
            newRank,
            message: `Union ${x} and ${y}`,
            path: [...rootX.path, ...rootY.path],
        }
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

    const handleUnion = () => {
        const x = Number.parseInt(unionX)
        const y = Number.parseInt(unionY)

        if (!isNaN(x) && !isNaN(y) && x >= 0 && x < size && y >= 0 && y < size && x !== y) {
            const result = union(x, y)
            setParent(result.newParent)
            setRank(result.newRank)
            animateOperation(result.path, result.message)
            setUnionX("")
            setUnionY("")
        }
    }

    const handleFind = () => {
        const x = Number.parseInt(findX)

        if (!isNaN(x) && x >= 0 && x < size) {
            const result = find(x, parent)
            animateOperation(result.path, `Find(${x}) = ${result.root}`)
            setFindX("")
        }
    }

    const handleReset = () => {
        initializeDSU(size)
        setHighlightedNodes(new Set())
        setOperation(null)
    }

    // Initialize on first render
    useState(() => {
        initializeDSU(size)
    })

    // Get connected components
    const getComponents = (): number[][] => {
        const components: { [key: number]: number[] } = {}

        for (let i = 0; i < size; i++) {
            const root = find(i, parent).root
            if (!components[root]) {
                components[root] = []
            }
            components[root].push(i)
        }

        return Object.values(components)
    }

    const renderDSU = (): JSX.Element[] => {
        const elements: JSX.Element[] = []
        const components = getComponents()
        const colors = [
            "fill-primary",
            "fill-secondary",
            "fill-chart-1",
            "fill-chart-2",
            "fill-chart-3",
            "fill-chart-4",
            "fill-chart-5",
        ]

        // Position nodes in a grid
        const cols = Math.ceil(Math.sqrt(size))
        const rows = Math.ceil(size / cols)

        for (let i = 0; i < size; i++) {
            const row = Math.floor(i / cols)
            const col = i % cols
            const x = 100 + col * 100
            const y = 100 + row * 100

            // Find which component this node belongs to
            const componentIndex = components.findIndex((comp) => comp.includes(i))
            const color = colors[componentIndex % colors.length]

            // Draw edge to parent if not root
            if (parent[i] !== i) {
                const parentRow = Math.floor(parent[i] / cols)
                const parentCol = parent[i] % cols
                const parentX = 100 + parentCol * 100
                const parentY = 100 + parentRow * 100

                elements.push(
                    <line
                        key={`edge-${i}`}
                        x1={x}
                        y1={y}
                        x2={parentX}
                        y2={parentY}
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-border"
                        markerEnd="url(#arrowhead)"
                    />,
                )
            }

            // Draw node
            elements.push(
                <g key={`node-${i}`}>
                    <circle
                        cx={x}
                        cy={y}
                        r="25"
                        className={`transition-all duration-300 stroke-2 ${highlightedNodes.has(i) ? "fill-primary stroke-primary-foreground" : `${color} stroke-border`
                            }`}
                    />
                    <text
                        x={x}
                        y={y + 5}
                        textAnchor="middle"
                        className={`text-sm font-mono font-bold ${highlightedNodes.has(i) ? "fill-primary-foreground" : "fill-background"
                            }`}
                    >
                        {i}
                    </text>
                    <text x={x} y={y - 35} textAnchor="middle" className="text-xs fill-muted-foreground">
                        r:{rank[i]}
                    </text>
                </g>,
            )
        }

        // Add arrow marker definition
        elements.unshift(
            <defs key="defs">
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" className="fill-border" />
                </marker>
            </defs>,
        )

        return elements
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Network className="w-5 h-5" />
                            Disjoint Set Union (Union-Find)
                        </div>
                        <Badge variant="outline">O(α(n)) amortized</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* DSU Visualization */}
                    <div className="mb-6">
                        <div className="w-full h-96 border rounded-lg bg-card/50 overflow-auto">
                            <svg width="100%" height="100%" viewBox="0 0 800 400" className="min-w-[800px]">
                                {renderDSU()}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Union Operation</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Node X"
                                    value={unionX}
                                    onChange={(e) => setUnionX(e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    placeholder="Node Y"
                                    value={unionY}
                                    onChange={(e) => setUnionY(e.target.value)}
                                    className="w-20"
                                />
                                <Button onClick={handleUnion} disabled={isAnimating} size="sm">
                                    <Link className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Find Operation</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Node"
                                    value={findX}
                                    onChange={(e) => setFindX(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleFind()}
                                />
                                <Button onClick={handleFind} disabled={isAnimating} size="sm" variant="outline">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mb-4">
                        <Button onClick={handleReset} variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset DSU
                        </Button>
                    </div>

                    {/* Connected Components Info */}
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Connected Components</h4>
                        <div className="flex flex-wrap gap-2">
                            {getComponents().map((component, index) => (
                                <Badge key={index} variant="outline" className="text-sm">
                                    <Users className="w-3 h-3 mr-1" />
                                    {component.sort((a, b) => a - b).join(", ")}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* DSU Properties */}
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <h4 className="font-semibold mb-2">DSU Properties</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Union by rank: attach smaller tree under root of larger tree</li>
                            <li>• Path compression: make nodes point directly to root during find</li>
                            <li>• α(n) is inverse Ackermann function (practically constant)</li>
                            <li>• Perfect for dynamic connectivity problems</li>
                            <li>• Used in Kruskal&apos;s MST algorithm and cycle detection</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
