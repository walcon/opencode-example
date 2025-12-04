# Example: stripe-sync (Integration Skill)

A fictional Stripe data synchronization skill demonstrating the **Integration Archetype**.

This example includes `<!-- WHY: ... -->` annotations explaining design decisions.

---

```markdown
---
name: stripe-sync
description: >
  Synchronize customer and subscription data with Stripe. Use when:
  (1) Fetching customer details, (2) Syncing subscription status,
  (3) Processing webhook events, (4) Reconciling billing data.
---
<!-- WHY: Integration skills focus on external service interaction.
     The description emphasizes data operations, not Stripe basics. -->

# Stripe Sync

Synchronize customer and subscription data between your application and Stripe.

<!-- WHY: One line explaining the purpose. No explaining what Stripe is. -->

## Setup

### Prerequisites

- Stripe account with API access
- API keys from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | Yes | Secret key (starts with `sk_`) |
| `STRIPE_WEBHOOK_SECRET` | For webhooks | Webhook signing secret (starts with `whsec_`) |
| `DATABASE_URL` | Yes | Your application database |

<!-- WHY: Setup is prominent in integration skills. Users can't do anything
     without proper authentication. Table format for quick scanning. -->

### Verification

Test your connection:

```bash
npx tsx scripts/verify.ts
```

Expected output:
```
✓ Stripe API: connected (test mode)
✓ Database: connected
✓ Account: Acme Inc (acct_xxx)
```

<!-- WHY: Verification step with expected output. Users should confirm
     setup works before attempting operations. -->

---

## Quick Reference

| Operation | Command |
|-----------|---------|
| Get customer | `npx tsx scripts/customer.ts get <id>` |
| Sync customer | `npx tsx scripts/customer.ts sync <id>` |
| List subscriptions | `npx tsx scripts/subscription.ts list <customer_id>` |
| Sync subscription | `npx tsx scripts/subscription.ts sync <id>` |
| Process webhook | `npx tsx scripts/webhook.ts <event_id>` |
| Full reconcile | `npx tsx scripts/reconcile.ts` |

<!-- WHY: Tool Collection pattern within Integration. Quick reference
     at the top lets users find what they need fast. -->

---

## Customer Operations

### Get Customer

Fetch customer details from Stripe:

```bash
npx tsx scripts/customer.ts get <customer_id>
```

**Example:**
```bash
npx tsx scripts/customer.ts get cus_ABC123
```

**Output:**
```json
{
  "id": "cus_ABC123",
  "email": "user@example.com",
  "name": "Jane Doe",
  "created": "2024-01-15T10:30:00Z",
  "subscriptions": ["sub_XYZ789"],
  "defaultPaymentMethod": "pm_xxx"
}
```

<!-- WHY: Show exact command, example with realistic ID format,
     and expected output structure. No ambiguity. -->

### Sync Customer

Sync customer data from Stripe to your database:

```bash
npx tsx scripts/customer.ts sync <customer_id>
```

This:
1. Fetches customer from Stripe
2. Updates local database record
3. Syncs associated subscriptions
4. Returns sync summary

**Output:**
```json
{
  "customer": "cus_ABC123",
  "status": "synced",
  "subscriptions_synced": 2,
  "last_synced": "2024-01-15T10:35:00Z"
}
```

<!-- WHY: Numbered list explains what the operation does.
     Output format is explicit. -->

### Sync All Customers

For bulk synchronization:

```bash
npx tsx scripts/customer.ts sync-all [--since <date>]
```

**Options:**
- `--since` - Only sync customers modified after this date (ISO 8601)
- `--limit` - Maximum customers to process (default: 100)
- `--dry-run` - Preview without writing to database

**Example:**
```bash
npx tsx scripts/customer.ts sync-all --since 2024-01-01 --limit 50
```

<!-- WHY: Bulk operations need options for control.
     --dry-run is essential for integration skills. -->

---

## Subscription Operations

### List Subscriptions

List all subscriptions for a customer:

```bash
npx tsx scripts/subscription.ts list <customer_id>
```

**Output:**
```json
{
  "customer": "cus_ABC123",
  "subscriptions": [
    {
      "id": "sub_XYZ789",
      "status": "active",
      "plan": "pro_monthly",
      "current_period_end": "2024-02-15T10:30:00Z"
    }
  ]
}
```

### Sync Subscription

Sync a specific subscription:

```bash
npx tsx scripts/subscription.ts sync <subscription_id>
```

### Subscription Status Reference

| Status | Meaning | Action |
|--------|---------|--------|
| `active` | Paid and current | None |
| `past_due` | Payment failed | Retry or notify user |
| `canceled` | User canceled | Update access |
| `unpaid` | Multiple failures | Restrict access |
| `trialing` | In trial period | None |

<!-- WHY: Status reference table. Integration skills often need
     to explain external service concepts that affect behavior. -->

---

## Webhook Processing

### Process Single Event

Reprocess a specific webhook event:

```bash
npx tsx scripts/webhook.ts <event_id>
```

**Example:**
```bash
npx tsx scripts/webhook.ts evt_ABC123
```

This fetches the event from Stripe and processes it as if it just arrived.

<!-- WHY: Webhook reprocessing is common for debugging.
     Clear explanation of what "process" means. -->

### Supported Event Types

| Event | Handler |
|-------|---------|
| `customer.created` | Creates local customer record |
| `customer.updated` | Updates local customer record |
| `customer.subscription.created` | Creates subscription record |
| `customer.subscription.updated` | Updates subscription status |
| `customer.subscription.deleted` | Marks subscription canceled |
| `invoice.paid` | Records payment, extends access |
| `invoice.payment_failed` | Logs failure, triggers notification |

<!-- WHY: Event mapping table. Users need to know what's handled
     without reading code. -->

### Unhandled Events

Events not in the table above are logged but not processed. To add handling for new event types, see `references/webhook-handlers.md`.

---

## Reconciliation

### Full Reconcile

Compare local data with Stripe and fix discrepancies:

```bash
npx tsx scripts/reconcile.ts [--fix]
```

**Modes:**
- Without `--fix`: Report-only (safe)
- With `--fix`: Automatically correct discrepancies

**Report output:**
```
Reconciliation Report
=====================
Customers checked: 1,234
Subscriptions checked: 2,456

