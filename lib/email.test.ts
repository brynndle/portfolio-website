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
    const send = vi.fn().mockResolvedValue({ id: 'email_1' });
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
});
