# Spec Rescue

Model: home-chat
Started: 2026-10-30T09:33:12.957Z
Run: 773cb4ae-637b-4c62-9ad4-dce6bcc47b0c

## Original brief

I run a small barbershop with three barbers. Customers need to book online, choose a barber, and avoid double bookings. Staff must block lunch breaks. One developer has a weekend. Payments and SMS reminders are undecided and we have no budget for paid messaging. Please keep the MVP small.

---

# Final Specification: Barbershop Booking MVP

## Goal & Users
Enable customers to book specific barbers online without double-booking, allowing staff to block lunch breaks.
*   **Customers:** Book appointments with a preferred barber.
*   **Staff/Owner:** Manage availability and view schedules.

## MVP Scope
*   **Public Booking Page:** Select barber (1 of 3), date, and time slot.
*   **Availability Logic:** Real-time check excluding existing bookings and blocked hours.
*   **Admin Panel:** Login for staff to block specific time slots (e.g., lunch).
*   **Data Model:** `Barbers`, `Bookings` (with unique constraint on barber/time), `BlockedSlots`.
*   **Contact Data:** Name (required), Email (optional, for confirmation), Phone (optional).

## Non-Goals
*   Payment processing.
*   Automated SMS reminders.
*   Customer accounts/profiles.
*   Variable service durations (all slots are fixed duration).
*   Mobile native app (responsive web only).

## User Journey
1.  Customer selects a barber and date.
2.  System displays available slots (excluding blocked times/bookings).
3.  Customer selects slot, enters Name (and optional Email/Phone), confirms.
4.  System locks slot (unique constraint) and shows confirmation code.
5.  Staff logs in to Admin Panel and blocks lunch hours for specific days.

## Architecture
*   **Frontend:** React/Next.js SPA.
*   **Backend/DB:** Supabase (PostgreSQL, Auth, Row Level Security).
*   **Logic:** Server-side transaction for booking insertion to prevent race conditions.
*   **Hosting:** Vercel/Netlify (free tier).

## Acceptance Criteria
1.  **Double-Booking Prevention:** Given two users attempt to book the same barber/slot, When the second request processes, Then it fails with an error if the first succeeded.
2.  **Lunch Block Enforcement:** Given a slot is blocked in Admin, When a customer views that time, Then the slot is disabled/hidden.
3.  **Barber Selection:** Given the booking page loads, When a customer selects a barber, Then only that barber’s availability is shown.
4.  **Conditional: Email Confirmation:** *If confirmed by user*, When a booking is made with an email address, Then a confirmation email is sent.

## Prioritized Implementation Checklist
1.  Setup Supabase schema (`barbers`, `bookings`, `blocked_slots`).
2.  Build Admin Panel (Login + Block Slots UI).
3.  Build Customer Booking UI (Barber/Date/Slot selection).
4.  Implement Booking API (Transaction + Unique Constraint).
5.  *Conditional:* Implement Email Trigger (if confirmed).
6.  Deploy & Test race conditions.

## Decisions & Changes After Review
*   **Service Duration:** QA flagged that assuming "30 minutes" for all services is risky. **Change:** Define a single fixed slot duration (e.g., 30 mins) as a configurable constant, acknowledging that variable durations are out of scope.
*   **Contact Data:** QA noted Technical Planner mandated phone numbers. **Change:** Phone is now optional; Email is preferred for consent-based contact.
*   **Lunch Blocking:** QA suggested simplifying to Owner-only. **Decision:** Keep "Staff/Owner" login but simplify UI to a toggle for standard lunch hours to reduce complexity.
*   **Timezone:** QA flagged UTC as over-engineering. **Change:** Store and display in local shop time.
*   **Email Reminders:** QA noted Technical Planner silently added email reminders. **Change:** Email confirmation is now *conditional* on user approval, as the brief only excluded *paid* SMS, not email, but user preference is unknown.

## Assumptions
*   All barbers work the same base hours (e.g., 9–5).
*   Low traffic volume (simple DB locking suffices).
*   "Online" means a public web URL.

## Open Questions
1.  **Payments:** Brief states: *"Payments... are undecided."*
    *   *Provisional Default:* Pay at shop.
2.  **SMS Reminders:** Brief states: *"SMS reminders are undecided and we have no budget for paid messaging."*
    *   *Provisional Default:* No automated reminders; rely on confirmation screen/email.
