export interface IntakeRow {
  timestamp: string;
  sessionId: string;
  tier: string;
  amount: number;
  companyName: string;
  clientName: string;
  email: string;
  description: string;
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
    row.links.join(', '),
    row.fileUrls.join(', '),
  ];
}

export interface SheetsWebAppClient {
  fetch: (url: string, init: RequestInit) => Promise<Response>;
}

export async function appendIntakeRow(
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
}
