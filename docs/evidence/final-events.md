# Spec Rescue

Model: home-chat
Started: 2026-10-30T09:37:34.068Z
Run: 5215cb95-4bec-422b-bd5b-4095e4e08ecc

## Original brief

Our student society needs an event signup app for a 100-person workshop next week. We need a waitlist, cancellations, and a way to check people in at the door. Some attendees may bring friends. We have two days and no budget for paid services. Whether guests count toward capacity and whether to require accounts are undecided. What should the MVP include?

---

# Event Signup MVP Specification

## Goal and Users
**Goal:** A zero-budget web app for a 100-person workshop to manage signups, waitlists, cancellations, and door check-in.
**Users:**
1.  **Attendees:** Students signing up for themselves and potentially friends.
2.  **Organizers:** Society members managing the roster and checking people in at the door.

## MVP Scope
*   **Tech Stack (PROPOSED):** Single-page frontend (Vanilla JS/React) + Free-tier Backend (Supabase/Firebase). Hosted on Netlify/Vercel.
*   **Data Model:** `Registration` (id, primary_name, primary_email, guest_names[], guest_emails[], status: active/waitlist/cancelled, checked_in: bool).
*   **Features:**
    *   **Signup Form:** Collects Primary Name/Email + up to 3 Guest Names/Emails. *Note: Collecting guest identity is PROPOSED to resolve check-in ambiguity; see Open Questions.*
    *   **Capacity Logic:** Real-time count of `Active Registrations + Active Guests`.
    *   **Waitlist:** If full, new entries status = `waitlist`. Admin view shows waitlist.
    *   **Cancellation:** User clicks "Cancel" on their confirmation link. Status reverts to `cancelled`, freeing capacity.
    *   **Check-In:** Admin dashboard lists active registrants. Staff taps "Check In" to toggle `checked_in`.
    *   **Waitlist Action:** Admin "Notify Next" button (manual trigger) to highlight the top waitlisted person.

## Non-Goals
*   No user accounts/login systems.
*   No automated email notifications (manual relay only).
*   No payment processing.
*   No native mobile apps.
*   No complex role-based access control (single admin password/link).
*   No public roster visibility to attendees.

## User Journey
1.  **Attendee:** Opens link → Enters Name/Email + Guest Details → Submits → Receives confirmation page with unique Cancel Link.
2.  **Attendee (Cancel):** Clicks Cancel Link → Confirms → Status changes to `cancelled`.
3.  **Organizer:** Opens Admin Link → Views Live Count & Roster → Searches Name → Taps "Check In". If full, views Waitlist and manually contacts the top person.

## Architecture
*   **Frontend:** Static HTML/JS hosted on free CDN.
*   **Backend:** Serverless database (Supabase/Firebase) with Row Level Security (RLS).
*   **Auth:** Simple email-based magic link or unique ID for cancellation; Admin password for dashboard.

## Acceptance Criteria
1.  **Given** a user submits a form, **When** capacity is not full, **Then** status is `active` and they receive a cancel link.
2.  **Given** capacity is full, **When** a user submits, **Then** status is `waitlist`. *(Conditional on confirmation of whether guests count toward capacity)*
3.  **Given** an active registration, **When** user clicks cancel, **Then** status becomes `cancelled` and capacity decreases.
4.  **Given** the admin dashboard, **When** staff taps "Check In", **Then** the record is marked `checked_in` and visible to other organizers.
5.  **Given** a public signup page, **When** a user views it, **Then** they do NOT see other attendees' emails/names (privacy).

## Prioritized Implementation Checklist
1.  Set up Supabase project & `registrations` table.
2.  Build Signup Form (Primary + Guests).
3.  Implement Capacity Check Logic.
4.  Build Admin Dashboard (List, Search, Check-In Toggle).
5.  Implement Cancellation Logic via unique link.
6.  Add Waitlist View & "Notify Next" UI.
7.  Deploy & Test on Mobile.

