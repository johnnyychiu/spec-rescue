# Spec Rescue — 90-second demo

Record a real run after following the [README](../README.md), or clearly identify a walkthrough of the [saved final book-exchange run](evidence/final-books.json). That run took 238.149 seconds with the local `home-chat` model. Trim waiting time or clearly label a time jump rather than implying that an edited sequence is real-time. Never substitute a canned result for model output.

## Brief

> Build a student second-hand book exchange that we can launch tomorrow. Students should list books, find a course's books, and arrange a campus handover. We want secure online payment, but the first release must not process payments or require any payment integration. Keep the build small enough for one developer. We have not decided whether students must verify their university email or who handles disputes.

## Shot plan

| Time | Show | Say |
| --- | --- | --- |
| 0–12 seconds | Brief input, then the launch action | “This sounds like a simple book exchange, but the requirements disagree about payment and leave identity and disputes unresolved. Spec Rescue makes those assumptions visible before we start building.” |
| 12–30 seconds | Three agent cards and the event timeline during the first-draft phase | “The product analyst, QA reviewer, and technical architect are separate Mozaik agents. They start together and contribute drafts to shared runtime state.” |
| 30–48 seconds | Open the product draft, Target Users; then the technical draft's verification proposal | “The user asked for a student exchange. The product draft adds ‘Instructors or department admins’ as secondary users, and verification is still undecided. These are choices worth reviewing before implementation.” |
| 48–65 seconds | QA review, Conflicts & Unsupported Assumptions, and its place in the timeline | “After all drafts arrive, QA reads them together. It proposes ‘Remove admin/instructor roles from v1 scope’ and asks the user to confirm verification and dispute ownership.” |
| 65–82 seconds | Final specification, Decisions & Changes After Review; then Open Questions | “The final document records ‘Removed Admin Roles.’ It quotes the undecided email-verification choice and labels it ‘Pending User Confirmation.’ Review suggestions still need a human check; an agent can misread another agent's draft.” |
| 82–90 seconds | Download Markdown; show the exported file | “We finish with a specification we can hand to a developer, plus the drafts and event trail that explain how the team reached it.” |

## Before recording or submitting

- If recording a new run, use that run's actual outputs; the quotations above describe only the saved final book-exchange run.
- Confirm the initial agent loops overlap using actual runtime events, not only card animations.
- Check that the review starts after all drafts and that synthesis incorporates the review.
- Verify the exported Markdown matches the displayed final artifact.
- If any part fails, show the failure honestly and fix it before claiming a completed run.

## Evidence behind this script

The [raw snapshot](evidence/final-books.json) records initial inference starts at **09:32:59.849**, **09:32:59.859**, and **09:32:59.860 UTC**, all before the first completion at **09:33:23.105 UTC** on 30 October 2026. QA review started after the third draft completed, and final synthesis started after review. The snapshot retains all five artifacts. See [evidence notes](evidence/README.md) for exact timing, the earlier iteration's fidelity weakness, and review limitations.
