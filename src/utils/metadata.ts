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
    data_source: 'Cameroon Law (minjustice.gov.cm / juriafrica.com) — Ministry of Justice of Cameroon',
    jurisdiction: 'CM',
    disclaimer:
      'This data is sourced from the Ministry of Justice of Cameroon and juriafrica.com. ' +
      'The authoritative versions are maintained by the Ministry of Justice (minjustice.gov.cm). ' +
      'Always verify with the official Cameroon Ministry of Justice portal (minjustice.gov.cm).',
    freshness,
  };
}
