#!/usr/bin/env tsx
/**
 * Cameroon Law MCP -- Curated Seed Generator
 *
 * Generates seed JSON files from curated law content for key Cameroonian legislation.
 * Cameroon is bilingual (French/English) -- most content here is in French.
 *
 * Usage:
 *   npx tsx scripts/generate-seeds.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import type { ParsedAct, ParsedProvision, ParsedDefinition } from './lib/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_DIR = path.resolve(__dirname, '../data/seed');
const CENSUS_PATH = path.resolve(__dirname, '../data/census.json');

function titleToId(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

interface CuratedSeed {
  title: string;
  title_en: string;
  short_name: string;
  status: 'in_force' | 'amended' | 'repealed';
  issued_date: string;
  in_force_date: string;
  url: string;
  description: string;
  provisions: ParsedProvision[];
  definitions: ParsedDefinition[];
}

const SEEDS: CuratedSeed[] = [
  // ---- CYBERSECURITY & CYBERCRIME LAW ----
  {
    title: 'Loi N\u00b0 2010/012 du 21 d\u00e9cembre 2010 relative \u00e0 la cybers\u00e9curit\u00e9 et la cybercriminalit\u00e9 au Cameroun',
    title_en: 'Law No. 2010/012 of 21 December 2010 on Cybersecurity and Cybercrime in Cameroon',
    short_name: 'Loi 2010/012 (Cybers\u00e9curit\u00e9)',
    status: 'in_force',
    issued_date: '2010-12-21',
    in_force_date: '2010-12-21',
    url: 'https://droitcamerounais.info',
    description: 'Loi camerounaise sur la cybers\u00e9curit\u00e9 et la cybercriminalit\u00e9',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Objet', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "La pr\u00e9sente loi r\u00e9git le cadre de s\u00e9curit\u00e9 des r\u00e9seaux de communications \u00e9lectroniques et des syst\u00e8mes d'information, d\u00e9finit et r\u00e9prime les infractions li\u00e9es \u00e0 l'utilisation des technologies de l'information et de la communication au Cameroun." },
      { provision_ref: 'art2', section: '2', title: 'Article 2 - D\u00e9finitions', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "Au sens de la pr\u00e9sente loi et de ses textes d'application, les d\u00e9finitions ci-apr\u00e8s sont admises : \u00ab communication \u00e9lectronique \u00bb : toute mise \u00e0 disposition du public ou de cat\u00e9gories de public, par un proc\u00e9d\u00e9 de t\u00e9l\u00e9communication, de signes, de signaux, d'\u00e9crits, d'images, de sons ou de messages de toute nature ; \u00ab cybers\u00e9curit\u00e9 \u00bb : ensemble de mesures de pr\u00e9vention, de protection et de dissuasion d'ordre technique, organisationnel, juridique, financier, humain, proc\u00e9dural et strat\u00e9gique permettant d'atteindre les objectifs de s\u00e9curit\u00e9 appliqu\u00e9s au cyberespace ; \u00ab cybercriminalit\u00e9 \u00bb : ensemble des infractions p\u00e9nales qui se commettent au moyen du r\u00e9seau internet ou d'un syst\u00e8me informatique." },
      { provision_ref: 'art5', section: '5', title: 'Article 5 - Politique nationale de cybers\u00e9curit\u00e9', chapter: 'Titre 2 - De la cybers\u00e9curit\u00e9', content: "L'\u00c9tat d\u00e9finit la politique de cybers\u00e9curit\u00e9 et veille \u00e0 sa mise en \u0153uvre. Il peut confier cette mission \u00e0 un organisme existant ou \u00e0 cr\u00e9er." },
      { provision_ref: 'art6', section: '6', title: 'Article 6 - Audit de s\u00e9curit\u00e9', chapter: 'Titre 2 - De la cybers\u00e9curit\u00e9', content: "Les op\u00e9rateurs de r\u00e9seaux de communications \u00e9lectroniques et les fournisseurs de services sont tenus de proc\u00e9der \u00e0 un audit de s\u00e9curit\u00e9 obligatoire de leurs syst\u00e8mes d'information." },
      { provision_ref: 'art8', section: '8', title: 'Article 8 - Acc\u00e8s non autoris\u00e9', chapter: 'Titre 3 - De la cybercriminalit\u00e9', content: "Quiconque acc\u00e8de ou tente d'acc\u00e9der frauduleusement \u00e0 tout ou partie d'un syst\u00e8me informatique est puni d'un emprisonnement de un \u00e0 deux ans et d'une amende de 1 000 000 \u00e0 10 000 000 de francs CFA." },
      { provision_ref: 'art9', section: '9', title: 'Article 9 - Maintien frauduleux', chapter: 'Titre 3 - De la cybercriminalit\u00e9', content: "Quiconque se maintient ou tente de se maintenir frauduleusement dans tout ou partie d'un syst\u00e8me informatique est puni des m\u00eames peines que celles pr\u00e9vues \u00e0 l'article 8." },
      { provision_ref: 'art10', section: '10', title: 'Article 10 - Atteinte \u00e0 l\'int\u00e9grit\u00e9 des donn\u00e9es', chapter: 'Titre 3 - De la cybercriminalit\u00e9', content: "Quiconque introduit, modifie, supprime ou rend inop\u00e9rantes les donn\u00e9es dans un syst\u00e8me informatique frauduleusement est puni d'un emprisonnement de deux \u00e0 cinq ans et d'une amende de 5 000 000 \u00e0 50 000 000 de francs CFA." },
      { provision_ref: 'art11', section: '11', title: 'Article 11 - Interception illicite', chapter: 'Titre 3 - De la cybercriminalit\u00e9', content: "Quiconque intercepte frauduleusement par des moyens techniques des donn\u00e9es informatiques lors de leur transmission est puni d'un emprisonnement de deux \u00e0 cinq ans et d'une amende de 5 000 000 \u00e0 50 000 000 de francs CFA." },
      { provision_ref: 'art14', section: '14', title: 'Article 14 - Usurpation d\'identit\u00e9 num\u00e9rique', chapter: 'Titre 3 - De la cybercriminalit\u00e9', content: "Quiconque utilise frauduleusement les \u00e9l\u00e9ments d'identification d'une personne physique ou morale par le biais d'un syst\u00e8me informatique est puni d'un emprisonnement de deux \u00e0 cinq ans et d'une amende de 1 000 000 \u00e0 5 000 000 de francs CFA." },
      { provision_ref: 'art25', section: '25', title: 'Article 25 - Conservation des donn\u00e9es', chapter: 'Titre 4 - De la proc\u00e9dure', content: "Les op\u00e9rateurs de communications \u00e9lectroniques et les fournisseurs de services sont tenus de conserver les donn\u00e9es de connexion et de trafic pendant une dur\u00e9e de dix ans." },
    ],
    definitions: [
      { term: 'communication \u00e9lectronique', definition: "toute mise \u00e0 disposition du public, par un proc\u00e9d\u00e9 de t\u00e9l\u00e9communication, de signes, de signaux, d'\u00e9crits, d'images, de sons ou de messages", source_provision: 'art2' },
      { term: 'cybers\u00e9curit\u00e9', definition: "ensemble de mesures de pr\u00e9vention, de protection et de dissuasion permettant d'atteindre les objectifs de s\u00e9curit\u00e9 appliqu\u00e9s au cyberespace", source_provision: 'art2' },
      { term: 'cybercriminalit\u00e9', definition: "ensemble des infractions p\u00e9nales qui se commettent au moyen du r\u00e9seau internet ou d'un syst\u00e8me informatique", source_provision: 'art2' },
    ],
  },

  // ---- ELECTRONIC COMMUNICATIONS LAW ----
  {
    title: 'Loi N\u00b0 2010/013 du 21 d\u00e9cembre 2010 r\u00e9gissant les communications \u00e9lectroniques au Cameroun',
    title_en: 'Law No. 2010/013 of 21 December 2010 on Electronic Communications in Cameroon',
    short_name: 'Loi 2010/013 (Communications)',
    status: 'in_force',
    issued_date: '2010-12-21',
    in_force_date: '2010-12-21',
    url: 'https://droitcamerounais.info',
    description: 'Loi r\u00e9gissant les communications \u00e9lectroniques au Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Objet', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "La pr\u00e9sente loi r\u00e9git les communications \u00e9lectroniques au Cameroun. Elle fixe le cadre juridique g\u00e9n\u00e9ral de l'\u00e9tablissement, de l'exploitation des r\u00e9seaux et de la fourniture des services de communications \u00e9lectroniques." },
      { provision_ref: 'art4', section: '4', title: 'Article 4 - R\u00e9gulation', chapter: 'Titre 2 - Du cadre institutionnel', content: "L'Agence de R\u00e9gulation des T\u00e9l\u00e9communications (ART) est charg\u00e9e de la r\u00e9gulation, du contr\u00f4le et du suivi des activit\u00e9s des exploitants et op\u00e9rateurs des r\u00e9seaux de communications \u00e9lectroniques." },
      { provision_ref: 'art38', section: '38', title: 'Article 38 - Protection des donn\u00e9es personnelles', chapter: 'Titre 5 - De la protection des usagers', content: "Les op\u00e9rateurs de r\u00e9seaux de communications \u00e9lectroniques et les fournisseurs de services sont tenus d'assurer la confidentialit\u00e9 des communications et la protection des donn\u00e9es personnelles de leurs abonn\u00e9s." },
      { provision_ref: 'art39', section: '39', title: 'Article 39 - Secret des correspondances', chapter: 'Titre 5 - De la protection des usagers', content: "Le secret des correspondances \u00e9mises par la voie des communications \u00e9lectroniques est garanti par la loi. Toute interception, \u00e9coute ou enregistrement des communications priv\u00e9es sans le consentement des parties est interdite." },
    ],
    definitions: [],
  },

  // ---- ELECTRONIC COMMERCE LAW ----
  {
    title: 'Loi N\u00b0 2010/021 du 21 d\u00e9cembre 2010 r\u00e9gissant le commerce \u00e9lectronique au Cameroun',
    title_en: 'Law No. 2010/021 of 21 December 2010 on Electronic Commerce in Cameroon',
    short_name: 'Loi 2010/021 (E-Commerce)',
    status: 'in_force',
    issued_date: '2010-12-21',
    in_force_date: '2010-12-21',
    url: 'https://droitcamerounais.info',
    description: 'Loi r\u00e9gissant le commerce \u00e9lectronique au Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Objet', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "La pr\u00e9sente loi r\u00e9git le commerce \u00e9lectronique au Cameroun. Elle fixe le cadre juridique des transactions commerciales effectu\u00e9es par voie \u00e9lectronique." },
      { provision_ref: 'art3', section: '3', title: 'Article 3 - D\u00e9finitions', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "Au sens de la pr\u00e9sente loi : \u00ab commerce \u00e9lectronique \u00bb d\u00e9signe l'activit\u00e9 \u00e9conomique par laquelle une personne propose ou assure, par voie \u00e9lectronique, la fourniture de biens ou la prestation de services ; \u00ab signature \u00e9lectronique \u00bb d\u00e9signe une donn\u00e9e qui r\u00e9sulte de l'usage d'un proc\u00e9d\u00e9 fiable d'identification garantissant son lien avec l'acte auquel elle s'attache." },
      { provision_ref: 'art5', section: '5', title: 'Article 5 - Obligations du prestataire', chapter: 'Titre 2 - Des obligations', content: "Tout prestataire de commerce \u00e9lectronique est tenu de mettre \u00e0 disposition du public, de mani\u00e8re facile, directe et permanente, les informations suivantes : sa d\u00e9nomination sociale, son adresse g\u00e9ographique, ses coordonn\u00e9es, son num\u00e9ro d'immatriculation." },
      { provision_ref: 'art10', section: '10', title: 'Article 10 - Validit\u00e9 des contrats \u00e9lectroniques', chapter: 'Titre 3 - Des contrats \u00e9lectroniques', content: "La validit\u00e9 d'un contrat ne peut \u00eatre remise en cause du seul fait qu'il a \u00e9t\u00e9 conclu par voie \u00e9lectronique. L'\u00e9crit sous forme \u00e9lectronique est admis en preuve au m\u00eame titre que l'\u00e9crit sur support papier." },
    ],
    definitions: [
      { term: 'commerce \u00e9lectronique', definition: "activit\u00e9 \u00e9conomique par laquelle une personne propose ou assure, par voie \u00e9lectronique, la fourniture de biens ou la prestation de services", source_provision: 'art3' },
      { term: 'signature \u00e9lectronique', definition: "donn\u00e9e qui r\u00e9sulte de l'usage d'un proc\u00e9d\u00e9 fiable d'identification garantissant son lien avec l'acte auquel elle s'attache", source_provision: 'art3' },
    ],
  },

  // ---- CONSUMER PROTECTION LAW ----
  {
    title: 'Loi cadre N\u00b0 2011/012 du 6 mai 2011 relative \u00e0 la protection du consommateur',
    title_en: 'Framework Law No. 2011/012 of 6 May 2011 on Consumer Protection',
    short_name: 'Loi 2011/012 (Consommateur)',
    status: 'in_force',
    issued_date: '2011-05-06',
    in_force_date: '2011-05-06',
    url: 'https://www.africa-laws.org/Cameroon.php',
    description: 'Loi cadre relative \u00e0 la protection du consommateur au Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Objet', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "La pr\u00e9sente loi fixe le cadre g\u00e9n\u00e9ral de la protection du consommateur au Cameroun. Elle vise \u00e0 assurer la s\u00e9curit\u00e9, la sant\u00e9 et la protection \u00e9conomique du consommateur." },
      { provision_ref: 'art3', section: '3', title: 'Article 3 - Droits du consommateur', chapter: 'Titre 2 - Des droits', content: "Le consommateur a droit \u00e0 l'information, \u00e0 la s\u00e9curit\u00e9, au choix, \u00e0 l'\u00e9ducation, \u00e0 la repr\u00e9sentation, \u00e0 la r\u00e9paration des pr\u00e9judices et \u00e0 un environnement sain." },
      { provision_ref: 'art5', section: '5', title: 'Article 5 - Droit \u00e0 l\'information', chapter: 'Titre 2 - Des droits', content: "Tout consommateur a le droit d'\u00eatre inform\u00e9 de mani\u00e8re claire et compr\u00e9hensible sur les produits et services mis \u00e0 sa disposition." },
    ],
    definitions: [],
  },

  // ---- CONSTITUTION ----
  {
    title: 'Constitution de la R\u00e9publique du Cameroun du 18 janvier 1996',
    title_en: 'Constitution of the Republic of Cameroon of 18 January 1996',
    short_name: 'Constitution 1996',
    status: 'in_force',
    issued_date: '1996-01-18',
    in_force_date: '1996-01-18',
    url: 'https://www.prc.cm',
    description: 'Constitution de la R\u00e9publique du Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - R\u00e9publique', chapter: 'Pr\u00e9ambule et Titre 1', content: "La R\u00e9publique du Cameroun est un \u00c9tat unitaire d\u00e9centralis\u00e9. Elle est une et indivisible, la\u00efque, d\u00e9mocratique et sociale. Elle reconn\u00e2it et prot\u00e8ge les valeurs traditionnelles conformes aux principes d\u00e9mocratiques, aux droits de l'homme et \u00e0 la loi." },
      { provision_ref: 'art26', section: '26', title: 'Article 26 - Pr\u00e9sident de la R\u00e9publique', chapter: 'Titre 2 - Du pouvoir ex\u00e9cutif', content: "Le Pr\u00e9sident de la R\u00e9publique est le Chef de l'\u00c9tat. \u00c9lu au suffrage universel direct et secret, il est le garant de l'ind\u00e9pendance nationale, de l'int\u00e9grit\u00e9 du territoire, de la permanence et de la continuit\u00e9 de l'\u00c9tat, du respect des trait\u00e9s et accords internationaux." },
      { provision_ref: 'art65', section: '65', title: 'Article 65 - Bilinguisme', chapter: 'Titre 12 - Des dispositions transitoires et finales', content: "La R\u00e9publique du Cameroun adopte l'anglais et le fran\u00e7ais comme langues officielles d'\u00e9gale valeur. L'\u00c9tat garantit la promotion du bilinguisme sur toute l'\u00e9tendue du territoire." },
    ],
    definitions: [],
  },

  // ---- ANTI-TERRORISM LAW ----
  {
    title: 'Loi N\u00b0 2014/028 du 23 d\u00e9cembre 2014 portant r\u00e9pression des actes de terrorisme',
    title_en: 'Law No. 2014/028 of 23 December 2014 on the Suppression of Acts of Terrorism',
    short_name: 'Loi 2014/028 (Terrorisme)',
    status: 'in_force',
    issued_date: '2014-12-23',
    in_force_date: '2014-12-23',
    url: 'https://droitcamerounais.info',
    description: 'Loi portant r\u00e9pression des actes de terrorisme au Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - D\u00e9finition du terrorisme', chapter: 'Chapitre 1 - Dispositions g\u00e9n\u00e9rales', content: "Constitue un acte de terrorisme tout acte ou menace d'acte susceptible de causer la mort, de mettre en danger l'int\u00e9grit\u00e9 physique, de causer des dommages mat\u00e9riels importants, commis dans l'intention d'intimider une population, de contraindre un gouvernement ou une organisation internationale." },
      { provision_ref: 'art2', section: '2', title: 'Article 2 - Peine de mort', chapter: 'Chapitre 2 - Des infractions et des peines', content: "Quiconque commet un acte de terrorisme est puni de la peine de mort." },
      { provision_ref: 'art5', section: '5', title: 'Article 5 - Financement du terrorisme', chapter: 'Chapitre 2 - Des infractions et des peines', content: "Est puni d'un emprisonnement de quinze \u00e0 vingt ans quiconque fournit ou r\u00e9unit des fonds dans l'intention de les utiliser ou sachant qu'ils seront utilis\u00e9s pour commettre un acte de terrorisme." },
    ],
    definitions: [],
  },

  // ---- PENAL CODE (key provisions) ----
  {
    title: 'Loi N\u00b0 2016/007 du 12 juillet 2016 portant Code p\u00e9nal',
    title_en: 'Law No. 2016/007 of 12 July 2016 - Penal Code',
    short_name: 'Code p\u00e9nal 2016',
    status: 'in_force',
    issued_date: '2016-07-12',
    in_force_date: '2016-07-12',
    url: 'https://droitcamerounais.info',
    description: 'Code p\u00e9nal du Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Principe de l\u00e9galit\u00e9', chapter: 'Livre 1 - Dispositions g\u00e9n\u00e9rales', content: "Nul ne peut \u00eatre puni pour un crime, un d\u00e9lit ou une contravention que la loi n'a pas d\u00e9fini et r\u00e9prim\u00e9 pr\u00e9alablement \u00e0 sa commission." },
      { provision_ref: 'art74', section: '74', title: 'Article 74 - Corruption active', chapter: 'Livre 2 - Des infractions', content: "Est puni d'un emprisonnement de cinq \u00e0 dix ans et d'une amende de 200 000 \u00e0 2 000 000 de francs CFA quiconque fait des offres, promesses, dons, pr\u00e9sents ou avantages de toute nature \u00e0 un fonctionnaire ou agent public pour qu'il accomplisse ou s'abstienne d'accomplir un acte de ses fonctions." },
      { provision_ref: 'art300', section: '300', title: 'Article 300 - Vol', chapter: 'Livre 3 - Des atteintes aux biens', content: "Est puni d'un emprisonnement de cinq \u00e0 dix ans et d'une amende de 100 000 \u00e0 1 000 000 de francs CFA quiconque soustrait frauduleusement une chose appartenant \u00e0 autrui." },
    ],
    definitions: [],
  },

  // ---- LABOR CODE ----
  {
    title: 'Loi du 14 ao\u00fbt 1992 portant Code du Travail',
    title_en: 'Law of 14 August 1992 - Labor Code',
    short_name: 'Code du Travail',
    status: 'in_force',
    issued_date: '1992-08-14',
    in_force_date: '1992-08-14',
    url: 'https://www.africa-laws.org/Cameroon.php',
    description: 'Code du travail du Cameroun',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Champ d\'application', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "La pr\u00e9sente loi r\u00e9git les rapports de travail entre les travailleurs et les employeurs ainsi que entre ces derniers et les apprentis plac\u00e9s sous leur autorit\u00e9. Est consid\u00e9r\u00e9 comme travailleur quels que soient son sexe et sa nationalit\u00e9 toute personne qui s'est engag\u00e9e \u00e0 mettre son activit\u00e9 professionnelle sous la direction et l'autorit\u00e9 d'une personne physique ou morale moyennant r\u00e9mun\u00e9ration." },
      { provision_ref: 'art2', section: '2', title: 'Article 2 - Non-discrimination', chapter: 'Titre 1 - Dispositions g\u00e9n\u00e9rales', content: "Le droit au travail est reconnu \u00e0 chaque citoyen comme un droit fondamental. L'\u00c9tat assure l'\u00e9galit\u00e9 de chance et de traitement des citoyens en mati\u00e8re d'emploi et de travail, sans distinction d'origine, de race, de sexe ou de religion." },
    ],
    definitions: [],
  },

  // ---- DATA PROTECTION (DECREE) ----
  {
    title: 'D\u00e9cret N\u00b0 2013/0399 fixant les modalit\u00e9s de protection des consommateurs de communications \u00e9lectroniques',
    title_en: 'Decree No. 2013/0399 on Protection of Electronic Communications Consumers',
    short_name: 'D\u00e9cret 2013/0399',
    status: 'in_force',
    issued_date: '2013-02-27',
    in_force_date: '2013-02-27',
    url: 'https://www.africa-laws.org/Cameroon.php',
    description: 'D\u00e9cret fixant les modalit\u00e9s de protection des donn\u00e9es des consommateurs de communications \u00e9lectroniques',
    provisions: [
      { provision_ref: 'art1', section: '1', title: 'Article premier - Objet', chapter: 'Chapitre 1 - Dispositions g\u00e9n\u00e9rales', content: "Le pr\u00e9sent d\u00e9cret fixe les modalit\u00e9s de protection des consommateurs des services de communications \u00e9lectroniques au Cameroun." },
      { provision_ref: 'art3', section: '3', title: 'Article 3 - Protection des donn\u00e9es', chapter: 'Chapitre 2 - Des obligations des op\u00e9rateurs', content: "Les op\u00e9rateurs de communications \u00e9lectroniques sont tenus de garantir la confidentialit\u00e9 des donn\u00e9es personnelles des consommateurs. Ils ne peuvent les utiliser ou les transmettre \u00e0 des tiers sans le consentement pr\u00e9alable du consommateur." },
      { provision_ref: 'art5', section: '5', title: 'Article 5 - Droit d\'acc\u00e8s', chapter: 'Chapitre 2 - Des obligations des op\u00e9rateurs', content: "Tout consommateur a le droit d'acc\u00e9der aux donn\u00e9es personnelles le concernant d\u00e9tenues par un op\u00e9rateur et d'en demander la rectification ou la suppression." },
    ],
    definitions: [],
  },
];

function main(): void {
  console.log('Cameroon Law MCP -- Curated Seed Generator');
  console.log('============================================\n');

  fs.mkdirSync(SEED_DIR, { recursive: true });

  let totalDocs = 0;
  let totalProvisions = 0;
  let totalDefinitions = 0;

  for (const seed of SEEDS) {
    const id = titleToId(seed.title);
    const seedFile = path.join(SEED_DIR, `${id}.json`);

    const parsed: ParsedAct = {
      id,
      type: 'statute',
      title: seed.title,
      title_en: seed.title_en,
      short_name: seed.short_name,
      status: seed.status,
      issued_date: seed.issued_date,
      in_force_date: seed.in_force_date,
      url: seed.url,
      description: seed.description,
      provisions: seed.provisions,
      definitions: seed.definitions,
    };

    fs.writeFileSync(seedFile, JSON.stringify(parsed, null, 2));
    totalDocs++;
    totalProvisions += seed.provisions.length;
    totalDefinitions += seed.definitions.length;

    console.log(`  [${totalDocs}] ${seed.short_name}: ${seed.provisions.length} provisions, ${seed.definitions.length} definitions`);
  }

  console.log(`\n============================================`);
  console.log(`Seed Generation Complete`);
  console.log(`============================================`);
  console.log(`  Documents:    ${totalDocs}`);
  console.log(`  Provisions:   ${totalProvisions}`);
  console.log(`  Definitions:  ${totalDefinitions}`);
  console.log(`  Output: ${SEED_DIR}/`);

  // Update census
  if (fs.existsSync(CENSUS_PATH)) {
    const census = JSON.parse(fs.readFileSync(CENSUS_PATH, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];
    for (const law of census.laws) {
      const seedPath = path.join(SEED_DIR, `${law.id}.json`);
      if (fs.existsSync(seedPath)) {
        const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
        law.ingested = true;
        law.provision_count = seedData.provisions?.length ?? 0;
        law.ingestion_date = today;
      }
    }
    census.summary.total_laws = census.laws.length;
    census.summary.ingestable = census.laws.filter((l: { classification: string }) => l.classification === 'ingestable').length;
    fs.writeFileSync(CENSUS_PATH, JSON.stringify(census, null, 2));
    console.log(`\n  Census updated: ${CENSUS_PATH}`);
  }
}

main();
