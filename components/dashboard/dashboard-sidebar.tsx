"use client"

import React, { useState } from "react"
import { Briefcase, MapPin, FolderOpen, Trash2, MoreHorizontal, Home, TrendingUp, Sun, HelpCircle, GraduationCap, DollarSign, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useFirestore } from "@/contexts/firestore-context"
import { useTranslations } from "next-intl"
import { UpgradeDialog } from "./upgrade-dialog"

const iconMap: Record<string, React.ElementType> = {
    Briefcase: Briefcase,
    briefcase: Briefcase,
    "map-pin": MapPin,
    MapPin: MapPin,
    folder: FolderOpen,
    Home: Home,
    home: Home,
    "trending-up": TrendingUp,
    sun: Sun,
    HelpCircle: HelpCircle,
    GraduationCap: GraduationCap,
    DollarSign: DollarSign,
    Heart: Heart,
}

export function DashboardSidebar() {
    const t = useTranslations('dashboard')
    const {
        scenarios,
        selectedScenario,
        selectScenario,
        deleteScenario,
        scenariosLoading,
        freeTierLimits,
    } = useFirestore()

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

    const handleDeleteScenario = async () => {
        if (!scenarioToDelete) return

        try {
            await deleteScenario(scenarioToDelete)
        } catch (error) {
            console.error("Failed to delete scenario:", error)
        } finally {
            setScenarioToDelete(null)
            setDeleteDialogOpen(false)
        }
    }

    return (
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-72 flex-col border-r border-border bg-card/30 lg:flex">
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t('sidebar.title')}
                    </h3>
                </div>

                {scenariosLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                ) : (
                    <div className="space-y-1">
                        {scenarios.map((scenario) => {
                            const Icon = iconMap[scenario.icon] || FolderOpen
                            const isActive = selectedScenario?.id === scenario.id

                            return (
                                <div
                                    key={scenario.id}
                                    className={cn(
                                        "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer",
                                        isActive
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                    onClick={() => selectScenario(scenario.id)}
                                >
                                    <Icon
                                        className={cn(
                                            "h-4 w-4",
                                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                        )}
                                    />
                                    <div className="flex flex-1 flex-col items-start gap-0.5">
                                        <span>{scenario.title}</span>
                                        <span className="text-xs font-normal text-muted-foreground">
                                            {scenario.simulationCount} {scenario.simulationCount !== 1 ? t('sidebar.simulations') : t('sidebar.simulation')}
                                        </span>
                                    </div>

                                    {!scenario.isDefault && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setScenarioToDelete(scenario.id)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t('sidebar.delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Free tier usage indicator */}
                <div className="mt-4 mb-2 px-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Scenarios</span>
                        <span>{scenarios.length}/{freeTierLimits.maxScenarios}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-300",
                                scenarios.length >= freeTierLimits.maxScenarios ? "bg-yellow-500" : "bg-primary"
                            )}
                            style={{ width: `${Math.min(100, (scenarios.length / freeTierLimits.maxScenarios) * 100)}%` }}
                        />
                    </div>
                </div>

            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('sidebar.deleteScenarioTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('sidebar.deleteScenarioDescription')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('sidebar.cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteScenario}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {t('sidebar.delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <div className="border-t border-border p-4">
                <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4">
                    <h4 className="mb-1 text-sm font-semibold text-primary">{t('sidebar.proFeatures')}</h4>
                    <p className="text-xs text-muted-foreground">{t('sidebar.proDescription')}</p>
                    <Button
                        size="sm"
                        className="mt-3 w-full gradient-primary text-white"
                        onClick={() => setUpgradeDialogOpen(true)}
                    >
                        {t('sidebar.upgradePlan')}
                    </Button>
                </div>
            </div>

            <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />
        </aside>
    )
}
