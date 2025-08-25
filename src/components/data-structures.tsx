"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    BarChart3,
    Binary,
    GitBranch,
    Hash,
    Layers,
    List,
    Network,
    Shuffle,
    SquareStackIcon as Stack,
    TreePine,
    Zap,
    Play,
    RotateCcw,
    Settings,
    ArrowLeft,
} from "lucide-react"

import { ArrayVisualizer } from "@/components/visualizers/array-visualizer"
import { StackVisualizer } from "@/components/visualizers/stack-visualizer"
import { QueueVisualizer } from "@/components/visualizers/queue-visualizer"
import { LinkedListVisualizer } from "@/components/visualizers/linked-list-visualizer"
import { BinaryTreeVisualizer } from "@/components/visualizers/binary-tree-visualizer"
import { BSTVisualizer } from "@/components/visualizers/bst-visualizer"
import { AVLTreeVisualizer } from "@/components/visualizers/avl-tree-visualizer"
import { SegmentTreeVisualizer } from "@/components/visualizers/segment-tree-visualizer"
import { FenwickTreeVisualizer } from "@/components/visualizers/fenwick-tree-visualizer"
import { DSUVisualizer } from "@/components/visualizers/dsu-visualizer"
import { GraphTraversalVisualizer } from "@/components/visualizers/graph-traversal-visualizer"
import { HashTableVisualizer } from "@/components/visualizers/hash-table-visualizer"
import { HeapVisualizer } from "@/components/visualizers/heap-visualizer"

interface DataStructure {
    id: string
    name: string
    category: "basic" | "tree" | "graph" | "advanced"
    difficulty: "Easy" | "Medium" | "Hard"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: React.ComponentType<any>
    description: string
    operations: string[]
    timeComplexity: string
    spaceComplexity: string
}

const dataStructures: DataStructure[] = [
    {
        id: "array",
        name: "Array",
        category: "basic",
        difficulty: "Easy",
        icon: List,
        description: "Linear collection of elements stored in contiguous memory locations",
        operations: ["Access", "Insert", "Delete", "Search"],
        timeComplexity: "O(1) access, O(n) search",
        spaceComplexity: "O(n)",
    },
    {
        id: "stack",
        name: "Stack",
        category: "basic",
        difficulty: "Easy",
        icon: Stack,
        description: "LIFO (Last In, First Out) data structure",
        operations: ["Push", "Pop", "Peek", "IsEmpty"],
        timeComplexity: "O(1) all operations",
        spaceComplexity: "O(n)",
    },
    {
        id: "queue",
        name: "Queue",
        category: "basic",
        difficulty: "Easy",
        icon: Shuffle,
        description: "FIFO (First In, First Out) data structure",
        operations: ["Enqueue", "Dequeue", "Front", "IsEmpty"],
        timeComplexity: "O(1) all operations",
        spaceComplexity: "O(n)",
    },
    {
        id: "linked-list",
        name: "Linked List",
        category: "basic",
        difficulty: "Easy",
        icon: GitBranch,
        description: "Linear data structure with nodes containing data and pointers",
        operations: ["Insert", "Delete", "Search", "Traverse"],
        timeComplexity: "O(n) search, O(1) insert/delete",
        spaceComplexity: "O(n)",
    },
    {
        id: "binary-tree",
        name: "Binary Tree",
        category: "tree",
        difficulty: "Medium",
        icon: Binary,
        description: "Hierarchical structure where each node has at most two children",
        operations: ["Insert", "Delete", "Search", "Traverse"],
        timeComplexity: "O(log n) balanced, O(n) worst",
        spaceComplexity: "O(n)",
    },
    {
        id: "bst",
        name: "Binary Search Tree",
        category: "tree",
        difficulty: "Medium",
        icon: TreePine,
        description: "Binary tree with ordered property for efficient searching",
        operations: ["Insert", "Delete", "Search", "Min/Max"],
        timeComplexity: "O(log n) average, O(n) worst",
        spaceComplexity: "O(n)",
    },
    {
        id: "heap",
        name: "Binary Heap",
        category: "tree",
        difficulty: "Medium",
        icon: BarChart3,
        description: "Complete binary tree with heap property for priority operations",
        operations: ["Insert", "Extract Min/Max", "Peek", "Build Heap"],
        timeComplexity: "O(log n) insert/extract, O(1) peek",
        spaceComplexity: "O(n)",
    },
    {
        id: "segment-tree",
        name: "Segment Tree",
        category: "advanced",
        difficulty: "Hard",
        icon: Layers,
        description: "Tree for answering range queries and updates efficiently",
        operations: ["Build", "Query", "Update", "Range Update"],
        timeComplexity: "O(log n) query/update",
        spaceComplexity: "O(n)",
    },
    {
        id: "fenwick-tree",
        name: "Fenwick Tree (BIT)",
        category: "advanced",
        difficulty: "Hard",
        icon: BarChart3,
        description: "Binary Indexed Tree for prefix sum queries and updates",
        operations: ["Update", "Query", "Range Query"],
        timeComplexity: "O(log n) all operations",
        spaceComplexity: "O(n)",
    },
    {
        id: "dsu",
        name: "Disjoint Set Union",
        category: "graph",
        difficulty: "Medium",
        icon: Network,
        description: "Union-Find data structure for tracking disjoint sets",
        operations: ["Union", "Find", "Connected"],
        timeComplexity: "O(α(n)) amortized",
        spaceComplexity: "O(n)",
    },
    {
        id: "graph-traversal",
        name: "Graph Traversal",
        category: "graph",
        difficulty: "Medium",
        icon: Network,
        description: "DFS and BFS algorithms for exploring graph structures",
        operations: ["DFS", "BFS", "Add Edge", "Remove Edge"],
        timeComplexity: "O(V + E) both algorithms",
        spaceComplexity: "O(V)",
    },
    {
        id: "hash-table",
        name: "Hash Table",
        category: "advanced",
        difficulty: "Medium",
        icon: Hash,
        description: "Key-value pairs with hash function for fast access",
        operations: ["Insert", "Delete", "Search", "Resize"],
        timeComplexity: "O(1) average, O(n) worst",
        spaceComplexity: "O(n)",
    },
]

