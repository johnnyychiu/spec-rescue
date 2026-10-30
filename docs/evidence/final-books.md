# Spec Rescue

Model: home-chat
Started: 2026-10-30T09:32:59.843Z
Run: af3b6eee-23a1-4fb9-b4ae-d73f4bea0f58

## Original brief

Build a student second-hand book exchange that we can launch tomorrow. Students should list books, find a course’s books, and arrange a campus handover. We want secure online payment, but the first release must not process payments or require any payment integration. Keep the build small enough for one developer. We have not decided whether students must verify their university email or who handles disputes.

---

# Final Specification: Student Book Exchange MVP

## Goal and Users
**Goal:** Launch a web-based platform tomorrow for students to list, find, and arrange handover of second-hand course books.
**Users:** Students at a single university. *PROPOSED:* Exclude instructors/admins from v1 to protect the 1-day build scope.

## MVP Scope
*   **Core Features:**
    *   User signup/login (email-based).
    *   Create/Edit/Delete book listings (Title, Course Code, Price, Condition, Image).
    *   Search/Filter books by Course Code or Title.
    *   Handover Arrangement: A mechanism to propose and confirm meeting time/location.
*   **Tech Stack (PROPOSED):** Next.js/SvelteKit + Supabase (Auth/DB/Storage) + Vercel. Single developer capacity.

## Non-Goals
*   **Payment Processing:** No Stripe/PayPal integration or API calls. *Must not* process payments online.
*   **Mobile Native Apps:** Web-only (responsive).
*   **Admin Roles:** No instructor curation or admin dashboards.
*   **Shipping/Logistics:** No tracking or shipping labels.
*   **Push Notifications:** Only in-app status updates.

## User Journey
1.  **Sign Up:** Student registers with name and email.
2.  **List:** Seller adds book details, including course code.
3.  **Discover:** Buyer searches by course code.
4.  **Arrange:** Buyer proposes handover time/location via in-app form/chat.
5.  **Confirm:** Seller accepts proposal. Details are visible to both.
6.  **Handover:** Students meet offline. Payment is cash/bank transfer.

## Architecture
*   **Frontend:** React/Vue SPA with server-side rendering for search pages.
*   **Backend:** Serverless functions or API routes.
*   **Database:** Postgres (via Supabase). Tables: `users`, `books`, `handover_requests`.
*   **Auth:** Email/password or magic link. *Conditional:* Domain check logic depends on Open Question 1.

## Acceptance Criteria
1.  **Given** a student signs up, **When** they submit the form, **Then** they can log in and create a listing.
2.  **Given** a book is listed with Course Code "CS101", **When** a buyer searches "CS101", **Then** the book appears in results.
3.  **Given** a buyer views a book, **When** they propose a handover time, **Then** the seller receives an in-app notification/request.
4.  **Given** the v1 codebase, **When** audited, **Then** no payment gateway SDKs or API calls exist.
5.  **Given** the contact mechanism, **When** details are shared, **Then** no phone numbers are *required* unless explicitly confirmed (see Open Question 3).

## Prioritized Implementation Checklist
1.  **Setup (2h):** Repo init, Supabase connection, Tailwind setup.
2.  **Auth (3h):** Signup/Login page. *Config flag for domain check.*
3.  **Book CRUD (5h):** Create form, Search page, Listing detail page.
4.  **Handover Flow (4h):** Proposal form, Seller acceptance logic, Status display.
5.  **Polish & Deploy (3h):** Mobile responsiveness, error states, Vercel deploy.

## Decisions & Changes After Review
*   **Removed Admin Roles:** QA noted Product Analyst included instructors; removed to fit 1-day scope.
*   **Privacy Default:** QA flagged Technical Planner’s mandatory phone number reveal. *PROPOSED:* Default to email-only or in-app chat relay unless phone is confirmed.
*   **Verification Logic:** QA flagged hardcoded domain check. *PROPOSED:* Implement as a configuration flag, not hard logic, pending user decision.
*   **Dispute Ownership:** QA noted "support link" is not an owner. *PROPOSED:* Label support email as "Log" only until a human owner is named.

## Assumptions
1.  **Single Campus:** Launch is for one university.
2.  **Course Codes:** Students know and use consistent course codes.
3.  **Trust:** Users accept offline cash risk in v1.

