"use client"

import React, { useState } from "react"
import { Briefcase, MapPin, Baby, Plus, FolderOpen, Trash2, MoreHorizontal, Home, TrendingUp, Sun, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
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
    briefcase: Briefcase,
    "map-pin": MapPin,
    baby: Baby,
    folder: FolderOpen,
    home: Home,
    "trending-up": TrendingUp,
    sun: Sun,
}

export function MobileSidebar() {
    const t = useTranslations('dashboard')
    const {
        scenarios,
        selectedScenario,
        selectScenario,
        createScenario,
        deleteScenario,
        scenariosLoading,
    } = useFirestore()

    const [open, setOpen] = useState(false)
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [newScenarioTitle, setNewScenarioTitle] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [scenarioToDelete, setScenarioToDelete] = useState<string | null>(null)
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

    const handleCreateScenario = async () => {
        if (!newScenarioTitle) return

        setIsCreating(true)
        try {
            const scenario = [
                { title: "Change Jobs", icon: "briefcase" },
                { title: "Buy vs Rent", icon: "home" },
                { title: "Move to a New City", icon: "map-pin" },
            ].find(s => s.title === newScenarioTitle)

            const icon = scenario ? scenario.icon : "folder"

            await createScenario(newScenarioTitle, t('sidebar.customScenario'), icon)
            setNewScenarioTitle("")
            setIsAddDialogOpen(false)
        } catch (error) {
            console.error("Failed to create scenario:", error)
        } finally {
            setIsCreating(false)
        }
    }

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

    const handleSelectScenario = (id: string) => {
        selectScenario(id)
        setOpen(false)
    }

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">{t('sidebar.openMenu')}</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                    <SheetHeader className="p-6 pb-0">
                        <SheetTitle>{t('sidebar.title')}</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto p-6">
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
                                            onClick={() => handleSelectScenario(scenario.id)}
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

                        <div className="mt-6">
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start gap-2 border-dashed text-muted-foreground hover:text-foreground"
                                    >
                                        <Plus className="h-4 w-4" />
                                        {t('sidebar.addScenario')}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('sidebar.createScenario')}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { title: "Change Jobs", icon: "briefcase" },
                                                { title: "Move to a New City", icon: "map-pin" },
                                                { title: "Buy vs Rent", icon: "home" },
                                            ].map((scenario) => (
                                                <Button
                                                    key={scenario.title}
                                                    variant={newScenarioTitle === scenario.title ? "default" : "outline"}
                                                    className="h-auto flex-col gap-2 py-4"
                                                    onClick={() => setNewScenarioTitle(scenario.title)}
                                                >
                                                    <div className="rounded-full bg-background p-2 text-foreground">
                                                        {iconMap[scenario.icon] ? (
                                                            React.createElement(iconMap[scenario.icon], { className: "h-4 w-4" })
                                                        ) : (
                                                            <FolderOpen className="h-4 w-4" />
                                                        )}
                                                    </div>
                                                    <span className="text-xs">{scenario.title}</span>
                                                </Button>
                                            ))}
                                        </div>
                                        <Button
                                            onClick={handleCreateScenario}
                                            disabled={!newScenarioTitle || isCreating}
                                            className="w-full"
                                        >
                                            {isCreating ? t('sidebar.creating') : t('sidebar.createSelected')}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

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
                </SheetContent>
            </Sheet>

            <UpgradeDialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen} />

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
        </>
    )
}