## Decisions & Changes After Review
*   **Guest Identity:** QA identified a conflict where "guest count only" failed check-in verification. **Change:** MVP now collects Name/Email for guests (PROPOSED) to allow accurate check-in, pending user confirmation if this adds too much friction.
*   **Waitlist Notification:** QA noted ambiguity between auto-email and manual. **Change:** Specified a manual "Notify Next" button in Admin view to avoid email API costs/complexity.
*   **Privacy:** QA flagged potential public exposure of data. **Change:** Explicitly non-goal: Public roster. Only Admin sees full list.
*   **Ownership:** QA noted no specific human owner defined. **Change:** Added "Contact Relay" link in footer, but kept ownership as an Open Question.

## Assumptions
*   Free-tier services (Supabase/Netlify) are acceptable despite potential credit card verification requirements.
*   Organizers have internet access at the door.
*   "100-person" capacity includes guests (PROPOSED).

## Open Questions
1.  **Guest Capacity:** "Whether guests count toward capacity... are undecided."
    *   *Provisional:* Yes, each person counts as one slot.
2.  **Account Requirements:** "Whether... to require accounts are undecided."
    *   *Provisional:* No accounts; use Email + Name only.
3.  **Guest Identity:** Do guests need individual names/emails for check-in, or is a count sufficient?
    *   *Provisional:* Individual names/emails required (per QA conflict resolution).
4.  **Accountable Owner:** Who is the specific human responsible for support issues?
    *   *Provisional:* Society email relay; no specific individual named.

---

# Collaboration evidence

## Product Analyst — draft

# Product Analyst: Event Signup MVP

## Target Users
1.  **Organizers (2-3 people):** Need to manage capacity, view the live roster, and check attendees in at the door.
2.  **Attendees (approx. 100+):** Students who need a quick, mobile-friendly way to sign up, cancel, or add a guest.

## Core User Journey
1.  **Sign Up:** User opens link → enters Name + Email → selects "Self" or "Self + Guest(s)" → receives confirmation link/code.
2.  **Manage:** User clicks link in email (or re-enters email) → cancels self or guest spots → frees capacity.
3.  **Check-In:** Organizer opens admin view → searches name/email → marks as "Present" → system updates capacity count.

## MVP Scope (1 Developer / 1 Day)
*   **Tech Stack:** Single-page frontend (React/Vue) + lightweight backend (Firebase/Supabase free tier or simple Node/Express with SQLite). No paid services.
*   **Data Model:** `User` (name, email), `Registration` (user_id, guest_count, status: active/cancelled/checked_in).
*   **Features:**
    *   Public form: Name, Email, Guest Count (0-3).
    *   Admin Dashboard: List of all registrations, search bar, toggle "Checked In" status.
    *   Capacity Logic: Real-time counter showing `Active Registrations + Active Guests` vs. `Max Capacity`.
    *   Waitlist: If capacity is full, new signups go to a `Waitlist` status. If a cancellation occurs, the first waitlisted person gets an email (or manual notification by organizer).
    *   Cancellation: Simple "Cancel" button on the user’s confirmation page.
*   **Guests:** Guests are treated as part of the primary registrant’s entry. They do not need individual accounts unless required (see Open Questions).

## Explicit Non-Goals
*   No user accounts/login system (unless decided otherwise).
*   No complex scheduling or recurring events.
*   No payment processing.
*   No mobile native apps (responsive web only).
*   No automated SMS notifications (email only).
*   No role-based access control beyond a simple admin password for the dashboard.

## Assumptions
*   "100-person capacity" refers to total heads in the room, not just primary registrants.
*   Organizers can share a single admin link/password with their team.
*   Email is sufficient for notifications; no push notifications needed.
*   The app will be hosted on a free tier service (e.g., Vercel, Netlify, Firebase) with no cost.

