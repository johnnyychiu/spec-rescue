# Recorded live-run evidence

These files preserve a real local-model run of Spec Rescue's initial implementation. They are evidence for this particular execution, not prerecorded responses used by the application.

- [live-run.json](live-run.json): full completed snapshot, input brief, event sequence, three draft artifacts, QA review, and final synthesis.
- [live-specification.md](live-specification.md): Markdown export from the same run, containing the final specification, original brief, and event trace. Its final-specification text matches the snapshot's `result` verbatim after line-ending normalization.

## Run identity and timing

- Run ID: `bfb96611-6f7c-4ad0-ac4f-e43841b219da`
- Model reported by the application: `home-chat`, the user's local Qwen backend.
- Date: **30 October 2026**. Times below are UTC, which is also London time on this date.
- Start: `2026-10-30T09:28:21.934Z`
- Completion: `2026-10-30T09:31:02.868Z`
- Elapsed wall time: **160.934 seconds**.
- Terminal status: `completed`.

## Evidence of concurrency and coordination

| Event | UTC time |
| --- | --- |
| Product initial inference started | 09:28:21.937 |
| QA initial inference started | 09:28:21.941 |
| Technical initial inference started | 09:28:21.942 |
| First inference completed (product) | 09:28:44.767 |
| QA draft artifact available | 09:29:09.843 |
| Technical draft artifact available | 09:29:39.111 |
| Cross-agent QA review inference started | 09:29:39.113 |
| QA review artifact available | 09:30:12.410 |
| Product synthesis inference started | 09:30:12.411 |
| Final artifact available | 09:31:02.868 |

All three initial inference requests were started within five milliseconds, before any initial request completed. This supports application-level concurrent Mozaik loops and overlapping in-flight model requests. It does **not** establish that the local model server executed GPU computation for all requests simultaneously; a model server may queue requests internally.

The snapshot contains **five artifacts**: product, QA, and technical drafts; a cross-agent QA review; and the revised final specification. Review started after the last draft artifact, and synthesis started after review.

## An observed change across agents

The product draft explicitly lists **“No Messaging System”** as a non-goal. The technical draft's architecture table proposes **“Socket.io + Redis (or in-memory)”**, with `Conversations` and `Messages` tables. QA review finding 1 cites that conflict and recommends **“Cut Socket.io/Redis.”** The final specification's **Decisions & Changes After Review** section records **“Removed In-App Chat”** and removes that infrastructure and data model.

That chain is present in the saved drafts, review, and final artifact. It is a concrete example of the review changing the proposed implementation rather than three unrelated answers being displayed together.

## Limitations and provenance

- This is one run from the first implementation revision. It predates later prompt tightening intended to preserve explicitly undecided user choices. Do not treat it as evidence that later source changes were exercised.
- The brief explicitly leaves university-email verification undecided. The final result instead specifies signup without domain validation and defers checks to a later version; it does not preserve that choice adequately in its open questions. This is a fidelity weakness, not a confirmed user decision. The evidence is retained unchanged so reviewers can see it.
- The output also makes unverified recommendations about privacy, authentication, infrastructure, time estimates, and available services. No external facts, service plans, security properties, or implementation feasibility were validated by this run. A human must review the specification before building or publishing the proposed book-exchange product.
- Timing demonstrates overlapping requests and coordination order for this execution only. It is not a benchmark, a speedup claim, or a guarantee of identical model output on rerun.
- The model identifier is a local serving alias. The saved snapshot does not independently attest model weights or hardware configuration.
- The raw snapshot and exported Markdown are the authoritative artifacts for these observations. Later live runs should be stored as distinct files with their own dates and limitations.
