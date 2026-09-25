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

## 9. Claim-level audit (v0.2)

The older graph was assembled before the claim-level fields existed. Its edges are explicitly marked `legacy_unreviewed` until checked one at a time. Their existing confidence labels describe the author's original assessment, **not** a completed v0.2 audit. No historical bulk promotion is implied.

An `audited` edge requires a specific source location, the date checked, a claim kind, and a caveat describing what the evidence cannot establish. It says the **wording of this edge fits the cited public source**. It does not mean the institution's account has been independently corroborated. Record source publication date separately from the date this project checked the page. A blank relationship end date means **not established**, not “ongoing forever.”

Claim kinds distinguish an `institutional_statement` (including a funder's account of its own recommendations), `public_record`, `external_report`, `analysis`, and `allegation`. An allegation needs attribution and must not be converted into an organizational or personal fact by assigning high confidence. A critique belongs in analysis with a stated argument, not as a person's inferred ideology.

Funding verbs must be exact. A **recommended** grant is not a completed transfer. A venue host is not an event sponsor, and a board member's role does not establish their agreement with every publication or action of the organization.

To request a correction, [open a research/correction issue](https://github.com/raelovejoy/techno-intellectual-complex/issues/new/choose) with the edge ID, exact wording at issue, source URL and location, and any date or counterevidence. The maintainer should update or remove the canonical CSV row, record the decision, then regenerate the viewer. Sensitive personal information should not be posted in issues; use a minimal private report to the maintainer instead.