## Open Questions
1.  **Guest Capacity:** Do guests count toward the 100-person limit? *(Provisional: Yes, but pending user confirmation)*
2.  **Accounts:** Do attendees need to create accounts/log in, or is email verification sufficient? *(Provisional: Email only, no accounts)*
3.  **Waitlist Notification:** Should the system auto-email the next person on the waitlist, or should organizers manually notify them? *(Provisional: Manual notification to save dev time)*
4.  **Guest Identity:** Do guests need to provide names/emails for check-in, or are they just a count? *(Provisional: Count only, to simplify UX)*

## QA Critic — draft

# Spec Rescue: Initial Draft Critique

## USER FACTS (Explicit)
*   **Scale:** 100-person workshop.
*   **Timeline:** Next week; 2 days to build.
*   **Budget:** No paid services.
*   **Core Features:** Signup, waitlist, cancellations, door check-in.
*   **Scenario:** Attendees may bring friends.

## PROPOSALS & ASSUMPTIONS (Agent-Generated)
*   *Assumption:* "No budget" implies using free-tier tools (e.g., Google Forms/Sheets, Tally, or a local static site).
*   *Assumption:* "Check-in at the door" implies a manual or semi-automated verification process, not hardware scanners.
*   *Assumption:* "Friends" implies a secondary guest mechanism, but the data structure is undefined.

## AMBIGUITIES & OPEN QUESTIONS
**1. Guest Capacity Logic (Undecided by User)**
*   **Question:** Do guests count toward the 100-person limit?
*   **Contradiction Risk:** If a user signs up for themselves + 2 friends, do they occupy 3 slots or 1?
*   **Provisional Recommendation:** Treat each *person* as one slot. A "signup" is a record of one individual. *Pending user confirmation.*

**2. Account Requirements (Undecided by User)**
*   **Question:** Do attendees need email accounts for verification?
*   **Privacy Concern:** If no accounts, how do we prevent double-booking? If accounts are required, what data do we collect?
*   **Provisional Recommendation:** Use email as a unique key (no password) to reduce friction. *Pending user confirmation.*

**3. "Check-In" Definition**
*   **Question:** What does "check-in" mean technically?
    *   Option A: Staff looks up name in a list and marks "Present."
    *   Option B: User scans a QR code to mark themselves present.
*   **Failure Case:** If Option B, what happens if the user’s phone is dead?

## FAILURE CASES
1.  **Race Condition:** Two people claim the last spot simultaneously.
    *   *Mitigation:* Single-writer database or simple "first-come" timestamping.
2.  **No-Show:** Someone signs up but doesn’t show.
    *   *Mitigation:* Does the waitlist auto-promote? If so, when? (e.g., 1 hour before start).
3.  **Guest Cancellation:** The host cancels, but the guest still wants to attend.
    *   *Question:* Is the guest tied to the host’s slot?

## PRIVACY CONCERNS
*   **Data Minimization:** If using a public form, are names/emails visible to other attendees?
*   **Consent:** Do guests need explicit consent for their data to be stored?
*   **Retrieval:** How do attendees cancel? Email link? Phone call to society?

## TESTABLE ACCEPTANCE CRITERIA (MVP)
1.  **Signup:** A user can enter Name + Email and receive a confirmation.
2.  **Capacity:** When 100 unique emails are registered, new signups go to a "Waitlist" status.
3.  **Cancellation:** A user can click a link to remove themselves; their slot becomes available to the top waitlisted person.
4.  **Guests:** A user can add up to [X] guests per signup. *(X is an Open Question)*
5.  **Check-In:** Staff can view a list of "Registered" vs. "Checked-In" and mark individuals as present.

## CONTRADICTIONS PRIORITY
*   **Two days vs. Guest Logic:** If guest logic is complex (e.g., separate invitations per guest), it may exceed the 2-day build window. Recommend simplifying: *One form, user lists all names/emails in a single submission.*

