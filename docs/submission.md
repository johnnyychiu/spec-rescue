# Spec Rescue — submission copy

Track: **Freestyle**

## What does it do?

Spec Rescue turns a vague product idea into a reviewed MVP specification. A product analyst, QA reviewer, and technical architect examine the same brief in parallel, then compare their assumptions before a bounded review and synthesis. The final Markdown document brings together the proposed scope, unresolved questions, acceptance criteria, and implementation tasks.

The aim is to catch disagreements before they become code. In the recorded book-exchange run, the technical draft proposed Socket.io/Redis chat while the product draft explicitly excluded messaging. QA identified the conflict, and the final specification removed that infrastructure. The interface exposes drafts, review, final specification, and the event timeline so users can inspect those changes.

## How do the agents run concurrently?

Three distinct Mozaik agents start their first-draft loops on the same brief. Each writes its own artifact into shared runtime state. A completion barrier waits for all three drafts before starting the QA review, so the reviewer can cite disagreements across the product and technical proposals. The product agent then synthesizes a final specification using those drafts and the critique. There is one review round, keeping the workflow bounded.

The browser receives run snapshots through server-sent events. Initial drafts, the review, and the final artifact remain available alongside timestamped runtime events; Markdown export makes the result usable outside the application. Missing model configuration or inference failures are reported rather than replaced with canned AI output.

## Reviewer quick path

1. Follow the installation and model configuration instructions in the [README](../README.md).
2. Start the app and select the book-exchange example, or use the brief in the [demo script](demo-script.md).
3. Launch a run. Inspect the first-draft event timestamps and three agent outputs, followed by the review and synthesis. For a saved real run, open the [evidence notes](evidence/README.md) and [raw snapshot](evidence/live-run.json).
4. Compare the initial assumptions with the final decisions and unresolved questions.
5. Download the Markdown specification.

## Submission fields to finalize

- Project name: **Spec Rescue**
- Repository URL: **https://github.com/johnnyychiu/spec-rescue**
- Live deployment URL: optional; leave blank unless a working public deployment has been verified.
- Demo/video URL: optional; leave blank unless a recording has been published.
- Screenshots: attach only screenshots from the actual application.

## Evidence and current limitations

A real run using the local `home-chat` model completed on 30 October 2026 in **160.934 seconds**. All three initial inference-start events precede the first inference completion, and the snapshot contains five artifacts: three drafts, QA review, and final synthesis. See the [evidence notes](evidence/README.md) for exact timestamps and scope.

That first run also exposed a limitation: the model converted an explicitly undecided university-email verification policy into a launch recommendation without preserving it in the final open questions. The saved evidence retains that weakness. Prompt changes and any subsequent runs must be documented separately; the first run is not proof of perfect requirement fidelity. Generated technical claims and estimates are proposals for human review, not externally verified facts.

Repository creation has been confirmed by the project lead; source upload and clean-install checks must be verified before the final submission. No public live deployment or published video is asserted here.
