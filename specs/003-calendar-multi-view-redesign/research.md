# Phase 0 Research: Calendar Multi-View Redesign

## Decision 1: View-mode state model
- Decision: Use a single calendar view-state model with `viewMode` (`week` | `month` | `day`), `anchorDate`, and `selectedDate` as first-class state.
- Rationale: A unified model avoids divergent navigation behavior between controls and supports deterministic transitions (week->month, week->day) required by E2E tests.
- Alternatives considered:
  - Separate local state per subview component: rejected due to synchronization risk and duplicated navigation logic.
  - URL-only state without in-memory synchronization: rejected for MVP due to higher implementation complexity for transient edit interactions.

## Decision 2: Event data loading for multi-day views
- Decision: Add a backend range-read contract (`GET /events/range?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD`) returning grouped day buckets, while preserving existing single-day endpoint behavior.
- Rationale: Week/month rendering requires many days at once; a range contract avoids bursty repeated daily requests and keeps backend as the source of ordering and validation truth.
- Alternatives considered:
  - Call existing day endpoint once per rendered date cell: rejected for chatty network behavior and harder loading/error handling.
  - Client-side prefetch cache with no backend contract change: rejected because cache invalidation and consistency become brittle after CRUD changes.

## Decision 3: Event visibility rules across views
- Decision: Define day buckets where every event for a day is discoverable in all views; month cells may summarize dense schedules but must provide direct access to full day detail.
- Rationale: Meets FR-005 and edge-case requirements without forcing unreadable month cells on mobile.
- Alternatives considered:
  - Hard cap with hidden overflow and no access path: rejected because it violates complete event discoverability.
  - Unlimited inline rendering in month cells: rejected for poor readability on smaller screens.

## Decision 4: Event detail/edit/delete interaction pattern
- Decision: Selecting an event opens a detail surface with explicit `Edit` and `Delete` actions; edit persists in place and delete requires confirmation.
- Rationale: Preserves current event lifecycle behavior while making action paths explicit and testable from any view.
- Alternatives considered:
  - Direct inline edit on calendar cells: rejected due to clutter and inconsistent behavior across week/month/day.
  - Separate dedicated edit page route: rejected for unnecessary navigation overhead in a single-page calendar workflow.

## Decision 5: Themed visual system alignment
- Decision: Create a tokenized visual theme (colors, typography, accent motifs) derived from `theme/example.png` and `theme/*.jpeg` direction, with intentional unicorn/soccer accents that do not block readability.
- Rationale: Satisfies FR-011 and keeps theme consistency across all views while maintaining accessibility and responsive clarity.
- Alternatives considered:
  - Pixel-match the reference images: rejected because requirement specifies stylistic alignment, not exact replication.
  - Keep existing neutral styling and only add icons: rejected as insufficient to meet redesign intent.

## Decision 6: Testing strategy for required flows
- Decision: Add/extend component tests for view switch controls, day selection behavior, day/event rendering, and event detail actions; add/extend Playwright scenarios for required transitions and week-view CRUD lifecycle.
- Rationale: Aligns directly with FR-013/FR-014 and constitution Principle III.
- Alternatives considered:
  - E2E-only coverage: rejected because component regressions become harder to localize.
  - Unit-only coverage: rejected because cross-layer regressions (frontend-backend integration) would be missed.

## Decision 7: Error handling and synchronization behavior
- Decision: After create/update/delete, refresh impacted day/range data in-place and keep users in current context; surface API errors inline without losing current calendar state.
- Rationale: Matches expected no-refresh UX and keeps behavior consistent with existing page error strategy.
- Alternatives considered:
  - Full page reload after every mutation: rejected as disruptive and contrary to spec outcomes.
  - Optimistic updates with delayed reconciliation only: rejected for MVP due to rollback complexity.
