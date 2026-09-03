export interface IntakeRow {
  timestamp: string;
  sessionId: string;
  tier: string;
  amount: number;
  companyName: string;
  clientName: string;
  email: string;
  description: string;
  acquisition: string;
  audienceLevel: string;
  primaryProblem: string;
  links: string[];
  fileUrls: string[];
}

export function formatIntakeRowValues(row: IntakeRow): string[] {
  return [
    row.timestamp,
    row.sessionId,
    row.tier,
    String(row.amount),
    row.companyName,
    row.clientName,
    row.email,
    row.description,
    row.acquisition,
    row.audienceLevel,
    row.primaryProblem,
    row.links.join(', '),
    row.fileUrls.join(', '),
  ];
}

export interface SheetsWebAppClient {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
}

async function attemptAppend(
  client: SheetsWebAppClient,
  webAppUrl: string,
  secret: string,
  row: IntakeRow
): Promise<void> {
  const response = await client.fetch(webAppUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, values: formatIntakeRowValues(row) }),
  });

  if (!response.ok) {
    throw new Error(`Sheets web app responded with ${response.status}`);
  }

  // Apps Script always answers HTTP 200, even on its own internal errors —
  // the real result lives in the JSON body, so a non-JSON or non-ok body is
  // a failure the status code alone won't reveal.
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    throw new Error('Sheets web app returned a non-JSON response');
  }

  if (!body || typeof body !== 'object' || (body as { ok?: unknown }).ok !== true) {
    throw new Error('Sheets web app did not confirm the write');
  }
}

const RETRY_DELAYS_MS = [250, 750];

export async function appendIntakeRow(
  client: SheetsWebAppClient,
  webAppUrl: string,
  secret: string,
  row: IntakeRow
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    try {
      await attemptAppend(client, webAppUrl, secret, row);
      return;
    } catch (error) {
      lastError = error;
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay !== undefined) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
