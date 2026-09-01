export interface NextStepsEmailContent {
  subject: string;
  html: string;
  text: string;
}

// Figtree (the site face) does not load reliably in email clients, so the
// template falls back to the platform UI stack. Everything else mirrors the
// house style: sharp corners, one blue accent, mono-style eyebrow label.
// Single-quoted font names: the stack is interpolated into double-quoted
// style="..." attributes, so double quotes here would terminate the attribute
// early and drop every declaration after font-family.
const FONT_STACK = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

export function buildNextStepsEmail(confirmUrl: string): NextStepsEmailContent {
  const subject = 'Your UX audit is booked — one thing before we start';
  const preheader = 'The last step is a quick intake — about ten minutes.';
  const bodyLine =
    'Before I can start, I need context on your product. It takes about ten minutes. ' +
    'The clock starts when your intake lands: once I have it, your audit is delivered within';

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<title>${subject}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>body,table,td,a{font-family:Arial,Helvetica,sans-serif !important;}</style>
<![endif]-->
</head>
<body style="margin:0; padding:0; background-color:#efefef;">
<span style="display:none !important; visibility:hidden; mso-hide:all; opacity:0; color:transparent; height:0; width:0; overflow:hidden;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#efefef;">
  <tr>
    <td align="center" style="padding:40px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; background-color:#ffffff;">
        <tr>
          <td style="padding:44px 48px 0 48px; font-family:${FONT_STACK}; font-size:14px; font-weight:600; letter-spacing:0.01em; color:#060606;">
            Brynn Caputo
          </td>
        </tr>
        <tr>
          <td style="padding:36px 48px 0 48px; font-family:${FONT_STACK}; font-size:11px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; color:#6b6b63;">
            UX Audit &middot; Next Step
          </td>
        </tr>
        <tr>
          <td style="padding:12px 48px 0 48px; font-family:${FONT_STACK}; font-size:26px; line-height:1.25; font-weight:700; letter-spacing:-0.02em; color:#060606;">
            Thanks — your UX audit is booked.
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px 0 48px; font-family:${FONT_STACK}; font-size:16px; line-height:1.6; color:#43443f;">
            ${bodyLine} <strong style="color:#060606;">5 business days</strong>.
          </td>
        </tr>
        <tr>
          <td style="padding:32px 48px 0 48px;">
            <!--[if mso]>
            <v:roundrect href="${confirmUrl}" style="height:52px; v-text-anchor:middle; width:264px;" arcsize="0%" strokecolor="#2e4bec" fillcolor="#2e4bec">
              <w:anchorlock/>
              <center style="color:#ffffff; font-family:Arial,sans-serif; font-size:15px; font-weight:bold;">Complete your intake &rarr;</center>
            </v:roundrect>
            <![endif]-->
            <!--[if !mso]><!-- -->
            <a href="${confirmUrl}" style="display:inline-block; background-color:#2e4bec; color:#ffffff; font-family:${FONT_STACK}; font-size:15px; font-weight:700; letter-spacing:0.01em; text-decoration:none; padding:16px 28px;">
              Complete your intake &rarr;
            </a>
            <!--<![endif]-->
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px 0 48px; font-family:${FONT_STACK}; font-size:13px; line-height:1.6; color:#6b6b63;">
            If the button doesn't work, paste this into your browser:<br>
            <a href="${confirmUrl}" style="color:#2e4bec; text-decoration:underline; word-break:break-all;">${confirmUrl}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 48px 0 48px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="border-top:1px solid #e1e1e1; font-size:0; line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 48px 0 48px; font-family:${FONT_STACK}; font-size:13px; line-height:1.6; color:#6b6b63;">
            Stripe has emailed your receipt separately.
          </td>
        </tr>
        <tr>
          <td style="padding:24px 48px 48px 48px; font-family:${FONT_STACK}; font-size:16px; line-height:1.6; color:#43443f;">
            Thanks!<br>— Brynn
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    'UX AUDIT / NEXT STEP',
    '',
    'Thanks — your UX audit is booked.',
    '',
    'Before I can start, I need context on your product. It takes about ten minutes. ' +
      'The clock starts when your intake lands: once I have it, your audit is delivered ' +
      'within 5 business days.',
    '',
    'Complete your intake:',
    confirmUrl,
    '',
    'Stripe has emailed your receipt separately.',
    '',
    'Thanks!',
    '— Brynn',
  ].join('\n');

  return { subject, html, text };
}

export interface ResendSendResult {
  data: unknown;
  error: { message: string; name?: string } | null;
}

export interface ResendClient {
  emails: {
    send: (params: {
      from: string;
      to: string;
      subject: string;
      html: string;
      text: string;
    }) => Promise<ResendSendResult>;
  };
}

export async function sendNextStepsEmail(
  resendClient: ResendClient,
  params: { to: string; confirmUrl: string; from: string }
): Promise<void> {
  const { subject, html, text } = buildNextStepsEmail(params.confirmUrl);
  const result = await resendClient.emails.send({ from: params.from, to: params.to, subject, html, text });

  // The Resend SDK does not throw on API-level rejections (e.g. sending to an
  // address the account isn't allowed to send to yet) — it resolves with
  // { data: null, error: {...} }. Silently discarding that made a real send
  // failure invisible: no log, no Resend dashboard entry, no thrown error.
  if (result.error) {
    throw new Error(`Resend rejected the email: ${result.error.message}`);
  }
}
