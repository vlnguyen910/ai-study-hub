# Implementation Notes

## Scope Decisions

- Treat `SPEC.md` as the target product spec, not a snapshot of the current codebase.
- Keep Web and Mobile as parallel first-class clients.
- Keep AI-heavy work asynchronous through BullMQ queues.
- Keep OCR and realtime collaboration out of MVP scope.

## Contract Decisions

- Preserve legacy metadata-only document flows where practical.
- Introduce `POST /documents/upload` as the preferred file-upload contract.
- Keep metadata-only edits separate from file replacement.
- Use `visibility` and `reviewStatus` as separate lifecycle concepts.

## Lifecycle Decisions

- `PRIVATE -> PUBLIC` must trigger AI analysis and reset `reviewStatus` to `PENDING_REVIEW`.
- File replacement must also trigger re-review.
- Metadata-only edits must not re-open review.
- AI can assist with summary, quiz, semantic search, description, and moderator review, but it cannot make the final moderation decision.

## Queue Decisions

- Shared queue infrastructure should serve mail delivery and document processing.
- OWE-14 implements the shared queue layer with BullMQ instead of a custom Redis list queue because `ARCHITECTURE.md` already names BullMQ as the target queue worker and it gives retries, backoff, and job state without bespoke code.
- Auth verification and password-reset requests now rotate Redis tokens synchronously, then enqueue mail jobs; Nodemailer delivery happens in the mail worker so SMTP latency/failure is outside the request path after enqueue succeeds.
- The first mail worker runs in-process through `MailModule` to keep local development and deployment simple; it can be split into a dedicated worker process later without changing auth contracts.
- Document processing jobs should handle extraction, chunking, embeddings, and duplicate detection.
- Queue failures should not destroy saved metadata.
