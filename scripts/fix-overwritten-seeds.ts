#!/usr/bin/env tsx
/**
 * Fix seeds that were overwritten by generate-seeds.ts.
 * Re-parses from cached text files where available.
 */

import * as fs from 'fs';
import { parsePdfText, type ActIndexEntry } from './lib/parser.js';

const SEED_DIR = 'data/seed';
const TEXT_DIR = 'data/text';

interface FixEntry {
  id: string;
  title: string;
  titleEn: string;
  shortName: string;
  status: 'in_force' | 'amended' | 'repealed';
  issuedDate: string;
  inForceDate: string;
  url: string;
  minProvisions: number; // Only re-parse if current seed has fewer than this
}

const FIX_ENTRIES: FixEntry[] = [
  {
    id: 'loi-cadre-n-2011-012-du-6-mai-2011-relative-a-la-protection-du-consommateur',
    title: 'Loi cadre N\u00b0 2011/012 du 6 mai 2011 relative \u00e0 la protection du consommateur',
    titleEn: 'Framework Law No. 2011/012 of 6 May 2011 on Consumer Protection',
    shortName: 'Loi 2011/012 (Consommateur)',
    status: 'in_force',
    issuedDate: '2011-05-06',
    inForceDate: '2011-05-06',
    url: 'https://www.africa-laws.org/Cameroon.php',
    minProvisions: 10,
  },
];

async function main(): Promise<void> {
  console.log('Fixing overwritten seeds...\n');

  for (const entry of FIX_ENTRIES) {
    const seedPath = `${SEED_DIR}/${entry.id}.json`;
    const textPath = `${TEXT_DIR}/${entry.id}.txt`;

    // Check current provision count
    let currentCount = 0;
    if (fs.existsSync(seedPath)) {
      const current = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
      currentCount = current.provisions?.length ?? 0;
    }

    if (currentCount >= entry.minProvisions) {
      console.log(`  SKIP ${entry.shortName} (already has ${currentCount} provisions)`);
      continue;
    }

    if (!fs.existsSync(textPath)) {
      console.log(`  SKIP ${entry.shortName} (no cached text file)`);
      continue;
    }

    const text = fs.readFileSync(textPath, 'utf-8');
    if (text.trim().length < 50) {
      console.log(`  SKIP ${entry.shortName} (text too short: ${text.trim().length} chars)`);
      continue;
    }

    const act: ActIndexEntry = {
      id: entry.id,
      title: entry.title,
      titleEn: entry.titleEn,
      shortName: entry.shortName,
      status: entry.status,
      issuedDate: entry.issuedDate,
      inForceDate: entry.inForceDate,
      url: entry.url,
    };

    const parsed = parsePdfText(text, act);
    fs.writeFileSync(seedPath, JSON.stringify(parsed, null, 2));
    console.log(`  FIXED ${entry.shortName}: ${currentCount} -> ${parsed.provisions.length} provisions`);
  }

  console.log('\nDone.');
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
