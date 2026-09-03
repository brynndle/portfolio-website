import type { VerifiedSession } from './verifySession.js';
import type { IntakeRow } from './sheets.js';

export interface IntakeFormFields {
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

export function buildIntakeRow(session: VerifiedSession, fields: IntakeFormFields, now: Date = new Date()): IntakeRow {
  return {
    timestamp: now.toISOString(),
    sessionId: session.sessionId,
    tier: session.tier,
    amount: session.amountTotal,
    companyName: fields.companyName,
    clientName: fields.clientName,
    email: fields.email || session.customerEmail || '',
    description: fields.description,
    acquisition: fields.acquisition,
    audienceLevel: fields.audienceLevel,
    primaryProblem: fields.primaryProblem,
    links: fields.links,
    fileUrls: fields.fileUrls,
  };
}
