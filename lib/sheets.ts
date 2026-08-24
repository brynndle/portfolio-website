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

export interface SheetsValuesClient {
  spreadsheets: {
    values: {
      append: (params: Record<string, unknown>) => Promise<unknown>;
    };
  };
}

export async function appendIntakeRow(
  sheetsClient: SheetsValuesClient,
  sheetId: string,
  row: IntakeRow
): Promise<void> {
  await sheetsClient.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: 'Sheet1!A:J',
    valueInputOption: 'RAW',
    requestBody: { values: [formatIntakeRowValues(row)] },
  });
}