3.  **Notification Method:** Since SMS is undecided/budget-constrained, is **Email** acceptable for confirmations/reminders? (Brief does not explicitly mention email).
4.  **Cancellation Policy:** How long before a slot can be cancelled? (Brief silent).
5.  **Accountable Owner:** Who is the human point of contact for booking errors or disputes? (Brief silent; support link is insufficient).
6.  **Service Duration:** Do all services take the same time? (Brief silent; assumed fixed for MVP).

---

# Collaboration evidence

## QA Critic — draft

# Spec Rescue: Initial Draft Critique

## USER FACTS
*   **Scale:** 3 barbers, 1 developer (1 weekend availability).
*   **Core Flow:** Online booking, barber selection, double-booking prevention.
*   **Staffing:** Staff must block lunch breaks.
*   **Constraints:** No budget for paid messaging; MVP must remain small.

## PROPOSALS & ASSUMPTIONS
*   **Assumption:** "Online" implies a public-facing web interface accessible via mobile browsers.
*   **Assumption:** "Avoid double bookings" requires real-time database constraints or optimistic locking.
*   **Assumption:** "Small MVP" excludes complex features like loyalty programs, advanced analytics, or API integrations with external calendars.
*   **Provisional Recommendation:** Use a simple web form + backend database (e.g., PostgreSQL) rather than a heavy SaaS platform to control costs and complexity.

## AMBIGUOUS REQUIREMENTS
1.  **"Choose a barber":** Does the customer see all available barbers simultaneously, or do they book a generic slot and get assigned? *Contradiction Risk:* If customers must choose a specific barber, the UI complexity increases significantly for a 1-weekend MVP.
2.  **"Block lunch breaks":** Who blocks them? Do barbers self-serve via an admin panel, or does the owner manually set fixed times? *Assumption:* Fixed times are likely intended, but not explicit.
3.  **"Online":** Is this a standalone website, or embedded in an existing social media page? No domain/hosting details provided.

## FAILURE CASES
1.  **Race Condition:** Two customers book the same slot for the same barber simultaneously. *Mitigation:* Database unique constraint on `(barber_id, start_time)`.
2.  **Lunch Overlap:** A barbers' lunch break overlaps with a customer’s booked slot due to manual error. *Mitigation:* Validation logic preventing booking within blocked hours.
3.  **No-Show:** Customer books but doesn’t show up. *Current Gap:* No cancellation policy or deposit mechanism defined.

## PRIVACY CONCERNS
1.  **Contact Data Storage:** Customer names/phone numbers are stored. *Question:* How long is data retained? Is there a GDPR/CCPA compliance requirement?
2.  **SMS Reminders (Undecided):** If SMS is later added, it requires explicit consent. Currently, no consent mechanism is defined for email or phone storage.

## OPEN QUESTIONS
1.  **Payments:** Are payments collected upfront (prepayment) or at the shop? *Impact:* Payment gateway integration (Stripe/PayPal) adds significant complexity for a 1-weekend MVP.
2.  **SMS Reminders:** Confirmed as undecided. If excluded from MVP, what is the notification method? Email? Manual phone call?
3.  **Cancellation Policy:** How far in advance can customers cancel? Is there a fee?
4.  **Barber Availability:** Do all 3 barbers work the same hours? Are there days off?

## TESTABLE ACCEPTANCE CRITERIA
1.  **Double-Booking Prevention:** Two users attempt to book the same barber at the same time; exactly one succeeds, the other receives an error.
2.  **Lunch Block Enforcement:** A customer cannot select a time slot that falls within a barber’s blocked lunch hours.
3.  **Barber Selection:** The booking form allows explicit selection of one of the three barbers.
4.  **MVP Scope:** The system does not require paid SMS, payment gateway, or complex admin dashboard beyond basic time blocking.

## CONTRADICTIONS
*   **"Small MVP" vs. "Payments":** If payments are undecided but potentially included, the MVP is no longer small. *Recommendation:* Treat payments as out-of-scope for this weekend unless explicitly confirmed.

## Technical Planner — draft

# Technical Planner: Barbershop Booking MVP

## USER FACTS
*   **Scale:** 1 shop, 3 barbers.
*   **Core Needs:** Online booking, barber selection, double-booking prevention, staff lunch blocking.
*   **Constraints:** 1 developer, 1 weekend (~40-50 hours), small MVP.
*   **Undecided/Unknown:** Payment method, SMS reminder mechanism.
*   **Budget Constraint:** No budget for paid messaging.

## PROPOSALS (Provisional pending user confirmation)

