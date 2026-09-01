'use client';

import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/lib/i18n';
import type { Application } from '@/lib/api/tracker';

interface InterviewQuestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applications: Application[];
}

interface InterviewQuestionSource {
  applicationId: string;
  question: string;
  company: string | null;
  role: string | null;
}

export function InterviewQuestionsDialog({
  open,
  onOpenChange,
  applications,
}: InterviewQuestionsDialogProps) {
  const { t } = useTranslations();
  const questions = useMemo<InterviewQuestionSource[]>(
    () =>
      applications.flatMap((application) =>
        application.interview_questions.map((question) => ({
          applicationId: application.application_id,
          question,
          company: application.company,
          role: application.role,
        }))
      ),
    [applications]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('tracker.interviewQuestions.title')}</DialogTitle>
          <DialogDescription>{t('tracker.interviewQuestions.description')}</DialogDescription>
        </DialogHeader>

        {questions.length === 0 ? (
          <p className="border border-dashed border-black bg-paper-tint p-4 text-center font-mono text-xs text-ink-soft">
            {t('tracker.interviewQuestions.empty')}
          </p>
        ) : (
          <ol className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
            {questions.map((item, index) => {
              const company = item.company?.trim() || t('tracker.card.companyUnknown');
              const role = item.role?.trim();
              return (
                <li
                  key={`${item.applicationId}-${index}`}
                  className="border border-black bg-background p-4 shadow-sw-xs"
                >
                  <p className="whitespace-pre-wrap text-sm text-ink">{item.question}</p>
                  <p className="mt-3 border-t border-black pt-2 font-mono text-[11px] uppercase tracking-wide text-ink-soft">
                    {company}
                    {role ? ` · ${role}` : ''}
                  </p>
                </li>
              );
            })}
          </ol>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('tracker.interviewQuestions.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