const categoryColors = {
    basic: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    tree: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    graph: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    advanced: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
}

const difficultyColors = {
    Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function DataStructures() {
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [selectedStructure, setSelectedStructure] = useState<DataStructure | null>(null)
    const [activeVisualizer, setActiveVisualizer] = useState<string | null>(null)

    const filteredStructures =
        selectedCategory === "all" ? dataStructures : dataStructures.filter((ds) => ds.category === selectedCategory)

    const renderVisualizer = () => {
        switch (activeVisualizer) {
            case "array":
                return <ArrayVisualizer />
            case "stack":
                return <StackVisualizer />
            case "queue":
                return <QueueVisualizer />
            case "linked-list":
                return <LinkedListVisualizer />
            case "binary-tree":
                return <BinaryTreeVisualizer />
            case "bst":
                return <BSTVisualizer />
            case "avl-tree":
                return <AVLTreeVisualizer />
            case "segment-tree":
                return <SegmentTreeVisualizer />
            case "fenwick-tree":
                return <FenwickTreeVisualizer />
            case "dsu":
                return <DSUVisualizer />
            case "graph-traversal":
                return <GraphTraversalVisualizer />
            case "hash-table":
                return <HashTableVisualizer />
            case "heap":
                return <HeapVisualizer />
            default:
                return null
        }
    }

    if (activeVisualizer) {
        return (
            <div className="min-h-screen bg-background">
                <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Button variant="secondary" size="sm" onClick={() => setActiveVisualizer(null)}>
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Dashboard
                                </Button>
                                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                                    <Zap className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold font-serif">DS Visualizer</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {dataStructures.find((ds) => ds.id === activeVisualizer)?.name} Visualization
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
                <div className="container mx-auto px-4 py-6">{renderVisualizer()}</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                                <Zap className="w-6 h-6 text-primary-foreground" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold font-serif">DS Visualizer</h1>
                                <p className="text-sm text-muted-foreground">Competitive Programming Tool</p>
                            </div>
                        </div>

                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Categories</CardTitle>
                                <CardDescription>Filter by data structure type</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} orientation="vertical">
                                    <TabsList className="grid w-full grid-cols-1 h-auto">
                                        <TabsTrigger value="all" className="justify-start ">
                                            All Structures
                                        </TabsTrigger>
                                        <TabsTrigger value="basic" className="justify-start">
                                            Basic
                                        </TabsTrigger>
                                        <TabsTrigger value="tree" className="justify-start">
                                            Trees
                                        </TabsTrigger>
                                        <TabsTrigger value="graph" className="justify-start">
                                            Graphs
                                        </TabsTrigger>
                                        <TabsTrigger value="advanced" className="justify-start">
                                            Advanced
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </CardContent>
                        </Card>

                        {selectedStructure && (
                            <Card className="mt-4">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <selectedStructure.icon className="w-5 h-5" />
                                        {selectedStructure.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-2">
                                        <Badge className={categoryColors[selectedStructure.category]}>{selectedStructure.category}</Badge>
                                        <Badge className={difficultyColors[selectedStructure.difficulty]}>
                                            {selectedStructure.difficulty}
                                        </Badge>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">Operations</h4>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedStructure.operations.map((op) => (
                                                <Badge key={op} variant="outline" className="text-xs">
                                                    {op}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="font-semibold">Time: </span>
                                            <span className="text-muted-foreground">{selectedStructure.timeComplexity}</span>
                                        </div>
                                        <div>
                                            <span className="font-semibold">Space: </span>
                                            <span className="text-muted-foreground">{selectedStructure.spaceComplexity}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => setActiveVisualizer(selectedStructure.id)}
                                            disabled={
                                                ![
                                                    "array",
                                                    "stack",
                                                    "queue",
                                                    "linked-list",
                                                    "binary-tree",
                                                    "bst",
                                                    "avl-tree",
                                                    "segment-tree",
                                                    "fenwick-tree",
                                                    "dsu",
                                                    "graph-traversal",
                                                    "hash-table",
                                                    "heap",
                                                ].includes(selectedStructure.id)
                                            }
                                        >
                                            <Play className="w-4 h-4 mr-2" />
                                            Visualize
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            <RotateCcw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold font-serif mb-2">Data Structures</h2>
                            <p className="text-muted-foreground">
                                Interactive visualizations for competitive programming data structures and algorithms
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredStructures.map((structure) => (
                                <Card
                                    key={structure.id}
                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStructure?.id === structure.id ? "ring-2 ring-primary" : ""
                                        }`}
                                    onClick={() => setSelectedStructure(structure)}
                                >
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                                                    <structure.icon className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{structure.name}</CardTitle>
                                                    <div className="flex gap-2 mt-1">
                                                        <Badge className={categoryColors[structure.category]} variant="secondary">
                                                            {structure.category}
                                                        </Badge>
                                                        <Badge className={difficultyColors[structure.difficulty]} variant="secondary">
                                                            {structure.difficulty}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <CardDescription className="mb-3">{structure.description}</CardDescription>
                                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                                            <span>Time: {structure.timeComplexity}</span>
                                            <span>Space: {structure.spaceComplexity}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {filteredStructures.length === 0 && (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold mb-2">No structures found</h3>
                                        <p className="text-muted-foreground">Try selecting a different category</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
