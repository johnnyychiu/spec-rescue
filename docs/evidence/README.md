# Recorded live-run evidence

These files preserve real local-model runs of Spec Rescue, including the initial implementation and a later run after prompt tightening. They are evidence for those executions, not prerecorded responses used by the application.

- [final-books.json](final-books.json): primary book-exchange example from the final workflow; full snapshot with five artifacts and runtime events.
- [final-books.md](final-books.md): corresponding Markdown export.
- [final-booking.json](final-booking.json) and [final-booking.md](final-booking.md): independent barbershop-booking brief and corresponding export.
- [final-events.json](final-events.json) and [final-events.md](final-events.md): independent workshop-signup brief and corresponding export.
- [live-run.json](live-run.json): historical initial-implementation snapshot, retaining the fidelity weakness described below.
- [live-specification.md](live-specification.md): Markdown export from the same run, containing the final specification, original brief, and event trace. Its final-specification text matches the snapshot's `result` verbatim after line-ending normalization.

| Saved run | Model | Duration | Initial request start spread |
| --- | --- | --- | --- |
| [Final book exchange](final-books.json) | `home-chat` | 238.149 seconds | 11 ms |
| [Final barbershop booking](final-booking.json) | `home-chat` | 260.347 seconds | 3 ms |
| [Final workshop signup](final-events.json) | `home-chat` | 149.069 seconds | 0 ms (timestamp resolution) |
| [Historical initial book exchange](live-run.json) | `home-chat` | 160.934 seconds | 5 ms |

All four records pass `node scripts/verify-evidence.mjs`: five matching native inference loops, five artifacts, overlapping initial requests, ordered review/synthesis barriers, and matching Markdown content. The three final example briefs have completed; the fourth record is the historical iteration. These durations are observations, not performance comparisons; the runs used different prompts and may have shared model-server capacity.

The booking run (`773cb4ae-637b-4c62-9ad4-dce6bcc47b0c`) completed from `09:33:12.957Z` to `09:37:33.304Z` on 30 October 2026. Its independent brief requested selection among three barbers, prevention of double bookings, and staff lunch blocks. The final specification includes concrete acceptance criteria for simultaneous booking attempts and hidden/disabled lunch slots. It preserves **Payments** and **SMS Reminders** as open questions with provisional defaults, and makes email confirmation conditional on user approval. The proposed MVP exclusions are recommendations, not evidence that the user resolved those questions.

The workshop run (`5215cb95-4bec-422b-bd5b-4095e4e08ecc`) completed from `09:37:34.068Z` to `09:40:03.137Z` on 30 October 2026. The brief requested a 100-person workshop signup, waitlist, cancellations, and door check-in with no budget for paid services. The final artifact retains **Guest Capacity** and **Account Requirements** as open questions, quoting the brief's undecided choices and labeling its defaults provisional. It includes acceptance criteria for full-capacity waitlisting, cancellation releasing capacity, staff check-in, and hiding attendees' personal data from the public page. Its scope also proposes counting guests and omitting accounts, so those sections still require reconciliation with the user's eventual decisions; the record demonstrates a complete workflow, not a universally correct specification.

## Primary example: final book-exchange run

Run `af3b6eee-23a1-4fb9-b4ae-d73f4bea0f58` used `home-chat` and completed on **30 October 2026** from `09:32:59.843Z` to `09:36:57.992Z`: **238.149 seconds**. Initial inference requests started at `09:32:59.849Z`, `.859Z`, and `.860Z`, all before the first completion at `09:33:23.105Z`. The three starts span **11 milliseconds**. All five native inference loops completed and produced three drafts, one QA review, and one final artifact.

The technical draft completed at `09:34:13.808Z`; QA review inference started at `09:34:13.809Z`. Review answered at `09:35:53.955Z`; product synthesis started at `09:35:53.956Z`. This establishes the saved record's draft/review/synthesis barriers.

The product draft introduced **“Instructors or department admins”** as secondary users, although the brief requested a student exchange. QA recommended removing those roles to protect scope, and the final **Decisions & Changes After Review** section records **“Removed Admin Roles.”** The final artifact also explicitly preserves the user's undecided email-verification and dispute-handling questions, labeling the provisional defaults **“Pending User Confirmation.”** This improves on the initial run below.

