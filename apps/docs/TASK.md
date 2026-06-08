# AI Study Hub - Next Tasks

Updated: 2026-06-08

## Current Position

The project is currently in **Phase 3 completion / Phase 4 readiness**.

- API auth/account/subject/document metadata is mostly implemented.
- Web and Mobile still have several mock/template screens.
- Dedicated moderation approve/reject endpoints are not implemented.
- File upload/download and AI/RAG phases are not ready to start yet.

## Priority 0 - Spec and Contract Cleanup

- [x] Update `apps/docs/SPEC.md` to match the current codebase.
- [x] Decide and document the Web auth token strategy: use hybrid cookie access-token behavior with refresh token stored client-side for refresh requests.
- [x] Decide Admin account update/delete contract: Admin can create/list/detail/ban accounts for MVP. `PATCH /accounts/:id` and `DELETE /accounts/:id` remain user self-service routes.
- [x] Decide document visibility/status transition: private -> public should move to `PENDING` and require review.

## Priority 1 - Finish Phase 3 Product Integration

- [ ] Implement document publication transition: changing a private document to public should set status to `PENDING`.
- [ ] Web public library: ensure all visible document lists/details use real `GET /documents` and `GET /documents/:id`.
- [ ] Web My Documents: replace local mock data with `GET /documents/me`.
- [ ] Web document upload: submit metadata through `POST /documents`.
- [ ] Web document edit/delete: call `PATCH /documents/:id` and `DELETE /documents/:id`.
- [ ] Mobile documents: add list/detail/update/delete service methods for the current Documents API.
- [ ] Mobile documents: connect list/detail/upload screens to real services where backend support exists.
- [ ] Add focused Web/Mobile service tests for document API clients.

## Priority 2 - Implement Phase 4 Moderation Workflow

- [ ] Add backend endpoint to approve a pending document.
- [ ] Add backend endpoint to reject a pending document with `rejectionReason`.
- [ ] Restrict approve/reject actions to `MODERATOR` and `ADMIN`.
- [ ] On approve, set:
  - `status = ACTIVE`
  - `reviewedById`
  - `reviewedAt`
- [ ] On reject, set:
  - `status = REJECTED`
  - `reviewedById`
  - `reviewedAt`
  - `rejectionReason`
- [ ] Add tests for approve/reject success, forbidden users, invalid status transitions and visibility after approval/rejection.
- [ ] Connect Web Moderator documents list to `GET /documents?status=PENDING`.
- [ ] Connect Web Moderator detail page to `GET /documents/:id`.
- [ ] Connect Web Moderator approve/reject buttons to the new API endpoints.

## Priority 3 - Admin MVP Hardening

- [ ] Connect Admin Users page to `GET /accounts`.
- [ ] Connect Admin user detail/read action to `GET /accounts/:id`.
- [ ] Connect Admin ban action to `PATCH /accounts/:accountId/ban`.
- [ ] Implement or defer Admin create account UI using `POST /accounts`.
- [ ] Add or document Admin subject management workflow.
- [ ] Add tests for Admin API clients and critical UI states.

## Priority 4 - Auth Client Completion

- [ ] Align Web signin/refresh/logout with the chosen token strategy.
- [ ] Ensure Web verify-email token route posts `{ token }` to `/auth/verify-email`.
- [ ] Ensure Web resend verification uses `/auth/resend-verification-email` with the pending verification cookie/JWT.
- [ ] Mobile: add reset-password flow if product supports password reset from mobile links/codes.
- [ ] Mobile: add refresh-token flow and token persistence strategy.
- [ ] Add regression tests for Web auth helpers and Mobile auth service.

## Priority 5 - Prepare Phase 5 File Upload

Do not start full implementation until Phase 4 is complete.

- [ ] Choose storage provider and document required env variables.
- [ ] Decide supported MIME types and max file size.
- [ ] Add upload endpoint design:
  - multipart handling
  - auth requirements
  - storage response mapping
  - metadata creation
- [ ] Decide download endpoint behavior and permission checks.
- [ ] Decide whether `downloadCount` and/or `viewCount` belongs in `documents`.

## Priority 6 - Prepare AI/RAG Phases

Do not start implementation until file upload and document lifecycle are stable.

- [ ] Decide where extracted text is stored.
- [ ] Decide chunking and embedding strategy.
- [ ] Decide vector store/provider.
- [ ] Design summary/keywords persistence.
- [ ] Design chat session/message schema.
- [ ] Design quiz schema if quiz history should persist.
- [ ] Define duplicate detection threshold and moderator warning UX.

## Recommended Next Sprint

1. Implement Web auth token strategy alignment.
2. Connect Web My Documents to real API.
3. Implement backend moderation approve/reject endpoints with tests.
4. Connect Web Moderator list/detail/actions to real API.
5. Run focused API tests, Web typecheck, and Mobile typecheck.
