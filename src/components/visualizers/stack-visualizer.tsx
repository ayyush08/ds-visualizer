"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, RotateCcw, Eye } from "lucide-react"


export function StackVisualizer() {
    const [stack, setStack] = useState<number[]>([1, 3, 7, 2])
    const [newValue, setNewValue] = useState("")
    const [highlightTop, setHighlightTop] = useState(false)
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    const animateOperation = (op: string) => {
        setOperation(op)
        setHighlightTop(true)
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightTop(false)
            setIsAnimating(false)
            setOperation(null)
        }, 800)
    }

    const handlePush = () => {
        const value = Number.parseInt(newValue)
        if (!isNaN(value)) {
            setStack([...stack, value])
            animateOperation(`Push ${value}`)
            setNewValue("")
        }
    }

    const handlePop = () => {
        if (stack.length > 0) {
            const poppedValue = stack[stack.length - 1]
            setStack(stack.slice(0, -1))
            animateOperation(`Pop ${poppedValue}`)
        }
    }

    const handlePeek = () => {
        if (stack.length > 0) {
            animateOperation(`Peek: ${stack[stack.length - 1]}`)
        }
    }

    const handleReset = () => {
        setStack([1, 3, 7, 2])
        setOperation(null)
        setHighlightTop(false)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Stack Visualizer (LIFO)
                        <Badge variant="outline">O(1) All Operations</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Stack Visualization */}
                    <div className="mb-6">
                        <div className="flex flex-col items-center gap-1 mb-4">
                            <div className="text-xs text-muted-foreground mb-2">
                                Top → {stack.length > 0 ? `Index ${stack.length - 1}` : "Empty"}
                            </div>

                            {stack.length === 0 ? (
                                <div className="w-20 h-12 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                                    Empty
                                </div>
                            ) : (
                                stack
                                    .slice()
                                    .reverse()
                                    .map((value, reverseIndex) => {
                                        const actualIndex = stack.length - 1 - reverseIndex
                                        const isTop = actualIndex === stack.length - 1
                                        return (
                                            <div
                                                key={`${actualIndex}-${value}`}
                                                className={`
                          w-20 h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold
                          transition-all duration-300 relative
                          ${isTop && highlightTop
                                                        ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110 z-10"
                                                        : isTop
                                                            ? "border-primary bg-primary/10 border-primary"
                                                            : "border-border bg-card"
                                                    }
                        `}
                                            >
                                                {value}
                                                {isTop && (
                                                    <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                                                        <ArrowUp className="w-4 h-4 text-primary" />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold">Push Element</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value to push"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handlePush()}
                                />
                                <Button onClick={handlePush} disabled={isAnimating || !newValue} size="sm">
                                    <ArrowUp className="w-4 h-4 mr-2" />
                                    Push
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Stack Operations</h4>
                            <div className="flex gap-2">
                                <Button onClick={handlePop} disabled={isAnimating || stack.length === 0} variant="outline" size="sm">
                                    <ArrowDown className="w-4 h-4 mr-2" />
                                    Pop
                                </Button>
                                <Button onClick={handlePeek} disabled={isAnimating || stack.length === 0} variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Peek
                                </Button>
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Stack Info */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Size:</span> {stack.length}
                            </div>
                            <div>
                                <span className="font-semibold">Top:</span> {stack.length > 0 ? stack[stack.length - 1] : "None"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