## Open Questions
1.  **Email Verification:** *"We have not decided whether students must verify their university email."*
    *   *Provisional Default:* Domain check only (no token). **Pending User Confirmation.**
2.  **Dispute Handling:** *"We have not decided... who handles disputes."*
    *   *Provisional Default:* No formal system; "Meet at your own risk" T&C. Accountable human undefined. **Pending User Confirmation.**
3.  **Contact Method:** *Not explicitly stated in brief, but implied by "arrange handover."*
    *   *Provisional Default:* In-app chat or email reveal. Phone numbers optional. **Pending User Confirmation.**
4.  **Payment UI:** *Brief says "must not process payments" but "want secure online payment" (future).*
    *   *Provisional Default:* Show price, no "Pay" button. Label as "Cash on Handover." **Pending User Confirmation.**

---

# Collaboration evidence

## Product Analyst — draft

# Spec Rescue: Student Book Exchange MVP

## Target Users
*   **Primary:** Students at a single university seeking to buy or sell course-specific textbooks.
*   **Secondary:** Instructors or department admins (only if they curate lists; otherwise, students self-manage).

## Core User Journey
1.  **List:** Seller creates a profile, adds book title, condition, price, and course code.
2.  **Discover:** Buyer searches by course code or keyword.
3.  **Connect:** Buyer contacts seller via in-app message or shared contact info to agree on handover time/location.
4.  **Handover:** Students meet on campus to exchange cash/book (offline).
5.  **Close:** User marks transaction as complete.

## MVP Scope (1-Dev, 1-Day Build)
*   **Data Model:** Users (Name, Email, University), Books (Title, Course Code, Price, Condition, Status, Seller ID).
*   **Auth:** Simple email/password or magic link login. *No university verification yet.*
*   **UI:**
    *   Public search/browse page filtered by course code.
    *   "Post a Book" form.
    *   User dashboard to manage listings.
    *   Basic contact mechanism (reveal email or in-app chat).
*   **Backend:** REST API for CRUD operations on books and users.
*   **Hosting:** Single cloud instance (e.g., Vercel, Render, or Heroku) with a managed database (e.g., Supabase, Firebase, or Postgres).

## Explicit Non-Goals
*   **Payment Processing:** No Stripe/PayPal integration. All payments are offline (cash/bank transfer).
*   **University Verification:** No SSO or domain verification check.
*   **Dispute Resolution:** No formal arbitration system.
*   **Shipping/Logistics:** No tracking, shipping labels, or delivery scheduling tools.
*   **Notifications:** No push notifications or email reminders (only in-app status updates if time permits).
*   **Mobile Native Apps:** Web-only (mobile-responsive).

## Assumptions
1.  **Single Campus:** The initial launch is for one specific university.
2.  **Trust Model:** Users will trust each other based on profile name and email domain (even if unverified) for cash transactions.
3.  **Course Codes:** Students know their course codes and will use them for search.
4.  **Tech Stack:** Developer is proficient in a full-stack framework (e.g., Next.js, Django, or Rails) to minimize setup time.

## Open Questions & Decisions Needed
1.  **Identity Verification:** *Undecided.* Do we require university email domains at signup, or allow any email?
    *   *Provisional Recommendation:* Require university email domain for trust, but no SSO.
2.  **Dispute Handling:** *Undecided.* Who resolves issues if a book doesn’t arrive or is damaged?
    *   *Provisional Recommendation:* No formal system; rely on peer-to-peer resolution or university student union if needed.
3.  **Contact Mechanism:** *Undecided.* How do students connect?
    *   *Option A:* Reveal email address after search.
    *   *Option B:* Simple in-app chat.
    *   *Provisional Recommendation:* Option A (reveal email) is faster to build than chat.
4.  **Book Metadata:** *Undecided.* Is ISBN required, or just title/course code?
    *   *Provisional Recommendation:* Title + Course Code only, to reduce friction.

## Risks
*   **Scams:** Without verification or payment hold, risk of no-shows.
*   **Data Quality:** Inconsistent course code entry may hinder searchability.

## QA Critic — draft

## Spec Rescue: Initial Draft Critique

### User Facts (Confirmed)
*   **Goal:** Student second-hand book exchange.
*   **Timeline:** Launch tomorrow.
*   **Core Features:** List books, find course-specific books, arrange campus handover.
*   **Constraint 1:** Build size must fit one developer.
*   **Constraint 2:** First release must **not** process payments or require payment integration.
*   **Ambiguity A:** University email verification status is **undecided**.
*   **Ambiguity B:** Dispute handling owner is **undecided**.

