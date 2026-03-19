"use client"

import { useMemo } from "react"
import { Download, ArrowLeft } from "lucide-react"
import { jsPDF } from "jspdf"
import { Button } from "@/components/ui/button"
import { ConfidenceChart } from "@/components/ui/confidence-chart"
import { DistributionChart } from "@/components/ui/distribution-chart"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"
import { runMonteCarloSimulation, deriveParamsFromConfidence } from "@/lib/monte-carlo"

interface Factor {
    id: string
    label: string
    value: number
    min: number
    max: number
    unit?: string
    question?: string
    answer?: string
}

interface Outcome {
    id: string
    label: string
    value: number
    rangeMin: number
    rangeMax: number
    trend: "up" | "down" | "stable"
    description?: string
    confidence?: "high" | "medium" | "low"
    confidenceInterval?: string
    probability?: number
    impactScore?: number
    volatility?: number
}

interface SimulationResultsProps {
    title: string
    factors: Factor[]
    outcomes: Outcome[]
    status: "optimal" | "moderate" | "risk"
    recommendation?: string
    onBack: () => void
    showDownload?: boolean
}

export function SimulationResults({ title, factors, outcomes, status, recommendation, onBack, showDownload = true }: SimulationResultsProps) {
    const t = useTranslations('dashboard')

    // Recompute Monte Carlo from stored outcome params (or derive from confidence)
    const monteCarloResult = useMemo(() => {
        const mcParams = outcomes.map(o => ({
            probability: o.probability ?? deriveParamsFromConfidence(o.confidence ?? "medium").probability,
            impactScore: o.impactScore ?? deriveParamsFromConfidence(o.confidence ?? "medium").impactScore,
            volatility: o.volatility ?? deriveParamsFromConfidence(o.confidence ?? "medium").volatility,
        }))
        return runMonteCarloSimulation(mcParams)
    }, [outcomes])

    const statusConfig = {
        optimal: { label: t('results.optimal'), color: "text-green-600 dark:text-green-400", bg: "bg-green-500/10" },
        moderate: { label: t('results.moderate'), color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-500/10" },
        risk: { label: t('results.risk'), color: "text-red-600 dark:text-red-400", bg: "bg-red-500/10" },
    }

    const handleDownloadPDF = () => {
        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth()
        const margin = 20
        const contentWidth = pageWidth - margin * 2
        let y = 20

        const checkPageBreak = (needed: number) => {
            if (y + needed > doc.internal.pageSize.getHeight() - 20) {
                doc.addPage()
                y = 20
            }
        }

        // Header
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.text("shouldi", margin, y)
        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(120, 120, 120)
        doc.text("Decision Simulation Report", margin + 42, y)
        y += 4
        doc.setDrawColor(100, 100, 255)
        doc.setLineWidth(0.5)
        doc.line(margin, y, pageWidth - margin, y)
        y += 12

        // Title & Status
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        const titleLines = doc.splitTextToSize(title, contentWidth)
        doc.text(titleLines, margin, y)
        y += titleLines.length * 7 + 4

        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")
        const statusLabel = statusConfig[status].label
        const statusColor = status === "optimal" ? [34, 139, 34] : status === "moderate" ? [200, 160, 0] : [200, 50, 50]
        doc.setTextColor(statusColor[0], statusColor[1], statusColor[2])
        doc.text(`Status: ${statusLabel}`, margin, y)
        doc.setTextColor(120, 120, 120)
        doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 50, y)
        y += 12

        // Input Factors
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Input Factors", margin, y)
        y += 8

        factors.forEach((factor) => {
            checkPageBreak(20)
            doc.setFontSize(10)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(40, 40, 40)
            const qLines = doc.splitTextToSize(factor.question || factor.label, contentWidth - 10)
            doc.text(qLines, margin + 4, y)
            y += qLines.length * 5 + 2

            doc.setFont("helvetica", "normal")
            doc.setTextColor(80, 80, 80)
            doc.text(`Answer: ${factor.answer || 'N/A'}`, margin + 4, y)
            y += 8

            doc.setDrawColor(220, 220, 220)
            doc.setLineWidth(0.2)
            doc.line(margin + 4, y - 3, pageWidth - margin, y - 3)
        })

        y += 6

        // Predicted Outcomes
        checkPageBreak(20)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Predicted Outcomes", margin, y)
        y += 8

        outcomes.forEach((outcome) => {
            checkPageBreak(25)
            doc.setFontSize(11)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(40, 40, 40)
            doc.text(outcome.label, margin + 4, y)

            if (outcome.confidenceInterval) {
                doc.setFontSize(9)
                doc.setTextColor(100, 100, 255)
                doc.text(outcome.confidenceInterval, pageWidth - margin - 20, y)
            }
            y += 6

            if (outcome.description) {
                doc.setFontSize(9)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(80, 80, 80)
                const descLines = doc.splitTextToSize(outcome.description, contentWidth - 10)
                checkPageBreak(descLines.length * 4 + 4)
                doc.text(descLines, margin + 4, y)
                y += descLines.length * 4 + 2
            }

            y += 4
            doc.setDrawColor(220, 220, 220)
            doc.setLineWidth(0.2)
            doc.line(margin + 4, y - 2, pageWidth - margin, y - 2)
        })

        // Confidence Interval Chart
        y += 6
        checkPageBreak(20 + outcomes.length * 20)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(14)
        doc.setFont("helvetica", "bold")
        doc.text("Confidence Overview", margin, y)
        y += 10

        const barTrackWidth = contentWidth - 50
        const barHeight = 6
        const barX = margin + 4

        outcomes.forEach((outcome) => {
            checkPageBreak(24)

            // Label
            doc.setFontSize(9)
            doc.setFont("helvetica", "bold")
            doc.setTextColor(40, 40, 40)
            doc.text(outcome.label, barX, y)

            // Confidence interval text on right
            if (outcome.confidenceInterval) {
                doc.setFont("helvetica", "normal")
                doc.setTextColor(100, 100, 255)
                doc.text(outcome.confidenceInterval, pageWidth - margin - 20, y)
            }
            y += 4

            // Parse interval
            const intervalMatch = outcome.confidenceInterval?.match(/(\d+)\s*[-–]\s*(\d+)/)
            const rangeMin = intervalMatch ? parseInt(intervalMatch[1], 10) : 0
            const rangeMax = intervalMatch ? parseInt(intervalMatch[2], 10) : 0
            const mid = (rangeMin + rangeMax) / 2

            // Base color by confidence level
            const baseColor = mid >= 70 ? [34, 197, 94] : mid >= 45 ? [245, 158, 11] : [239, 68, 68]
            // Blend with white for opacity simulation: result = color * opacity + 255 * (1 - opacity)
            const fadedColor = baseColor.map(c => Math.round(c * 0.15 + 255 * 0.85))
            const solidColor = baseColor.map(c => Math.round(c * 0.7 + 255 * 0.3))

            // Track background
            doc.setFillColor(230, 230, 235)
            doc.roundedRect(barX, y, barTrackWidth, barHeight, 2, 2, "F")

            // Faded lead-in (0 to rangeMin)
            if (rangeMin > 0) {
                doc.setFillColor(fadedColor[0], fadedColor[1], fadedColor[2])
                const leadWidth = (rangeMin / 100) * barTrackWidth
                doc.roundedRect(barX, y, leadWidth, barHeight, 2, 2, "F")
            }

            // Range bar
            if (rangeMax > rangeMin) {
                doc.setFillColor(solidColor[0], solidColor[1], solidColor[2])
                const startX = barX + (rangeMin / 100) * barTrackWidth
                const rangeWidth = ((rangeMax - rangeMin) / 100) * barTrackWidth
                doc.roundedRect(startX, y, rangeWidth, barHeight, 2, 2, "F")
            }

            y += barHeight + 2

            // Scale markers
            doc.setFontSize(7)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(180, 180, 180)
            doc.text("0%", barX, y + 3)
            doc.text("50%", barX + barTrackWidth / 2 - 4, y + 3)
            doc.text("100%", barX + barTrackWidth - 8, y + 3)
            y += 8
        })

        // Monte Carlo Summary
        if (monteCarloResult) {
            checkPageBreak(30)
            y += 6
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text("Monte Carlo Analysis", margin, y)
            y += 8

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(60, 60, 60)
            doc.text(`Decision Score: ${Math.round(monteCarloResult.compositeScore)} / 100`, margin + 4, y)
            y += 5
            doc.text(`90% Confidence Range: ${Math.round(monteCarloResult.p5)} - ${Math.round(monteCarloResult.p95)}`, margin + 4, y)
            y += 5
            doc.text(`Risk of Poor Outcome (<40): ${Math.round(monteCarloResult.riskOfPoorOutcome * 100)}%`, margin + 4, y)
            y += 5
            doc.text(`Chance of Good Outcome (>=70): ${Math.round(monteCarloResult.chanceOfGoodOutcome * 100)}%`, margin + 4, y)
            y += 5
            doc.setTextColor(120, 120, 120)
            doc.setFontSize(8)
            doc.text(`Based on ${monteCarloResult.iterations.toLocaleString()} simulated scenarios`, margin + 4, y)
            y += 4
        }

        // Recommendation
        if (recommendation) {
            checkPageBreak(30)
            y += 4
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(14)
            doc.setFont("helvetica", "bold")
            doc.text("Recommendation", margin, y)
            y += 8

            doc.setFontSize(10)
            doc.setFont("helvetica", "normal")
            doc.setTextColor(60, 60, 60)
            const recLines = doc.splitTextToSize(recommendation, contentWidth - 10)
            checkPageBreak(recLines.length * 5 + 4)
            doc.text(recLines, margin + 4, y)
            y += recLines.length * 5 + 4
        }

        // Footer
        checkPageBreak(15)
        y += 8
        doc.setDrawColor(100, 100, 255)
        doc.setLineWidth(0.5)
        doc.line(margin, y, pageWidth - margin, y)
        y += 6
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text("Generated by shouldi - AI-Powered Decision Simulator | shouldi.io", margin, y)

        doc.save(`${title.replace(/\s+/g, '_')}_report.pdf`)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                    <div className={cn("inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-medium", statusConfig[status].bg, statusConfig[status].color)}>
                        {statusConfig[status].label}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onBack}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('results.back')}
                    </Button>
                    {showDownload && (
                        <Button onClick={handleDownloadPDF} className="gradient-primary text-white">
                            <Download className="mr-2 h-4 w-4" />
                            {t('results.downloadPdf')}
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Factors */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('results.inputFactors')}</h2>
                    <div className="space-y-4">
                        {factors.map((factor) => (
                            <div key={factor.id} className="py-3 border-b border-border last:border-0">
                                <p className="text-sm font-medium text-foreground mb-1">
                                    {factor.question || factor.label}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    <span className="text-foreground">{factor.answer || 'N/A'}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Predicted Outcomes */}
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('results.predictedOutcomes')}</h2>
                    <div className="space-y-6">
                        {outcomes.map((outcome) => (
                            <div key={outcome.id} className="space-y-3 pb-4 border-b border-border last:border-0 last:pb-0">
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="font-medium text-foreground">{outcome.label}</h3>
                                    {outcome.confidenceInterval && (
                                        <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                                            {outcome.confidenceInterval}
                                        </span>
                                    )}
                                </div>

                                {outcome.description && (
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                        {outcome.description}
                                    </p>
                                )}

                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Confidence Interval Chart */}
            <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">{t('results.confidenceChart')}</h2>
                <ConfidenceChart
                    items={outcomes.map(o => ({ label: o.label, confidenceInterval: o.confidenceInterval }))}
                />
            </div>

            {/* Monte Carlo Distribution */}
            {monteCarloResult && (
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-4">{t('results.monteCarloTitle')}</h2>
                    <DistributionChart
                        histogram={monteCarloResult.compositeHistogram}
                        compositeScore={monteCarloResult.compositeScore}
                        p5={monteCarloResult.p5}
                        p95={monteCarloResult.p95}
                        iterations={monteCarloResult.iterations}
                        riskOfPoorOutcome={monteCarloResult.riskOfPoorOutcome}
                        chanceOfGoodOutcome={monteCarloResult.chanceOfGoodOutcome}
                    />
                    <p className="text-xs text-muted-foreground mt-3">
                        {t('results.monteCarloDescription', { iterations: monteCarloResult.iterations })}
                    </p>
                </div>
            )}

            {/* Recommendation */}
            {recommendation && (
                <div className="rounded-xl border border-border bg-card p-6">
                    <h2 className="text-lg font-semibold mb-3">{t('results.recommendation')}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{recommendation}</p>
                </div>
            )}
        </div>
    )
}
