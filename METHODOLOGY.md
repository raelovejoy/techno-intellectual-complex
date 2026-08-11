# Methodology

## 1. Purpose

The Techno-Intellectual Complex is a public-interest OSINT knowledge graph. It maps **institutional power and intellectual/social networks**, not private lives.

The goal is to make relationships legible without turning ordinary social proximity into accusation.

## 2. Evidence hierarchy

Prefer sources in this order:

1. **Primary institutional records**
   - official websites
   - corporate/nonprofit filings
   - grant databases
   - annual reports
   - official event pages
   - published governance documents
2. **Primary statements by public organizational figures**
   - essays
   - talks
   - interviews
   - public biographies
3. **High-quality secondary reporting**
4. **Event listings / calendars**
5. **Directories and aggregators**
6. **Social media** only when necessary and public/relevant

A directory should usually create a **lead**, not a strong claim, until corroborated.

## 3. Confidence

### `confirmed`
The source explicitly establishes the relationship.

Examples:
- organization says X founded it;
- grant database says funder gave organization $5m;
- event page says X hosted the event.

### `strong`
Multiple reliable sources or a strong primary-source inference establish the relationship, but wording is not fully explicit.

### `contextual`
A real relationship exists but it is weak evidence of ideology or control.

Examples:
- organization hosts another group's event;
- speaker appears at a conference;
- two projects share a venue.

### `inferred`
Our analysis rather than a claim made by the subject.

These edges should be visually distinct and easy to disable.

## 4. Event evidence

Events are unusually valuable because they reveal the **social infrastructure** connecting scenes.

Allowed event-derived edges include:

- `HOSTED`
- `COHOSTED_WITH`
- `SPEAKER_AT`
- `VENUE_AT`
- `SPONSORED`
- `FEATURED_ORG`
- `PUBLIC_PARTICIPANT`

An event **does not establish**:

- ideological membership;
- friendship;
- endorsement;
- funding;
- employment;
- control.

Do not add ordinary attendees merely because Luma/Partiful exposes their names. Prioritize public speakers, organizers, sponsors, and people whose participation is substantively relevant.

## 5. Ideology

Never reduce a person or organization to one label.

Distinguish:

1. **Explicit self-identification**
2. **Explicit advocacy**
3. **Documented intellectual influence**
4. **Institutional affiliation**
5. **Ecosystem association**
6. **Structural resemblance**
7. **Researcher inference**

Examples:

`Noisebridge -> Anarchism -> EXPLICITLY_INFLUENCED_BY`

is categorically different from:

`Frontier Tower -> Anarchism`

which should **not** exist unless credible evidence establishes it.

## 6. Funding and ownership

Funding edges should distinguish:

- grant;
- investment;
- sponsorship;
- donation;
- employer;
- property ownership;
- event sponsorship.

`FUNDED_BY` is not shorthand for ideological control.

Where possible record:
- amount;
- date;
- recipient;
- funding instrument;
- source.

## 7. Privacy and safety

This project maps **public institutional roles**, not private individuals.

Do not collect:
- private addresses;
- phone numbers;
- family details;
- private schedules;
- leaked/private communications;
- precise residential locations;
- sensitive personal traits not relevant to a public institutional role.

Residential community locations should be handled conservatively even if a public site publishes an address.

## 8. Corrections

Every profile should eventually provide:
- source links;
- last-reviewed date;
- a correction mechanism;
- explicit separation of fact from analysis.

Good OSINT should be falsifiable.
