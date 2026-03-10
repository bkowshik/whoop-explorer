# Vercel WAF Rate Limiting Configuration

**Feature**: 002-security-audit | **Date**: 2026-03-03

This is a dashboard-only configuration. No code changes are required.

## Steps

1. Navigate to your Vercel project dashboard
2. Go to **Settings** > **Firewall** (or **Security** > **Firewall**)
3. Click **Custom Rules** > **Add Rule**
4. Configure the rule:

| Setting | Value |
|---------|-------|
| **Name** | API Proxy Rate Limit |
| **Condition** | Request Path matches `/api/whoop/*` |
| **Action** | Rate Limit |
| **Key** | IP Address |
| **Algorithm** | Fixed Window |
| **Limit** | 60 requests |
| **Window** | 60 seconds |

5. Save and enable the rule

## Verification

After configuration, test by sending rapid requests to `/api/whoop/activity/sleep`:

```bash
# Send 65 rapid requests (should get 429 after ~60)
for i in $(seq 1 65); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    "https://YOUR_DOMAIN/api/whoop/activity/sleep"
done
```

Expected: First ~60 requests return 200, subsequent requests return 429 with a `Retry-After` header.

## Notes

- Vercel Hobby plan supports 1 custom rule per project
- The rule operates at the CDN/edge layer before requests reach serverless functions
- IP is identified via `x-forwarded-for` header (set by Vercel, spoofing-resistant)
- No code changes or new dependencies required
