#!/usr/bin/env tsx
/**
 * Cameroon Law MCP -- Census-Driven Ingestion Pipeline (PDF-based)
 *
 * Reads data/census.json and fetches + parses every ingestable law
 * from droitcamerounais.info and africa-laws.org.
 *
 * Pipeline per law:
 *   1. Download PDF from the resolved URL
 *   2. Extract text using pdftotext (poppler-utils)
 *   3. Parse extracted text to identify articles, definitions, structure
 *   4. Write seed JSON for the database builder
 *
 * Features:
 *   - Resume support: skips laws that already have a seed JSON file
 *   - Census update: writes provision counts + ingestion dates back to census.json
 *   - Rate limiting: 500ms minimum between requests (via fetcher.ts)
 *   - PDF text extraction via pdftotext (must be installed)
 *   - Handles both French and English bilingual documents
 *
 * Usage:
 *   npm run ingest                    # Full census-driven ingestion
 *   npm run ingest -- --limit 5       # Test with 5 acts
 *   npm run ingest -- --skip-fetch    # Reuse cached PDFs (re-parse only)
 *   npm run ingest -- --force         # Re-ingest even if seed exists
 *   npm run ingest -- --resume        # (default) Skip already-ingested laws
 *
 * Prerequisites:
 *   sudo apt-get install poppler-utils   # provides pdftotext
 *
 * Data sources:
 *   - droitcamerounais.info (Cameroon legal database, PDFs)
 *   - africa-laws.org (African legislation collection, PDFs)
 * Format: PDF (French, some bilingual French/English)
 * License: Government Open Data / Open Access
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { downloadBinary } from './lib/fetcher.js';
import { parsePdfText, type ActIndexEntry, type ParsedAct } from './lib/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_DIR = path.resolve(__dirname, '../data/pdf');
const TEXT_DIR = path.resolve(__dirname, '../data/text');
const SEED_DIR = path.resolve(__dirname, '../data/seed');
const CENSUS_PATH = path.resolve(__dirname, '../data/census.json');

/* ---------- Types ---------- */

interface CensusLawEntry {
  id: string;
  title: string;
  title_en: string;
  identifier: string;
  url: string;
  pdf_url: string;
  status: 'in_force' | 'amended' | 'repealed';
  category: string;
  classification: 'ingestable' | 'excluded' | 'inaccessible' | 'ocr_needed';
  ingested: boolean;
  provision_count: number;
  ingestion_date: string | null;
}

interface CensusFile {
  schema_version: string;
  jurisdiction: string;
  jurisdiction_name: string;
  portal: string;
  census_date: string;
  agent: string;
  summary: {
    total_laws: number;
    ingestable: number;
    ocr_needed: number;
    inaccessible: number;
    excluded: number;
  };
  laws: CensusLawEntry[];
}

/* ---------- Helpers ---------- */

function parseArgs(): { limit: number | null; skipFetch: boolean; force: boolean } {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let skipFetch = false;
  let force = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[i + 1], 10);
      i++;
    } else if (args[i] === '--skip-fetch') {
      skipFetch = true;
    } else if (args[i] === '--force') {
      force = true;
    }
  }

  return { limit, skipFetch, force };
}

/** Check that pdftotext is available */
function checkPdftotext(): boolean {
  try {
    execSync('pdftotext -v 2>&1', { encoding: 'utf-8' });
    return true;
  } catch {
    return false;
  }
}

/** Extract text from PDF using pdftotext */
function extractPdfText(pdfPath: string, textPath: string): string {
  try {
    execSync(`pdftotext -layout "${pdfPath}" "${textPath}" 2>/dev/null`, {
      encoding: 'utf-8',
      timeout: 60000,
      maxBuffer: 50 * 1024 * 1024, // 50MB buffer for large PDFs
    });
    return fs.readFileSync(textPath, 'utf-8');
  } catch (error) {
    // Fallback: try without -layout flag
    try {
      execSync(`pdftotext "${pdfPath}" "${textPath}" 2>/dev/null`, {
        encoding: 'utf-8',
        timeout: 60000,
        maxBuffer: 50 * 1024 * 1024,
      });
      return fs.readFileSync(textPath, 'utf-8');
    } catch (error2) {
      const msg = error2 instanceof Error ? error2.message : String(error2);
      throw new Error(`pdftotext failed for ${pdfPath}: ${msg}`);
    }
  }
}

