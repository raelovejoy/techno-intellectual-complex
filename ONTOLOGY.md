# Ontology

## Node types

- `person`
- `organization`
- `company`
- `community`
- `network`
- `project`
- `place`
- `event-series`
- `movement`

## High-value relationship types

### Organizational
- `FOUNDED_BY`
- `COFOUNDED_BY`
- `LED_BY`
- `OPERATED_BY`
- `EMPLOYED_BY`
- `MEMBER_OF`
- `ADVISED_BY`
- `BOARD_MEMBER_OF`

### Money / power
- `FUNDED_BY`
- `INVESTED_IN_BY`
- `SPONSORED_BY`
- `OWNS`
- `OPERATES`

### Events / social infrastructure
- `HOSTED_EVENT_FOR`
- `HOSTS_EVENTS_FOR`
- `COHOSTED_WITH`
- `FEATURED_ORG_LEADER`
- `PUBLIC_PARTICIPANT`
- `LOCATED_AT`
- `COLOCATED_WITH`

### Intellectual
- `EXPLICITLY_INFLUENCED_BY`
- `EXPLICITLY_ADVOCATES`
- `EXPLICITLY_ALIGNED_WITH`
- `HISTORICALLY_INTERTWINED_WITH`
- `OVERLAPS_WITH`
- `DISTINCT_BUT_ADJACENT`
- `CRITIQUES`

## Edge metadata

Every edge should eventually support:

```yaml
source:
target:
relationship:
confidence: confirmed | strong | contextual | inferred
basis:
source_ids:
date_start:
date_end:
amount:
notes:
last_verified:
```

## Power dimensions

Later versions should score or annotate *forms* of power rather than invent a single hierarchy:

- **capital power**
- **ownership/property power**
- **institutional authority**
- **hiring/career gatekeeping**
- **intellectual agenda-setting**
- **network/bridge centrality**
- **technical infrastructure control**
- **cultural prestige**
- **physical-space control**

A network can be decentralized in one dimension and highly centralized in another.
