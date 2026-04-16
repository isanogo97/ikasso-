# Sentry Alert Configuration for Ikasso

## Alerts to configure in Sentry Dashboard

Go to https://ikasso.sentry.io/alerts/rules/ and create these alerts:

### 1. Critical Error Alert (Email)
- Trigger: When an issue is first seen
- Filter: error.level = error OR fatal
- Action: Send email to ibrahim.sanogo63@gmail.com
- Frequency: At most once per issue

### 2. High Volume Alert
- Trigger: When event count > 50 in 1 hour
- Action: Send email
- Purpose: Detect DDoS or mass errors

### 3. New Issue Alert
- Trigger: When a new issue is created
- Action: Send email
- Frequency: At most once per 30 minutes

### 4. Performance Alert (Optional)
- Trigger: When p95 response time > 3s
- Filter: transaction.duration
- Action: Send email

## Environment Variables (already configured in Vercel)
- NEXT_PUBLIC_SENTRY_DSN: The Sentry DSN
- SENTRY_ORG: ikasso
- SENTRY_PROJECT: javascript-nextjs
