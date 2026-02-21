"use client"

import { cn } from "@/lib/utils"

interface ConfidenceBar {
    label: string
    confidenceInterval?: string
}

interface ConfidenceChartProps {
    items: ConfidenceBar[]
    className?: string
}

function parseInterval(interval: string): { min: number; max: number } | null {
    const match = interval.match(/(\d+)\s*[-–]\s*(\d+)/)
    if (!match) return null
    return { min: parseInt(match[1], 10), max: parseInt(match[2], 10) }
}

function getBarColor(min: number, max: number): { bg: string; fill: string; text: string } {
    const mid = (min + max) / 2
    if (mid >= 70) return { bg: "bg-emerald-500/10", fill: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" }
    if (mid >= 45) return { bg: "bg-amber-500/10", fill: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" }
    return { bg: "bg-red-500/10", fill: "bg-red-500", text: "text-red-600 dark:text-red-400" }
}

export function ConfidenceChart({ items, className }: ConfidenceChartProps) {
    const parsed = items
        .filter(item => item.confidenceInterval)
        .map(item => {
            const range = parseInterval(item.confidenceInterval!)
            return range ? { ...item, ...range } : null
        })
        .filter(Boolean) as (ConfidenceBar & { min: number; max: number })[]

    if (parsed.length === 0) return null

    return (
        <div className={cn("space-y-4", className)}>
            {parsed.map((item, i) => {
                const colors = getBarColor(item.min, item.max)
                return (
                    <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground truncate mr-3">{item.label}</span>
                            <span className={cn("text-xs font-semibold tabular-nums", colors.text)}>
                                {item.confidenceInterval}
                            </span>
                        </div>
                        <div className="relative h-3 w-full rounded-full bg-secondary overflow-hidden">
                            {/* Range bar */}
                            <div
                                className={cn("absolute top-0 h-full rounded-full transition-all duration-500 ease-out", colors.fill)}
                                style={{
                                    left: `${item.min}%`,
                                    width: `${item.max - item.min}%`,
                                    opacity: 0.7,
                                }}
                            />
                            {/* Full extent indicator (faded) */}
                            <div
                                className={cn("absolute top-0 h-full rounded-full", colors.fill)}
                                style={{
                                    left: `0%`,
                                    width: `${item.min}%`,
                                    opacity: 0.15,
                                }}
                            />
                        </div>
                        {/* Scale markers */}
                        <div className="flex justify-between text-[10px] text-muted-foreground/50 px-0.5">
                            <span>0%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