## Technical Planner — draft

# Technical Planner: Initial Draft

## USER FACTS
*   **Scope:** 100-person workshop, one-time event (next week).
*   **Timeline:** 2 days for build/deploy.
*   **Budget:** $0 (no paid SaaS).
*   **Core Features:** Signup, Waitlist, Cancellations, Door Check-in.
*   **Guest Policy:** Attendees may bring friends (counting toward capacity is **undecided**).
*   **Auth Policy:** Account requirement is **undecided**.

## PROPOSALS (Provisional)

### 1. Architecture & Dependencies
**Strategy:** Single-File Web App + Static Hosting.
Minimize external integrations by avoiding complex databases or auth providers. Use a single JavaScript file that interacts with a free-tier backend or local storage if the event is fully offline-managed. Given the "door check-in" requirement, a shared state is necessary.

*   **Frontend:** Vanilla HTML/CSS/JS (no React/Vue build step).
*   **Backend:** **Firebase Firestore** (Free Spark plan) OR **Supabase** (Free tier). *Recommendation: Supabase for easier SQL-like querying and row-level security setup without complex client-side logic.*
*   **Hosting:** GitHub Pages or Netlify (Free).
*   **Dependencies:** Only the CDN link for the backend SDK. No `npm install`.

### 2. MVP Scope
1.  **Signup Form:** Name, Email, "Number of Guests" (0-3), Consent checkbox.
2.  **Capacity Logic:** Hard cap at 100 total seats (attendees + guests).
3.  **Waitlist:** If full, append to `waitlist` array.
4.  **Check-in:** Admin view with a list of signed-up users. Tap to mark "Checked In."
5.  **Cancellation:** User can tap "Cancel" on their own registration (via link or unique ID).

### 3. Implementation Steps (2-Day Plan)
*   **Day 1 (AM):** Set up Supabase project. Create `registrations` table (id, name, email, guests, status, checked_in). Create `waitlist` table.
*   **Day 1 (PM):** Build single `index.html`. Form posts to Supabase. Implement capacity check (query count where status='active').
*   **Day 2 (AM):** Build "Admin View" (simple toggle via URL hash or secret input). List all active registrations. Add "Check In" button that updates `checked_in` boolean.
*   **Day 2 (PM):** Test on mobile devices. Deploy to Netlify/GitHub Pages. Share link.

### 4. Technical Risks
1.  **Race Conditions:** Two people sign up simultaneously when 1 seat is left. *Mitigation:* Accept minor risk for MVP; or use Supabase Row Locks if time permits.
2.  **Spam/No-shows:** No email verification. *Mitigation:* Ask for email; manually verify if capacity is tight.
3.  **Guest Ambiguity:** If guests don't have individual records, check-in is hard (one tap for 3 people?). *Mitigation:* Treat "Guests" as a quantity field. Check-in marks the *primary* attendee as present, implying their guests are too.

## OPEN QUESTIONS
*(Must be resolved by user before finalizing logic)*

1.  **Do guests count toward the 100-person capacity?**
    *   *Provisional Recommendation:* Yes (simpler for venue liability).
2.  **Are accounts required?**
    *   *Provisional Recommendation:* No. Use Email + Name only. Accounts add friction and complexity.
3.  **How are guests checked in?**
    *   *Provisional Recommendation:* Primary attendee checks in for themselves + all listed guests.

## ASSUMPTIONS
*   All attendees have smartphones with internet access at the door.
*   The organizer has access to a computer or phone to view the Admin Check-in list.
*   "No budget" allows for free tiers of Supabase/Netlify (which require email verification).
*   The event is in-person, not hybrid/virtual.

## QA Critic — review

## Cross-Agent Review: Event Signup MVP

### 1. Undecided Choices & Preservation Status
The user explicitly left two choices undecided: **(A) Guest Capacity Logic** and **(B) Account Requirements**.

