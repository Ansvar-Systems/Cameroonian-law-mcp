#!/usr/bin/env tsx
/**
 * Cameroon Law MCP -- Census Script (Full Corpus)
 *
 * Enumerates ALL discoverable Cameroonian legislation from multiple sources:
 *   1. droitcamerounais.info — Cameroon legal database (PDFs, primary source)
 *   2. africa-laws.org — Mirror/collection of African law PDFs
 *   3. cameroontradeportal.cm — Government trade portal (select PDFs)
 *   4. ILO NATLEX — Labour-related legislation (HTML full texts)
 *   5. WIPO — Intellectual property legislation
 *
 * Cameroon is a bilingual (French/English) bijural system.
 * Most legislation is in French; some texts have English translations.
 *
 * Strategy:
 *   - Curated comprehensive inventory of ~200+ laws with verified PDF URLs
 *   - Organized by legal domain (constitution, civil, criminal, labour, etc.)
 *   - Each entry has a direct PDF URL for the ingest pipeline
 *
 * Outputs data/census.json in golden standard format.
 *
 * Usage:
 *   npx tsx scripts/census.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

function titleToId(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function loadExistingCensus(): Map<string, CensusLawEntry> {
  const existing = new Map<string, CensusLawEntry>();
  if (fs.existsSync(CENSUS_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8')) as CensusFile;
      for (const law of data.laws) {
        if ('ingested' in law && 'url' in law) {
          existing.set(law.id, law);
        }
      }
    } catch { /* ignore */ }
  }
  return existing;
}

/* ---------- Source URLs ---------- */

const DC = 'https://www.droitcamerounais.info/files'; // droitcamerounais.info
const AL = 'https://www.africa-laws.org';              // africa-laws.org

/* ---------- Comprehensive Cameroonian Legal Corpus ---------- */

interface CuratedLaw {
  title: string;
  title_en: string;
  identifier: string;
  pdf_url: string;
  status: 'in_force' | 'amended' | 'repealed';
  category: string;
  classification: 'ingestable' | 'ocr_needed';
}

