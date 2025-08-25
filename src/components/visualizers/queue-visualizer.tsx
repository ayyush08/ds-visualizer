"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ArrowLeft, RotateCcw, Eye } from "lucide-react"

export function QueueVisualizer() {
    const [queue, setQueue] = useState<number[]>([4, 7, 1, 9])
    const [newValue, setNewValue] = useState("")
    const [highlightFront, setHighlightFront] = useState(false)
    const [highlightRear, setHighlightRear] = useState(false)
    const [operation, setOperation] = useState<string | null>(null)
    const [isAnimating, setIsAnimating] = useState(false)

    const animateOperation = (op: string, position: "front" | "rear" | "both" = "front") => {
        setOperation(op)
        if (position === "front" || position === "both") setHighlightFront(true)
        if (position === "rear" || position === "both") setHighlightRear(true)
        setIsAnimating(true)
        setTimeout(() => {
            setHighlightFront(false)
            setHighlightRear(false)
            setIsAnimating(false)
            setOperation(null)
        }, 800)
    }

    const handleEnqueue = () => {
        const value = Number.parseInt(newValue)
        if (!isNaN(value)) {
            setQueue([...queue, value])
            animateOperation(`Enqueue ${value}`, "rear")
            setNewValue("")
        }
    }

    const handleDequeue = () => {
        if (queue.length > 0) {
            const dequeuedValue = queue[0]
            setQueue(queue.slice(1))
            animateOperation(`Dequeue ${dequeuedValue}`, "front")
        }
    }

    const handleFront = () => {
        if (queue.length > 0) {
            animateOperation(`Front: ${queue[0]}`, "front")
        }
    }

    const handleReset = () => {
        setQueue([4, 7, 1, 9])
        setOperation(null)
        setHighlightFront(false)
        setHighlightRear(false)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        Queue Visualizer (FIFO)
                        <Badge variant="outline">O(1) All Operations</Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {/* Queue Visualization */}
                    <div className="mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground text-center">
                                    <div>Front</div>
                                    <ArrowRight className="w-4 h-4 mx-auto mt-1" />
                                </div>

                                {queue.length === 0 ? (
                                    <div className="w-20 h-12 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                                        Empty
                                    </div>
                                ) : (
                                    queue.map((value, index) => {
                                        const isFront = index === 0
                                        const isRear = index === queue.length - 1
                                        return (
                                            <div
                                                key={`${index}-${value}`}
                                                className={`
                          w-16 h-12 border-2 rounded-lg flex items-center justify-center font-mono font-bold
                          transition-all duration-300 relative
                          ${(isFront && highlightFront) || (isRear && highlightRear)
                                                        ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110"
                                                        : isFront
                                                            ? "border-primary bg-primary/10"
                                                            : isRear
                                                                ? "border-secondary bg-secondary/10"
                                                                : "border-border bg-card"
                                                    }
                        `}
                                            >
                                                {value}
                                                {isFront && (
                                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                                                        <Badge variant="outline" className="text-xs">
                                                            F
                                                        </Badge>
                                                    </div>
                                                )}
                                                {isRear && (
                                                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                                                        <Badge variant="outline" className="text-xs">
                                                            R
                                                        </Badge>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                )}

                                <div className="text-xs text-muted-foreground text-center">
                                    <ArrowLeft className="w-4 h-4 mx-auto mb-1" />
                                    <div>Rear</div>
                                </div>
                            </div>
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
                            <h4 className="font-semibold">Enqueue Element</h4>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Value to enqueue"
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleEnqueue()}
                                />
                                <Button onClick={handleEnqueue} disabled={isAnimating || !newValue} size="sm">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Enqueue
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold">Queue Operations</h4>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleDequeue}
                                    disabled={isAnimating || queue.length === 0}
                                    variant="outline"
                                    size="sm"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Dequeue
                                </Button>
                                <Button onClick={handleFront} disabled={isAnimating || queue.length === 0} variant="outline" size="sm">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Front
                                </Button>
                                <Button onClick={handleReset} variant="outline" size="sm">
                                    <RotateCcw className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Queue Info */}
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Size:</span> {queue.length}
                            </div>
                            <div>
                                <span className="font-semibold">Front:</span> {queue.length > 0 ? queue[0] : "None"}
                            </div>
                            <div>
                                <span className="font-semibold">Rear:</span> {queue.length > 0 ? queue[queue.length - 1] : "None"}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
