"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Loader2, ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
    generateSurveyQuestions,
    generateOutcomes,
    type SurveyQuestion,
    type GeminiOutcomeResponse
} from "@/lib/gemini-service"
import { useFirestore } from "@/contexts/firestore-context"
import { runMonteCarloSimulation, deriveParamsFromConfidence, type MonteCarloResult } from "@/lib/monte-carlo"
import { DistributionChart } from "@/components/ui/distribution-chart"

interface AddSimulationModalProps {
    isOpen: boolean
    onClose: () => void
    scenarioTitle: string
}

type SurveyStep = "loading" | "questions" | "generating" | "saving" | "results"

export function AddSimulationModal({ isOpen, onClose, scenarioTitle }: AddSimulationModalProps) {
    const t = useTranslations('survey')
    const [step, setStep] = useState<SurveyStep>("loading")
    const [questions, setQuestions] = useState<SurveyQuestion[]>([])
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [answers, setAnswers] = useState<Record<string, { question: string; answer: string }>>({})
    const [outcomes, setOutcomes] = useState<GeminiOutcomeResponse | null>(null)
    const [monteCarloResult, setMonteCarloResult] = useState<MonteCarloResult | null>(null)

    const { createSimulation, canCreateSimulation } = useFirestore()
    const canSave = canCreateSimulation()

    // Construct the question from the scenario title
    const userQuestion = `Should I ${scenarioTitle.toLowerCase()}?`

    useEffect(() => {
        if (isOpen && scenarioTitle) {
            loadQuestions()
        }
    }, [isOpen, scenarioTitle])

    useEffect(() => {
        if (!isOpen) {
            setStep("loading")
            setQuestions([])
            setCurrentQuestion(0)
            setAnswers({})
            setOutcomes(null)
            setMonteCarloResult(null)
        }
    }, [isOpen])

    const loadQuestions = async () => {
        setStep("loading")
        try {
            const response = await generateSurveyQuestions(userQuestion, 6)
            setQuestions(response.questions)
            setStep("questions")
        } catch (error) {
            console.error("Failed to load questions:", error)
            onClose()
        }
    }

    const handleAnswer = (questionId: string, question: string, optionLabel: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: { question, answer: optionLabel }
        }))
    }

    const handleNext = async () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1)
        } else {
            setStep("generating")
            try {
                const response = await generateOutcomes(userQuestion, answers)
                setOutcomes(response)

                // Run Monte Carlo simulation
                const mcParams = response.outcomes.map(o => ({
                    probability: o.probability ?? deriveParamsFromConfidence(o.confidence).probability,
                    impactScore: o.impactScore ?? deriveParamsFromConfidence(o.confidence).impactScore,
                    volatility: o.volatility ?? deriveParamsFromConfidence(o.confidence).volatility,
                }))
                const mcResult = runMonteCarloSimulation(mcParams)
                setMonteCarloResult(mcResult)

                if (canSave) {
                    setStep("saving")
                    await saveSimulation(response, mcResult)
                }

                setStep("results")
            } catch (error) {
                console.error("Failed to generate outcomes:", error)
                setStep("results")
            }
        }
    }

    const saveSimulation = async (outcomeData: GeminiOutcomeResponse, mcResultParam?: MonteCarloResult) => {
        try {
            const mcData = mcResultParam ?? monteCarloResult
            const simulationOutcomes = outcomeData.outcomes.map((outcome, index) => {
                const mcOutcome = mcData?.outcomeResults[index]
                return {
                    id: `outcome-${index}`,
                    label: outcome.title,
                    value: mcOutcome ? Math.round(mcOutcome.mean) : (outcome.confidence === 'high' ? 80 : outcome.confidence === 'medium' ? 60 : 40),
                    rangeMin: mcOutcome ? Math.round(mcOutcome.p5) : (outcome.confidence === 'high' ? 70 : outcome.confidence === 'medium' ? 45 : 25),
                    rangeMax: mcOutcome ? Math.round(mcOutcome.p95) : (outcome.confidence === 'high' ? 90 : outcome.confidence === 'medium' ? 75 : 55),
                    trend: outcome.confidence === 'high' ? 'up' as const : outcome.confidence === 'medium' ? 'stable' as const : 'down' as const,
                    probability: outcome.probability,
                    impactScore: outcome.impactScore,
                    volatility: outcome.volatility,
                }
            })

            const simulationFactors = Object.entries(answers).slice(0, 4).map(([, { question, answer }], index) => {
                let value = 50
                const lowerAnswer = answer.toLowerCase()
                if (lowerAnswer.includes('very') && (lowerAnswer.includes('happy') || lowerAnswer.includes('confident') || lowerAnswer.includes('prepared') || lowerAnswer.includes('extensively'))) {
                    value = 90
                } else if (lowerAnswer.includes('okay') || lowerAnswer.includes('fairly') || lowerAnswer.includes('quite') || lowerAnswer.includes('some') || lowerAnswer.includes('reasonably')) {
                    value = 70
                } else if (lowerAnswer.includes('somewhat') || lowerAnswer.includes('little') || lowerAnswer.includes('slightly')) {
                    value = 40
                } else if (lowerAnswer.includes('not') || lowerAnswer.includes('no ') || lowerAnswer.includes('unhappy')) {
                    value = 20
                }

                return {
                    id: `factor-${index}`,
                    label: question.length > 30 ? question.substring(0, 27) + '...' : question,
                    value,
                    min: 0,
                    max: 100,
                    unit: '%'
                }
            })

            const avgValue = simulationOutcomes.reduce((acc, o) => acc + o.value, 0) / simulationOutcomes.length
            const status: "optimal" | "moderate" | "risk" = avgValue >= 70 ? "optimal" : avgValue >= 40 ? "moderate" : "risk"

            const inputSummary = simulationFactors.slice(0, 2).map(f => ({
                label: f.label,
                value: `${f.value}${f.unit}`
            }))

            const primaryOutcome = simulationOutcomes[0]
            const outcomeSummary = {
                label: primaryOutcome.label,
                value: `${primaryOutcome.value}%`,
                trend: primaryOutcome.trend === 'up' ? 'positive' as const : primaryOutcome.trend === 'down' ? 'negative' as const : 'neutral' as const
            }

            await createSimulation({
                title: `Simulation ${new Date().toLocaleDateString()}`,
                status,
                factors: simulationFactors,
                outcomes: simulationOutcomes,
                inputSummary,
                outcomeSummary
            })
        } catch (error) {
            console.error("Failed to save simulation:", error)
        }
    }

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1)
        }
    }

    const currentQ = questions[currentQuestion]
    const isAnswered = currentQ && answers[currentQ.id]
    const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        {step === "results" ? t('results') : t('title')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === "loading" && t('loading')}
                        {step === "questions" && (
                            <span className="font-medium text-foreground">&quot;{userQuestion}&quot;</span>
                        )}
                        {step === "generating" && t('generating')}
                        {step === "saving" && t('saving')}
                        {step === "results" && t('resultsDescription')}
                    </DialogDescription>
                </DialogHeader>

                {/* Loading State */}
                {step === "loading" && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">{t('preparingQuestions')}</p>
                    </div>
                )}

                {/* Questions State */}
                {step === "questions" && currentQ && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    {t('questionOf', { current: currentQuestion + 1, total: questions.length })}
                                </span>
                                <span className="text-primary font-medium">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-foreground">
                                {currentQ.question}
                            </h3>

                            <div className="space-y-3">
                                {currentQ.options.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleAnswer(currentQ.id, currentQ.question, option.label)}
                                        className={cn(
                                            "w-full p-4 text-left rounded-lg border-2 transition-all duration-200",
                                            answers[currentQ.id]?.answer === option.label
                                                ? "border-primary bg-primary/10 text-foreground"
                                                : "border-border hover:border-primary/50 hover:bg-secondary/50 text-foreground"
                                        )}
                                    >
                                        <span className="font-medium">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                disabled={currentQuestion === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t('back')}
                            </Button>
                            <Button
                                onClick={handleNext}
                                disabled={!isAnswered || !canSave}
                                className="gap-2"
                            >
                                {currentQuestion === questions.length - 1 ? t('seeResults') : t('next')}
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Generating State */}
                {(step === "generating" || step === "saving") && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-sm text-muted-foreground">
                            {step === "generating" ? t('analyzingResponses') : t('savingResults')}
                        </p>
                    </div>
                )}

                {/* Results State */}
                {step === "results" && outcomes && (
                    <div className="space-y-6">
                        {canSave && (
                            <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    {t('savedSuccessfully')}
                                </span>
                            </div>
                        )}

                        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                            <h4 className="font-semibold text-primary mb-2">{t('summary')}</h4>
                            <p className="text-sm text-foreground">{outcomes.summary}</p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold text-foreground">{t('possibleOutcomes')}</h4>
                            {outcomes.outcomes.map((outcome, index) => (
                                <div
                                    key={index}
                                    className="p-4 rounded-lg border border-border bg-card"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h5 className="font-medium text-foreground">{outcome.title}</h5>
                                        <span className={cn(
                                            "text-xs font-medium px-2 py-1 rounded-full",
                                            outcome.confidence === "high" && "bg-green-500/10 text-green-600 dark:text-green-400",
                                            outcome.confidence === "medium" && "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
                                            outcome.confidence === "low" && "bg-red-500/10 text-red-600 dark:text-red-400"
                                        )}>
                                            {t(`confidence.${outcome.confidence}`)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {outcome.description}
                                    </p>
                                    <div className="text-sm">
                                        <span className="font-medium text-foreground">{t('recommendation')}: </span>
                                        <span className="text-muted-foreground">{outcome.recommendation}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Monte Carlo Distribution */}
                        {monteCarloResult && (
                            <div className="p-4 rounded-lg border border-border bg-card">
                                <h4 className="font-semibold text-foreground mb-3">{t('monteCarlo.title')}</h4>
                                <DistributionChart
                                    histogram={monteCarloResult.compositeHistogram}
                                    compositeScore={monteCarloResult.compositeScore}
                                    p5={monteCarloResult.p5}
                                    p95={monteCarloResult.p95}
                                    iterations={monteCarloResult.iterations}
                                    riskOfPoorOutcome={monteCarloResult.riskOfPoorOutcome}
                                    chanceOfGoodOutcome={monteCarloResult.chanceOfGoodOutcome}
                                />
                                <p className="text-xs text-muted-foreground mt-2">
                                    {t('monteCarlo.basedOn', { iterations: monteCarloResult.iterations })}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <Button onClick={onClose} className="gap-2 gradient-primary text-white">
                                {t('done')}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