### Contradictions & Ambiguities
1.  **"Secure" vs. "No Payment Integration":** The brief demands "secure online payment" but explicitly forbids processing payments. This is a contradiction unless "secure" refers only to data transmission (HTTPS) or a future-proofed UI. If no money changes hands online, what defines "secure"?
2.  **Handover Mechanism:** "Arrange a campus handover" is vague. Does the platform store location/time? Or does it merely provide a chat interface? If the platform stores details, it becomes a data processor with privacy implications. If it’s just chat, it’s a messaging app.
3.  **"Find a course’s books":** How is a book linked to a course? By ISBN? By manual tagging? By department code? Without a defined data source (e.g., university catalog API), this feature is untestable.

### Failure Cases
*   **No-Show Handover:** If students meet offline, who is responsible if one doesn’t show? Without dispute resolution defined, the platform likely bears reputational risk.
*   **Course Mismatch:** If "finding course books" relies on user tags, what happens if a book is tagged for the wrong course? There is no validation mechanism specified.
*   **Email Bounce:** If email verification is *not* required, how do we prevent spam accounts from flooding the exchange?

### Privacy Concerns
*   **Contact Data Exposure:** To "arrange handover," students must share location/time. If this happens in public book listings, personal data (e.g., "Meet at my dorm door") is exposed. **Recommendation:** Use a relay system or private messaging thread post-listing.
*   **Email Verification:** If undecided, assume *no* verification for v1. This means anyone with a university email can join, but also anyone with *any* email (if validation is skipped). Clarify if the domain check is the only gate.

### Open Questions (Must Resolve Before Build)
1.  **Payment UI:** Do we show a "Pay Now" button that does nothing (confusing UX) or no button at all?
2.  **Verification:** Is university email verification required for v1? (User stated: *Undecided*)
3.  **Disputes:** Who resolves issues? (User stated: *Undecided*)
4.  **Course Linking:** How are books mapped to courses? (ISBN lookup vs. manual tag?)

### Testable Acceptance Criteria
1.  A student can create a book listing with title, price, and course association.
2.  A student can search/filter books by specific course name/code.
3.  Two students can initiate a handover arrangement (e.g., via chat or scheduled slot).
4.  No payment gateway API calls are made during v1.
5.  System handles at least [X] concurrent users (define "small enough").
6.  If email verification is *not* required, any valid email format is accepted.

### Provisional Recommendations (Pending User Confirmation)
*   **Disputes:** For v1, state "Meet at your own risk" in T&Cs to avoid building a dispute team.
*   **Verification:** Require university email domain check only (low cost, high trust signal).
*   **Handover:** Use private chat for coordination to protect privacy.

**Decision Needed:** Confirm answers to Open Questions 1–4 before coding starts.

## Technical Planner — draft

# Technical Plan: Student Book Exchange (MVP)

## USER FACTS
*   **Goal:** Launch tomorrow; one developer capacity.
*   **Core Features:** List books, search by course, arrange handover.
*   **Constraint:** No payment processing/integration in v1.
*   **Unresolved:** Email verification requirement; dispute handling owner.

## PROPOSALS

### Architecture & Dependencies
**Assumption:** "Secure online payment" implies future Stripe/PayPal integration, but v1 is cash-on-handover.

**Stack (Minimal):**
1.  **Framework:** Next.js (App Router) or SvelteKit. Single repo, server-side rendering for SEO (course searches).
2.  **Database:** Supabase (Postgres + Auth + Storage). One external dependency handles DB, user auth, and image hosting.
3.  **Styling:** Tailwind CSS. No component library to keep bundle small.
4.  **Hosting:** Vercel (free tier) or Netlify. Zero-config deployment.

**Data Model (3 Tables):**
*   `users`: id, name, email, university (string), avatar_url.
*   `books`: id, title, course_code, condition, price, seller_id, status (active/sold), image_url.
*   `handovers`: id, book_id, buyer_id, meeting_spot, agreed_time, status (pending/confirmed/completed).

