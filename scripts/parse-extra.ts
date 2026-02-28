#!/usr/bin/env tsx
/**
 * Parse additional laws from alternative sources that failed
 * during the main ingestion pipeline (image PDFs, wrong URLs, etc.)
 */

import * as fs from 'fs';
import { execSync } from 'child_process';
import { parsePdfText, type ActIndexEntry } from './lib/parser.js';

const SEED_DIR = 'data/seed';

interface ExtraSource {
  id: string;
  title: string;
  titleEn: string;
  shortName: string;
  url: string;
  pdfUrl: string;
  issuedDate: string;
}

const EXTRA_SOURCES: ExtraSource[] = [
  // Penal Code from vertic.org (the 1967 Code -- text extractable)
  // The 2016 code from droitcamerounais is image-only
  {
    id: 'code-penal-camerounais-1967',
    title: 'Code p\u00e9nal du Cameroun de 1967',
    titleEn: 'Penal Code of Cameroon (1967)',
    shortName: 'Code p\u00e9nal 1967',
    url: 'https://www.vertic.org/media/National%20Legislation/Cameroon/CM_Code_Penal_Cameroun.pdf',
    pdfUrl: 'https://www.vertic.org/media/National%20Legislation/Cameroon/CM_Code_Penal_Cameroun.pdf',
    issuedDate: '1967-06-12',
  },
  // Constitution from Constitute Project
  {
    id: 'constitution-cameroun-2008',
    title: 'Constitution de la R\u00e9publique du Cameroun (telle que modifi\u00e9e en 2008)',
    titleEn: 'Constitution of the Republic of Cameroon (as amended in 2008)',
    shortName: 'Constitution 2008',
    url: 'https://www.constituteproject.org/constitution/Cameroon_2008.pdf',
    pdfUrl: 'https://www.constituteproject.org/constitution/Cameroon_2008.pdf',
    issuedDate: '2008-04-14',
  },
  // Military Justice Code (English)
  {
    id: 'loi-n-2017-012-code-justice-militaire',
    title: 'Loi n\u00b0 2017/012 du 12 juillet 2017 portant Code de justice militaire',
    titleEn: 'Law No. 2017/012 of 12 July 2017 - Code of Military Justice',
    shortName: 'Code justice militaire',
    url: 'https://www.droitcamerounais.info/en/files/42.07.17-Law--of-12-July-2017-to-lay-down-the-Code-of-Military-Justice.pdf',
    pdfUrl: 'https://www.droitcamerounais.info/en/files/42.07.17-Law--of-12-July-2017-to-lay-down-the-Code-of-Military-Justice.pdf',
    issuedDate: '2017-07-12',
  },
];

async function main(): Promise<void> {
  console.log('Parsing additional laws from alternative sources...\n');

  fs.mkdirSync('data/pdf', { recursive: true });
  fs.mkdirSync('data/text', { recursive: true });
  fs.mkdirSync(SEED_DIR, { recursive: true });

  for (const source of EXTRA_SOURCES) {
    const pdfPath = `data/pdf/${source.id}.pdf`;
    const textPath = `data/text/${source.id}.txt`;
    const seedPath = `${SEED_DIR}/${source.id}.json`;

    if (fs.existsSync(seedPath)) {
      console.log(`  SKIP ${source.shortName} (already exists)`);
      continue;
    }

    try {
      // Download PDF
      process.stdout.write(`  Downloading ${source.shortName}...`);
      const response = await fetch(source.pdfUrl, {
        headers: { 'User-Agent': 'cameroonian-law-mcp/1.0' },
        redirect: 'follow',
      });
      if (!response.ok) {
        console.log(` HTTP ${response.status}`);
        continue;
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(pdfPath, buffer);
      console.log(` OK (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);

      // Extract text
      execSync(`pdftotext "${pdfPath}" "${textPath}" 2>/dev/null`, { timeout: 60000 });
      const text = fs.readFileSync(textPath, 'utf-8');

      if (text.trim().length < 50) {
        console.log(`    -> OCR needed (${text.trim().length} chars)`);
        continue;
      }

      // Parse
      const act: ActIndexEntry = {
        id: source.id,
        title: source.title,
        titleEn: source.titleEn,
        shortName: source.shortName,
        status: 'in_force',
        issuedDate: source.issuedDate,
        inForceDate: source.issuedDate,
        url: source.url,
      };
      const parsed = parsePdfText(text, act);
      fs.writeFileSync(seedPath, JSON.stringify(parsed, null, 2));
      console.log(`    -> ${parsed.provisions.length} provisions, ${parsed.definitions.length} definitions`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ERROR ${source.shortName}: ${msg.substring(0, 100)}`);
    }
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