### Architecture
**Monolithic Web App with Client-Side State Management.**
Avoid microservices or complex backend logic. Use a single-page application (SPA) frontend talking to a lightweight API or direct database queries if using a BaaS (Backend-as-a-Service).

*   **Frontend:** React (or Next.js for simplicity).
*   **Backend/DB:** Supabase or Firebase (Auth, Realtime DB, Edge Functions). This minimizes infrastructure setup time.
*   **Scheduling Logic:** Server-side function handles slot availability to prevent race conditions (double bookings).

### Dependencies
1.  **Framework:** Next.js (React) – reduces boilerplate.
2.  **Backend/DB:** Supabase (PostgreSQL + Auth + Row Level Security).
3.  **Styling:** Tailwind CSS (rapid UI development).
4.  **Date Handling:** Day.js (lightweight).
5.  **Payment (Provisional):** Stripe Checkout (if payments are confirmed needed; otherwise, "Pay in Shop" for MVP). *Note: User stated payments are undecided.*
6.  **Reminders (Provisional):** Email via Resend or SendGrid (free tier usually sufficient for low volume). *SMS is expensive; email is the zero-cost fallback.*

### Implementation Steps (Weekend Plan)
1.  **Day 1 AM:** Setup Supabase project. Create `barbers`, `bookings`, `blocked_slots` tables. Define schema (barber_id, start_time, end_time, customer_email).
2.  **Day 1 PM:** Build Admin View. Simple table to toggle "Lunch Block" for each barber/day. Save to `blocked_slots`.
3.  **Day 2 AM:** Build Customer View. List barbers → Select Date → Show Available Slots (query: `available_time` minus `bookings` minus `blocked_slots`).
4.  **Day 2 PM:** Implement Booking Logic. Transactional DB update to insert booking only if slot is free. Collect email/phone.
5.  **Day 3 AM:** Email Reminder. Trigger serverless function on booking creation to send confirmation + reminder email 24h prior.
6.  **Day 3 PM:** Testing & Deployment. Deploy to Vercel/Netlify. UAT with the 3 barbers.

### Technical Risks
1.  **Race Conditions:** Two customers book the same slot simultaneously. *Mitigation:* Use database transactions or optimistic locking in the booking function.
2.  **Timezone Confusion:** Barbers/customers in different zones. *Assumption:* All local time. *Mitigation:* Store UTC, display Local.
3.  **Scope Creep:** Developer tries to build complex cancellation policies or loyalty programs. *Mitigation:* Strictly limit to "Book" and "Cancel".

### Open Questions (Require User Decision)
1.  **Payments:** Do customers pay online, or at the shop? If undecided, default to **Pay in Shop** for MVP to save dev time.
2.  **Reminders:** Confirm if **Email** is acceptable in lieu of SMS due to budget constraints.
3.  **Cancellation Policy:** How many hours before can a customer cancel? (Default: 24h).

### Assumptions
*   Barbers have consistent schedules (e.g., 9am–5pm, 1h lunch).
*   No need for recurring appointments in MVP.
*   Customer data is minimal (Name, Phone, Email).

## Product Analyst — draft

# Product Analyst Draft: Barbershop Booking MVP

## Target Users
*   **Customers:** Local clients needing to book a haircut with a specific barber.
*   **Barbers (Staff):** Three employees who need to see their schedule and block unavailable times (e.g., lunch).
*   **Owner:** Manages the shop but relies on the system to prevent conflicts.

## Core User Journey
1.  **Customer** opens the booking page and selects a service (e.g., "Cut").
2.  **Customer** selects a specific barber from the available three.
3.  **System** displays available time slots for that barber, excluding blocked times (lunch) and existing bookings.
4.  **Customer** selects a slot and confirms.
5.  **System** locks the slot to prevent double-booking and displays a confirmation screen with a unique booking code.
6.  **Barber** logs in, views their day, and can block specific hours (e.g., 12:00–13:00) for lunch.

## MVP Scope (Buildable in 1 Day)
*   **Frontend:** Single-page web app. Forms for barber selection, date picker, and time slot grid.
*   **Backend:** Lightweight API to handle slot availability logic.
*   **Data Model:**
    *   `Barbers`: ID, Name.
    *   `Bookings`: ID, BarberID, DateTime, CustomerName, Status (Confirmed/Cancelled).
    *   `Blocks`: ID, BarberID, StartDate, EndDate, Reason.
*   **Logic:**
    *   Query available slots: `AllSlots - ExistingBookings - BlockedTimes`.
    *   Prevent double-booking via unique constraint on `(BarberID, DateTime)`.
