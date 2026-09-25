# Dossier coverage and the Vivarium expansion

Reviewed 2026-09-25 UTC. This is a bounded expansion, not a complete roster.

## Reader-facing changes

Dossiers now include all recorded direct links, grouped by the other entity's type; named people and organizations reachable through one intermediary; and the existing event records. Two-step paths show both underlying claims and their review statuses. They are not converted into direct membership, employment, ideological, or funding claims. Profile pages explicitly describe partial coverage. The map supports an expanded two-step neighborhood.

## Vivarium / DEF/ACC event

Primary source: https://luma.com/def-acc-hack-sf (S104), sections “Hosted By”, date/location, sponsorship, and “Judges Include”.

Added the 22 November 2025 event as an entity, its advertised venue, BlueDot's host role, all seven named individual host profiles, all eight advertised judges (one overlaps the hosts), and all six sponsors. This yields 14 distinct people, six sponsor organizations, one host organization, and the venue around the event. These are advertised roles, not verified attendance or employment at Vivarium. Luka and Jared M. retain the source's public profile labels; no full identity is inferred. Employer/title descriptions in the judging lineup are not promoted to independently verified employment edges.

Corrected the earlier EV001 seed: FAR.AI was listed as a participant without support in the checked event page. Removed it from that event record and replaced the participant organization list with the six explicitly listed sponsors. No other FAR.AI relationships were changed. Reviewed the existing Vivarium–PrototypeSF operator edge against https://vivariumsf.com/about (S001).

## Coverage backlog

- For each organization: founders, current/former staff, board, advisors, sponsors/funders, collaborators, controlled projects, venues, and public events; retain role and time distinctions.
- For each public professional figure: documented roles, organizations, collaborations, publications, funding roles, and explicitly stated positions.
- Mark historical, advertised, and current roles separately; do not infer ideology from adjacency.
- Vivarium's operator is documented, but founders, staff, members, finances, and legal ownership remain incomplete. An event host or judge is not necessarily a Vivarium member.
- Nineteen older event records remain unreviewed. Displaying them does not upgrade their evidence status.

Canonical records belong in `data/`; generated web data belongs in `docs/graph.json`; dossier presentation belongs in `docs/app.js`.
