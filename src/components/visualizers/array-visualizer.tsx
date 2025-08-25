"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RotateCcw, Plus, Minus } from "lucide-react"
import { toast } from "sonner"

export function ArrayVisualizer() {
    const [array, setArray] = useState<number[]>([5, 2, 8, 1, 9, 3])
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)
    const [newValue, setNewValue] = useState("")
    const [insertIndex, setInsertIndex] = useState("")
    const [deleteIndex, setDeleteIndex] = useState("")
    const [operation, setOperation] = useState<string | null>(null)

    const animateOperation = (index: number, op: string) => {
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

        if (isNaN(value)) {
            toast.error("Invalid Input",{
                description: "Please enter a valid number for the value."
            })
            return
        }

        if (isNaN(index)) {
            toast.error("Invalid Input",{
                description: "Please enter a valid index."
            })
            return
        }

        if (index < 0 || index > array.length) {
            toast.error("Invalid Index",{
                description: `Index must be between 0 and ${array.length}.`
            })
            return
        }

        const newArray = [...array]
        newArray.splice(index, 0, value)
        setArray(newArray)
        animateOperation(index, `Insert ${value} at index ${index}`)
        setNewValue("")
        setInsertIndex("")

        toast.success("Element Inserted",{
            description: `Successfully inserted ${value} at index ${index}.`
        })
    }

    const handleDelete = (index: number) => {
        const newArray = [...array]
        const deletedValue = newArray.splice(index, 1)[0]
        setArray(newArray)
        animateOperation(index, `Delete ${deletedValue} from index ${index}`)

        toast.success("Element Deleted",{
            description: `Successfully deleted ${deletedValue} from index ${index}.`
        })
    }

    const handleDeleteByIndex = () => {
        const index = Number.parseInt(deleteIndex)

        if (isNaN(index)) {
            toast.error("Invalid Input",{
                description: "Please enter a valid index to delete."
            })
            return
        }

        if (index < 0 || index >= array.length) {
            toast.error("Invalid Index",{
                description: `Index must be between 0 and ${array.length - 1}.`
            })
            return
        }

        if (array.length === 0) {
            toast.error("Array Empty",{
                description: "Cannot delete from an empty array."
            })
            return
        }

        handleDelete(index)
        setDeleteIndex("")
    }

    const handleAccess = (index: number) => {
        animateOperation(index, `Access element at index ${index}: ${array[index]}`)
    }

    const handleReset = () => {
        setArray([5, 2, 8, 1, 9, 3])
        setHighlightIndex(null)
        setOperation(null)
        toast.success("Array Reset",{
            description: "Array has been reset to default values."
        })
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Array Visualizer
                        <Badge variant="outline">O(1) Access, O(n) Insert/Delete</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Array Visualization */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            {array.map((value, index) => (
                                <div key={`${index}-${value}`} className="text-center">
                                    <div className="text-xs text-muted-foreground mb-1">{index}</div>
                                    <div
                                        className={`
                      w-12 h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold
                      transition-all duration-300 cursor-pointer hover:scale-105
                      ${highlightIndex === index
                                                ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110"
                                                : "border-border bg-card hover:border-primary/50"
                                            }
                    `}
                                        onClick={() => handleAccess(index)}
                                    >
                                        {value}
                                    </div>
                                </div>
                            ))}
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
                            <h4 className="font-semibold">Insert Element</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    className="w-20"
                                />
                                <Input
                                    placeholder="Index"
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
                            <h4 className="font-semibold">Delete by Index</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Index"
                                    value={deleteIndex}
                                    onChange={(e) => setDeleteIndex(e.target.value)}
                                    className="w-20"
                                />
                                <Button onClick={handleDeleteByIndex} disabled={isAnimating} size="sm" variant="destructive">
                                    <Minus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Operations</h4>
                            <div className="flex gap-2">
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Delete buttons for each element */}
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Quick Delete</h4>
                        <div className="flex items-center justify-center gap-2">
                            {array.map((_, index) => (
                                <Button
                                    key={index}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(index)}
                                    disabled={isAnimating}
                                    className="w-12"
                                >
                                    <Minus className="w-3 h-3" />
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
