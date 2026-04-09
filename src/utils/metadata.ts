/**
 * Response metadata utilities for Cameroon Law MCP.
 */

import type Database from '@ansvar/mcp-sqlite';

export interface ResponseMetadata {
  data_source: string;
  jurisdiction: string;
  disclaimer: string;
  freshness?: string;
  note?: string;
  query_strategy?: string;
}

export interface ToolResponse<T> {
  results: T;
  _metadata: ResponseMetadata;
}

export function generateResponseMetadata(
  db: InstanceType<typeof Database>,
): ResponseMetadata {
  let freshness: string | undefined;
  try {
    const row = db.prepare(
      "SELECT value FROM db_metadata WHERE key = 'built_at'"
    ).get() as { value: string } | undefined;
    if (row) freshness = row.value;
  } catch {
    // Ignore
  }

  return {
    data_source: 'Cameroon Law — droitcamerounais.info (Droit Camerounais) and africa-laws.org (Africa Laws)',
    jurisdiction: 'CM',
    disclaimer:
      'This data is sourced from droitcamerounais.info and africa-laws.org. ' +
      'These are open-access Cameroonian legal databases; content may not reflect the most recent amendments. ' +
      'Always verify with the official Cameroon Ministry of Justice portal (minjustice.gov.cm).',
    freshness,
  };
}