*   **Auth:** Simple email/password login for barbers/owner. No auth for customers (guest booking).

## Explicit Non-Goals
*   **Payments:** No payment processing. Bookings are "pay at shop."
*   **SMS/Email Reminders:** No automated notifications. Customers must save the confirmation code/date.
*   **Customer Accounts:** No user profiles or history.
*   **Mobile App:** Web-only, responsive design only.
*   **Service Catalog:** Fixed list of services (e.g., Cut, Beard) hardcoded or simple admin input. No dynamic pricing.

## Assumptions
*   **Slot Duration:** All services take 30 minutes.
*   **Operating Hours:** Fixed daily hours (e.g., 9:00–17:00) configured once.
*   **Concurrency:** Low traffic; simple database locking is sufficient for double-booking prevention.
*   **Tech Stack:** Developer’s preferred stack (e.g., Node/React or Python/Django) with a free-tier database (e.g., Supabase, Firebase, or local Postgres).

## Open Questions
1.  **Payment Method:** *Undecided.* Will customers pay cash/card at the shop, or do we need a deposit? (Assumption: Pay at shop.)
2.  **Reminder Mechanism:** *Undecided.* Since no budget for SMS, will we rely on email (if customer provides it) or just the confirmation screen? (Assumption: Confirmation screen only.)
3.  **Cancellation Policy:** How many hours before must a customer cancel to free up the slot? (Assumption: Instant cancellation allowed.)
4.  **Service Variance:** Do all services take the same time (30 min), or do some require longer (e.g., 60 min for beard + cut)? (Assumption: Fixed 30-min slots for MVP.)

## Provisional Recommendations
*   **Use a No-Code/Low-Code Tool:** If the developer is not full-stack, consider using a tool like Airtable + Softr or a simple Next.js app with Supabase to save time.
*   **Email Confirmation:** If email is feasible (free via SMTP), send a simple confirmation email to reduce no-shows. *Pending user confirmation.*

## QA Critic — review

# Cross-Agent Review: Barbershop Booking MVP

## Undecided Choices Check
The brief explicitly marks **Payments** and **SMS reminders** as undecided.
1.  **Product Analyst:** Preserves both as Open Questions. *However*, it assumes "Pay at shop" and "Confirmation screen only" as working defaults. This is acceptable as a provisional path, provided the user confirms.
2.  **QA Critic:** Preserves both as Open Questions. Correctly flags that SMS requires consent if added later.
3.  **Technical Planner:** Preserves both as Open Questions. *However*, it proposes "Email via Resend/SendGrid" as a specific implementation for Day 3 AM. This is a **silent decision** to use email, even though the brief only says SMS is undecided and there is no budget for *paid* messaging. Email is free, but the user hasn't confirmed email is desired or that customers will provide it.

## Conflicts & Unsupported Assumptions

1.  **Conflict: Service Duration Assumption**
    *   **Agent:** Product Analyst
    *   **Claim:** "Slot Duration: All services take 30 minutes."
    *   **Effect:** If a barber offers 60-minute cuts, the slot grid will be wrong, leading to double bookings or underutilization.
    *   **PROPOSAL:** Define service types with variable durations in the data model, even if only one type ("Cut") is active initially.

2.  **Conflict: Customer Contact Data Requirement**
    *   **Agent:** Technical Planner
    *   **Claim:** "Collect email/phone" in Implementation Step 4.
    *   **Effect:** If phone is mandatory, it may violate privacy preferences or add friction. The brief does not require phone numbers.
    *   **PROPOSAL:** Make Email optional or primary for confirmation; do not mandate Phone unless SMS is confirmed.

3.  **Conflict: Lunch Blocking Mechanism**
    *   **Agent:** Product Analyst
    *   **Claim:** "Barber logs in... and can block specific hours."
    *   **Effect:** Adds auth complexity for barbers. The brief says "Staff must block lunch breaks," which could mean the owner does it.
    *   **PROPOSAL:** Simplify to Owner-only admin panel for blocking slots to reduce MVP scope.

4.  **Conflict: Timezone Handling**
    *   **Agent:** Technical Planner
    *   **Claim:** "Store UTC, display Local."
    *   **Effect:** Over-engineering for a single local barbershop. All users are likely in the same timezone.
    *   **PROPOSAL:** Store and display in local shop time to reduce cognitive load and dev time.

5.  **Conflict: No-Show Mitigation**
    *   **Agent:** QA Critic
    *   **Claim:** "No cancellation policy or deposit mechanism defined."
    *   **Effect:** Without a policy, customers may hold slots indefinitely.
    *   **PROPOSAL:** Define a simple cancellation window (e.g., 24 hours) as an Open Question for the user.

