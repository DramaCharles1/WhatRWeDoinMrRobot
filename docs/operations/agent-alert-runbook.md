# Agent Alert Runbook

## Evidence Requirements

- Capture alert trigger event timestamp and metric evidence.
- Capture recovery event timestamp and operator acknowledgement.
- Attach dashboard snapshot and alert payload.

## Operator Actions

1. Confirm current backend and Ollama container health.
2. Check recent `agent.request.volume`, `agent.failure.rate`, and `agent.latency.ms` values.
3. If dependency failure is detected, restart affected service and verify recovery.
4. Validate end-to-end by creating an agent session and issuing a query.

## Release Gate Evidence

- Include alert trigger and recovery proof in CI artifacts before release approval.
