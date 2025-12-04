# Example: deploy-buddy (Workflow Skill)

A fictional deployment assistant skill demonstrating the **Workflow Archetype**.

This example includes `<!-- WHY: ... -->` annotations explaining design decisions.

---

```markdown
---
name: deploy-buddy
description: >
  Deploy applications to staging and production environments. Use when:
  (1) Deploying new versions, (2) Rolling back failed deployments,
  (3) Checking deployment status, (4) Running pre-deploy checks.
---
<!-- WHY: Description includes 4 specific trigger scenarios with action verbs.
     This helps Claude match user requests to this skill accurately. -->

# Deploy Buddy

Deploy applications safely with automated checks and rollback support.

<!-- WHY: One-line summary tells Claude exactly what this skill does.
     No fluff, no explaining what deployment is. -->

## Quick Start

For a standard deployment to staging:

```bash
npx tsx scripts/deploy.ts staging
```

<!-- WHY: Quick Start shows the most common operation immediately.
     Users with simple needs don't have to read the whole document. -->

## Workflow

**What are you trying to do?**

| Goal | Go to |
|------|-------|
| Deploy new version | Phase 1: Pre-Deploy |
| Check current status | Status Check |
| Rollback a deployment | Rollback Procedure |
| Debug failed deploy | Troubleshooting |

<!-- WHY: Decision tree at the top. This is the FIRST thing Claude sees
     after Quick Start, helping it route to the right section immediately. -->

---

## Status Check

Before any deployment, check current state:

```bash
npx tsx scripts/status.ts <environment>
```

Output shows:
- Current deployed version
- Last deployment time
- Health check results

<!-- WHY: Status is separate because it's read-only and safe.
     Users often just want to check without deploying. -->

---

## Phase 1: Pre-Deploy Checks

### Prerequisites

Before deploying, verify:

- [ ] All tests pass locally (`npm test`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] You have deployment credentials configured
- [ ] Target environment is specified

<!-- WHY: Checklist pattern. These are the "do not proceed without" items.
     Using checkboxes makes it scannable. -->

### Run Pre-Deploy

```bash
npx tsx scripts/pre-deploy.ts <environment>
```

This checks:
1. Build succeeds
2. Environment variables are set
3. Database migrations are pending (warns if yes)
4. Target environment is healthy

<!-- WHY: Numbered list for sequential checks.
     Each check is specific and actionable. -->

### Checkpoint

Pre-deploy must show:
```
✓ Build: success
✓ Environment: configured
✓ Migrations: none pending (or acknowledged)
✓ Target: healthy
```

If any check fails, see **Troubleshooting** before proceeding.

<!-- WHY: Explicit checkpoint with expected output.
     Claude can verify it's safe to proceed. -->

---

## Phase 2: Deployment

### Environment Selection

| Environment | Command | Approval Required |
|-------------|---------|-------------------|
| staging | `npx tsx scripts/deploy.ts staging` | No |
| production | `npx tsx scripts/deploy.ts production` | Yes |

<!-- WHY: Table format for quick reference. Shows the critical difference
     between staging (no approval) and production (needs approval). -->

### Deploy Command

```bash
npx tsx scripts/deploy.ts <environment> [--version <tag>]
```

**Arguments:**
- `environment` - Required. `staging` or `production`
- `--version` - Optional. Specific version tag. Defaults to latest.

**Example:**
```bash
npx tsx scripts/deploy.ts staging --version v1.2.3
```

<!-- WHY: Full command documentation with arguments and example.
     No ambiguity about what to pass. -->

### Production Approval

For production deployments, the script will:
1. Show diff from current version
2. Prompt for confirmation
3. Notify #deployments channel
4. Proceed only after explicit approval

<!-- WHY: Production is fragile. Extra steps are documented so Claude
     knows to expect them and can guide the user. -->

### Deployment Progress

The script outputs progress:
```
[1/5] Building image...
[2/5] Pushing to registry...
[3/5] Updating service...
[4/5] Waiting for healthy...
[5/5] Verifying deployment...

✓ Deployment complete: v1.2.3 → staging
```

<!-- WHY: Showing expected output helps Claude verify success
     and identify where failures occur. -->

---

## Phase 3: Verification

After deployment, verify:

1. **Health check**: `npx tsx scripts/status.ts <environment>`
2. **Smoke test**: `npx tsx scripts/smoke-test.ts <environment>`
3. **Logs check**: `npx tsx scripts/logs.ts <environment> --since 5m`

All three should pass before considering deployment complete.

<!-- WHY: Verification is a separate phase. Deployment isn't done
     until verified. Each verification has a specific command. -->

---

## Rollback Procedure

If deployment fails or causes issues:

```bash
npx tsx scripts/rollback.ts <environment>
```

This automatically:
1. Identifies the previous stable version
2. Deploys that version
3. Verifies health
4. Notifies team

### Manual Rollback

To rollback to a specific version:

```bash
npx tsx scripts/deploy.ts <environment> --version <previous-tag>
```

<!-- WHY: Rollback is prominent and has both automatic and manual options.
     In crisis situations, users need to find this fast. -->

---

## Troubleshooting

### "Build failed" error

1. Check build logs: `npm run build 2>&1 | tail -50`
2. Common causes:
   - Missing dependencies: run `npm install`
   - TypeScript errors: run `npm run typecheck`
3. Fix locally, then retry pre-deploy

### "Environment not configured" error

1. Check `.env.<environment>` exists
2. Verify required variables are set:
   - `DATABASE_URL`
   - `API_KEY`
   - `DEPLOY_TOKEN`
3. Source the env file: `source .env.<environment>`

### "Target unhealthy" error

1. Check target status: `npx tsx scripts/status.ts <environment>`
2. If target is down, investigate before deploying
3. Common causes:
   - Database connection issues
   - Memory exhaustion
   - Recent bad deployment (rollback first)

### Deployment hangs at "Waiting for healthy"

1. Check new container logs: `npx tsx scripts/logs.ts <environment> --since 2m`
2. Common causes:
   - Application crash on startup (check logs)
   - Health endpoint not responding
   - Database migration taking too long
3. If stuck > 5 minutes, the deployment auto-rolls back

<!-- WHY: Error Recovery pattern. Each error has specific diagnosis steps
     and solutions. Real error messages are used, not generic descriptions. -->

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEPLOY_TOKEN` | Yes | Deployment authentication token |
| `REGISTRY_URL` | Yes | Container registry URL |
| `SLACK_WEBHOOK` | No | Webhook for deployment notifications |

<!-- WHY: Environment variables in a table for quick reference.
     Required vs optional is explicit. -->

---

## Scripts Reference

| Script | Purpose |
|--------|---------|
| `pre-deploy.ts` | Run all pre-deployment checks |
| `deploy.ts` | Execute deployment |
| `status.ts` | Check current deployment state |
| `rollback.ts` | Rollback to previous version |
| `logs.ts` | View deployment logs |
| `smoke-test.ts` | Run post-deployment verification |

<!-- WHY: Scripts summary at the end for reference.
     The main document explained when to use each; this is the quick lookup. -->
```

---

## Key Takeaways

1. **Decision tree first** - Routes Claude to the right section immediately
2. **Checkpoints between phases** - Explicit "safe to proceed" verification
3. **Error recovery is prominent** - Real errors with real solutions
4. **No explaining basics** - Assumes user knows what deployment is
5. **Commands are complete** - Full syntax with arguments and examples
6. **Expected output shown** - Claude can verify success