*   **Product Analyst:** Preserves both as Open Questions with provisional recommendations. **Status: OK.**
*   **QA Critic:** Preserves both as Open Questions. **Status: OK.**
*   **Technical Planner:** Preserves both as Open Questions. **Status: OK.**

**Flag:** No draft *silently* decides these as confirmed requirements. However, **Technical Planner**’s "Implementation Steps" (Day 1 PM) says: *"Implement capacity check (query count where status='active')"*. This implies a specific technical implementation of the *undecided* logic before the user has confirmed if guests count. While labeled provisional elsewhere, the plan assumes the logic is settled for coding purposes.

### 2. Conflicts & Unsupported Assumptions (Top 5)

1.  **Conflict: Guest Identity vs. Check-In Mechanism**
    *   **Cite:** Product Analyst says *"Guests... do not need individual accounts."* Technical Planner says *"Check-in marks the primary attendee as present, implying their guests are too."* QA Critic asks *"Is the guest tied to the host’s slot?"*
    *   **Effect:** If guests are just a count (Analyst/Planner), the door staff cannot verify *who* the guests are. If a host brings 3 friends but one is a no-show, capacity is over-counted. If guests need names for check-in (QA’s concern), the "count only" proposal fails.
    *   **PROPOSAL:** MVP must collect **Name + Email for every individual** (host and guests) in a single form submission to enable accurate check-in and cancellation. This resolves the "identity" ambiguity.

2.  **Assumption: "No Budget" = Free Tier SaaS is Reliable**
    *   **Cite:** All agents assume Firebase/Supabase/Netlify free tiers are acceptable.
    *   **Effect:** Free tiers often have rate limits or require credit cards for verification (e.g., Supabase). If the user has *no* budget at all, even a $0-credit-card-required service might be a blocker.
    *   **PROPOSAL:** Confirm if a free tier requiring a credit card for identity verification is acceptable, or if a self-hosted/static alternative is needed.

3.  **Conflict: Waitlist Notification Method**
    *   **Cite:** Product Analyst proposes *"Manual notification by organizer"* as provisional. Technical Planner implies automated logic (*"append to waitlist array"*). QA Critic asks *"Does the waitlist auto-promote?"*
    *   **Effect:** If manual, the app needs a "View Waitlist" button for staff. If automated, it needs email integration (complexity). The 2-day budget favors manual, but the spec is unclear.
    *   **PROPOSAL:** MVP should include a **"Notify Next" button** in the Admin Dashboard. Staff clicks it to manually email/call the top waitlisted person. This avoids email API complexity.

4.  **Assumption: Mobile Internet at the Door**
    *   **Cite:** Technical Planner assumes *"All attendees have smartphones with internet access at the door."*
    *   **Effect:** If the venue has poor Wi-Fi, a web-based check-in app might lag or fail. QA Critic mentions *"phone is dead"* as a failure case.
    *   **PROPOSAL:** The Admin Check-In view must support **offline caching** or allow staff to mark people as "Present" locally and sync later. Alternatively, provide a printed list as a fallback.

5.  **Privacy: Public Contact Disclosure**
    *   **Cite:** Product Analyst says *"Public form: Name, Email."*
    *   **Effect:** If the form is public and data is stored in a simple DB, are names/emails visible to other attendees? The brief does not require public disclosure.
    *   **PROPOSAL:** Ensure the **Admin List** is the only place where full names/emails are visible. The public form should only show a confirmation message to the user, not a public roster.

### 3. Privacy & Ownership Checks
*   **Privacy:** No draft mandates phone numbers. All use Email/Name. **OK.**
*   **Ownership:** No draft names a specific human owner for disputes. All refer to "Organizers" or "Staff." **Gap:** The brief mentions "student society," but no specific contact person is defined for support issues.
    *   **PROPOSAL:** Add a **"Contact Us" link** in the footer pointing to a society email address, but clarify that this is a *relay*, not an individual owner.

