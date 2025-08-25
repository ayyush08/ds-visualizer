"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Trash2, Search, RotateCcw } from "lucide-react"

interface HashEntry {
    key: string
    value: string
    isHighlighted?: boolean
}

export function HashTableVisualizer() {
    const [table, setTable] = useState<(HashEntry[] | null)[]>(Array(8).fill(null))
    const [inputKey, setInputKey] = useState("")
    const [inputValue, setInputValue] = useState("")
    const [searchKey, setSearchKey] = useState("")
    const [operation, setOperation] = useState<string>("")
    const [highlightedSlots, setHighlightedSlots] = useState<number[]>([])

    const hashFunction = useCallback(
        (key: string): number => {
            let hash = 0
            for (let i = 0; i < key.length; i++) {
                hash = (hash + key.charCodeAt(i) * (i + 1)) % table.length
            }
            return hash
        },
        [table.length],
    )

    const clearHighlights = () => {
        setHighlightedSlots([])
        setTable((prev) => prev.map((slot) => (slot ? slot.map((entry) => ({ ...entry, isHighlighted: false })) : null)))
    }

    const insert = () => {
        if (!inputKey.trim() || !inputValue.trim()) return

        clearHighlights()
        const hash = hashFunction(inputKey)
        setHighlightedSlots([hash])

        setTable((prev) => {
            const newTable = [...prev]
            if (!newTable[hash]) {
                newTable[hash] = []
            }

            // Check if key already exists
            const existingIndex = newTable[hash]!.findIndex((entry) => entry.key === inputKey)
            if (existingIndex !== -1) {
                newTable[hash]![existingIndex] = { key: inputKey, value: inputValue, isHighlighted: true }
            } else {
                newTable[hash]!.push({ key: inputKey, value: inputValue, isHighlighted: true })
            }

            return newTable
        })

        setOperation(`Inserted "${inputKey}" → "${inputValue}" at slot ${hash}`)
        setInputKey("")
        setInputValue("")
    }

    const search = () => {
        if (!searchKey.trim()) return

        clearHighlights()
        const hash = hashFunction(searchKey)
        setHighlightedSlots([hash])

        const slot = table[hash]
        if (slot) {
            const entry = slot.find((e) => e.key === searchKey)
            if (entry) {
                setTable((prev) =>
                    prev.map((slot, index) =>
                        index === hash && slot ? slot.map((e) => ({ ...e, isHighlighted: e.key === searchKey })) : slot,
                    ),
                )
                setOperation(`Found "${searchKey}" → "${entry.value}" at slot ${hash}`)
            } else {
                setOperation(`Key "${searchKey}" not found in slot ${hash}`)
            }
        } else {
            setOperation(`Key "${searchKey}" not found - slot ${hash} is empty`)
        }
    }

    const deleteKey = () => {
        if (!searchKey.trim()) return

        clearHighlights()
        const hash = hashFunction(searchKey)
        setHighlightedSlots([hash])

        setTable((prev) => {
            const newTable = [...prev]
            if (newTable[hash]) {
                const initialLength = newTable[hash]!.length
                newTable[hash] = newTable[hash]!.filter((entry) => entry.key !== searchKey)
                if (newTable[hash]!.length === 0) {
                    newTable[hash] = null
                }

                if (initialLength > (newTable[hash]?.length ?? 0)) {
                    setOperation(`Deleted "${searchKey}" from slot ${hash}`)
                } else {
                    setOperation(`Key "${searchKey}" not found in slot ${hash}`)
                }
            } else {
                setOperation(`Key "${searchKey}" not found - slot ${hash} is empty`)
            }
            return newTable
        })
    }

    const reset = () => {
        setTable(Array(8).fill(null))
        setInputKey("")
        setInputValue("")
        setSearchKey("")
        setOperation("")
        setHighlightedSlots([])
    }

    const loadFactor = table.filter((slot) => slot !== null).length / table.length
    const totalEntries = table.reduce((sum, slot) => sum + (slot?.length || 0), 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-serif">Hash Table Visualizer</h2>
                    <p className="text-muted-foreground">Collision handling with separate chaining</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hash Table (Size: {table.length})</CardTitle>
                            <CardDescription>
                                Load Factor: {(loadFactor * 100).toFixed(1)}% | Total Entries: {totalEntries}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {table.map((slot, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center p-3 border rounded-lg transition-all ${highlightedSlots.includes(index) ? "border-primary bg-primary/5" : "border-border"
                                            }`}
                                    >
                                        <div className="w-12 text-center font-mono text-sm font-semibold">[{index}]</div>
                                        <div className="flex-1 ml-4">
                                            {slot ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {slot.map((entry, entryIndex) => (
                                                        <div
                                                            key={entryIndex}
                                                            className={`px-3 py-1 rounded-md text-sm border transition-all ${entry.isHighlighted
                                                                    ? "bg-primary text-primary-foreground border-primary"
                                                                    : "bg-muted border-border"
                                                                }`}
                                                        >
                                                            <span className="font-mono">{entry.key}</span>
                                                            <span className="mx-1">→</span>
                                                            <span>{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Empty</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Insert Operation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Key"
                                value={inputKey}
                                onChange={(e) => setInputKey(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && insert()}
                            />
                            <Input
                                placeholder="Value"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && insert()}
                            />
                            <Button onClick={insert} className="w-full" disabled={!inputKey.trim() || !inputValue.trim()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Insert
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Search & Delete</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Input
                                placeholder="Key to search/delete"
                                value={searchKey}
                                onChange={(e) => setSearchKey(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") search()
                                }}
                            />
                            <div className="flex gap-2">
                                <Button
                                    onClick={search}
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                    disabled={!searchKey.trim()}
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    Search
                                </Button>
                                <Button
                                    onClick={deleteKey}
                                    variant="outline"
                                    className="flex-1 bg-transparent"
                                    disabled={!searchKey.trim()}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Hash Function</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-2">
                                <div className="font-mono bg-muted p-2 rounded text-xs">hash = Σ(char[i] * (i+1)) % {table.length}</div>
                                <p className="text-muted-foreground">
                                    Simple polynomial hash with separate chaining for collision resolution
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Controls</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={reset} variant="outline" className="w-full bg-transparent">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset Table
                            </Button>
                        </CardContent>
                    </Card>

                    {operation && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Operation Result</CardTitle>
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