Critiques can themselves overstate evidence. For example, this run's review describes the technical proposal as making phone numbers mandatory; the technical draft actually proposes consent-based email/phone disclosure pending confirmation. The final safeguard against requiring phone numbers may be useful, but the review's characterization is not an established fact. Inspect the original artifacts rather than treating reviewer confidence as correctness.

## Historical initial run: identity and timing

- Run ID: `bfb96611-6f7c-4ad0-ac4f-e43841b219da`
- Model reported by the application: `home-chat`, the user's local Qwen backend.
- Date: **30 October 2026**. Times below are UTC, which is also London time on this date.
- Start: `2026-10-30T09:28:21.934Z`
- Completion: `2026-10-30T09:31:02.868Z`
- Elapsed wall time: **160.934 seconds**.
- Terminal status: `completed`.

## Historical initial run: concurrency and coordination

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

## Historical initial run: an observed change across agents

The product draft explicitly lists **“No Messaging System”** as a non-goal. The technical draft's architecture table proposes **“Socket.io + Redis (or in-memory)”**, with `Conversations` and `Messages` tables. QA review finding 1 cites that conflict and recommends **“Cut Socket.io/Redis.”** The final specification's **Decisions & Changes After Review** section records **“Removed In-App Chat”** and removes that infrastructure and data model.

That chain is present in the saved drafts, review, and final artifact. It is a concrete example of the review changing the proposed implementation rather than three unrelated answers being displayed together.

## Reproducibility checks

The project lead verified the published source at commit `99dc8545fc9d9bff6518b3943db95799bd4a2fd7` with an anonymous shallow clone of [the public repository](https://github.com/johnnyychiu/spec-rescue). A separate clean copy completed `npm ci` (146 packages; zero reported vulnerabilities), `npm run typecheck` (exit 0), and `npm test` (**8 of 8 tests passed**). A browser check confirmed that launch is disabled when model configuration is missing. These checks cover setup, static typing, and the tested behavior; they do not replace real-model execution evidence.

The lead also compared **12 code files** against the clean clone after normalizing line endings and confirmed they matched.

For the final book-exchange run, the lead exercised the browser's Markdown download and verified that the downloaded file matched the complete server export after line-ending normalization. This checks the actual download path in addition to the saved result text.

To check the internal consistency of saved run records, run from the repository root:

```sh
node scripts/verify-evidence.mjs
```

The dependency-free verifier checks `live-run.json` and `final-*.json` snapshots, their five artifacts and native inference loop IDs, initial request overlap, review/synthesis barriers, and matching Markdown exports. It fails with a nonzero exit code if a record is inconsistent. Other JSON files are outside its scope. This checks the records' internal consistency; it does not validate model quality or independently establish their authenticity.

## Limitations and provenance

- `live-run.json` is from the first implementation revision and predates the prompt tightening exercised by `final-books.json`. Do not treat the initial run as evidence that later source changes were exercised.
- In `live-run.json`, the brief explicitly leaves university-email verification undecided. That final result instead specifies signup without domain validation and defers checks to a later version; it does not preserve the choice adequately in its open questions. This is a fidelity weakness, not a confirmed user decision. The historical evidence is retained unchanged. The later final-books run preserves those open questions, but one improved example is not a guarantee of fidelity on arbitrary briefs.
- The output also makes unverified recommendations about privacy, authentication, infrastructure, time estimates, and available services. No external facts, service plans, security properties, or implementation feasibility were validated by this run. A human must review the specification before building or publishing the proposed book-exchange product.
- Timing demonstrates overlapping requests and coordination order for this execution only. It is not a benchmark, a speedup claim, or a guarantee of identical model output on rerun.
- The model identifier is a local serving alias. The saved snapshot does not independently attest model weights or hardware configuration.
- The raw snapshot and exported Markdown are the authoritative artifacts for these observations. Later live runs should be stored as distinct files with their own dates and limitations.
