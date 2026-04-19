# Reservation Instructions

- Before changing facility, equipment, or reservation features, read `doc/spec/ferms-spec.md`, `doc/dev-plan/phase3-reservation-user-flow.md`, and when relevant `doc/dev-plan/phase4-admin-and-operations.md`.
- Keep duplicate booking prevention on the backend.
- Reject bookings for inactive facilities or inactive equipment.
- Ensure start/end datetime validation is enforced on the backend.
- Keep user-facing reservation flow and admin reservation flow consistent with the spec.
- Prefer Nuxt data-fetching conventions (`useFetch`, `useAsyncData`, `$fetch`) and NestJS module boundaries.
