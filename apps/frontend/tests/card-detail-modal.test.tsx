import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CardDetailModal } from '@/components/tracker/card-detail-modal';
import type { ApplicationDetail } from '@/lib/api/tracker';

const mocks = vi.hoisted(() => ({
  getApplicationDetail: vi.fn(),
  updateApplication: vi.fn(),
}));

vi.mock('@/lib/i18n', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api/tracker', () => ({
  getApplicationDetail: mocks.getApplicationDetail,
  updateApplication: mocks.updateApplication,
}));

const detail: ApplicationDetail = {
  application_id: 'app-1',
  job_id: 'job-1',
  resume_id: 'resume-1',
  master_resume_id: null,
  status: 'interview',
  company: 'Acme Corp',
  role: 'Backend Engineer',
  applied_at: null,
  notes: null,
  interview_questions: ['What is your incident response process?'],
  position: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  job_content: 'Job description',
  resume: null,
};

describe('CardDetailModal', () => {
  it('appends a non-empty interview question to the application', async () => {
    mocks.getApplicationDetail.mockResolvedValue(detail);
    mocks.updateApplication.mockResolvedValue({
      ...detail,
      interview_questions: [
        ...detail.interview_questions,
        'How do you prioritize reliability work?',
      ],
    });
    const onUpdated = vi.fn();

    render(
      <CardDetailModal
        applicationId={detail.application_id}
        open
        onOpenChange={vi.fn()}
        onUpdated={onUpdated}
      />
    );

    const questionInput = await screen.findByLabelText('tracker.interviewQuestions.addLabel');
    fireEvent.change(questionInput, {
      target: { value: 'How do you prioritize reliability work?' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'tracker.interviewQuestions.save' }));

    await waitFor(() => {
      expect(mocks.updateApplication).toHaveBeenCalledWith(detail.application_id, {
        interview_questions: [
          'What is your incident response process?',
          'How do you prioritize reliability work?',
        ],
      });
    });
    expect(onUpdated).toHaveBeenCalledOnce();
  });
});
