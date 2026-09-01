import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InterviewQuestionsDialog } from '@/components/tracker/interview-questions-dialog';
import type { Application } from '@/lib/api/tracker';

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

function application(overrides: Partial<Application> = {}): Application {
  return {
    application_id: 'app-1',
    job_id: 'job-1',
    resume_id: 'resume-1',
    master_resume_id: null,
    status: 'interview',
    company: 'Acme Corp',
    role: 'Backend Engineer',
    applied_at: null,
    interview_at: null,
    notes: null,
    interview_questions: ['How do you investigate an outage?'],
    position: 0,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('InterviewQuestionsDialog', () => {
  it('shows each question with its company and role', () => {
    render(<InterviewQuestionsDialog open onOpenChange={vi.fn()} applications={[application()]} />);

    expect(screen.getByText('How do you investigate an outage?')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp · Backend Engineer')).toBeInTheDocument();
  });

  it('shows an empty state when no application contains questions', () => {
    render(
      <InterviewQuestionsDialog
        open
        onOpenChange={vi.fn()}
        applications={[application({ interview_questions: [] })]}
      />
    );

    expect(screen.getByText('tracker.interviewQuestions.empty')).toBeInTheDocument();
  });
});
