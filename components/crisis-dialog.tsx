"use client"

import { useTranslations } from 'next-intl'
import { Heart, Phone, MessageCircle, Globe } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface CrisisDialogProps {
  open: boolean
  onClose: () => void
}

export function CrisisDialog({ open, onClose }: CrisisDialogProps) {
  const t = useTranslations('moderation.crisis')

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 fill-red-500" />
            {t('title')}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p className="text-base text-foreground">
                {t('description')}
              </p>

              <p className="text-sm font-semibold text-foreground">
                {t('resources')}
              </p>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <Phone className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300">{t('hotlineDE')}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{t('hotlineDEDetail')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <Phone className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-700 dark:text-red-300">{t('hotlineUS')}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{t('hotlineUSDetail')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-blue-700 dark:text-blue-300">{t('hotlineCrisisText')}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">{t('hotlineCrisisTextDetail')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                <Globe className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">{t('hotlineInternational')}</p>
                  <p className="text-sm text-muted-foreground">{t('hotlineInternationalDetail')}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground italic">
                {t('encouragement')}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onClose} variant="outline">
            {t('close')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
