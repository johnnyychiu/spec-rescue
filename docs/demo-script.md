# Spec Rescue — 90-second demo

Record a real run after following the [README](../README.md), or clearly identify a walkthrough of the [saved real run](evidence/live-run.json). That initial run took 160.934 seconds with the local `home-chat` model. Trim waiting time or clearly label a time jump rather than implying that an edited sequence is real-time. Never substitute a canned result for model output.

## Brief

> Build a student second-hand book exchange that we can launch tomorrow. Students should list books, find a course's books, and arrange a campus handover. We want secure online payment, but the first release must not process payments or require any payment integration. Keep the build small enough for one developer. We have not decided whether students must verify their university email or who handles disputes.

## Shot plan

| Time | Show | Say |
| --- | --- | --- |
| 0–12 seconds | Brief input, then the launch action | “This sounds like a simple book exchange, but the requirements disagree about payment and leave identity and disputes unresolved. Spec Rescue makes those assumptions visible before we start building.” |
| 12–30 seconds | Three agent cards and the event timeline during the first-draft phase | “The product analyst, QA reviewer, and technical architect are separate Mozaik agents. They start together and contribute drafts to shared runtime state.” |
| 30–48 seconds | Open the product draft and technical draft | “The product draft says ‘No Messaging System.’ The technical draft proposes ‘Socket.io + Redis (or in-memory).’ These are incompatible scopes for tomorrow's launch.” |
| 48–65 seconds | QA review, finding 1, and its place in the timeline | “After all drafts arrive, QA reads them together and challenges that conflict. Its proposed resolution is ‘Cut Socket.io/Redis.’” |
| 65–82 seconds | Final specification, Decisions & Changes After Review; then Open Questions | “The final document says ‘Removed In-App Chat’ and explains the change. It still asks which support email will monitor disputes. This remains a draft for human review: the first run also overcommitted on the undecided email-verification policy.” |
| 82–90 seconds | Download Markdown; show the exported file | “We finish with a specification we can hand to a developer, plus the drafts and event trail that explain how the team reached it.” |

## Before recording or submitting

- If recording a new run, use that run's actual outputs; the quotations above describe only the saved initial run.
- Confirm the initial agent loops overlap using actual runtime events, not only card animations.
- Check that the review starts after all drafts and that synthesis incorporates the review.
- Verify the exported Markdown matches the displayed final artifact.
- If any part fails, show the failure honestly and fix it before claiming a completed run.

## Evidence behind this script

The [raw snapshot](evidence/live-run.json) records initial inference starts at **09:28:21.937**, **09:28:21.941**, and **09:28:21.942 UTC**, all before the first completion at **09:28:44.767 UTC** on 30 October 2026. QA review started after the third draft completed, and final synthesis started after review. The snapshot retains all five artifacts. See [evidence notes](evidence/README.md) for limitations, including the explicitly undecided verification choice that this first result did not preserve adequately.
