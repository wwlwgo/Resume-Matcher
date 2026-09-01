'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/lib/i18n';
import { getApplicationDetail, updateApplication, type ApplicationDetail } from '@/lib/api/tracker';

interface CardDetailModalProps {
  applicationId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

export function CardDetailModal({
  applicationId,
  open,
  onOpenChange,
  onUpdated,
}: CardDetailModalProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const [detail, setDetail] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [interviewAt, setInterviewAt] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesError, setNotesError] = useState<string | null>(null);
  const [savingInterviewTime, setSavingInterviewTime] = useState(false);
  const [interviewTimeError, setInterviewTimeError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [savingQuestion, setSavingQuestion] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !applicationId) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getApplicationDetail(applicationId)
      .then((data) => {
        if (cancelled) return;
        setDetail(data);
        setNotes(data.notes ?? '');
        setInterviewAt(toDateTimeLocal(data.interview_at));
        setNotesError(null);
        setInterviewTimeError(null);
        setQuestion('');
        setQuestionError(null);
      })
      .catch(() => {
        if (!cancelled) setDetail(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, applicationId]);

  // Keep textarea Enter from bubbling to dialog/global handlers.
  const handleNotesKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') e.stopPropagation();
  };

  const handleSaveNotes = async () => {
    if (!applicationId) return;
    setSavingNotes(true);
    setNotesError(null);
    try {
      const updated = await updateApplication(applicationId, { notes });
      setDetail((current) => (current ? { ...current, ...updated } : current));
      setNotes(updated.notes ?? '');
      onUpdated();
    } catch {
      // Show a generic message — never echo raw backend error text inline,
      // which could contain sensitive values.
      setNotesError(t('common.error'));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleSaveInterviewTime = async () => {
    if (!applicationId || detail?.status !== 'interview') return;
    setSavingInterviewTime(true);
    setInterviewTimeError(null);
    try {
      const updated = await updateApplication(applicationId, {
        interview_at: interviewAt ? new Date(interviewAt).toISOString() : null,
      });
      setDetail((current) => (current ? { ...current, ...updated } : current));
      setInterviewAt(toDateTimeLocal(updated.interview_at));
      onUpdated();
    } catch {
      setInterviewTimeError(t('common.error'));
    } finally {
      setSavingInterviewTime(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!applicationId || !detail || !question.trim()) return;
    setSavingQuestion(true);
    setQuestionError(null);
    try {
      const updated = await updateApplication(applicationId, {
        interview_questions: [...detail.interview_questions, question.trim()],
      });
      setDetail({ ...detail, interview_questions: updated.interview_questions });
      setQuestion('');
      onUpdated();
    } catch {
      setQuestionError(t('common.error'));
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = async (questionIndex: number) => {
    if (!applicationId || !detail) return;
    setSavingQuestion(true);
    setQuestionError(null);
    try {
      const updated = await updateApplication(applicationId, {
        interview_questions: detail.interview_questions.filter(
          (_, index) => index !== questionIndex
        ),
      });
      setDetail((current) =>
        current ? { ...current, interview_questions: updated.interview_questions } : current
      );
      onUpdated();
    } catch {
      setQuestionError(t('common.error'));
    } finally {
      setSavingQuestion(false);
    }
  };

  const resumeAvailable = Boolean(detail?.resume);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{detail?.company || t('tracker.card.companyUnknown')}</DialogTitle>
          <DialogDescription>{detail?.role || t('tracker.card.roleUnknown')}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-steel-grey" />
          </div>
        ) : detail ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-ink-soft">
              <span className="border border-black bg-paper-tint px-2 py-0.5">
                {t(`tracker.columns.${detail.status}`)}
              </span>
              {detail.applied_at && (
                <span>
                  {new Date(detail.applied_at).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>

            {detail.status === 'interview' && (
              <div className="space-y-1 border-y border-black bg-paper-tint p-3">
                <Label htmlFor="card-interview-at">{t('tracker.modal.interviewTime')}</Label>
                <Input
                  id="card-interview-at"
                  type="datetime-local"
                  value={interviewAt}
                  onChange={(e) => setInterviewAt(e.target.value)}
                />
                <div className="flex items-center justify-end gap-3">
                  {interviewTimeError && (
                    <span className="font-mono text-xs text-destructive">{interviewTimeError}</span>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSaveInterviewTime}
                    disabled={savingInterviewTime}
                  >
                    {savingInterviewTime ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      t('tracker.modal.saveChanges')
                    )}
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label>{t('tracker.modal.jobDescription')}</Label>
              <div className="max-h-48 overflow-y-auto whitespace-pre-wrap border border-black bg-background p-3 text-sm">
                {detail.job_content || t('tracker.modal.noJobDescription')}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="card-interview-question">
                {t('tracker.interviewQuestions.addLabel')}
              </Label>
              <Textarea
                id="card-interview-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleNotesKeyDown}
                placeholder={t('tracker.interviewQuestions.addPlaceholder')}
                rows={3}
              />
              <div className="flex items-center justify-end gap-3">
                {questionError && (
                  <span className="font-mono text-xs text-destructive">{questionError}</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveQuestion}
                  disabled={savingQuestion || !question.trim()}
                >
                  {savingQuestion ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('tracker.interviewQuestions.save')
                  )}
                </Button>
              </div>
              {detail.interview_questions.length > 0 && (
                <ul className="space-y-2 border-t border-black pt-3">
                  {detail.interview_questions.map((recordedQuestion, index) => (
                    <li
                      key={`${recordedQuestion}-${index}`}
                      className="flex items-start justify-between gap-3 border border-black bg-paper-tint p-2"
                    >
                      <p className="whitespace-pre-wrap text-sm text-ink">{recordedQuestion}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteQuestion(index)}
                        disabled={savingQuestion}
                      >
                        {t('tracker.interviewQuestions.delete')}
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="card-notes">{t('tracker.modal.notes')}</Label>
              <Textarea
                id="card-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onKeyDown={handleNotesKeyDown}
                placeholder={t('tracker.modal.notesPlaceholder')}
                rows={3}
              />
              <div className="flex items-center justify-end gap-3">
                {notesError && (
                  <span className="font-mono text-xs text-destructive">{notesError}</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                >
                  {savingNotes ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    t('tracker.modal.saveNotes')
                  )}
                </Button>
              </div>
            </div>

            {!resumeAvailable && (
              <p className="font-mono text-xs text-warning">
                {t('tracker.modal.resumeUnavailable')}
              </p>
            )}
          </div>
        ) : (
          <p className="py-6 text-center font-mono text-sm text-steel-grey">
            {t('tracker.modal.loadFailed')}
          </p>
        )}

        <DialogFooter>
          <Button
            onClick={() => {
              if (detail?.resume_id) router.push(`/builder?id=${detail.resume_id}`);
            }}
            disabled={!resumeAvailable}
          >
            <Pencil className="h-4 w-4" />
            {t('tracker.modal.editResume')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toDateTimeLocal(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
