import { describe, it, expect, vi } from 'vitest';
import { buildNextStepsEmail, sendNextStepsEmail } from './email';

describe('buildNextStepsEmail', () => {
  it('includes the confirm link in the html body', () => {
    const { subject, html } = buildNextStepsEmail('https://brynncaputo.com/confirm?session_id=sess_1');
    expect(subject).toContain('Next steps');
    expect(html).toContain('https://brynncaputo.com/confirm?session_id=sess_1');
  });
});

describe('sendNextStepsEmail', () => {
  it('calls the resend client with the built subject/html', async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: 'email_1' }, error: null });
    const resendClient = { emails: { send } };

    await sendNextStepsEmail(resendClient, {
      to: 'client@example.com',
      confirmUrl: 'https://brynncaputo.com/confirm?session_id=sess_1',
      from: 'Brynn Caputo <hi@brynncaputo.com>',
    });

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Brynn Caputo <hi@brynncaputo.com>',
        to: 'client@example.com',
        subject: expect.stringContaining('Next steps'),
        html: expect.stringContaining('sess_1'),
      })
    );
  });

  it('throws when Resend resolves with an error instead of throwing', async () => {
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'You can only send testing emails to your own email address' },
    });
    const resendClient = { emails: { send } };

    await expect(
      sendNextStepsEmail(resendClient, {
        to: 'client@example.com',
        confirmUrl: 'https://brynncaputo.com/confirm?session_id=sess_1',
        from: 'Brynn Caputo <hi@brynncaputo.com>',
      })
    ).rejects.toThrow('You can only send testing emails to your own email address');
  });
});
