# WESSAAL group messaging provider — candidate build, not deployed

Base: upstream Evolution API 2.3.7, pinned by GitHub commit.
Changes are scoped to:
- Baileys from 7.0.0-rc.9 to EXACT 7.0.0-rc14 (lockfile included).
- getMessage returns undefined on missing/failed provider lookups. Never send a fake empty retry envelope.
- message-receipt.update from Baileys emits the already subscribed MESSAGES_UPDATE
  webhook for outbound group messages **only after an actual member receipt**.
  This emits SERVER_ACK, never DELIVERY_ACK or READ for the group as a whole.
- The outbound receipt webhook includes provider message ID and group JID, but
  excludes participant identity and message content.
- Regression: node --test tests/group-receipt-ack.test.mjs.

## Non-goals and release conditions
- This does not claim every group member got the WhatsApp message.
- No automatic retry of accepted group sends and no duplicate credit charging.
- Existing Evolution .env, auth sessions, PostgreSQL, Redis, group membership
  and webhook authentication must be preserved through cutover.
- Build/typecheck and QA staging acceptance are required **before production**.
- Authorize exactly one outbound test to a company-owned QA group, then check
  actual recipient handset, provider/receiver IDs, and one ledger charge.
- Record current image digest and Compose YAML backup; keep known-good image
  for immediate rollback. No Docker or Production operation is included here.