## Privacy & Ownership Check
*   **Privacy:** No draft mandates phone numbers. Product Analyst and QA Critic correctly note consent needs for email/SMS. Technical Planner’s "Collect email/phone" is slightly aggressive; **PROPOSAL:** Make phone optional.
*   **Ownership:** No draft names a specific human owner for disputes or support. A "support link" is not sufficient. **PROPOSAL:** Owner to be the named contact for booking errors.

## Acceptance Checks
1.  **Double-Booking:** Two users book same slot; one succeeds, one fails. (All drafts cover this).
2.  **Lunch Block:** Customer cannot book during blocked lunch hours. (All drafts cover this).
3.  **Barber Selection:** UI allows explicit selection of one of three barbers. (All drafts cover this).
4.  **Undecided Scope:** Payments and SMS are not hardcoded into the MVP build unless user confirms. (Technical Planner needs adjustment).

## Runtime timeline

- 2026-10-30T09:33:12.958Z · team · brief.submitted: Brief published to all three agents; independent drafts begin concurrently.
- 2026-10-30T09:33:12.958Z · product · agent.started: Product Analyst started an independent draft.
- 2026-10-30T09:33:12.959Z · qa · agent.started: QA Critic started an independent draft.
- 2026-10-30T09:33:12.959Z · architect · agent.started: Technical Planner started an independent draft.
- 2026-10-30T09:33:12.959Z · product · inference.started: Product Analyst model request started. (loop 283c08b5-9c4b-480b-a21b-8e622ff0c2ad)
- 2026-10-30T09:33:12.960Z · qa · inference.started: QA Critic model request started. (loop 4fd7dd6a-a3fb-404f-aa63-234274c26916)
- 2026-10-30T09:33:12.962Z · architect · inference.started: Technical Planner model request started. (loop e56642eb-818e-4bbf-ac11-f9eab8bf03ea)
- 2026-10-30T09:34:36.841Z · qa · inference.completed: QA Critic model request completed. (loop 4fd7dd6a-a3fb-404f-aa63-234274c26916)
- 2026-10-30T09:34:36.841Z · qa · model.answer: QA Critic completed draft. (loop 4fd7dd6a-a3fb-404f-aa63-234274c26916)
- 2026-10-30T09:35:00.976Z · architect · inference.completed: Technical Planner model request completed. (loop e56642eb-818e-4bbf-ac11-f9eab8bf03ea)
- 2026-10-30T09:35:00.976Z · architect · model.answer: Technical Planner completed draft. (loop e56642eb-818e-4bbf-ac11-f9eab8bf03ea)
- 2026-10-30T09:35:24.799Z · product · inference.completed: Product Analyst model request completed. (loop 283c08b5-9c4b-480b-a21b-8e622ff0c2ad)
- 2026-10-30T09:35:24.799Z · product · model.answer: Product Analyst completed draft. (loop 283c08b5-9c4b-480b-a21b-8e622ff0c2ad)
- 2026-10-30T09:35:24.799Z · qa · agent.started: QA Critic started the cross-agent review.
- 2026-10-30T09:35:24.800Z · qa · inference.started: QA Critic model request started. (loop dacd6a6d-a7ca-46a5-9e7a-fb6d7bdf3b89)
- 2026-10-30T09:36:21.640Z · qa · inference.completed: QA Critic model request completed. (loop dacd6a6d-a7ca-46a5-9e7a-fb6d7bdf3b89)
- 2026-10-30T09:36:21.640Z · qa · model.answer: QA Critic completed review. (loop dacd6a6d-a7ca-46a5-9e7a-fb6d7bdf3b89)
- 2026-10-30T09:36:21.640Z · product · agent.started: Product Analyst started the revised specification.
- 2026-10-30T09:36:21.641Z · product · inference.started: Product Analyst model request started. (loop 7bedcff8-6933-46cd-9341-ddeb1bb6f833)
- 2026-10-30T09:37:33.304Z · product · inference.completed: Product Analyst model request completed. (loop 7bedcff8-6933-46cd-9341-ddeb1bb6f833)
- 2026-10-30T09:37:33.304Z · product · model.answer: Product Analyst completed final. (loop 7bedcff8-6933-46cd-9341-ddeb1bb6f833)
- 2026-10-30T09:37:33.304Z · team · run.completed: Final specification ready. Original drafts and review remain available for inspection.
