'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ToggleSwitch } from '@/components/ui/toggle-switch';
import { useTranslations } from '@/lib/i18n';
import { APPLICATION_STATUS_ORDER, type ApplicationStatus } from '@/lib/api/tracker';

interface TrackerColumnManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visibleStatuses: ApplicationStatus[];
  onVisibilityChange: (status: ApplicationStatus, visible: boolean) => void;
}

export function TrackerColumnManagerDialog({
  open,
  onOpenChange,
  visibleStatuses,
  onVisibilityChange,
}: TrackerColumnManagerDialogProps) {
  const { t } = useTranslations();
  const visibleSet = new Set(visibleStatuses);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('tracker.manage.title')}</DialogTitle>
          <DialogDescription>{t('tracker.manage.description')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {APPLICATION_STATUS_ORDER.map((status) => (
            <ToggleSwitch
              key={status}
              checked={visibleSet.has(status)}
              onCheckedChange={(visible) => onVisibilityChange(status, visible)}
              label={t(`tracker.columns.${status}`)}
            />
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('tracker.manage.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