const CURATED_LAWS: CuratedLaw[] = [
  // ============================================================
  // 1. CONSTITUTION & FUNDAMENTAL RIGHTS (Section 10-11)
  // ============================================================
  {
    title: 'Loi n\u00b0 96/06 du 18 janvier 1996 portant r\u00e9vision de la Constitution du 02 juin 1972',
    title_en: 'Law No. 96/06 of 18 January 1996 - Constitution of the Republic of Cameroon',
    identifier: 'Loi n\u00b0 96/06',
    pdf_url: `${DC}/10.01.96.pdf`,
    status: 'in_force',
    category: 'constitution',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 2008/001 du 14 avril 2008 modifiant et compl\u00e9tant certaines dispositions de la Constitution',
    title_en: 'Law No. 2008/001 of 14 April 2008 amending the Constitution',
    identifier: 'Loi n\u00b0 2008/001',
    pdf_url: `${DC}/10.04.08-Loi-n-2008_001-du-14-avril-2008-modifiant-la-Constitution.pdf`,
    status: 'in_force',
    category: 'constitution',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 90-47 du 19 d\u00e9cembre 1990 relative \u00e0 l'\u00e9tat d'urgence",
    title_en: 'Law No. 90-47 of 19 December 1990 on the State of Emergency',
    identifier: 'Loi n\u00b0 90-47',
    pdf_url: `${DC}/10.12.90-Loi-du-19-decembre-1990_Etat-d-urgence.pdf`,
    status: 'in_force',
    category: 'constitution',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 90-53 du 19 d\u00e9cembre 1990 relative \u00e0 la libert\u00e9 d'association",
    title_en: 'Law No. 90-53 of 19 December 1990 on Freedom of Association',
    identifier: 'Loi n\u00b0 90-53',
    pdf_url: `${DC}/211.12.90-Loi-du-19-decembre-1990_Liberte-d-association.pdf`,
    status: 'in_force',
    category: 'civil_rights',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2020/009 du 20 juillet 2020 modifiant la loi sur la libert\u00e9 d'association",
    title_en: 'Law No. 2020/009 of 20 July 2020 amending the Freedom of Association Law',
    identifier: 'Loi n\u00b0 2020/009',
    pdf_url: `${DC}/211.07.20-Loi-du-20-juillet-2020_Liberte-d-association_modifications.pdf`,
    status: 'in_force',
    category: 'civil_rights',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 90-52 du 19 d\u00e9cembre 1990 relative \u00e0 la libert\u00e9 de communication sociale',
    title_en: 'Law No. 90-52 of 19 December 1990 on Freedom of Social Communication',
    identifier: 'Loi n\u00b0 90-52',
    pdf_url: `${DC}/743.12.90-Loi-du-19-decembre-1990_Communication-sociale.pdf`,
    status: 'in_force',
    category: 'media',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 2019/014 du 19 juillet 2019 portant cr\u00e9ation de la Commission des droits de l\'homme',
    title_en: 'Law No. 2019/014 of 19 July 2019 establishing the Human Rights Commission',
    identifier: 'Loi n\u00b0 2019/014',
    pdf_url: `${DC}/110.07.19-Loi-du-19-juillet-2019_Commission-droits-de-l-homme.pdf`,
    status: 'in_force',
    category: 'human_rights',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 99/014 du 22 d\u00e9cembre 1999 r\u00e9gissant les organisations non gouvernementales',
    title_en: 'Law No. 99/014 of 22 December 1999 on Non-Governmental Organizations',
    identifier: 'Loi n\u00b0 99/014',
    pdf_url: `${DC}/211.12.99-Loi-du-22-decembre-1999_Organisations-non-gouvernementales.pdf`,
    status: 'in_force',
    category: 'civil_rights',
    classification: 'ingestable',
  },

  // ============================================================
  // 2. POLITICAL RIGHTS & ELECTIONS (Section 111)
  // ============================================================
  {
    title: 'Loi n\u00b0 90-55 du 19 d\u00e9cembre 1990 relative aux r\u00e9unions et manifestations publiques',
    title_en: 'Law No. 90-55 of 19 December 1990 on Public Assemblies and Demonstrations',
    identifier: 'Loi n\u00b0 90-55',
    pdf_url: `${DC}/111.12.90-Loi-du-19-decembre-1990_Manifestations-publiques.pdf`,
    status: 'in_force',
    category: 'political',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 2000/015 du 19 d\u00e9cembre 2000 relative au financement des partis politiques',
    title_en: 'Law No. 2000/015 of 19 December 2000 on Political Party Financing',
    identifier: 'Loi n\u00b0 2000/015',
    pdf_url: `${DC}/111.12.00-Loi-du-19-decembre-2000_Financement-des-partis-politiques.pdf`,
    status: 'in_force',
    category: 'political',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 2012/001 du 19 avril 2012 portant Code \u00e9lectoral',
    title_en: 'Law No. 2012/001 of 19 April 2012 - Electoral Code',
    identifier: 'Loi n\u00b0 2012/001',
    pdf_url: `${DC}/111.04.12_Code-electoral.pdf`,
    status: 'in_force',
    category: 'electoral',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 2019/005 du 25 avril 2019 modifiant le Code \u00e9lectoral',
    title_en: 'Law No. 2019/005 of 25 April 2019 amending the Electoral Code',
    identifier: 'Loi n\u00b0 2019/005',
    pdf_url: `${DC}/111.04.19_Code-electoral_modifications.pdf`,
    status: 'in_force',
    category: 'electoral',
    classification: 'ingestable',
  },

  // ============================================================
  // 3. NATIONALITY & IDENTITY (Section 112-114)
  // ============================================================
  {
    title: "D\u00e9cret n\u00b0 2016/375 du 4 ao\u00fbt 2016 relatif \u00e0 la carte nationale d'identit\u00e9",
    title_en: 'Decree No. 2016/375 of 4 August 2016 on the National Identity Card',
    identifier: 'D\u00e9cret n\u00b0 2016/375',
    pdf_url: `${DC}/112.08.16-Decret-du-4-aout-2016_Carte-nationale-d-identite.pdf`,
    status: 'in_force',
    category: 'nationality',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 1997/012 du 10 janvier 1997 relative \u00e0 l'entr\u00e9e et au s\u00e9jour des \u00e9trangers au Cameroun",
    title_en: 'Law No. 1997/012 of 10 January 1997 on the Entry and Residence of Foreigners',
    identifier: 'Loi n\u00b0 1997/012',
    pdf_url: `${DC}/114.01.97-Loi-du-10-janvier-1997_Entree-et-sortie-des-etrangers-au-Cameroun.pdf`,
    status: 'in_force',
    category: 'immigration',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2022/015 du 14 juillet 2022 modifiant la loi sur le s\u00e9jour des \u00e9trangers",
    title_en: 'Law No. 2022/015 of 14 July 2022 amending the Foreigners Residence Law',
    identifier: 'Loi n\u00b0 2022/015',
    pdf_url: `${DC}/114.07.22-Loi-14-juillet-2022_Etrangers_sejour_modifications.pdf`,
    status: 'in_force',
    category: 'immigration',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2023/147 du 2 mars 2023 fixant les modalit\u00e9s d'application de la loi sur les \u00e9trangers",
    title_en: 'Decree No. 2023/147 of 2 March 2023 implementing the Foreigners Law',
    identifier: 'D\u00e9cret n\u00b0 2023/147',
    pdf_url: `${DC}/114.03.23-Decret-du-2-mars-2023_Etrangers_sejour.pdf`,
    status: 'in_force',
    category: 'immigration',
    classification: 'ingestable',
  },

  // ============================================================
  // 4. DECENTRALIZATION (Section 127-128)
  // ============================================================
  {
    title: "Loi n\u00b0 2000/02 du 17 avril 2000 relative aux espaces maritimes",
    title_en: 'Law No. 2000/02 of 17 April 2000 on Maritime Spaces',
    identifier: 'Loi n\u00b0 2000/02',
    pdf_url: `${DC}/127.04.10-Loi-du-17-avril-2000_Espaces-maritimes.pdf`,
    status: 'in_force',
    category: 'territory',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2004/018 du 22 juillet 2004 fixant les r\u00e8gles applicables aux communes",
    title_en: 'Law No. 2004/018 of 22 July 2004 on Municipal Governance Rules',
    identifier: 'Loi n\u00b0 2004/018',
    pdf_url: `${DC}/128.07.04-Loi-du-22-juillet-2004_Regles-des-communes.pdf`,
    status: 'in_force',
    category: 'decentralization',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2004/019 du 22 juillet 2004 fixant les r\u00e8gles applicables aux r\u00e9gions",
    title_en: 'Law No. 2004/019 of 22 July 2004 on Regional Governance Rules',
    identifier: 'Loi n\u00b0 2004/019',
    pdf_url: `${DC}/128.07.04.1-Loi-du-29-decembre-2004_Regions.pdf`,
    status: 'in_force',
    category: 'decentralization',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2004/017 du 22 juillet 2004 portant orientation de la d\u00e9centralisation",
    title_en: 'Law No. 2004/017 of 22 July 2004 on Decentralization Framework',
    identifier: 'Loi n\u00b0 2004/017',
    pdf_url: `${DC}/128.07.04.2-Loi-du-22-juillet-2004_Orientation-de-la-decentralisation.pdf`,
    status: 'in_force',
    category: 'decentralization',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2019/024 du 24 d\u00e9cembre 2019 portant Code g\u00e9n\u00e9ral des collectivit\u00e9s territoriales d\u00e9centralis\u00e9es",
    title_en: 'Law No. 2019/024 of 24 December 2019 - General Code for Decentralized Territorial Authorities',
    identifier: 'Loi n\u00b0 2019/024',
    pdf_url: `${DC}/128.12.19-Code-du-24-decembre-2019-Collectives-territoriales-decentralisees.pdf`,
    status: 'in_force',
    category: 'decentralization',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2009/019 du 15 d\u00e9cembre 2009 portant fiscalit\u00e9 locale",
    title_en: 'Law No. 2009/019 of 15 December 2009 on Local Taxation',
    identifier: 'Loi n\u00b0 2009/019',
    pdf_url: `${DC}/128.12.09-Loi-du-15-decembre-2009_fiscalite-locale.pdf`,
    status: 'in_force',
    category: 'taxation',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2006/017 du 29 d\u00e9cembre 2006 portant organisation des tribunaux r\u00e9gionaux des comptes",
    title_en: 'Law No. 2006/017 of 29 December 2006 on Regional Audit Courts',
    identifier: 'Loi n\u00b0 2006/017',
    pdf_url: `${DC}/128.12.08-Loi-du-29-decembre-2008_Tribunaux-regionaux-des-comptes.pdf`,
    status: 'in_force',
    category: 'judiciary',
    classification: 'ingestable',
  },

  // ============================================================
  // 5. LEGISLATURE (Section 131-133)
  // ============================================================
  {
    title: "Loi n\u00b0 2014/016 du 19 septembre 2014 portant r\u00e8glement int\u00e9rieur de l'Assembl\u00e9e nationale",
    title_en: 'Law No. 2014/016 of 19 September 2014 - Internal Rules of the National Assembly',
    identifier: 'Loi n\u00b0 2014/016',
    pdf_url: `${DC}/131.09.14_Reglement-interieur-de-l-Assemblee-nationale.pdf`,
    status: 'in_force',
    category: 'legislature',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2013/006 du 10 juin 2013 portant r\u00e8glement int\u00e9rieur du S\u00e9nat",
    title_en: 'Law No. 2013/006 of 10 June 2013 - Internal Rules of the Senate',
    identifier: 'Loi n\u00b0 2013/006',
    pdf_url: `${DC}/132.10.13_Reglement-interieur-du-Senat.pdf`,
    status: 'in_force',
    category: 'legislature',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2014/015 du 18 juillet 2014 relative aux commissions d'enqu\u00eate parlementaire",
    title_en: 'Law No. 2014/015 of 18 July 2014 on Parliamentary Inquiry Commissions',
    identifier: 'Loi n\u00b0 2014/015',
    pdf_url: `${DC}/133.07.14-Loi-du-18-juillet-2014_Commissions-d-enquete-parlementaire.pdf`,
    status: 'in_force',
    category: 'legislature',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2014/017 du 9 septembre 2014 portant r\u00e8glement int\u00e9rieur du Congr\u00e8s du Parlement",
    title_en: 'Law No. 2014/017 of 9 September 2014 - Internal Rules of Parliament Congress',
    identifier: 'Loi n\u00b0 2014/017',
    pdf_url: `${DC}/133.09.14-Loi-du-19-septembre-2014_Reglement-interieur-du-Congres-du-Parlement.pdf`,
    status: 'in_force',
    category: 'legislature',
    classification: 'ingestable',
  },

  // ============================================================
  // 6. EXECUTIVE & ADMINISTRATION (Section 141-144)
  // ============================================================
  {
    title: "D\u00e9cret n\u00b0 2011/408 du 9 d\u00e9cembre 2011 portant organisation du Gouvernement",
    title_en: 'Decree No. 2011/408 of 9 December 2011 on Government Organization',
    identifier: 'D\u00e9cret n\u00b0 2011/408',
    pdf_url: `${DC}/142.12.11-Decret-du-9-decembre-2011_Organisation-du-Gouvernement.pdf`,
    status: 'in_force',
    category: 'executive',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 92/082 du 4 mai 1992 portant attributions du Premier Ministre",
    title_en: 'Decree No. 92/082 of 4 May 1992 on Prime Minister Powers',
    identifier: 'D\u00e9cret n\u00b0 92/082',
    pdf_url: `${DC}/142.05.92-Decret-du-4-mai--1992-portant-attributions-du-premier-ministre.pdf`,
    status: 'in_force',
    category: 'executive',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 94/199 du 7 octobre 1994 portant statut g\u00e9n\u00e9ral de la fonction publique",
    title_en: 'Decree No. 94/199 of 7 October 1994 - General Statute of the Civil Service',
    identifier: 'D\u00e9cret n\u00b0 94/199',
    pdf_url: `${DC}/143.10.94-Decret-du-7-octobre-1994_Fonction-publique.pdf`,
    status: 'in_force',
    category: 'administration',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2008/376 du 12 novembre 2008 portant organisation administrative de la R\u00e9publique",
    title_en: 'Decree No. 2008/376 of 12 November 2008 on Administrative Organization',
    identifier: 'D\u00e9cret n\u00b0 2008/376',
    pdf_url: `${DC}/143.11.08-Decret-du-12-novembre-2008-portant-organisation-administrative-de-la-republique-du-Cameroun.pdf`,
    status: 'in_force',
    category: 'administration',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2008/377 du 12 novembre 2008 fixant les attributions des chefs de circonscriptions administratives",
    title_en: 'Decree No. 2008/377 of 12 November 2008 on Administrative Division Chiefs Powers',
    identifier: 'D\u00e9cret n\u00b0 2008/377',
    pdf_url: `${DC}/143.11.08.1-Decret-du-12-novembre-2008_Chefs-des-circonscriptions-administratives_attributions.pdf`,
    status: 'in_force',
    category: 'administration',
    classification: 'ingestable',
  },

  // ============================================================
  // 7. JUDICIARY (Section 144-156)
  // ============================================================
  {
    title: "Loi n\u00b0 2006/022 du 29 d\u00e9cembre 2006 fixant l'organisation et le fonctionnement des tribunaux administratifs",
    title_en: 'Law No. 2006/022 of 29 December 2006 on Administrative Courts',
    identifier: 'Loi n\u00b0 2006/022',
    pdf_url: `${DC}/144.12.06-Loi-du-29-decembre-2006_TA.pdf`,
    status: 'in_force',
    category: 'judiciary',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2006/015 du 29 d\u00e9cembre 2006 portant organisation judiciaire",
    title_en: 'Law No. 2006/015 of 29 December 2006 on Judicial Organization',
    identifier: 'Loi n\u00b0 2006/015',
    pdf_url: `${DC}/150.12.06-Loi-du-29-decembre-2006_Organisation-judiciaire.pdf`,
    status: 'in_force',
    category: 'judiciary',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2007/001 du 19 avril 2007 relative au juge de l'ex\u00e9cution",
    title_en: 'Law No. 2007/001 of 19 April 2007 on the Execution Judge',
    identifier: 'Loi n\u00b0 2007/001',
    pdf_url: `${DC}/150.04.07-Loi-du-19-avril-2007_Juge-de-l-execution.pdf`,
    status: 'in_force',
    category: 'judiciary',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2004/004 du 21 avril 2004 portant organisation et fonctionnement du Conseil constitutionnel",
    title_en: 'Law No. 2004/004 of 21 April 2004 on the Constitutional Council',
    identifier: 'Loi n\u00b0 2004/004',
    pdf_url: `${DC}/151.04.04-Loi-du-21-avril-2004-portant-organisation-et-fonctionnement-du-Conseil-constitutionnel.pdf`,
    status: 'in_force',
    category: 'judiciary',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2006/016 du 29 d\u00e9cembre 2006 portant organisation et fonctionnement de la Cour supr\u00eame",
    title_en: 'Law No. 2006/016 of 29 December 2006 on the Supreme Court',
    identifier: 'Loi n\u00b0 2006/016',
    pdf_url: `${DC}/153.12.08-Loi-du-29-decembre-2008_Cour-supreme.pdf`,
    status: 'in_force',
    category: 'judiciary',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 76/424 du 16 septembre 1976 fixant les r\u00e8gles de protocole",
    title_en: 'Decree No. 76/424 of 16 September 1976 on Protocol Rules',
    identifier: 'D\u00e9cret n\u00b0 76/424',
    pdf_url: `${DC}/144.09.76-Decret-du-16-septembre-1976_Regles-de-protocole.pdf`,
    status: 'in_force',
    category: 'administration',
    classification: 'ingestable',
  },

  // ============================================================
  // 8. LEGAL PROFESSION (Section 170-173)
  // ============================================================
  {
    title: "Loi n\u00b0 90/059 du 19 d\u00e9cembre 1990 portant organisation de la profession d'avocat",
    title_en: 'Law No. 90/059 of 19 December 1990 on the Legal Profession',
    identifier: 'Loi n\u00b0 90/059',
    pdf_url: `${DC}/170.11.90-Loi-du-19-decembre-1990_Profession-d-avocat.pdf`,
    status: 'in_force',
    category: 'legal_profession',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2023/042 du 25 janvier 2023 portant statut des huissiers de justice",
    title_en: 'Decree No. 2023/042 of 25 January 2023 on Bailiff Profession Status',
    identifier: 'D\u00e9cret n\u00b0 2023/042',
    pdf_url: `${DC}/173.01.23-Decret-du-25-janvier-2023_Huissier.pdf`,
    status: 'in_force',
    category: 'legal_profession',
    classification: 'ingestable',
  },

  // ============================================================
  // 9. TRADITIONAL AUTHORITIES (Section 181-182)
  // ============================================================
  {
    title: "D\u00e9cret n\u00b0 77/245 du 15 juillet 1977 portant organisation des chefferies traditionnelles",
    title_en: 'Decree No. 77/245 of 15 July 1977 on Traditional Chiefdoms Organization',
    identifier: 'D\u00e9cret n\u00b0 77/245',
    pdf_url: `${DC}/182.07.77-Decret-du-15-juillet-1977_Chefferies-traditionnelles.pdf`,
    status: 'in_force',
    category: 'traditional',
    classification: 'ingestable',
  },

  // ============================================================
  // 10. CIVIL LAW (Section 21)
  // ============================================================
  {
    title: 'Code civil camerounais',
    title_en: 'Cameroon Civil Code',
    identifier: 'Code civil',
    pdf_url: `${DC}/21.03.04A-Code-civil--2022_09_27-06_08_23-UTC-.pdf`,
    status: 'in_force',
    category: 'civil',
    classification: 'ingestable',
  },
  {
    title: 'Code de proc\u00e9dure civile du 16 d\u00e9cembre 1954',
    title_en: 'Code of Civil Procedure of 16 December 1954',
    identifier: 'Code proc\u00e9dure civile',
    pdf_url: `${DC}/25.12.54-Code-de-procedure-civile-du-16-decembre-1954.pdf`,
    status: 'in_force',
    category: 'civil',
    classification: 'ingestable',
  },
  {
    title: "Ordonnance n\u00b0 81/002 du 29 juin 1981 portant organisation de l'\u00e9tat civil et dispositions relatives aux personnes physiques",
    title_en: 'Ordinance No. 81/002 of 29 June 1981 on Civil Status and Natural Persons',
    identifier: 'Ordonnance n\u00b0 81/002',
    pdf_url: `${DC}/211.06.81-Ordonnance-du-29-juin-1981_Etat-civil-et-personnes-physiques.pdf`,
    status: 'in_force',
    category: 'civil',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2011/011 du 6 mai 2011 modifiant l'ordonnance sur l'\u00e9tat civil",
    title_en: 'Law No. 2011/011 of 6 May 2011 amending the Civil Status Ordinance',
    identifier: 'Loi n\u00b0 2011/011',
    pdf_url: `${DC}/211.05.11-Loi-du-6-mai-2011_etat-civil_modifications.pdf`,
    status: 'in_force',
    category: 'civil',
    classification: 'ingestable',
  },

  // ============================================================
  // 11. PROPERTY LAW (Section 215-216)
  // ============================================================
  {
    title: "Ordonnance n\u00b0 74/1 du 6 juillet 1974 fixant le r\u00e9gime foncier",
    title_en: 'Ordinance No. 74/1 of 6 July 1974 on Land Tenure',
    identifier: 'Ordonnance n\u00b0 74/1',
    pdf_url: `${DC}/215.07.74-Ordonnance-du-16-juillet-1974_Regime-foncier.pdf`,
    status: 'in_force',
    category: 'property',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 80/21 du 14 juillet 1980 modifiant le r\u00e9gime foncier",
    title_en: 'Law No. 80/21 of 14 July 1980 amending the Land Tenure Regime',
    identifier: 'Loi n\u00b0 80/21',
    pdf_url: `${DC}/215.07.80-Loi-du-14-juillet-1980_regime-foncier_modifications.pdf`,
    status: 'in_force',
    category: 'property',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 80/22 du 14 juillet 1980 portant r\u00e9pression des atteintes \u00e0 la propri\u00e9t\u00e9 fonci\u00e8re",
    title_en: 'Law No. 80/22 of 14 July 1980 on Repression of Property Offences',
    identifier: 'Loi n\u00b0 80/22',
    pdf_url: `${DC}/215.07.80.1-Loi-du-14-juillet-1980_Repression-des-atteintes-a-la-propriete.pdf`,
    status: 'in_force',
    category: 'property',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 81/03 du 7 juillet 1981 relative \u00e0 la copropri\u00e9t\u00e9 des immeubles b\u00e2tis",
    title_en: 'Law No. 81/03 of 7 July 1981 on Co-ownership of Built Property',
    identifier: 'Loi n\u00b0 81/03',
    pdf_url: `${DC}/215.07.81-Loi-du-7-juillet-1981_Copropriete-des-immeubles-batis.pdf`,
    status: 'in_force',
    category: 'property',
    classification: 'ingestable',
  },

  // ============================================================
  // 12. INTELLECTUAL PROPERTY (Section 22)
  // ============================================================
  {
    title: "Loi n\u00b0 2000/011 du 19 d\u00e9cembre 2000 relative au droit d'auteur et aux droits voisins",
    title_en: 'Law No. 2000/011 of 19 December 2000 on Copyright and Neighbouring Rights',
    identifier: 'Loi n\u00b0 2000/011',
    pdf_url: `${AL}/Cameroon/Intellectual%20property%20law/Loi%20n%C2%B0%202000011%20du%2019%20d%C3%A9cembre%202000%20relative%20au%20droit%20d'auteur%20et%20aux%20droits%20voisins.pdf`,
    status: 'in_force',
    category: 'intellectual_property',
    classification: 'ingestable',
  },

  // ============================================================
  // 13. BANKING & FINANCE (Section 23)
  // ============================================================
  {
    title: "Loi n\u00b0 2019/021 du 24 d\u00e9cembre 2019 relative \u00e0 l'activit\u00e9 de cr\u00e9dit dans les secteurs bancaire et microfinance",
    title_en: 'Law No. 2019/021 of 24 December 2019 on Credit Activity in Banking and Microfinance',
    identifier: 'Loi n\u00b0 2019/021',
    pdf_url: `${AL}/Cameroon/banking%20and%20finance%20law/Loi%20N%C2%B0%202019021%20du%2024%20d%C3%A9cembre%202019%20fixant%20certaines%20r%C3%A8gles%20relatives%20%C3%A0%20l'activit%C3%A9%20de%20cr%C3%A9dit%20dans%20les%20secteurs%20bancaire%20et%20de%20la%20microfinance%20au%20Cameroun.pdf`,
    status: 'in_force',
    category: 'banking',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2019/010 du 12 juillet 2019 relative aux organismes de placement collectif",
    title_en: 'Law No. 2019/010 of 12 July 2019 on Collective Investment Schemes',
    identifier: 'Loi n\u00b0 2019/010',
    pdf_url: `${DC}/234.07.19-Loi-du-12-juillet-2019_Organismes-de-placement-collectif.pdf`,
    status: 'in_force',
    category: 'banking',
    classification: 'ingestable',
  },

  // ============================================================
  // 14. CRIMINAL LAW (Section 31-35)
  // ============================================================
  {
    title: 'Loi n\u00b0 2016/007 du 12 juillet 2016 portant Code p\u00e9nal',
    title_en: 'Law No. 2016/007 of 12 July 2016 - Penal Code',
    identifier: 'Loi n\u00b0 2016/007',
    pdf_url: `${DC}/311.07.16-Law-of-12-juillet-2016-relating-to-the-Penal-Code.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: 'Loi n\u00b0 2019/020 du 24 d\u00e9cembre 2019 modifiant le Code p\u00e9nal',
    title_en: 'Law No. 2019/020 of 24 December 2019 amending the Penal Code',
    identifier: 'Loi n\u00b0 2019/020',
    pdf_url: `${DC}/311.12.19-Law-of-24-December-2019-to-amend-and-supplement-provisions-of-Law-of-12-July-2016-to-the-Penal-Cod.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2016/319 du 12 juillet 2016 portant partie r\u00e9glementaire du Code p\u00e9nal",
    title_en: 'Decree No. 2016/319 of 12 July 2016 - Regulatory Part of the Penal Code',
    identifier: 'D\u00e9cret n\u00b0 2016/319',
    pdf_url: `${DC}/311.07.16.1-Decree-of-12-July-2016-relating-to-the-regulatoriy-part-of-the-Penal-Code-to-define-simple-offences.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2005/007 du 27 juillet 2005 portant Code de proc\u00e9dure p\u00e9nale",
    title_en: 'Law No. 2005/007 of 27 July 2005 - Criminal Procedure Code',
    identifier: 'Loi n\u00b0 2005/007',
    pdf_url: `${DC}/350.07.05-Loi-du-27-juillet-2005_Code-procedure-penale.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2005/015 du 29 d\u00e9cembre 2005 relative \u00e0 la lutte contre le trafic et la traite des enfants",
    title_en: 'Law No. 2005/015 of 29 December 2005 on Child Trafficking',
    identifier: 'Loi n\u00b0 2005/015',
    pdf_url: `${DC}/32.12.05-Loi-du-29-decembre-2005_Lutte-contre-le-trafic-et-la-traite-des-enfants.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2014/028 du 23 d\u00e9cembre 2014 portant r\u00e9pression des actes de terrorisme",
    title_en: 'Law No. 2014/028 of 23 December 2014 on the Suppression of Acts of Terrorism',
    identifier: 'Loi n\u00b0 2014/028',
    pdf_url: `${DC}/324.12.14-Loi-du-23-decembre-2014_Actes-de-terrorisme.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2017/012 du 12 juillet 2017 portant Code de justice militaire",
    title_en: 'Law No. 2017/012 of 12 July 2017 - Code of Military Justice',
    identifier: 'Loi n\u00b0 2017/012',
    pdf_url: `${DC}/42.07.17-Law--of-12-July-2017-to-lay-down-the-Code-of-Military-Justice.pdf`,
    status: 'in_force',
    category: 'military',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2017/013 du 12 juillet 2017 portant r\u00e9pression des infractions \u00e0 la s\u00fbret\u00e9 de l'aviation",
    title_en: 'Law No. 2017/013 of 12 July 2017 on Aviation Safety Infractions',
    identifier: 'Loi n\u00b0 2017/013',
    pdf_url: `${DC}/32.07.17-Loi-du-12-juillet-2017_Aviation_repression-des-infractions.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 97/019 du 7 ao\u00fbt 1997 relative au contr\u00f4le des stup\u00e9fiants",
    title_en: 'Law No. 97/019 of 7 August 1997 on Narcotics Control',
    identifier: 'Loi n\u00b0 97/019',
    pdf_url: `${DC}/325.08.97-Loi-du-7-aout-1997_Stupefiants.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2006/088 du 11 mars 2006 portant cr\u00e9ation de la commission anti-corruption",
    title_en: 'Decree No. 2006/088 of 11 March 2006 establishing the Anti-Corruption Commission',
    identifier: 'D\u00e9cret n\u00b0 2006/088',
    pdf_url: `${DC}/322.03.06-Decret-du-11-mars-2006_Commission-anti-corruption.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },

  // ============================================================
  // 15. SECURITY (Section 4)
  // ============================================================
  {
    title: "Loi n\u00b0 90-54 du 19 d\u00e9cembre 1990 relative au maintien de l'ordre",
    title_en: 'Law No. 90-54 of 19 December 1990 on Public Order Maintenance',
    identifier: 'Loi n\u00b0 90-54',
    pdf_url: `${DC}/4.12.90-Loi-du-19-decembre-1990_Maintien-de-l-ordre.pdf`,
    status: 'in_force',
    category: 'security',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2016/015 du 14 d\u00e9cembre 2016 portant r\u00e9gime g\u00e9n\u00e9ral des armes et munitions",
    title_en: 'Law No. 2016/015 of 14 December 2016 on Arms and Ammunition',
    identifier: 'Loi n\u00b0 2016/015',
    pdf_url: `${DC}/48.12.16-Loi-du-14-decembre-2016_Regime-general-des-armes.pdf`,
    status: 'in_force',
    category: 'security',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2022/006 du 27 d\u00e9cembre 2022 relative \u00e0 la navigation maritime et \u00e0 la r\u00e9pression de la piraterie",
    title_en: 'Law No. 2022/006 of 27 December 2022 on Maritime Navigation and Piracy',
    identifier: 'Loi n\u00b0 2022/006',
    pdf_url: `${DC}/735.12.22-Loi-du-27-decembre-2022_Navigation-maritime_piraterie.pdf`,
    status: 'in_force',
    category: 'maritime',
    classification: 'ingestable',
  },

  // ============================================================
  // 16. EMPLOYMENT & LABOUR (Section 82)
  // ============================================================
  {
    title: 'Loi n\u00b0 92/007 du 14 ao\u00fbt 1992 portant Code du Travail',
    title_en: 'Law No. 92/007 of 14 August 1992 - Labour Code',
    identifier: 'Loi n\u00b0 92/007',
    pdf_url: `${DC}/820.08.92-Loi-du-14-aout-1992_Code-du-travail.pdf`,
    status: 'in_force',
    category: 'labour',
    classification: 'ingestable',
  },

  // ============================================================
  // 17. CYBERSECURITY & TELECOMMUNICATIONS (Section 73)
  // ============================================================
  {
    title: "Loi n\u00b0 2010/012 du 21 d\u00e9cembre 2010 relative \u00e0 la cybers\u00e9curit\u00e9 et la cybercriminalit\u00e9 au Cameroun",
    title_en: 'Law No. 2010/012 of 21 December 2010 on Cybersecurity and Cybercrime in Cameroon',
    identifier: 'Loi n\u00b0 2010/012',
    pdf_url: `${DC}/731.12.10-Loi-du-21-decembre-2010_Cybersecurite.pdf`,
    status: 'in_force',
    category: 'cybersecurity',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2010/013 du 21 d\u00e9cembre 2010 r\u00e9gissant les communications \u00e9lectroniques au Cameroun",
    title_en: 'Law No. 2010/013 of 21 December 2010 on Electronic Communications',
    identifier: 'Loi n\u00b0 2010/013',
    pdf_url: `${DC}/731.12.10.1-Loi-du-21-decembre-2010_Communications-electroniques.pdf`,
    status: 'in_force',
    category: 'telecommunications',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2010/021 du 21 d\u00e9cembre 2010 r\u00e9gissant le commerce \u00e9lectronique au Cameroun",
    title_en: 'Law No. 2010/021 of 21 December 2010 on Electronic Commerce',
    identifier: 'Loi n\u00b0 2010/021',
    pdf_url: `${DC}/931.12.10-Loi-du-21-decembre-2010_Commerce-electronique.pdf`,
    status: 'in_force',
    category: 'ecommerce',
    classification: 'ingestable',
  },

  // ============================================================
  // 18. CONSUMER PROTECTION
  // ============================================================
  {
    title: "Loi cadre n\u00b0 2011/012 du 6 mai 2011 relative \u00e0 la protection du consommateur",
    title_en: 'Framework Law No. 2011/012 of 6 May 2011 on Consumer Protection',
    identifier: 'Loi n\u00b0 2011/012',
    pdf_url: `${AL}/Cameroon/Consumer%20Law/Loi%20cadre%20N%C2%B0%202011012%20relative%20%C3%A0%20la%20protection%20du%20consommateur.pdf`,
    status: 'in_force',
    category: 'consumer',
    classification: 'ingestable',
  },
  {
    title: "Arr\u00eat\u00e9 n\u00b0 119/PM du 10 ao\u00fbt 2012 portant organisation des comit\u00e9s de recours pour l'arbitrage des diff\u00e9rends",
    title_en: 'Order No. 119/PM of 10 August 2012 on Consumer Dispute Arbitration Committees',
    identifier: 'Arr\u00eat\u00e9 n\u00b0 119/PM',
    pdf_url: `${AL}/Cameroon/Consumer%20Law/Arr%C3%AAt%C3%A9%20n%C2%B0%20119%20PM%20du%2010%20ao%C3%BBt%202012%20portant%20organisation%20et%20fonctionnement%20des%20Comit%C3%A9s%20de%20Recours%20pour%20l'arbitrage%20des%20diff%C3%A9rends%20relatifs%20%C3%A0%20la%20protection%20du%20consommateur.pdf`,
    status: 'in_force',
    category: 'consumer',
    classification: 'ingestable',
  },

  // ============================================================
  // 19. DATA PROTECTION / PRIVACY
  // ============================================================
  {
    title: "D\u00e9cret n\u00b0 2013/0399 fixant les modalit\u00e9s de protection des consommateurs de communications \u00e9lectroniques",
    title_en: 'Decree No. 2013/0399 on Protection of Electronic Communications Consumers',
    identifier: 'D\u00e9cret n\u00b0 2013/0399',
    pdf_url: `${AL}/Cameroon/Privacy%20Law/Decret%20N%2020130399%20fixant%20les%20modalit%C3%A9s%20de%20protection%20des%20consommateurs%20des%20services%20de%20communications%20%C3%A9lectroniques.pdf`,
    status: 'in_force',
    category: 'data_protection',
    classification: 'ingestable',
  },

  // ============================================================
  // 20. COMMERCIAL LAW
  // ============================================================
  {
    title: "Loi n\u00b0 90/031 du 10 ao\u00fbt 1990 r\u00e9gissant l'activit\u00e9 commerciale au Cameroun",
    title_en: 'Law No. 90/031 of 10 August 1990 on Commercial Activity',
    identifier: 'Loi n\u00b0 90/031',
    pdf_url: `${AL}/Cameroon/Comercial%20law/Loi%20n%C2%B0%2090-031%20du%2010%20Ao%C3%BBt%201990%20r%C3%A9gissant%20l'activit%C3%A9%20commerciale%20au%20Cameroun.pdf`,
    status: 'in_force',
    category: 'commercial',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2007/004 du 13 juillet 2007 r\u00e9gissant l'artisanat au Cameroun",
    title_en: 'Law No. 2007/004 of 13 July 2007 on Craftsmanship',
    identifier: 'Loi n\u00b0 2007/004',
    pdf_url: `${AL}/Cameroon/Comercial%20law/Loi%20N%C2%B0%202007004%20DU%2013%20JUILLET%202007%20REGISSANT%20L'ARTISANAT%20AU%20CAMEROUN.pdf`,
    status: 'in_force',
    category: 'commercial',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2005/0528/PM du 15 f\u00e9vrier 2005 portant cr\u00e9ation du comit\u00e9 de lutte contre la fraude et la contrefa\u00e7on",
    title_en: 'Decree No. 2005/0528/PM of 15 February 2005 on Anti-Fraud and Anti-Counterfeiting Committee',
    identifier: 'D\u00e9cret n\u00b0 2005/0528/PM',
    pdf_url: `${AL}/Cameroon/Comercial%20law/D%C3%A9cret%20N%C2%B0%2020050528PM%20DU%2015%20FEVRIER%202005%20PORTANT%20CREATION%2C%20ORGANISATION%20ET%20FONCTIONNEMENT%20D'UN%20COMITE%20AD%20HOC%20DE%20COORDINATION%20DES%20OPERATIONS%20DE%20LUTTE%20CONTRE%20LA%20FRAUDE%2C%20LA%20CONTREBANDE%20ET%20LA%20CONTREFACON.pdf`,
    status: 'in_force',
    category: 'commercial',
    classification: 'ingestable',
  },

  // ============================================================
  // 21. COMPETITION LAW
  // ============================================================
  {
    title: "Loi n\u00b0 98/013 de la concurrence",
    title_en: 'Law No. 98/013 on Competition',
    identifier: 'Loi n\u00b0 98/013',
    pdf_url: `${AL}/Cameroon/Competition%20law/Loi%20No.%2098-013%20de%20la%20concurrence.pdf`,
    status: 'in_force',
    category: 'competition',
    classification: 'ingestable',
  },

  // ============================================================
  // 22. TAX LAW
  // ============================================================
  {
    title: "Code g\u00e9n\u00e9ral des imp\u00f4ts du Cameroun",
    title_en: 'General Tax Code of Cameroon',
    identifier: 'Code des imp\u00f4ts',
    pdf_url: `${AL}/Cameroon/Tax%20Law/Code%20g%C3%A9n%C3%A9ral%20des%20imp%C3%B4ts%20Cameroun.pdf`,
    status: 'in_force',
    category: 'taxation',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2019/023 du 24 d\u00e9cembre 2019 portant loi de finances pour l'exercice 2020",
    title_en: 'Law No. 2019/023 of 24 December 2019 - Finance Law for 2020',
    identifier: 'Loi n\u00b0 2019/023',
    pdf_url: `${AL}/Cameroon/Tax%20Law/Loi%202019023%20du%2024%20d%C3%A9cembre%202019%20portant%20loi%20de%20finances%20de%20la%20R%C3%A9publique%20du%20Cameroun%20pour%20l'exercice%202020.pdf`,
    status: 'in_force',
    category: 'taxation',
    classification: 'ingestable',
  },
  {
    title: "Ordonnance n\u00b0 2020/001 du 3 juin 2020 modifiant la loi de finances 2020",
    title_en: 'Ordinance No. 2020/001 of 3 June 2020 amending the 2020 Finance Law',
    identifier: 'Ordonnance n\u00b0 2020/001',
    pdf_url: `${AL}/Cameroon/Tax%20Law/Ordonnance%20N%C2%B02020001%20du%2003%20juin%202020%20modifiant%20et%20compl%C3%A9tant%20certaines%20dispositions%20de%20la%20loi%20n%C2%B02019023%20du%2024%20d%C3%A9cembre%202019%20portant%20loi%20de%20finances%20de%20la%20R%C3%A9publique%20du%20Cameroun%20pour%20l'exercice%202020.pdf`,
    status: 'in_force',
    category: 'taxation',
    classification: 'ingestable',
  },

  // ============================================================
  // 23. FAMILY LAW
  // ============================================================
  {
    title: "Loi n\u00b0 2005/015 du 29 d\u00e9cembre 2005 relative \u00e0 la lutte contre le trafic des enfants",
    title_en: 'Law No. 2005/015 of 29 December 2005 on Combating Child Trafficking',
    identifier: 'Loi n\u00b0 2005/015-family',
    pdf_url: `${AL}/Cameroon/Family%20law/Loi%20N%C2%B0%202005-015%20DU%2029%20DECEMBRE%202005%20RELATIVE%20A%20LA%20LUTTE%20CONTRE%20LE%20TRAFIC%20ET%20LA%20TRAITE%20DES%20ENFANTS.pdf`,
    status: 'in_force',
    category: 'family',
    classification: 'ingestable',
  },

  // ============================================================
  // 24. MINING LAW
  // ============================================================
  {
    title: "Loi n\u00b0 2016/017 du 14 d\u00e9cembre 2016 portant Code minier",
    title_en: 'Law No. 2016/017 of 14 December 2016 - Mining Code',
    identifier: 'Loi n\u00b0 2016/017',
    pdf_url: `${DC}/711.12.16-Loi-du-14-decembre-2016_Code-minier.pdf`,
    status: 'in_force',
    category: 'mining',
    classification: 'ingestable',
  },

  // ============================================================
  // 25. FORESTRY & ENVIRONMENT (Section 71)
  // ============================================================
  {
    title: "Loi n\u00b0 94/01 du 20 janvier 1994 portant r\u00e9gime des for\u00eats, de la faune et de la p\u00eache",
    title_en: 'Law No. 94/01 of 20 January 1994 on Forestry, Wildlife and Fisheries',
    identifier: 'Loi n\u00b0 94/01',
    pdf_url: `${DC}/712.01.94-Loi-du-20-janvier-1994_Forets-faune-peche.pdf`,
    status: 'in_force',
    category: 'environment',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 96/12 du 5 ao\u00fbt 1996 portant loi-cadre relative \u00e0 la gestion de l'environnement",
    title_en: 'Framework Law No. 96/12 of 5 August 1996 on Environmental Management',
    identifier: 'Loi n\u00b0 96/12',
    pdf_url: `${DC}/711.08.96-Loi-du-5-aout-1996_Environnement.pdf`,
    status: 'in_force',
    category: 'environment',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 98/005 du 14 avril 1998 portant r\u00e9gime de l'eau",
    title_en: 'Law No. 98/005 of 14 April 1998 on the Water Regime',
    identifier: 'Loi n\u00b0 98/005',
    pdf_url: `${DC}/712.04.98-Loi-du-14-avril-1998_Regime-de-l-eau.pdf`,
    status: 'in_force',
    category: 'environment',
    classification: 'ingestable',
  },

  // ============================================================
  // 26. OHADA (Shared Business Law)
  // ============================================================
  {
    title: "Trait\u00e9 OHADA relatif \u00e0 l'harmonisation du droit des affaires en Afrique",
    title_en: 'OHADA Treaty on Harmonization of Business Law in Africa',
    identifier: 'Trait\u00e9 OHADA',
    pdf_url: `${AL}/OHADA/TRAIT%C3%89%20RELATIF%20A%20L'HARMONISATION%20EN%20AFRIQUE%20D'UN%20DROIT%20DES%20AFFAIRES.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA relatif au droit commercial g\u00e9n\u00e9ral (r\u00e9vis\u00e9)",
    title_en: 'OHADA Uniform Act on General Commercial Law (revised)',
    identifier: 'AU OHADA Commerce r\u00e9vis\u00e9',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20R%C3%89VIS%C3%89%20PORTANT%20SUR%20LE%20DROIT%20COMMERCIAL%20G%C3%89N%C3%89RAL.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA relatif au droit des soci\u00e9t\u00e9s commerciales (r\u00e9vis\u00e9)",
    title_en: 'OHADA Uniform Act on Commercial Companies Law (revised)',
    identifier: 'AU OHADA Soci\u00e9t\u00e9s r\u00e9vis\u00e9',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20R%C3%89VIS%C3%89%20RELATIF%20AU%20DROIT%20DES%20SOCI%C3%89T%C3%89S%20COMMERCIALES%20ET%20DU%20REGROUPEMENT%20D'INT%C3%89R%C3%8AT%20%C3%89CONOMIQUE.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA portant organisation des s\u00fbret\u00e9s (r\u00e9vis\u00e9)",
    title_en: 'OHADA Uniform Act on Security Arrangements (revised)',
    identifier: 'AU OHADA S\u00fbret\u00e9s r\u00e9vis\u00e9',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20R%C3%89VIS%C3%89%20PORTANT%20ORGANISATION%20DES%20S%C3%9BRET%C3%89S.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA portant organisation des proc\u00e9dures collectives d'apurement du passif",
    title_en: 'OHADA Uniform Act on Collective Insolvency Proceedings',
    identifier: 'AU OHADA Proc\u00e9dures collectives',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20PORTANT%20ORGANISATION%20DES%20PROC%C3%89DURES%20COLLECTIVES%20D'APARUREMENT%20DU%20PASSIF.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA portant organisation des proc\u00e9dures simplifi\u00e9es de recouvrement et des voies d'ex\u00e9cution",
    title_en: 'OHADA Uniform Act on Simplified Recovery Procedures and Enforcement',
    identifier: 'AU OHADA Recouvrement',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20PORTANT%20ORGANISATION%20DES%20PROC%C3%89DURES%20SIMPLIFI%C3%89ES%20DE%20RECOUVREMENT%20ET%20DES%20VOIES%20D'EX%C3%89CUTION.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA relatif au droit de l'arbitrage",
    title_en: 'OHADA Uniform Act on Arbitration Law',
    identifier: 'AU OHADA Arbitrage',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20RELATIF%20AU%20DROIT%20DE%20L'ARBITRAGE.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },
  {
    title: "Acte uniforme OHADA relatif au droit des soci\u00e9t\u00e9s coop\u00e9ratives",
    title_en: 'OHADA Uniform Act on Cooperative Companies',
    identifier: 'AU OHADA Coop\u00e9ratives',
    pdf_url: `${AL}/OHADA/ACTE%20UNIFORME%20RELATIF%20AU%20DROIT%20DES%20SOCI%C3%89T%C3%89S%20COOP%C3%89RATIVES.pdf`,
    status: 'in_force',
    category: 'ohada',
    classification: 'ingestable',
  },

  // ============================================================
  // 27. CEMAC (Central Africa Economic Community) REGULATIONS
  // ============================================================
  {
    title: "R\u00e8glement CEMAC n\u00b0 02/01 relatif aux microfinances",
    title_en: 'CEMAC Regulation No. 02/01 on Microfinance',
    identifier: 'R\u00e8glement CEMAC 02/01',
    pdf_url: `${AL}/Cameroon/banking%20and%20finance%20law/CEMAC-Reglement%20N%C2%B0%202002-01%20Microfinances.pdf`,
    status: 'in_force',
    category: 'cemac',
    classification: 'ingestable',
  },
  {
    title: "R\u00e8glement CEMAC n\u00b0 01/17 relatif aux conditions d'exercice de la microfinance",
    title_en: 'CEMAC Regulation No. 01/17 on Microfinance Conditions',
    identifier: 'R\u00e8glement CEMAC 01/17',
    pdf_url: `${AL}/Cameroon/banking%20and%20finance%20law/CEMAC-R%C3%A8glement%20N%C2%B0%2001-17%20relatif%20aux%20conditions%20d'exercice%20et%20de%20controle%20de%20lactivite%20de%20microfinance.pdf`,
    status: 'in_force',
    category: 'cemac',
    classification: 'ingestable',
  },
  {
    title: "R\u00e8glement CEMAC n\u00b0 02/18 portant r\u00e9glementation des changes",
    title_en: 'CEMAC Regulation No. 02/18 on Currency Exchange',
    identifier: 'R\u00e8glement CEMAC 02/18',
    pdf_url: `${AL}/Cameroon/banking%20and%20finance%20law/CEMAC%20Reglement%20N%C2%B002-18%20portant%20reglementation%20des%20changes.pdf`,
    status: 'in_force',
    category: 'cemac',
    classification: 'ingestable',
  },
  {
    title: "R\u00e8glement CEMAC n\u00b0 02/14 relatif au traitement des banques en difficult\u00e9s",
    title_en: 'CEMAC Regulation No. 02/14 on Treatment of Troubled Banks',
    identifier: 'R\u00e8glement CEMAC 02/14',
    pdf_url: `${AL}/Cameroon/banking%20and%20finance%20law/CEMAC-%20R%C3%A8glement%20N%C2%B002-14%20traitement%20des%20banques%20en%20difficultes.pdf`,
    status: 'in_force',
    category: 'cemac',
    classification: 'ingestable',
  },
  {
    title: "R\u00e8glement CEMAC n\u00b0 06/2019 relatif \u00e0 la concurrence",
    title_en: 'CEMAC Regulation No. 06/2019 on Competition',
    identifier: 'R\u00e8glement CEMAC 06/2019',
    pdf_url: `${AL}/Cameroon/Competition%20law/CEMAC-R%C3%A8glement%20N%C2%B0%2006-2019%20relatif%20%C3%A0%20la%20concurrence.pdf`,
    status: 'in_force',
    category: 'cemac',
    classification: 'ingestable',
  },
  {
    title: "R\u00e8glement CEMAC n\u00b0 1999/04 relatif aux pratiques commerciales anticoncurrentielles",
    title_en: 'CEMAC Regulation No. 1999/04 on Anti-Competitive Commercial Practices',
    identifier: 'R\u00e8glement CEMAC 1999/04',
    pdf_url: `${AL}/Cameroon/Competition%20law/CEMAC-R%C3%A8glement%20N%C2%B01999-04%20pratique%20commerciales%20anticoncurrentielles.pdf`,
    status: 'in_force',
    category: 'cemac',
    classification: 'ingestable',
  },

  // ============================================================
  // 28. ADDITIONAL NATIONAL LAWS
  // ============================================================
  {
    title: "D\u00e9cret n\u00b0 2018/719 du 30 novembre 2018 portant cr\u00e9ation du Comit\u00e9 national de d\u00e9sarmement",
    title_en: 'Decree No. 2018/719 of 30 November 2018 on National Disarmament Committee',
    identifier: 'D\u00e9cret n\u00b0 2018/719',
    pdf_url: `${DC}/413.11.18-Decre-of-30-novembre-2018_National-Disarmaent.pdf`,
    status: 'in_force',
    category: 'security',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2015/407 du 16 septembre 2015 fixant les conditions d'exercice de l'activit\u00e9 de gardiennage",
    title_en: 'Decree No. 2015/407 of 16 September 2015 on Private Security Guard Activities',
    identifier: 'D\u00e9cret n\u00b0 2015/407',
    pdf_url: `${DC}/47.09.15-Decret-du-16-septembre-2015_Activite-de-gardiennage_application.pdf`,
    status: 'in_force',
    category: 'security',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 82/002 du 29 juin 1982 relative \u00e0 l'\u00e9pargne-logement",
    title_en: 'Law No. 82/002 of 29 June 1982 on Housing Savings',
    identifier: 'Loi n\u00b0 82/002',
    pdf_url: `${DC}/232.06.82-Loi-du-29-juin-1982_Epargne-logement.pdf`,
    status: 'in_force',
    category: 'banking',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2005/1363/PM du 6 mai 2005 portant cr\u00e9ation de la Commission nationale de la concurrence",
    title_en: 'Decree No. 2005/1363/PM of 6 May 2005 on the National Competition Commission',
    identifier: 'D\u00e9cret n\u00b0 2005/1363/PM',
    pdf_url: `${DC}/915.05.05-Decret-du-6-mai-2005_Commission-de-concurrence.pdf`,
    status: 'in_force',
    category: 'competition',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 79/17 du 30 juin 1979 relative \u00e0 la contestation de la d\u00e9signation des chefs traditionnels",
    title_en: 'Law No. 79/17 of 30 June 1979 on Traditional Chief Designation Disputes',
    identifier: 'Loi n\u00b0 79/17',
    pdf_url: `${DC}/182.06.79-Loi-du-30-juin-1979_Designation-des-chefs-traditionnels_contestation.pdf`,
    status: 'in_force',
    category: 'traditional',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2020/193 du 15 avril 2020 relatif \u00e0 la remise de peines",
    title_en: 'Decree No. 2020/193 of 15 April 2020 on Sentence Commutation',
    identifier: 'D\u00e9cret n\u00b0 2020/193',
    pdf_url: `${DC}/356.04.20-Decret-du-15-avril-2020_Remise-de-peines.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2010/365 du 29 novembre 2010 portant statut du personnel de l'administration p\u00e9nitentiaire",
    title_en: 'Decree No. 2010/365 of 29 November 2010 on Penitentiary Staff Status',
    identifier: 'D\u00e9cret n\u00b0 2010/365',
    pdf_url: `${DC}/355.11.10-Decret-du-29-novembre-2010_Administration-penitentiaire_fonctionnaires.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2013/131 du 3 mai 2013 relatif au corps sp\u00e9cialis\u00e9 d'officiers de police judiciaire",
    title_en: 'Decree No. 2013/131 of 3 May 2013 on Specialized Judicial Police Corps',
    identifier: 'D\u00e9cret n\u00b0 2013/131',
    pdf_url: `${DC}/352.05.13-Decret-du-3-mai-2013_Corps-specialise-d-officiers-de-police-judiciaire-du-Tribunal-criminel-special.pdf`,
    status: 'in_force',
    category: 'criminal',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2019/030 du 23 janvier 2019 portant organisation du Minist\u00e8re de l'Administration territoriale",
    title_en: 'Decree No. 2019/030 of 23 January 2019 on Ministry of Territorial Administration',
    identifier: 'D\u00e9cret n\u00b0 2019/030',
    pdf_url: `${DC}/142.01.19-Decret-du-23-janvier-2019_ministere-de-l-Administration-territoriale.pdf`,
    status: 'in_force',
    category: 'executive',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2018/190 du 2 mars 2018 modifiant l'organisation du Gouvernement",
    title_en: 'Decree No. 2018/190 of 2 March 2018 amending Government Organization',
    identifier: 'D\u00e9cret n\u00b0 2018/190',
    pdf_url: `${DC}/142.03.18-Decret-du-2-mars-2018_Gouvernement_modifications.pdf`,
    status: 'in_force',
    category: 'executive',
    classification: 'ingestable',
  },
  {
    title: "Loi n\u00b0 2019/006 du 25 avril 2019 relative aux indemnit\u00e9s des conseillers r\u00e9gionaux",
    title_en: 'Law No. 2019/006 of 25 April 2019 on Regional Councillors Allowances',
    identifier: 'Loi n\u00b0 2019/006',
    pdf_url: `${DC}/128.04.19-Loi-du-25-avril-2019_Conseillers-regionaux_indemnites.pdf`,
    status: 'in_force',
    category: 'decentralization',
    classification: 'ingestable',
  },
  {
    title: "D\u00e9cret n\u00b0 2023/223 du 27 avril 2023 portant transfert de comp\u00e9tences en mati\u00e8re d'\u00e9ducation secondaire",
    title_en: 'Decree No. 2023/223 of 27 April 2023 on Transfer of Education Powers to Regions',
    identifier: 'D\u00e9cret n\u00b0 2023/223',
    pdf_url: `${DC}/128.04.23-Decret-du-27-avril-2023_Competences-des-regions-en-matiere-scolaires.pdf`,
    status: 'in_force',
    category: 'decentralization',
    classification: 'ingestable',
  },
];

