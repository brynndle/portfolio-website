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
  acquisition: 'Organic search and word of mouth.',
  audienceLevel: 'Mostly novices trying it for the first time.',
  primaryProblem: 'People bounce before reaching pricing.',
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
      'Organic search and word of mouth.',
      'Mostly novices trying it for the first time.',
      'People bounce before reaching pricing.',
      'https://acme.com, https://acme.com/pricing',
      'https://blob.vercel-storage.com/file1.pdf',
    ]);
  });
});

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

describe('appendIntakeRow', () => {
  it('POSTs the formatted row and secret to the web app URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { ok: true }));
    const client = { fetch: fetchMock };

    await appendIntakeRow(client, 'https://script.google.com/macros/s/abc/exec', 'shh', row);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://script.google.com/macros/s/abc/exec',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ secret: 'shh', values: formatIntakeRowValues(row) }),
      })
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when the web app responds with a non-ok status, after retrying', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const client = { fetch: fetchMock };

    await expect(appendIntakeRow(client, 'https://script.google.com/macros/s/abc/exec', 'shh', row)).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('throws when the web app returns 200 with a body that does not confirm success', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { error: 'unauthorized' }));
    const client = { fetch: fetchMock };

    await expect(appendIntakeRow(client, 'https://script.google.com/macros/s/abc/exec', 'shh', row)).rejects.toThrow();
  });

  it('throws when the web app returns a non-JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('not json');
      },
    });
    const client = { fetch: fetchMock };

    await expect(appendIntakeRow(client, 'https://script.google.com/macros/s/abc/exec', 'shh', row)).rejects.toThrow();
  });

  it('succeeds if a retry after a transient failure returns ok:true', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    const client = { fetch: fetchMock };

    await appendIntakeRow(client, 'https://script.google.com/macros/s/abc/exec', 'shh', row);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