### 4. Acceptance Checks
1.  **Guest Data:** Does the form capture Name + Email for *each* guest, or just a count? (Must resolve Conflict #1).
2.  **Waitlist Action:** Is there a UI button for staff to trigger waitlist notification? (Must resolve Conflict #3).
3.  **Privacy View:** Can a regular attendee see other attendees' emails on the public page? (Must be No).
4.  **Offline Fallback:** Is there a printed list or offline mode for check-in? (Must address Assumption #4).

## Runtime timeline

- 2026-10-30T09:37:34.068Z · team · brief.submitted: Brief published to all three agents; independent drafts begin concurrently.
- 2026-10-30T09:37:34.068Z · product · agent.started: Product Analyst started an independent draft.
- 2026-10-30T09:37:34.068Z · qa · agent.started: QA Critic started an independent draft.
- 2026-10-30T09:37:34.069Z · architect · agent.started: Technical Planner started an independent draft.
- 2026-10-30T09:37:34.069Z · product · inference.started: Product Analyst model request started. (loop eb645645-716b-4ace-9a30-8f1e1c10d7f3)
- 2026-10-30T09:37:34.069Z · qa · inference.started: QA Critic model request started. (loop 04e2352e-22c8-4496-b604-f87da5c252e4)
- 2026-10-30T09:37:34.069Z · architect · inference.started: Technical Planner model request started. (loop 5cd42d92-13ca-4f15-b84e-b6ebeb2396ce)
- 2026-10-30T09:37:54.692Z · product · inference.completed: Product Analyst model request completed. (loop eb645645-716b-4ace-9a30-8f1e1c10d7f3)
- 2026-10-30T09:37:54.692Z · product · model.answer: Product Analyst completed draft. (loop eb645645-716b-4ace-9a30-8f1e1c10d7f3)
- 2026-10-30T09:38:19.716Z · qa · inference.completed: QA Critic model request completed. (loop 04e2352e-22c8-4496-b604-f87da5c252e4)
- 2026-10-30T09:38:19.716Z · qa · model.answer: QA Critic completed draft. (loop 04e2352e-22c8-4496-b604-f87da5c252e4)
- 2026-10-30T09:38:46.506Z · architect · inference.completed: Technical Planner model request completed. (loop 5cd42d92-13ca-4f15-b84e-b6ebeb2396ce)
- 2026-10-30T09:38:46.507Z · architect · model.answer: Technical Planner completed draft. (loop 5cd42d92-13ca-4f15-b84e-b6ebeb2396ce)
- 2026-10-30T09:38:46.507Z · qa · agent.started: QA Critic started the cross-agent review.
- 2026-10-30T09:38:46.507Z · qa · inference.started: QA Critic model request started. (loop 1c1489f4-8843-4a17-8382-d09bd557e17f)
- 2026-10-30T09:39:22.864Z · qa · inference.completed: QA Critic model request completed. (loop 1c1489f4-8843-4a17-8382-d09bd557e17f)
- 2026-10-30T09:39:22.864Z · qa · model.answer: QA Critic completed review. (loop 1c1489f4-8843-4a17-8382-d09bd557e17f)
- 2026-10-30T09:39:22.864Z · product · agent.started: Product Analyst started the revised specification.
- 2026-10-30T09:39:22.865Z · product · inference.started: Product Analyst model request started. (loop d641ed78-d56c-442c-8f49-d3cea7e1c48e)
- 2026-10-30T09:40:03.137Z · product · inference.completed: Product Analyst model request completed. (loop d641ed78-d56c-442c-8f49-d3cea7e1c48e)
- 2026-10-30T09:40:03.137Z · product · model.answer: Product Analyst completed final. (loop d641ed78-d56c-442c-8f49-d3cea7e1c48e)
- 2026-10-30T09:40:03.137Z · team · run.completed: Final specification ready. Original drafts and review remain available for inspection.
