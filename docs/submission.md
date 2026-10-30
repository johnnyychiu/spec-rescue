# Spec Rescue — submission copy

Track: **Freestyle**

## What does it do?

Spec Rescue turns a vague product idea into a reviewed MVP specification. A product analyst, QA reviewer, and technical architect examine the same brief in parallel, then compare their assumptions before a bounded review and synthesis. The final Markdown document brings together the proposed scope, unresolved questions, acceptance criteria, and implementation tasks.

The aim is to catch disagreements before they become code. In the final book-exchange test, the product draft introduced instructor/admin users beyond the student's brief. QA challenged that scope, and the final specification removed those roles while preserving the user's undecided email-verification and dispute-handling choices for confirmation. The interface exposes drafts, review, final specification, and the event timeline so users can inspect those changes.

## How do the agents run concurrently?

Three distinct Mozaik agents start their first-draft loops on the same brief. Each writes its own artifact into shared runtime state. A completion barrier waits for all three drafts before starting the QA review, so the reviewer can cite disagreements across the product and technical proposals. The product agent then synthesizes a final specification using those drafts and the critique. There is one review round, keeping the workflow bounded.

The browser receives run snapshots through server-sent events. Initial drafts, the review, and the final artifact remain available alongside timestamped runtime events; Markdown export makes the result usable outside the application. Missing model configuration or inference failures are reported rather than replaced with canned AI output.

## Reviewer quick path

1. Follow the installation and model configuration instructions in the [README](../README.md).
2. Start the app and select the book-exchange example, or use the brief in the [demo script](demo-script.md).
3. Launch a run. Inspect the first-draft event timestamps and three agent outputs, followed by the review and synthesis. For a saved real run, open the [evidence notes](evidence/README.md) and [final book-exchange snapshot](evidence/final-books.json).
4. Compare the initial assumptions with the final decisions and unresolved questions.
5. Download the Markdown specification.

## Submission fields to finalize

- Project name: **Spec Rescue**
- Repository URL: **https://github.com/johnnyychiu/spec-rescue**
- Live deployment URL: optional; leave blank unless a working public deployment has been verified.
- Demo/video URL: optional; leave blank unless a recording has been published.
- Screenshots: attach only screenshots from the actual application.

## Evidence and current limitations

A real run of the final book-exchange workflow using the local `home-chat` model completed on 30 October 2026 in **238.149 seconds**. All three initial inference-start events precede the first inference completion, and the snapshot contains five artifacts: three drafts, QA review, and final synthesis. The final artifact explicitly preserves email-verification and dispute-handling questions as **Pending User Confirmation**. See the [evidence notes](evidence/README.md) for exact timestamps and scope.

All **three final example workflows** completed with the real local model: book exchange, barbershop booking (**260.347 seconds**), and workshop signup (**149.069 seconds**). Their snapshots and Markdown exports are saved in `docs/evidence/`. The booking output retains payments/SMS as open questions, and the workshop output retains guest-capacity/account requirements as open questions with provisional defaults. The dependency-free evidence verifier passes all three final records plus the historical run. These examples establish completed executions and trace consistency, not a general quality guarantee.

An earlier **160.934-second** run exposed a limitation: the model converted the undecided university-email verification policy into a launch recommendation without preserving it in the final open questions. That historical evidence is retained alongside the later run after prompt tightening. The improvement in this example is not proof of perfect requirement fidelity. Generated critiques, technical claims, and estimates remain proposals for human review, not externally verified facts.

Source was published on `main` at commit `99dc8545fc9d9bff6518b3943db95799bd4a2fd7`. The project lead verified an anonymous shallow clone of the public repository and a clean install: `npm ci` completed with 146 packages and zero reported vulnerabilities, `npm run typecheck` passed, and all **8 tests** passed. Browser verification also confirmed that missing model configuration disables launch. Subsequent documentation or evidence updates may create a newer commit. No public live deployment or published video is asserted here.