/**
 * Convert a census entry to an ActIndexEntry for the parser.
 */
function censusToActEntry(law: CensusLawEntry): ActIndexEntry {
  return {
    id: law.id,
    title: law.title,
    titleEn: law.title_en ?? law.title,
    shortName: law.title.length > 60 ? law.title.substring(0, 57) + '...' : law.title,
    status: law.status === 'in_force' ? 'in_force' : law.status === 'amended' ? 'amended' : 'repealed',
    issuedDate: '',
    inForceDate: '',
    url: law.url ?? law.pdf_url,
    description: law.category,
  };
}

/* ---------- Main ---------- */

async function main(): Promise<void> {
  const { limit, skipFetch, force } = parseArgs();

  console.log('Cameroon Law MCP -- Ingestion Pipeline (PDF-based)');
  console.log('===================================================\n');
  console.log(`  Sources: droitcamerounais.info, africa-laws.org`);
  console.log(`  Format: PDF (French / bilingual French-English)`);
  console.log(`  License: Government Open Data / Open Access`);

  if (limit) console.log(`  --limit ${limit}`);
  if (skipFetch) console.log(`  --skip-fetch`);
  if (force) console.log(`  --force (re-ingest all)`);

  // Check pdftotext
  if (!checkPdftotext()) {
    console.error('\nERROR: pdftotext not found. Install poppler-utils:');
    console.error('  sudo apt-get install poppler-utils');
    process.exit(1);
  }

  // Load census
  if (!fs.existsSync(CENSUS_PATH)) {
    console.error(`\nERROR: Census file not found at ${CENSUS_PATH}`);
    console.error('Run "npx tsx scripts/census.ts" first.');
    process.exit(1);
  }

  const census: CensusFile = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8'));
  const ingestable = census.laws.filter(l => l.classification === 'ingestable');
  const acts = limit ? ingestable.slice(0, limit) : ingestable;

  console.log(`\n  Census: ${census.summary.total_laws} total, ${ingestable.length} ingestable`);
  console.log(`  Processing: ${acts.length} acts\n`);

  fs.mkdirSync(PDF_DIR, { recursive: true });
  fs.mkdirSync(TEXT_DIR, { recursive: true });
  fs.mkdirSync(SEED_DIR, { recursive: true });

  let processed = 0;
  let ingested = 0;
  let skipped = 0;
  let failed = 0;
  let totalProvisions = 0;
  let totalDefinitions = 0;
  const results: { act: string; provisions: number; definitions: number; status: string }[] = [];

  // Build a map for census updates
  const censusMap = new Map<string, CensusLawEntry>();
  for (const law of census.laws) {
    censusMap.set(law.id, law);
  }

  const today = new Date().toISOString().split('T')[0];

  for (const law of acts) {
    const act = censusToActEntry(law);
    const pdfFile = path.join(PDF_DIR, `${act.id}.pdf`);
    const textFile = path.join(TEXT_DIR, `${act.id}.txt`);
    const seedFile = path.join(SEED_DIR, `${act.id}.json`);

    // Resume support: skip if seed already exists (unless --force)
    if (!force && fs.existsSync(seedFile)) {
      try {
        const existing = JSON.parse(fs.readFileSync(seedFile, 'utf-8')) as ParsedAct;
        const provCount = existing.provisions?.length ?? 0;
        const defCount = existing.definitions?.length ?? 0;
        totalProvisions += provCount;
        totalDefinitions += defCount;

        // Update census entry
        const entry = censusMap.get(law.id);
        if (entry) {
          entry.ingested = true;
          entry.provision_count = provCount;
          entry.ingestion_date = entry.ingestion_date ?? today;
        }

        results.push({ act: act.shortName, provisions: provCount, definitions: defCount, status: 'resumed' });
        skipped++;
        processed++;
        continue;
      } catch {
        // Corrupt seed file, re-ingest
      }
    }

    try {
      let text: string;

      // Step 1: Get the text (either from cached text file, cached PDF, or download)
      if (fs.existsSync(textFile) && skipFetch) {
        text = fs.readFileSync(textFile, 'utf-8');
        console.log(`  [${processed + 1}/${acts.length}] Using cached text ${act.id} (${(text.length / 1024).toFixed(0)} KB)`);
      } else if (fs.existsSync(pdfFile) && skipFetch) {
        console.log(`  [${processed + 1}/${acts.length}] Extracting text from cached PDF ${act.id}`);
        text = extractPdfText(pdfFile, textFile);
        console.log(`    -> ${(text.length / 1024).toFixed(0)} KB text extracted`);
      } else {
        const pdfUrl = law.pdf_url ?? law.url;
        process.stdout.write(`  [${processed + 1}/${acts.length}] Downloading ${act.id}...`);

        const result = await downloadBinary(pdfUrl);

        if (result.status !== 200) {
          console.log(` HTTP ${result.status}`);

          // Mark as inaccessible in census
          const entry = censusMap.get(law.id);
          if (entry) {
            entry.classification = 'inaccessible';
          }

          results.push({ act: act.shortName, provisions: 0, definitions: 0, status: `HTTP ${result.status}` });
          failed++;
          processed++;
          continue;
        }

        // Verify it's a PDF
        if (result.buffer.length < 100 || !result.buffer.subarray(0, 5).toString().startsWith('%PDF')) {
          console.log(` Not a PDF (${result.contentType})`);

          // It might be an HTML page -- try to parse it
          const htmlText = result.buffer.toString('utf-8');
          if (htmlText.includes('<') && htmlText.includes('Article')) {
            // Save as HTML source and parse
            const sourceFile = path.join(PDF_DIR, `${act.id}.html`);
            fs.writeFileSync(sourceFile, htmlText);
            text = htmlText
              .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
              .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
              .replace(/<br\s*\/?>/gi, '\n')
              .replace(/<\/(p|div|section|article|li|ul|ol|h\d|tr)>/gi, '\n')
              .replace(/<[^>]+>/g, ' ')
              .replace(/&nbsp;/g, ' ')
              .replace(/&amp;/g, '&')
              .replace(/\u00a0/g, ' ')
              .replace(/[ \t]+/g, ' ')
              .trim();
            console.log(` HTML (${(text.length / 1024).toFixed(0)} KB text)`);
          } else {
            const entry = censusMap.get(law.id);
            if (entry) {
              entry.classification = 'inaccessible';
            }
            results.push({ act: act.shortName, provisions: 0, definitions: 0, status: 'Not PDF' });
            failed++;
            processed++;
            continue;
          }
        } else {
          // Save PDF and extract text
          fs.writeFileSync(pdfFile, result.buffer);
          const sizeMB = (result.buffer.length / 1024 / 1024).toFixed(1);
          console.log(` OK (${sizeMB} MB)`);

          // Skip very large PDFs (>100MB) -- likely scanned image PDFs
          if (result.buffer.length > 100 * 1024 * 1024) {
            console.log(`    -> Skipping: file too large (${sizeMB} MB), likely scanned image PDF`);
            const entry = censusMap.get(law.id);
            if (entry) {
              entry.classification = 'ocr_needed';
            }
            results.push({ act: act.shortName, provisions: 0, definitions: 0, status: 'Too large (OCR needed)' });
            failed++;
            processed++;
            continue;
          }

          text = extractPdfText(pdfFile, textFile);
          console.log(`    -> ${(text.length / 1024).toFixed(0)} KB text extracted`);
        }
      }

      // Check if text extraction yielded meaningful content
      if (text.trim().length < 50) {
        console.log(`    -> Skipping: insufficient text extracted (${text.trim().length} chars, likely scanned/image PDF)`);
        const entry = censusMap.get(law.id);
        if (entry) {
          entry.classification = 'ocr_needed';
        }
        results.push({ act: act.shortName, provisions: 0, definitions: 0, status: 'OCR needed' });
        failed++;
        processed++;
        continue;
      }

      // Step 2: Parse the text
      const parsed = parsePdfText(text, act);

      // Step 3: Write seed
      fs.writeFileSync(seedFile, JSON.stringify(parsed, null, 2));
      totalProvisions += parsed.provisions.length;
      totalDefinitions += parsed.definitions.length;
      console.log(`    -> ${parsed.provisions.length} provisions, ${parsed.definitions.length} definitions`);

      // Update census entry
      const entry = censusMap.get(law.id);
      if (entry) {
        entry.ingested = true;
        entry.provision_count = parsed.provisions.length;
        entry.ingestion_date = today;
      }

      results.push({
        act: act.shortName,
        provisions: parsed.provisions.length,
        definitions: parsed.definitions.length,
        status: 'OK',
      });
      ingested++;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.log(`  ERROR processing ${act.id}: ${msg}`);
      results.push({ act: act.shortName, provisions: 0, definitions: 0, status: `ERROR: ${msg.substring(0, 80)}` });
      failed++;
    }

    processed++;

    // Save census every 20 acts (checkpoint)
    if (processed % 20 === 0) {
      writeCensus(census, censusMap);
      console.log(`  [checkpoint] Census updated at ${processed}/${acts.length}`);
    }
  }

  // Final census update
  writeCensus(census, censusMap);

  // Report
  console.log(`\n${'='.repeat(70)}`);
  console.log('Ingestion Report');
  console.log('='.repeat(70));
  console.log(`\n  Sources:     droitcamerounais.info / africa-laws.org (PDF)`);
  console.log(`  Processed:   ${processed}`);
  console.log(`  New:         ${ingested}`);
  console.log(`  Resumed:     ${skipped}`);
  console.log(`  Failed:      ${failed}`);
  console.log(`  Total provisions:  ${totalProvisions}`);
  console.log(`  Total definitions: ${totalDefinitions}`);

  // Summary of failures
  const failures = results.filter(r => r.status.startsWith('HTTP') || r.status.startsWith('ERROR') || r.status === 'Not PDF' || r.status.startsWith('OCR') || r.status.startsWith('Too large'));
  if (failures.length > 0) {
    console.log(`\n  Failed acts (${failures.length}):`);
    for (const f of failures) {
      console.log(`    ${f.act}: ${f.status}`);
    }
  }

  // Zero-provision acts
  const zeroProv = results.filter(r => r.provisions === 0 && r.status === 'OK');
  if (zeroProv.length > 0) {
    console.log(`\n  Zero-provision acts (${zeroProv.length}):`);
    for (const z of zeroProv.slice(0, 20)) {
      console.log(`    ${z.act}`);
    }
    if (zeroProv.length > 20) {
      console.log(`    ... and ${zeroProv.length - 20} more`);
    }
  }

  console.log('');
}

function writeCensus(census: CensusFile, censusMap: Map<string, CensusLawEntry>): void {
  // Update the laws array from the map
  census.laws = Array.from(censusMap.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'fr'),
  );

  // Recalculate summary
  census.summary.total_laws = census.laws.length;
  census.summary.ingestable = census.laws.filter(l => l.classification === 'ingestable').length;
  census.summary.ocr_needed = census.laws.filter(l => l.classification === 'ocr_needed').length;
  census.summary.inaccessible = census.laws.filter(l => l.classification === 'inaccessible').length;
  census.summary.excluded = census.laws.filter(l => l.classification === 'excluded').length;

  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