### Implementation Steps (24-Hour Sprint)
1.  **Setup (2h):** Init repo, connect Supabase, set up Tailwind.
2.  **Auth & Profile (3h):** Email/password login via Supabase Auth. *Provisional:* Require university email domain check (e.g., `@uni.edu`) at signup, but allow override for now.
3.  **Book CRUD (5h):**
    *   Create form: Title, Course Code, Price, Image upload.
    *   Search page: Filter by `course_code` (exact match) and text search on title.
4.  **Handover Flow (4h):**
    *   "Request Handover" button on book detail.
    *   Modal to propose time/location.
    *   Seller accepts/rejects via simple status toggle.
5.  **UI Polish & Deploy (3h):** Mobile-responsive check, error states, deploy to Vercel.

### Technical Risks
1.  **Image Storage Limits:** Supabase free tier has storage limits. *Mitigation:* Compress images client-side before upload.
2.  **Course Code Inconsistency:** Students may type "CS101" vs "CS 101". *Mitigation:* Normalize input (trim, uppercase) and use exact match only. No fuzzy search in v1.
3.  **No Payment = No Trust:** Risk of no-shows. *Mitigation:* UI clearly states "Cash on Handover."

## OPEN QUESTIONS
*   **Email Verification:** Must students prove university affiliation? *Provisional Recommendation:* Simple domain check at signup (no automated email verification token) to save time, pending user confirmation.
*   **Dispute Handling:** Who resolves conflicts? *Provisional Recommendation:* No formal dispute process in v1; rely on "Report User" button that emails a static support address. Owner TBD.
*   **Contact Method:** How do they arrange specifics? *Provisional Recommendation:* In-app messaging is overkill for v1. Use shared email/phone number revealed upon handover request acceptance. Pending user confirmation on privacy preference (consent-based reveal).

## QA Critic — review

## Cross-Agent Review: Student Book Exchange

### 1. Undecided Choices & Preservation Check
The brief explicitly leaves two choices undecided: **University Email Verification** and **Dispute Handling**.

*   **Product Analyst:** Preserves both as "Open Questions" with provisional recommendations. **PASS.**
*   **QA Critic:** Preserves both as "Open Questions." **PASS.**
*   **Technical Planner:** Preserves both under "OPEN QUESTIONS" but introduces a third undecided item (Contact Method) while silently deciding the technical implementation for the first two in the "Implementation Steps" section. **FLAG:** While labeled open, the 24-hour sprint plan *executes* specific choices (e.g., "Require university email domain check") before user sign-off. This risks building the wrong feature if the user chooses "any email."

### 2. Conflicts & Unsupported Assumptions

| Agent | Claim | Effect | Minimal Resolution (PROPOSAL) |
| :--- | :--- | :--- | :--- |
| **Technical Planner** | "Require university email domain check... at signup" in Step 2. | Silently decides the verification method. If user chooses "no verification," this code is waste. | **PROPOSAL:** Make domain check a config flag, not hardcoded logic, pending user decision. |
| **Product Analyst** | "Secondary: Instructors or department admins... if they curate lists." | Brief only mentions students. Adding admin curation expands scope beyond "one developer" capacity. | **PROPOSAL:** Remove admin/instructor roles from v1 scope to protect the 1-day timeline. |
| **QA Critic** | "If email verification is *not* required, assume *no* verification for v1." | Contradicts the brief's ambiguity. The brief says "have not decided," not "assume no." | **PROPOSAL:** Do not assume a default. Keep as Open Question until user confirms. |
| **Technical Planner** | "Shared email/phone number revealed upon handover request acceptance." | Brief does not explicitly require phone numbers. This increases privacy burden without user consent. | **PROPOSAL:** Default to email-only reveal unless user explicitly requests phone field. |
| **Product Analyst** | "Trust Model: Users will trust each other based on profile name and email domain (even if unverified)." | Assumes trust without defining the dispute mechanism, which is undecided. | **PROPOSAL:** Link this assumption directly to the Dispute Open Question; if disputes are handled by "Student Union," trust model changes. |

### 3. Privacy & Ownership Check
*   **Privacy:** **Technical Planner** proposes revealing **phone numbers**. The brief does not mandate phone contact. **PROPOSAL:** Default to email-only or in-app chat to avoid mandatory PII disclosure.
*   **Ownership:** **Technical Planner** suggests a "Report User" button emailing a "static support address." The brief notes a support link is **not** a named dispute owner. **PROPOSAL:** Explicitly state that the support email is a *log*, not an *arbitrator*, until a human owner is named.

