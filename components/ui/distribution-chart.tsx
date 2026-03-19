"use client"

import { cn } from "@/lib/utils"
import type { HistogramBin } from "@/lib/monte-carlo"

interface DistributionChartProps {
    histogram: HistogramBin[]
    compositeScore: number
    p5: number
    p95: number
    iterations: number
    riskOfPoorOutcome: number
    chanceOfGoodOutcome: number
    className?: string
}

function getScoreColor(score: number) {
    if (score >= 70) return { fill: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", ring: "ring-emerald-500/20" }
    if (score >= 45) return { fill: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/20" }
    return { fill: "bg-red-500", text: "text-red-600 dark:text-red-400", ring: "ring-red-500/20" }
}

function getBinColor(binMid: number) {
    if (binMid >= 70) return "bg-emerald-500"
    if (binMid >= 45) return "bg-amber-500"
    return "bg-red-500"
}

export function DistributionChart({
    histogram,
    compositeScore,
    p5,
    p95,
    iterations,
    riskOfPoorOutcome,
    chanceOfGoodOutcome,
    className,
}: DistributionChartProps) {
    const maxFreq = Math.max(...histogram.map(b => b.frequency), 0.01)
    const chartHeight = 120
    const colors = getScoreColor(compositeScore)

    // Position of the composite score marker (0-100 → 0%-100%)
    const scorePosition = compositeScore

    return (
        <div className={cn("space-y-3", className)}>
            {/* Key stats row */}
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full ring-1", colors.ring, colors.text)}>
                        <span className="text-xs font-medium">Score</span>
                        <span className="text-sm font-bold tabular-nums">{Math.round(compositeScore)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground tabular-nums">
                        90% range: {Math.round(p5)}–{Math.round(p95)}
                    </span>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">
                    {iterations.toLocaleString()} runs
                </span>
            </div>

            {/* Histogram */}
            <div className="relative" style={{ height: chartHeight }}>
                {/* Bars container */}
                <div className="flex items-end gap-px h-full">
                    {histogram.map((bin, i) => {
                        const barHeight = (bin.frequency / maxFreq) * 100
                        const binMid = (bin.min + bin.max) / 2
                        const isInRange = binMid >= p5 && binMid <= p95
                        return (
                            <div
                                key={i}
                                className="flex-1 flex items-end"
                                style={{ height: "100%" }}
                            >
                                <div
                                    className={cn(
                                        "w-full rounded-t-sm transition-all",
                                        getBinColor(binMid),
                                        isInRange ? "opacity-70" : "opacity-25"
                                    )}
                                    style={{ height: `${Math.max(barHeight, 1)}%` }}
                                />
                            </div>
                        )
                    })}
                </div>

                {/* Composite score marker line */}
                <div
                    className="absolute top-0 bottom-0 w-px border-l-2 border-dashed border-foreground/40"
                    style={{ left: `${scorePosition}%` }}
                />
            </div>

            {/* Scale labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground/50 px-0.5">
                <span>0</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
            </div>

            {/* Risk/Opportunity metrics */}
            <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-red-500/70" />
                    <span className="text-muted-foreground">
                        Risk (&lt;40): <span className="font-medium text-foreground tabular-nums">{Math.round(riskOfPoorOutcome * 100)}%</span>
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-500/70" />
                    <span className="text-muted-foreground">
                        Favorable (&ge;70): <span className="font-medium text-foreground tabular-nums">{Math.round(chanceOfGoodOutcome * 100)}%</span>
                    </span>
                </div>
            </div>
        </div>
    )
}
