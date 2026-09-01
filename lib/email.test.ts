import { describe, it, expect, vi } from 'vitest';
import { buildNextStepsEmail, sendNextStepsEmail } from './email';

describe('buildNextStepsEmail', () => {
  it('names the audit in the subject', () => {
    const { subject } = buildNextStepsEmail('https://brynncaputo.com/confirm?session_id=sess_1');
    expect(subject).toContain('booked');
  });

  it('includes the confirm link in both the html and text bodies', () => {
    const url = 'https://brynncaputo.com/confirm?session_id=sess_1';
    const { html, text } = buildNextStepsEmail(url);
    expect(html).toContain(url);
    expect(text).toContain(url);
  });

  it('wraps the button in an mso conditional so Outlook gets the VML fallback', () => {
    const { html } = buildNextStepsEmail('https://brynncaputo.com/confirm?session_id=sess_1');
    expect(html).toContain('<!--[if mso]>');
    expect(html).toContain('v:roundrect');
  });
});

describe('sendNextStepsEmail', () => {
  it('calls the resend client with the built subject, html, and text', async () => {
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
        subject: expect.stringContaining('booked'),
        html: expect.stringContaining('sess_1'),
        text: expect.stringContaining('sess_1'),
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
