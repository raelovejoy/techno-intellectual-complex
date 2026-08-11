# Event discovery workflow

Event calendars are one of the project's most valuable OSINT layers because they expose **recurring social routing infrastructure**.

## Seed calendars

See `data/calendars.csv`.

High-value discovery sources include:
- Luma SF and Luma Tech
- AI Events SF / Superscout
- TechWeek.dev
- AI Week SF
- Mox
- Foresight
- Gray Area
- Long Now
- The SF Commons
- Bay Rationality / local EA calendars
- hacker-house directories
- Cerebral Valley
- Frontier Tower

## What to extract

For each relevant event:
- event title/date
- host organization(s)
- venue
- speakers
- co-hosts
- sponsors
- partner organizations
- publicly stated theme/mission

Avoid scraping ordinary attendee lists into the graph.

## Bridge detection

A person or organization becomes especially interesting when it repeatedly appears across *different* clusters.

Examples of useful bridge patterns:

- hacker-space ↔ AI safety
- progress studies ↔ VC
- longevity ↔ crypto/decentralization
- art-tech ↔ frontier AI
- EA ↔ startup ecosystem
- public-interest tech ↔ frontier lab
- counterculture ↔ venture-funded institution

The repeated pattern matters more than a single appearance.

## Next research targets

1. Frontier Tower floor leaders, founders, fund, ownership and governance.
2. Mox funding, leadership and recurring hosted organizations.
3. Lighthaven event graph: AI safety, rationalism, progress, longevity, forecasting.
4. Cerebral Valley hosts, sponsors, partner companies and speaker network.
5. South Park Commons fund, membership alumni and intellectual programming.
6. Hacker-house genealogy: Mission Control → HF0 / newer houses / funds.
7. Art-tech/counterculture bridges: Gray Area, Embassy, Burning Man, DWeb.
8. Public-interest/left-tech graph: TWC, TechEquity, DAIR, EFF, community tech.
