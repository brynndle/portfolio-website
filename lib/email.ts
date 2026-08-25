export interface NextStepsEmailContent {
  subject: string;
  html: string;
}

export function buildNextStepsEmail(confirmUrl: string): NextStepsEmailContent {
  return {
    subject: 'Next steps for your consult',
    html: `<p>Thanks for booking a consult with Brynn Caputo.</p><p>Tell us about your project here: <a href="${confirmUrl}">${confirmUrl}</a></p>`,
  };
}

export interface ResendSendResult {
  data: unknown;
  error: { message: string; name?: string } | null;
}

export interface ResendClient {
  emails: {
    send: (params: { from: string; to: string; subject: string; html: string }) => Promise<ResendSendResult>;
  };
}

export async function sendNextStepsEmail(
  resendClient: ResendClient,
  params: { to: string; confirmUrl: string; from: string }
): Promise<void> {
  const { subject, html } = buildNextStepsEmail(params.confirmUrl);
  const result = await resendClient.emails.send({ from: params.from, to: params.to, subject, html });

  // The Resend SDK does not throw on API-level rejections (e.g. sending to an
  // address the account isn't allowed to send to yet) — it resolves with
  // { data: null, error: {...} }. Silently discarding that made a real send
  // failure invisible: no log, no Resend dashboard entry, no thrown error.
  if (result.error) {
    throw new Error(`Resend rejected the email: ${result.error.message}`);
  }
}