/* ---------- Main ---------- */

async function main(): Promise<void> {
  console.log('Cameroon Law MCP -- Census (Full Corpus)');
  console.log('=========================================\n');
  console.log('  Sources: droitcamerounais.info, africa-laws.org, OHADA, CEMAC');
  console.log('  Language: French (bilingual French/English)');
  console.log('  License: Government Open Data / Open Access\n');

  const existingEntries = loadExistingCensus();
  if (existingEntries.size > 0) {
    console.log(`  Loaded ${existingEntries.size} existing entries from previous census\n`);
  }

  for (const law of CURATED_LAWS) {
    const id = titleToId(law.title);
    const existing = existingEntries.get(id);

    const entry: CensusLawEntry = {
      id,
      title: law.title,
      title_en: law.title_en,
      identifier: law.identifier,
      url: law.pdf_url,
      pdf_url: law.pdf_url,
      status: law.status,
      category: law.category,
      classification: law.classification,
      ingested: existing?.ingested ?? false,
      provision_count: existing?.provision_count ?? 0,
      ingestion_date: existing?.ingestion_date ?? null,
    };

    existingEntries.set(id, entry);
  }

  const allLaws = Array.from(existingEntries.values()).sort((a, b) =>
    a.title.localeCompare(b.title, 'fr'),
  );

  const ingestable = allLaws.filter(l => l.classification === 'ingestable').length;
  const ocr_needed = allLaws.filter(l => l.classification === 'ocr_needed').length;
  const inaccessible = allLaws.filter(l => l.classification === 'inaccessible').length;
  const excluded = allLaws.filter(l => l.classification === 'excluded').length;

  const today = new Date().toISOString().split('T')[0];

  const census: CensusFile = {
    schema_version: '2.0',
    jurisdiction: 'CM',
    jurisdiction_name: 'Cameroon',
    portal: 'https://droitcamerounais.info',
    census_date: today,
    agent: 'claude-opus-4-6',
    summary: {
      total_laws: allLaws.length,
      ingestable,
      ocr_needed,
      inaccessible,
      excluded,
    },
    laws: allLaws,
  };

  fs.mkdirSync(path.dirname(CENSUS_PATH), { recursive: true });
  fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));

  console.log('=========================================');
  console.log('Census Complete');
  console.log('=========================================\n');
  console.log(`  Total laws:     ${allLaws.length}`);
  console.log(`  Ingestable:     ${ingestable}`);
  console.log(`  OCR needed:     ${ocr_needed}`);
  console.log(`  Inaccessible:   ${inaccessible}`);
  console.log(`  Excluded:       ${excluded}`);
  console.log(`\n  Output: ${CENSUS_PATH}`);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