### 4. Acceptance Checks
1.  **Verification:** Does the signup flow match the user’s final decision on email verification? (Currently undecided).
2.  **Disputes:** Is there a named human or process for disputes? (Currently undecided; "support link" is insufficient).
3.  **Privacy:** Are phone numbers optional? (Technical Planner currently makes them part of the flow).
4.  **Scope:** Are admin/instructor roles removed from the build list? (Product Analyst currently includes them).
5.  **Payment:** Is there zero payment gateway code in the v1 repo? (All drafts agree, but verify no "Pay" button UI remains).

### Summary Recommendation
The **Technical Planner** is most at risk for scope creep and silent decisions. The **Product Analyst** introduces unnecessary roles. The **QA Critic** is safest but needs to stop assuming defaults for undecided items.

**Immediate Action:** User must confirm:
1.  Verification: Domain check vs. Any email?
2.  Disputes: Who is the accountable human?
3.  Contact: Email only or Phone allowed?

## Runtime timeline

- 2026-10-30T09:32:59.845Z · team · brief.submitted: Brief published to all three agents; independent drafts begin concurrently.
- 2026-10-30T09:32:59.845Z · product · agent.started: Product Analyst started an independent draft.
- 2026-10-30T09:32:59.848Z · qa · agent.started: QA Critic started an independent draft.
- 2026-10-30T09:32:59.848Z · architect · agent.started: Technical Planner started an independent draft.
- 2026-10-30T09:32:59.849Z · product · inference.started: Product Analyst model request started. (loop 9b032f91-2426-4d07-a99b-4cff74941ecd)
- 2026-10-30T09:32:59.859Z · qa · inference.started: QA Critic model request started. (loop 05cb1101-75ef-499a-af6d-71e4e61947ff)
- 2026-10-30T09:32:59.860Z · architect · inference.started: Technical Planner model request started. (loop 27884201-f950-4aea-80d3-36ed65f33e3c)
- 2026-10-30T09:33:23.105Z · product · inference.completed: Product Analyst model request completed. (loop 9b032f91-2426-4d07-a99b-4cff74941ecd)
- 2026-10-30T09:33:23.105Z · product · model.answer: Product Analyst completed draft. (loop 9b032f91-2426-4d07-a99b-4cff74941ecd)
- 2026-10-30T09:33:51.558Z · qa · inference.completed: QA Critic model request completed. (loop 05cb1101-75ef-499a-af6d-71e4e61947ff)
- 2026-10-30T09:33:51.558Z · qa · model.answer: QA Critic completed draft. (loop 05cb1101-75ef-499a-af6d-71e4e61947ff)
- 2026-10-30T09:34:13.808Z · architect · inference.completed: Technical Planner model request completed. (loop 27884201-f950-4aea-80d3-36ed65f33e3c)
- 2026-10-30T09:34:13.808Z · architect · model.answer: Technical Planner completed draft. (loop 27884201-f950-4aea-80d3-36ed65f33e3c)
- 2026-10-30T09:34:13.808Z · qa · agent.started: QA Critic started the cross-agent review.
- 2026-10-30T09:34:13.809Z · qa · inference.started: QA Critic model request started. (loop 7ec78a01-f9da-4e70-9691-9ec07ebab748)
- 2026-10-30T09:35:53.955Z · qa · inference.completed: QA Critic model request completed. (loop 7ec78a01-f9da-4e70-9691-9ec07ebab748)
- 2026-10-30T09:35:53.955Z · qa · model.answer: QA Critic completed review. (loop 7ec78a01-f9da-4e70-9691-9ec07ebab748)
- 2026-10-30T09:35:53.955Z · product · agent.started: Product Analyst started the revised specification.
- 2026-10-30T09:35:53.956Z · product · inference.started: Product Analyst model request started. (loop 1205c1e1-d6a3-47f8-9cf4-8952a6ad0bd1)
- 2026-10-30T09:36:57.990Z · product · inference.completed: Product Analyst model request completed. (loop 1205c1e1-d6a3-47f8-9cf4-8952a6ad0bd1)
- 2026-10-30T09:36:57.991Z · product · model.answer: Product Analyst completed final. (loop 1205c1e1-d6a3-47f8-9cf4-8952a6ad0bd1)
- 2026-10-30T09:36:57.992Z · team · run.completed: Final specification ready. Original drafts and review remain available for inspection.
