import { describe, it, expect, vi } from 'vitest';
import { formatIntakeRowValues, appendIntakeRow, type IntakeRow } from './sheets';

const row: IntakeRow = {
  timestamp: '2026-08-24T00:00:00.000Z',
  sessionId: 'sess_1',
  tier: 'small-company',
  amount: 50000,
  companyName: 'Acme',
  clientName: 'Jane Client',
  email: 'jane@example.com',
  description: 'Our checkout flow converts poorly.',
  links: ['https://acme.com', 'https://acme.com/pricing'],
  fileUrls: ['https://blob.vercel-storage.com/file1.pdf'],
};

describe('formatIntakeRowValues', () => {
  it('flattens the row into a single array of strings, joining links and files', () => {
    expect(formatIntakeRowValues(row)).toEqual([
      '2026-08-24T00:00:00.000Z',
      'sess_1',
      'small-company',
      '50000',
      'Acme',
      'Jane Client',
      'jane@example.com',
      'Our checkout flow converts poorly.',
      'https://acme.com, https://acme.com/pricing',
      'https://blob.vercel-storage.com/file1.pdf',
    ]);
  });
});

describe('appendIntakeRow', () => {
  it('calls values.append with the formatted row', async () => {
    const append = vi.fn().mockResolvedValue({});
    const sheetsClient = { spreadsheets: { values: { append } } };

    await appendIntakeRow(sheetsClient, 'sheet_123', row);

    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        spreadsheetId: 'sheet_123',
        requestBody: { values: [formatIntakeRowValues(row)] },
      })
    );
  });
});