Discrepancies found:
  - cus_ABC123: email mismatch (local: old@x.com, stripe: new@x.com)
  - sub_XYZ789: status mismatch (local: active, stripe: canceled)

Run with --fix to correct these issues.
```

<!-- WHY: Reconciliation is critical for integrations. Report-only mode
     by default is safer. Shows exactly what discrepancies look like. -->

---

## Error Handling

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid API Key` | Wrong or missing key | Check `STRIPE_SECRET_KEY` is set |
| `API key expired` | Key was rolled | Get new key from dashboard |

### Rate Limiting

Stripe limits: 100 requests/second (test), 100 requests/second (live).

The scripts automatically:
- Retry with exponential backoff on 429 errors
- Log rate limit warnings

For bulk operations, use `--delay 100` to add 100ms between requests.

### Common API Errors

| Error | Meaning | Solution |
|-------|---------|----------|
| `No such customer` | Customer ID invalid | Verify ID format: `cus_xxx` |
| `No such subscription` | Subscription not found | Check if canceled/deleted |
| `Card declined` | Payment failed | Not an integration error |

<!-- WHY: Error handling section with tables. Integration skills must
     handle external service errors clearly. -->

---

## References

For detailed API documentation:
- `references/stripe-api.md` - Stripe API reference
- `references/webhook-handlers.md` - Adding new event handlers
- `references/data-model.md` - Local database schema

<!-- WHY: References for deep dives. Main SKILL.md stays focused
     on operations, details live in references. -->
```

---

## Key Takeaways

1. **Setup is prominent** - Can't use integration without auth
2. **Quick reference table** - All operations visible at once
3. **Realistic examples** - Uses actual Stripe ID formats (`cus_`, `sub_`, `evt_`)
4. **Output structures shown** - Claude knows what to expect
5. **Error handling by category** - Auth, rate limits, API errors
6. **Status/event mappings** - External concepts are documented
7. **Safe defaults** - Reconcile is report-only without `--fix`
