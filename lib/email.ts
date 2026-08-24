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

export interface ResendClient {
  emails: {
    send: (params: { from: string; to: string; subject: string; html: string }) => Promise<unknown>;
  };
}

export async function sendNextStepsEmail(
  resendClient: ResendClient,
  params: { to: string; confirmUrl: string; from: string }
): Promise<void> {
  const { subject, html } = buildNextStepsEmail(params.confirmUrl);
  await resendClient.emails.send({ from: params.from, to: params.to, subject, html });
}
