/**
 * list_sources — Return provenance metadata for all data sources.
 */

import type Database from '@ansvar/mcp-sqlite';
import { readDbMetadata } from '../capabilities.js';
import { generateResponseMetadata, type ToolResponse } from '../utils/metadata.js';

export interface SourceInfo {
  name: string;
  authority: string;
  url: string;
  license: string;
  coverage: string;
  languages: string[];
}

export interface ListSourcesResult {
  sources: SourceInfo[];
  database: {
    tier: string;
    schema_version: string;
    built_at?: string;
    document_count: number;
    provision_count: number;
  };
}

function safeCount(db: InstanceType<typeof Database>, sql: string): number {
  try {
    const row = db.prepare(sql).get() as { count: number } | undefined;
    return row ? Number(row.count) : 0;
  } catch {
    return 0;
  }
}

export async function listSources(
  db: InstanceType<typeof Database>,
): Promise<ToolResponse<ListSourcesResult>> {
  const meta = readDbMetadata(db);

  return {
    results: {
      sources: [
        {
          name: 'Droit Camerounais',
          authority: 'droitcamerounais.info',
          url: 'https://droitcamerounais.info',
          license: 'Open Access',
          coverage:
            '25 key Cameroonian laws (cybersecurity, electronic commerce, consumer protection, penal code, constitution)',
          languages: ['fr', 'en'],
        },
        {
          name: 'Africa Laws - Cameroon',
          authority: 'Africa Laws (aggregator)',
          url: 'https://www.africa-laws.org/Cameroon.php',
          license: 'Open Access',
          coverage:
            '45+ Cameroonian laws across banking, commercial, civil, criminal, employment, family, IP, privacy, tax law',
          languages: ['fr'],
        },
      ],
      database: {
        tier: meta.tier,
        schema_version: meta.schema_version,
        built_at: meta.built_at,
        document_count: safeCount(db, 'SELECT COUNT(*) as count FROM legal_documents'),
        provision_count: safeCount(db, 'SELECT COUNT(*) as count FROM legal_provisions'),
      },
    },
    _metadata: generateResponseMetadata(db),
  };
}
