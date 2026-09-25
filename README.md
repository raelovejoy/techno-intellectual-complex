# The Techno-Intellectual Complex

**Mapping the people, institutions, money, spaces, events, and ideas shaping technology — and the future around it.**

This is a living, evidence-first OSINT / public-interest research project focused initially on the San Francisco Bay Area.

The project maps relationships among:

- technology companies, labs, nonprofits, hacker spaces, hacker houses, salons, foundations, venture firms, and research organizations;
- public organizational figures, funders, founders, organizers, speakers, and bridge people;
- intellectual and political movements such as anarchism, commons/horizontalism, digital civil libertarianism, Effective Altruism, rationalism, advanced-AI/x-risk safety, public-interest AI, progress studies, techno-optimism, decentralization/cypherpunk, transhumanism, longevity/vitalism, and tech counterculture;
- event spaces and calendars that function as **social routing infrastructure**.

## Why this exists

Mission statements often tell only part of the story.

Ideas become institutions. Institutions attract funding. Funding creates careers, events, fellowships, spaces, and social networks. Those networks reproduce ideas and determine which people gain access to money, prestige, audiences, and decision-making power.

This project asks:

- Who funds whom?
- Who works with whom?
- Who shares spaces, events, and social infrastructure?
- Which organizations explicitly identify with which philosophies?
- Which movements share people but disagree about ends?
- How are organizations actually governed?
- Where are the gaps between decentralization/community rhetoric and ownership/control?
- Who repeatedly becomes a **bridge** between otherwise distinct scenes?
- Who gets to define what "the future" means?

## Important: what the graph does **not** mean

**Association is not endorsement.**

- Attending an event does not make someone a member of the host organization.
- Sharing a venue does not establish ideological agreement.
- Receiving funding does not prove ideological control.
- Working at a company does not mean adopting every view of its founders or investors.
- Similar rhetoric does not establish a political affiliation.
- A person's politics are never inferred from a single event, employer, friendship, or social proximity.

Every relationship has a type, evidence basis, source, and confidence level.

## Repository

- `data/nodes.csv` — people, organizations, movements, places, projects
- `data/edges.csv` — sourced relationships
- `data/events.csv` — event-level evidence
- `data/calendars.csv` — discovery sources / recurring event feeds
- `data/sources.csv` — source registry
- `METHODOLOGY.md` — evidence and safety rules
- `ONTOLOGY.md` — node and edge schema
- `research/leads.md` — unverified things worth investigating
- `research/event-discovery.md` — calendar/event OSINT workflow
- `docs/` — static GitHub Pages prototype

## v0.1 seed

The first seed intentionally spans **different and conflicting traditions**, including:

- Noisebridge / Sudo Room / Omni Commons / Embassy
- Tech Workers Coalition / TechEquity / DAIR / EFF / Gray Area
- Vivarium / PrototypeSF / SF Commons
- Frontier Tower / South Park Commons / AGI House / Mission Control / SF Parc
- Foresight / Roots of Progress / Astera / Edge City / California Forever
- Effective Altruism / BlueDot / MATS / Mox / Constellation / CAIS / METR / Redwood / FAR.AI
- LessWrong / Lightcone / Lighthaven / MIRI
- AI Salon / SF Intellectuals / SuperHuman Society
- Vitalist Bay / longevity ecosystem
- Cerebral Valley / SHACK15 / The House by Edge & Node

This is **not an exhaustive list**. New nodes should normally enter the graph because a sourced relationship makes them relevant.

## Website

The atlas in `docs/` provides a card/table directory, linked entity dossiers, an interactive relationship map, a relationship ledger, funding records, and a source library. Each view reads the same generated `docs/graph.json`. Filters are included in the URL; dossier URLs can be bookmarked.

Run locally with `python3 -m http.server 8000 --directory docs`, then open `http://localhost:8000`. Validate with `python3 scripts/build_graph.py --check`, `node --check docs/app.js`, and `node scripts/check_viewer.cjs`. The smoke checks cover navigation and data behavior, not visual layout.

The static site can also be hosted on GitHub Pages:

After pushing the repo:

1. Open **Settings → Pages**.
2. Set **Source** to `Deploy from a branch`.
3. Select your main branch and `/docs`.
4. Save.

## Status

Early research prototype. Expect corrections. Primary sources are preferred, but secondary reporting is used when it reveals governance, funding, or institutional facts not disclosed by the entity itself.

### September 2026 evidence audit

The [Bay Area rationalist / EA / AI-safety seed](research/bay-area-rationalist-ai-safety-seed.md) audits a small set of public institutional relationships and documents unresolved leads. The graph remains broad: most earlier edges are marked **legacy review pending**, even where their old confidence label says “confirmed.” An audited edge means its wording was checked against the linked source on the recorded date; it is not an independent endorsement of that source's interpretation.

The viewer now links to sources and shows claim kind, source location, dates, and what an audited edge does **not** establish. See [Methodology](METHODOLOGY.md) for how to challenge an edge. To rebuild the viewer from the canonical CSVs, run `python3 scripts/build_graph.py`; `python3 scripts/build_graph.py --check` validates the generated files.
