# Contributing

## Adding an entity

Before adding a node, ask:

1. Is it relevant to the network?
2. Is there at least one reliable public source?
3. Does it add information rather than merely fame?
4. If it is a person, is the relationship public and institutionally relevant?

## Adding an edge

Every edge needs:
- a relationship type;
- confidence;
- a plain-language basis;
- one or more source IDs.

If the evidence is "they were both at a party once," that is usually **not** a useful edge.

## Disputed characterizations

Record disagreement rather than flattening it.

Example:
- `stated_philosophy`: what the organization says;
- `analysis`: what researchers/reporters infer;
- `criticism`: what credible critics argue.

Do not silently turn criticism into fact.

## Documentation coherence

When a canonical entity model, relationship type, methodology, architecture, workflow, or project relationship changes, check whether the change should propagate to the documents that help people discover and correctly understand it.

As applicable, check:

- the nearest README/index;
- the root README;
- current-state/status documentation;
- roadmap/planning documentation;
- architecture or decision records;
- cross-project/ecosystem references.

Do not update files mechanically or repeat the same explanation everywhere. The goal is **coherence without duplication**: important changes should be discoverable from the right entry points, while detailed material remains canonical in the most appropriate place.

Pull requests should briefly state what changed, why, what was verified, which documentation surfaces were checked, and any unresolved questions.
