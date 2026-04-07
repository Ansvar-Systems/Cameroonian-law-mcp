# Cameroonian Law MCP Server

**The Official Gazette of Cameroon alternative for the AI age.**

[![npm version](https://badge.fury.io/js/@ansvar%2Fcameroonian-law-mcp.svg)](https://www.npmjs.com/package/@ansvar/cameroonian-law-mcp)
[![MCP Registry](https://img.shields.io/badge/MCP-Registry-blue)](https://registry.modelcontextprotocol.io)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![GitHub stars](https://img.shields.io/github/stars/Ansvar-Systems/Cameroonian-law-mcp?style=social)](https://github.com/Ansvar-Systems/Cameroonian-law-mcp)
[![CI](https://github.com/Ansvar-Systems/Cameroonian-law-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Ansvar-Systems/Cameroonian-law-mcp/actions/workflows/ci.yml)
[![Database](https://img.shields.io/badge/database-pre--built-green)](https://github.com/Ansvar-Systems/Cameroonian-law-mcp)
[![Provisions](https://img.shields.io/badge/provisions-10%2C430-blue)](https://github.com/Ansvar-Systems/Cameroonian-law-mcp)

Query **62 Cameroonian laws** -- from the Data Protection Law and Cybersecurity Law to the Penal Code, OHADA Company Law, Electronic Commerce Law, and more -- directly from Claude, Cursor, or any MCP-compatible client.

Cameroon operates a unique bijural legal system: civil law in the francophone regions and common law in the anglophone regions. This MCP serves both.

If you're building legal tech, compliance tools, or doing Cameroonian legal research, this is your verified reference database.

Built by [Ansvar Systems](https://ansvar.eu) -- Stockholm, Sweden

---

## Why This Exists

Cameroonian legal research spans spm.gov.cm, the Journal Officiel (available via camer.be), OHADA portal, and scattered ministry publications -- in both French and English. Whether you're:

- A **lawyer** (avocat / barrister) validating citations in a memo or contract
- A **compliance officer** checking Data Protection Law obligations or Cybersecurity Law requirements
- A **legal tech developer** building tools on Cameroonian or OHADA law
- A **researcher** tracing provisions across Cameroon's bijural legislative corpus

...you shouldn't need dozens of browser tabs and manual cross-referencing between French and English sources. Ask Claude. Get the exact provision. With context.

This MCP server makes Cameroonian law **searchable, cross-referenceable, and AI-readable**.

---

## Quick Start

### Use Remotely (No Install Needed)

> Connect directly to the hosted version -- zero dependencies, nothing to install.

**Endpoint:** `https://mcp.ansvar.eu/law-cm/mcp`

| Client | How to Connect |
|--------|---------------|
| **Claude.ai** | Settings > Connectors > Add Integration > paste URL |
| **Claude Code** | `claude mcp add cameroonian-law --transport http https://mcp.ansvar.eu/law-cm/mcp` |
| **Claude Desktop** | Add to config (see below) |
| **GitHub Copilot** | Add to VS Code settings (see below) |

**Claude Desktop** -- add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cameroonian-law": {
      "type": "url",
      "url": "https://mcp.ansvar.eu/law-cm/mcp"
    }
  }
}
```

**GitHub Copilot** -- add to VS Code `settings.json`:

```json
{
  "github.copilot.chat.mcp.servers": {
    "cameroonian-law": {
      "type": "http",
      "url": "https://mcp.ansvar.eu/law-cm/mcp"
    }
  }
}
```

### Use Locally (npm)

```bash
npx @ansvar/cameroonian-law-mcp
```

**Claude Desktop** -- add to `claude_desktop_config.json`:

**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "cameroonian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/cameroonian-law-mcp"]
    }
  }
}
```

**Cursor / VS Code:**

```json
{
  "mcp.servers": {
    "cameroonian-law": {
      "command": "npx",
      "args": ["-y", "@ansvar/cameroonian-law-mcp"]
    }
  }
}
```

---

## Example Queries

Cameroon is officially bilingual -- ask in French or English:

**In French:**
- *"Recherche de dispositions sur la 'protection des données personnelles' dans la loi camerounaise"* (Search for provisions on "personal data protection")
- *"Que dit le Code pénal camerounais sur la cybercriminalité?"* (What does the Cameroonian Penal Code say about cybercrime?)
- *"Trouvez les dispositions de la loi sur le commerce électronique relatives aux signatures numériques"* (Find provisions in the Electronic Commerce Law on digital signatures)

**In English:**
- *"What does the Data Protection Law say about processing personal data in Cameroon?"*
- *"Search for company law provisions under OHADA Uniform Act on Commercial Companies"*
- *"Find provisions in the Cybersecurity Law about critical infrastructure protection"*
- *"Is the Electronic Commerce Law still in force?"*
- *"What are the data controller obligations under Cameroonian law?"*
- *"Validate the citation Loi n° 2010/012 du 21 décembre 2010, Article 15"*
- *"Build a legal stance on consumer protection in Cameroonian e-commerce"*

---

## What's Included

| Category | Count | Details |
|----------|-------|---------|
| **Laws** | 62 laws | Legislation from the Journal Officiel and official sources |
| **Provisions** | 10,430 sections | Full-text searchable with FTS5 |
| **Database Size** | 16 MB | Optimized SQLite, portable |
| **Languages** | French and English | Bijural system; francophone civil law + anglophone common law |
| **Data Source** | droitcamerounais.info | Curated Cameroonian law reference |

**Verified data only** -- every citation is validated against official sources (Journal Officiel, spm.gov.cm). Zero LLM-generated content.

---

## Why This Works

**Verbatim Source Text (No LLM Processing):**
- All statute text is ingested from droitcamerounais.info and official Cameroonian government publications
- Provisions are returned **unchanged** from SQLite FTS5 database rows
- Zero LLM summarization or paraphrasing -- the database contains statute text, not AI interpretations

**Smart Context Management:**
- Search returns ranked provisions with BM25 scoring (safe for context)
- Provision retrieval gives exact text by law number + article
- Cross-references help navigate without loading everything at once

**Technical Architecture:**
```
droitcamerounais.info / Journal Officiel --> Parse --> SQLite --> FTS5 snippet() --> MCP response
                                              ^                        ^
                                       Provision parser         Verbatim database query
```

### Traditional Research vs. This MCP

| Traditional Approach | This MCP Server |
|---------------------|-----------------|
| Search Journal Officiel by law number | Search in French or English: *"protection des données"* |
| Navigate bilingual law text manually | Get the exact provision with context |
| Manual cross-referencing between laws | `build_legal_stance` aggregates across sources |
| "Is this law still in force?" -- check manually | `check_currency` tool -- answer in seconds |
| Find AU/CEMAC alignment -- search separately | `get_eu_basis` -- linked international frameworks |
| No API, no integration | MCP protocol -- AI-native |

**Traditional:** Search Journal Officiel --> Download French/English law PDF --> Ctrl+F --> Cross-reference with OHADA instruments --> Check AU frameworks separately --> Repeat

**This MCP:** *"What are the data protection obligations for a company operating in Cameroon, and how do they compare to GDPR?"* --> Done.

---

## Available Tools (13)

### Core Legal Research Tools (8)

| Tool | Description |
|------|-------------|
| `search_legislation` | FTS5 full-text search across 10,430 provisions with BM25 ranking. Supports French and English queries, quoted phrases, boolean operators |
| `get_provision` | Retrieve specific provision by law number + article |
| `check_currency` | Check if a law is in force, amended, or repealed |
| `validate_citation` | Validate citation against database -- zero-hallucination check |
| `build_legal_stance` | Aggregate citations from multiple laws for a legal topic |
| `format_citation` | Format citations per Cameroonian legal conventions (French/English) |
| `list_sources` | List all 62 laws with metadata and coverage scope |
| `about` | Server info, capabilities, dataset statistics, and coverage summary |

### International Law Integration Tools (5)

| Tool | Description |
|------|-------------|
| `get_eu_basis` | Get international frameworks (AU, CEMAC, OHADA, Commonwealth, GDPR comparisons) that a Cameroonian law aligns with |
| `get_cameroonian_implementations` | Find Cameroonian laws corresponding to a specific international standard |
| `search_eu_implementations` | Search international documents with Cameroonian alignment counts |
| `get_provision_eu_basis` | Get international law references for a specific provision |
| `validate_eu_compliance` | Check alignment status of Cameroonian laws against international frameworks |

---

## International Law Alignment

Cameroon is not an EU member state, but Cameroonian law participates in several overlapping international frameworks:

- **OHADA** -- Cameroon is a member of the Organisation pour l'Harmonisation en Afrique du Droit des Affaires. OHADA Uniform Acts apply directly on commercial law, company law, and arbitration -- these are part of this MCP's coverage
- **African Union** -- Member of the AU and its frameworks on data protection (Malabo Convention) and cybersecurity
- **CEMAC** -- Cameroon belongs to the Central African Economic and Monetary Community; CEMAC regulations apply to financial services and banking
- **Commonwealth** -- Cameroon joined the Commonwealth in 1995; Commonwealth rule-of-law and governance principles apply alongside OHADA
- **GDPR comparison** -- The Data Protection Law of 2010 predates GDPR but shares core principles; the ongoing revision process references GDPR concepts

> **The bijural system:** Francophone Cameroon operates under French-origin civil law (Code Civil, Code de Commerce). Anglophone Cameroon (North West and South West Regions) operates under English-origin common law. OHADA supersedes both for commercial matters. This MCP covers laws applicable across both systems plus OHADA instruments.

---

## Data Sources & Freshness

All content is sourced from authoritative Cameroonian legal databases:

- **[Droit Camerounais](https://droitcamerounais.info)** -- Curated Cameroonian law reference database
- **[Secrétariat Général de la Présidence](https://spm.gov.cm)** -- Official Cameroonian government publications
- **[Journal Officiel](https://camer.be)** -- Official Gazette of Cameroon (via camer.be archive)
- **[OHADA](https://ohada.com)** -- Official OHADA Uniform Acts (commercial law, companies, arbitration)

### Data Provenance

| Field | Value |
|-------|-------|
| **Authority** | Republic of Cameroon / OHADA |
| **Retrieval method** | droitcamerounais.info and official government portals |
| **Languages** | French and English (both official languages) |
| **License** | Government of Cameroon public domain; OHADA public domain |
| **Coverage** | 62 laws covering data protection, cybersecurity, companies (OHADA), electronic commerce, penal code |

### Automated Freshness Checks

A [GitHub Actions workflow](.github/workflows/check-updates.yml) monitors data sources for changes:

| Check | Method |
|-------|--------|
| **Law amendments** | Drift detection against known provision anchors |
| **New legislation** | Comparison against Journal Officiel publications |
| **OHADA updates** | Comparison against OHADA Uniform Act revisions |

**Verified data only** -- every citation is validated against official sources. Zero LLM-generated content.

---

## Security

This project uses multiple layers of automated security scanning:

| Scanner | What It Does | Schedule |
|---------|-------------|----------|
| **CodeQL** | Static analysis for security vulnerabilities | Weekly + PRs |
| **Semgrep** | SAST scanning (OWASP top 10, secrets, TypeScript) | Every push |
| **Gitleaks** | Secret detection across git history | Every push |
| **Trivy** | CVE scanning on filesystem and npm dependencies | Daily |
| **Socket.dev** | Supply chain attack detection | PRs |
| **Dependabot** | Automated dependency updates | Weekly |

See [SECURITY.md](SECURITY.md) for the full policy and vulnerability reporting.

---

## Important Disclaimers

### Legal Advice

> **THIS TOOL IS NOT LEGAL ADVICE**
>
> Statute text is sourced from droitcamerounais.info and official Cameroonian government publications. However:
> - This is a **research tool**, not a substitute for professional legal counsel
> - **Court case coverage is not included** -- do not rely solely on this for case law research
> - **Verify critical citations** against primary sources (Journal Officiel, OHADA portal) for court filings
> - **International cross-references** reflect alignment relationships, not formal transposition
> - **Bijural complexity** -- verify which legal system (civil law, common law, or OHADA) applies to your specific matter; this MCP does not automatically determine which regime governs a transaction
> - **OHADA vs. national law** -- OHADA Uniform Acts prevail over national company law; confirm which instrument governs

**Before using professionally, read:** [DISCLAIMER.md](DISCLAIMER.md) | [SECURITY.md](SECURITY.md)

### Client Confidentiality

Queries go through the Claude API. For privileged or confidential matters, use on-premise deployment. For professional use guidance, consult the **Barreau du Cameroun / Cameroon Bar Association** professional conduct rules.

---

## Development

### Setup

```bash
git clone https://github.com/Ansvar-Systems/Cameroonian-law-mcp
cd Cameroonian-law-mcp
npm install
npm run build
npm test
```

### Running Locally

```bash
npm run dev                                       # Start MCP server
npx @anthropic/mcp-inspector node dist/src/index.js  # Test with MCP Inspector
```

### Data Management

```bash
npm run ingest          # Ingest laws from droitcamerounais.info / Journal Officiel
npm run build:db        # Rebuild SQLite database
npm run census          # Generate coverage census
npm run drift:detect    # Run drift detection against anchors
npm run check-updates   # Check for amendments and new laws
```

### Performance

- **Search Speed:** <100ms for most FTS5 queries
- **Database Size:** 16 MB (efficient, portable)
- **Reliability:** 100% ingestion success rate across 62 laws
- **Languages:** French and English queries supported

---

## Related Projects: Complete Compliance Suite

This server is part of **Ansvar's Compliance Suite** -- MCP servers that work together for end-to-end compliance coverage:

### [@ansvar/eu-regulations-mcp](https://github.com/Ansvar-Systems/EU_compliance_MCP)
**Query 49 EU regulations directly from Claude** -- GDPR, AI Act, DORA, NIS2, MiFID II, eIDAS, and more. Full regulatory text with article-level search. `npx @ansvar/eu-regulations-mcp`

### [@ansvar/cameroonian-law-mcp](https://github.com/Ansvar-Systems/Cameroonian-law-mcp) (This Project)
**Query 62 Cameroonian laws directly from Claude** -- Data Protection Law, Cybersecurity Law, OHADA instruments, Penal Code, Electronic Commerce Law, and more. `npx @ansvar/cameroonian-law-mcp`

### [@ansvar/ghana-law-mcp](https://github.com/Ansvar-Systems/ghana-law-mcp)
**Query Ghanaian legislation** -- Data Protection Act, Cybersecurity Act, Companies Act 2019, Electronic Transactions Act, and more. `npx @ansvar/ghana-law-mcp`

### [@ansvar/nigeria-law-mcp](https://github.com/Ansvar-Systems/nigeria-law-mcp)
**Query Nigerian legislation** -- NDPA, Cybercrimes Act, CAMA 2020, Consumer Protection Act, and more. `npx @ansvar/nigeria-law-mcp`

**70+ national law MCPs** covering Australia, Brazil, Canada, Denmark, Finland, France, Germany, Ghana, India, Ireland, Israel, Japan, Netherlands, Nigeria, Norway, Singapore, Sweden, Switzerland, UAE, UK, and more.

---

## Contributing

Contributions welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Priority areas:
- Law corpus expansion (additional Journal Officiel legislation)
- Court case law integration (Supreme Court of Cameroon, Court of Appeal decisions)
- English translations for francophone-only statutes
- OHADA case law (CCJA -- Cour Commune de Justice et d'Arbitrage)
- CEMAC financial regulations
- Historical statute versions and amendment tracking

---

## Roadmap

- [x] Core statute database with FTS5 search (62 laws, 10,430 provisions)
- [x] French and English query support
- [x] OHADA Uniform Acts coverage
- [x] International law alignment tools
- [x] Vercel Streamable HTTP deployment
- [x] npm package publication
- [ ] Court case law (Supreme Court of Cameroon)
- [ ] CCJA (OHADA court) decisions
- [ ] CEMAC financial regulations
- [ ] Historical law versions (amendment tracking)
- [ ] Full corpus expansion from Journal Officiel

---

## Citation

If you use this MCP server in academic research:

```bibtex
@software{cameroonian_law_mcp_2026,
  author = {Ansvar Systems AB},
  title = {Cameroonian Law MCP Server: AI-Powered Legal Research Tool},
  year = {2026},
  url = {https://github.com/Ansvar-Systems/Cameroonian-law-mcp},
  note = {62 Cameroonian laws with 10,430 provisions, bijural system (French/English), OHADA coverage}
}
```

---

## License

Apache License 2.0. See [LICENSE](./LICENSE) for details.

### Data Licenses

- **Laws & Legislation:** Government of Cameroon (public domain)
- **OHADA Uniform Acts:** OHADA Organization (public domain)
- **EU Metadata:** EUR-Lex (EU public domain)

---

## About Ansvar Systems

We build AI-accelerated compliance and legal research tools for the global market. This MCP server is part of our commitment to open legal data access across Africa -- Cameroon's unique bijural system deserves proper AI tooling.

So we're open-sourcing it. Navigating 62 laws across French and English shouldn't require a law degree.

**[ansvar.eu](https://ansvar.eu)** -- Stockholm, Sweden

---

<p align="center">
  <sub>Built with care in Stockholm, Sweden</sub>
</p>
